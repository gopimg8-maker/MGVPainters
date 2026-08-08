$src = "C:\Users\navya shree g n\.gemini\antigravity-ide\brain\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\media__1785648396601.jpg"
$dest = "E:\MGV Painters\interior.jpg"

if (Test-Path $src) {
    Copy-Item -Path $src -Destination $dest -Force
    Write-Host "SUCCESS: Copied interior wallpaper to $dest"
} else {
    Write-Host "ERROR: Source file not found at $src"
}
