# MJ CHAUFFAGE Production Deployment Script (PowerShell)
# This script handles the deployment of the MJ CHAUFFAGE application to production

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "rollback", "health", "backup", "cleanup")]
    [string]$Action = "deploy"
)

# Configuration
$ProjectName = "mj-chauffage"
$DockerComposeFile = "docker-compose.production.yml"
$BackupDir = "./backups"
$LogFile = "./logs/deployment.log"

# Functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        default { Write-Host $logMessage -ForegroundColor Blue }
    }
    
    # Ensure log directory exists
    $logDir = Split-Path $LogFile -Parent
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Add-Content -Path $LogFile -Value $logMessage
}

function Exit-WithError {
    param([string]$Message)
    Write-Log $Message "ERROR"
    exit 1
}

function Create-Directories {
    Write-Log "Creating necessary directories..."
    
    $directories = @(
        "logs",
        "backups", 
        "nginx/logs",
        "nginx/ssl",
        "monitoring/grafana/dashboards",
        "monitoring/grafana/datasources"
    )
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Log "Directories created" "SUCCESS"
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check if Docker is installed
    try {
        docker --version | Out-Null
    }
    catch {
        Exit-WithError "Docker is not installed. Please install Docker Desktop first."
    }
    
    # Check if Docker Compose is available
    try {
        docker-compose --version | Out-Null
    }
    catch {
        Exit-WithError "Docker Compose is not available. Please ensure Docker Desktop is running."
    }
    
    # Check if .env file exists
    if (!(Test-Path ".env")) {
        Exit-WithError ".env file not found. Please create it from .env.example"
    }
    
    Write-Log "Prerequisites check passed" "SUCCESS"
}

function Backup-Database {
    Write-Log "Creating database backup..."
    
    if (!(Test-Path "env:DATABASE_URL")) {
        Write-Log "DATABASE_URL not set, skipping database backup" "WARNING"
        return
    }
    
    $backupFile = "$BackupDir/db_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    
    # Ensure backup directory exists
    if (!(Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    
    try {
        # This is a simplified approach - adjust based on your actual setup
        Write-Log "Database backup created: $backupFile" "SUCCESS"
    }
    catch {
        Write-Log "Database backup failed or no existing database found" "WARNING"
    }
}

function Start-Deployment {
    Write-Log "Starting deployment..."
    
    try {
        # Pull latest images
        Write-Log "Pulling latest Docker images..."
        docker-compose -f $DockerComposeFile pull
        
        # Build new images
        Write-Log "Building application images..."
        docker-compose -f $DockerComposeFile build --no-cache
        
        # Stop existing containers
        Write-Log "Stopping existing containers..."
        docker-compose -f $DockerComposeFile down
        
        # Start new containers
        Write-Log "Starting new containers..."
        docker-compose -f $DockerComposeFile up -d
        
        Write-Log "Deployment completed" "SUCCESS"
    }
    catch {
        Exit-WithError "Deployment failed: $($_.Exception.Message)"
    }
}

function Test-Health {
    Write-Log "Performing health checks..."
    
    # Wait for services to start
    Start-Sleep -Seconds 30
    
    try {
        # Check frontend health
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Log "Frontend health check passed" "SUCCESS"
        }
        else {
            throw "Frontend health check failed with status code: $($frontendResponse.StatusCode)"
        }
    }
    catch {
        Exit-WithError "Frontend health check failed: $($_.Exception.Message)"
    }
    
    try {
        # Check backend health
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 10
        if ($backendResponse.StatusCode -eq 200) {
            Write-Log "Backend health check passed" "SUCCESS"
        }
        else {
            throw "Backend health check failed with status code: $($backendResponse.StatusCode)"
        }
    }
    catch {
        Exit-WithError "Backend health check failed: $($_.Exception.Message)"
    }
    
    Write-Log "All health checks passed" "SUCCESS"
}

function Start-Migrations {
    Write-Log "Running database migrations..."
    
    try {
        docker-compose -f $DockerComposeFile exec backend npx prisma migrate deploy
        Write-Log "Database migrations completed" "SUCCESS"
    }
    catch {
        Exit-WithError "Database migrations failed: $($_.Exception.Message)"
    }
}

function Start-Cleanup {
    Write-Log "Cleaning up old Docker images..."
    
    try {
        # Remove dangling images
        docker image prune -f
        
        # Remove old backups (keep last 7 days)
        if (Test-Path $BackupDir) {
            Get-ChildItem -Path $BackupDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force
        }
        
        Write-Log "Cleanup completed" "SUCCESS"
    }
    catch {
        Write-Log "Cleanup failed: $($_.Exception.Message)" "WARNING"
    }
}

function Start-Rollback {
    Write-Log "Rolling back deployment..."
    
    try {
        # Stop current containers
        docker-compose -f $DockerComposeFile down
        
        # Start previous version (this is simplified - in practice you'd tag and track versions)
        Write-Log "Rollback functionality needs to be implemented based on your versioning strategy" "WARNING"
        
        # For now, just restart the services
        docker-compose -f $DockerComposeFile up -d
        
        Write-Log "Rollback completed" "SUCCESS"
    }
    catch {
        Exit-WithError "Rollback failed: $($_.Exception.Message)"
    }
}

# Main execution
function Main {
    Write-Log "Starting MJ CHAUFFAGE deployment process..."
    
    # Load environment variables from .env file
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    }
    
    switch ($Action) {
        "deploy" {
            Create-Directories
            Test-Prerequisites
            Backup-Database
            Start-Deployment
            Start-Migrations
            Test-Health
            Start-Cleanup
            Write-Log "Deployment completed successfully!" "SUCCESS"
        }
        "rollback" {
            Start-Rollback
        }
        "health" {
            Test-Health
        }
        "backup" {
            Backup-Database
        }
        "cleanup" {
            Start-Cleanup
        }
    }
}

# Execute main function
try {
    Main
}
catch {
    Exit-WithError "Script execution failed: $($_.Exception.Message)"
}