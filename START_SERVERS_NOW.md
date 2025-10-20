# 🚀 DÉMARRER LES SERVEURS - GUIDE FINAL

**Date:** 19 Octobre 2025  
**Status:** ✅ **BACKEND BUILD SUCCESS - PRÊT À DÉMARRER**

---

## ✅ CE QUI A ÉTÉ CORRIGÉ

### 1. Routes API v1 ajoutées
- ✅ `/api/v1/admin/login` - Login admin
- ✅ `/api/v1/geolocation` - Geolocation
- ✅ `/api/v1/analytics/events` - Analytics events
- ✅ Toutes les autres routes v1

### 2. Routes legacy maintenues
- ✅ `/api/admin/login` - Aussi disponible
- ✅ Compatibilité backward

### 3. Build backend
- ✅ 0 erreurs TypeScript
- ✅ Code compilé dans `/dist`

---

## 🚀 INSTRUCTIONS DE DÉMARRAGE

### ÉTAPE 1: Ouvrir 2 Terminaux PowerShell

**Terminal 1 sera pour le Backend**  
**Terminal 2 sera pour le Frontend**

---

### ÉTAPE 2: Démarrer le Backend (Terminal 1)

```powershell
# Aller dans le dossier backend
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend

# Démarrer le serveur
npm run dev
```

**✅ Attendez de voir ces messages:**
```
Server running on http://localhost:3001
Database: Connected
Environment: development
```

**⚠️ NE FERMEZ PAS CE TERMINAL!** Laissez-le tourner.

---

### ÉTAPE 3: Démarrer le Frontend (Terminal 2)

**Ouvrez un NOUVEAU terminal PowerShell:**

```powershell
# Aller dans le dossier frontend
cd C:\Users\youcefcheriet\MJCHAUFFAGE\frontend

# Démarrer le frontend
npm run dev
```

**✅ Attendez de voir:**
```
✓ Ready in ...
○ Local: http://localhost:3000
```

**⚠️ NE FERMEZ PAS CE TERMINAL!** Laissez-le tourner aussi.

---

### ÉTAPE 4: Tester le Backend

**Ouvrez votre navigateur:**

1. **Test Health Check:**
   ```
   http://localhost:3001/health
   ```
   **Résultat attendu:** `{ "status": "ok", ... }`

2. **Test Geolocation:**
   ```
   http://localhost:3001/api/v1/geolocation
   ```
   **Résultat attendu:**
   ```json
   {
     "country": "Algeria",
     "country_code": "DZ",
     "city": "Algiers"
   }
   ```

---

### ÉTAPE 5: Login Admin

1. **Allez sur:**
   ```
   http://localhost:3000/admin/login
   ```

2. **Entrez les credentials:**
   - **Email:** `admin@mjchauffage.com`
   - **Password:** `Admin123!`

3. **Cliquez sur "Login"**

4. **Vous devriez être redirigé vers:**
   ```
   http://localhost:3000/admin/dashboard
   ```

---

## 🐛 SI ÇA NE MARCHE PAS

### Problème 1: Backend ne démarre pas

**Erreur:** `Port 3001 already in use`

**Solution:**
```powershell
# Trouver le processus qui utilise le port
netstat -ano | findstr :3001

# Tuer le processus (remplacer <PID> par le numéro)
taskkill /PID <PID> /F

# Redémarrer le backend
npm run dev
```

---

### Problème 2: "Connection Refused"

**Cause:** Backend pas démarré.

**Solution:** Vérifiez que le Terminal 1 (backend) affiche bien "Server running on http://localhost:3001"

---

### Problème 3: "Invalid credentials"

**Vérifiez:**
- Email: `admin@mjchauffage.com` (sans faute)
- Password: `Admin123!` (avec majuscule A et !)

**Si toujours bloqué, réinitialisez l'admin:**
```powershell
cd backend
npx ts-node prisma/seed.ts
```

---

### Problème 4: 404 Not Found sur les routes

**Vérifiez que le backend est bien démarré:**
```powershell
# Dans le terminal backend, vous devriez voir:
Server running on http://localhost:3001
```

**Testez manuellement:**
```
http://localhost:3001/health
```

---

## 📊 CONSOLE - CE QUI EST NORMAL

### Backend Console (Normal):
```
Server running on http://localhost:3001
Database: Connected
GET /health 200
GET /api/v1/geolocation 200
POST /api/v1/analytics/events 200
```

### Frontend Console (Normal):
```
Compiled successfully
```

**⚠️ Ignorez ces warnings (normaux):**
- Hydration warnings
- Fast Refresh warnings

---

## 🎯 ROUTES DISPONIBLES

### API v1 (Principale):
- `POST /api/v1/admin/login` - Login
- `GET /api/v1/admin/dashboard` - Dashboard data
- `GET /api/v1/admin/orders` - Orders list
- `GET /api/v1/admin/customers` - Customers list
- `GET /api/v1/geolocation` - Geolocation
- `POST /api/v1/analytics/events` - Analytics
- ... (30+ autres routes)

### API Legacy (Compatible):
- `POST /api/admin/login` - Login (old)
- `GET /api/admin/dashboard` - Dashboard (old)
- ... (aussi disponible)

---

## ✅ CHECKLIST FINALE

Avant de dire "ça ne marche pas", vérifiez:

- [ ] Terminal Backend ouvert et affiche "Server running"
- [ ] Terminal Frontend ouvert et affiche "Ready"
- [ ] http://localhost:3001/health retourne `{"status":"ok"}`
- [ ] http://localhost:3000 charge la page
- [ ] Credentials corrects: `admin@mjchauffage.com` / `Admin123!`

---

## 🎯 STRUCTURE DES TERMINAUX

```
Terminal 1 (Backend):
C:\Users\youcefcheriet\MJCHAUFFAGE\backend> npm run dev
Server running on http://localhost:3001
[LAISSEZ TOURNER - NE FERMEZ PAS]

Terminal 2 (Frontend):
C:\Users\youcefcheriet\MJCHAUFFAGE\frontend> npm run dev
✓ Ready in ...
[LAISSEZ TOURNER - NE FERMEZ PAS]

Navigateur:
http://localhost:3000/admin/login
[UTILISEZ L'APPLICATION ICI]
```

---

## 📝 AIDE SUPPLÉMENTAIRE

### Voir les logs backend en temps réel:
Les logs s'affichent automatiquement dans le Terminal 1.

### Redémarrer les serveurs:
```powershell
# Dans chaque terminal:
Ctrl + C (arrêter)
npm run dev (redémarrer)
```

### Vérifier la base de données:
```powershell
cd backend
npx prisma studio
```

---

## 💡 COMMANDES RAPIDES

### Backend:
```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
npm run dev
```

### Frontend:
```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\frontend
npm run dev
```

### Login:
- URL: `http://localhost:3000/admin/login`
- Email: `admin@mjchauffage.com`
- Password: `Admin123!`

---

**🚀 MAINTENANT, DÉMARREZ LES 2 TERMINAUX ET TESTEZ!**

**STATUS:** ✅ **TOUT EST PRÊT!**
