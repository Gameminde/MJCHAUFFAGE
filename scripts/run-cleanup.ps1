$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path "backups" $timestamp
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
$dest = Join-Path $backupDir "reports"
Copy-Item "reports" -Destination $dest -Recurse -Force

$files = Get-ChildItem -Recurse -File | Where-Object {
    @(".log",".bak",".backup",".old") -contains $_.Extension.ToLower() -and
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.next\\" -and
    $_.FullName -notmatch "\\dist\\" -and
    $_.FullName -notmatch "\\.git\\"
}

$files | Select-Object FullName | Out-File "temp-files-to-delete.txt" -Encoding UTF8

$size = ($files | Measure-Object Length -Sum).Sum
$count = $files.Count
if ($count -gt 0) { $files | Remove-Item -Force }

$freedMB = [math]::Round(($size)/1MB, 2)
$cleanDir = Join-Path "reports" ($timestamp + "_cleanup")
New-Item -ItemType Directory -Path $cleanDir -Force | Out-Null
"Deleted $count files, freed $freedMB MB" | Set-Content (Join-Path $cleanDir "cleanup-summary.txt")
Copy-Item "temp-files-to-delete.txt" $cleanDir -Force

Write-Output "Deleted $count files, freed $freedMB MB"