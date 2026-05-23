# 🔐 OAuth Setup Guide - ClujHackathon2026

## What's Ready ✅

OAuth buttons are now **FULLY FUNCTIONAL**! Here's what happens:

1. **Google Login Flow**:
   - User clicks "Google" button
   - Redirected to Google OAuth login
   - After approval, back to our app with code
   - Backend exchanges code for JWT token
   - User logged in + redirected to dashboard

2. **GitHub Login Flow**:
   - Same as Google, but with GitHub OAuth
   - Creates/links user accounts automatically

## How to Enable OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → Create OAuth 2.0 Client ID
5. Choose "Web application"
6. Add Authorized redirect URIs:
   ```
   http://localhost:8000/api/oauth/google/callback
   ```
7. Copy `Client ID` and `Client Secret`

### Step 2: Create GitHub OAuth App

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: ClujHackathon2026
   - **Homepage URL**: http://localhost:3000 (or http://localhost:5173 for Vite)
   - **Authorization callback URL**: http://localhost:8000/api/oauth/github/callback
4. Copy `Client ID` and `Client Secret`

### Step 3: Add Credentials to Backend

Update `.env` file in `/backend`:

```env
# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### Step 4: Update Redirect URIs

For **production**, update:
- `app/api/routes/oauth.py` lines that have `http://localhost:8000`
- Change to your production domain: `https://yourdomain.com/api/oauth/...`

## Testing OAuth Locally

### Backend:
```bash
cd backend
uv run python start.py
# or
uvicorn app.main:app --reload
```

Backend will be at: http://localhost:8000

### Frontend:
```bash
cd frontend
npm run dev
```

Frontend will be at: http://localhost:5173

### Test OAuth Flow:

1. Visit http://localhost:5173/login
2. Click **"Google"** or **"GitHub"** button
3. A popup opens with OAuth provider
4. After authentication, popup closes and you're logged in! 🎉

## How OAuth Flow Works

```
User clicks OAuth button
    ↓
Frontend calls: GET /api/oauth/google/login
    ↓
Backend returns: { redirect_url: "https://accounts.google.com/..." }
    ↓
Frontend opens popup → redirects to OAuth provider
    ↓
User logs in at Google/GitHub
    ↓
OAuth provider redirects: /oauth/google/callback?code=...
    ↓
OAuthCallback page (frontend) receives code
    ↓
Frontend calls: POST /api/oauth/google/callback?code=...
    ↓
Backend exchanges code for user info + JWT token
    ↓
Backend returns: { token: "jwt...", user: {...} }
    ↓
Frontend closes popup, posts message to parent window
    ↓
Parent window receives { type: "oauth_callback", token, user }
    ↓
Frontend saves token + user to localStorage
    ↓
Frontend redirects to /dashboard ✅
```

## Backend OAuth Endpoints

- `GET /api/oauth/google/login` - Get Google redirect URL
- `POST /api/oauth/google/callback?code=...` - Handle Google callback
- `GET /api/oauth/github/login` - Get GitHub redirect URL
- `POST /api/oauth/github/callback?code=...` - Handle GitHub callback

## Frontend OAuth Callback

- New route: `/oauth/google/callback` - Handles Google redirects
- New route: `/oauth/github/callback` - Handles GitHub redirects
- Page: `src/pages/OAuthCallback.jsx` - Processes OAuth and posts result back

## Testing Without OAuth Credentials

The OAuth buttons **will fail gracefully** if credentials aren't configured:
- Button click → tries to get redirect URL
- Backend returns error: "OAuth not configured"
- Frontend shows error message
- User can still use email/password login ✅

This is perfect for initial testing without setting up OAuth apps!

## Troubleshooting

### "OAuth not configured" error
- OAuth credentials are empty in `.env`
- Add Google/GitHub credentials as shown in Step 3

### Popup gets blocked
- Browser security: allow popups for localhost
- Some browsers block third-party auth by default

### "Invalid client ID" error
- Wrong credentials in `.env`
- Credentials are from wrong app/project
- Check Google Cloud Console / GitHub Settings

### Backend doesn't start
- Make sure you're in `/backend` directory
- Check Python environment: `python --version`
- Try: `pip install -r requirements.txt` (or use `uv`)

### Backend returns 401 after OAuth
- JWT secret key might have changed
- Make sure `JWT_SECRET_KEY` in `.env` is consistent
- Try restarting backend

## What's Next?

✅ OAuth buttons now work!
✅ Users can login via Google or GitHub
✅ 2FA is available but optional
✅ Full auth flow complete

Now you can:
1. Add more OAuth providers (Discord, LinkedIn, etc.)
2. Add email verification
3. Add social login linking to existing accounts
4. Customize user profile after OAuth login

---

**Questions?** Check the console (browser DevTools) for detailed error messages!
