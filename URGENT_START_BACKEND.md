# 🚨 URGENT - LE BACKEND N'EST PAS DÉMARRÉ!

## ❌ ERREUR ACTUELLE

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
POST http://localhost:3001/api/v1/admin/login
GET http://localhost:3001/api/v1/geolocation
POST http://localhost:3001/api/v1/analytics/events
```

**CAUSE:** Le serveur backend ne tourne PAS sur le port 3001!

---

## ✅ SOLUTION IMMÉDIATE

### OUVREZ UN NOUVEAU TERMINAL POWERSHELL MAINTENANT:

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
npm run dev
```

**⚠️ ATTENDEZ** de voir ces messages avant de continuer:
```
✓ Compiled successfully
Server running on http://localhost:3001
```

---

## 📋 ÉTAPE PAR ÉTAPE

### 1️⃣ Ouvrir PowerShell
- Cliquez sur l'icône Windows
- Tapez "PowerShell"
- Ouvrez "Windows PowerShell"

### 2️⃣ Aller dans le dossier backend
```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
```

### 3️⃣ Démarrer le backend
```powershell
npm run dev
```

### 4️⃣ Attendre le message de succès
Vous DEVEZ voir:
```
> mj-chauffage-backend@1.0.0 dev
> npm run build && npm run start:compiled

✓ Compiled successfully

Server running on http://localhost:3001
Database: Connected
Environment: development
```

### 5️⃣ LAISSEZ CE TERMINAL OUVERT
**NE LE FERMEZ PAS!** Le backend doit tourner en permanence.

---

## 🧪 VÉRIFICATION

### Dans votre navigateur, testez:
```
http://localhost:3001/health
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-19T...",
  "environment": "development"
}
```

**Si vous voyez ce JSON, le backend fonctionne! ✅**

---

## 🔄 APRÈS LE DÉMARRAGE

### Une fois le backend démarré, réessayez le login:

1. Allez sur: `http://localhost:3000/admin/login`
2. Email: `admin@mjchauffage.com`
3. Password: `Admin123!`
4. Cliquez "Login"

**Cette fois, ça devrait marcher!**

---

## 🐛 SI LE BACKEND NE DÉMARRE PAS

### Erreur: "Port 3001 already in use"

**Solution:**
```powershell
# Trouver et tuer le processus
netstat -ano | findstr :3001
taskkill /PID <numero_du_pid> /F

# Redémarrer
npm run dev
```

### Erreur: "Cannot find module"

**Solution:**
```powershell
npm install
npm run dev
```

### Erreur: "Database connection failed"

**Solution:**
```powershell
# Vérifier que dev.db existe
dir dev.db

# Si absent, créer avec:
npx prisma db push
npx ts-node prisma/seed.ts
```

---

## 📊 ÉTAT DES SERVEURS

| Serveur | Status | Port | Action |
|---------|--------|------|--------|
| Frontend | ✅ Running | 3000 | Déjà démarré |
| Backend | ❌ **NOT RUNNING** | 3001 | **À DÉMARRER MAINTENANT** |

---

## 💡 RAPPEL IMPORTANT

**VOUS AVEZ BESOIN DE 2 TERMINAUX:**

```
Terminal 1 (Backend):     ❌ PAS DÉMARRÉ
C:\...\backend> npm run dev

Terminal 2 (Frontend):    ✅ DÉJÀ RUNNING
C:\...\frontend> npm run dev
```

**Le frontend ne peut PAS fonctionner sans le backend!**

---

## 🎯 COMMANDE FINALE

**COPIEZ ET COLLEZ CETTE COMMANDE DANS POWERSHELL:**

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend; npm run dev
```

**Appuyez sur ENTRÉE et attendez "Server running"!**

---

## ✅ APRÈS LE DÉMARRAGE

Vous devriez voir dans la console:
- ✅ Plus d'erreur "ERR_CONNECTION_REFUSED"
- ✅ Les requêtes passent (200 OK)
- ✅ Le login fonctionne

---

**🚨 DÉMARREZ LE BACKEND MAINTENANT! 🚨**
