# 🚀 MERN Stack Production Setup - Complete Guide

Your app is already **90% configured**! This guide provides the remaining 10% for production-level reliability.

---

## 📋 Quick Overview

| Component | Status | URL |
|-----------|--------|-----|
| **Frontend** | ✅ Vercel | `https://optimetric-performance-tracker-zinx.vercel.app` |
| **Backend** | ✅ Render | `https://optimetric-performance-tracker.onrender.com` |
| **Database** | ✅ MongoDB Atlas | `mongodb+srv://agentperformance:...@cluster0.zmgq4so.mongodb.net` |

---

## 🔐 1. CORS Configuration

### What It Does:
Allows your Vercel frontend to communicate with your Render backend securely.

### Current Implementation:
✅ Already configured in `src/app.js`

### Key Settings:
```javascript
// Allowed Origins:
- http://localhost:3000        // Development
- http://localhost:5000        // Development
- https://optimetric-performance-tracker-zinx.vercel.app   // Production
- https://optimetric-performance-tracker.onrender.com      // Render

// Allowed Methods:
- GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD

// With Credentials: YES
(Allows cookies and auth headers)
```

### File Location:
📍 [src/app.js](src/app.js) (lines 29-60)

### To Add More Origins:
Edit `CORS_ORIGIN` in `.env`:
```env
CORS_ORIGIN=https://your-new-domain.com,https://optimetric-performance-tracker-zinx.vercel.app
```

---

## 🌍 2. Environment Variable Logic

### What It Does:
Frontend automatically uses the correct API URL based on environment.

### Logic Flow:
```
1. Check REACT_APP_API_URL env variable (Vercel)
   ↓
2. If production build → Use Render URL
   ↓
3. If development → Use localhost:5000
```

### Files Involved:
- 📍 [frontend/src/config/api.js](frontend/src/config/api.js) - Configuration
- 📍 [frontend/src/services/api.js](frontend/src/services/api.js) - Axios instance
- 📍 [frontend/.env.production](frontend/.env.production) - Production values
- 📍 [frontend/.env.local](frontend/.env.local) - Development values

### Current Values:
```javascript
// Development (local)
REACT_APP_API_URL=http://localhost:5000

// Production (Vercel)
REACT_APP_API_URL=https://optimetric-performance-tracker.onrender.com
```

---

## 🗄️ 3. MongoDB Connection String

### Format:
```
mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
```

### Your Connection String:
```
mongodb+srv://agentperformance:YOUR_PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
```

### Important: URL Encoding
If your password contains special characters (`@`, `#`, `/`, etc.), **must be URL encoded**:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `/` | `%2F` |
| `:` | `%3A` |

**Example:**
- Raw password: `MyP@ss#123`
- URL encoded: `MyP%40ss%23123`
- Connection string: `mongodb+srv://agentperformance:MyP%40ss%23123@cluster0.zmgq4so.mongodb.net/?appName=Cluster0`

### Where It's Used:
- 📍 `.env` file (local development)
- 📍 Render environment variables (production)

### MongoDB Atlas IP Whitelist:
**Must add your Render IP or `0.0.0.0/0` to allow all IPs:**

MongoDB Atlas → Security → Network Access → Add IP Address

---

## 📱 4. Vercel Configuration

### Step-by-Step:

**Step 1: Go to Vercel Dashboard**
```
https://vercel.com/dashboard → Select your project
```

**Step 2: Navigate to Environment Variables**
```
Project → Settings → Environment Variables
```

**Step 3: Add Environment Variable**
```
Name:  REACT_APP_API_URL
Value: https://optimetric-performance-tracker.onrender.com
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**Step 4: Redeploy**
```
Deployments → Latest → Redeploy → Skip build cache
```

### Verification:
```
✅ Visit: https://optimetric-performance-tracker-zinx.vercel.app/
✅ Press F12 (DevTools)
✅ Check Console for: "🌐 API Service initialized"
✅ Try login - should connect to Render backend
```

---

## 🔄 Complete Data Flow

### When User Logs In:

```
┌─────────────────────────────────────────────────────┐
│ 1. User enters email/password in Vercel frontend    │
└────────────────┬──────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ 2. Frontend reads REACT_APP_API_URL env variable    │
│    → Gets: https://optimetric-performance-tracker...│
└────────────────┬──────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ 3. Browser sends POST request with CORS headers     │
│    → Origin: https://optimetric-performance-tracker-│
│      zinx.vercel.app                                │
└────────────────┬──────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ 4. Render backend receives request                  │
│    → Checks CORS whitelist (src/app.js)            │
│    → Verifies Origin is allowed                     │
└────────────────┬──────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ 5. Backend connects to MongoDB Atlas                │
│    → Uses MONGO_URI from environment variables      │
│    → Queries employees collection                   │
└────────────────┬──────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ 6. Backend returns JWT token + user data            │
└────────────────┬──────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ 7. Frontend stores token in localStorage            │
│    → Uses token for future authenticated requests   │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Production Checklist

### Frontend (Vercel)
- [ ] `REACT_APP_API_URL` environment variable set
- [ ] Value points to Render backend URL
- [ ] All environments selected (Production, Preview, Dev)
- [ ] Latest deployment shows "Ready"
- [ ] No console errors when accessing site
- [ ] F12 → Network tab shows successful API requests

### Backend (Render)
- [ ] `MONGO_URI` environment variable set correctly
- [ ] `CORS_ORIGIN` includes Vercel frontend URL
- [ ] `NODE_ENV=production`
- [ ] Service status shows "Live"
- [ ] Recent logs show no MongoDB connection errors
- [ ] Test with curl: `curl https://your-render-url.onrender.com/`

### Database (MongoDB Atlas)
- [ ] Cluster is active (not paused)
- [ ] IP whitelist includes `0.0.0.0/0` or Render IP
- [ ] Connection string has URL-encoded password (if special chars)
- [ ] Can connect via MongoDB Compass locally
- [ ] Demo user (admin@test.com) exists in database

### Security
- [ ] JWT_SECRET is strong and secret
- [ ] Never commit `.env` file to GitHub
- [ ] Use environment variables for all secrets
- [ ] CORS only allows your domains (not wildcard in production)
- [ ] HTTPS everywhere (Vercel and Render both support)

---

## 🧪 Testing Production Setup

### Test 1: Frontend Loads
```bash
curl https://optimetric-performance-tracker-zinx.vercel.app/
# Should return HTML without errors
```

### Test 2: Backend API Works
```bash
curl https://optimetric-performance-tracker.onrender.com/
# Should return JSON with endpoints
```

### Test 3: Login Endpoint
```bash
curl -X POST https://optimetric-performance-tracker.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
# Should return token or "Invalid credentials" (not CORS error)
```

### Test 4: Frontend to Backend Connection
1. Visit: `https://optimetric-performance-tracker-zinx.vercel.app`
2. Open DevTools (F12)
3. Network tab
4. Click Login button
5. Check request to `/api/v1/auth/login`
6. Response status should be 200 or 401 (not 0 or CORS error)

---

## 🐛 Troubleshooting

### Problem: Login button doesn't work
**Check:**
1. Browser console (F12 → Console) for errors
2. Network tab (F12 → Network) for failed requests
3. Is Render backend running? (Check Render dashboard)
4. Is MONGO_URI set in Render?

### Problem: "CORS error"
**Check:**
1. Is Vercel URL in Render's `CORS_ORIGIN`?
2. Are CORS headers in response? (Network tab → Response headers)
3. Try curl command above - should work if CORS correct

### Problem: "Invalid credentials" on correct email/password
**Check:**
1. Did you run seed script? `node src/seeds/seedAdmin.js`
2. Check MongoDB Atlas - does admin@test.com exist?
3. Is MONGO_URI correct in Render?

### Problem: "Cannot reach Render backend"
**Check:**
1. Is Render app status "Live"? (Render dashboard)
2. Try: `curl https://optimetric-performance-tracker.onrender.com/`
3. Check Render logs for startup errors
4. Wait 2-3 minutes after redeploy

---

## 📚 Related Guides

- **CORS Details:** See [src/config/cors.js](src/config/cors.js)
- **MongoDB Setup:** See [MONGODB_CONNECTION_GUIDE.md](MONGODB_CONNECTION_GUIDE.md)
- **Vercel Steps:** See [VERCEL_CONFIGURATION_GUIDE.md](VERCEL_CONFIGURATION_GUIDE.md)
- **Production Issues:** See [PRODUCTION_TROUBLESHOOTING.md](PRODUCTION_TROUBLESHOOTING.md)

---

## 🎯 Next Steps

1. ✅ Verify all 4 components (Frontend, Backend, DB, CORS)
2. ✅ Test with the 4 tests above
3. ✅ Set up error monitoring (Sentry, LogRocket)
4. ✅ Add SSL certificates (both services auto-provide)
5. ✅ Monitor logs regularly
6. ✅ Set up CI/CD for automated deployments

---

## 💡 Pro Tips

1. **Monitor Render logs** regularly for errors
2. **Set up alerts** for deployment failures
3. **Use different databases** for dev/prod (optional but recommended)
4. **Backup MongoDB Atlas** data regularly
5. **Test API endpoints** after each deploy
6. **Cache frontend assets** on CDN (Vercel does this automatically)

---

## 📞 Support

If something isn't working:
1. Check relevant guide (CORS, MongoDB, Vercel)
2. Check service logs (Render, Vercel dashboard)
3. Test with curl command
4. Check browser console (F12)
5. Verify all environment variables

