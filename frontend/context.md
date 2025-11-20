Engineering Context for Website Issue Fixes: MJ CHAUFFAGE E-commerce Platform
Date: October 27, 2025
Purpose: Provide a precise, actionable engineering guide to resolve the three critical website issues identified in the routes/APIs audit: admin dashboard infinite loading (role mismatch), images not displaying (URL/CORS problems), and product page showing mock data (sync issues). This context incorporates best practices researched from reliable sources (e.g., JWT security guidelines from Curity and Permit.io, CORS handling in Next.js/Express from LogRocket and StackHawk, and mock data removal in Next.js from Stack Overflow and Vercel docs). It is designed for an AI agent or developer to follow step-by-step, ensuring security, performance, and maintainability.
1. Business Context Recap
MJ CHAUFFAGE is an Algerian e-commerce site for heating products, with frontend (Next.js) and backend (Express.js/Prisma). Issues impact core flows:

Admin Dashboard Blocked: Prevents admins from managing products/orders, blocking inventory updates and analytics.
Images Not Displayed: Uploaded product images fail to show, harming user experience and sales (e.g., buyers can't see boilers/radiators).
Product Page Mock Data: Detail pages show placeholders instead of real data, leading to inaccurate product info and lost trust.

Goals Post-Fixes:

Secure, case-insensitive role checks for auth.
Reliable image serving without CORS errors.
Fully synced product pages with real API data.
Alignment: Multilingual support (FR/AR), mobile-first, performant (<250KB bundle), SEO-optimized.

Best Practices Integrated:

JWT Roles: Normalize casing (e.g., toUpperCase()) for consistency; avoid sensitive data in tokens (Curity/Permit.io).
Images/CORS: Use relative URLs or proxy; configure Express CORS middleware strictly (LogRocket/StackHawk).
Mock Data Removal: Conditional env-based toggles; clean production builds via config/plugins (Stack Overflow/Vercel).

2. Code Structure & Expected Logic
Align fixes with this structure. Reference audit paths.
textMJCHAUFFAGE/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── admin/
│   │   │   │   │   └── dashboard/page.tsx  # Fix role check here or in guard
│   │   │   │   ├── products/
│   │   │   │   │   └── [id]/page.tsx  # Remove mocks, ensure real API fetch
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   └── AdminAuthGuard.tsx  # Fix role mismatch
│   │   ├── utils/
│   │   │   └── dtoTransformers.ts  # Fix image URL formatting (if frontend)
│   ├── next.config.js  # Add CORS if proxying
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.ts  # Normalize roles on response
│   │   ├── utils/
│   │   │   └── dtoTransformers.ts  # Fix image URLs
│   │   ├── middleware/
│   │   │   └── corsMiddleware.js  # Configure for images
│   │   ├── routes/
│   │   │   └── uploads.js  # Ensure static serving
│   ├── .env  # Add CORS_ORIGINS
└── README.md  # Update with fix notes
Expected Logical Flows Post-Fixes:

Admin Access: Login → JWT with normalized role ('ADMIN') → Frontend guard checks case-insensitively → Dashboard loads.
Images: Upload → Backend stores relative URL (/files/image.jpg) → API returns relative path → Frontend loads via proxy or same-origin.
Product Page: SSR fetch from API → Render real data; no mocks in prod (env toggle).

3. Code Quality Assessment Framework
Evaluate fixes against this (aim for 9+/10 post-fix):



































CategoryCriteriaBest PracticesAudit Red Flags FixedSecurityCase-insensitive roles, CORSNormalize JWT claims; strict CORS originsRole mismatch exposure; CORS blocksPerformanceEfficient fetches, no mocksRelative URLs; env-based code removalInfinite loading; unnecessary mocksMaintainabilityClean code, no hacksConditional imports; plugins for prod cleanupMock remnants; inconsistent casingTestingCoverage >80%Add tests for roles/images/syncIntegration tests for flows
Tools to Run Post-Fixes:

npm run lint → Ensure consistency.
npm test → Add tests for fixed components.
Browser DevTools → Check no CORS errors; real data loads.
next build && next start → Verify prod build has no mocks.

4. Potential Issues & Fixes
Step-by-step fixes based on best practices. Apply sequentially; test locally (e.g., login, upload image, view product page).
Issue 1: Admin Dashboard Infinite Loading (Role Mismatch)

Review: Caused by case sensitivity ('admin' vs 'ADMIN'). Best practice: Normalize roles in JWT payload/response (to uppercase); use case-insensitive checks (e.g., toUpperCase()) to avoid errors (from Curity JWT guide, Stack Overflow).
Fix Steps:

Backend Normalization (AuthController): Ensure consistent casing in responses.
typescript// backend/src/controllers/authController.ts (in login/me endpoints)
const userData = {
  ...user,
  role: user.role.toUpperCase(),  // Normalize to 'ADMIN'
};
res.json({ user: userData });

Frontend Guard Fix (AdminAuthGuard): Use array includes or case-insensitive compare.
typescript// frontend/src/components/admin/AdminAuthGuard.tsx
const normalizedRole = user?.role?.toUpperCase();
const isAuthenticated = !!user && ['ADMIN', 'SUPER_ADMIN'].includes(normalizedRole) && !loading;
if (!isAuthenticated) {
  return <div>Loading... (Vérification des permissions administrateur...)</div>;  // Keep if needed, but add timeout/error
}

Add Test: In tests/admin.test.ts:
typescripttest('admin guard handles role casing', () => {
  const user = { role: 'AdMiN' };
  expect(isAdmin(user)).toBe(true);  // Custom helper
});



Test: Login as admin → Dashboard loads immediately.



Issue 2: Images Not Displayed (URL Formatting/CORS)

Review: Incorrect absolute URLs cause CORS; best practice: Use relative paths or Next.js proxy; configure Express CORS middleware with allowed origins (from LogRocket, StackHawk). Serve static files efficiently.
Fix Steps:

Backend CORS Config: Add/update middleware for /files.
javascript// backend/src/middleware/corsMiddleware.js (or in index.js)
const cors = require('cors');
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use('/files', cors({ origin: allowedOrigins, credentials: true }));
app.use('/files', express.static('uploads'));  // Serve static

Add to .env: CORS_ORIGINS=http://localhost:3000,https://your-domain.com


Fix URL Formatting (dtoTransformers): Return relative URLs.
typescript// backend/src/utils/dtoTransformers.ts
export const transformImageUrl = (image) => {
  if (/^https?:\/\//i.test(image.url)) return image.url;
  return image.url.startsWith('/') ? image.url : `/files/${image.url}`;  // Relative path
};
// Use in responses: image.url = transformImageUrl(image);

Frontend Image Component: Use Next.js <Image> with src as relative (proxy if needed).
typescript// frontend/src/components/products/ProductImage.tsx
import Image from 'next/image';
<Image src={product.imageUrl} alt={product.name} width={400} height={300} />;  // Assumes proxy or same-origin

If persistent CORS: Add Next.js API proxy (/api/proxy/files/[...path]).


Add Test: Upload image → Check src in DOM is relative/no CORS error.


Test: Upload in admin → View on site → Image displays.

Issue 3: Product Page Mock/Not Synced

Review: Mock data lingers; best practice: Use env vars to toggle mocks; remove via conditional code or Babel plugins (e.g., babel-plugin-react-remove-properties for data-test); ensure prod build strips dev code (from Vercel docs, Stack Overflow).
Fix Steps:

Remove Mocks Conditionally: Wrap mocks in dev check.
typescript// frontend/src/app/[locale]/products/[id]/page.tsx
if (process.env.NODE_ENV === 'development') {
  // Mock fallback only in dev
  if (!product) return <div>Mock data for testing</div>;
}
// Real fetch: const product = await fetchProduct(id);  // Ensure always real in prod

Clean Production Build: Add Babel plugin to strip mocks (package.json: babel-plugin-transform-react-remove-prop-types or custom).

Install: npm install babel-plugin-react-remove-properties --save-dev
In .babelrc:
json{
  "plugins": [
    ["react-remove-properties", { "properties": ["data-mock", "data-test"] }]
  ]
}

Update next.config.js if needed for custom Babel.


Ensure API Sync: Verify SSR fetch uses real endpoint.
typescript// In page.tsx
export async function getServerSideProps({ params }) {
  const product = await fetch(`${process.env.API_URL}/products/${params.id}`).then(res => res.json());
  return { props: { product } };  // No mocks
}

Add Test: E2E with Playwright: Visit /products/[id] → Assert real data (not "temporary").


Test: Build prod (next build && next start) → Product page shows admin-synced data.

5. Final Validation & Deployment

Run: next build (frontend), node src/index.js (backend).
Check: No issues in console; all flows work.
Deploy: Vercel (frontend) + Railway (backend); monitor with Sentry.
Re-audit: Ensure 9/10 scores; no regressions.

This context resolves the issues with best practices. Apply and report back.
Prepared by Grok (xAI) - E-commerce Code Quality Specialist30 pages web