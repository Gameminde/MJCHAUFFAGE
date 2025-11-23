# Fix Summary: Products Page Crash

## Issue
The products page was crashing with `TypeError: Cannot read properties of undefined (reading 'baseURL')`.
This was caused by `src/lib/api.ts` trying to access `config.api.baseURL`, but the `api` property was missing from `src/lib/config.ts`.

## Resolution
**Updated `frontend/src/lib/config.ts`**:
- Added the missing `api` configuration object.
- Set `baseURL` to `process.env.NEXT_PUBLIC_API_URL` with a fallback to `http://localhost:3001/api/v1`.

## Verification
- The `config` object now correctly exports the `api` property.
- `src/lib/api.ts` and other consumers of `config.api` should now work correctly.

## Next Steps
1. **Restart Frontend**: You may need to restart `npm run dev` to ensure the new configuration is loaded.
2. **Verify Products Page**: Navigate to the products page and confirm it loads without the crash.
3. **Check Supabase Auth**: If you still see Supabase 400 errors, verify your login credentials.
