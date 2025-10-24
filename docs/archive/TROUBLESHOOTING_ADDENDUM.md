## Troubleshooting Addendum – 404 /fr and Analytics Errors (2025-10-12)

### 404 on `/fr`

1) Clear cache and restart
```
cd frontend
rimraf .next
npm run dev
```
2) Verify i18n config
- `i18n/request.ts` locales: `fr`, `ar`.
- `messages/fr.json` exists.
- `middleware.ts` matcher excludes `/api`.
3) Check server logs
- You should see `[locale] layout render fr` from `app/[locale]/layout.tsx`.
4) Confirm port
- Next may start on 3001/3002; open the shown URL.

### Analytics ECONNREFUSED in `app/api/analytics/events`

- Start backend on `3001` or set `NEXT_PUBLIC_API_URL` to the correct backend URL.
- Use `curl http://localhost:3001/api/health` (if available) to confirm API responsiveness.

### Geolocation CORS errors

- Client should call `/api/geolocation`; if you still see browser CORS errors to `ipapi.co`, rebuild and verify `analyticsService.ts` uses `/api/geolocation`.

### Database Connection Error - Prisma Schema Mismatch

**CRITICAL FIX APPLIED 2025-10-13:**
- **Problem**: Prisma schema configured for `sqlite` but DATABASE_URL points to PostgreSQL Neon
- **Error**: `Error validating datasource db: the URL must start with the protocol file:`
- **Solution**: Changed `provider = "sqlite"` to `provider = "postgresql"` in `backend/prisma/schema.prisma`
- **Verification**: Backend now connects successfully to Neon PostgreSQL database

### Backend Startup Issues

1. **Prisma Configuration**: Ensure schema matches database type
2. **Database Connection**: Verify Neon PostgreSQL URL in `.env`
3. **Migration**: Run `npx prisma migrate dev` after schema changes
4. **Build**: Always run `npm run build` before starting compiled version
