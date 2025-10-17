$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ScriptRoot = $PSScriptRoot
$FrontendDir = Split-Path $ScriptRoot -Parent
$SrcDir = Join-Path $FrontendDir 'src'
$RepoRoot = Resolve-Path (Join-Path $FrontendDir '..')
$ReportsDir = Join-Path $RepoRoot 'reports/frontend-analysis'

if (-not (Test-Path $SrcDir)) { throw "Dossier introuvable: $SrcDir" }
New-Item -ItemType Directory -Path $ReportsDir -Force | Out-Null

Write-Host "Analyse des appels API dans: $SrcDir"

# Définition des patterns à analyser
$patterns = [ordered]@{
  fetch     = 'fetch\('
  axios     = '\baxios\.'
  apiCall   = '\bapi\.(get|post|put|patch|delete)\b'
  apiClient = '\bapiClient\.(get|post|put|patch|delete)\b'
  httpUrl   = 'https?://[\w\.-]+'
  nextEnv   = 'NEXT_PUBLIC_API_URL'
}

# Récupération des fichiers TS/TSX
$files = Get-ChildItem -Path $SrcDir -Recurse -File | Where-Object { $_.Extension -match '^\.(ts|tsx)$' }
$results = @()
$fileCounts = @{}
# Analyse des fichiers
foreach ($file in $files) {
  $filePath = $file.FullName
  foreach ($key in $patterns.Keys) {
    $regex = $patterns[$key]
    $matches = Select-String -Pattern $regex -Path $filePath -AllMatches -ErrorAction SilentlyContinue
    if ($matches) {
      # Comptage par fichier/pattern
      if (-not $fileCounts.ContainsKey($filePath)) { $fileCounts[$filePath] = @{} }
      $countForFile = $fileCounts[$filePath]
      if ($countForFile.ContainsKey($key)) { $countForFile[$key] += $matches.Count } else { $countForFile[$key] = $matches.Count }

      foreach ($m in $matches) {
        $results += [PSCustomObject]@{
          File       = $filePath
          Pattern    = $key
          LineNumber = $m.LineNumber
          Line       = ($m.Line.Trim())
          Match      = ($m.Matches[0].Value)
        }
      }
    }
  }
}

# Sortie des rapports
$ApiCsv = Join-Path $ReportsDir 'api-calls.csv'
$SummaryTxt = Join-Path $ReportsDir 'summary.txt'
$ByFileJson = Join-Path $ReportsDir 'by-file.json'
$TopFilesTxt = Join-Path $ReportsDir 'top-files.txt'
$RawTxt = Join-Path $ReportsDir 'raw.txt'

$results | Export-Csv -Path $ApiCsv -NoTypeInformation -Encoding UTF8
$results | Format-Table -AutoSize | Out-String | Set-Content -Path $RawTxt -Encoding UTF8
# Agrégation des totaux
$totalFiles = $files.Count
$totalMatches = $results.Count
$patternTotals = @{}
foreach ($key in $patterns.Keys) {
  $patternTotals[$key] = ($results | Where-Object { $_.Pattern -eq $key }).Count
}

# Summary.txt
$patternLines = foreach ($key in $patterns.Keys) { "- ${key}: $($patternTotals[$key])" }
$summaryLines = @(
  "Frontend API Calls Analysis",
  "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  "Source: $SrcDir",
  "Total files scanned: $totalFiles",
  "Total matches: $totalMatches",
  "",
  "Pattern totals:"
) + $patternLines + @("")
$summaryLines | Set-Content -Path $SummaryTxt -Encoding UTF8

# by-file.json
$byFile = foreach ($kv in $fileCounts.GetEnumerator()) {
  [PSCustomObject]@{
    file = $kv.Key
    counts = $kv.Value
  }
}
$byFile | ConvertTo-Json -Depth 6 | Set-Content -Path $ByFileJson -Encoding UTF8

# top-files.txt
$grouped = $results | Group-Object File | Sort-Object Count -Descending
$topLines = foreach ($g in $grouped) { "{0,4}  {1}" -f $g.Count, $g.Name }
$topLines | Set-Content -Path $TopFilesTxt -Encoding UTF8

Write-Host "Rapports générés dans: $ReportsDir"
