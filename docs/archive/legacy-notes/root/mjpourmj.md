Parfait, j’ai lu ton audit : il est très clair et sévère — et il a raison. Le projet **n’est pas déployable** en l’état pour des raisons de sécurité et de complétude (mots de passe exposés, JWT dans `localStorage`, fonctionnalités e‑commerce manquantes, pages/tests visibles, etc.). Je m’appuie dessous sur l’audit et sur les meilleures pratiques actuelles pour te livrer : **un plan de sauvetage priorisé**, **une architecture cible** (sécurité, paiements Algérie, rendez‑vous), **des extraits de code prêts à coller**, et **une check‑list “go‑live”**. 

---

## 0) Vision fonctionnelle — comment le site doit fonctionner

**A. Boutique pièces de chaudière (B2C)**

1. Catalogue → 2) Fiche produit (prix, stock, variantes) → 3) Panier → 4) Checkout
   Options de paiement en Algérie (voir § 3) → 5) Confirmation + facture → 6) Suivi de commande (statuts : `PENDING`, `PAID`, `SHIPPED`, `CANCELLED`).
   Gestion stock en temps réel (verrouillage au paiement), avoirs/remboursements, e‑mails signés DKIM/SPF/DMARC.

**B. Prise de rendez‑vous “Dépannage chaudière”**

1. Choix zone + type de panne → 2) Créneaux disponibles par technicien/zone → 3) Réservation (SMS/e‑mail) → 4) Back‑office planification/affectation → 5) ICS export (client/tech).
   Éviter les doubles réservations par **contrainte unique** + **transaction** (cf. extrait code § 5.6). ICS conforme RFC 5545 pour ajout simple au calendrier client. ([RFC Editor][1])

**C. Admin (RBAC)**

* Rôles `admin`, `manager`, `technician`, `customer`.
* CRUD produits / stocks / commandes / rendez‑vous, analytics privacy‑friendly, logs sécurité, gestion des retours.

---

## 1) Plan de sauvetage priorisé (J0 → J+14)

### 🔴 J0–J2 — Secrets & hygiène sécurité (bloquant)

* **Retirer les secrets du code** (`docker-compose.yml`) et passer par `.env` (non versionné) / **Docker Compose secrets** en prod. ([Docker Documentation][2])
* **Changer tous les mots de passe** (DB, admin test). 
* **Headers de sécurité & CSP** (Helmet + CSP strict) dès le backend. ([helmetjs.github.io][3])

### 🔴 J2–J4 — Authentification correcte

* **Plus de JWT dans `localStorage`**. Utiliser **cookies `HttpOnly` + `Secure` + `SameSite=Strict`** pour `refresh_token` + **access‑token en mémoire**. CSRF : “double submit cookie” + header `X-CSRF-Token`. ([MDN Web Docs][4])
* **Rotation du refresh‑token** et stockage **haché** côté DB. ([OWASP][5])

### 🔴 J4–J7 — Fonctionnalités e‑commerce minimales

* **Panier, commande, paiement** (voir § 3) + statuts commande.
* **E‑mails transactionnels** (SPF/DKIM/DMARC) pour reçus/notifications. ([Microsoft Learn][6])

### 🟠 J6–J9 — Rendez‑vous et anti double‑booking

* Modèle `Appointment` + contraintes DB + export ICS. ([RFC Editor][1])

### 🟠 J8–J11 — Durcissement & observabilité

* **Rate‑limit** global + endpoints sensibles; **CORS strict**; logs et traçage (Sentry/OTel). ([npm][7])
* Nettoyage **données/pagers de test** + suppression des `console.log` en prod. 

### 🟡 J10–J14 — QA, perf & déploiement

* **Tests** unitaires + e2e (parcours achat + prise RDV).
* Optimisation Next.js (images, code‑splitting), connexion Prisma sécurisée (TLS/CA), pool/pgBouncer si besoin. ([Prisma][8])
* **Backups** PostgreSQL (PITR) + règle **3‑2‑1**. ([PostgreSQL][9])

> **Critère “Go/No‑Go”** : aucune fuite de secret, audit XSS/CSRF basique OK, paiement réel SATIM/BaridPay OK en bac à sable, tests e2e verts, sauvegardes testées.

---

## 2) Architecture cible (sécurisée & simple)

```
[Next.js (App Router)] --(SSR/CSR)--> Frontend
    |  cookies HttpOnly (refresh), in‑memory access token
    v
[API Gateway/Express]
    - Auth (JWT court + refresh rotatif en cookie)
    - RBAC, rate-limit, CORS strict, Helmet, CSRF
    - Services: Products, Cart/Orders, Payments, Appointments
    v
[PostgreSQL + Prisma]  [Redis/Cache (optionnel)]
    - TLS, PITR, migrations      - sessions/quotas (optionnel)
```

**Sécurité essentielle**

* Cookies `HttpOnly` + `Secure` + `SameSite=Strict` pour tokens; ne jamais exposer aux scripts. ([MDN Web Docs][4])
* **CSRF** : double‑submit cookie + `SameSite`. ([OWASP Cheat Sheet Series][10])
* **CSP noncée** (Next.js guide) + Helmet. ([nextjs.org][11])
* **CORS** : liste blanche stricte, pas de `*`. ([MDN Web Docs][12])
* **Rate‑limit** (login, reset, paiement) selon OWASP API Top 10. ([OWASP][13])
* **Hash mots de passe** : Argon2id + “pepper” serveur. ([OWASP Cheat Sheet Series][14])
* **Prisma** : connexion chiffrée (CA) + pool. ([Tim Santeford][15])

---

## 3) Paiements en Algérie — options recommandées (2025)

1. **SATIM e‑paiement (CIB)** : passerelle officielle pour paiements carte **CIB** (intégration & homologation via **CIBWeb**). ([satim.dz][16])
2. **Algérie Poste – BaridPay (QR via BaridiMob)** : paiement de proximité et en ligne selon cas d’usage, utile en complément (QR). ([poste.dz][17])
3. **Agrégateurs locaux** (ex. Chargily Pay) : proposent APIs/plugins CIB/EDAHABIA (vérifier frais/contrats). ([chargily.com][18])
4. **Fallback** : paiement à la livraison (COD) + virement, tant que l’e‑paiement est en cours d’homologation.

> **Parcours recommandé** : lancer avec COD + lien de paiement SATIM (bac à sable → prod), puis ajouter BaridPay QR en point‑de‑vente.

---



---

## 5) Extraits de code “copier/coller”

### 5.1 `docker-compose.yml` (extrait) — secrets et `.env`

```yaml
services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
    secrets:
      - DB_PASSWORD
  postgres:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD_FILE=/run/secrets/DB_PASSWORD
    secrets:
      - DB_PASSWORD
secrets:
  DB_PASSWORD:
    file: ./secrets/DB_PASSWORD   # non versionné
```

→ Voir bonnes pratiques Compose/env & secrets. ([Docker Documentation][2])

### 5.2 Express : Helmet, CORS strict, rate‑limit, cookies sécurisés

```ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // CSP via en-tête dédié/Next.js (voir §5.5)
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
}));
app.use(cors({
  origin: ["https://www.mjchauffage.dz"], // liste blanche
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15*60*1000, limit: 100 });
app.use("/api/auth/", authLimiter);

// ... routes
export default app;
```

([helmetjs.github.io][3])

### 5.3 Next.js (route handler) — Login qui pose les cookies HttpOnly

```ts
// frontend/src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  // ... vérif user + hash password (Argon2id)
  const access = sign({ sub: user.id, role: user.role }, process.env.ACCESS_SECRET!, { expiresIn: "10m" });
  const refresh = sign({ sub: user.id, ver: user.tokenVersion }, process.env.REFRESH_SECRET!, { expiresIn: "30d" });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("refresh_token", refresh, {
    httpOnly: true, secure: true, sameSite: "strict", path: "/api/auth/refresh", maxAge: 60*60*24*30,
  });
  // access-token côté client: renvoyer dans le body et stocker **en mémoire** uniquement
  return res;
}
```

Référence cookies `HttpOnly/Secure/SameSite`. ([MDN Web Docs][20])

### 5.4 Client API centralisé (Axios) — access‑token en mémoire + refresh automatique

```ts
// frontend/src/lib/http.ts
import axios from "axios";

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // envoie cookies (refresh) aux routes de même origine
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing = false;
api.interceptors.response.use(r => r, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original._retry) {
    original._retry = true;
    if (!refreshing) {
      refreshing = true;
      try {
        const { data } = await api.post("/auth/refresh"); // reçoit nouveau access
        setAccessToken(data.accessToken);
      } finally { refreshing = false; }
    }
    return api(original);
  }
  return Promise.reject(error);
});

export default api;
```

Intercepteurs Axios (instance + refresh). ([axios-http.com][21])

### 5.5 Next.js — CSP stricte avec nonce

```ts
// next.config.ts (ou via middleware/headers)
export const headers = async () => [
  {
    source: "/(.*)",
    headers: [
      { key: "Content-Security-Policy",
        value:
          "default-src 'self'; script-src 'self' 'nonce-__NONCE__'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
    ],
  },
];
```

Guide CSP officiel Next.js / MDN. (Générer un nonce par requête, injecter dans `script`.) ([nextjs.org][11])

### 5.6 Prisma — modèles clés (extraits) : tokens, rendez‑vous sans doublon

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          Role     @default(CUSTOMER)
  tokenVersion  Int      @default(0)
  appointments  Appointment[]
  orders        Order[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String   @index
  tokenHash String   @unique
  createdAt DateTime @default(now())
  expiresAt DateTime
  revoked   Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Appointment {
  id           String   @id @default(cuid())
  technicianId String
  customerId   String
  startsAt     DateTime
  endsAt       DateTime
  status       String   @default("BOOKED")
  @@unique([technicianId, startsAt]) // anti double-booking
}
```

* Hash mots de passe : **Argon2id** + pepper. ([OWASP Cheat Sheet Series][14])

### 5.7 Paiement — amorce SATIM (schéma d’intégration)

* **Back‑office** : créer une **commande** `PENDING`, rediriger vers page de paiement SATIM, recevoir callback → passer `PAID` et décrémenter stock de façon atomique.
* **Onboarding** via **CIBWeb** & docs SATIM. ([cibweb.dz][22])

### 5.8 Sauvegardes PostgreSQL (PITR) + 3‑2‑1

* Activer **archivage WAL** + **pg_basebackup**; tester restauration **point‑in‑time**. Appliquer règle **3‑2‑1** (copies multiples, supports distincts, une hors‑site). ([PostgreSQL][9])

---

## 6) Schéma de données minimal (à enrichir)

* `User(id, email, passwordHash, role, tokenVersion)`
* `Product(id, sku, name, description, price, currency, images, active)`
* `ProductVariant(id, productId, name, price, stock)`
* `Order(id, userId, total, status, paidAt)` + `OrderItem(orderId, variantId, qty, price)`
* `Payment(id, orderId, provider, status, ref)`
* `Appointment(id, technicianId, customerId, startsAt, endsAt, status)`
* `RefreshToken(id, userId, tokenHash, expiresAt, revoked)`

---

## 7) Analytics sans fuite de données

Privilégie des solutions **sans cookies / auto‑hébergeables** (Plausible, Matomo) pour rester léger et conforme (et éviter les bannières de consentement complexes). ([Plausible Analytics][23])

---

## 8) Check‑list “Go‑Live” express

* [ ] **Aucun secret dans le repo** (scan GitGuardian, revocation si fuite).
* [ ] **Cookies** : `HttpOnly; Secure; SameSite=Strict` pour refresh. ([MDN Web Docs][20])
* [ ] **CSP** active et testée, **CORS** uniquement sur domaines attendus. ([nextjs.org][11])
* [ ] **Rate‑limit** login/reset/paiement; **brute‑force** bloqué. ([OWASP][13])
* [ ] **Auth** : rotation des refresh‑tokens; révocation lors du logout/password‑reset. ([OWASP][5])
* [ ] **Paiements** : flux de test SATIM OK (initiation → callback → statut). ([satim.dz][16])
* [ ] **Emails** signés SPF/DKIM/DMARC. ([Microsoft Learn][6])
* [ ] **Backups** PITR testés (restore réel). ([PostgreSQL][9])
* [ ] **Tests e2e** : achat complet + prise RDV sans double‑booking.
* [ ] **Pages/tests** supprimés du build + `console.log` retirés. 

---

## 9) Pourquoi ces choix (réfs rapides)

* **Sessions via cookies HttpOnly/SameSite** : limite XSS/CSRF, recommandé par OWASP & MDN. ([MDN Web Docs][4])
* **Helmet + CSP** : réduit XSS/clickjacking; Next.js propose un guide CSP. ([helmetjs.github.io][3])
* **Rate‑limit** : explicitement pointé par l’OWASP API Top 10. ([OWASP][13])
* **Paiements Algérie** : SATIM/CIB (officiel) et CIBWeb pour l’homologation; BaridPay pour QR. ([satim.dz][16])
* **Loi 18‑07** : cadre algérien de protection des données. ([arpce.dz][19])

---

## 10) Ce que je corrige **tout de suite** (ordre d’exécution)

1. Purge des secrets du repo + rotation des clés; `.env` + `secrets/`.  ([Docker Documentation][24])
2. Remplacement **localStorage** → **cookies HttpOnly** + intercepteur Axios central.  ([axios-http.com][21])
3. Ajout **Helmet/CSP/CORS/Rate‑limit** sur l’API. ([helmetjs.github.io][3])
4. Implémentation **cart → order → paiement** (SATIM bac à sable) et **prise de RDV** (contrainte anti‑doublon). ([satim.dz][16])
5. Backups PostgreSQL (PITR) + tests de restauration. ([PostgreSQL][9])

---

Si tu veux, je peux adapter les extraits de code aux chemins/répertoires exacts de ton monorepo (Next.js/Express/Prisma) et générer un **diff** ciblé (auth service, client Axios, routes paiement, modèle Prisma “Appointment/Order/Payments”). Mais même sans ça, en suivant le plan ci‑dessus tu passes d’un **5/100** à un socle **sécurisé et fonctionnel** prêt pour une pré‑prod, puis homologation paiement. 

> **Rappel important (de l’audit)** : identifiants de test exposés, secrets en clair et JWT dans `localStorage` sont des **bloquants absolus** avant toute autre tâche. 

---

**Sources clés** : OWASP (sessions, CSRF, mots de passe, API Top 10), MDN (cookies/CSP), Next.js (CSP), Helmet, Axios interceptors, Prisma (connexions), SATIM/CIBWeb/BaridPay, ARPCE (Loi 18‑07), PostgreSQL PITR. ([OWASP Cheat Sheet Series][25])

.

[1]: https://www.rfc-editor.org/rfc/rfc5545?utm_source=chatgpt.com "RFC 5545: Internet Calendaring and Scheduling Core Object Specification ..."
[2]: https://docs.docker.com/compose/how-tos/environment-variables/best-practices/?utm_source=chatgpt.com "Best practices | Docker Docs"
[3]: https://helmetjs.github.io/?utm_source=chatgpt.com "GitHub Pages - Helmet.js"
[4]: https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies?utm_source=chatgpt.com "Secure cookie configuration - Security | MDN"
[5]: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/05.1-Testing_for_OAuth_Authorization_Server_Weaknesses?utm_source=chatgpt.com "WSTG - Latest - OWASP Foundation"
[6]: https://learn.microsoft.com/en-us/azure/communication-services/concepts/email/email-authentication-best-practice?utm_source=chatgpt.com "Best practices for sender authentication support - An Azure ..."
[7]: https://www.npmjs.com/package/express-rate-limit?utm_source=chatgpt.com "express-rate-limit - npm"
[8]: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections?utm_source=chatgpt.com "Database connections | Prisma Documentation"
[9]: https://www.postgresql.org/docs/current/continuous-archiving.html?utm_source=chatgpt.com "25.3. Continuous Archiving and Point-in-Time Recovery (PITR)"
[10]: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html?utm_source=chatgpt.com "Cross-Site Request Forgery Prevention Cheat Sheet - OWASP"
[11]: https://nextjs.org/docs/app/guides/content-security-policy?utm_source=chatgpt.com "Guides: Content Security Policy | Next.js"
[12]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS?utm_source=chatgpt.com "Cross-Origin Resource Sharing (CORS) - HTTP | MDN"
[13]: https://owasp.org/API-Security/editions/2019/en/0xa4-lack-of-resources-and-rate-limiting/?utm_source=chatgpt.com "API4:2019 Lack of Resources & Rate Limiting - OWASP API Security Top 10"
[14]: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html?utm_source=chatgpt.com "Password Storage - OWASP Cheat Sheet Series"
[15]: https://www.timsanteford.com/posts/securing-prisma-database-connection-with-a-ca-certificate/?utm_source=chatgpt.com "Securing Prisma Database Connection with a CA Certificate"
[16]: https://www.satim.dz/index.php/fr/services-cib/paiement-en-ligne?utm_source=chatgpt.com "Paiement en ligne - satim.dz"
[17]: https://www.poste.dz/services/professional/Baridi_pay_pro?utm_source=chatgpt.com "Service Paiement Mobile BaridPay - Algérie Poste"
[18]: https://chargily.com/business/pay?utm_source=chatgpt.com "Chargily Pay ™ - The N°1 E-payment Acceptance Gateway for Merchants in ..."
[19]: https://www.arpce.dz/fr/pub/c7e6n6?utm_source=chatgpt.com "Loi n° 18-07 du 25 Ramadhan 1439 correspondant au 10 juin 2018"
[20]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie?utm_source=chatgpt.com "Set-Cookie header - MDN Web Docs"
[21]: https://axios-http.com/docs/interceptors?utm_source=chatgpt.com "Interceptors | Axios Docs"
[22]: https://www.cibweb.dz/?utm_source=chatgpt.com "CIB web - Plateforme d'intégration de paiement électronique"
[23]: https://plausible.io/self-hosted-web-analytics?utm_source=chatgpt.com "Plausible: Self-Hosted Google Analytics alternative"
[24]: https://docs.docker.com/compose/how-tos/use-secrets/?utm_source=chatgpt.com "Secrets in Compose | Docker Docs"
[25]: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html?utm_source=chatgpt.com "Session Management - OWASP Cheat Sheet Series"


Medical References:
1. None — DOI: file-W3rCSJsCUDbS9YordNN3vn