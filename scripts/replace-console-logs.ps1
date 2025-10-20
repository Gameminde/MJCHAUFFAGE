# Script PowerShell pour remplacer tous les console.log par le logger Winston
# Usage: .\scripts\replace-console-logs.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔍 Remplacement des console.log par logger Winston..." -ForegroundColor Cyan

# Compteurs
$filesModified = 0
$totalReplacements = 0

# Fonction pour vérifier si un fichier a déjà l'import du logger
function Has-LoggerImport {
    param($filePath, $isBackend)
    
    $content = Get-Content $filePath -Raw
    
    if ($isBackend) {
        return $content -match "import.*logger.*from.*['`"].*logger['`"]"
    } else {
        return $content -match "import.*logger.*from.*['`"].*logger['`"]"
    }
}

# Fonction pour ajouter l'import du logger
function Add-LoggerImport {
    param($filePath, $isBackend)
    
    $content = Get-Content $filePath -Raw
    
    # Trouver la position après les derniers imports
    $lines = Get-Content $filePath
    $lastImportIndex = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^import " -or $lines[$i] -match "^import\{") {
            $lastImportIndex = $i
        }
    }
    
    # Déterminer le chemin relatif vers logger
    $relativePath = $filePath -replace [regex]::Escape((Get-Location).Path), ""
    $depth = ($relativePath -split [regex]::Escape("\")).Length - 3
    $importPath = "../" * $depth + "utils/logger"
    
    if ($isBackend) {
        $importStatement = "import { logger } from '@/utils/logger';"
    } else {
        # Pour frontend, calculer le chemin relatif vers lib/logger.ts
        $depth = ($relativePath -split [regex]::Escape("\")).Length - 4
        $importPath = "../" * $depth + "lib/logger"
        $importStatement = "import { logger } from '$importPath';"
    }
    
    # Insérer l'import après le dernier import existant
    if ($lastImportIndex -ge 0) {
        $lines = @(
            $lines[0..$lastImportIndex]
            $importStatement
            $lines[($lastImportIndex + 1)..($lines.Count - 1)]
        )
        $lines | Set-Content $filePath
        return $true
    }
    
    return $false
}

# Fonction pour remplacer les console.log
function Replace-ConsoleLogs {
    param($filePath, $isBackend)
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    $replacements = 0
    
    # Remplacements
    $patterns = @(
        @{ Pattern = 'console\.log\('; Replacement = 'logger.info(' }
        @{ Pattern = 'console\.error\('; Replacement = 'logger.error(' }
        @{ Pattern = 'console\.warn\('; Replacement = 'logger.warn(' }
        @{ Pattern = 'console\.info\('; Replacement = 'logger.info(' }
        @{ Pattern = 'console\.debug\('; Replacement = 'logger.debug(' }
    )
    
    foreach ($p in $patterns) {
        $matches = [regex]::Matches($content, $p.Pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $p.Pattern, $p.Replacement
            $replacements += $matches.Count
        }
    }
    
    # Si des remplacements ont été faits, sauvegarder
    if ($replacements -gt 0) {
        # Vérifier/ajouter import logger
        if (!(Has-LoggerImport $filePath $isBackend)) {
            Write-Host "  📦 Ajout import logger dans: $filePath" -ForegroundColor Yellow
            Add-LoggerImport $filePath $isBackend
            
            # Relire le contenu après ajout de l'import
            $contentWithImport = Get-Content $filePath -Raw
            $content = $contentWithImport -replace 'console\.log\(', 'logger.info(' `
                                          -replace 'console\.error\(', 'logger.error(' `
                                          -replace 'console\.warn\(', 'logger.warn(' `
                                          -replace 'console\.info\(', 'logger.info(' `
                                          -replace 'console\.debug\(', 'logger.debug('
        }
        
        Set-Content $filePath $content -NoNewline
        return $replacements
    }
    
    return 0
}

# Traiter Backend
Write-Host "`n📁 Traitement Backend..." -ForegroundColor Green
$backendFiles = Get-ChildItem -Path "backend\src" -Filter "*.ts" -Recurse | Where-Object { 
    $_.FullName -notmatch "node_modules" -and 
    $_.FullName -notmatch "dist" -and
    $_.Name -ne "logger.ts"
}

foreach ($file in $backendFiles) {
    $replacements = Replace-ConsoleLogs $file.FullName $true
    if ($replacements -gt 0) {
        $filesModified++
        $totalReplacements += $replacements
        Write-Host "  ✅ $($file.Name): $replacements remplacements" -ForegroundColor Cyan
    }
}

# Traiter Frontend
Write-Host "`n📁 Traitement Frontend..." -ForegroundColor Green
$frontendFiles = Get-ChildItem -Path "frontend\src" -Filter "*.ts*" -Recurse | Where-Object { 
    $_.FullName -notmatch "node_modules" -and 
    $_.FullName -notmatch ".next" -and
    $_.Name -ne "logger.ts"
}

foreach ($file in $frontendFiles) {
    $replacements = Replace-ConsoleLogs $file.FullName $false
    if ($replacements -gt 0) {
        $filesModified++
        $totalReplacements += $replacements
        Write-Host "  ✅ $($file.Name): $replacements remplacements" -ForegroundColor Cyan
    }
}

# Résumé
Write-Host "`n✅ Remplacement terminé !" -ForegroundColor Green
Write-Host "📊 Fichiers modifiés: $filesModified" -ForegroundColor Yellow
Write-Host "🔄 Total remplacements: $totalReplacements" -ForegroundColor Yellow

# Vérification finale
Write-Host "`n🔍 Vérification console.log restants..." -ForegroundColor Cyan
$remainingBackend = (Select-String -Path "backend\src\**\*.ts" -Pattern "console\.(log|warn|error|info|debug)" -Exclude "logger.ts" | Measure-Object).Count
$remainingFrontend = (Select-String -Path "frontend\src\**\*.ts*" -Pattern "console\.(log|warn|error|info|debug)" -Exclude "logger.ts" | Measure-Object).Count

Write-Host "Backend: $remainingBackend console.log restants" -ForegroundColor $(if ($remainingBackend -eq 0) { "Green" } else { "Red" })
Write-Host "Frontend: $remainingFrontend console.log restants" -ForegroundColor $(if ($remainingFrontend -eq 0) { "Green" } else { "Red" })

if ($remainingBackend -eq 0 -and $remainingFrontend -eq 0) {
    Write-Host "`n🎉 PARFAIT ! Plus aucun console.log !" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Certains console.log nécessitent un remplacement manuel" -ForegroundColor Yellow
}

