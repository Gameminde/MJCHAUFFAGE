# 📊 Phase 2: Analyse Structurée MJCHAUFFAGE (PowerShell)
$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportDir = Join-Path -Path "reports" -ChildPath $timestamp
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

Write-Host "🔍 Étape 1: Comptage par type de fichier"
# Liste tous les fichiers hors répertoires exclus
$files = Get-ChildItem -Recurse -File | Where-Object {
  $_.FullName -notmatch "node_modules|\\.next|dist|\\.git"
}
$extCounts = $files | ForEach-Object {
  if ($_.Extension) { $_.Extension.TrimStart('.') } else { "(noext)" }
} | Group-Object | Sort-Object Count -Descending
$extCounts | ForEach-Object { "{0,6} {1}" -f $_.Count, $_.Name } | Out-File -FilePath (Join-Path $reportDir "file-types.txt") -Encoding UTF8

Write-Host "📝 Étape 2: Détection fichiers temporaires"
$temps = Get-ChildItem -Recurse -File | Where-Object {
  $_.FullName -notmatch "node_modules|\\.next|dist|\\.git" -and (
    $_.Name -match "\.bak$|\.old$|\.temp$|\.backup$|\.log$" -or $_.Name -match "-copy\."
  )
}
$temps | Select-Object FullName | Out-File -FilePath (Join-Path $reportDir "temp-files.txt") -Encoding UTF8

Write-Host "🔗 Étape 3: Analyse imports non utilisés (frontend)"
Push-Location "frontend"
try {
  npx unimported --show-unused-files 2>&1 | Out-File -FilePath (Join-Path ".." (Join-Path $reportDir "frontend-unused.txt")) -Encoding UTF8
} catch { "Erreur unimported frontend: $_" | Out-File -FilePath (Join-Path ".." (Join-Path $reportDir "frontend-unused.txt")) -Encoding UTF8 }
Pop-Location

Write-Host "🔗 Étape 3: Analyse imports non utilisés (admin-frontend)"
Push-Location "admin-v2/admin-frontend"
try {
  npx unimported --show-unused-files 2>&1 | Out-File -FilePath (Join-Path "..\.." (Join-Path $reportDir "admin-unused.txt")) -Encoding UTF8
} catch { "Erreur unimported admin-frontend: $_" | Out-File -FilePath (Join-Path "..\.." (Join-Path $reportDir "admin-unused.txt")) -Encoding UTF8 }
Pop-Location
Write-Host "📊 Étape 4: Détection duplication (jscpd)"
$dupDir = Join-Path $reportDir "duplication"
New-Item -ItemType Directory -Path $dupDir -Force | Out-Null
try {
  npx jscpd --min-lines 10 --min-tokens 50 --exclude "node_modules/**,dist/**,.next/**,**/*.test.*" --reporters "json" --output $dupDir 2>&1 |
    Out-File -FilePath (Join-Path $dupDir "jscpd-run.txt") -Encoding UTF8
} catch { "Erreur jscpd: $_" | Out-File -FilePath (Join-Path $dupDir "jscpd-run.txt") -Encoding UTF8 }

Write-Host "✅ Analyse terminée ! Rapports dans: $reportDir"
Write-Host "📋 Prochaines actions:"
Write-Host ("1. Consulter {0}" -f (Join-Path $reportDir "temp-files.txt"))
Write-Host ("2. Lire {0} et {1}" -f (Join-Path $reportDir "frontend-unused.txt"), (Join-Path $reportDir "admin-unused.txt"))
Write-Host ("3. Vérifier {0} pour décider shared/" -f (Join-Path $dupDir "jscpd-report.json"))
