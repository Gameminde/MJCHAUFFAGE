# Schéma de Base de Données - MJ Chauffage

## Vue d'ensemble

Le système MJ Chauffage utilise une base de données relationnelle avec **Prisma ORM** pour la gestion des données. Le schéma est conçu pour supporter un système e-commerce complet avec gestion des utilisateurs, produits, commandes, services et analytics.

**Base de données :**
- **Développement :** SQLite
- **Production :** PostgreSQL

---

## Enums (Types énumérés)

### UserRole
Rôles des utilisateurs dans le système.
```prisma
enum UserRole {
  ADMIN      // Administrateur système
  CUSTOMER   // Client
  TECHNICIAN // Technicien de service
}
```

### CustomerType
Types de clients pour la segmentation B2B/B2C.
```prisma
enum CustomerType {
  B2C // Business to Consumer (particuliers)
  B2B // Business to Business (entreprises)
}
```

### OrderStatus
États des commandes dans le cycle de vie.
```prisma
enum OrderStatus {
  PENDING    // En attente
  CONFIRMED  // Confirmée
  PROCESSING // En traitement
  SHIPPED    // Expédiée
  DELIVERED  // Livrée
  CANCELLED  // Annulée
  REFUNDED   // Remboursée
}
```

### PaymentStatus
États des paiements.
```prisma
enum PaymentStatus {
  PENDING    // En attente
  PROCESSING // En cours de traitement
  COMPLETED  // Terminé
  FAILED     // Échoué
  CANCELLED  // Annulé
  REFUNDED   // Remboursé
}
```

### ServiceStatus
États des demandes de service.
```prisma
enum ServiceStatus {
  PENDING     // En attente
  SCHEDULED   // Planifié
  IN_PROGRESS // En cours
  COMPLETED   // Terminé
  CANCELLED   // Annulé
}
```

---

## Tables Principales

### 1. Gestion des Utilisateurs

#### Table `users`
Table centrale pour tous les utilisateurs du système.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `email` | String (unique) | Adresse email |
| `firstName` | String | Prénom |
| `lastName` | String | Nom de famille |
| `password` | String? | Mot de passe hashé (optionnel pour OAuth) |
| `phone` | String? | Numéro de téléphone |
| `avatar` | String? | URL de l'avatar |
| `role` | UserRole | Rôle (défaut: CUSTOMER) |
| `isActive` | Boolean | Compte actif (défaut: true) |
| `isVerified` | Boolean | Email vérifié (défaut: false) |
| `emailVerified` | DateTime? | Date de vérification email |
| `lastLoginAt` | DateTime? | Dernière connexion |
| `googleId` | String? | ID Google OAuth |
| `twoFactorEnabled` | Boolean | 2FA activé |
| `twoFactorSecret` | String? | Secret 2FA |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

**Relations :**
- `customer` : Relation 1:1 avec Customer
- `technician` : Relation 1:1 avec Technician
- `sessions` : Relation 1:N avec UserSession
- `passwordResets` : Relation 1:N avec PasswordReset

#### Table `user_sessions`
Gestion des sessions utilisateur pour la sécurité.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `userId` | String | Référence vers User |
| `sessionToken` | String (unique) | Token de session |
| `ipAddress` | String? | Adresse IP |
| `userAgent` | String? | User Agent du navigateur |
| `expiresAt` | DateTime | Date d'expiration |
| `createdAt` | DateTime | Date de création |

#### Table `password_resets`
Gestion des réinitialisations de mot de passe.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `userId` | String | Référence vers User |
| `token` | String (unique) | Token de réinitialisation |
| `expiresAt` | DateTime | Date d'expiration |
| `usedAt` | DateTime? | Date d'utilisation |
| `createdAt` | DateTime | Date de création |

### 2. Gestion des Clients

#### Table `customers`
Informations détaillées des clients.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `userId` | String? | Référence vers User (null pour invités) |
| `companyName` | String? | Nom de l'entreprise (B2B) |
| `customerType` | CustomerType | Type de client (défaut: B2C) |
| `vatNumber` | String? | Numéro de TVA |
| `isGuest` | Boolean | Client invité |
| `firstName` | String? | Prénom (pour invités) |
| `lastName` | String? | Nom (pour invités) |
| `email` | String? | Email (pour invités) |
| `phone` | String? | Téléphone (pour invités) |
| `totalSpent` | Decimal | Montant total dépensé |
| `orderCount` | Int | Nombre de commandes |
| `lastOrderAt` | DateTime? | Dernière commande |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

**Relations :**
- `user` : Relation 1:1 avec User
- `addresses` : Relation 1:N avec Address
- `orders` : Relation 1:N avec Order
- `serviceRequests` : Relation 1:N avec ServiceRequest
- `reviews` : Relation 1:N avec Review
- `cartItems` : Relation 1:N avec CartItem

#### Table `addresses`
Adresses de facturation et de livraison.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `customerId` | String | Référence vers Customer |
| `type` | AddressType | Type d'adresse (BILLING/SHIPPING) |
| `label` | String? | Libellé ("Domicile", "Bureau") |
| `street` | String | Rue |
| `city` | String | Ville |
| `postalCode` | String | Code postal |
| `region` | String? | Région/État |
| `country` | String | Pays (défaut: "Algeria") |
| `isDefault` | Boolean | Adresse par défaut |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

### 3. Gestion des Produits

#### Table `categories`
Catégories de produits avec hiérarchie.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `name` | String (unique) | Nom de la catégorie |
| `slug` | String (unique) | Slug URL |
| `description` | String? | Description |
| `image` | String? | Image de la catégorie |
| `parentId` | String? | Catégorie parent |
| `isActive` | Boolean | Catégorie active |
| `sortOrder` | Int | Ordre d'affichage |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

**Relations :**
- `parent` : Relation auto-référentielle vers Category
- `children` : Relation 1:N vers Category
- `products` : Relation 1:N vers Product

#### Table `products`
Catalogue des produits.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `name` | String | Nom du produit |
| `slug` | String (unique) | Slug URL |
| `sku` | String (unique) | Code produit |
| `description` | String? | Description complète |
| `shortDescription` | String? | Description courte |
| `categoryId` | String | Référence vers Category |
| `manufacturerId` | String? | Référence vers Manufacturer |
| `price` | Decimal | Prix de vente |
| `costPrice` | Decimal? | Prix de revient |
| `salePrice` | Decimal? | Prix en promotion |
| `stockQuantity` | Int | Quantité en stock |
| `minStock` | Int | Stock minimum |
| `maxStock` | Int? | Stock maximum |
| `weight` | Decimal? | Poids |
| `dimensions` | Json? | Dimensions (L×l×h) |
| `specifications` | Json? | Spécifications techniques |
| `features` | String? | Caractéristiques |
| `isActive` | Boolean | Produit actif |
| `isFeatured` | Boolean | Produit mis en avant |
| `isDigital` | Boolean | Produit numérique |
| `metaTitle` | String? | Titre SEO |
| `metaDescription` | String? | Description SEO |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

**Relations :**
- `category` : Relation N:1 vers Category
- `manufacturer` : Relation N:1 vers Manufacturer
- `images` : Relation 1:N vers ProductImage
- `orderItems` : Relation 1:N vers OrderItem
- `reviews` : Relation 1:N vers Review
- `inventoryLogs` : Relation 1:N vers InventoryLog

#### Table `product_images`
Images des produits.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `productId` | String | Référence vers Product |
| `url` | String | URL de l'image |
| `altText` | String? | Texte alternatif |
| `sortOrder` | Int | Ordre d'affichage |
| `createdAt` | DateTime | Date de création |

#### Table `manufacturers`
Fabricants des produits.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `name` | String (unique) | Nom du fabricant |
| `slug` | String (unique) | Slug URL |
| `description` | String? | Description |
| `website` | String? | Site web |
| `logo` | String? | Logo |
| `isActive` | Boolean | Fabricant actif |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

### 4. Gestion des Commandes

#### Table `orders`
Commandes clients.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `orderNumber` | String (unique) | Numéro de commande |
| `customerId` | String | Référence vers Customer |
| `addressId` | String | Adresse de livraison |
| `status` | OrderStatus | État de la commande |
| `paymentStatus` | PaymentStatus | État du paiement |
| `subtotal` | Decimal | Sous-total |
| `taxAmount` | Decimal | Montant des taxes |
| `shippingAmount` | Decimal | Frais de livraison |
| `discountAmount` | Decimal | Montant de remise |
| `totalAmount` | Decimal | Montant total |
| `notes` | String? | Notes de commande |
| `trackingNumber` | String? | Numéro de suivi |
| `shippingCarrier` | String? | Transporteur |
| `orderDate` | DateTime | Date de commande |
| `shippedAt` | DateTime? | Date d'expédition |
| `deliveredAt` | DateTime? | Date de livraison |
| `estimatedDelivery` | DateTime? | Livraison estimée |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

**Relations :**
- `customer` : Relation N:1 vers Customer
- `shippingAddress` : Relation N:1 vers Address
- `items` : Relation 1:N vers OrderItem
- `payments` : Relation 1:N vers Payment

#### Table `order_items`
Articles des commandes.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `orderId` | String | Référence vers Order |
| `productId` | String | Référence vers Product |
| `quantity` | Int | Quantité commandée |
| `unitPrice` | Decimal | Prix unitaire |
| `totalPrice` | Decimal | Prix total |

#### Table `payments`
Paiements des commandes.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `orderId` | String | Référence vers Order |
| `method` | PaymentMethod | Méthode de paiement |
| `provider` | String | Fournisseur (Stripe, PayPal) |
| `providerPaymentId` | String? | ID du paiement chez le fournisseur |
| `amount` | Decimal | Montant |
| `currency` | String | Devise (défaut: "DZD") |
| `status` | PaymentStatus | État du paiement |
| `paidAt` | DateTime? | Date de paiement |
| `failureReason` | String? | Raison de l'échec |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

### 5. Gestion des Services

#### Table `service_types`
Types de services proposés.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `name` | String (unique) | Nom du service |
| `description` | String? | Description |
| `duration` | Int | Durée en minutes |
| `price` | Decimal | Prix du service |
| `isActive` | Boolean | Service actif |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

#### Table `technicians`
Techniciens de service.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `userId` | String | Référence vers User |
| `employeeId` | String (unique) | ID employé |
| `specialties` | String? | Spécialités (JSON) |
| `isActive` | Boolean | Technicien actif |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

#### Table `service_requests`
Demandes de service client.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `customerId` | String | Référence vers Customer |
| `serviceTypeId` | String | Référence vers ServiceType |
| `technicianId` | String? | Référence vers Technician |
| `description` | String | Description du problème |
| `priority` | ServicePriority | Priorité |
| `status` | ServiceStatus | État de la demande |
| `requestedDate` | DateTime | Date demandée |
| `scheduledDate` | DateTime? | Date planifiée |
| `completedAt` | DateTime? | Date de completion |
| `equipmentDetails` | Json? | Détails équipement |
| `completionNotes` | String? | Notes de completion |
| `customerRating` | Int? | Note client (1-5) |
| `customerFeedback` | String? | Commentaire client |
| `estimatedCost` | Decimal? | Coût estimé |
| `actualCost` | Decimal? | Coût réel |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

### 6. Système d'Avis

#### Table `reviews`
Avis clients sur les produits.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `customerId` | String | Référence vers Customer |
| `productId` | String | Référence vers Product |
| `rating` | Int | Note (1-5 étoiles) |
| `title` | String? | Titre de l'avis |
| `comment` | String? | Commentaire |
| `isVerified` | Boolean | Avis vérifié |
| `isPublished` | Boolean | Avis publié |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

**Contrainte :** Un client ne peut laisser qu'un avis par produit.

### 7. Panier d'Achat

#### Table `cart_items`
Articles dans le panier client.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `customerId` | String | Référence vers Customer |
| `productId` | String | Référence vers Product |
| `quantity` | Int | Quantité |
| `createdAt` | DateTime | Date d'ajout |
| `updatedAt` | DateTime | Dernière modification |

**Contrainte :** Un produit ne peut être qu'une fois dans le panier d'un client.

### 8. Gestion des Stocks

#### Table `inventory_logs`
Historique des mouvements de stock.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `productId` | String | Référence vers Product |
| `type` | InventoryLogType | Type de mouvement |
| `quantity` | Int | Quantité |
| `reason` | String? | Raison du mouvement |
| `reference` | String? | Référence (ID commande, etc.) |
| `oldQuantity` | Int | Ancienne quantité |
| `newQuantity` | Int | Nouvelle quantité |
| `createdAt` | DateTime | Date du mouvement |

---

## Tables d'Analytics

### Table `page_analytics`
Suivi des visites de pages.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `sessionId` | String | ID de session |
| `userId` | String? | Référence vers User |
| `pagePath` | String | Chemin de la page |
| `pageTitle` | String? | Titre de la page |
| `referrer` | String? | Page de référence |
| `userAgent` | String? | User Agent |
| `deviceType` | String? | Type d'appareil |
| `browser` | String? | Navigateur |
| `os` | String? | Système d'exploitation |
| `country` | String? | Pays |
| `city` | String? | Ville |
| `durationSeconds` | Int? | Durée en secondes |
| `bounce` | Boolean | Rebond |
| `createdAt` | DateTime | Date de visite |

### Table `ecommerce_events`
Événements e-commerce pour le suivi des conversions.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `sessionId` | String | ID de session |
| `userId` | String? | Référence vers User |
| `eventType` | String | Type d'événement |
| `productId` | String? | Référence vers Product |
| `categoryId` | String? | Référence vers Category |
| `value` | Decimal? | Valeur |
| `currency` | String | Devise |
| `quantity` | Int? | Quantité |
| `metadata` | Json? | Métadonnées |
| `createdAt` | DateTime | Date de l'événement |

### Table `performance_metrics`
Métriques de performance du site.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Identifiant unique |
| `sessionId` | String | ID de session |
| `pagePath` | String | Chemin de la page |
| `metricType` | String | Type de métrique (LCP, FID, CLS, TTFB) |
| `value` | Decimal | Valeur |
| `unit` | String | Unité (ms, score, bytes) |
| `deviceType` | String? | Type d'appareil |
| `connection` | String? | Type de connexion |
| `createdAt` | DateTime | Date de mesure |

---

## Relations Principales

### Diagramme des Relations

```
User (1) ←→ (0..1) Customer
Customer (1) ←→ (0..N) Address
Customer (1) ←→ (0..N) Order
Order (1) ←→ (1..N) OrderItem
OrderItem (N) ←→ (1) Product
Product (N) ←→ (1) Category
Category (0..1) ←→ (0..N) Category (hiérarchie)
Customer (1) ←→ (0..N) ServiceRequest
ServiceRequest (N) ←→ (1) ServiceType
ServiceRequest (N) ←→ (0..1) Technician
Technician (1) ←→ (1) User
```

### Relations Critiques

1. **User ↔ Customer** : Relation 1:1 optionnelle (clients invités)
2. **Order ↔ Customer** : Relation N:1 obligatoire
3. **Product ↔ Category** : Relation N:1 obligatoire
4. **ServiceRequest ↔ Customer** : Relation N:1 obligatoire

---

## Index et Performance

### Index Recommandés

```sql
-- Index pour les recherches fréquentes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_page_analytics_session ON page_analytics(session_id);
CREATE INDEX idx_ecommerce_events_type ON ecommerce_events(event_type);

-- Index composites pour les requêtes complexes
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
```

### Optimisations

1. **Pagination** : Utilisation de `LIMIT` et `OFFSET`
2. **Cache** : Table `cache_entries` pour les requêtes coûteuses
3. **Soft Delete** : Utilisation de `isActive` au lieu de suppression
4. **Dénormalisation** : Champs calculés (`totalSpent`, `orderCount`)

---

## Migrations et Évolution

### Stratégie de Migration

1. **Développement** : Migrations automatiques avec Prisma
2. **Production** : Migrations manuelles avec validation
3. **Rollback** : Scripts de retour en arrière pour chaque migration

### Évolutions Prévues

1. **Multi-tenant** : Ajout d'un champ `tenantId`
2. **Internationalisation** : Tables de traduction
3. **Audit Trail** : Historique des modifications
4. **Archivage** : Tables d'archivage pour les anciennes données

---

## Sécurité des Données

### Chiffrement

- **Mots de passe** : Hashage avec bcrypt
- **Données sensibles** : Chiffrement AES-256
- **Tokens** : JWT avec expiration

### Conformité

- **RGPD** : Champs pour le consentement et la suppression
- **Audit** : Logs des accès aux données personnelles
- **Anonymisation** : Procédures de suppression des données

---

## Maintenance

### Tâches Régulières

1. **Nettoyage** : Suppression des sessions expirées
2. **Archivage** : Déplacement des anciennes commandes
3. **Optimisation** : Réindexation et analyse des performances
4. **Sauvegarde** : Sauvegardes quotidiennes avec rétention

### Monitoring

- **Taille des tables** : Surveillance de la croissance
- **Performance des requêtes** : Identification des requêtes lentes
- **Intégrité** : Vérification des contraintes référentielles

---

**Version du schéma :** 1.0.0  
**Dernière mise à jour :** Janvier 2024  
**ORM :** Prisma 5.x  
**Base de données :** SQLite (dev) / PostgreSQL (prod)## SQLite Schema Additions (Dev/Test)

The SQLite schema (`backend/prisma/schema-sqlite.prisma`) now includes:

- Analytics & Tracking
  - `PageAnalytics` — page path/title, referrer, UA, device, geo, duration
  - `EcommerceEvent` — event type, product/category, value/currency, qty, metadata
  - `TrafficSource` — source/medium/campaign and UTM fields
  - `AnalyticsSession` — session identity, device/geo, timestamps

- Reliability & Caching
  - `CacheEntry` — key/value with TTL (`expiresAt`)
  - `ErrorLog` — level, message, stack, user/session context, metadata

- Commerce
  - `CartItem` — customer/product link and quantity

- Relationships
  - `User` ↔ analytics/events/error logs/sessions
  - `Customer` ↔ cart items
  - `Product` / `Category` ↔ ecommerce events & cart items

Use `db push` + `generate` to sync and typegen with Prisma Client.
