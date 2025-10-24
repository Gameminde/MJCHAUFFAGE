# Documentation API - MJ Chauffage

## Vue d'ensemble

L'API MJ Chauffage est une API RESTful qui fournit des endpoints pour la gestion d'un système de chauffage e-commerce avec authentification, gestion des produits, commandes, clients et services.

**URL de base :** `http://localhost:3001/api`

## Authentification

L'API utilise l'authentification JWT (JSON Web Token). Pour accéder aux endpoints protégés, incluez le token dans l'en-tête Authorization :

```
Authorization: Bearer <votre_token_jwt>
```

### Endpoints d'authentification

#### POST /api/auth/register
Inscription d'un nouvel utilisateur.

**Corps de la requête :**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "companyName": "Entreprise SA", // optionnel
  "customerType": "B2B" // B2B ou B2C, optionnel
}
```

**Réponses :**
- `201` : Utilisateur créé avec succès
- `400` : Erreur de validation
- `409` : Utilisateur déjà existant

#### POST /api/auth/login
Connexion utilisateur.

**Corps de la requête :**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponses :**
- `200` : Connexion réussie (retourne le token JWT)
- `401` : Identifiants invalides

#### POST /api/auth/refresh
Renouvellement du token d'accès.

**Corps de la requête :**
```json
{
  "refreshToken": "votre_refresh_token"
}
```

**Réponses :**
- `200` : Token renouvelé avec succès
- `401` : Token de renouvellement invalide

#### POST /api/auth/logout
Déconnexion utilisateur.

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Déconnexion réussie

#### GET /api/auth/me
Obtenir les informations de l'utilisateur connecté.

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Informations utilisateur
- `401` : Token invalide

---

## Gestion des produits

### GET /api/products
Récupérer la liste des produits avec filtrage et pagination.

**Paramètres de requête :**
- `page` (integer) : Numéro de page (défaut: 1)
- `limit` (integer) : Nombre d'éléments par page (défaut: 20)
- `search` (string) : Recherche textuelle
- `category` (string) : Filtrer par catégorie
- `manufacturer` (string) : Filtrer par fabricant
- `minPrice` (number) : Prix minimum
- `maxPrice` (number) : Prix maximum
- `inStock` (boolean) : Produits en stock uniquement

**Réponse :**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### GET /api/products/:id
Récupérer un produit spécifique.

**Paramètres :**
- `id` (string) : ID du produit

**Réponses :**
- `200` : Détails du produit
- `404` : Produit non trouvé

### POST /api/products
Créer un nouveau produit (Admin uniquement).

**En-têtes requis :** `Authorization: Bearer <token>`

**Corps de la requête :**
```json
{
  "name": "Chaudière Gaz Premium",
  "slug": "chaudiere-gaz-premium",
  "sku": "CHG-001",
  "categoryId": "uuid-category",
  "price": 1299.99,
  "stockQuantity": 10,
  "description": "Description détaillée...",
  "specifications": {
    "power": "24kW",
    "efficiency": "92%"
  }
}
```

**Réponses :**
- `201` : Produit créé avec succès
- `400` : Erreur de validation
- `401` : Non autorisé
- `403` : Accès refusé (non admin)

### PUT /api/products/:id
Mettre à jour un produit (Admin uniquement).

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Produit mis à jour
- `404` : Produit non trouvé
- `401` : Non autorisé

### DELETE /api/products/:id
Supprimer un produit (Admin uniquement).

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `204` : Produit supprimé
- `404` : Produit non trouvé
- `401` : Non autorisé

---

## Gestion des commandes

### GET /api/orders
Récupérer les commandes (utilisateur connecté ou admin).

**En-têtes requis :** `Authorization: Bearer <token>`

**Paramètres de requête :**
- `page` (integer) : Numéro de page
- `limit` (integer) : Nombre d'éléments par page
- `status` (string) : Filtrer par statut

**Réponses :**
- `200` : Liste des commandes
- `401` : Non autorisé

### GET /api/orders/:id
Récupérer une commande spécifique.

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Détails de la commande
- `404` : Commande non trouvée
- `401` : Non autorisé

### POST /api/orders
Créer une nouvelle commande.

**En-têtes requis :** `Authorization: Bearer <token>`

**Corps de la requête :**
```json
{
  "items": [
    {
      "productId": "uuid-product",
      "quantity": 2,
      "unitPrice": 1299.99
    }
  ],
  "shippingAddress": {
    "street": "123 Rue de la Paix",
    "city": "Alger",
    "postalCode": "16000",
    "country": "Algérie"
  },
  "subtotal": 2599.98,
  "totalAmount": 2599.98
}
```

**Réponses :**
- `201` : Commande créée avec succès
- `400` : Erreur de validation
- `401` : Non autorisé

### POST /api/orders/guest
Créer une commande en tant qu'invité.

**Corps de la requête :**
```json
{
  "items": [...],
  "customerInfo": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "phone": "+213123456789"
  },
  "shippingAddress": {...},
  "subtotal": 2599.98,
  "totalAmount": 2599.98
}
```

**Réponses :**
- `201` : Commande créée avec succès
- `400` : Erreur de validation

---

## Gestion des clients

### GET /api/customers
Récupérer la liste des clients (Admin uniquement).

**En-têtes requis :** `Authorization: Bearer <token>`

**Paramètres de requête :**
- `page` (integer) : Numéro de page
- `limit` (integer) : Nombre d'éléments par page
- `search` (string) : Recherche par nom/email
- `customerType` (string) : B2B ou B2C

**Réponses :**
- `200` : Liste des clients
- `401` : Non autorisé
- `403` : Accès refusé

### GET /api/customers/statistics
Obtenir les statistiques des clients (Admin uniquement).

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Statistiques des clients
- `401` : Non autorisé

### GET /api/customers/:id
Récupérer un client spécifique (Admin uniquement).

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Détails du client
- `404` : Client non trouvé
- `401` : Non autorisé

### GET /api/customers/profile/me
Récupérer le profil du client connecté.

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Profil du client
- `401` : Non autorisé

### PUT /api/customers/profile/me
Mettre à jour le profil du client connecté.

**En-têtes requis :** `Authorization: Bearer <token>`

**Corps de la requête :**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+213123456789",
  "companyName": "Entreprise SA"
}
```

**Réponses :**
- `200` : Profil mis à jour
- `400` : Erreur de validation
- `401` : Non autorisé

### GET /api/customers/orders/history
Récupérer l'historique des commandes du client connecté.

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Historique des commandes
- `401` : Non autorisé

### POST /api/customers/addresses
Ajouter une adresse au profil client.

**En-têtes requis :** `Authorization: Bearer <token>`

**Corps de la requête :**
```json
{
  "type": "SHIPPING", // BILLING ou SHIPPING
  "street": "123 Rue de la Paix",
  "city": "Alger",
  "postalCode": "16000",
  "country": "Algérie",
  "label": "Domicile" // optionnel
}
```

**Réponses :**
- `201` : Adresse ajoutée
- `400` : Erreur de validation
- `401` : Non autorisé

---

## Gestion des services

### GET /api/services/types
Récupérer les types de services disponibles (public).

**Réponses :**
- `200` : Liste des types de services

### GET /api/services/types/:id
Récupérer un type de service spécifique (public).

**Réponses :**
- `200` : Détails du type de service
- `404` : Type de service non trouvé

### POST /api/services/requests
Créer une demande de service.

**En-têtes requis :** `Authorization: Bearer <token>`

**Corps de la requête :**
```json
{
  "serviceTypeId": "uuid-service-type",
  "description": "Description du problème...",
  "requestedDate": "2024-01-15T10:00:00Z",
  "priority": "NORMAL", // LOW, NORMAL, HIGH, URGENT
  "estimatedCost": 150.00 // optionnel
}
```

**Réponses :**
- `201` : Demande de service créée
- `400` : Erreur de validation
- `401` : Non autorisé

### GET /api/services/requests
Récupérer les demandes de service du client connecté.

**En-têtes requis :** `Authorization: Bearer <token>`

**Paramètres de requête :**
- `page` (integer) : Numéro de page
- `limit` (integer) : Nombre d'éléments par page
- `status` (string) : Filtrer par statut

**Réponses :**
- `200` : Liste des demandes de service
- `401` : Non autorisé

### GET /api/services/requests/:id
Récupérer une demande de service spécifique.

**En-têtes requis :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : Détails de la demande de service
- `404` : Demande non trouvée
- `401` : Non autorisé

### POST /api/services/requests/:id/feedback
Ajouter un commentaire/évaluation à une demande de service.

**En-têtes requis :** `Authorization: Bearer <token>`

**Corps de la requête :**
```json
{
  "rating": 5, // 1-5 étoiles
  "feedback": "Service excellent, technicien très professionnel."
}
```

**Réponses :**
- `201` : Commentaire ajouté
- `400` : Erreur de validation
- `401` : Non autorisé

### PUT /api/services/requests/:id/status
Mettre à jour le statut d'une demande de service (Technicien/Admin uniquement).

**En-têtes requis :** `Authorization: Bearer <token>`

**Corps de la requête :**
```json
{
  "status": "IN_PROGRESS", // PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  "technicianId": "uuid-technician", // optionnel
  "scheduledDate": "2024-01-15T14:00:00Z", // optionnel
  "actualCost": 175.00 // optionnel
}
```

**Réponses :**
- `200` : Statut mis à jour
- `400` : Erreur de validation
- `401` : Non autorisé
- `403` : Accès refusé

---

## Endpoints Frontend

### GET /api/geolocation
Obtenir les informations de géolocalisation basées sur l'IP.

**Réponses :**
- `200` : Données de géolocalisation
```json
{
  "country": "Algeria",
  "city": "Algiers",
  "region": "Algiers",
  "timezone": "Africa/Algiers",
  "currency": "DZD",
  "ip": "xxx.xxx.xxx.xxx"
}
```

### POST /api/analytics/performance
Collecter les métriques de performance du frontend.

**Corps de la requête :**
```json
{
  "lcp": 1200, // Largest Contentful Paint
  "fid": 50,   // First Input Delay
  "cls": 0.1,  // Cumulative Layout Shift
  "ttfb": 300  // Time to First Byte
}
```

**Réponses :**
- `200` : Métriques enregistrées
- `400` : Données invalides

---

## Codes d'erreur

### Codes de statut HTTP

- `200` : Succès
- `201` : Créé avec succès
- `204` : Supprimé avec succès
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Accès refusé
- `404` : Ressource non trouvée
- `409` : Conflit (ressource déjà existante)
- `422` : Erreur de validation
- `429` : Trop de requêtes (rate limiting)
- `500` : Erreur serveur interne

### Format des erreurs

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "email",
        "message": "L'email est requis"
      }
    ]
  }
}
```

---

## Rate Limiting

L'API implémente plusieurs niveaux de limitation de débit :

- **Authentification** : 5 tentatives par minute par IP
- **API générale** : 100 requêtes par minute par IP
- **Admin** : 200 requêtes par minute par IP
- **Strict** : 10 requêtes par minute pour les endpoints sensibles

---

## Sécurité

### Mesures de sécurité implémentées

1. **Authentification JWT** avec tokens d'accès et de renouvellement
2. **Validation des entrées** avec express-validator
3. **Rate limiting** pour prévenir les attaques par déni de service
4. **CORS** configuré pour les domaines autorisés
5. **Helmet** pour les en-têtes de sécurité
6. **Sanitisation** des données d'entrée
7. **Chiffrement des mots de passe** avec bcrypt

### En-têtes de sécurité

L'API inclut automatiquement les en-têtes de sécurité suivants :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (en production)

---

## Environnements

### Développement
- **URL** : `http://localhost:3001/api`
- **Base de données** : SQLite (développement)

### Production
- **URL** : `https://api.mjchauffage.com/api`
- **Base de données** : PostgreSQL
- **HTTPS** : Obligatoire
- **Monitoring** : Prometheus + Grafana

---

## Support

Pour toute question ou problème avec l'API :

1. Consultez d'abord le [Guide de dépannage](./TROUBLESHOOTING.md)
2. Vérifiez les logs du serveur
3. Contactez l'équipe de développement

**Version de l'API :** 1.0.0  
**Dernière mise à jour :** Janvier 2024