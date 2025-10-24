# 🔍 VÉRIFIER SI L'ADMIN EXISTE

## 🎯 MÉTHODE 1: Avec Prisma Studio (RECOMMANDÉ)

### Ouvrez un nouveau terminal PowerShell:

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
npx prisma studio
```

**Prisma Studio s'ouvrira dans votre navigateur:**
```
http://localhost:5555
```

### Dans Prisma Studio:
1. Cliquez sur **"User"** dans la barre latérale
2. Cherchez l'utilisateur avec:
   - **email:** `admin@mjchauffage.com`
   - **role:** `ADMIN`

**Si vous NE voyez PAS cet utilisateur, créez-le!**

---

## 🎯 MÉTHODE 2: Créer l'admin avec seed

### Dans PowerShell:

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
npx ts-node prisma/seed.ts
```

**Résultat attendu:**
```
🌱 Starting database seed...
✅ Admin user created: admin@mjchauffage.com
✅ Categories created: 3
✅ Manufacturers created: 2
✅ Products created: ...
```

**Le mot de passe sera:** `Admin123!`

---

## 🎯 MÉTHODE 3: Vérifier avec SQL direct

### Dans PowerShell:

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
sqlite3 dev.db "SELECT email, role, isActive FROM users WHERE role='ADMIN';"
```

**Si vous voyez:**
```
admin@mjchauffage.com|ADMIN|1
```
**L'admin existe!** ✅

**Si vous ne voyez rien:**
```
(aucun résultat)
```
**L'admin n'existe PAS!** ❌ Créez-le avec la méthode 2.

---

## ✅ CRÉER L'ADMIN MAINTENANT

### Si l'admin n'existe pas, exécutez:

```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
npx ts-node prisma/seed.ts
```

### Credentials après création:
- **Email:** `admin@mjchauffage.com`
- **Password:** `Admin123!`

---

## 🚀 APRÈS AVOIR CRÉÉ L'ADMIN

### 1. Démarrez le backend (si pas déjà fait):
```powershell
npm run dev
```

### 2. Testez le login:
```
http://localhost:3000/admin/login
```
- Email: `admin@mjchauffage.com`
- Password: `Admin123!`

---

## 🐛 SI LE SEED ÉCHOUE

### Erreur: "Table already exists"

**C'est normal!** Ça signifie que les tables existent déjà.

**Solution:** Le seed utilise `upsert`, il va juste mettre à jour:
```powershell
npx ts-node prisma/seed.ts
```

### Erreur: "Cannot find module 'ts-node'"

**Solution:**
```powershell
npm install -D ts-node
npx ts-node prisma/seed.ts
```

### Erreur: "Database connection failed"

**Solution:**
```powershell
# Recréer la base
npx prisma db push
npx ts-node prisma/seed.ts
```

---

## 📋 CHECKLIST COMPLÈTE

Pour que le login fonctionne, vous avez besoin de:

- [ ] Backend démarré sur port 3001
- [ ] Base de données `dev.db` existe
- [ ] Utilisateur admin existe avec email `admin@mjchauffage.com`
- [ ] Mot de passe est `Admin123!`
- [ ] User a `role='ADMIN'` et `isActive=true`

---

**🎯 VÉRIFIEZ ET CRÉEZ L'ADMIN MAINTENANT!**
