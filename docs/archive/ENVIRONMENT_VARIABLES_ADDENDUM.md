## Environment Variables Addendum (2025-10-12)

- Frontend (`frontend/.env.local`)
  - `NEXT_PUBLIC_API_URL=http://localhost:3001` – backend base URL (sans /api, ajouté automatiquement)
  - `API_URL_SSR=http://localhost:3001` – optional override for SSR fetches
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000` – base URL for canonical/OG

- Backend (`backend/.env`)
  - `DATABASE_URL=postgresql://<user>:<pass>@<host>/<db>?sslmode=require` – Neon
  - `PORT=3001`, `API_BASE_URL=http://localhost:3001`
  - `FRONTEND_URL=http://localhost:3000` (and add admin if needed)
  - `REDIS_URL=redis://[:password]@host:port` – real Redis in production
  - JWT/Session/Email/Stripe/Dahabia keys as needed

Notes:

- When switching from SQLite to Postgres, run: `npm run db:migrate` then (optionally) `npm run db:seed`.
- Ensure CORS `allowedOrigins` in `security.ts` include the actual frontend origins in your environment.

