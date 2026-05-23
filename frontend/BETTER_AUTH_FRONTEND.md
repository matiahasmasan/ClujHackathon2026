# Frontend - Better Auth Integration ✅

## 🎯 Ce s-a integrat:

✅ **Sign Up** - Crează cont nou cu email & parolă  
✅ **Sign In** - Login cu credențiale  
✅ **Protected Routes** - Dashboard protejat (redirecționează la login dacă nu ești logat)  
✅ **Logout** - Click pe avatar în dashboard → Logout  
✅ **Token Management** - Salvează JWT token în localStorage  
✅ **User Session** - Păstrează user info  

## 🚀 Cum să rulezi:

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Setup environment (optional)
```bash
# .env.local (dacă backend e pe alt URL)
VITE_API_URL=http://localhost:8000/api
```

### 3. Start dev server
```bash
npm run dev
```

Frontend rulează pe: **http://localhost:5173**

## 📝 Flow-ul complet:

### 🔐 Sign Up Flow
1. Mergi la `http://localhost:5173/signup`
2. Completezi forma (First name, Last name, Email, Phone, Password)
3. Click "Sign Up"
4. Se creează account + te loghezi automat
5. Redirect → Dashboard

### 🔑 Sign In Flow
1. Mergi la `http://localhost:5173/login`
2. Completezi email & parolă
3. Click "Log In"
4. Token se salvează în localStorage
5. Redirect → Dashboard

### 🚪 Logout
1. Ești în Dashboard
2. Click pe avatar (inițiale) din top-right
3. Click "Logout"
4. Redirect → Login page

### 🔒 Protected Route
- Dacă accesezi `/dashboard` fără token
- Ești redirecționat la `/login`

## 📁 Fișiere modificate:

- `src/lib/api.js` - API endpoints (Better Auth compatible)
- `src/lib/auth.js` - Auth utilities (already had these)
- `src/pages/LoginPage.jsx` - Updated pentru Better Auth
- `src/pages/SignUpPage.jsx` - Updated pentru Better Auth
- `src/components/ProtectedRoute.jsx` - CREAT - Protecție rute
- `src/components/dashboard/DashboardHeader.jsx` - Added logout
- `src/App.jsx` - Added ProtectedRoute
- `vite.config.js` - Added @ alias

## 🧪 Testare cu cURL:

### Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phone_number": "+40700000000"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:8000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## ⚠️ Troubleshooting:

### "Cannot reach the server"
- Verifica dacă backend ruleaza: `uv run -m uvicorn app.main:app --reload`
- Verifica dacă ruleaza pe `http://localhost:8000`
- Verifica CORS settings în backend config

### "Invalid email or password"
- Sigur-te că ai creat contul mai întâi cu Sign Up
- Verifica dacă parola e corectă

### Token nu se salvează
- Deschide DevTools → Application → LocalStorage
- Cauta `access_token` key
- Verifica dacă are valoare

## 🎉 Backend Better Auth endpoints:

- `POST /api/auth/sign-up` - Register
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get session
- `POST /api/2fa/setup` - Setup 2FA
- `POST /api/2fa/verify` - Verify 2FA
- `POST /api/2fa/disable` - Disable 2FA

---

**Gata! Frontend-ul e fully functional cu Better Auth!** 🚀
