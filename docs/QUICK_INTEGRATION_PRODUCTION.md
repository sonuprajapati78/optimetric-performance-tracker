# Quick Integration Guide - Shift to Production Structure

**यह guide बताता है कि कैसे नए production structure को use करें।**

---

## 🔄 Migration Steps (5 Minutes)

### Step 1: Backup Original Files
```bash
# Create backup of current app.js
cp src/app.js src/app-backup.js
```

### Step 2: Replace Main App File
```bash
# Option A: Replace app.js completely
cp src/app-production.js src/app.js

# Option B: Or keep both and switch in package.json
# (Better for testing)
```

### Step 3: Update package.json Scripts
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "node src/app.js",
    "prod": "NODE_ENV=production node src/app.js"
  }
}
```

### Step 4: Create .env File (if not exists)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/performance-tracker
CORS_ORIGIN=*
LOG_LEVEL=info
API_VERSION=v1
```

### Step 5: Test Server
```bash
npm install
npm run dev
```

### Step 6: Test Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Root info
curl http://localhost:5000

# Upload (with test Excel file)
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@test.xlsx"
```

---

## 📋 File Mapping

### Production Files Created:
| File | Location | Purpose |
|------|----------|---------|
| `app-production.js` | `src/` | Clean app entry point |
| `performanceRoutes-production.js` | `src/routes/` | API routes (3 endpoints) |
| `performanceController-production.js` | `src/controllers/` | Request handlers |
| `multerConfig-production.js` | `src/middlewares/` | File upload (memoryStorage) |
| `errorHandler-production.js` | `src/middleware/` | Error handling |
| `performanceCalculationService-production.js` | `src/services/` | Calculations |
| `performanceService-production.js` | `src/services/` | Database ops |
| `excelParserService-production.js` | `src/services/` | Excel parsing |

### Existing Files (Keep Using):
- `src/models/Agent.js` - Database schema ✓
- `src/utils/calculateScore.js` - Score formula ✓
- `src/utils/convertToSeconds.js` - Time conversion ✓
- `src/utils/logger.js` - Logging ✓
- `src/config/index.js` - Environment config ✓
- `src/constants.js` - Constants ✓

---

## 🧪 Full Test Scenario

### 1. Create Sample Excel File
```
Agent Name | Total Talk Time (hh:mm:ss) | Total Logged In Time (hh:mm:ss) | Total Break Duration (hh:mm:ss)
-----------|--------------------------|------------------------------|---------------------------
Agent 1    | 10:30:45                 | 12:00:00                     | 01:30:00
Agent 2    | 09:15:30                 | 11:45:00                     | 01:20:00
Agent 3    | 11:20:00                 | 12:30:00                     | 00:45:00
```

### 2. Test Upload Endpoint
```bash
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@sample.xlsx"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "processed": 3,
    "total": 3,
    "errors": []
  },
  "message": "3 agent records processed successfully",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

### 3. Test Report Endpoint
```bash
curl "http://localhost:5000/api/v1/performance/report?limit=3"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "topPerformers": [
      {
        "rank": 1,
        "name": "Agent 3",
        "performanceScore": 91.34,
        "talkTime": 40800,
        "loggedInTime": 45000,
        "breakTime": 2700,
        "date": "2026-04-20T10:30:00.000Z"
      },
      // ... more agents
    ],
    "total": 3,
    "limit": 3
  },
  "message": "Performance report generated successfully",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

### 4. Test Reset Endpoint
```bash
curl -X DELETE "http://localhost:5000/api/v1/performance/reset?confirm=true"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 3,
    "message": "All performance data has been cleared"
  },
  "message": "Database reset successful",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

---

## 🔌 Import Updates (If Upgrading Existing Code)

### Old Imports → New Imports:
```javascript
// OLD
const upload = require('../middlewares/multerConfig');
const controller = require('../controllers/performanceController');
const errorHandler = require('../middleware/errorHandler');

// NEW
const upload = require('../middlewares/multerConfig-production');
const controller = require('../controllers/performanceController-production');
const { asyncHandler, ApiError, globalErrorHandler } = require('../middleware/errorHandler-production');
```

---

## 🛑 Common Issues & Fixes

### Issue 1: "Cannot find module"
**Solution:**
```bash
# Check if file exists
ls -la src/middlewares/multerConfig-production.js

# If not, check that files were created in correct location
```

### Issue 2: "Multer: No such file or directory"
**Solution:**
```bash
# Remove requirement for uploads/ directory (using memoryStorage)
# Delete uploads folder if not needed
rm -rf uploads/
```

### Issue 3: "MONGO_URI not defined"
**Solution:**
```bash
# Create .env file with MONGO_URI
cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/performance-tracker
CORS_ORIGIN=*
LOG_LEVEL=info
API_VERSION=v1
EOF
```

### Issue 4: "Old routes still being used"
**Solution:**
```javascript
// In app.js, make sure to use PRODUCTION route:
const performanceRoutes = require('./routes/performanceRoutes-production');
app.use('/api/v1/performance', performanceRoutes);
```

---

## ✅ Verification Checklist

Before going to production:

- [ ] All 3 endpoints respond correctly
- [ ] Excel upload works without errors
- [ ] Performance scores calculated correctly
- [ ] Report shows top performers sorted
- [ ] Reset endpoint clears data
- [ ] Standard response format used everywhere
- [ ] Error handling works for invalid requests
- [ ] Logging shows all requests and errors
- [ ] memoryStorage is used (no disk writes)
- [ ] MongoDB connection working

---

## 🚀 Running in Production

### 1. Set Production Environment
```bash
export NODE_ENV=production
export MONGO_URI=<your-production-db>
export PORT=5000
```

### 2. Start Server
```bash
npm run prod
# or
NODE_ENV=production node src/app.js
```

### 3. Monitor Logs
```bash
# Server logs show all requests
# Check LOG_LEVEL=info in production
```

---

## 📞 Troubleshooting

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Check Request Details
All requests logged in console with:
- Method
- Path
- Query parameters
- Response status
- Processing time

### View Error Stack Traces
Errors logged with full stack trace for debugging

---

## 🎓 Understanding the Flow

```
User Request
    ↓
Express Route Matching
    ↓
Multer Middleware (memory upload)
    ↓
Controller Function
    ├─ Validation
    ├─ Service Calls
    │   ├─ Excel Parser Service
    │   ├─ Calculation Service
    │   └─ Performance Service (DB)
    └─ Response Formatting
    ↓
Standard JSON Response
    ↓
Error Handling (if any errors)
    ↓
Global Error Handler
    ├─ Error Logging
    └─ Standard Error Response
```

---

## 💡 Tips

1. **Always confirm before reset**: `?confirm=true` required
2. **Limit results**: `?limit=10` for report endpoint
3. **Check Excel format**: Must have required columns
4. **Monitor disk space**: No files stored (memory only)
5. **Scale limit**: Can handle thousands of agents

---

## 📚 Documentation Files

- `PRODUCTION_MODULAR_STRUCTURE.md` - Full architecture guide
- `PRODUCTION_DEPLOYMENT.md` - Deployment checklist
- This file - Quick integration guide

---

**Ab aap ready ho production launch karne ke liye! 🎉**
