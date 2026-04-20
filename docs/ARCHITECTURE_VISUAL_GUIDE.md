# 📊 MODULAR ARCHITECTURE VISUAL GUIDE

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT REQUEST                              │
│  (Browser / Mobile / PostMan / cURL)                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ↓
         ┌───────────────────────────────────────────┐
         │         LAYER 1: ROUTES                   │
         │     (uploadRoutes.js)                     │
         │                                           │
         │  Define HTTP method & path               │
         │  Compose middleware chain                │
         │  Delegate to controller                  │
         └───────────────┬───────────────────────────┘
                         │
         ┌───────────────↓───────────────────────────────┐
         │         LAYER 2: MIDDLEWARE                   │
         │                                               │
         │  ┌──────────────────────────────────────────┐ │
         │  │ authMiddleware                           │ │
         │  │ └─ Verify JWT token                     │ │
         │  └──────────────────────────────────────────┘ │
         │                                               │
         │  ┌──────────────────────────────────────────┐ │
         │  │ multer.single('file')                    │ │
         │  │ └─ Upload file to memory (req.file)     │ │
         │  └──────────────────────────────────────────┘ │
         │                                               │
         │  ┌──────────────────────────────────────────┐ │
         │  │ multerErrorHandler                       │ │
         │  │ └─ Handle file upload errors            │ │
         │  └──────────────────────────────────────────┘ │
         │                                               │
         │  ┌──────────────────────────────────────────┐ │
         │  │ validateFileBeforeUpload                 │ │
         │  │ └─ Check: file exists? ext valid? size? │ │
         │  └──────────────────────────────────────────┘ │
         │                                               │
         │  ┌──────────────────────────────────────────┐ │
         │  │ validateUploadMetadata                   │ │
         │  │ └─ Check: date format? flags valid?     │ │
         │  └──────────────────────────────────────────┘ │
         │                                               │
         └───────────────┬────────────────────────────────┘
                         │
         ┌───────────────↓───────────────────────────────┐
         │         LAYER 3: CONTROLLER                   │
         │     (uploadController.js)                     │
         │                                               │
         │  uploadPerformanceData(req, res)              │
         │  ├─ Extract data from request                │
         │  ├─ Call services in sequence                │
         │  ├─ Handle errors at each step               │
         │  └─ Format and send response                 │
         │                                               │
         └───────────────┬────────────────────────────────┘
                         │
         ┌───────────────↓──────────────────────────────────┐
         │         LAYER 4: SERVICES                        │
         │     (Each with ONE responsibility)              │
         │                                                  │
         │  ┌─────────────────────────────────────────┐   │
         │  │ excelParserService                      │   │
         │  │ └─ Parse buffer → JSON                 │   │
         │  │   (ONLY parsing)                       │   │
         │  └─────────────────────────────────────────┘   │
         │                          ↓                      │
         │  ┌─────────────────────────────────────────┐   │
         │  │ dataValidationService                   │   │
         │  │ └─ Validate structure & data           │   │
         │  │   (ONLY validation)                    │   │
         │  └─────────────────────────────────────────┘   │
         │                          ↓                      │
         │  ┌─────────────────────────────────────────┐   │
         │  │ performanceCalculationService           │   │
         │  │ └─ Calculate metrics & stats           │   │
         │  │   (ONLY calculation)                   │   │
         │  └─────────────────────────────────────────┘   │
         │                          ↓                      │
         │  ┌─────────────────────────────────────────┐   │
         │  │ databaseService                         │   │
         │  │ └─ Upsert, delete, query records      │   │
         │  │   (ONLY database CRUD)                 │   │
         │  └─────────────────────────────────────────┘   │
         │                                                  │
         └───────────────┬──────────────────────────────────┘
                         │
         ┌───────────────↓──────────────────────────────┐
         │         LAYER 5: UTILITIES                    │
         │     (Helper functions - Reusable)           │
         │                                              │
         │  ┌──────────────────────────────────────┐   │
         │  │ fileUtils.js                         │   │
         │  │ ├─ generateFileHash()               │   │
         │  │ ├─ getFileExtension()               │   │
         │  │ └─ getFileType()                    │   │
         │  └──────────────────────────────────────┘   │
         │                                              │
         │  ┌──────────────────────────────────────┐   │
         │  │ dateUtils.js                         │   │
         │  │ ├─ parseDate()                      │   │
         │  │ ├─ getStartOfDay()                  │   │
         │  │ ├─ getEndOfDay()                    │   │
         │  │ └─ extractDateFromFileName()        │   │
         │  └──────────────────────────────────────┘   │
         │                                              │
         │  ┌──────────────────────────────────────┐   │
         │  │ calculateScore.js (existing)         │   │
         │  │ └─ Score calculation formula        │   │
         │  └──────────────────────────────────────┘   │
         │                                              │
         └───────────────┬──────────────────────────────┘
                         │
         ┌───────────────↓──────────────────────────┐
         │         LAYER 6: DATABASE                │
         │     (MongoDB)                            │
         │                                          │
         │  ┌────────────────────────────────────┐ │
         │  │ Agent collection                   │ │
         │  │ (Performance records)              │ │
         │  └────────────────────────────────────┘ │
         │                                          │
         │  ┌────────────────────────────────────┐ │
         │  │ UploadHistory collection           │ │
         │  │ (Audit trail)                      │ │
         │  └────────────────────────────────────┘ │
         │                                          │
         └───────────────┬──────────────────────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │      RESPONSE TO CLIENT        │
         │  (JSON with success/error)    │
         └───────────────────────────────┘
```

---

## Request Flow Detail: POST Upload

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT SENDS REQUEST                                         │
│    POST /api/uploads/performance                                │
│    Headers: Authorization: Bearer <token>                       │
│    Body: FormData { file: <xlsx>, dataDate: "2026-04-20" }     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────────────┐
│ 2. ROUTE MATCHES uploadRoutes.js                              │
│    router.post('/performance', ...)                           │
│    Middleware chain activated (order matters!)                │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────↓──────────────┐
        │ MIDDLEWARE #1: AUTH       │
        │ authMiddleware            │
        │ ✓ Token verified          │
        │ ✓ User extracted          │
        │ ✓ Passed to next()        │
        └────────────↓──────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ MIDDLEWARE #2: FILE UPLOAD                │
        │ multer.single('file')                     │
        │ ✓ File uploaded to RAM                    │
        │ ✓ Available as req.file.buffer            │
        │ ✓ 45 KB file in memory (not disk!)       │
        │ ✓ Passed to next()                        │
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ MIDDLEWARE #3: MULTER ERROR HANDLER       │
        │ multerErrorHandler                        │
        │ ✓ No errors from multer                   │
        │ ✓ Passed to next()                        │
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ MIDDLEWARE #4: FILE VALIDATION            │
        │ validateFileBeforeUpload                  │
        │ ✓ File exists in req.file                 │
        │ ✓ Size: 45 KB < 10 MB ✓                   │
        │ ✓ Extension: .xlsx is in [.xlsx,.xls,...] │
        │ ✓ Passed to next()                        │
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ MIDDLEWARE #5: METADATA VALIDATION        │
        │ validateUploadMetadata                    │
        │ ✓ dataDate format: YYYY-MM-DD ✓           │
        │ ✓ overwriteDate: boolean ✓                │
        │ ✓ All checks passed                       │
        │ ✓ Passed to next()                        │
        └────────────↓──────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────────────┐
│ 3. CONTROLLER: uploadPerformanceData()                        │
│    Now all validation done, time to process data              │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ STEP 1: VALIDATE EXCEL FORMAT             │
        │ excelParserService.isValidExcelBuffer()   │
        │ ✓ Magic bytes check: 0x50 0x4B (XLSX)     │
        │ ✓ File format: VALID                      │
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ STEP 2: PARSE EXCEL                       │
        │ excelParserService.parseExcelToJson()     │
        │ Input: fileBuffer (binary data)           │
        │ ✓ XLSX.read(buffer, {type:'buffer'})      │
        │ ✓ Extract first sheet                     │
        │ ✓ sheet_to_json()                         │
        │ Output: 50 objects                        │
        │ [{Agent Name: 'John', TTT: '01:30:00'...}]│
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ STEP 3: VALIDATE DATA STRUCTURE           │
        │ dataValidationService.validateData...()   │
        │ ✓ Check required columns present          │
        │ ✓ Check headers match                     │
        │ ✓ Check each row for:                     │
        │   - Agent Name not empty                  │
        │   - Time format HH:MM:SS                  │
        │   - All required fields                   │
        │ ✓ Result: valid=true, errors=[]          │
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ STEP 4: CALCULATE PERFORMANCE             │
        │ performanceCalc.transform...()            │
        │ For each record:                          │
        │ ✓ convertToSeconds('01:30:00') → 5400s    │
        │ ✓ convertToSeconds('08:00:00') → 28800s   │
        │ ✓ convertToSeconds('00:30:00') → 1800s    │
        │ ✓ calculateScore(5400, 28800, 1800)       │
        │ ✓ Score = (5400/(28800-1800))*100 = 20.0  │
        │ Output: 50 records with performanceScore  │
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ STEP 5: HANDLE OVERWRITE FLAG             │
        │ if (overwriteDate) {                      │
        │   databaseService.deleteAgent...()        │
        │   ✓ Delete all records for 2026-04-20    │
        │ }                                          │
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ STEP 6: UPSERT RECORDS                    │
        │ databaseService.upsertAgentRecords()      │
        │ For each record:                          │
        │ ✓ Agent.findOneAndUpdate({...}, {...})    │
        │ ✓ 50 inserts attempted                    │
        │ ✓ 45 records inserted (NEW)               │
        │ ✓ 5 records updated (existed)             │
        │ Result: {inserted:45, updated:5, failed:0}│
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ STEP 7: SAVE AUDIT TRAIL                  │
        │ databaseService.saveUploadHistory()       │
        │ ✓ Create UploadHistory record             │
        │ ✓ fileName, fileSize, fileHash, etc.      │
        │ ✓ Saved successfully                      │
        └────────────↓──────────────────────────────┘
                     │
        ┌────────────↓──────────────────────────────┐
        │ STEP 8: CALCULATE STATISTICS              │
        │ performanceCalc.calculateStatistics()     │
        │ ✓ Total: 50 records                       │
        │ ✓ Average: 85.5%                          │
        │ ✓ Highest: 98.2%                          │
        │ ✓ Lowest: 45.3%                           │
        └────────────↓──────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────────────┐
│ 4. RESPONSE FORMATTED & SENT                                 │
│    res.status(201).json({                                     │
│      success: true,                                           │
│      message: "Performance data uploaded successfully",       │
│      data: {                                                  │
│        recordsProcessed: 50,                                  │
│        recordsInserted: 45,                                   │
│        recordsUpdated: 5,                                     │
│        dataDate: "2026-04-20",                               │
│        processingTime: "245ms",                              │
│        statistics: {...}                                      │
│      }                                                         │
│    })                                                          │
└────────────────────────────────────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────────────┐
│ 5. CLIENT RECEIVES RESPONSE                                  │
│    ✅ Success! Data stored in MongoDB                         │
│    ✅ NO files on disk (memory storage!)                      │
│    ✅ Complete audit trail in UploadHistory                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
ERROR OCCURS AT ANY POINT:

┌──────────────────────────┐
│ Middleware Error         │
│ e.g., file too large     │
└────────┬─────────────────┘
         │
         ↓
    ┌─────────────┐
    │ Return 413  │
    │ "File too   │
    │ large"      │
    └─────────────┘

┌──────────────────────────┐
│ Service Error            │
│ e.g., invalid Excel      │
└────────┬─────────────────┘
         │
         ↓
    ┌─────────────────────┐
    │ Controller catches  │
    │ Log error           │
    │ Return 400          │
    │ "Invalid Excel"     │
    └─────────────────────┘

┌──────────────────────────┐
│ Database Error           │
│ e.g., MongoDB down       │
└────────┬─────────────────┘
         │
         ↓
    ┌─────────────────────┐
    │ Service throws      │
    │ Controller catches  │
    │ Log error           │
    │ Return 500          │
    │ "Database error"    │
    └─────────────────────┘

RESULT: Clear error message to client, detailed logging for debugging
```

---

## Data Transformation

```
RAW FILE DATA:
┌─────────────────────────────────────────┐
│ Agent Name│TTT (hh:mm:ss)│LIT│BTD     │
├─────────────────────────────────────────┤
│ John      │ 01:30:00     │08:00:00 │... │
│ Jane      │ 02:15:00     │08:30:00 │... │
│ Bob       │ 01:00:00     │07:30:00 │... │
└─────────────────────────────────────────┘
           │
           ↓ (excelParserService)
JSON ARRAY:
[
  { "Agent Name": "John", "Total Talk Time (hh:mm:ss)": "01:30:00", ... },
  { "Agent Name": "Jane", "Total Talk Time (hh:mm:ss)": "02:15:00", ... },
  { "Agent Name": "Bob", "Total Talk Time (hh:mm:ss)": "01:00:00", ... }
]
           │
           ↓ (dataValidationService)
VALIDATED:
{valid: true, errors: [], rowsValid: 3}
           │
           ↓ (performanceCalculationService)
CALCULATED:
[
  { name: "John", talkTime: 5400, loggedInTime: 28800, breakTime: 1800, performanceScore: 20.0 },
  { name: "Jane", talkTime: 8100, loggedInTime: 30600, breakTime: 1800, performanceScore: 28.0 },
  { name: "Bob", talkTime: 3600, loggedInTime: 27000, breakTime: 1800, performanceScore: 14.5 }
]
           │
           ↓ (databaseService)
STORED IN MONGODB:
Agent collection:
{
  _id: ObjectId(...),
  name: "John",
  date: ISODate("2026-04-20"),
  talkTime: 5400,
  loggedInTime: 28800,
  breakTime: 1800,
  performanceScore: 20.0,
  updatedAt: ISODate(...)
}
```

---

## Service Responsibilities (SRP)

```
FILE VALIDATION MIDDLEWARE
├─ Check file exists ✓
├─ Check extension is .xlsx/.xls/.csv ✓
├─ Check file size < 10MB ✓
└─ NO parsing, NO validation, NO calculation

MULTER CONFIG
├─ Setup memory storage ✓
├─ Handle upload errors ✓
└─ NO file processing

EXCEL PARSER SERVICE
├─ Parse buffer to JSON ✓
├─ Extract first sheet ✓
├─ Convert to objects ✓
└─ NO validation, NO calculation

DATA VALIDATION SERVICE
├─ Check required columns ✓
├─ Check data types ✓
├─ Check field formats ✓
└─ NO parsing, NO calculation

PERFORMANCE CALCULATION SERVICE
├─ Convert times to seconds ✓
├─ Calculate scores ✓
├─ Format output ✓
└─ NO validation, NO database

DATABASE SERVICE
├─ Upsert records ✓
├─ Delete records ✓
├─ Query records ✓
└─ NO validation, NO calculation

CONTROLLER
├─ Call services in order ✓
├─ Handle errors ✓
├─ Format response ✓
└─ NO business logic inside

ROUTES
├─ Define paths ✓
├─ Compose middleware ✓
├─ Delegate to controller ✓
└─ NO logic processing
```

---

This architecture ensures:
- ✅ **Single Responsibility** - Each component has ONE job
- ✅ **Easy Testing** - Test each layer independently
- ✅ **Easy Debugging** - Errors have clear origin
- ✅ **Easy Scaling** - Add features without modifying existing code
- ✅ **Enterprise Ready** - Production-grade structure

🚀 **Your project is now truly modular and scalable!**
