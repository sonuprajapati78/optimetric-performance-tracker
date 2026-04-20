# 📋 MODULAR ARCHITECTURE - QUICK REFERENCE CARD

## File Locations & Responsibilities

### Middleware Layer (`src/middlewares/`)

#### `fileValidation.js`
```javascript
Exports:
- validateFileBeforeUpload() → Check file exists, extension, size
- validateUploadMetadata() → Validate dataDate, flags
- validateDeleteRequest() → Validate confirm param, date

When Used: Before controller receives request
```

#### `multerConfig.js`
```javascript
Exports:
- upload → multer instance with memoryStorage
- multerErrorHandler() → Handle multer-specific errors

When Used: In routes, handles file upload to memory
```

---

### Service Layer (`src/services/`)

#### `excelParserService.js`
```javascript
Exports:
- parseExcelToJson(fileBuffer) → Buffer → Array<Object>
- isValidExcelBuffer(fileBuffer) → Boolean

Input: File buffer (RAM)
Output: JSON array
Dependencies: XLSX library
```

#### `dataValidationService.js`
```javascript
Exports:
- validateDataStructure(data) → {valid, errors, invalidRows}
- validateHeaders(firstRow) → Check required columns
- validateRow(row, rowNumber) → Check individual row
- REQUIRED_COLUMNS constant

Input: Parsed JSON array
Output: Validation result
Dependencies: convertToSeconds utility
```

#### `performanceCalculationService.js`
```javascript
Exports:
- transformToPerformanceRecords(data) → Array with scores
- calculateStatistics(records) → {average, highest, lowest}

Input: Validated data
Output: Records with performanceScore field
Dependencies: convertToSeconds, calculateScore
```

#### `databaseService.js`
```javascript
Exports:
- upsertAgentRecords(records, date) → {inserted, updated, failed}
- deleteAgentRecordsByDate(startDate, endDate) → {deletedCount}
- deleteAllAgentRecords() → {deletedCount}
- saveUploadHistory(data) → Saved record
- getUploadHistory(page, limit, status) → {records, pagination}

Input: Processed data
Output: Database results
Dependencies: Agent, UploadHistory models
```

---

### Controller Layer (`src/controllers/`)

#### `uploadController.js`
```javascript
Exports:
- uploadPerformanceData(req, res) → 201 on success, 400/500 on error
- clearPerformanceData(req, res) → 200 on delete
- getUploadHistory(req, res) → 200 with paginated results

Responsibility: Orchestrate services, handle errors, format response
NO business logic inside!
```

---

### Routes Layer (`src/routes/`)

#### `uploadRoutes.js`
```javascript
Routes:
- POST /performance → uploadPerformanceData
- DELETE /clear → clearPerformanceData
- GET /history → getUploadHistory

Middleware Chain:
1. authMiddleware
2. multer upload
3. multerErrorHandler
4. validateFileBeforeUpload
5. validateUploadMetadata
6. controller
```

---

### Utility Layer (`src/utils/`)

#### `fileUtils.js`
```javascript
Exports:
- generateFileHash(buffer) → SHA256 hex string
- getFileExtension(fileName) → '.xlsx' | '.xls' | '.csv'
- getFileType(fileName) → 'xlsx' | 'xls' | 'csv'

Usage: Hash for duplicate detection, extension checks
```

#### `dateUtils.js`
```javascript
Exports:
- parseDate(dateInput) → Date object
- getStartOfDay(date) → 00:00:00.000
- getEndOfDay(date) → 23:59:59.999
- extractDateFromFileName(fileName) → Date or null
- formatDateToString(date) → "YYYY-MM-DD"

Usage: Date validation, extraction, formatting
```

---

## Request Processing Checklist

```
[✓] Client sends request
     ↓
[✓] uploadRoutes.js matches path
     ↓
[✓] authMiddleware → Verify user
     ↓
[✓] multer → Upload file to req.file.buffer
     ↓
[✓] multerErrorHandler → No errors?
     ↓
[✓] validateFileBeforeUpload → File valid?
     ↓
[✓] validateUploadMetadata → Metadata valid?
     ↓
[✓] uploadController.uploadPerformanceData()
     │
     ├─ [✓] excelParserService.isValidExcelBuffer()
     ├─ [✓] excelParserService.parseExcelToJson()
     ├─ [✓] dataValidationService.validateDataStructure()
     ├─ [✓] performanceCalculationService.transform...()
     ├─ [✓] fileUtils.generateFileHash()
     ├─ [✓] databaseService.deleteAgentRecords...() [if overwrite]
     ├─ [✓] databaseService.upsertAgentRecords()
     ├─ [✓] databaseService.saveUploadHistory()
     ├─ [✓] performanceCalculationService.calculateStatistics()
     │
     ↓
[✓] res.status(201).json({...})
     ↓
[✓] Response sent to client
```

---

## Error Handling Matrix

| Layer | Error Type | Status Code | Message |
|-------|-----------|-------------|---------|
| **Middleware** | No file | 400 | No file provided |
| **Middleware** | File too large | 413 | File exceeds 10MB |
| **Middleware** | Invalid extension | 400 | Invalid file type |
| **Middleware** | Invalid date format | 400 | Invalid date format |
| **Service: Parser** | Invalid Excel | 400 | Invalid Excel file |
| **Service: Validator** | Missing columns | 400 | Missing columns |
| **Service: Validator** | Invalid time format | 400 | Invalid time format |
| **Service: Database** | Insert failed | 500 | Database error |
| **Service: Database** | Update failed | 500 | Database error |

---

## Testing Strategy

### Unit Tests (One per service)

```javascript
// Test excelParser
test('parseExcelToJson converts buffer to array', () => {
  const result = excelParserService.parseExcelToJson(buffer);
  expect(Array.isArray(result)).toBe(true);
});

// Test validator
test('validateDataStructure rejects missing columns', () => {
  const result = dataValidationService.validateDataStructure(data);
  expect(result.valid).toBe(false);
});

// Test calculator
test('transformToPerformanceRecords calculates scores', () => {
  const records = performanceCalculationService.transform...(data);
  expect(records[0].performanceScore).toBeGreaterThan(0);
});

// Test database
test('upsertAgentRecords saves to MongoDB', async () => {
  const result = await databaseService.upsertAgentRecords(records, date);
  expect(result.inserted).toBe(50);
});
```

### Integration Tests (Route level)

```javascript
test('POST /api/uploads/performance returns 201', async () => {
  const response = await request(app)
    .post('/api/uploads/performance')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', 'test.xlsx');
  
  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
});
```

---

## API Endpoint Reference

### Upload Performance Data

```
POST /api/uploads/performance

Headers:
- Authorization: Bearer <token>

Form Data:
- file: Excel/CSV file (required)
- dataDate: YYYY-MM-DD (optional)
- overwriteDate: true|false (optional)
- allowDuplicates: true|false (optional)

Success Response (201):
{
  "success": true,
  "message": "Performance data uploaded successfully",
  "data": {
    "recordsProcessed": 50,
    "recordsInserted": 45,
    "recordsUpdated": 5,
    "dataDate": "2026-04-20",
    "processingTime": "245ms",
    "statistics": {
      "totalRecords": 50,
      "averageScore": 85.5,
      "highestScore": 98.2,
      "lowestScore": 45.3
    }
  }
}

Error Responses:
400: Invalid file format, missing columns, validation failed
409: Duplicate file
500: Server/database error
```

### Clear Performance Data

```
DELETE /api/uploads/clear?confirm=true&dataDate=2026-04-20

Headers:
- Authorization: Bearer <token>

Query Parameters:
- confirm=true (REQUIRED)
- dataDate=YYYY-MM-DD (optional, clears only this date)

Success Response (200):
{
  "success": true,
  "message": "Deleted 50 records",
  "data": {
    "deletedCount": 50,
    "clearedScope": "Date: 2026-04-20",
    "warning": "This operation is permanent and cannot be undone"
  }
}
```

### Get Upload History

```
GET /api/uploads/history?page=1&limit=20&status=SUCCESS

Headers:
- Authorization: Bearer <token>

Query Parameters:
- page: integer (default 1)
- limit: integer (default 20, max 100)
- status: SUCCESS|FAILED (optional)

Success Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fileName": "april-data.xlsx",
      "fileSize": 45632,
      "status": "SUCCESS",
      "recordsProcessed": 50,
      "uploadDate": "2026-04-20T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

---

## Debugging Checklist

```
[ ] Check logs for exact error message
[ ] Is middleware order correct in routes?
[ ] Is file buffer passed correctly?
[ ] Are required columns in Excel?
[ ] Is time format HH:MM:SS?
[ ] Is MongoDB running?
[ ] Is auth token valid?
[ ] Is file size < 10MB?
[ ] Is file extension .xlsx/.xls/.csv?
[ ] Is dataDate in YYYY-MM-DD format?
```

---

## File Integration Map

```
Incoming Request
    ↓
uploadRoutes.js ←─ Defines path & middleware chain
    ↓
authMiddleware.js ←─ (existing) Verify user
    ↓
multer + multerConfig.js ←─ Upload to memory
    ↓
multerErrorHandler ←─ Handle upload errors
    ↓
fileValidation.js ←─ Validate file & metadata
    ↓
uploadController.js ←─ Main orchestration
    ├─ excelParserService.js
    ├─ dataValidationService.js
    ├─ performanceCalculationService.js
    ├─ databaseService.js
    │  ├─ Agent.js (model)
    │  └─ UploadHistory.js (model)
    ├─ fileUtils.js
    ├─ dateUtils.js
    ├─ logger.js (existing)
    ├─ calculateScore.js (existing)
    └─ convertToSeconds.js (existing)
    ↓
Response to client
```

---

## Quick Integration Checklist

```
[ ] Copy fileValidation.js to src/middlewares/
[ ] Copy multerConfig.js to src/middlewares/
[ ] Copy excelParserService.js to src/services/
[ ] Copy dataValidationService.js to src/services/
[ ] Copy performanceCalculationService.js to src/services/
[ ] Copy databaseService.js to src/services/
[ ] Copy uploadController.js to src/controllers/
[ ] Copy uploadRoutes.js to src/routes/
[ ] Copy fileUtils.js to src/utils/
[ ] Copy dateUtils.js to src/utils/
[ ] Update app.js: import uploadRoutes
[ ] Update app.js: app.use('/api/uploads', uploadRoutes)
[ ] Test POST /api/uploads/performance
[ ] Test DELETE /api/uploads/clear?confirm=true
[ ] Test GET /api/uploads/history
[ ] Verify no files in /uploads folder
[ ] Deploy to production
```

---

## Performance Optimization Tips

1. **File Size** - Limit to 10MB per upload
2. **Batch Processing** - Process 50+ records at once
3. **Database Indexing** - Index on Agent.name and Agent.date
4. **Caching** - Cache upload history if queried frequently
5. **Pagination** - Always paginate history (default 20 per page)
6. **Monitoring** - Monitor memory usage for large files
7. **Compression** - Compress response if > 1MB (already handled by Express)

---

## Know Before You Code

| Question | Answer | Reference |
|----------|--------|-----------|
| How many files created? | 10 files | MODULAR_ARCHITECTURE_GUIDE.md |
| Lines of code total? | 1090 lines | MODULAR_REFACTORING_SUMMARY.md |
| Max file size allowed? | 10MB | multerConfig.js |
| Time format required? | HH:MM:SS | dataValidationService.js |
| Are files saved to disk? | NO, memory only | uploadController.js |
| Is database required? | YES (MongoDB) | databaseService.js |
| Can tests run parallel? | YES, each layer independent | ARCHITECTURE_VISUAL_GUIDE.md |
| What about rollback? | Delete records with confirm=true | uploadController.js |

---

**Keep this card handy for quick reference!** 📋

Generated: April 20, 2026  
Architecture: Modular & Scalable  
Status: Production Ready ✅
