# Vercel Frontend Configuration Guide

## 🎯 Objective
Configure Vercel to connect to your Render backend API at:
```
https://optimetric-performance-tracker.onrender.com
```

---

## Step 1️⃣: Access Vercel Dashboard

1. Go to **https://vercel.com/dashboard**
2. Sign in with your account
3. Find your project: **optimetric-performance-tracker-zinx**
4. Click on it to open the project settings

---

## Step 2️⃣: Navigate to Environment Variables

**Path:** Project → Settings → Environment Variables

```
Dashboard → Your Project → Settings (top menu) → Environment Variables
```

---

## Step 3️⃣: Add Environment Variable

### Variable Details:

| Field | Value |
|-------|-------|
| **Name** | `REACT_APP_API_URL` |
| **Value** | `https://optimetric-performance-tracker.onrender.com` |
| **Environments** | Select all (Production, Preview, Development) |

### Step-by-Step:

1. Click **Add New** button
2. In "Name" field, type: `REACT_APP_API_URL`
3. In "Value" field, type: `https://optimetric-performance-tracker.onrender.com`
4. Check all environment options:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

---

## Step 4️⃣: Trigger Redeploy

After adding the environment variable, redeploy your project:

### Option A: Manual Redeploy (Recommended)

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Select **Skip build cache** (recommended)
5. Click **Redeploy**

### Option B: Automatic Redeploy

1. Push code changes to GitHub
2. Vercel will automatically redeploy
3. Wait for deployment to finish (shows green checkmark)

---

## Step 5️⃣: Verify Configuration

### Check Environment Variables:

1. Go to **Settings** → **Environment Variables**
2. You should see:
   ```
   REACT_APP_API_URL = https://optimetric-performance-tracker.onrender.com
   ```

### Check Deployment Logs:

1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **View Build Logs**
4. Look for:
   ```
   REACT_APP_API_URL=https://optimetric-performance-tracker.onrender.com
   ```

---

## Step 6️⃣: Test the Connection

### Test 1: Check Frontend Loads

1. Visit: `https://optimetric-performance-tracker-zinx.vercel.app/`
2. Page should load without errors
3. Open browser DevTools (F12)
4. Check Console tab - no error messages

### Test 2: Check API Connection

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to **Login** with:
   - Email: `admin@test.com`
   - Password: `admin123`
4. Look for request to: `https://optimetric-performance-tracker.onrender.com/api/v1/auth/login`
5. Check response status (should be 200 or 401 if bad credentials, NOT CORS error)

### Test 3: Check Console Logs

In DevTools **Console** tab, you should see:
```
🌐 API Service initialized
   Base URL: https://optimetric-performance-tracker.onrender.com
   Environment: production

📡 API Request: POST https://optimetric-performance-tracker.onrender.com/api/v1/auth/login
```

---

## 🔧 Environment Variables Reference

### For Different Environments:

**Production (What users see):**
```
REACT_APP_API_URL=https://optimetric-performance-tracker.onrender.com
```

**Preview (Staging/Testing):**
```
REACT_APP_API_URL=https://optimetric-performance-tracker.onrender.com
```

**Development (Local testing):**
```
REACT_APP_API_URL=http://localhost:5000
```

### How to Set Environment-Specific Variables:

1. Click **Add New** for each variable
2. In the "Environments" dropdown:
   - Select **Production** for production URL
   - Select **Preview** for preview deployments
   - Select **Development** for local development
3. This way, different environments use different URLs automatically

---

## 📝 Example Configuration

### Your Complete Vercel Setup:

```
Project: optimetric-performance-tracker-zinx
Frontend URL: https://optimetric-performance-tracker-zinx.vercel.app

Environment Variables:
├── REACT_APP_API_URL
│   ├── Production: https://optimetric-performance-tracker.onrender.com
│   ├── Preview: https://optimetric-performance-tracker.onrender.com
│   └── Development: http://localhost:5000

Framework: React
Build Command: npm run build
Output Directory: build
Node Version: 18 (or your preferred version)
```

---

## ❌ Common Issues & Fixes

### Issue 1: "Cannot find module" Error

**Cause:** Environment variable not set during build

**Fix:**
1. Go to **Settings** → **Environment Variables**
2. Verify `REACT_APP_API_URL` is there
3. Make sure it's selected for **all** environments
4. Click **Redeploy**

### Issue 2: "API Unreachable" in Production

**Cause:** Frontend is using localhost instead of Render URL

**Fix:**
1. Check if `REACT_APP_API_URL` env variable is set
2. Verify value is: `https://optimetric-performance-tracker.onrender.com`
3. Redeploy with **Skip build cache**

### Issue 3: CORS Errors on Production

**Cause:** Backend CORS not configured for Vercel URL

**Fix:**
1. Go to your Render backend
2. Check environment variable: `CORS_ORIGIN`
3. Should include: `https://optimetric-performance-tracker-zinx.vercel.app`
4. Redeploy backend

### Issue 4: Build Fails in Vercel

**Cause:** Missing environment variables during build

**Fix:**
1. Go to **Build & Development Settings**
2. Verify Node version is 16+
3. Build command: `npm run build`
4. Output directory: `build` (for React) or `dist` (for Vite)
5. Install command: `npm install`

---

## 🚀 Deployment Checklist

- [ ] `REACT_APP_API_URL` environment variable is set
- [ ] Value is: `https://optimetric-performance-tracker.onrender.com`
- [ ] All environments selected (Production, Preview, Development)
- [ ] Latest deployment shows "Ready"
- [ ] No console errors when visiting frontend URL
- [ ] Network tab shows successful API requests
- [ ] Login/Register endpoints return data (not CORS errors)
- [ ] Backend URL in Render environment variables is correct
- [ ] Render backend is running (status shows "Live")

---

## 📚 Additional Vercel Resources

- Docs: https://vercel.com/docs/environment-variables
- Troubleshooting: https://vercel.com/support
- Build logs: Available in Deployments tab

---

## 💡 Pro Tips

1. **Use environment-specific variables** for different backends
2. **Always skip build cache** when updating env variables
3. **Monitor deployment logs** for build errors
4. **Test in different browsers** (Chrome, Firefox, Safari)
5. **Check mobile responsive** - use DevTools device mode
6. **Clear browser cache** before testing (Ctrl+Shift+Del)

