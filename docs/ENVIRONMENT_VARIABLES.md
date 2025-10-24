# Variables d'Environnement - MJ CHAUFFAGE

## Vue d'ensemble

Ce document détaille toutes les variables d'environnement utilisées dans le projet MJ CHAUFFAGE, leurs configurations pour chaque environnement (développement, staging, production) et les bonnes pratiques de sécurité.

## Structure des Fichiers d'Environnement

```
MJCHAUFFAGE/
├── backend/
│   ├── .env                    # Variables backend (NON VERSIONNÉ)
│   ├── .env.example           # Template backend
│   ├── .env.test              # Variables pour les tests
│   └── .env.production        # Variables production (NON VERSIONNÉ)
├── frontend/
│   ├── .env.local             # Variables frontend (NON VERSIONNÉ)
│   ├── .env.example           # Template frontend
│   └── .env.production        # Variables production (NON VERSIONNÉ)
└── admin-v2/
    ├── admin-frontend/
    │   └── .env.local         # Variables admin frontend
    └── admin-backend/
        └── .env               # Variables admin backend
```

## Variables Backend (.env)

### 🔐 Base de Données

#### DATABASE_URL
- **Type** : Connection String
- **Requis** : ✅ Oui
- **Description** : URL de connexion à la base de données PostgreSQL
- **Format** : `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- **Exemples** :
  - **Développement** : `"postgresql://user:password@localhost:5432/mjchauffage_dev"`
  - **Test** : `"postgresql://user:password@localhost:5432/mjchauffage_test"`
  - **Production** : `"postgresql://user:password@prod-host:5432/mjchauffage"`
- **Sécurité** : ⚠️ **CRITIQUE** - Ne jamais exposer en production

#### DATABASE_URL_TEST
- **Type** : Connection String
- **Requis** : 🔶 Optionnel (tests uniquement)
- **Description** : URL de connexion pour la base de données de test
- **Exemple** : `"postgresql://user:password@localhost:5432/mjchauffage_test"`

### 🔑 Authentification JWT

#### JWT_SECRET
- **Type** : String (256-bit minimum)
- **Requis** : ✅ Oui
- **Description** : Clé secrète pour signer les access tokens JWT
- **Génération** : `crypto.randomBytes(64).toString('hex')`
- **Exemple** : `"aaff730625562e43ea8720952fd5b08bc27926d45633410b0a998c9b907a143327a0f46144818fd7c25ca9e57c0c11e0a63a409ebd8be60454339f54d27c54a0"`
- **Sécurité** : 🔴 **ULTRA-CRITIQUE** - Minimum 64 caractères hexadécimaux

#### JWT_REFRESH_SECRET
- **Type** : String (256-bit minimum)
- **Requis** : ✅ Oui
- **Description** : Clé secrète pour signer les refresh tokens JWT
- **Génération** : `crypto.randomBytes(64).toString('hex')`
- **Exemple** : `"f78e742fc66861473c300a470ad9e1b095513946c92ac473e324a42ce2b87dd929397f63269e886f23b4642ff1b8e8b8b"`
- **Sécurité** : 🔴 **ULTRA-CRITIQUE** - Doit être différent de JWT_SECRET

#### JWT_EXPIRES_IN
- **Type** : String (durée)
- **Requis** : 🔶 Optionnel
- **Description** : Durée de vie des access tokens
- **Valeur par défaut** : `"15m"`
- **Exemples** : `"15m"`, `"30m"`, `"1h"`
- **Recommandation** : Maximum 15 minutes pour la sécurité

#### JWT_REFRESH_EXPIRES_IN
- **Type** : String (durée)
- **Requis** : 🔶 Optionnel
- **Description** : Durée de vie des refresh tokens
- **Valeur par défaut** : `"7d"`
- **Exemples** : `"7d"`, `"14d"`, `"30d"`
- **Recommandation** : Maximum 30 jours

### 🛡️ Sessions et Sécurité

#### SESSION_SECRET
- **Type** : String (256-bit minimum)
- **Requis** : ✅ Oui
- **Description** : Secret pour signer les sessions Express
- **Génération** : `crypto.randomBytes(64).toString('hex')`
- **Exemple** : `"generate_a_strong_session_secret_here"`
- **Sécurité** : 🔴 **CRITIQUE** - Unique par environnement

#### BCRYPT_ROUNDS
- **Type** : Number
- **Requis** : 🔶 Optionnel
- **Description** : Nombre de rounds pour le hachage bcrypt
- **Valeur par défaut** : `12`
- **Recommandations** :
  - **Développement** : `10-12`
  - **Production** : `12-14`
- **Performance** : Plus élevé = plus sécurisé mais plus lent

### 🌐 Configuration Serveur

#### PORT
- **Type** : Number
- **Requis** : 🔶 Optionnel
- **Description** : Port d'écoute du serveur backend
- **Valeur par défaut** : `3001`
- **Exemples** :
  - **Développement** : `3001`
  - **Production** : `8080` ou variable d'environnement du provider

#### NODE_ENV
- **Type** : String
- **Requis** : ✅ Oui
- **Description** : Environnement d'exécution
- **Valeurs possibles** : `"development"`, `"production"`, `"test"`
- **Impact** : Affecte les logs, la sécurité, les optimisations

#### API_PORT
- **Type** : Number
- **Requis** : 🔶 Optionnel
- **Description** : Port alternatif pour l'API
- **Valeur par défaut** : `3001`

#### API_BASE_URL
- **Type** : URL
- **Requis** : 🔶 Optionnel
- **Description** : URL de base de l'API
- **Valeur par défaut** : `"http://localhost:3001"`
- **Exemples** :
  - **Développement** : `"http://localhost:3001"`
  - **Production** : `"https://api.mjchauffage.com"`

#### FRONTEND_URL
- **Type** : URL
- **Requis** : ✅ Oui (pour CORS)
- **Description** : URL du frontend pour configuration CORS
- **Exemples** :
  - **Développement** : `"http://localhost:3000"`
  - **Production** : `"https://mjchauffage.com"`

### 📧 Configuration Email

#### EMAIL_HOST
- **Type** : String
- **Requis** : ✅ Oui (production)
- **Description** : Serveur SMTP pour l'envoi d'emails
- **Exemples** :
  - **Gmail** : `"smtp.gmail.com"`
  - **Outlook** : `"smtp-mail.outlook.com"`
  - **SendGrid** : `"smtp.sendgrid.net"`

#### EMAIL_PORT
- **Type** : Number
- **Requis** : 🔶 Optionnel
- **Description** : Port du serveur SMTP
- **Valeur par défaut** : `587`
- **Ports courants** :
  - **587** : STARTTLS (recommandé)
  - **465** : SSL/TLS
  - **25** : Non sécurisé (éviter)

#### EMAIL_USER
- **Type** : String
- **Requis** : ✅ Oui (production)
- **Description** : Nom d'utilisateur SMTP
- **Exemple** : `"noreply@mjchauffage.com"`

#### EMAIL_PASSWORD
- **Type** : String
- **Requis** : ✅ Oui (production)
- **Description** : Mot de passe SMTP ou App Password
- **Sécurité** : 🔴 **CRITIQUE** - Utiliser App Passwords pour Gmail
- **Exemple** : `"your-app-password"`

#### EMAIL_FROM
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Adresse d'expéditeur par défaut
- **Valeur par défaut** : `"MJ CHAUFFAGE <noreply@mjchauffage.com>"`
- **Format** : `"Nom <email@domain.com>"`

### 🗄️ Redis (Cache et Sessions)

#### REDIS_URL
- **Type** : Connection String
- **Requis** : 🔶 Optionnel
- **Description** : URL de connexion Redis complète
- **Valeur par défaut** : `"redis://localhost:6379"`
- **Exemples** :
  - **Local** : `"redis://localhost:6379"`
  - **Avec auth** : `"redis://user:password@host:6379"`
  - **SSL** : `"rediss://user:password@host:6380"`

#### REDIS_HOST
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Hôte Redis
- **Valeur par défaut** : `"localhost"`

#### REDIS_PORT
- **Type** : Number
- **Requis** : 🔶 Optionnel
- **Description** : Port Redis
- **Valeur par défaut** : `6379`

### 🚦 Rate Limiting

#### RATE_LIMIT_WINDOW
- **Type** : Number (minutes)
- **Requis** : 🔶 Optionnel
- **Description** : Fenêtre de temps pour le rate limiting
- **Valeur par défaut** : `15`
- **Recommandations** :
  - **Développement** : `15` minutes
  - **Production** : `5-15` minutes

#### RATE_LIMIT_MAX_REQUESTS
- **Type** : Number
- **Requis** : 🔶 Optionnel
- **Description** : Nombre maximum de requêtes par fenêtre
- **Valeur par défaut** : `100`
- **Recommandations** :
  - **API générale** : `100-200`
  - **Auth endpoints** : `5-10`
  - **Admin endpoints** : `200-500`

### 📁 Upload et Fichiers

#### UPLOAD_MAX_SIZE
- **Type** : Number (bytes)
- **Requis** : 🔶 Optionnel
- **Description** : Taille maximale des fichiers uploadés
- **Valeur par défaut** : `10485760` (10MB)
- **Exemples** :
  - **10MB** : `10485760`
  - **50MB** : `52428800`
  - **100MB** : `104857600`

#### UPLOAD_ALLOWED_TYPES
- **Type** : String (CSV)
- **Requis** : 🔶 Optionnel
- **Description** : Types MIME autorisés pour l'upload
- **Valeur par défaut** : `"image/jpeg,image/png,image/webp,application/pdf"`
- **Exemple** : `"image/jpeg,image/png,image/webp,application/pdf,text/csv"`

### 🌍 APIs Externes

#### GOOGLE_MAPS_API_KEY
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Clé API Google Maps
- **Usage** : Géolocalisation, cartes
- **Sécurité** : 🟡 Restreindre par domaine/IP

#### WEATHER_API_KEY
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Clé API météo
- **Usage** : Informations météorologiques

#### GEMINI_API_KEY
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Clé API Google Gemini
- **Usage** : Intelligence artificielle

#### GOOGLE_CLIENT_ID
- **Type** : String
- **Requis** : 🔶 Optionnel (OAuth)
- **Description** : ID client Google OAuth
- **Usage** : Authentification Google

#### GOOGLE_CLIENT_SECRET
- **Type** : String
- **Requis** : 🔶 Optionnel (OAuth)
- **Description** : Secret client Google OAuth
- **Sécurité** : 🔴 **CRITIQUE** - Ne jamais exposer

### 💳 Paiements (Stripe)

#### STRIPE_SECRET_KEY
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Clé secrète Stripe
- **Format** : `sk_test_...` (test) ou `sk_live_...` (production)
- **Sécurité** : 🔴 **ULTRA-CRITIQUE**

#### STRIPE_WEBHOOK_SECRET
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Secret webhook Stripe
- **Format** : `whsec_...`
- **Sécurité** : 🔴 **CRITIQUE**

### 💳 Paiements Locaux (Dahabia)

#### DAHABIA_API_URL
- **Type** : URL
- **Requis** : 🔶 Optionnel
- **Description** : URL de l'API Dahabia
- **Valeur par défaut** : `"https://api.poste.dz"`

#### DAHABIA_MERCHANT_ID
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : ID marchand Dahabia
- **Sécurité** : 🟡 Sensible

#### DAHABIA_SECRET_KEY
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Clé secrète Dahabia
- **Sécurité** : 🔴 **CRITIQUE**

### 📊 Logging

#### LOG_LEVEL
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Niveau de logging
- **Valeur par défaut** : `"info"`
- **Valeurs** : `"error"`, `"warn"`, `"info"`, `"debug"`
- **Recommandations** :
  - **Développement** : `"debug"`
  - **Production** : `"warn"` ou `"error"`

#### LOG_FILE
- **Type** : String (chemin)
- **Requis** : 🔶 Optionnel
- **Description** : Chemin du fichier de log
- **Valeur par défaut** : `"logs/app.log"`

### 🇩🇿 Configuration Algérie

#### DEFAULT_CURRENCY
- **Type** : String (ISO 4217)
- **Requis** : 🔶 Optionnel
- **Description** : Devise par défaut
- **Valeur par défaut** : `"DZD"`

#### DEFAULT_LOCALE
- **Type** : String (ISO 639-1)
- **Requis** : 🔶 Optionnel
- **Description** : Langue par défaut
- **Valeur par défaut** : `"ar"`

#### SUPPORTED_LOCALES
- **Type** : String (CSV)
- **Requis** : 🔶 Optionnel
- **Description** : Langues supportées
- **Valeur par défaut** : `"ar,fr"`

#### TIMEZONE
- **Type** : String (IANA)
- **Requis** : 🔶 Optionnel
- **Description** : Fuseau horaire
- **Valeur par défaut** : `"Africa/Algiers"`

### 🗄️ Configuration Base de Données Avancée

#### DB_CONNECTION_TIMEOUT
- **Type** : Number (ms)
- **Requis** : 🔶 Optionnel
- **Description** : Timeout de connexion DB
- **Valeur par défaut** : `60000` (60s)

#### DB_QUERY_TIMEOUT
- **Type** : Number (ms)
- **Requis** : 🔶 Optionnel
- **Description** : Timeout des requêtes DB
- **Valeur par défaut** : `30000` (30s)

#### DB_RETRY_ATTEMPTS
- **Type** : Number
- **Requis** : 🔶 Optionnel
- **Description** : Nombre de tentatives de reconnexion
- **Valeur par défaut** : `3`

#### DB_RETRY_DELAY
- **Type** : Number (ms)
- **Requis** : 🔶 Optionnel
- **Description** : Délai entre les tentatives
- **Valeur par défaut** : `1000` (1s)

#### DB_MAX_CONNECTIONS
- **Type** : Number
- **Requis** : 🔶 Optionnel
- **Description** : Nombre maximum de connexions
- **Valeur par défaut** : `10`

## Variables Frontend (.env.local)

### 🔐 Authentification NextAuth

#### NEXTAUTH_URL
- **Type** : URL
- **Requis** : ✅ Oui
- **Description** : URL de l'application pour NextAuth
- **Exemples** :
  - **Développement** : `"http://localhost:3000"`
  - **Production** : `"https://mjchauffage.com"`
- **Usage** : Callbacks OAuth, redirections

#### NEXTAUTH_SECRET
- **Type** : String (256-bit minimum)
- **Requis** : ✅ Oui (production)
- **Description** : Secret pour signer les sessions NextAuth
- **Génération** : `openssl rand -base64 32`
- **Exemple** : `"remplacer_par_un_secret_nextauth_fort_et_aleatoire"`
- **Sécurité** : 🔴 **ULTRA-CRITIQUE**

#### SECRET_COOKIE_PASSWORD
- **Type** : String (32 caractères)
- **Requis** : ✅ Oui
- **Description** : Secret pour chiffrer les cookies (iron-session)
- **Longueur** : Exactement 32 caractères
- **Exemple** : `"remplacer_par_un_mot_de_passe_de_32_caracteres"`
- **Sécurité** : 🔴 **CRITIQUE**

### 🌐 APIs et Services (Publiques)

#### NEXT_PUBLIC_API_URL
- **Type** : URL
- **Requis** : ✅ Oui
- **Description** : URL de base de l'API backend (sans le préfixe /api, qui est ajouté automatiquement)
- **Exemples** :
  - **Développement** : `"http://localhost:3001"`
  - **Production** : `"https://api.mjchauffage.com"`
- **Sécurité** : ✅ Sûr d'être exposé
- **Note** : Le préfixe `/api` est automatiquement ajouté dans apiClient.ts

#### NEXT_PUBLIC_BASE_URL
- **Type** : URL
- **Requis** : 🔶 Optionnel
- **Description** : URL de base du site (pour SEO, métadonnées)
- **Exemples** :
  - **Développement** : `"http://localhost:3000"`
  - **Production** : `"https://mjchauffage.com"`

#### NEXT_PUBLIC_SITE_NAME
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Nom du site
- **Valeur par défaut** : `"MJ CHAUFFAGE"`

#### NEXT_PUBLIC_SITE_URL
- **Type** : URL
- **Requis** : 🔶 Optionnel
- **Description** : URL canonique du site
- **Exemple** : `"https://mjchauffage.com"`

### 💳 Paiements (Publiques)

#### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Clé publique Stripe (sûre côté client)
- **Format** : `pk_test_...` (test) ou `pk_live_...` (production)
- **Sécurité** : ✅ Conçue pour être exposée

### 🗺️ Cartes et Géolocalisation

#### NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Clé API Google Maps (côté client)
- **Usage** : Affichage de cartes, géolocalisation
- **Sécurité** : 🟡 Restreindre par domaine

### 🔍 SEO et Vérification

#### GOOGLE_SITE_VERIFICATION
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Code de vérification Google Search Console
- **Usage** : Métabalise de vérification
- **Exemple** : `"abc123def456ghi789"`

#### YANDEX_VERIFICATION
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Code de vérification Yandex Webmaster
- **Usage** : Métabalise de vérification

#### YAHOO_VERIFICATION
- **Type** : String
- **Requis** : 🔶 Optionnel
- **Description** : Code de vérification Yahoo Site Explorer
- **Usage** : Métabalise de vérification

### 🔐 OAuth Google (Serveur uniquement)

#### GOOGLE_CLIENT_ID
- **Type** : String
- **Requis** : 🔶 Optionnel (OAuth)
- **Description** : ID client Google OAuth (côté serveur)
- **Usage** : NextAuth Google Provider
- **Sécurité** : 🟡 Sensible mais pas critique

#### GOOGLE_CLIENT_SECRET
- **Type** : String
- **Requis** : 🔶 Optionnel (OAuth)
- **Description** : Secret client Google OAuth (côté serveur)
- **Sécurité** : 🔴 **CRITIQUE** - Jamais exposé au client

## Variables Admin Frontend (.env.local)

### 🔐 Configuration API Admin

#### NEXT_PUBLIC_API_URL
- **Type** : URL
- **Requis** : ✅ Oui
- **Description** : URL de l'API admin backend
- **Exemples** :
  - **Développement** : `"http://localhost:3003"`
  - **Production** : `"https://admin-api.mjchauffage.com"`

#### NEXTAUTH_URL
- **Type** : URL
- **Requis** : ✅ Oui
- **Description** : URL de l'interface admin
- **Exemples** :
  - **Développement** : `"http://localhost:3005"`
  - **Production** : `"https://admin.mjchauffage.com"`

#### NEXTAUTH_SECRET
- **Type** : String
- **Requis** : ✅ Oui
- **Description** : Secret NextAuth pour l'admin
- **Sécurité** : 🔴 **CRITIQUE** - Différent du frontend public

## Configurations par Environnement

### 🛠️ Développement

**Backend (.env)**
```env
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/mjchauffage_dev"
JWT_SECRET="dev-jwt-secret-256-bits-minimum-length-required-for-security"
JWT_REFRESH_SECRET="dev-refresh-secret-256-bits-minimum-length-required"
SESSION_SECRET="dev-session-secret-change-in-production"
PORT=3001
FRONTEND_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
LOG_LEVEL="debug"
BCRYPT_ROUNDS=10
```

**Frontend (.env.local)**
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-nextauth-secret-change-in-production"
SECRET_COOKIE_PASSWORD="dev-cookie-password-32-chars-min"
NEXT_PUBLIC_API_URL="http://localhost:3001"  # Base URL sans /api (ajouté automatiquement)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="MJ CHAUFFAGE - DEV"
```

### 🧪 Test

**Backend (.env.test)**
```env
NODE_ENV=test
DATABASE_URL="postgresql://user:password@localhost:5432/mjchauffage_test"
JWT_SECRET="test-jwt-secret-256-bits-minimum-length-required-for-testing"
JWT_REFRESH_SECRET="test-refresh-secret-256-bits-minimum-length-required"
SESSION_SECRET="test-session-secret"
PORT=3001
REDIS_URL="redis://localhost:6379/1"
LOG_LEVEL="error"
BCRYPT_ROUNDS=4
```

### 🚀 Production

**Backend (.env)**
```env
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:secure_password@prod-host:5432/mjchauffage"
JWT_SECRET="PRODUCTION-JWT-SECRET-256-BITS-ULTRA-SECURE-RANDOM-GENERATED"
JWT_REFRESH_SECRET="PRODUCTION-REFRESH-SECRET-256-BITS-ULTRA-SECURE-DIFFERENT"
SESSION_SECRET="PRODUCTION-SESSION-SECRET-ULTRA-SECURE-RANDOM"
PORT=8080
FRONTEND_URL="https://mjchauffage.com"
REDIS_URL="rediss://user:password@prod-redis:6380"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="noreply@mjchauffage.com"
EMAIL_PASSWORD="secure-app-password"
LOG_LEVEL="warn"
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=5
RATE_LIMIT_MAX_REQUESTS=50
```

**Frontend (.env.local)**
```env
NEXTAUTH_URL="https://mjchauffage.com"
NEXTAUTH_SECRET="PRODUCTION-NEXTAUTH-SECRET-ULTRA-SECURE-RANDOM-GENERATED"
SECRET_COOKIE_PASSWORD="PROD-COOKIE-PASSWORD-32-CHARS-SEC"
NEXT_PUBLIC_API_URL="https://api.mjchauffage.com"  # Base URL sans /api (ajouté automatiquement)
NEXT_PUBLIC_BASE_URL="https://mjchauffage.com"
NEXT_PUBLIC_SITE_NAME="MJ CHAUFFAGE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="production-google-maps-key"
GOOGLE_CLIENT_ID="production-google-client-id"
GOOGLE_CLIENT_SECRET="production-google-client-secret"
GOOGLE_SITE_VERIFICATION="production-verification-code"
```

## Sécurité et Bonnes Pratiques

### 🔐 Génération de Secrets Sécurisés

#### Méthodes de Génération

**Node.js (Recommandé)**
```javascript
// Génération de secrets 256-bit
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);
```

**OpenSSL**
```bash
# Secret base64 (32 bytes = 256 bits)
openssl rand -base64 32

# Secret hexadécimal (64 bytes = 512 bits)
openssl rand -hex 64
```

**PowerShell (Windows)**
```powershell
# Génération de secret aléatoire
[System.Web.Security.Membership]::GeneratePassword(64, 0)
```

### 🛡️ Validation des Variables

#### Script de Validation Backend

```typescript
// backend/scripts/validate-env.ts
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL'
];

const optionalEnvVars = [
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'REDIS_URL',
  'STRIPE_SECRET_KEY'
];

// Validation des variables requises
const missingVars: string[] = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

// Validation de la sécurité des secrets
const validateSecret = (name: string, minLength: number = 64) => {
  const value = process.env[name]!;
  if (value.length < minLength) {
    console.error(`❌ ${name} doit faire au moins ${minLength} caractères`);
    process.exit(1);
  }
};

validateSecret('JWT_SECRET', 64);
validateSecret('JWT_REFRESH_SECRET', 64);
validateSecret('SESSION_SECRET', 32);

console.log('✅ Toutes les variables d\'environnement sont valides');
```

### 🚫 Variables à Ne Jamais Exposer

#### Côté Client (NEXT_PUBLIC_)
❌ **JAMAIS exposer ces variables avec NEXT_PUBLIC_** :
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SESSION_SECRET`
- `DATABASE_URL`
- `EMAIL_PASSWORD`
- `STRIPE_SECRET_KEY`
- `GOOGLE_CLIENT_SECRET`
- Toute clé secrète d'API

#### Côté Serveur Uniquement
✅ **Ces variables restent côté serveur** :
- Secrets de chiffrement
- Mots de passe de base de données
- Clés secrètes d'APIs
- Tokens d'authentification

### 📋 Checklist de Sécurité

#### Avant Déploiement
- [ ] Tous les secrets sont générés aléatoirement (256-bit minimum)
- [ ] Aucun secret n'est committé dans Git
- [ ] Les fichiers `.env*` sont dans `.gitignore`
- [ ] Les secrets de production sont différents du développement
- [ ] Les variables `NEXT_PUBLIC_` ne contiennent aucun secret
- [ ] Les URLs de production sont correctes
- [ ] Les clés API sont restreintes par domaine/IP
- [ ] Les mots de passe email utilisent App Passwords
- [ ] La validation des variables fonctionne
- [ ] Les logs ne contiennent aucun secret

#### Rotation des Secrets
- [ ] JWT secrets : Tous les 90 jours
- [ ] Session secrets : Tous les 90 jours
- [ ] Database passwords : Tous les 180 jours
- [ ] API keys : Selon les recommandations du provider
- [ ] Email passwords : Tous les 180 jours

### 🔄 Gestion des Secrets en Production

#### Variables d'Environnement du Provider

**Vercel**
```bash
# Ajouter des variables via CLI
vercel env add JWT_SECRET production
vercel env add DATABASE_URL production
```

**Railway**
```bash
# Variables via interface web ou CLI
railway variables set JWT_SECRET=your-secret
```

**Docker Compose (Secrets)**
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    image: mjchauffage-backend
    secrets:
      - jwt_secret
      - db_password
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      DATABASE_PASSWORD_FILE: /run/secrets/db_password

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
```

### 🚨 Détection de Fuites

#### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Vérifier les secrets dans les fichiers
if git diff --cached --name-only | xargs grep -l "JWT_SECRET\|DATABASE_URL\|password.*=" 2>/dev/null; then
    echo "❌ ERREUR: Secrets détectés dans les fichiers à committer!"
    echo "Vérifiez que vous n'exposez pas de secrets."
    exit 1
fi

echo "✅ Aucun secret détecté"
```

#### Scan Automatique
```bash
# Installation de truffleHog pour détecter les secrets
npm install -g trufflehog

# Scan du repository
trufflehog --regex --entropy=False .
```

## Dépannage

### ❌ Erreurs Courantes

#### "Missing required environment variables"
```bash
# Solution : Vérifier que toutes les variables requises sont définies
npm run validate-env
```

#### "process is not defined" (Frontend)
```bash
# Cause : Utilisation de process.env côté client sans NEXT_PUBLIC_
# Solution : Ajouter NEXT_PUBLIC_ ou déplacer côté serveur
```

#### "Invalid token" / "JWT malformed"
```bash
# Cause : JWT_SECRET incorrect ou manquant
# Solution : Vérifier JWT_SECRET dans .env backend
```

#### "Database connection failed"
```bash
# Cause : DATABASE_URL incorrect
# Solution : Vérifier format et credentials
```

### 🔧 Commandes de Diagnostic

```bash
# Backend - Validation des variables
cd backend
npm run validate-env

# Frontend - Vérification des variables publiques
cd frontend
npm run build  # Vérifie les variables au build

# Test de connexion base de données
cd backend
npx prisma db pull

# Test de connexion Redis
redis-cli ping
```

### 📞 Support

Pour toute question sur les variables d'environnement :
- **Email** : dev@mjchauffage.com
- **Documentation** : `/docs/`
- **Validation** : `npm run validate-env`

---

*Guide mis à jour le : Janvier 2025*
*Version : 2.0.0*