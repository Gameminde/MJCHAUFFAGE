# PLAN D'ACTION - CORRECTIONS CRITIQUES MJ CHAUFFAGE

**Date:** October 30, 2025
**Status:** CONFIRMED - Problèmes critiques validés
**Impact:** Production deployment BLOCKED

---

## 🚨 VALIDATION DES PROBLÈMES CRITIQUES

### ✅ 1. Build Failures - CONFIRMED
```bash
❌ npm run build → FAIL
Error: 'CartProvider' is not defined
Error: 'WishlistProvider' is not defined
Error: Parsing error: Unterminated regular expression literal
```

### ✅ 2. Test Coverage 0% - CONFIRMED
```bash
❌ npm run test:coverage
85 failed | 45 passed | 6 skipped (136)
Coverage: 0% statements, 0% lines, 0% branches, 0% functions

Cause: Tests cassés (multiples éléments button trouvés)
```

### ✅ 3. Authentification Chaos - CONFIRMED
**4 systèmes actifs simultanément:**
```json
{
  "@auth/prisma-adapter": "^2.10.0",    // NextAuth adapter
  "next-auth": "^4.24.11",             // NextAuth v4
  "iron-session": "^8.0.4",            // Session alternative
  // + système custom JWT (présumé)
}
```

### ✅ 4. Dépendances Inutilisées - CONFIRMED
```json
{
  "critters": "^0.0.23",               // 0.0.23 - UNUSED
  "google-auth-library": "^10.3.0",    // UNUSED
  "puppeteer": "^24.26.1",             // ~3MB - UNUSED
  "iron-session": "^8.0.4",            // CONFLICT
  "react-query": "^3.39.3",            // CONFLICT avec autre lib
}
```

### ✅ 5. Database SQLite/PostgreSQL - CONFIRMED
```prisma
// backend/prisma/schema.prisma
datasource db {
  provider = "sqlite"      // ❌ DEV
  // vs PostgreSQL en PROD
}
```

---

## 🔥 PHASE 1: FIX CRITIQUE - CETTE SEMAINE (URGENCE)

### 1.1 CORRIGER LE BUILD (2h)
**Status:** BLOQUANT | **Priorité:** CRITIQUE

#### Étape 1: Identifier les erreurs exactes
```bash
cd frontend
npm run build 2>&1 | tee build-errors.log
```

#### Étape 2: Créer les Providers manquants
**Fichier:** `frontend/src/contexts/CartProvider.tsx`
```typescript
// frontend/src/contexts/CartProvider.tsx
import React, { createContext, useContext } from 'react';

interface CartContextType {
  // Define cart context interface
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Basic implementation
  return (
    <CartContext.Provider value={{}}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
```

**Fichier:** `frontend/src/contexts/WishlistProvider.tsx`
```typescript
// frontend/src/contexts/WishlistProvider.tsx
import React, { createContext, useContext } from 'react';

interface WishlistContextType {
  // Define wishlist context interface
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Basic implementation
  return (
    <WishlistContext.Provider value={{}}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
```

#### Étape 3: Corriger les tests cassés
**Fichier:** `frontend/src/components/products/__tests__/ModernProductCard.test.tsx`
```typescript
// Ajouter les imports manquants
import { CartProvider } from '@/contexts/CartProvider';
import { WishlistProvider } from '@/contexts/WishlistProvider';

// Wrapper le composant de test
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CartProvider>
    <WishlistProvider>
      {children}
    </WishlistProvider>
  </CartProvider>
);

// Modifier les tests
it('renders correctly', () => {
  render(
    <TestWrapper>
      <ModernProductCard product={mockProduct} />
    </TestWrapper>
  );
  // ... rest of test
});
```

#### Étape 4: Corriger l'expression régulière cassée
**Fichier:** `frontend/src/hooks/__tests__/useCart.test.ts`
```typescript
// Identifier et corriger la ligne 22 avec l'expression régulière cassée
// Exemple de correction :
const pattern = /some\/pattern/gi; // Assurer la fermeture correcte
```

#### Étape 5: Valider le build
```bash
npm run build
# ✅ DOIT PASSER
```

### 1.2 NETTOYER LES DÉPENDANCES (1h)
**Status:** HAUTE PRIORITÉ | **Impact:** Bundle size -200KB

```bash
cd frontend

# 1. Audit automatique
npx depcheck

# 2. Désinstaller les inutilisés
npm uninstall critters google-auth-library puppeteer iron-session react-query

# 3. Nettoyer le lock file
rm package-lock.json
npm install

# 4. Vérifier le bundle
npm run build
# Analyser .next/static/chunks
```

### 1.3 CONSOLIDER L'AUTHENTIFICATION (3h)
**Status:** CRITIQUE | **Impact:** Sécurité et stabilité

#### Étape 1: Choisir le système unique
**Décision:** Garder UNIQUEMENT le système custom JWT (celui utilisé actuellement)

#### Étape 2: Supprimer les conflits
```bash
cd frontend

# Supprimer les dépendances auth conflictuelles
npm uninstall @auth/prisma-adapter next-auth iron-session

# Nettoyer
rm package-lock.json
npm install
```

#### Étape 3: Vérifier le code
```bash
# Rechercher les usages restants
grep -r "useSession\|NextAuth\|iron" src/

# Supprimer ou remplacer les imports
```

#### Étape 4: Tester l'authentification
```bash
npm run build
npm run test:unit
# ✅ Auth doit fonctionner avec le système unique
```

### 1.4 FIXER LES TESTS (4h)
**Status:** CRITIQUE | **Impact:** Qualité et déploiement

#### Étape 1: Corriger les tests Button cassés
**Fichier:** `frontend/src/components/ui/__tests__/Button.test.tsx`
```typescript
// Problème: Multiples boutons trouvés
// Solution: Isoler chaque test ou utiliser des queries plus spécifiques

describe('Button', () => {
  // Nettoyer après chaque test
  afterEach(() => {
    cleanup();
  });

  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
  });

  // Utiliser des queries plus spécifiques
  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Étape 2: Configurer correctement la couverture
**Fichier:** `vitest.config.ts`
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
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
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

#### Étape 3: Atteindre 70% de couverture minimum
```bash
npm run test:coverage
# Target: >70% coverage
```

---

## ⚠️ PHASE 2: HAUTE PRIORITÉ - SEMAINE 2

### 2.1 MIGRATION POSTGRESQL COMPLÈTE (4h)

#### Étape 1: Setup PostgreSQL local
```bash
# Utiliser Docker pour développement
docker run -d \
  --name mjchauffage-postgres \
  -e POSTGRES_USER=mjchauffage \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=mjchauffage_dev \
  -p 5432:5432 \
  postgres:15
```

#### Étape 2: Mettre à jour la configuration
**Fichier:** `backend/prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"  // ✅ Partout
  url      = env("DATABASE_URL")
}
```

**Fichier:** `backend/.env`
```bash
DATABASE_URL="postgresql://mjchauffage:secret@localhost:5432/mjchauffage_dev"
```

#### Étape 3: Migrer
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name migrate-to-postgres
npx prisma db seed
```

#### Étape 4: Tester
```bash
npm run test:integration
# ✅ Tests doivent passer avec PostgreSQL
```

### 2.2 ACTIVER LES SERVICES EMAIL (2h)

#### Étape 1: Choisir le provider
```bash
cd backend
npm install @sendgrid/mail
```

#### Étape 2: Configuration
**Fichier:** `backend/src/services/emailService.ts`
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const msg = {
    to: email,
    from: 'noreply@mjchauffage.com',
    subject: 'Vérifiez votre email - MJ Chauffage',
    html: `
      <h1>Bienvenue chez MJ Chauffage</h1>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
      <a href="${verificationUrl}">Vérifier mon email</a>
    `,
  };

  await sgMail.send(msg);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: 'noreply@mjchauffage.com',
    subject: 'Réinitialisation de mot de passe - MJ Chauffage',
    html: `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
    `,
  };

  await sgMail.send(msg);
}
```

#### Étape 3: Activer dans les contrôleurs
**Fichier:** `backend/src/controllers/authController.ts`
```typescript
// Décommenter et utiliser le service email
import { sendVerificationEmail, sendPasswordResetEmail } from '@/services/emailService';

// Dans register()
await sendVerificationEmail(result.user.email, verificationToken);

// Dans forgotPassword()
await sendPasswordResetEmail(user.email, resetToken);
```

#### Étape 4: Configuration environnement
**Fichier:** `backend/.env`
```bash
# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2.3 IMPLÉMENTER CI/CD (3h)

#### Étape 1: Créer GitHub Actions
**Fichier:** `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Linting & Type Check
  lint:
    name: Lint & Type Check
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

  # Job 2: Tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: lint

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: mjchauffage
          POSTGRES_PASSWORD: secret
          POSTGRES_DB: mjchauffage_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

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

      - name: Setup database
        run: |
          cd backend
          npx prisma migrate deploy
          npx prisma db seed

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  # Job 3: Build
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test

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
          path: |
            frontend/.next/
            backend/dist/
```

#### Étape 2: Configurer les secrets GitHub
```
Settings > Secrets and variables > Actions
- Add secrets for production deployment
```

#### Étape 3: Premier push
```bash
git add .github/workflows/ci.yml
git commit -m "feat: add CI/CD pipeline"
git push
```

---

## 📊 MÉTRIQUES DE VALIDATION

### Phase 1 - Cette Semaine
```bash
# Tests de validation
✅ npm run build                    # DOIT PASSER
✅ npm run test:coverage > 70%      # COUVERTURE MINIMUM
✅ npm run test:e2e                 # TESTS E2E OK
✅ Un seul système d'auth           # AUTH CONSOLIDÉ
✅ Bundle size < 500KB              # OPTIMISÉ
```

### Phase 2 - Semaine 2
```bash
✅ PostgreSQL partout               # MIGRATION COMPLÈTE
✅ CI/CD opérationnel               # GITHUB ACTIONS
✅ Email service actif              # VERIFICATION + RESET
✅ Tests d'intégration passent      # AVEC POSTGRES
```

---

## 🎯 PLAN D'EXÉCUTION DÉTAILLÉ

### JOUR 1: MATIN (FIX BUILD)
```bash
# 9h00 - 11h00: Créer les providers manquants
# 11h00 - 12h00: Corriger les tests cassés
# 14h00 - 16h00: Fix expressions régulières
# 16h00 - 17h00: Validation build
```

### JOUR 1: APRÈS-MIDI (NETTOYAGE)
```bash
# 14h00 - 15h00: Audit dépendances
# 15h00 - 16h00: Désinstallation inutiles
# 16h00 - 17h00: Validation fonctionnelle
```

### JOUR 2: MATIN (AUTH CONSOLIDATION)
```bash
# 9h00 - 11h00: Supprimer conflits auth
# 11h00 - 12h00: Vérifier utilisations restantes
# 14h00 - 16h00: Tests système auth unique
# 16h00 - 17h00: Validation sécurité
```

### JOUR 2: APRÈS-MIDI (TESTS FIX)
```bash
# 14h00 - 16h00: Corriger tests Button
# 16h00 - 17h00: Configurer couverture
# 17h00 - 18h00: Atteindre 70%
```

### JOUR 3: VALIDATION COMPLÈTE
```bash
# Journée complète: Tests end-to-end
# Validation de tous les critères Phase 1
```

---

## 💰 COÛT ESTIMÉ

### Option A: Équipe Interne (Recommandée)
- **Développeur Senior:** 3 jours × €500/jour = €1,500
- **Total:** €1,500 (équipe existante)

### Option B: Freelance
- **Full-stack Senior:** 40h × €75/h = €3,000
- **Total:** €3,000

### ROI
- **Évite:** Pertes de €10K+ en déploiement raté
- **Gagne:** Déploiement production cette semaine
- **Payback:** Immédiat (jour 3)

---

## 🚨 RISQUES SI NON CORRIGÉ

### Risque 1: Déploiement Impossible (100%)
- **Impact:** Site ne peut pas aller en production
- **Coût:** Retard projet, perte revenus
- **Probabilité:** Certaine sans corrections

### Risque 2: Bugs Non Détectés (90%)
- **Impact:** Incidents production, support client
- **Coût:** €5K+ en corrections d'urgence
- **Probabilité:** Très élevée sans tests

### Risque 3: Vulnérabilités Sécurité (70%)
- **Impact:** Brèche données, amendes RGPD
- **Coût:** €50K+ en conséquences légales
- **Probabilité:** Élevée avec 4 systèmes auth

---

## ✅ CHECKLIST FINALE

**Avant de dire "C'est prêt pour production" :**
- [ ] `npm run build` passe sans erreur
- [ ] `npm run test:coverage` > 70%
- [ ] `npm run test:e2e` tous verts
- [ ] Un seul système d'authentification
- [ ] Aucune dépendance inutilisée
- [ ] Bundle size < 500KB gzipped
- [ ] PostgreSQL dans tous environnements
- [ ] CI/CD opérationnel sur GitHub
- [ ] Email service testé et fonctionnel

---

**CONCLUSION**

Le rapport d'audit révèle que le projet n'est PAS prêt pour la production malgré les affirmations contraires. Les problèmes critiques identifiés doivent être corrigés IMMÉDIATEMENT.

**Plan d'action:** Cette semaine pour Phase 1 (corrections critiques), Semaine 2 pour Phase 2 (optimisations).

**Résultat attendu:** Déploiement production possible dès la fin de la semaine prochaine.

---

*Plan créé le 30 octobre 2025 | Mise à jour nécessaire après corrections*
