<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3b3358f4-539f-4489-80c8-c675a99b7f77

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` and `GEMINI_MODEL` in [.env.local](.env.local)
3. Run the app:
   `npm run dev`


## Persistent Firebase / Authentication configuration

The application now treats the server-side Firebase database as the source of truth for admin-managed data.

Required production environment variables:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `FIREBASE_STORAGE_BUCKET` (for example `your-project-id.appspot.com`)
- `AUTH_SESSION_SECRET` (a long random secret used to sign HttpOnly authentication sessions)
- Existing `ADMIN_PASSWORD`
- Existing AI variables (`GEMINI_API_KEY` / `GEMINI_MODEL`) remain unchanged.

The server stores application data under the Firestore `easydiseay` document hierarchy with dedicated `settings`, `users`, `registrationRequests`, `diseases`, `medicines`, `supportedCrops`, and `analyses` item collections. Managed logo/crop images are stored in Firebase Storage and referenced by persistent URLs.

Authentication is enforced server-side. Admin actions require an authenticated admin session, and when `loginRequired` is enabled the existing `/api/analyze-crop` endpoint requires a valid authenticated user session before its existing AI implementation runs.

For Vercel, add the variables above to the Production environment and redeploy. Do not put the Firebase service-account JSON or `AUTH_SESSION_SECRET` in client-side Vite variables.
