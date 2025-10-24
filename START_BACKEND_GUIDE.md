# 🚀 GUIDE POUR DÉMARRER LE BACKEND

## ❌ PROBLÈME ACTUEL

```
POST http://localhost:3001/api/v1/admin/login net::ERR_CONNECTION_REFUSED
```

**Cause:** Le serveur backend n'est pas démarré sur le port 3001.

---

## ✅ SOLUTION - DÉMARRER LE BACKEND

### ÉTAPE 1: Ouvrir un nouveau terminal

**Windows PowerShell:**
1. Ouvrez un nouveau terminal PowerShell
2. Naviguez vers le dossier backend

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
```

### ÉTAPE 2: Vérifier la configuration .env

Assurez-vous que le fichier `.env` existe avec ces variables:

```bash
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET=votre_secret_jwt
```

### ÉTAPE 3: Démarrer le serveur

```powershell
npm run dev
```

**OU si vous préférez:**

```powershell
npm run build
npm run start:compiled
```

### ÉTAPE 4: Vérifier que le serveur démarre

Vous devriez voir dans le terminal:

```
✅ Server running on http://localhost:3001
✅ Database connected
✅ Environment: development
```

---

## 🔍 VÉRIFICATIONS

### 1. Le port 3001 est-il libre?

```powershell
# Windows PowerShell - Vérifier si le port 3001 est utilisé
netstat -ano | findstr :3001
```

Si le port est déjà utilisé, tuez le processus:
```powershell
# Remplacez <PID> par le numéro de processus
taskkill /PID <PID> /F
```

### 2. La base de données est-elle accessible?

Le backend a besoin d'une connexion PostgreSQL. Vérifiez:
- ✅ PostgreSQL est installé et démarré
- ✅ La `DATABASE_URL` dans `.env` est correcte
- ✅ La base de données existe

### 3. Les dépendances sont-elles installées?

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
npm install
```

---

## 📋 ÉTAPES COMPLÈTES

### Terminal 1 - Backend (PowerShell)
```powershell
# 1. Aller dans le dossier backend
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend

# 2. Installer les dépendances (si pas fait)
npm install

# 3. Vérifier que .env existe et est configuré
cat .env

# 4. Build le projet
npm run build

# 5. Démarrer le serveur
npm run start:compiled
```

### Terminal 2 - Frontend
```powershell
# Garder le frontend qui tourne déjà
# ou le redémarrer si nécessaire
cd C:\Users\youcefcheriet\MJCHAUFFAGE\frontend
npm run dev
```

---

## 🎯 TESTER LA CONNEXION BACKEND

Une fois le backend démarré, testez dans votre navigateur:

```
http://localhost:3001/api/v1/health
```

Vous devriez voir une réponse JSON comme:
```json
{
  "status": "ok",
  "timestamp": "2025-10-19T...",
  "environment": "development"
}
```

---

## 🔐 CRÉER UN ADMIN (Si pas encore fait)

Si vous n'avez pas encore d'utilisateur admin:

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
npm run seed:admin
```

Ou créez-en un manuellement via Prisma:

```powershell
npx prisma studio
```

Puis dans l'interface Prisma Studio:
1. Allez dans la table `User`
2. Créez un utilisateur avec `role: "ADMIN"`

---

## 🚨 ERREURS COMMUNES

### Erreur: "Cannot find module"
**Solution:**
```powershell
npm install
npm run build
```

### Erreur: "Database connection failed"
**Solution:**
- Vérifiez PostgreSQL est démarré
- Vérifiez DATABASE_URL dans .env
- Testez la connexion: `npx prisma db push`

### Erreur: "Port 3001 already in use"
**Solution:**
```powershell
# Trouver le processus
netstat -ano | findstr :3001

# Tuer le processus (remplacer <PID>)
taskkill /PID <PID> /F

# Redémarrer le backend
npm run dev
```

### Erreur: "JWT_SECRET is not defined"
**Solution:**
Ajoutez dans `.env`:
```
JWT_SECRET=votre_secret_super_secure_au_moins_32_caracteres
```

---

## 📝 COMMANDES UTILES

### Voir les logs en temps réel
```powershell
# Le serveur affiche les logs automatiquement
npm run dev
```

### Redémarrer le serveur
```powershell
# Ctrl+C pour arrêter
# Puis relancer:
npm run dev
```

### Vérifier la DB avec Prisma
```powershell
npx prisma studio
```

### Migrations de DB
```powershell
npx prisma migrate dev
```

---

## ✅ CHECKLIST AVANT DE TESTER LOGIN

- [ ] Backend démarré sur port 3001
- [ ] Message "Server running" visible dans le terminal
- [ ] Test http://localhost:3001/api/v1/health réussit
- [ ] Database connectée
- [ ] User admin existe dans la DB
- [ ] Frontend connecté à http://localhost:3001
- [ ] Login page accessible sur http://localhost:3000/admin/login

---

## 🎯 APRÈS LE DÉMARRAGE

1. **Backend terminal devrait afficher:**
   ```
   Server running on http://localhost:3001
   Database: Connected
   Environment: development
   ```

2. **Frontend devrait pouvoir:**
   - Se connecter à l'API backend
   - Login admin fonctionnel
   - Dashboard accessible

3. **Tester le login:**
   - Aller sur http://localhost:3000/admin/login
   - Entrer vos credentials admin
   - Devrait rediriger vers /admin/dashboard

---

## 💡 AIDE SUPPLÉMENTAIRE

Si le problème persiste, vérifiez:

1. **Les logs du backend** - Qu'est-ce qui est affiché?
2. **Les variables d'environnement** - `.env` est-il correct?
3. **La base de données** - PostgreSQL fonctionne-t-il?
4. **Le firewall** - Bloque-t-il le port 3001?

---

**PROCHAINE ÉTAPE:** Démarrez le backend dans un nouveau terminal PowerShell! 🚀
