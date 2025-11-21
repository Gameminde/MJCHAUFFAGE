# Fix Summary: Social Login Route

## Issue
The user encountered a `404 Not Found` error for `POST /api/v1/auth/social-login`.
This was because the `social-login` route was missing from the `backend/src/routes/auth.ts` file, even though the controller logic existed in `AuthController`.

## Resolution
I have updated `backend/src/routes/auth.ts` to include the missing route.
The file now correctly defines:
1.  `/register` (restored)
2.  `/social-login` (added)
3.  `/login`
4.  And all other auth routes.

## Next Steps for You
1.  **Restart Backend**: The backend server needs to be restarted to pick up the new route definition. Please stop the current `npm run dev` process in the backend terminal and start it again.
2.  **Test Social Login**: Once the backend is running, try the "Continuer avec Google" button again. It should now work correctly.
