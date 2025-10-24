# 🎯 PLAN D'ACTION DÉTAILLÉ - CORRECTIONS MJ CHAUFFAGE

**Durée totale :** 2 semaines (10 jours ouvrables)  
**Objectif :** Passer de 78/100 à 84/100  
**Équipe :** 1-2 développeurs

---

## 📅 SEMAINE 1 - CORRECTIONS CRITIQUES & URGENTES

### 🔴 JOUR 1 - MATIN (4h)

#### ✅ Tâche 1.1 : Éliminer tous les console.log (2h)

**Étape 1 : Créer le logger centralisé**

```bash
# Backend
mkdir -p backend/src/utils
```

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'mj-chauffage-backend',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Console en dev uniquement
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export { logger };
```

```typescript
// frontend/src/lib/logger.ts
class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  
  log(...args: any[]) {
    if (this.isDev) console.log(...args);
  }
  
  error(message: string, error?: any) {
    if (this.isDev) {
      console.error(message, error);
    } else {
      // Send to backend analytics
      fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          error: error?.message || error,
          stack: error?.stack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  }
  
  warn(...args: any[]) {
    if (this.isDev) console.warn(...args);
  }
}

export const logger = new Logger();
```

**Étape 2 : Rechercher et remplacer**

```bash
# Backend - Trouver tous les console.*
cd backend
grep -rn "console\." src/ | wc -l  # Compter (devrait être ~49)

# Créer un script de remplacement
cat > scripts/replace-console-logs.sh << 'EOF'
#!/bin/bash
# Remplace console.log par logger.info
find src -type f -name "*.ts" -exec sed -i 's/console\.log/logger.info/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/console\.error/logger.error/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/console\.warn/logger.warn/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/console\.debug/logger.debug/g' {} +
EOF

chmod +x scripts/replace-console-logs.sh

# ATTENTION: Vérifier avant d'exécuter!
# Faire un backup d'abord
git add -A
git commit -m "backup before console.log replacement"

# Exécuter le remplacement
# ./scripts/replace-console-logs.sh  # À faire manuellement après vérification
```

**Étape 3 : Ajouter imports logger**

```bash
# Ajouter import dans chaque fichier modifié
# À faire manuellement ou avec un script plus sophistiqué
# import { logger } from '@/utils/logger';
```

**Vérification :**
```bash
# Ne devrait plus trouver de console.log
grep -rn "console\." src/ --exclude-dir=node_modules
```

---

#### ✅ Tâche 1.2 : Corriger vulnérabilités NPM (1h)

```bash
cd backend

# 1. Audit initial
npm audit

# 2. Mettre à jour validator
npm install validator@latest

# 3. Downgrade swagger-jsdoc (version stable)
npm install swagger-jsdoc@6.2.8

# 4. Forcer mise à jour dépendances
npm audit fix

# 5. Si vulnérabilités persistent
npm audit fix --force

# 6. Vérifier à nouveau
npm audit

# 7. Documenter les changements
npm ls validator
npm ls swagger-jsdoc
```

**Mise à jour package.json :**
```json
{
  "dependencies": {
    "validator": "^13.11.0",
    "swagger-jsdoc": "^6.2.8"
  }
}
```

---

#### ✅ Tâche 1.3 : Créer fichiers .env.example (1h)

```bash
cd backend

# Créer .env.example
cat > .env.example << 'EOF'
# ============================================
# MJ CHAUFFAGE - BACKEND ENVIRONMENT VARIABLES
# ============================================

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mjchauffage"

# Redis Cache
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session
SESSION_SECRET=your-session-secret-change-in-production-minimum-32-characters

# Encryption
ENCRYPTION_KEY=your-encryption-key-must-be-exactly-32-bytes-long

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="MJ CHAUFFAGE <noreply@mjchauffage.com>"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# External Services (Optional)
SENTRY_DSN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Two-Factor Authentication (Optional)
TWO_FACTOR_APP_NAME=MJ CHAUFFAGE
EOF

cd ../frontend

# Créer .env.example
cat > .env.example << 'EOF'
# ============================================
# MJ CHAUFFAGE - FRONTEND ENVIRONMENT VARIABLES
# ============================================

# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME=MJ CHAUFFAGE
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Default Locale
NEXT_PUBLIC_DEFAULT_LOCALE=fr

# Google Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN=

# Image Optimization
NEXT_PUBLIC_IMAGE_DOMAIN=localhost
EOF
```

**Documenter dans README.md :**
```bash
cat >> README.md << 'EOF'

## 🔧 Configuration

### Variables d'environnement

1. **Backend :**
   ```bash
   cd backend
   cp .env.example .env
   # Éditer .env avec vos valeurs
   ```

2. **Frontend :**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Éditer .env.local avec vos valeurs
   ```

### Variables critiques à changer :
- `JWT_SECRET` : Générer avec `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` : Générer avec `openssl rand -base64 32`
- `ENCRYPTION_KEY` : Générer avec `openssl rand -hex 16`
- `SESSION_SECRET` : Générer avec `openssl rand -base64 32`
EOF
```

---

### 🔴 JOUR 1 - APRÈS-MIDI (4h)

#### ✅ Tâche 1.4 : Implémenter Email Service (4h)

**Étape 1 : Configurer Nodemailer**

```typescript
// backend/src/config/email.ts
import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  const transporter = nodemailer.createTransporter(config);

  // Vérifier la connexion
  transporter.verify((error, success) => {
    if (error) {
      logger.error('Email transporter verification failed', error);
    } else {
      logger.info('Email transporter is ready');
    }
  });

  return transporter;
};

export const emailTransporter = createTransporter();
```

**Étape 2 : Implémenter l'envoi d'emails**

```typescript
// backend/src/services/emailService.ts - COMPLÉTER L'EXISTANT
import { emailTransporter } from '@/config/email';
import { logger } from '@/utils/logger';

export class EmailService {
  private static from = process.env.EMAIL_FROM || 'noreply@mjchauffage.com';

  static async sendOrderConfirmationEmail(
    recipientEmail: string,
    recipientName: string,
    orderNumber: string,
    totalAmount: number,
    orderItems: any[]
  ): Promise<boolean> {
    try {
      const html = this.generateOrderConfirmationHTML({
        recipientName,
        orderNumber,
        totalAmount,
        orderItems,
      });

      await emailTransporter.sendMail({
        from: this.from,
        to: recipientEmail,
        subject: `Confirmation de commande #${orderNumber} - MJ CHAUFFAGE`,
        html,
      });

      logger.info('Order confirmation email sent', { 
        email: recipientEmail, 
        orderNumber 
      });
      return true;
    } catch (error) {
      logger.error('Failed to send order confirmation email', { 
        error, 
        email: recipientEmail 
      });
      return false;
    }
  }

  private static generateOrderConfirmationHTML(data: any): string {
    const { recipientName, orderNumber, totalAmount, orderItems } = data;
    
    const itemsHTML = orderItems
      .map(item => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice.toFixed(2)} DZD</td>
          <td>${(item.quantity * item.unitPrice).toFixed(2)} DZD</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          th { background: #f3f4f6; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MJ CHAUFFAGE</h1>
          </div>
          
          <h2>Bonjour ${recipientName},</h2>
          <p>Merci pour votre commande ! Voici le récapitulatif :</p>
          
          <p><strong>Numéro de commande :</strong> #${orderNumber}</p>
          
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <p class="total">Total : ${totalAmount.toFixed(2)} DZD</p>
          
          <p>Nous vous contacterons prochainement pour confirmer la livraison.</p>
          
          <p>Cordialement,<br>L'équipe MJ CHAUFFAGE</p>
        </div>
      </body>
      </html>
    `;
  }
}
```

**Étape 3 : Intégrer dans orderService**

```typescript
// backend/src/services/orderService.ts
import { EmailService } from './emailService';

// Trouver la méthode sendOrderConfirmationEmail (ligne ~657)
// REMPLACER:
private static async sendOrderConfirmationEmail(order: any, customerInfo: any) {
  // TODO: Implement actual email sending
  console.log('Order confirmation email would be sent to:', customerInfo.email);
}

// PAR:
private static async sendOrderConfirmationEmail(order: any, customerInfo: any) {
  try {
    await EmailService.sendOrderConfirmationEmail(
      customerInfo.email,
      customerInfo.firstName,
      order.orderNumber,
      order.totalAmount,
      order.items.map((item: any) => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );
    logger.info('Order confirmation email sent', { orderId: order.id });
  } catch (error) {
    logger.error('Failed to send order confirmation', { 
      error, 
      orderId: order.id 
    });
    // Ne pas bloquer la création de commande si l'email échoue
  }
}
```

**Étape 4 : Tester**

```bash
# Configuration .env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-test-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Générer dans Google Account Settings
EMAIL_FROM="MJ CHAUFFAGE <noreply@mjchauffage.com>"

# Redémarrer le backend
npm run dev

# Créer une commande test et vérifier l'email
```

---

### 🔴 JOUR 2 - MATIN (4h)

#### ✅ Tâche 2.1 : Créer ProductValidationService (2h)

```typescript
// backend/src/services/productValidationService.ts (NOUVEAU FICHIER)
import { prisma } from '@/lib/database';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

interface ValidationResult {
  valid: boolean;
  product?: any;
  error?: string;
}

export class ProductValidationService {
  /**
   * Valide la disponibilité d'un produit et son stock
   */
  static async validateProductStock(
    productId: string,
    requestedQuantity: number,
    transaction?: PrismaTransactionClient
  ): Promise<ValidationResult> {
    const prismaClient = transaction || prisma;

    try {
      const product = await prismaClient.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          isActive: true,
          price: true,
        },
      });

      // Produit inexistant
      if (!product) {
        return {
          valid: false,
          error: `Product ${productId} not found`,
        };
      }

      // Produit inactif
      if (!product.isActive) {
        return {
          valid: false,
          product,
          error: `Product "${product.name}" is no longer available`,
        };
      }

      // Stock insuffisant
      if (product.stockQuantity < requestedQuantity) {
        return {
          valid: false,
          product,
          error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${requestedQuantity}`,
        };
      }

      return { valid: true, product };
    } catch (error) {
      logger.error('Product validation error', { error, productId });
      return {
        valid: false,
        error: 'Failed to validate product',
      };
    }
  }

  /**
   * Valide plusieurs produits en batch
   */
  static async validateProductsStock(
    items: Array<{ productId: string; quantity: number }>,
    transaction?: PrismaTransactionClient
  ): Promise<{
    valid: boolean;
    errors: Array<{ productId: string; error: string }>;
    products: Map<string, any>;
  }> {
    const errors: Array<{ productId: string; error: string }> = [];
    const products = new Map<string, any>();

    for (const item of items) {
      const validation = await this.validateProductStock(
        item.productId,
        item.quantity,
        transaction
      );

      if (!validation.valid) {
        errors.push({
          productId: item.productId,
          error: validation.error!,
        });
      } else if (validation.product) {
        products.set(item.productId, validation.product);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      products,
    };
  }
}
```

**Refactorer orderService.ts :**

```typescript
// backend/src/services/orderService.ts
import { ProductValidationService } from './productValidationService';

// TROUVER et REMPLACER les validations de stock (lignes ~82-97, ~214-229)

// AVANT (à supprimer):
const product = await tx.product.findUnique({
  where: { id: item.productId },
  select: { id: true, name: true, stockQuantity: true, isActive: true }
});
if (!product || !product.isActive) {
  throw new Error(`Product ${item.productId} not found or inactive`);
}
if (product.stockQuantity < item.quantity) {
  throw new Error(`Insufficient stock for ${product.name}...`);
}

// APRÈS (nouveau code):
const validation = await ProductValidationService.validateProductsStock(
  data.items,
  tx
);

if (!validation.valid) {
  const errorMessages = validation.errors.map(e => e.error).join('; ');
  throw new Error(errorMessages);
}
```

**Refactorer cartService.ts :**

```typescript
// backend/src/services/cartService.ts
import { ProductValidationService } from './productValidationService';

// Trouver la validation de stock (lignes ~22-65)
// REMPLACER PAR:
const validation = await ProductValidationService.validateProductStock(
  item.productId,
  item.quantity
);

if (!validation.valid) {
  throw new Error(validation.error);
}

const product = validation.product!;
```

---

#### ✅ Tâche 2.2 : Versionner l'API (2h)

```typescript
// backend/src/server.ts

// AVANT:
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/services', servicesRoutes);

// APRÈS:
// API v1 (nouvelle version)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/services', servicesRoutes);

// Routes legacy (deprecated - à supprimer dans 6 mois)
app.use('/api/auth', (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Deprecated-Message', 'Use /api/v1/auth instead');
  next();
}, authRoutes);
// ... répéter pour toutes les routes
```

**Mettre à jour le frontend :**

```typescript
// frontend/src/services/apiClient.ts

// TROUVER baseURL
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// MODIFIER
const apiClient = axios.create({
  baseURL: `${baseURL}/api/v1`,  // ← Ajouter /v1
  withCredentials: true,
  timeout: 30000,
});
```

---

### 🔴 JOUR 2 - APRÈS-MIDI (4h)

#### ✅ Tâche 2.3 : Créer FormValidator (4h)

```typescript
// frontend/src/lib/validation.ts (NOUVEAU FICHIER)
export class FormValidator {
  /**
   * Valide un champ requis
   */
  static required(value: string, fieldName: string = 'Ce champ'): string | null {
    return value?.trim() ? null : `${fieldName} est requis.`;
  }

  /**
   * Valide un email
   */
  static email(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value)
      ? null
      : 'Veuillez entrer une adresse email valide.';
  }

  /**
   * Valide un téléphone algérien
   */
  static algerianPhone(value: string): string | null {
    const phoneRegex = /^(\+213|0)[567]\d{8}$/;
    const cleanPhone = value.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone)
      ? null
      : 'Veuillez entrer un numéro de téléphone algérien valide (ex: 0555123456).';
  }

  /**
   * Valide un mot de passe fort
   */
  static strongPassword(value: string): string | null {
    if (value.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
      return 'Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial.';
    }
    return null;
  }

  /**
   * Valide une longueur minimale
   */
  static minLength(min: number) {
    return (value: string): string | null => {
      return value.length >= min
        ? null
        : `Minimum ${min} caractères requis.`;
    };
  }

  /**
   * Valide plusieurs champs en batch
   */
  static validateFields(
    data: Record<string, any>,
    rules: Record<string, Array<(value: any) => string | null>>
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    Object.entries(rules).forEach(([field, validators]) => {
      const value = data[field];
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    });

    return errors;
  }
}
```

```typescript
// frontend/src/hooks/useFormValidation.ts (NOUVEAU FICHIER)
import { useState, useCallback } from 'react';
import { FormValidator } from '@/lib/validation';

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: Record<keyof T, Array<(value: any) => string | null>>
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(() => {
    setIsValidating(true);
    const newErrors = FormValidator.validateFields(data, validationRules);
    setErrors(newErrors);
    setIsValidating(false);
    return Object.keys(newErrors).length === 0;
  }, [data, validationRules]);

  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user types
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    data,
    errors,
    validate,
    updateField,
    setData,
    setErrors,
    reset,
    isValidating,
  };
}
```

**Refactorer CheckoutForm.tsx :**

```typescript
// frontend/src/components/checkout/CheckoutForm.tsx
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormValidator } from '@/lib/validation';

export function CheckoutForm() {
  const { data, errors, validate, updateField } = useFormValidation(
    {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      region: '',
      postalCode: '',
    },
    {
      firstName: [(v) => FormValidator.required(v, 'Prénom')],
      lastName: [(v) => FormValidator.required(v, 'Nom')],
      email: [
        (v) => FormValidator.required(v, 'Email'),
        FormValidator.email,
      ],
      phone: [
        (v) => FormValidator.required(v, 'Téléphone'),
        FormValidator.algerianPhone,
      ],
      street: [(v) => FormValidator.required(v, 'Adresse')],
      city: [(v) => FormValidator.required(v, 'Ville')],
      region: [(v) => FormValidator.required(v, 'Wilaya')],
      postalCode: [(v) => FormValidator.required(v, 'Code postal')],
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Submit logic...
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName">Prénom *</label>
        <input
          id="firstName"
          type="text"
          value={data.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          className={errors.firstName ? 'border-red-500' : ''}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
        )}
      </div>

      {/* Répéter pour tous les champs... */}
      
      <button type="submit">Valider</button>
    </form>
  );
}
```

---

### 🟡 JOUR 3-4 : Tests Critiques (2 jours)

#### ✅ Tâche 3.1 : Setup Jest et tests backend (1 jour)

```bash
cd backend

# Installer dépendances
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# Configuration Jest
npx ts-jest config:init
```

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
};
```

```typescript
// backend/tests/unit/productValidationService.test.ts
import { ProductValidationService } from '@/services/productValidationService';
import { prisma } from '@/lib/database';

jest.mock('@/lib/database', () => ({
  prisma: {
    product: {
      findUnique: jest.fn(),
    },
  },
}));

describe('ProductValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateProductStock', () => {
    it('should return valid for available product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        stockQuantity: 10,
        isActive: true,
        price: 100,
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await ProductValidationService.validateProductStock(
        'prod-1',
        5
      );

      expect(result.valid).toBe(true);
      expect(result.product).toEqual(mockProduct);
    });

    it('should return error for non-existent product', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await ProductValidationService.validateProductStock(
        'non-existent',
        5
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should return error for insufficient stock', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        stockQuantity: 3,
        isActive: true,
        price: 100,
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await ProductValidationService.validateProductStock(
        'prod-1',
        5
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient stock');
    });
  });
});
```

```json
// backend/package.json - Ajouter scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

#### ✅ Tâche 3.2 : Tests frontend (1 jour)

```bash
cd frontend

# Installer dépendances
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

```javascript
// frontend/jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

```typescript
// frontend/src/lib/__tests__/validation.test.ts
import { FormValidator } from '../validation';

describe('FormValidator', () => {
  describe('email', () => {
    it('should validate correct email', () => {
      expect(FormValidator.email('test@example.com')).toBeNull();
    });

    it('should reject invalid email', () => {
      expect(FormValidator.email('invalid')).not.toBeNull();
      expect(FormValidator.email('test@')).not.toBeNull();
    });
  });

  describe('algerianPhone', () => {
    it('should validate correct Algerian phone', () => {
      expect(FormValidator.algerianPhone('0555123456')).toBeNull();
      expect(FormValidator.algerianPhone('+213555123456')).toBeNull();
    });

    it('should reject invalid phone', () => {
      expect(FormValidator.algerianPhone('123')).not.toBeNull();
      expect(FormValidator.algerianPhone('0111111111')).not.toBeNull();
    });
  });
});
```

---

### 🟡 JOUR 5 : Health Checks & Monitoring (1 jour)

#### ✅ Tâche 5.1 : Health checks détaillés

```typescript
// backend/src/routes/health.ts - REMPLACER COMPLÈTEMENT
import express from 'express';
import { prisma } from '@/lib/database';
import { redisClient } from '@/config/redis';
import { logger } from '@/utils/logger';

const router = express.Router();

// Liveness probe - Le process est-il vivant?
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - Peut-il accepter du trafic?
router.get('/ready', async (req, res) => {
  const checks: Record<string, boolean> = {
    database: false,
    redis: false,
  };

  let allHealthy = true;

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    logger.error('Database health check failed', error);
    checks.database = false;
    allHealthy = false;
  }

  // Check Redis
  try {
    await redisClient.ping();
    checks.redis = true;
  } catch (error) {
    logger.error('Redis health check failed', error);
    checks.redis = false;
    allHealthy = false;
  }

  const status = allHealthy ? 200 : 503;

  res.status(status).json({
    status: allHealthy ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
  };

  res.json(metrics);
});

export default router;
```

#### ✅ Tâche 5.2 : Créer endpoint analytics/errors

```typescript
// backend/src/routes/analytics.ts - AJOUTER
router.post('/errors', async (req, res) => {
  const { message, error, stack, url, userAgent } = req.body;

  // Log avec Winston
  logger.error('Frontend error reported', {
    message,
    error,
    stack,
    url,
    userAgent,
    ip: req.ip,
    timestamp: new Date(),
  });

  // TODO: Envoyer vers Sentry si configuré
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(new Error(message), { extra: { stack, url } });
  // }

  res.status(200).json({ success: true });
});
```

---

## 📅 SEMAINE 2 - OPTIMISATIONS & POLISH

### 🟡 JOUR 6-7 : Optimisations Images & SEO (2 jours)

#### ✅ Tâche 6.1 : Optimisation images uploadées

```typescript
// backend/src/middleware/imageProcessing.ts (NOUVEAU)
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '@/utils/logger';

export const processUploadedImage = async (file: Express.Multer.File) => {
  const filename = path.parse(file.filename).name;
  const optimizedDir = path.join('uploads', 'optimized');
  const thumbnailDir = path.join('uploads', 'thumbnails');

  // Créer dossiers si nécessaires
  await fs.mkdir(optimizedDir, { recursive: true });
  await fs.mkdir(thumbnailDir, { recursive: true });

  const optimizedPath = path.join(optimizedDir, `${filename}.webp`);
  const thumbnailPath = path.join(thumbnailDir, `${filename}.webp`);

  try {
    // Optimiser original (max 1920px)
    await sharp(file.path)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(optimizedPath);

    // Générer thumbnail (300x300)
    await sharp(file.path)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    // Supprimer l'original
    await fs.unlink(file.path);

    logger.info('Image processed successfully', { filename });

    return {
      optimized: `/uploads/optimized/${filename}.webp`,
      thumbnail: `/uploads/thumbnails/${filename}.webp`,
    };
  } catch (error) {
    logger.error('Image processing failed', { error, filename });
    throw error;
  }
};

// Middleware Multer avec processing
export const uploadWithProcessing = multer({ dest: 'uploads/temp' });

export const processImages = async (req, res, next) => {
  if (!req.files && !req.file) return next();

  try {
    if (req.file) {
      const processed = await processUploadedImage(req.file);
      req.file.path = processed.optimized;
    }

    if (req.files && Array.isArray(req.files)) {
      const processedFiles = await Promise.all(
        req.files.map(processUploadedImage)
      );
      req.files = processedFiles.map((p, i) => ({
        ...req.files[i],
        path: p.optimized,
      }));
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

#### ✅ Tâche 6.2 : SEO metadata dynamiques

```typescript
// frontend/src/app/[locale]/products/[id]/page.tsx
import { Metadata } from 'next';
import { productService } from '@/services/productService';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await productService.getProductById(params.id);

  if (!product) {
    return {
      title: 'Produit non trouvé | MJ Chauffage',
    };
  }

  const description =
    product.shortDescription ||
    product.description.substring(0, 160) + '...';

  return {
    title: `${product.name} | MJ Chauffage`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: [
        {
          url: product.images[0]?.url || '/default-product.jpg',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [product.images[0]?.url || '/default-product.jpg'],
    },
  };
}
```

---

### 🟢 JOUR 8-9 : CI/CD & Documentation (2 jours)

#### ✅ Tâche 8.1 : GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test123
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test123@localhost:5432/test_db
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

### 🟢 JOUR 10 : Final Polish & Tests (1 jour)

#### ✅ Checklist finale

- [ ] Tous les console.log remplacés
- [ ] Vulnérabilités NPM corrigées
- [ ] Email service fonctionnel
- [ ] Tests coverage > 60%
- [ ] API versionnée (v1)
- [ ] Documentation README complète
- [ ] Health checks opérationnels
- [ ] CI/CD configuré
- [ ] .env.example créés
- [ ] Validation centralisée

---

## 📊 MÉTRIQUES DE SUCCÈS

### Avant corrections
- **Score global :** 78/100
- **Tests coverage :** < 5%
- **Console.log :** 93 occurrences
- **Vulnérabilités :** 6 moderate
- **Code dupliqué :** ~800 lignes

### Après corrections
- **Score global :** 84/100 ✅
- **Tests coverage :** > 60% ✅
- **Console.log :** 0 occurrences ✅
- **Vulnérabilités :** 0 ✅
- **Code dupliqué :** ~300 lignes ✅

---

## 🚀 COMMANDES UTILES

```bash
# Lancer tous les tests
npm test

# Coverage
npm run test:coverage

# Linter
npm run lint

# Type checking
npm run type-check

# Build production
npm run build

# Démarrer en dev
npm run dev

# Audit sécurité
npm audit

# Vérifier console.log restants
grep -rn "console\." src/ --exclude-dir=node_modules
```

---

**Document créé le :** 18 Octobre 2025  
**Durée estimée :** 10 jours ouvrables  
**Priorité :** 🔴 URGENT - Commencer immédiatement