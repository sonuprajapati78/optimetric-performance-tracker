# MongoDB Atlas Connection String Setup Guide

## ✅ Correct Format for `.env` File (Render)

### Basic Format:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?appName=Cluster0
```

### Your Specific Example:
```
MONGO_URI=mongodb+srv://agentperformance:YOUR_PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
```

---

## 🔑 Handling Special Characters in Password

### Problem:
If your MongoDB password contains special characters like `@`, `#`, `:`, `/`, etc., the connection string will break.

### Solution: URL Encoding

**Special Character Map:**
```
@ = %40
: = %3A
/ = %2F
# = %23
$ = %24
% = %25
? = %3F
& = %26
```

**Example:**
- Password: `P@ssw0rd:123`
- URL Encoded: `P%40ssw0rd%3A123`

### Tools to URL Encode:
- Online: https://www.urlencoder.org/
- Node.js:
  ```javascript
  const encoded = encodeURIComponent('your-password');
  console.log(encoded);
  ```

### Complete Example:
```
Original Password: MyP@ss123#2026
URL Encoded Password: MyP%40ss123%232026

Full Connection String:
mongodb+srv://agentperformance:MyP%40ss123%232026@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
```

---

## 📋 Step-by-Step Setup in Render

### 1. Get Connection String from MongoDB Atlas:

**Path:** MongoDB Atlas → Clusters → Connect → Drivers

You'll see something like:
```
mongodb+srv://<username>:<password>@cluster0.zmgq4so.mongodb.net/?retryWrites=true&w=majority
```

### 2. Replace Placeholder with Actual Password:

```
mongodb+srv://agentperformance:YOUR_ACTUAL_PASSWORD@cluster0.zmgq4so.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 3. URL Encode the Password (if contains special chars):

```bash
# If password is: MyP@ss123#2026
# Encoded password: MyP%40ss123%232026

# Final string:
mongodb+srv://agentperformance:MyP%40ss123%232026@cluster0.zmgq4so.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 4. Add to Render Environment Variables:

1. Go to **Render Dashboard**
2. Click your **Backend Service**
3. Go to **Settings** → **Environment**
4. Add new variable:
   - Key: `MONGO_URI`
   - Value: `mongodb+srv://agentperformance:ENCODED_PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0`
5. Click **Save** and **Redeploy**

---

## 🔐 Alternative: Using .env File (Local Development)

Create `.env` in your backend root:

```env
# Development
MONGO_URI=mongodb+srv://agentperformance:ENCODED_PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
NODE_ENV=development
PORT=5000
```

### Load .env in your app:

```javascript
require('dotenv').config();
const mongoUri = process.env.MONGO_URI;
```

---

## ✅ MongoDB Atlas IP Whitelist

For Render to connect to MongoDB, whitelist the IP:

1. MongoDB Atlas → **Security** → **Network Access**
2. Click **Add IP Address**
3. Choose one:
   - **Option A (Recommended):** Add `0.0.0.0/0` (allows all IPs)
   - **Option B (Secure):** Find Render's IP and add it specifically
4. Click **Confirm**

---

## 🧪 Test Connection

### Option 1: Using MongoDB Compass

1. Download MongoDB Compass
2. Paste your connection string
3. Click **Connect**
4. Should show your databases if successful

### Option 2: Using Node.js

```javascript
const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://agentperformance:PASSWORD@cluster0.zmgq4so.mongodb.net/?appName=Cluster0';

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ Connection failed:', err.message));
```

### Option 3: Using curl (Test endpoint)

```bash
curl https://your-render-backend.onrender.com/
```

Should return JSON with API endpoints if backend is running.

---

## ❌ Common Issues & Fixes

### Issue 1: "Invalid Credentials"
- ✅ Solution: Check username and password are correct in MongoDB Atlas
- ✅ Make sure password is URL encoded if it has special chars

### Issue 2: "No address found"
- ✅ Solution: Check cluster name is correct
- ✅ Check MongoDB Atlas cluster is running (not paused)

### Issue 3: "IP address not whitelisted"
- ✅ Solution: Add `0.0.0.0/0` to Network Access in MongoDB Atlas
- ✅ Wait 1-2 minutes for changes to take effect

### Issue 4: "Connection timeout"
- ✅ Solution: Check internet connection
- ✅ Check MongoDB Atlas status (not down for maintenance)
- ✅ Verify Render app is running

---

## 📚 Complete Example

### Your Setup:

**MongoDB Atlas Details:**
- Username: `agentperformance`
- Cluster: `cluster0.zmgq4so.mongodb.net`

**If password is:** `MyPassword123`

**Connection String:**
```
mongodb+srv://agentperformance:MyPassword123@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
```

**If password is:** `My@Pass#123` (contains special chars)

**URL Encoded Password:** `My%40Pass%23123`

**Final Connection String:**
```
mongodb+srv://agentperformance:My%40Pass%23123@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
```

**Add this to Render Environment Variables:**
```
MONGO_URI=mongodb+srv://agentperformance:My%40Pass%23123@cluster0.zmgq4so.mongodb.net/?appName=Cluster0
```

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas cluster is active (not paused)
- [ ] Connection string format is correct
- [ ] Password is URL encoded (if special chars)
- [ ] IP whitelist includes `0.0.0.0/0`
- [ ] MONGO_URI added to Render environment variables
- [ ] Render app redeployed after adding env variable
- [ ] No typos in username or cluster name
- [ ] Database exists in MongoDB Atlas

