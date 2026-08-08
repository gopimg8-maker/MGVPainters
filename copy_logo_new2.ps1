$src = "C:\Users\navya shree g n\.gemini\antigravity-ide\brain\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\media__1785673303763.jpg"
$dest1 = "E:\MGV Painters\logo.jpg"
$dest2 = "E:\MGV Painters\logo.svg.jpeg"

if (Test-Path $src) {
    Copy-Item -Path $src -Destination $dest1 -Force
    Copy-Item -Path $src -Destination $dest2 -Force
    Write-Host "SUCCESS: Copied new logo photo to workspace"
} else {
    Write-Host "ERROR: Source file not found at $src"
}
