# 🔧 Production Login/Register Troubleshooting Guide

## ✅ Verification Checklist

### 1️⃣ Render Backend Status
- [ ] Go to Render dashboard
- [ ] Click on your service
- [ ] Check status: Should show "Live"
- [ ] Check recent logs for errors

### 2️⃣ MongoDB Atlas Status
- [ ] Go to MongoDB Atlas dashboard
- [ ] Select your cluster
- [ ] Check connection status
- [ ] Verify IP whitelist includes `0.0.0.0/0` (allows all IPs)

### 3️⃣ Environment Variables on Render
Go to Render Dashboard → Service → Environment:
```
MONGO_URI=mongodb+srv://agentperformance:YOUR_PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2026
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://optimetric-performance-tracker-zinx.vercel.app
```

### 4️⃣ Vercel Environment Variables
Go to Vercel Dashboard → Project → Settings → Environment Variables:
```
REACT_APP_API_URL=https://optimetric-performance-tracker.onrender.com
```

---

## 🔍 Common Issues & Fixes

### ❌ Issue: "Network Error" or "API unreachable"

**Check these:**
1. **Is Render app running?**
   - Check Render logs for startup errors
   - Look for MongoDB connection errors

2. **Is MongoDB Atlas running?**
   - Go to MongoDB Atlas
   - Clusters → Click cluster
   - Check status

3. **Is IP whitelisted?**
   - MongoDB Atlas → Security → Network Access
   - Add `0.0.0.0/0` to allow all IPs

4. **Check CORS:**
   - Browser Console (F12) → Network tab
   - Look for CORS errors
   - Check if request goes to correct API URL

---

### ❌ Issue: "Invalid email or password"

**Check these:**
1. **Are demo users created?**
   - Run: `node src/seeds/seedAdmin.js` locally
   - It creates: admin@test.com / admin123

2. **Is database synced?**
   - MongoDB Atlas → Collections
   - Check `employees` collection
   - Should see admin@test.com

---

### ❌ Issue: "Register not working"

**Check these:**
1. **Email format validation**
   - Must be valid email format: name@domain.com

2. **Password requirements**
   - Minimum 6 characters

3. **Duplicate email**
   - Check MongoDB if email already exists

---

## 🛠️ Advanced Debugging

### Check API Response in Browser
1. Open https://optimetric-performance-tracker-zinx.vercel.app
2. Press F12 (DevTools)
3. Go to Network tab
4. Try login
5. Click on failed request
6. See Response tab for actual error

### Test API Directly
```bash
# Test if backend is running
curl https://optimetric-performance-tracker.onrender.com/

# Test login endpoint
curl -X POST https://optimetric-performance-tracker.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

### Check Render Logs
1. Render Dashboard → Service
2. Logs section at bottom
3. Look for:
   - MongoDB connection errors
   - CORS errors
   - Startup errors

---

## 📋 Setup Confirmation

**After fixing, verify:**
- [ ] Frontend loads at https://optimetric-performance-tracker-zinx.vercel.app
- [ ] Can type email/password
- [ ] Click Login button
- [ ] See success or specific error message
- [ ] Can Register new user
- [ ] New user can login

---

## 💡 Quick Fix Checklist

If login/register still not working:

1. **Check Render logs** for MongoDB error
2. **Verify MONGO_URI** has correct password
3. **Verify IP whitelist** on MongoDB Atlas
4. **Redeploy** Render service
5. **Clear browser cache** (Ctrl+Shift+Delete)
6. **Test in Incognito window**

---

## 📞 Get More Help

1. Check Render logs for specific error message
2. Share the exact error from browser console
3. Verify all credentials in environment variables
4. Test API endpoint manually with curl

