# 🔧 Backend API - Performance Tracker

**Backend**: Node.js/Express Application  
**Database**: MongoDB  
**Port**: 5000  

---

## 📁 Backend Folder Structure

```
src/
├── app.js                          # Current app
├── app-production.js               # NEW: Production-ready version
├── constants.js                    # Configuration constants
│
├── config/
│   └── index.js                   # Environment variables
│
├── middleware/
│   ├── errorHandler.js            # OLD
│   └── errorHandler-production.js # NEW: Global error handling
│
├── middlewares/
│   ├── multerConfig.js            # OLD
│   └── multerConfig-production.js # NEW: Memory storage
│
├── routes/
│   ├── performanceRoutes.js       # OLD
│   └── performanceRoutes-production.js # NEW: 3 endpoints
│
├── controllers/
│   ├── performanceController.js   # OLD
│   └── performanceController-production.js # NEW
│
├── services/
│   ├── performanceCalculationService.js  # OLD
│   ├── performanceCalculationService-production.js # NEW
│   ├── performanceService-production.js  # NEW
│   └── excelParserService-production.js  # NEW
│
├── models/
│   └── Agent.js                   # Database schema
│
├── utils/
│   ├── calculateScore.js          # Performance calculation
│   ├── convertToSeconds.js        # Time conversion
│   ├── logger.js                  # Logging
│   └── ... other utilities
│
└── tests/
    └── ... test files
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd c:\internship
npm install
```

### 2. Setup .env File
```bash
cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/performance-tracker
CORS_ORIGIN=http://localhost:3000,*
LOG_LEVEL=info
API_VERSION=v1
EOF
```

### 3. Start Backend
```bash
# Development
npm run dev

# Production
npm run prod

# Or directly
node src/app-production.js
```

### 4. Test Backend
```bash
# Health check
curl http://localhost:5000/health

# Root info
curl http://localhost:5000
```

---

## 📍 API Endpoints

### 1️⃣ Upload Excel & Analyze

**POST** `/api/v1/performance/upload`

Upload Excel file with agent performance data.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@performance.xlsx"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 50,
    "total": 50,
    "errors": []
  },
  "message": "50 agent records processed successfully",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

**Excel Format Required:**
```
Agent Name | Total Talk Time (hh:mm:ss) | Total Logged In Time (hh:mm:ss) | Total Break Duration (hh:mm:ss)
-----------|--------------------------|------------------------------|---------------------------
Agent 1    | 10:30:45                 | 12:00:00                     | 01:30:00
Agent 2    | 09:15:30                 | 11:45:00                     | 01:20:00
```

---

### 2️⃣ Get Performance Report

**GET** `/api/v1/performance/report`

Get top performers ranked by performance score.

**Request:**
```bash
curl "http://localhost:5000/api/v1/performance/report?limit=10"
```

**Query Parameters:**
- `limit` (optional): Number of top performers (default: 5, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "topPerformers": [
      {
        "rank": 1,
        "name": "Agent Smith",
        "performanceScore": 95.5,
        "talkTime": 36000,
        "loggedInTime": 43200,
        "breakTime": 3600,
        "date": "2026-04-20T00:00:00.000Z"
      },
      {
        "rank": 2,
        "name": "Agent Johnson",
        "performanceScore": 92.3,
        "talkTime": 34200,
        "loggedInTime": 42000,
        "breakTime": 3600,
        "date": "2026-04-20T00:00:00.000Z"
      }
    ],
    "total": 150,
    "limit": 10
  },
  "message": "Performance report generated successfully",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

---

### 3️⃣ Reset All Data

**DELETE** `/api/v1/performance/reset`

Clear all agent records from database (requires confirmation).

**Request:**
```bash
curl -X DELETE "http://localhost:5000/api/v1/performance/reset?confirm=true"
```

**Query Parameters:**
- `confirm=true` (required): Confirmation flag

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 150,
    "message": "All performance data has been cleared"
  },
  "message": "Database reset successful",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

---

## 🧮 Performance Score Formula

```
Performance Score = (Talk Time / (Logged In Time - Break Time)) × 100
```

**Example:**
```
Talk Time: 10 hours = 36000 seconds
Logged In Time: 12 hours = 43200 seconds
Break Time: 1 hour = 3600 seconds

Score = (36000 / (43200 - 3600)) × 100
       = (36000 / 39600) × 100
       = 90.91
```

---

## 🔄 Data Flow

```
Request
   ↓
Routes (performanceRoutes-production.js)
   ↓
Middleware (multer, error handler)
   ↓
Controller (performanceController-production.js)
   ↓
Services (calculate, parse, database)
   ├─ excelParserService: Parse Excel
   ├─ performanceCalculationService: Calculate scores
   └─ performanceService: Save to MongoDB
   ↓
Response (Standard format)
   ↓
Error Handler (if error)
   ├─ Log error
   └─ Return error response
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Server
NODE_ENV=development              # development | production
PORT=5000                         # Server port

# Database
MONGO_URI=mongodb://localhost:27017/performance-tracker

# CORS
CORS_ORIGIN=http://localhost:3000,*  # Comma-separated origins

# Logging
LOG_LEVEL=info                    # debug | info | warn | error

# API
API_VERSION=v1                    # API version
```

---

## 🧪 Testing

### Test All Endpoints

```bash
# 1. Health Check
curl http://localhost:5000/health

# 2. Root Info
curl http://localhost:5000

# 3. Upload Sample Data
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@sample.xlsx"

# 4. Get Report
curl "http://localhost:5000/api/v1/performance/report?limit=5"

# 5. Reset Database
curl -X DELETE "http://localhost:5000/api/v1/performance/reset?confirm=true"
```

### Run Tests
```bash
npm test
```

---

## 🐛 Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Check Logs
Logs show:
- Incoming requests
- File processing steps
- Database operations
- Errors with stack traces

### Common Issues

**Issue: MongoDB connection failed**
```
Solution: Check MONGO_URI in .env
- Is MongoDB running? mongod
- Is connection string correct?
```

**Issue: File upload fails**
```
Solution: Check file format
- Only .xlsx and .csv allowed
- File size max 10MB
```

**Issue: CORS error**
```
Solution: Check CORS_ORIGIN
- Should include frontend URL
- Typically: http://localhost:3000
```

---

## 📦 Dependencies

### Main Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ORM
- **multer**: File upload (memoryStorage)
- **xlsx**: Excel parsing
- **cors**: Cross-origin requests
- **dotenv**: Environment variables
- **joi**: Data validation

### Dev Dependencies
- **jest**: Testing
- **supertest**: API testing
- **eslint**: Code linting

---

## 🚀 Production Deployment

### 1. Set Environment
```bash
export NODE_ENV=production
export MONGO_URI=<production-db-url>
export PORT=5000
```

### 2. Start Server
```bash
npm run prod
# or
NODE_ENV=production node src/app-production.js
```

### 3. Use Process Manager
```bash
npm install -g pm2
pm2 start src/app-production.js --name "performance-api"
pm2 logs performance-api
```

### 4. With Docker
```bash
docker build -t performance-api .
docker run -p 5000:5000 performance-api
```

---

## 🔐 Security Best Practices

✅ CORS restricted to frontend origin  
✅ File upload size limited  
✅ Input validation on all endpoints  
✅ Error messages don't expose internals  
✅ MongoDB connection with authentication  
✅ Environment variables for secrets  
✅ Try-catch on all async operations  

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Multer Documentation](https://github.com/expressjs/multer)

---

## 🆘 Support

For issues or questions, check:
1. Backend logs (stdout/stderr)
2. `docs/PRODUCTION_MODULAR_STRUCTURE.md` - Full architecture
3. `docs/QUICK_INTEGRATION_PRODUCTION.md` - Integration guide
4. `docs/IMPLEMENTATION_CHECKLIST.md` - Setup checklist

---

**Backend is production-ready! 🚀**
