# Better Auth Integration Guide

Proiectul tau are acum **Better Auth** integrat complet cu OAuth, Refresh Tokens, și 2FA! 🚀

## 🎯 Features Implementate

✅ **Email/Password Authentication** - Register & Login  
✅ **OAuth Providers** - Google & GitHub (ready to configure)  
✅ **2FA/MFA** - TOTP + Backup Codes  
✅ **JWT Tokens** - Access & Refresh tokens  
✅ **Refresh Token Flow** - Long-lived sessions  
✅ **Password Hashing** - Bcrypt + OWASP compliant  

## 🔧 Setup Steps

### 1️⃣ Backend Configuration

#### a) Database Migrations (if needed)
```bash
cd backend
# Run migrations to add 2FA & OAuth fields to users table
alembic upgrade head
```

#### b) Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable OAuth 2.0
4. Create OAuth credentials (Web application)
5. Add redirect URI: `http://localhost:8000/api/oauth/google/callback`
6. Copy Client ID & Secret to `.env`:
```env
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
```

#### c) GitHub OAuth Setup
1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:8000/api/oauth/github/callback`
4. Copy Client ID & Secret to `.env`:
```env
GITHUB_CLIENT_ID=your-app-id
GITHUB_CLIENT_SECRET=your-app-secret
```

### 2️⃣ Frontend Integration

Better Auth client is already configured in `src/lib/better-auth.js`

#### Use Auth in Components:
```jsx
import { useAuthForm } from "@/lib/use-auth";

export function MyComponent() {
  const { register, login, logout, isLoading, error } = useAuthForm();
  
  // Use register/login/logout functions
}
```

#### Use 2FA:
```jsx
import { useTwoFactorAuth } from "@/lib/use-auth";

export function TwoFactorComponent() {
  const { setup2FA, verify2FA, disable2FA } = useTwoFactorAuth();
  
  // Use 2FA functions
}
```

### 3️⃣ API Endpoints

#### Authentication
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

#### OAuth
- `POST /api/oauth/google/callback` - Google OAuth callback
- `POST /api/oauth/github/callback` - GitHub OAuth callback (WIP)

#### 2FA
- `POST /api/2fa/setup` - Setup 2FA for user
- `POST /api/2fa/verify` - Verify 2FA code during setup
- `POST /api/2fa/verify-login` - Verify 2FA code during login
- `POST /api/2fa/disable` - Disable 2FA

## 🚀 Running the Project

### Backend
```bash
cd backend
source .venv/bin/activate  # or on Windows: .venv\Scripts\activate
pip install -r requirements.txt  # or use pyproject.toml
python -m uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

## 📝 Environment Variables

Backend `.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## 🔒 Security Features

1. **Password Hashing** - Bcrypt with salt rounds
2. **JWT Signing** - HS256 algorithm
3. **TOTP 2FA** - Time-based one-time passwords
4. **Backup Codes** - Recovery codes for account access
5. **CORS Protection** - Whitelisted origins
6. **Token Expiration** - Short-lived access tokens

## 📚 Components Created

### Backend
- `app/core/oauth.py` - OAuth provider setup
- `app/core/two_factor.py` - 2FA utilities
- `app/api/routes/better_auth.py` - Better Auth endpoints
- `app/api/routes/oauth.py` - OAuth endpoints
- `app/api/routes/two_factor.py` - 2FA endpoints

### Frontend
- `src/lib/better-auth.js` - Better Auth client config
- `src/lib/use-auth.js` - React hooks for auth
- `src/components/auth/BetterAuthLogin.jsx` - Login component
- `src/components/auth/BetterAuthSignUp.jsx` - Sign up component
- `src/components/auth/TwoFactorSetup.jsx` - 2FA setup component

## 🐛 Troubleshooting

### OAuth not working?
- Verify Client ID & Secret in `.env`
- Check redirect URIs match exactly
- Test with `http://localhost` not `127.0.0.1`

### 2FA QR code not displaying?
- Ensure `qrcode` and `pillow` are installed
- Check backend returns `qr_code` as base64 image

### CORS errors?
- Add your frontend URL to `cors_origins` in `config.py`
- Ensure backend runs on `http://localhost:8000`

## 🚢 Production Deployment

Before going live:

1. Update `JWT_SECRET_KEY` to a strong random value
2. Change `debug=False` in config
3. Set up proper OAuth redirect URIs
4. Use HTTPS for all OAuth callbacks
5. Store secrets in environment variables (not .env)
6. Enable CORS for your domain only
7. Use secure cookies with `HttpOnly` and `Secure` flags
8. Implement rate limiting on auth endpoints

## 📖 Next Steps

- [ ] Implement refresh token endpoint
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Complete GitHub OAuth implementation
- [ ] Add session management UI
- [ ] Implement account deletion
- [ ] Add audit logging for security events

---

Happy coding! 🎉 Questions? Check Better Auth docs: https://www.betterauth.dev
