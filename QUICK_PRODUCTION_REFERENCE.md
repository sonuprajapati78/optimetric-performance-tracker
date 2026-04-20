# 🚀 Production Setup Quick Reference Card

## Your URLs
```
Frontend:  https://optimetric-performance-tracker-zinx.vercel.app
Backend:   https://optimetric-performance-tracker.onrender.com
Database:  MongoDB Atlas (cluster0.zmgq4so.mongodb.net)
```

---

## 1. CORS Configuration ✅

**File:** [src/config/cors.js](src/config/cors.js)

**Allowed Origins:**
```javascript
[
  'http://localhost:3000',
  'http://localhost:5000',
  'https://optimetric-performance-tracker-zinx.vercel.app',
  'https://optimetric-performance-tracker.onrender.com'
]
```

**In Render Environment:**
```
CORS_ORIGIN=https://optimetric-performance-tracker-zinx.vercel.app,https://optimetric-performance-tracker.onrender.com
```

---

## 2. Environment Variables 🌍

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://optimetric-performance-tracker.onrender.com
```

### Frontend (.env.local) - Development
```env
REACT_APP_API_URL=http://localhost:5000
```

### Backend (.env) - All Environments
```env
# MongoDB
MONGO_URI=mongodb+srv://agentperformance:PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0

# Render Environment Variables
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://optimetric-performance-tracker-zinx.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2026
JWT_EXPIRE=30d
```

---

## 3. MongoDB Connection String 🗄️

### Format
```
mongodb+srv://agentperformance:PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
```

### Password URL Encoding
```
@ = %40
# = %23
/ = %2F
: = %3A
```

**Example:**
```
Raw:     MyP@ss#123
Encoded: MyP%40ss%23123

Full:    mongodb+srv://agentperformance:MyP%40ss%23123@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
```

### MongoDB Atlas Requirements
- ✅ IP Whitelist: `0.0.0.0/0` (allows all IPs)
- ✅ Cluster active (not paused)
- ✅ Network access configured

---

## 4. Vercel Setup 📱

### Step-by-Step:
1. **Vercel Dashboard** → Your Project → **Settings**
2. **Environment Variables**
3. **Add New:**
   - Name: `REACT_APP_API_URL`
   - Value: `https://optimetric-performance-tracker.onrender.com`
   - Environments: ✅ All (Production, Preview, Development)
4. **Save**
5. **Deployments** → Latest → **Redeploy** (Skip build cache)

### Verification:
- ✅ Visit: https://optimetric-performance-tracker-zinx.vercel.app
- ✅ F12 → Console → See "🌐 API Service initialized"
- ✅ Try login → Check Network tab for API requests

---

## 5. Render Configuration 🔧

### Go to Render Dashboard:
1. Select your **Backend Service**
2. **Settings** → **Environment**
3. Add these variables:

```
MONGO_URI=mongodb+srv://agentperformance:ENCODED_PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2026
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://optimetric-performance-tracker-zinx.vercel.app
LOG_LEVEL=info
```

4. **Save** and **Manual Deploy**

---

## 6. Test Commands 🧪

```bash
# Test backend is running
curl https://optimetric-performance-tracker.onrender.com/

# Test login endpoint
curl -X POST https://optimetric-performance-tracker.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Test CORS
curl -H "Origin: https://optimetric-performance-tracker-zinx.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://optimetric-performance-tracker.onrender.com/api/v1/auth/login
```

---

## 7. Quick Troubleshooting 🐛

| Issue | Solution |
|-------|----------|
| **Login not working** | Check F12 Console for errors, verify MONGO_URI in Render |
| **CORS error** | Verify Vercel URL in Render's CORS_ORIGIN env var |
| **API unreachable** | Check Render app status is "Live", wait 2-3 mins after redeploy |
| **Invalid credentials** | Run `node src/seeds/seedAdmin.js` to create demo user |
| **MongoDB connection fails** | Check password is URL encoded, IP whitelist set to 0.0.0.0/0 |
| **Environment variables not working** | Redeploy with "Skip build cache" option |

---

## 8. Complete Setup Checklist ✅

### Vercel Frontend
- [ ] `REACT_APP_API_URL` env variable set
- [ ] Value: `https://optimetric-performance-tracker.onrender.com`
- [ ] All environments selected
- [ ] Latest deployment shows "Ready"
- [ ] Frontend loads without console errors
- [ ] API requests visible in Network tab

### Render Backend
- [ ] `MONGO_URI` set with encoded password
- [ ] `CORS_ORIGIN` includes Vercel URL
- [ ] `NODE_ENV=production`
- [ ] Service status: "Live"
- [ ] No connection errors in logs
- [ ] Can curl the root endpoint

### MongoDB Atlas
- [ ] Cluster is active
- [ ] IP whitelist: `0.0.0.0/0`
- [ ] demo@admin.com exists in database
- [ ] Connection successful via test endpoint

---

## 9. Key Files 📁

| File | Purpose |
|------|---------|
| [src/config/cors.js](src/config/cors.js) | CORS configuration |
| [frontend/src/config/api.js](frontend/src/config/api.js) | Frontend API config |
| [frontend/src/services/api.js](frontend/src/services/api.js) | Axios instance |
| [.env](.env) | Backend environment variables |
| [frontend/.env.production](frontend/.env.production) | Frontend production env |
| [src/app.js](src/app.js) | Express app with CORS setup |

---

## 10. Important Notes ⚠️

1. **Never commit `.env` file** to GitHub
2. **Password must be URL encoded** if contains special chars
3. **CORS_ORIGIN must include** Vercel frontend URL
4. **Redeploy required** after environment variable changes
5. **MongoDB IP whitelist** needed for cloud connection
6. **JWT_SECRET must be strong** and changed in production
7. **Test with curl first** before debugging frontend

---

## 11. When Something Goes Wrong 🆘

1. **Check the logs:**
   - Render dashboard → Service → Logs
   - Vercel dashboard → Deployments → View Logs

2. **Check browser console:**
   - F12 → Console tab
   - Look for errors

3. **Check network requests:**
   - F12 → Network tab
   - Try login
   - Check request/response for errors

4. **Run test commands:**
   - Use curl commands above
   - Verify backend responds

5. **Verify environment variables:**
   - Render: Settings → Environment
   - Vercel: Settings → Environment Variables

---

## 12. Helpful Commands 🔧

```bash
# Local development
npm start                    # Start backend
cd frontend && npm start     # Start frontend

# Create demo users
node src/seeds/seedAdmin.js

# Check MongoDB connection
node src/utils/debug-production.js

# Production build
cd frontend && npm run build
```

---

## 13. Reference Guides 📚

- **Full Setup:** [PRODUCTION_MERN_SETUP.md](PRODUCTION_MERN_SETUP.md)
- **MongoDB Details:** [MONGODB_CONNECTION_GUIDE.md](MONGODB_CONNECTION_GUIDE.md)
- **Vercel Steps:** [VERCEL_CONFIGURATION_GUIDE.md](VERCEL_CONFIGURATION_GUIDE.md)
- **Troubleshooting:** [PRODUCTION_TROUBLESHOOTING.md](PRODUCTION_TROUBLESHOOTING.md)

---

**Last Updated:** April 20, 2026
**Status:** ✅ Production Ready
