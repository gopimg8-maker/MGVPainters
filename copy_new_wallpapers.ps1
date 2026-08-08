$src_waterproofing = "C:\Users\navya shree g n\.gemini\antigravity-ide\brain\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\waterproofing_bg_1785687623951.png"
$src_acidwash = "C:\Users\navya shree g n\.gemini\antigravity-ide\brain\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\acidwash_bg_1785687646599.png"
$src_grouting = "C:\Users\navya shree g n\.gemini\antigravity-ide\brain\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\grouting_bg_1785687666891.png"
$src_wood = "C:\Users\navya shree g n\.gemini\antigravity-ide\brain\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\wood_polish_bg_1785687685368.png"

$dest_waterproofing = "E:\MGV Painters\waterproofing.jpg"
$dest_acidwash = "E:\MGV Painters\acidwash.jpg"
$dest_grouting = "E:\MGV Painters\grouting.jpg"
$dest_wood = "E:\MGV Painters\wood.jpg"

if (Test-Path $src_waterproofing) {
    Copy-Item -Path $src_waterproofing -Destination $dest_waterproofing -Force
    Write-Host "SUCCESS: Copied waterproofing wallpaper to $dest_waterproofing"
} else {
    Write-Host "ERROR: Source waterproofing file not found"
}

if (Test-Path $src_acidwash) {
    Copy-Item -Path $src_acidwash -Destination $dest_acidwash -Force
    Write-Host "SUCCESS: Copied acidwash wallpaper to $dest_acidwash"
} else {
    Write-Host "ERROR: Source acidwash file not found"
}

if (Test-Path $src_grouting) {
    Copy-Item -Path $src_grouting -Destination $dest_grouting -Force
    Write-Host "SUCCESS: Copied grouting wallpaper to $dest_grouting"
} else {
    Write-Host "ERROR: Source grouting file not found"
}

if (Test-Path $src_wood) {
    Copy-Item -Path $src_wood -Destination $dest_wood -Force
    Write-Host "SUCCESS: Copied wood polish wallpaper to $dest_wood"
} else {
    Write-Host "ERROR: Source wood polish file not found"
}
