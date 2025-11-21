# PLAN D'ACTION - APRÈS-MIDI CRITIQUE

**Date:** October 30, 2025 - 14:45
**Objectif:** Atteindre production readiness
**Temps estimé:** 4-5 heures
**Critères de succès:** 5/6 métriques Phase 1 validées

---

## 🎯 OBJECTIFS APRÈS-MIDI

### ✅ À ATTEINDRE AVANT 18H
1. **Tests fonctionnels** (>70% coverage)
2. **Authentification consolidée** (1 seul système)
3. **CI/CD opérationnel**
4. **Tests e2e passant**
5. **Bundle optimisé**

### ❌ HORS SCOPE APRÈS-MIDI
- Migration PostgreSQL complète
- Services email
- Optimisations performance avancées

---

## 📋 ACTIONS CONCRÈTES PAR PRIORITÉ

### 🔥 PRIORITÉ 1: FIX TESTS (1.5H - 15H00)

#### 1.1 Corriger Button.test.tsx (45 min)
**Fichier:** `frontend/src/components/ui/__tests__/Button.test.tsx`

**Problème:** 7 tests failed - multiples boutons trouvés

**Solution:**
```typescript
// AJOUTER en haut du describe
describe('Button', () => {
  afterEach(() => {
    cleanup(); // ✅ ESSENTIEL
  });

  // MODIFIER tous les tests pour utiliser des textes uniques
  it('renders with default props', () => {
    render(<Button>Click me unique test</Button>);
    const button = screen.getByRole('button', { name: /click me unique test/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Test click handler</Button>);

    const button = screen.getByRole('button', { name: /test click handler/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as disabled', () => {
    render(<Button disabled>Test disabled state</Button>);

    const button = screen.getByRole('button', { name: /test disabled state/i });
    expect(button).toBeDisabled();
  });

  // etc. pour tous les tests...
});

// VALIDATION
npm run test -- --testPathPattern=Button.test.tsx
# ✅ Doit passer
```

#### 1.2 Configurer Coverage Correctement (30 min)
**Fichier:** `vitest.config.ts`

**Problème:** Configuration coverage incorrecte

**Solution:**
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./jest.setup.ts'],
    coverage: {
      provider: 'v8', // ✅ v8 au lieu de istanbul
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'], // ✅ Inclure tous les fichiers src
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      }
    }
  }
})
```

#### 1.3 Atteindre 70% Coverage (15 min)
```bash
# Lancer les tests avec coverage
npm run test:coverage

# Résultat attendu:
# ----------------|---------|----------|---------|---------|-------------------
# File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
# ----------------|---------|----------|---------|---------|-------------------
# All files       |     75  |      70  |     80  |     75  |
# ----------------|---------|----------|---------|---------|-------------------

# ✅ Target: >70% statements
```

### 🔥 PRIORITÉ 2: CONSOLIDATION AUTH (1.5H - 16H30)

#### 2.1 Supprimer Dépendances Conflituelles (30 min)
```bash
cd frontend

# Supprimer TOUTES les dépendances auth sauf custom JWT
npm uninstall @auth/prisma-adapter next-auth

# Vérifier qu'elles sont supprimées
npm list | grep auth
# Ne doit montrer que les dépendances nécessaires
```

#### 2.2 Vérifier Code Restant (30 min)
```bash
# Chercher tous les usages d'auth conflictuels
grep -r "useSession" src/           # NextAuth
grep -r "NextAuth" src/             # NextAuth
grep -r "iron-session" src/         # Iron session
grep -r "prisma-adapter" src/       # Prisma adapter

# Si trouvé, supprimer ou remplacer par:
import { useAuth } from '@/contexts/AuthContext'; // ✅ Custom JWT

# Vérifier que AuthContext existe
ls src/contexts/AuthContext.tsx
# ✅ Doit exister
```

#### 2.3 Tester Authentification (30 min)
```bash
# Build d'abord
npm run build
# ✅ Doit passer

# Lancer en dev
npm run dev

# Tester dans navigateur:
# 1. Aller sur /fr/auth/login
# 2. Tester inscription avec email valide
# 3. Vérifier que login fonctionne
# 4. Tester admin login: admin@mjchauffage.com / Admin123!

# ✅ Auth doit fonctionner parfaitement
```

### 🔥 PRIORITÉ 3: CI/CD OPÉRATIONNEL (1H - 17H30)

#### 3.1 Créer GitHub Actions (45 min)
**Fichier:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: frontend/.next/
```

#### 3.2 Configurer Repository GitHub (15 min)
```bash
# Créer repository GitHub si pas fait
# https://github.com/new

# Pousser le code
git add .
git commit -m "feat: add CI/CD pipeline and fix critical issues"
git push origin main

# Aller dans Settings > Secrets and variables > Actions
# Ajouter secrets pour déploiement futur:
# - VERCEL_TOKEN
# - DATABASE_URL (pour tests)
```

### 🔥 PRIORITÉ 4: TESTS E2E (30 MIN - 18H00)

#### 4.1 Lancer Tests E2E (15 min)
```bash
# S'assurer que l'app tourne
npm run dev &
sleep 10

# Lancer tests e2e
npm run test:e2e

# Ou manuellement:
npx playwright test

# Résultat attendu: tous verts
```

#### 4.2 Validation Finale (15 min)
```bash
# Tests de validation complets
✅ npm run build                    # PASSE
✅ npm run test:coverage > 70%      # >70%
✅ npm run test:e2e                 # TOUS VERTS
✅ Auth consolidation               # 1 SYSTÈME
✅ CI/CD                            # OPÉRATIONNEL
✅ Bundle size                      # <500KB
```

---

## 📊 CHECKLIST VALIDATION FIN JOURNÉE

### ✅ Critères de Réussite (5/6 minimum)
- [x] Build passe
- [ ] Coverage > 70%
- [ ] Tests e2e verts
- [ ] Auth unique
- [ ] CI/CD actif
- [x] Bundle optimisé

### 🎯 Métriques Cibles
| Métrique | Actuel | Target | Status |
|----------|--------|--------|--------|
| Build | ✅ Pass | ✅ Pass | ✅ |
| Coverage | 0% | 70%+ | 🔴 |
| Auth Systems | 4 | 1 | 🔴 |
| Bundle Size | 87KB | <500KB | ✅ |
| CI/CD | ❌ | ✅ | 🔴 |
| Tests E2E | ❌ | ✅ | 🔴 |

---

## 🚨 PLAN B - SI TEMPS INSUFFISANT

### Option 1: Focus Production Minimum (2h)
- ✅ Fix auth (priorité sécurité)
- ✅ Fix build (priorité déploiement)
- ✅ Tests manuels critiques uniquement

### Option 2: Tests Only (2h)
- ✅ Atteindre 70% coverage
- ✅ Tests e2e fonctionnels
- ✅ Auth pour semaine prochaine

### Option 3: Externaliser (Recommandé)
- **Freelance spécialisé tests:** 2h × €100/h = €200
- **Résultat:** Production ready demain

---

## 💰 BUDGET & TEMPS

### Investissement Aujourd'hui: 4-5h
- **Équipe interne:** Temps disponible
- **Freelance:** €300-400

### Retour sur Investissement
- **Évite:** Déploiement raté = €5K-10K pertes
- **Gagne:** Plateforme production stable
- **Payback:** Immédiat (lundi déploiement possible)

---

## 🎯 CONCLUSION & PROCHAINES ÉTAPES

### Si Tout Va Bien (Scénario Optimal)
**18h00:** 5/6 critères validés
**Lundi:** Déploiement production possible
**Semaine prochaine:** Phase 2 (PostgreSQL, email, monitoring)

### Si Difficultés (Scénario Réaliste)
**18h00:** 3/6 critères (build + auth + CI/CD)
**Lundi-Mercredi:** Finaliser tests et e2e
**Jeudi:** Déploiement production

### Point Critique
**Ne pas déployer** sans tests fonctionnels (>70% coverage).

---

**Plan d'action après-midi - MJ Chauffage | 30 octobre 2025**
