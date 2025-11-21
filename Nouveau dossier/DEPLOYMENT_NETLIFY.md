# Netlify Deployment Guide

## Prerequisites
1. **Netlify CLI**: Ensure you have the Netlify CLI installed or use `npx`.
2. **Login**: You must be logged in to Netlify.

## Steps to Deploy

### 1. Login to Netlify
Run the following command in your terminal:
```bash
npx netlify login
```
This will open a browser window to authorize the application.

### 2. Deploy Frontend
Once logged in, navigate to the `frontend` directory and run the deployment command:

```bash
cd frontend
npx netlify deploy --prod
```

### 3. Configuration
During the deployment process, you will be asked a few questions:
- **Link this directory to an existing site?**: Choose "Create & configure a new site" (or select an existing one if you have it).
- **Team**: Select your Netlify team.
- **Site name**: Choose a unique name (e.g., `mj-chauffage-frontend`).
- **Publish directory**: Enter `.next` (or `out` if using static export, but for Next.js SSR we usually use `.next` with the Netlify plugin).

**Important**: We have created a `netlify.toml` file that should handle the configuration automatically.

### 4. Environment Variables
You need to set the environment variables in Netlify for your site to work correctly.
Go to **Site settings > Build & deploy > Environment** and add:
- `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com` or similar).
- `NEXT_PUBLIC_APP_URL`: The URL of your deployed Netlify site.

## Backend Deployment
Ensure your backend is deployed and accessible (e.g., on Render, Railway, or a VPS). The frontend needs to know where the backend is via `NEXT_PUBLIC_API_URL`.
