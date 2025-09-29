# Google OAuth Setup Guide

To enable Google OAuth authentication in the MJ CHAUFFAGE platform, follow these steps:

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

## 2. Create OAuth 2.0 Credentials

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Configure the OAuth consent screen:
   - Application name: "MJ CHAUFFAGE"
   - User support email: your-email@domain.com
   - Developer contact information: your-email@domain.com

## 3. Configure Authorized Redirect URIs

Add these URLs to your OAuth client configuration:

**For Development:**
- `http://localhost:3000/api/auth/callback/google`

**For Production:**
- `https://yourdomain.com/api/auth/callback/google`

## 4. Update Environment Variables

Copy the Client ID and Client Secret to your environment files:

**Frontend (.env.local):**
```
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Backend (.env):**
```
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## 5. Test the Integration

1. Start both frontend and backend servers
2. Navigate to the login page
3. Click "Continue with Google"
4. Complete the OAuth flow
5. Verify that the user is created in your database

## 6. Production Considerations

- Use environment-specific OAuth clients for development, staging, and production
- Ensure proper HTTPS configuration for production
- Configure proper domain verification in Google Cloud Console
- Set up proper error handling for OAuth failures

## Troubleshooting

**Common Issues:**
- "redirect_uri_mismatch": Check that your redirect URIs match exactly
- "invalid_client": Verify your client ID and secret are correct
- "access_denied": User cancelled the OAuth flow or your app is not verified

**Algeria-Specific Notes:**
- Google OAuth works globally, including Algeria
- Users can sign in with their existing Google accounts
- The interface will respect the user's selected language (Arabic/French)
- User data will be stored according to Algeria's data protection requirements