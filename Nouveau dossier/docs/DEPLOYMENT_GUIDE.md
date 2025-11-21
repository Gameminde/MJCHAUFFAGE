# Guide de Déploiement - MJ CHAUFFAGE

## Vue d'ensemble

Ce guide détaille les processus de déploiement de l'application MJ CHAUFFAGE en production, incluant la containerisation Docker, les scripts de déploiement automatisés, le monitoring et la maintenance.

## Table des matières

1. [Architecture de déploiement](#architecture-de-déploiement)
2. [Prérequis](#prérequis)
3. [Configuration des environnements](#configuration-des-environnements)
4. [Build et containerisation](#build-et-containerisation)
5. [Déploiement en production](#déploiement-en-production)
6. [Monitoring et observabilité](#monitoring-et-observabilité)
7. [Maintenance et opérations](#maintenance-et-opérations)
8. [Rollback et récupération](#rollback-et-récupération)
9. [Sécurité en production](#sécurité-en-production)
10. [Dépannage](#dépannage)

## Architecture de déploiement

### Stack technologique
- **Containerisation** : Docker + Docker Compose
- **Reverse Proxy** : Nginx
- **Base de données** : PostgreSQL (externe)
- **Cache** : Redis
- **Monitoring** : Prometheus + Grafana
- **Orchestration** : Docker Compose

### Services déployés
```
┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Prometheus    │
│   (Port 80/443) │    │   (Port 9090)   │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │    Grafana      │
│   (Port 3000)   │    │   (Port 3002)   │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│    Backend      │    │     Redis       │
│   (Port 3001)   │    │   (Port 6379)   │
└─────────────────┘    └─────────────────┘
```

#### Profil développement (local) — Ports standardisés
- Frontend : http://localhost:3000
- Backend API : http://localhost:3001
- Admin v2 (dashboard) : http://localhost:3002
- Remarque Grafana : en local, si Grafana est lancé, utilisez un port différent (ex. 4300) pour éviter toute collision avec l’Admin v2.
- Redirections : les routes `/admin` et `/[locale]/admin` du frontend redirigent vers `http://localhost:3002/dashboard`.

##### Démarrage rapide (Windows)
```
# Frontend
cd frontend && npm run dev

# Admin v2 (Next.js)
cd admin-v2/admin-frontend && npm run dev

# Backend (Express.js)
cd backend && npm run dev
```

## Prérequis

### Serveur de production
- **OS** : Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM** : Minimum 4GB, recommandé 8GB+
- **CPU** : Minimum 2 cores, recommandé 4+ cores
- **Stockage** : Minimum 50GB SSD
- **Réseau** : Connexion stable avec IP publique

### Logiciels requis
```bash
# Docker Engine 20.10+
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 2.0+
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo apt update && sudo apt install git -y

# Nginx (pour SSL/TLS si non containerisé)
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Domaine et SSL
- Domaine configuré pointant vers le serveur
- Certificats SSL/TLS (Let's Encrypt recommandé)

## Configuration des environnements

### Variables d'environnement de production

Créer le fichier `.env.production` :

```bash
# Application
NODE_ENV=production
PROJECT_NAME=mj-chauffage

# URLs
NEXTAUTH_URL=https://votre-domaine.com
NEXT_PUBLIC_API_URL=https://votre-domaine.com/api
FRONTEND_URL=https://votre-domaine.com

# Base de données (PostgreSQL externe)
DATABASE_URL=postgresql://user:password@db-host:5432/mjchauffage_prod

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=votre_mot_de_passe_redis_securise

# JWT & Session
JWT_SECRET=votre_jwt_secret_ultra_securise_64_caracteres_minimum
JWT_REFRESH_SECRET=votre_refresh_secret_ultra_securise_64_caracteres
NEXTAUTH_SECRET=votre_nextauth_secret_ultra_securise_32_caracteres

# Email SMTP
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre-email@domaine.com
SMTP_PASS=votre_mot_de_passe_email

# Stripe
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe_secrete
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_votre_cle_stripe_publique

# Google OAuth
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret

# Monitoring
GRAFANA_PASSWORD=votre_mot_de_passe_grafana_securise

# Sécurité
ENCRYPTION_KEY=votre_cle_chiffrement_32_caracteres
BCRYPT_ROUNDS=12
```

### Configuration Nginx

Le fichier `nginx/nginx.conf` est configuré pour :
- Reverse proxy vers les services
- Compression gzip
- Headers de sécurité
- Rate limiting
- SSL/TLS termination

## Build et containerisation

### Images Docker

#### Frontend (Next.js)
```dockerfile
# Multi-stage build optimisé
FROM node:18-alpine AS base
FROM base AS deps
FROM base AS builder  
FROM base AS runner
```

**Optimisations** :
- Build multi-étapes pour réduire la taille
- Utilisateur non-root pour la sécurité
- Cache des dépendances optimisé
- Standalone output pour performance

#### Backend (Express.js)
```dockerfile
# Build avec Prisma et TypeScript
FROM node:18-alpine AS base
FROM base AS deps
FROM base AS builder
FROM base AS runner
```

**Fonctionnalités** :
- Génération du client Prisma
- Compilation TypeScript
- Health checks intégrés
- Volumes pour logs et uploads

### Commandes de build

```bash
# Build des images
docker-compose -f docker-compose.production.yml build

# Build avec cache désactivé
docker-compose -f docker-compose.production.yml build --no-cache

# Build d'un service spécifique
docker-compose -f docker-compose.production.yml build frontend
```

## Déploiement en production

### Script de déploiement automatisé

#### Linux/macOS (`scripts/deploy.sh`)
```bash
# Déploiement complet
./scripts/deploy.sh

# Actions spécifiques
./scripts/deploy.sh backup    # Sauvegarde avant déploiement
./scripts/deploy.sh deploy    # Déploiement
./scripts/deploy.sh rollback  # Rollback vers version précédente
./scripts/deploy.sh health    # Vérification santé
./scripts/deploy.sh cleanup   # Nettoyage
```

#### Windows (`scripts/deploy.ps1`)
```powershell
# Déploiement complet
.\scripts\deploy.ps1

# Actions spécifiques
.\scripts\deploy.ps1 -Action backup
.\scripts\deploy.ps1 -Action deploy
.\scripts\deploy.ps1 -Action rollback
.\scripts\deploy.ps1 -Action health
.\scripts\deploy.ps1 -Action cleanup
```

### Processus de déploiement

1. **Vérifications préalables**
   - Validation des prérequis
   - Vérification des variables d'environnement
   - Test de connectivité aux services externes

2. **Sauvegarde**
   - Sauvegarde de la base de données
   - Sauvegarde des volumes Docker
   - Sauvegarde des configurations

3. **Build et déploiement**
   - Pull du code source
   - Build des images Docker
   - Arrêt gracieux des services existants
   - Démarrage des nouveaux services

4. **Vérifications post-déploiement**
   - Health checks automatiques
   - Tests de fumée
   - Validation des endpoints critiques

### Commandes manuelles

```bash
# Déploiement manuel
git pull origin main
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Vérification des services
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f
```

## Monitoring et observabilité

### Prometheus (Métriques)
- **URL** : `http://votre-domaine:9090`
- **Configuration** : `monitoring/prometheus.yml`
- **Métriques collectées** :
  - Performance des APIs
  - Utilisation des ressources
  - Métriques Redis
  - Métriques système

### Grafana (Dashboards)
- **URL** : `http://votre-domaine:3002`
- **Login** : admin / `${GRAFANA_PASSWORD}`
- **Dashboards** : `monitoring/grafana/dashboards/`

### Health Checks

Tous les services incluent des health checks :

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logs

```bash
# Logs en temps réel
docker-compose -f docker-compose.production.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.production.yml logs -f backend

# Logs avec timestamps
docker-compose -f docker-compose.production.yml logs -f -t
```

## Maintenance et opérations

### Sauvegardes automatisées

```bash
# Script de sauvegarde quotidienne
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"

# Sauvegarde base de données
pg_dump $DATABASE_URL > "$BACKUP_DIR/database.sql"

# Sauvegarde volumes Docker
docker run --rm -v mj-chauffage_redis_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/redis_data.tar.gz -C /data .

# Rétention (garder 30 jours)
find ./backups -type d -mtime +30 -exec rm -rf {} \;
```

### Mise à jour des services

```bash
# Mise à jour avec zero-downtime
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d --no-deps frontend
docker-compose -f docker-compose.production.yml up -d --no-deps backend
```

### Scaling horizontal

```bash
# Scaling du backend
docker-compose -f docker-compose.production.yml up -d --scale backend=3

# Load balancing avec Nginx
upstream backend {
    server backend_1:3001;
    server backend_2:3001;
    server backend_3:3001;
}
```

## Rollback et récupération

### Rollback automatique

```bash
# Rollback vers la version précédente
./scripts/deploy.sh rollback

# Rollback manuel
docker-compose -f docker-compose.production.yml down
docker tag mj-chauffage_frontend:latest mj-chauffage_frontend:rollback
docker tag mj-chauffage_frontend:previous mj-chauffage_frontend:latest
docker-compose -f docker-compose.production.yml up -d
```

### Récupération de données

```bash
# Restauration base de données
psql $DATABASE_URL < ./backups/20231201_120000/database.sql

# Restauration volumes Redis
docker run --rm -v mj-chauffage_redis_data:/data -v ./backups/20231201_120000:/backup alpine tar xzf /backup/redis_data.tar.gz -C /data
```

## Sécurité en production

### Configuration SSL/TLS

```bash
# Certificats Let's Encrypt
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### Hardening Docker

```yaml
# docker-compose.production.yml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    user: "1001:1001"
```

### Firewall et réseau

```bash
# UFW configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Secrets management

```bash
# Utilisation de Docker secrets
echo "mot_de_passe_securise" | docker secret create db_password -
```

## Dépannage

### Problèmes courants

#### Services qui ne démarrent pas
```bash
# Vérifier les logs
docker-compose -f docker-compose.production.yml logs service_name

# Vérifier les ressources
docker stats

# Vérifier les ports
netstat -tulpn | grep :3000
```

#### Problèmes de connectivité
```bash
# Test de connectivité réseau
docker-compose -f docker-compose.production.yml exec backend ping redis
docker-compose -f docker-compose.production.yml exec backend curl -f http://frontend:3000/api/health
```

#### Problèmes de performance
```bash
# Monitoring des ressources
docker-compose -f docker-compose.production.yml exec backend top
docker-compose -f docker-compose.production.yml exec backend df -h
```

### Commandes de diagnostic

```bash
# État des services
docker-compose -f docker-compose.production.yml ps

# Utilisation des ressources
docker system df
docker system prune -f

# Inspection des containers
docker-compose -f docker-compose.production.yml exec backend env
docker-compose -f docker-compose.production.yml exec backend ps aux
```

### Contacts et support

- **Équipe DevOps** : devops@mjchauffage.com
- **Monitoring** : alerts@mjchauffage.com
- **Documentation** : [docs.mjchauffage.com](https://docs.mjchauffage.com)

---

## Checklist de déploiement

### Pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Certificats SSL valides
- [ ] Sauvegarde effectuée
- [ ] Tests passés en staging
- [ ] Équipe notifiée

### Déploiement
- [ ] Code source à jour
- [ ] Images buildées avec succès
- [ ] Services déployés
- [ ] Health checks OK
- [ ] Monitoring actif

### Post-déploiement
- [ ] Tests de fumée passés
- [ ] Performance vérifiée
- [ ] Logs sans erreurs
- [ ] Métriques normales
- [ ] Documentation mise à jour

---

*Ce guide est maintenu par l'équipe DevOps MJ CHAUFFAGE. Dernière mise à jour : Décembre 2024*