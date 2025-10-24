# 🔧 Guide Correction Erreurs Backend - MJ CHAUFFAGE

**Date:** 18 Octobre 2025  
**Status:** Backend ne compile pas - 20 erreurs TypeScript

---

## ✅ Correctons Déjà Appliquées

1. ✅ **tsconfig.json** - Retiré exclusion de `emailService.ts`
2. ✅ **logger.ts** - Ajouté exports `logger` et `healthLogger`
3. ✅ **ProductValidationService** - Corrigé imports prisma et AppError

---

## 🔴 Erreurs Restantes (20)

### 1. ProductValidationService - Méthodes Non-Statiques

**Erreurs:**
```
src/services/orderService.ts:85:38 - Property 'validateProductStock' does not exist on type 'typeof ProductValidationService'
src/services/orderService.ts:133:38 - Property 'reserveStock' does not exist on type 'typeof ProductValidationService'
```

**Solution:** Dans `productValidationService.ts`, ajouter `static` devant les méthodes :
```typescript
static async validateProductStock(...) { ... }
static async reserveStock(...) { ... }
```

**OU** utiliser l'instance singleton dans `orderService.ts` :
```typescript
// Remplacer :
await ProductValidationService.validateProductStock(...)

// Par:
await productValidationService.validateProductStock(...)
```

---

### 2. orderService - Prisma Include OrderItems

**Erreurs:**
```
src/services/orderService.ts:632:11 - 'orderItems' does not exist in type 'OrderInclude<DefaultArgs>'
src/services/orderService.ts:653:31 - Property 'orderItems' does not exist
```

**Cause:** Le schéma Prisma utilise `OrderItem` (singulier) ou un autre nom de relation.

**Solution:** Vérifier `schema.prisma` pour le nom correct de la relation :
```prisma
model Order {
  id String @id
  // ...
  items OrderItem[]  // ← Nom de la relation ici
}
```

Si c'est `items`, changer dans `orderService.ts` ligne 632 :
```typescript
// De :
orderItems: { include: { product: { select: { name: true } } } }

// À :
items: { include: { product: { select: { name: true } } } }
```

Et ligne 653 :
```typescript
// De :
items: orderWithItems.orderItems.map(...)

// À :
items: orderWithItems.items.map(...)
```

---

### 3. orderService - Prisma Include ShippingAddress

**Erreurs:**
```
src/services/orderService.ts:663:34 - Property 'shippingAddress' does not exist
```

**Cause:** La relation dans Prisma s'appelle peut-être `address` au lieu de `shippingAddress`.

**Solution:** Vérifier `schema.prisma` :
```prisma
model Order {
  id String @id
  addressId String
  address Address @relation(fields: [addressId], references: [id])  // ← Nom ici
}
```

Si c'est `address`, changer dans `orderService.ts` ligne 632 :
```typescript
// De :
shippingAddress: true

// À :
address: true
```

Et lignes 663-667 :
```typescript
// De :
shippingAddress: {
  street: orderWithItems.shippingAddress.street,
  ...
}

// À :
shippingAddress: {
  street: orderWithItems.address.street,
  ...
}
```

---

### 4. config/email.ts - Nullable Transporter

**Erreurs:**
```
src/config/email.ts:57:5 - Type 'Transporter | null' is not assignable to type 'Transporter'
src/config/email.ts:87:5 - Type 'Transporter | null' is not assignable to type 'Transporter'
```

**Solution:** Ajouter assertion non-null ou gérer le null :
```typescript
// Option 1: Assertion non-null
return transporter!;

// Option 2: Throw error si null
if (!transporter) {
  throw new Error('Transporter not initialized');
}
return transporter;
```

---

### 5. routes/health.ts - Method logHealthCheck Missing

**Erreurs:**
```
src/routes/health.ts:159:18 - Property 'logHealthCheck' does not exist on type 'Logger'
```

**Solution:** Utiliser la méthode `info` standard du logger :
```typescript
// De :
healthLogger.logHealthCheck(...)

// À :
healthLogger.info('Health check:', ...)
```

---

### 6. Warnings Mineurs

**apiVersioning.ts** - Variable `req` non utilisée :
```typescript
// Ajouter underscore si non utilisé
return (_req: Request, res: Response, next: NextFunction) => {
```

**emailService.ts** - Variable `oldStatus` non utilisée :
```typescript
// Retirer ou ajouter underscore
_oldStatus: string,
```

---

## 🚀 Plan d'Action Rapide

### Étape 1: Corriger ProductValidationService (2 min)
```bash
# Ouvrir productValidationService.ts
# Ajouter 'static' devant validateProductStock, reserveStock
```

### Étape 2: Vérifier Schema Prisma (1 min)
```bash
cd backend
cat prisma/schema.prisma | grep -A 10 "model Order"
```

### Étape 3: Corriger orderService.ts (3 min)
```typescript
// Ajuster noms relations selon schema
```

### Étape 4: Corriger config/email.ts (1 min)
```typescript
// Ajouter ! ou check null
```

### Étape 5: Corriger routes/health.ts (1 min)
```typescript
// Utiliser logger.info
```

### Étape 6: Recompiler (1 min)
```bash
npm run build
```

**Temps Total Estimé:** 10 minutes ⏱️

---

## 📝 Scripts de Correction Automatique

### Script 1: Ajouter static aux méthodes
```bash
# Dans productValidationService.ts
sed -i 's/async validateProductStock/static async validateProductStock/g' src/services/productValidationService.ts
sed -i 's/async reserveStock/static async reserveStock/g' src/services/productValidationService.ts
```

### Script 2: Corriger health logger
```bash
sed -i 's/healthLogger.logHealthCheck/healthLogger.info/g' src/routes/health.ts
```

---

## ✅ Quand Toutes Erreurs Corrigées

Le backend devrait compiler sans erreurs et être prêt à démarrer :

```bash
npm run build  # 0 erreurs
npm run dev    # Backend démarre sur port 3001
```

---

**Note:** Les corrections simples peuvent être faites manuellement en < 10 minutes.

