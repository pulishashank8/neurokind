# Google OAuth Setup for Production

## Problem
Google Sign-In redirects back immediately without completing authentication.

## Root Cause
The OAuth redirect URI for production (`https://neurokind.vercel.app`) is not registered in Google Cloud Console.

## Solution Steps

### 1. Access Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Log in with your Google account that owns the project

### 2. Find Your OAuth Client
- Look for OAuth 2.0 Client ID: `28976761502-tjo8f0mblc79ph2ii27k6eh8a1sfth8v`
- Click on it to edit

### 3. Add Authorized Redirect URIs
In the "Authorized redirect URIs" section, add:

```
https://neurokind.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**Important:** Make sure there are NO trailing slashes!

### 4. Add Authorized JavaScript Origins (Optional but recommended)
```
https://neurokind.vercel.app
http://localhost:3000
```

### 5. Save Changes
- Click "Save" at the bottom
- Wait 5-10 minutes for changes to propagate (Google's systems)

### 6. Test
1. Go to: https://neurokind.vercel.app/login
2. Click "Continue with Google"
3. Select your email account
4. Should now complete authentication successfully

## Common Issues

### Still not working after adding URIs?
- Wait 5-10 minutes for Google's cache to clear
- Try in an incognito/private window
- Clear browser cookies for the site

### Error: "redirect_uri_mismatch"
- Double-check the exact URL format (no trailing slashes)
- Verify you saved changes in Google Console
- Make sure NEXTAUTH_URL in Vercel matches exactly

## Verification

You can verify your current OAuth configuration by checking:
- NEXTAUTH_URL in production: `https://neurokind.vercel.app` ✓
- Google Client ID configured: ✓
- Redirect URI needed: `https://neurokind.vercel.app/api/auth/callback/google`

## Current Environment Variables (Production)
```
NEXTAUTH_URL=https://neurokind.vercel.app
GOOGLE_CLIENT_ID=28976761502-tjo8f0mblc79ph2ii27k6eh8a1sfth8v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<encrypted>
```

All environment variables are properly configured in Vercel. You only need to update Google Cloud Console.
