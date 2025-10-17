$ErrorActionPreference = "Continue"
# Trouver le dernier dossier de rapports
$latest = Get-ChildItem -Path "reports" -Directory | Sort-Object Name -Descending | Select-Object -First 1
if (-not $latest) { Write-Host "Aucun dossier 'reports' trouvé"; exit 1 }
$reportDir = $latest.FullName

# Comptage des fichiers par extension
$files = Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|\\.next|dist|\\.git" }
$extCounts = $files | ForEach-Object { if ($_.Extension) { $_.Extension.TrimStart('.') } else { "(noext)" } } | Group-Object | Sort-Object Count -Descending
$lines = $extCounts | ForEach-Object { "{0,6} {1}" -f $_.Count, $_.Name }
$dest = Join-Path $reportDir "file-types.txt"
$lines | Set-Content -Path $dest -Encoding UTF8
Write-Host "Écrit: $dest"