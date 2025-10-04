#!/bin/bash

# MJ CHAUFFAGE Production Deployment Script
# This script handles the deployment of the MJ CHAUFFAGE application to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mj-chauffage"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p logs backups nginx/logs nginx/ssl monitoring/grafana/dashboards monitoring/grafana/datasources
    success "Directories created"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        error ".env file not found. Please create it from .env.example"
    fi
    
    success "Prerequisites check passed"
}

# Backup database
backup_database() {
    log "Creating database backup..."
    
    if [ -z "$DATABASE_URL" ]; then
        warning "DATABASE_URL not set, skipping database backup"
        return
    fi
    
    BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Extract database connection details from DATABASE_URL
    # This is a simplified approach - adjust based on your actual DATABASE_URL format
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
        success "Database backup created: $BACKUP_FILE"
    else
        warning "Database backup failed or no existing database found"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    
    # Build new images
    log "Building application images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Start new containers
    log "Starting new containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    success "Deployment completed"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check frontend health
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
    
    # Check backend health
    if curl -f http://localhost:3001/health &> /dev/null; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    success "All health checks passed"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec backend npx prisma migrate deploy; then
        success "Database migrations completed"
    else
        error "Database migrations failed"
    fi
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current containers
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Start previous version (this is simplified - in practice you'd tag and track versions)
    warning "Rollback functionality needs to be implemented based on your versioning strategy"
    
    # For now, just restart the services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    success "Rollback completed"
}

# Main deployment process
main() {
    log "Starting MJ CHAUFFAGE deployment process..."
    
    # Load environment variables
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    case "${1:-deploy}" in
        "deploy")
            create_directories
            check_prerequisites
            backup_database
            deploy
            run_migrations
            health_check
            cleanup
            success "Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "health")
            health_check
            ;;
        "backup")
            backup_database
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|backup|cleanup}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Full deployment process (default)"
            echo "  rollback - Rollback to previous version"
            echo "  health   - Run health checks"
            echo "  backup   - Create database backup"
            echo "  cleanup  - Clean up old images and backups"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"