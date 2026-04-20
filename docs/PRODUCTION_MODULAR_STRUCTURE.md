# Performance Tracker API - Production Structure

**Banao gya ek professional, production-ready Node.js/Express API!**

## 📁 Project Structure (Modular Architecture)

```
src/
├── app-production.js              # Main app entry point
├── constants.js                    # Configuration constants
├── config/
│   └── index.js                   # Environment variables & settings
├── middleware/
│   └── errorHandler-production.js # Global error handler & utilities
├── middlewares/
│   └── multerConfig-production.js # Multer with memoryStorage
├── routes/
│   └── performanceRoutes-production.js # API endpoint definitions
├── controllers/
│   └── performanceController-production.js # Request/Response handlers
├── services/
│   ├── performanceCalculationService-production.js # Core calculations
│   └── excelParserService-production.js # Excel parsing logic
├── models/
│   └── Agent.js                   # Database schema
├── utils/
│   ├── calculateScore.js          # Performance score formula
│   ├── convertToSeconds.js        # Time conversion utility
│   ├── dateUtils.js               # Date utilities
│   ├── fileUtils.js               # File utilities
│   └── logger.js                  # Logging utility
└── tests/                         # Test files (use when needed)

uploads/                            # NOT USED (memoryStorage used instead)
```

## 🚀 Core Features

### 1. **POST /api/v1/performance/upload**
Upload Excel file aur performance data ko analyze karo.

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

---

### 2. **GET /api/v1/performance/report**
Top performers ki list dekhiye.

**Request:**
```bash
curl http://localhost:5000/api/v1/performance/report?limit=10
```

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

### 3. **DELETE /api/v1/performance/reset**
Saara data delete karo (confirmation required).

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/v1/performance/reset?confirm=true
```

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

## 🛠️ Setup & Running

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Setup Environment Variables**
Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/performance-tracker
CORS_ORIGIN=*
LOG_LEVEL=info
API_VERSION=v1
```

### 3. **Start Server**
```bash
# Development
npm run dev

# Production
npm run prod

# Using production app
node src/app-production.js
```

### 4. **Test Endpoints**
```bash
# Health check
curl http://localhost:5000/health

# Root info
curl http://localhost:5000

# Upload file
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@test.xlsx"
```

---

## ✅ Best Practices Implemented

### 1. **Try-Catch & Error Handling**
```javascript
// Sab functions mein try-catch hai
try {
  // Business logic
} catch (error) {
  // Proper error handling
  throw new ApiError(statusCode, message);
}
```

### 2. **Standard Response Format**
```javascript
{
  success: true/false,
  data: { /* Response data */ },
  message: "Human-readable message",
  timestamp: "ISO timestamp"
}
```

### 3. **Global Error Handler Middleware**
- Multer errors
- Database errors
- Validation errors
- Unexpected errors
- Standard response format for all

### 4. **Async Handler Wrapper**
```javascript
// Automatic error catching
const myEndpoint = asyncHandler(async (req, res) => {
  // Errors automatically caught
});
```

### 5. **In-Memory File Upload (No Disk writes)**
```javascript
// multerConfig-production.js mein
const storage = multer.memoryStorage();
// File available as: req.file.buffer
```

---

## 📊 API Response Format

**All responses follow this standard format:**

### Success Response
```json
{
  "success": true,
  "data": { /* Your data */ },
  "message": "What happened",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "details": { /* Optional error details */ },
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

---

## 🔧 Architecture Breakdown

### **Routes Layer** (`performanceRoutes-production.js`)
- Endpoint definitions
- Multer middleware attachment
- Route parameters validation

### **Controller Layer** (`performanceController-production.js`)
- Request handling
- Response formatting
- Service orchestration
- No business logic

### **Service Layer** (`performanceCalculationService-production.js`, `excelParserService-production.js`)
- Pure business logic
- Data transformation
- Calculations
- No database access

### **Middleware Layer**
- `errorHandler-production.js`: Global error handling
- `multerConfig-production.js`: File upload setup

---

## 🧪 Testing Endpoints

### Upload with Sample Excel:
```bash
# Create sample Excel (you can use any Excel file)
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@sample.xlsx" \
  -H "Content-Type: multipart/form-data"
```

### Get Report:
```bash
curl "http://localhost:5000/api/v1/performance/report?limit=5"
```

### Reset Data:
```bash
curl -X DELETE "http://localhost:5000/api/v1/performance/reset?confirm=true"
```

---

## 🐛 Debugging

### Enable Verbose Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Check Logs
```javascript
// logger.js automatically logs:
// - All requests
// - Errors with stack traces
// - Business logic milestones
```

---

## 📝 Migration Guide

**Purani files sai naye files mein:**

| Old | New | Purpose |
|-----|-----|---------|
| `app.js` | `app-production.js` | Clean entry point |
| `performanceRoutes.js` | `performanceRoutes-production.js` | 3 main endpoints |
| `performanceController.js` | `performanceController-production.js` | Request handlers |
| `multerConfig.js` | `multerConfig-production.js` | Memory storage |
| `errorHandler.js` | `errorHandler-production.js` | Global error handling |
| - | `performanceCalculationService-production.js` | Core calculations |
| - | `excelParserService-production.js` | Excel parsing |

---

## 🚨 Common Errors & Solutions

### "File size exceeds limit"
- Max file size: 10MB
- Check file size: `ls -lh file.xlsx`

### "Invalid file type"
- Only `.xlsx` and `.csv` allowed
- Check file extension

### "No data rows found"
- Excel file must have data
- Check if Excel has content

### "MongoDB connection failed"
- Check `MONGO_URI` in `.env`
- MongoDB service running? `mongod`

---

## 📚 Code Example: Full Request Flow

```
Request: POST /api/v1/performance/upload with Excel file
  ↓
Route: performanceRoutes-production.js (matches POST /upload)
  ↓
Middleware: multerConfig-production.js (memoryStorage - req.file.buffer)
  ↓
Controller: performanceController-production.js uploadPerformance()
  ├── Parse Excel: excelParserService.parseExcelToJson()
  ├── Calculate: performanceCalculationService.transformToPerformanceRecords()
  ├── Save: Agent.save() to MongoDB
  └── Return: Standard response format
  ↓
Response: { success: true, data: {...}, message: "..." }
```

---

## ✨ Why This Structure is Professional

1. **Modular**: Easy to find aur modify code
2. **Scalable**: New endpoints add karne mein easy
3. **Maintainable**: Clear responsibilities per file
4. **Error-Safe**: Comprehensive error handling
5. **Beginner-Friendly**: Comments aur clear naming
6. **Production-Ready**: No temporary files, proper logging
7. **Standard Format**: All responses consistent
8. **Security**: Input validation, error messages safe

---

## 🎯 Next Steps

1. Replace `app.js` with `app-production.js`
2. Update package.json main script to use production app
3. Update routes to use production versions
4. Test all 3 endpoints thoroughly
5. Deploy to production!

---

**Happy Coding! 🚀**
