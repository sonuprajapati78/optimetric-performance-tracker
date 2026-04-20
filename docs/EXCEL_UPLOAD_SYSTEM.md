# 📊 Production Excel Upload Performance Tracking System - Complete Documentation

## 🎯 System Overview

This is a **production-ready** Excel-based daily performance tracking system designed for 20+ employees to upload and monitor their daily performance metrics. The system automatically aggregates data, tracks trends, and calculates monthly performance rankings with incentive allocations.

### Key Features

✅ **Daily Excel Uploads** - Employees upload performance data daily  
✅ **Duplicate Prevention** - File hashing prevents duplicate uploads  
✅ **Date-Based Tracking** - Automatic detection of upload dates  
✅ **Personal Dashboards** - Employees see only their own data  
✅ **Monthly Reports** - Comprehensive performance aggregation  
✅ **Top Performers** - Automatic ranking with incentive amounts (₹5000, ₹3000, ₹2000, ₹1000, ₹500)  
✅ **Data Export** - CSV and JSON export options  
✅ **Upload History** - Full audit trail of all uploads  
✅ **Real-time Updates** - Automatic dashboard refresh after uploads  

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ UploadManager | MonthlyReport | PersonalDashboard   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             ↓
                      (Axios HTTP Client)
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Authentication | File Processing | Reporting        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Routes:                                              │   │
│  │ • /api/v1/uploads/performance (POST - Upload)       │   │
│  │ • /api/v1/uploads/history (GET - Upload History)    │   │
│  │ • /api/v1/uploads/stats/summary (GET - Stats)       │   │
│  │ • /api/v1/reports/monthly (GET - Monthly Report)    │   │
│  │ • /api/v1/reports/daily (GET - Daily Report)        │   │
│  │ • /api/v1/reports/range (GET - Range Report)        │   │
│  │ • /api/v1/reports/monthly/export (GET - Export)     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             ↓
                      (Mongoose ODM)
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database (MongoDB)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Collections:                                         │   │
│  │ • Employee (User accounts)                          │   │
│  │ • Agent (Performance records)                        │   │
│  │ • UploadHistory (Upload audit trail)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📥 Upload System Architecture

### File Upload Flow

```
1. User selects Excel/CSV file
   ↓
2. Frontend validates file type & size
   ↓
3. Calculate SHA256 file hash
   ↓
4. Check for duplicate uploads (same hash + date)
   ↓
5. Parse Excel file with XLSX library
   ↓
6. Validate each row:
   - Required: Agent Name (string)
   - Optional: Talk Time, Logged In Time, Break Time
   ↓
7. Convert time strings (HH:MM:SS) to seconds
   ↓
8. Calculate performance score
   ↓
9. Insert records into Agent collection
   ↓
10. Create UploadHistory record (audit trail)
   ↓
11. Return summary to frontend
```

### Data Deduplication

**Method**: SHA256 file hashing + date matching

```javascript
// Example: Detecting duplicate
const fileHash = calculateFileHash(file);
const existingUpload = await UploadHistory.findDuplicate(fileHash, dataDate);

if (existingUpload) {
  return {
    isDuplicate: true,
    previousUploadId: existingUpload._id,
    message: "This file was already uploaded on [date]"
  };
}
```

**Handling Duplicates**:
- By default: Block duplicate uploads
- With `allowDuplicates=true`: Force re-upload
- With `overwriteDate=true`: Replace existing data for that date

---

## 📊 Data Models

### 1. UploadHistory Schema

Tracks every file upload with metadata and processing results.

```javascript
{
  fileName: string,           // Original file name
  fileSize: number,           // File size in bytes
  fileHash: string,           // SHA256 hash for deduplication
  uploadedBy: ObjectId,       // Reference to Employee
  uploadDate: Date,           // When uploaded
  dataDate: Date,             // What date the data represents
  status: enum,               // 'processing', 'success', 'partial_success', 'failed'
  recordsProcessed: number,   // Records successfully inserted
  recordsSkipped: number,     // Empty or invalid rows
  recordsFailed: number,      // Rows with errors
  errors: [{                  // Error details
    row: number,
    field: string,
    reason: string
  }],
  format: enum,               // 'xlsx', 'xls', 'csv'
  isDuplicate: boolean,       // Was this a duplicate?
  duplicateOf: ObjectId,      // Reference to original upload
  processingTime: number,     // Time taken in ms
  notes: string              // Additional notes
}
```

### 2. Agent Schema (Performance Records)

```javascript
{
  name: string,               // Employee name
  date: Date,                 // Date of performance
  talkTime: number,           // In seconds
  loggedInTime: number,       // In seconds
  breakTime: number,          // In seconds
  performanceScore: number    // Calculated 0-100
}
```

### 3. Employee Schema

```javascript
{
  name: string,
  email: string,              // Unique login email
  password: string,           // Bcrypt hashed
  role: enum,                 // 'employee' or 'admin'
  department: string,
  joinDate: Date,
  isActive: boolean,
  lastLogin: Date
}
```

---

## 🔌 API Endpoints

### Upload Endpoints

#### **POST /api/v1/uploads/performance**
Upload Excel/CSV file with daily performance data.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/uploads/performance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@performance.xlsx" \
  -F "dataDate=2026-04-10" \
  -F "allowDuplicates=false" \
  -F "overwriteDate=false"
```

**Form Data:**
```
file: File                  // Excel/CSV file (required)
dataDate: YYYY-MM-DD string // Optional, defaults to today
allowDuplicates: boolean    // Force upload despite duplicates
overwriteDate: boolean      // Overwrite existing data for date
```

**Response (Success):**
```json
{
  "message": "Performance data uploaded successfully",
  "uploadId": "507f1f77bcf86cd799439011",
  "count": 20,
  "dataDate": "2026-04-10",
  "processingTime": 245
}
```

**Response (Duplicate Detected):**
```json
{
  "message": "Duplicate upload detected",
  "isDuplicate": true,
  "previousUploadId": "507f1f77bcf86cd799439010",
  "previousUploadDate": "2026-04-09T10:30:00Z",
  "detail": "Use allowDuplicates=true to force re-upload"
}
```

---

#### **GET /api/v1/uploads/history**
Get upload history for current user (or all users if admin).

**Query Parameters:**
```
page: number        (default: 1)
limit: number       (default: 20, max: 100)
status: string      (success, partial_success, failed, processing)
startDate: YYYY-MM-DD
endDate: YYYY-MM-DD
```

**Example:**
```bash
curl http://localhost:5000/api/v1/uploads/history?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "uploads": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fileName": "performance_2026-04-10.xlsx",
      "uploadDate": "2026-04-10T10:30:00Z",
      "dataDate": "2026-04-10",
      "status": "success",
      "recordsProcessed": 20,
      "recordsFailed": 0,
      "successRate": "100.00",
      "isDuplicate": false
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

#### **GET /api/v1/uploads/stats/summary**
Get upload statistics and health metrics.

```bash
curl http://localhost:5000/api/v1/uploads/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "totalUploads": 30,
  "successfulUploads": 28,
  "failedUploads": 1,
  "duplicateUploads": 1,
  "totalRecordsProcessed": 600,
  "totalRecordsFailed": 5,
  "averageProcessingTime": 234,
  "successRate": "93.33",
  "latestUpload": "2026-04-10T10:30:00Z"
}
```

---

### Report Endpoints

#### **GET /api/v1/reports/monthly**
Get comprehensive monthly performance report.

```bash
curl "http://localhost:5000/api/v1/reports/monthly?month=4&year=2026"
```

**Query Parameters:**
```
month: number (1-12, default: current month)
year: number  (default: current year)
```

**Response:**
```json
{
  "month": 4,
  "year": 2026,
  "startDate": "2026-04-01",
  "endDate": "2026-04-30",
  "topPerformers": [
    {
      "rank": 1,
      "employeeName": "Riya Singh",
      "medal": "🥇",
      "incentive": "₹5000",
      "avgScore": 64.82,
      "maxScore": 98.76,
      "entryCount": 25,
      "recordCount": 25,
      "consistency": "87.45"
    }
  ],
  "employees": [
    {
      "employeeName": "Rajesh Kumar",
      "recordCount": 20,
      "avgScore": 56.13,
      "maxScore": 95.45,
      "minScore": 23.12,
      "totalTalkTime": 432000,
      "totalLoggedInTime": 500000,
      "avgTalkTime": "6000",
      "avgLoggedInTime": "7000",
      "consistency": "72.34"
    }
  ],
  "statistics": {
    "totalRecords": 500,
    "totalEmployees": 20,
    "averageScore": 55.32,
    "highestScore": 99.87,
    "lowestScore": 12.34,
    "medianScore": 54.56
  }
}
```

---

#### **GET /api/v1/reports/daily**
Get daily performance summary.

```bash
curl "http://localhost:5000/api/v1/reports/daily?date=2026-04-10"
```

**Response:**
```json
{
  "date": "2026-04-10",
  "employees": [
    {
      "employeeName": "Riya Singh",
      "recordCount": 1,
      "avgScore": "78.45",
      "totalTalkTime": 21600,
      "totalLoggedInTime": 25200
    }
  ],
  "statistics": {
    "totalRecords": 20,
    "totalEmployees": 20,
    "averageScore": "56.23",
    "highestScore": "98.76",
    "lowestScore": "23.12"
  }
}
```

---

#### **GET /api/v1/reports/range**
Get performance report for a date range.

```bash
curl "http://localhost:5000/api/v1/reports/range?startDate=2026-04-01&endDate=2026-04-10"
```

**Response:**
```json
{
  "startDate": "2026-04-01",
  "endDate": "2026-04-10",
  "employees": [
    {
      "employeeName": "Riya Singh",
      "recordCount": 10,
      "avgScore": "65.45",
      "maxScore": "98.76",
      "minScore": "45.12"
    }
  ],
  "statistics": {
    "totalRecords": 200,
    "totalEmployees": 20,
    "daysCovered": 10,
    "averageScore": "55.67",
    "highestScore": "99.87",
    "lowestScore": "12.34"
  }
}
```

---

#### **GET /api/v1/reports/monthly/export**
Export monthly report as CSV or JSON.

```bash
# CSV Export
curl "http://localhost:5000/api/v1/reports/monthly/export?month=4&year=2026&format=csv" \
  -o report_4_2026.csv

# JSON Export
curl "http://localhost:5000/api/v1/reports/monthly/export?month=4&year=2026&format=json" \
  -o report_4_2026.json
```

---

## 🎨 Frontend Components

### 1. UploadManager Component

**Features:**
- Drag-and-drop file upload
- File type validation (.xlsx, .xls, .csv)
- File size validation (max 10MB)
- Date picker for custom upload dates
- Duplicate detection options
- Real-time upload progress bar
- Upload history display
- Error message handling

**Props:**
```javascript
<UploadManager user={user} />
```

---

### 2. MonthlyReport Component

**Features:**
- Month/year selector
- CSV and JSON export buttons
- Statistics cards (total records, employees, scores, etc.)
- Top 5 performers with medals and incentives
- Full employee ranking table
- Consistency scoring
- Responsive design

**Props:**
```javascript
<MonthlyReport />
```

---

## 💾 Upload File Format Requirements

### Expected Excel/CSV Columns

Your upload files **must contain** these columns:

| Column Name | Type | Required | Example | Notes |
|------------|------|----------|---------|-------|
| Agent Name | Text | ✅ Yes | Rajesh Kumar | Employee identifier |
| Total Talk Time (hh:mm:ss) | Time | ❌ Optional | 03:45:30 | Duration format |
| Total Logged In Time (hh:mm:ss) | Time | ❌ Optional | 08:30:00 | Full day duration |
| Total Break Duration (hh:mm:ss) | Time | ❌ Optional | 01:00:00 | Break time |

### Sample Excel File

```
Agent Name | Total Talk Time (hh:mm:ss) | Total Logged In Time (hh:mm:ss) | Total Break Duration (hh:mm:ss)
-----------|---------------------------|-------------------------------|------------------------------
Rajesh Kumar | 04:30:00 | 08:00:00 | 01:00:00
Priya Sharma | 03:45:15 | 07:30:00 | 00:45:00
Amit Patel   | 05:15:30 | 08:30:00 | 01:15:00
...
```

---

## 🔐 Authentication & Security

### JWT Token Management

- **Expiration**: 7 days
- **Storage**: Browser localStorage
- **Validation**: JWT signature verification
- **Protection**: Bearer token in Authorization header

### Password Security

- **Hashing**: bcryptjs with 8 salt rounds
- **Validation**: Email + password for login
- **Reset**: Not yet implemented (can be added)

### Authorization

```javascript
// Protected routes require valid JWT token
// Admin-only routes check role='admin'
// Employees can only see their own data

// Example middleware chain:
app.get('/api/v1/uploads/history',
  authMiddleware,           // Verify token
  uploadController.getHistory
);

app.get('/api/v1/dashboard/all-employees',
  authMiddleware,           // Verify token
  adminMiddleware,          // Verify role === 'admin'
  dashboardController.getAllEmployees
);
```

---

## 📈 Performance Scoring

### Performance Score Calculation

```javascript
// Formula: (Talk Time / Logged In Time) * 100
const score = (talkTime / loggedInTime) * 100;

// Capped at 100
const cappedScore = Math.min(score, 100);

// Example:
// Talk Time: 3600 seconds (1 hour)
// Logged In Time: 28800 seconds (8 hours)
// Score: (3600 / 28800) * 100 = 12.5%
```

### Monthly Ranking & Incentives

```javascript
// Calculate average score per employee for the month
const avgScore = totalScore / recordCount;

// Rank by average score (highest first)
const ranking = employees.sort((a, b) => 
  b.avgScore - a.avgScore
);

// Assign incentives
const incentives = [
  { rank: 1, medal: '🥇', amount: '₹5000' },
  { rank: 2, medal: '🥈', amount: '₹3000' },
  { rank: 3, medal: '🥉', amount: '₹2000' },
  { rank: 4, medal: '⭐', amount: '₹1000' },
  { rank: 5, medal: '⭐', amount: '₹500' },
];
```

---

## 🚀 Deployment Guide

### Step 1: Environment Setup

Create `.env` file in project root:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/performance-tracker
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_secret_key_here
```

### Step 2: Install Dependencies

```bash
cd /path/to/project
npm install
```

### Step 3: Start Services

```bash
# Backend
npm start

# Frontend (in another terminal)
cd frontend
npm start
```

### Step 4: Access Application

```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## 📋 Testing & Validation

### Test User Credentials

```
Email: employee1@test.com
Password: password123
Role: Employee
```

Other test accounts: employee2@test.com through employee20@test.com (same password)

### Sample Test Data

```
- 20 employees in database
- 600 daily performance records (30 days × 20 employees)
- Ready for immediate testing
```

### Validation Checklist

- ✅ File upload with validation
- ✅ Duplicate detection
- ✅ Data parsing and scoring
- ✅ Monthly report generation
- ✅ Top performers calculation
- ✅ Export functionality
- ✅ Authentication flow
- ✅ Role-based access
- ✅ Responsive UI

---

## 📊 Monitoring & Maintenance

### Key Metrics to Track

```
- Total uploads per day
- Success rate percentage
- Average processing time
- Failed uploads count
- Duplicate upload attempts
- Data records processed
```

### Database Optimization

```javascript
// Essential indexes:
db.agent.createIndex({ name: 1, date: -1 });
db.agent.createIndex({ performanceScore: -1, date: -1 });
db.uploadhistory.createIndex({ uploadedBy: 1, uploadDate: -1 });
db.uploadhistory.createIndex({ dataDate: 1 });
db.uploadhistory.createIndex({ fileHash: 1, dataDate: 1 });
```

---

## 🛠️ Troubleshooting

### Issue: "File upload fails with 500 error"
**Solution**: Check if uploads directory exists:
```bash
mkdir -p /path/to/internship/uploads
```

### Issue: "Duplicate detected unexpectedly"
**Solution**: Use `allowDuplicates=true` in request body to force upload.

### Issue: "Performance scores are 0"
**Solution**: Ensure Excel file has columns exactly named "Total Talk Time (hh:mm:ss)" and "Total Logged In Time (hh:mm:ss)".

### Issue: "MongoDB connection error"
**Solution**: Verify MongoDB is running:
```bash
mongosh
# or
mongo
```

---

## 📚 Additional Resources

- [Full API Documentation](http://localhost:5000/) - Available at root endpoint
- [Upload History Example](http://localhost:5000/api/v1/uploads/history)
- [Monthly Report](http://localhost:5000/api/v1/reports/monthly)

---

## 🎯 Next Steps for Production

### High Priority

1. **Email Notifications**
   - Send emails to top 5 performers with incentive amounts
   - Schedule for end of month at 12:01 AM

2. **Dashboard Analytics**
   - Trend analysis over multiple months
   - Department-wise performance comparison
   - Anomaly detection for unusual data

3. **Data Backup**
   - Daily automated MongoDB backups
   - Backup retention policy (30 days minimum)

### Medium Priority

4. **Admin Features**
   - Bulk user import from Excel
   - Manual score adjustments with audit trail
   - Department/team creation and management

5. **Employee Features**
   - Performance improvement suggestions
   - Personal performance trends
   - Peer comparison (anonymized)

### Lower Priority

6. **Advanced Reporting**
   - PDF report generation
   - Scheduled email reports
   - Performance forecasting
   - Custom date range reports

---

## 📞 Support & Maintenance

**System Status**: ✅ Production Ready

**Last Updated**: April 10, 2026

**Database**: MongoDB (local)  
**API**: Node.js/Express v16+  
**Frontend**: React 18.2.0  

For issues or questions, check the application logs:
```bash
tail -f logs/app.log
```

---

**This system is built to scale from 20 to 1000+ employees with minimal changes.**

Questions? Check the inline code comments in:
- `src/controllers/uploadController.js`
- `src/controllers/reportController.js`
- `src/utils/fileProcessing.js`
