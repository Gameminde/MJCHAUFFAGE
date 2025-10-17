## Admin v2 Notes (NestJS + Next.js)

- Admin Backend (NestJS)
  - Location: `admin-v2/admin-backend`
  - Env: `admin-v2/admin-backend/.env` (defaults to local Postgres)
  - Auth: JWT strategy with roles/guards; adjust CORS and origins as needed.

- Admin Frontend (Next.js)
  - Location: `admin-v2/admin-frontend`
  - Uses its own `.env.local` and routes under `/dashboard`, `/login`, etc.

Integration Considerations:

- Ensure CORS allows the admin frontend origin to call the admin backend.
- Keep `REDIS_URL`/`DATABASE_URL` distinct between public and admin stacks if deployed separately.

### Démarrage local & Ports
- Admin Frontend : `npm run dev` → http://localhost:3002 (ou `npm run dev:legacy`)
- Admin Backend : NestJS (par défaut sur `3003` si lancé localement)
- Entrée : `http://localhost:3002/dashboard`

