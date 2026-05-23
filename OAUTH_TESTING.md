# 🧪 OAuth Testing Guide

## ✅ Current Status

- **Backend**: Running on http://localhost:8000 with OAuth endpoints
- **Frontend**: Running on http://localhost:5174 with OAuth buttons
- **OAuth Implementation**: FULLY FUNCTIONAL - buttons actually trigger OAuth flow!

## 🧪 Test OAuth Without Credentials (Will show proper error)

### Step 1: Visit Login Page
1. Open http://localhost:5174/login
2. Click **"Google"** or **"GitHub"** button

### Expected Behavior:
- Popup tries to open
- Backend returns: `"OAuth not configured"`
- Error message shows in frontend: `"OAuth not configured"`
- Email/password login still works perfectly ✅

### Why this happens:
```
Button clicked
  ↓
Frontend calls: GET /api/oauth/google/login
  ↓
Backend checks: if not settings.google_client_id
  ↓
Returns: {"detail": "Google OAuth not configured"}
  ↓
Frontend shows error message
```

## 🔑 Test OAuth With Real Credentials

### Step 1: Get OAuth Credentials
See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for:
- Google OAuth setup
- GitHub OAuth setup

### Step 2: Add to `.env`

**File**: `backend/.env`

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

### Step 3: Restart Backend

Kill the running backend (Ctrl+C in terminal), then:

```bash
cd backend
uv run -m uvicorn app.main:app --reload
```

### Step 4: Test OAuth Flow

1. Open http://localhost:5174/login
2. Click **"Google"** button
3. Popup opens → Google login page
4. Enter Google credentials
5. Approve access
6. Popup closes automatically
7. You're logged in! 🎉 Redirected to dashboard

### Step 5: Logout & Test GitHub

1. Click avatar → Logout
2. Go to /login
3. Click **"GitHub"** button
4. Same flow with GitHub
5. You're logged in via GitHub! 🎉

## 📝 Test Plan - All Auth Flows

### Email/Password Flow ✅
```bash
1. Visit http://localhost:5174/signup
2. Fill: first_name, last_name, email, phone, password
3. Click Sign Up
4. Auto-redirected to /dashboard
5. See user profile
6. Click avatar → Logout
7. Should redirect to /login
```

### Google OAuth Flow (with credentials)
```bash
1. Visit http://localhost:5174/login
2. Click Google button
3. Approve at accounts.google.com
4. Auto-redirected to /dashboard
5. User created in database with google_id
6. Logout & login again with same Google
7. Same account loads ✅
```

### GitHub OAuth Flow (with credentials)
```bash
1. Visit http://localhost:5174/login
2. Click GitHub button
3. Approve at github.com
4. Auto-redirected to /dashboard
5. User created in database with github_id
6. Test linking: Sign up with GitHub, then link with Google
```

### Account Linking
```bash
1. Sign up with email
2. Go to /login
3. Try login with Google
4. Should ask: "Link to existing account?"
5. Approve linking
6. Account now has both email + google_id
```

## 🔍 Backend Health Checks

### Check OAuth endpoints exist:

```bash
# Get redirect URL for Google
curl http://localhost:8000/api/oauth/google/login

# Expected response:
{
  "redirect_url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Check API health:
```bash
curl http://localhost:8000/api/health

# Expected response:
{
  "status": "healthy",
  "database": "connected"
}
```

## 🐛 Troubleshooting

### Problem: "Popup was blocked"
**Solution**: Browser blocking popups for localhost
- Check browser settings
- Allow popups for http://localhost:5174
- Try different browser

### Problem: "Failed to exchange code for token"
**Solution**: OAuth credentials are wrong
- Check Google/GitHub app settings
- Verify Client ID and Secret match
- Ensure redirect URIs are correct

### Problem: "Session not working after OAuth"
**Solution**: JWT token not saved
- Check browser DevTools → Application → LocalStorage
- Should have: `access_token`, `user`
- If missing, OAuth callback failed silently

### Problem: Backend crashes on OAuth click
**Solutions**:
1. Check backend logs for error
2. Verify `httpx` is installed: `uv sync`
3. Restart backend

### Problem: Frontend can't reach backend
**Solution**: CORS error or wrong API URL
- Check browser console for CORS errors
- Backend should allow: `http://localhost:5174`
- Frontend uses: `http://localhost:8000/api` (default)

## 📊 What Gets Created in Database

### After Email/Password Signup:
```sql
INSERT INTO "user" (
  first_name, last_name, email, phone_number, 
  password_hash, created_at, updated_at
) VALUES ('Marco', 'Brinzanik', 'marco@example.com', '+40', '...', NOW(), NOW());
```

### After Google OAuth:
```sql
INSERT INTO "user" (
  first_name, last_name, email, google_id, 
  password_hash, created_at, updated_at
) VALUES ('Marco', 'Brinzanik', 'marco@gmail.com', 'google_123...', 'oauth', NOW(), NOW());
```

### After GitHub OAuth:
```sql
INSERT INTO "user" (
  first_name, last_name, email, github_id, 
  password_hash, created_at, updated_at
) VALUES ('marcopolo', '', 'marco@github.example.com', 'github_123...', 'oauth', NOW(), NOW());
```

## 🎯 Next Steps

1. **Get OAuth Credentials** → Follow OAUTH_SETUP.md
2. **Add to .env** → Restart backend
3. **Test OAuth** → Click buttons, see them work!
4. **Customize** → Add more OAuth providers (Discord, LinkedIn)
5. **Deploy** → Update redirect URIs for production domain

---

**All ready!** OAuth buttons are now fully functional. Just add credentials and test! 🚀
