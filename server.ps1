# ==========================================
# MGV PAINTERS SOCKET-BASED WEB SERVER (V9)
# ==========================================

$port = 8890
$address = [System.Net.IPAddress]::Any
$server = New-Object System.Net.Sockets.TcpListener($address, $port)
$logPath = "server_debug_4.log"

# Clear old log file
if (Test-Path $logPath) { Remove-Item $logPath -Force }

function Log-Msg($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    "[$timestamp] $msg" | Out-File -FilePath $logPath -Append -Encoding utf8
}

Log-Msg "Server script loaded. Port: $port"

try {
    # Set ReuseAddress socket option to prevent TIME_WAIT bind errors
    $server.Server.SetSocketOption([System.Net.Sockets.SocketOptionLevel]::Socket, [System.Net.Sockets.SocketOptionName]::ReuseAddress, $true)
    Log-Msg "Socket option ReuseAddress set to true."
    
    $server.Start()
    Log-Msg "Server started and listening on 0.0.0.0:$port"
    Write-Host "Server is running on port $port. Logging active."
    
    while ($true) {
        Log-Msg "Waiting for connection..."
        $client = $server.AcceptTcpClient()
        $remoteIp = $client.Client.RemoteEndPoint.ToString()
        Log-Msg "Connection accepted from $remoteIp"
        
        try {
            $stream = $client.GetStream()
            Log-Msg "Acquired NetworkStream."
            
            # Check for available data with a timeout (max 200ms) to prevent browser pre-connect hangs
            $waitCount = 0
            while (-not $stream.DataAvailable -and $waitCount -lt 10) {
                Start-Sleep -Milliseconds 20
                $waitCount++
            }
            
            Log-Msg "DataAvailable: $($stream.DataAvailable). Wait count: $waitCount"
            
            if ($stream.DataAvailable) {
                $buffer = New-Object Byte[] 8192
                Log-Msg "Reading stream data..."
                $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
                Log-Msg "Read completed. Bytes: $bytesRead"
                
                if ($bytesRead -gt 0) {
                    $requestStr = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
                    Log-Msg "Request received: $requestStr"
                    
                    if ($requestStr -match "POST\s+/upload-logo") {
                        Log-Msg "POST /upload-logo request detected."
                        $contentLength = 0
                        if ($requestStr -match "Content-Length:\s*(\d+)") {
                            $contentLength = [int]$Matches[1]
                        }
                        Log-Msg "Content-Length: $contentLength"
                        
                        $headerEndIndex = $requestStr.IndexOf("`r`n`r`n")
                        $bodyStart = $headerEndIndex + 4
                        $bodyBytes = New-Object Byte[] $contentLength
                        
                        $alreadyRead = $bytesRead - $bodyStart
                        $toCopy = [System.Math]::Min($alreadyRead, $contentLength)
                        if ($toCopy -gt 0) {
                            [System.Array]::Copy($buffer, $bodyStart, $bodyBytes, 0, $toCopy)
                        }
                        
                        $totalRead = $alreadyRead
                        while ($totalRead -lt $contentLength) {
                            $bytesToRead = $contentLength - $totalRead
                            $readNow = $stream.Read($bodyBytes, $totalRead, $bytesToRead)
                            if ($readNow -le 0) { break }
                            $totalRead += $readNow
                        }
                        Log-Msg "Total body bytes read: $totalRead"
                        
                        $bodyStr = [System.Text.Encoding]::UTF8.GetString($bodyBytes)
                        if ($bodyStr -match "base64,(.*)") {
                            $base64Data = $Matches[1]
                            $imageBytes = [System.Convert]::FromBase64String($base64Data)
                            [System.IO.File]::WriteAllBytes("logo.jpg", $imageBytes)
                            Log-Msg "Logo successfully saved to logo.jpg"
                            
                            $response = "HTTP/1.1 200 OK`r`n" +
                                        "Content-Type: text/plain`r`n" +
                                        "Content-Length: 2`r`n" +
                                        "Connection: close`r`n" +
                                        "Access-Control-Allow-Origin: *`r`n`r`n" +
                                        "OK"
                            $responseBytes = [System.Text.Encoding]::UTF8.GetBytes($response)
                            $stream.Write($responseBytes, 0, $responseBytes.Length)
                        } else {
                            Log-Msg "Body did not contain base64 image data."
                        }
                    }
                    elseif ($requestStr -match "POST\s+/upload-director") {
                        Log-Msg "POST /upload-director request detected."
                        $contentLength = 0
                        if ($requestStr -match "Content-Length:\s*(\d+)") {
                            $contentLength = [int]$Matches[1]
                        }
                        Log-Msg "Content-Length: $contentLength"
                        
                        $headerEndIndex = $requestStr.IndexOf("`r`n`r`n")
                        $bodyStart = $headerEndIndex + 4
                        $bodyBytes = New-Object Byte[] $contentLength
                        
                        $alreadyRead = $bytesRead - $bodyStart
                        $toCopy = [System.Math]::Min($alreadyRead, $contentLength)
                        if ($toCopy -gt 0) {
                            [System.Array]::Copy($buffer, $bodyStart, $bodyBytes, 0, $toCopy)
                        }
                        
                        $totalRead = $alreadyRead
                        while ($totalRead -lt $contentLength) {
                            $bytesToRead = $contentLength - $totalRead
                            $readNow = $stream.Read($bodyBytes, $totalRead, $bytesToRead)
                            if ($readNow -le 0) { break }
                            $totalRead += $readNow
                        }
                        Log-Msg "Total body bytes read: $totalRead"
                        
                        $bodyStr = [System.Text.Encoding]::UTF8.GetString($bodyBytes)
                        if ($bodyStr -match "base64,(.*)") {
                            $base64Data = $Matches[1]
                            $imageBytes = [System.Convert]::FromBase64String($base64Data)
                            [System.IO.File]::WriteAllBytes("director.jpg", $imageBytes)
                            Log-Msg "Director photo successfully saved to director.jpg"
                            
                            $response = "HTTP/1.1 200 OK`r`n" +
                                        "Content-Type: text/plain`r`n" +
                                        "Content-Length: 2`r`n" +
                                        "Connection: close`r`n" +
                                        "Access-Control-Allow-Origin: *`r`n`r`n" +
                                        "OK"
                            $responseBytes = [System.Text.Encoding]::UTF8.GetBytes($response)
                            $stream.Write($responseBytes, 0, $responseBytes.Length)
                        } else {
                            Log-Msg "Body did not contain base64 image data."
                        }
                    }
                    elseif ($requestStr -match "GET\s+([^\s\?]+)") {
                        $url = $Matches[1]
                        if ($url -eq "/") { $url = "/index.html" }
                        
                        $urlDecoded = [System.Uri]::UnescapeDataString($url)
                        $sanitizedUrl = $urlDecoded.TrimStart('/')
                        $resolvedPath = Join-Path (Get-Location).Path $sanitizedUrl
                        $filePath = [System.IO.Path]::GetFullPath($resolvedPath)
                        $basePath = (Get-Location).Path
                        
                        if (-not $filePath.StartsWith($basePath)) {
                            Log-Msg "Security: Directory traversal attempt blocked: $filePath"
                            $bodyText = "403 Forbidden"
                            $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyText)
                            $header = "HTTP/1.1 403 Forbidden`r`n" +
                                      "Content-Type: text/plain`r`n" +
                                      "Content-Length: $($bodyBytes.Length)`r`n" +
                                      "Connection: close`r`n`r`n"
                            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                            $stream.Write($headerBytes, 0, $headerBytes.Length)
                            $stream.Write($bodyBytes, 0, $bodyBytes.Length)
                            Log-Msg "403 sent."
                        }
                        elseif (Test-Path $filePath -PathType Leaf) {
                            Log-Msg "File exists. Reading bytes..."
                            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                            
                            switch ($ext) {
                                    ".html" { $contentType = "text/html; charset=utf-8" }
                                    ".css"  { $contentType = "text/css; charset=utf-8" }
                                    ".js"   { $contentType = "application/javascript; charset=utf-8" }
                                    ".png"  { $contentType = "image/png" }
                                    ".jpg"  { $contentType = "image/jpeg" }
                                    ".jpeg" { $contentType = "image/jpeg" }
                                    ".svg"  { $contentType = "image/svg+xml" }
                                    ".webp" { $contentType = "image/webp" }
                                    ".json" { $contentType = "application/json" }
                                    default { $contentType = "application/octet-stream" }
                            }
                            
                            $header = "HTTP/1.1 200 OK`r`n" +
                                      "Content-Type: $contentType`r`n" +
                                      "Content-Length: $($fileBytes.Length)`r`n" +
                                      "Connection: close`r`n" +
                                      "Access-Control-Allow-Origin: *`r`n`r`n"
                                      
                            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                            Log-Msg "Writing headers..."
                            $stream.Write($headerBytes, 0, $headerBytes.Length)
                            Log-Msg "Writing file bytes ($($fileBytes.Length) bytes)..."
                            $stream.Write($fileBytes, 0, $fileBytes.Length)
                            Log-Msg "Send complete."
                        } else {
                            Log-Msg "File not found: $filePath. Sending 404..."
                            $bodyText = "404 File Not Found"
                            $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyText)
                            $header = "HTTP/1.1 404 Not Found`r`n" +
                                      "Content-Type: text/plain`r`n" +
                                      "Content-Length: $($bodyBytes.Length)`r`n" +
                                      "Connection: close`r`n`r`n"
                            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                            $stream.Write($headerBytes, 0, $headerBytes.Length)
                            $stream.Write($bodyBytes, 0, $bodyBytes.Length)
                            Log-Msg "404 sent."
                        }
                    }
                    else {
                        Log-Msg "Request did not match GET/POST regex."
                    }
                } else {
                    Log-Msg "Zero bytes read from stream."
                }
            } else {
                Log-Msg "Timeout waiting for client data. Connection closed."
            }
        }
        catch {
            Log-Msg "Error processing connection request: $_"
        }
        finally {
            Log-Msg "Closing connection streams..."
            if ($stream) { $stream.Close() }
            if ($client) { $client.Close() }
            Log-Msg "Connection closed."
        }
    }
}
catch {
    Log-Msg "FATAL SERVER ERROR: $_"
}
finally {
    $server.Stop()
    Log-Msg "Server stopped listening."
}
