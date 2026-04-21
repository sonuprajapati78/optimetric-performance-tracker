# 📋 MERN Project Quick Reference - Cheat Sheet

**One-page visual guide to understand your project structure and flow**

---

## 🎯 PROJECT AT A GLANCE

```
WHAT IS THIS PROJECT?
A Performance Tracking System that lets users:
- Upload Excel files with performance data
- View dashboards and analytics
- Track employee/agent metrics
- Generate reports
- Manage uploads

BUILT WITH: React (Frontend) + Node.js/Express (Backend) + MongoDB (Database)
RUNNING ON: Docker containers
```

---

## 🔄 REQUEST FLOW (How It Works)

```
┌─────────────────┐
│  USER CLICKS    │
│   A BUTTON      │
└────────┬────────┘
         ↓
    ┌────────────────────────────────┐
    │  FRONTEND (React)              │
    │  client/src/components/        │
    │  └─ FileUpload.js              │
    └────────┬───────────────────────┘
             ↓ (Call API)
    ┌────────────────────────────────┐
    │  API SERVICE LAYER             │
    │  client/src/services/api.js    │
    │  └─ axios.post(...)            │
    └────────┬───────────────────────┘
             ↓ (HTTP Request)
    ┌────────────────────────────────┐
    │  BACKEND (Express)             │
    │  server/src/app.js             │
    │  └─ Middleware + Routes        │
    └────────┬───────────────────────┘
             ↓ (Finds Route)
    ┌────────────────────────────────┐
    │  ROUTES                        │
    │  server/src/routes/            │
    │  uploadRoutes.js               │
    └────────┬───────────────────────┘
             ↓ (Calls Controller)
    ┌────────────────────────────────┐
    │  CONTROLLERS                   │
    │  server/src/controllers/       │
    │  uploadController.js           │
    └────────┬───────────────────────┘
             ↓ (Calls Service)
    ┌────────────────────────────────┐
    │  SERVICES                      │
    │  server/src/services/          │
    │  excelParserService.js         │
    └────────┬───────────────────────┘
             ↓ (Queries Database)
    ┌────────────────────────────────┐
    │  MODELS (Schemas)              │
    │  server/src/models/            │
    │  UploadHistory.js              │
    └────────┬───────────────────────┘
             ↓ (Stores Data)
    ┌────────────────────────────────┐
    │  MONGODB (Database)            │
    │  Collections & Documents       │
    └────────┬───────────────────────┘
             ↓ (Returns Data)
    (Response travels back up)
             ↓
    ┌────────────────────────────────┐
    │  FRONTEND UPDATES              │
    │  Component state changes       │
    │  UI re-renders                 │
    └────────────────────────────────┘
```

---

## 📂 FOLDER STRUCTURE (What Goes Where?)

```
project-root/
│
├── client/                    ← FRONTEND (React)
│   ├── src/
│   │   ├── components/        ← Buttons, forms, dashboards
│   │   ├── services/          ← API calls (axios)
│   │   ├── utils/             ← Helper functions
│   │   ├── hooks/             ← Custom React hooks
│   │   └── config/            ← API configuration
│   ├── public/                ← Static files
│   ├── .env                   ← Frontend settings (API URL)
│   └── Dockerfile             ← Docker configuration
│
├── server/                    ← BACKEND (Express + Node.js)
│   ├── src/
│   │   ├── controllers/       ← Handle requests (MVC)
│   │   ├── routes/            ← API endpoints
│   │   ├── models/            ← Database schemas (MVC)
│   │   ├── services/          ← Business logic
│   │   ├── middleware/        ← Auth, validation
│   │   ├── config/            ← Database config
│   │   ├── utils/             ← Helper functions
│   │   └── app.js             ← Express setup
│   ├── uploads/               ← Uploaded files storage
│   ├── tests/                 ← Test files
│   ├── .env                   ← Backend settings (DB, JWT)
│   └── Dockerfile             ← Docker configuration
│
├── docker-compose.yml         ← Run everything in Docker
├── .env.example               ← Template for environment vars
└── README.md                  ← Project documentation
```

---

## 🎮 COMMAND CHEAT SHEET

```
START DEVELOPMENT:
$ docker-compose up                 ← Start all services

STOP:
$ docker-compose down               ← Stop all services

VIEW LOGS:
$ docker-compose logs -f server     ← See backend logs
$ docker-compose logs -f client     ← See frontend logs

BUILD:
$ docker-compose build              ← Rebuild containers

LOCAL DEVELOPMENT (Without Docker):
$ cd server && npm run dev          ← Start backend
$ cd client && npm start            ← Start frontend

TEST BACKEND:
$ curl http://localhost:5000/health ← Check if running
$ curl http://localhost:3000        ← Check frontend

SETUP:
$ cp .env.example .env              ← Create env file
$ npm install                        ← Install dependencies
```

---

## 🔌 API ENDPOINTS (Communication Points)

```
Endpoint                    Method    Controller
────────────────────────────────────────────────────────
/api/v1/uploads            POST      uploadController.handleUpload
/api/v1/uploads/:id        GET       uploadController.getUpload
/api/v1/performance        GET       performanceController.getData
/api/v1/dashboard          GET       dashboardController.getStats
/api/v1/auth/login         POST      authController.login
/api/v1/auth/register      POST      authController.register
/api/v1/reports            GET       reportController.getReports
/health                    GET       Health check

BASE URL: http://localhost:5000
(Defined in client/.env as REACT_APP_API_URL)
```

---

## 🏗️ MVC PATTERN EXPLAINED

```
MODEL                    VIEW                    CONTROLLER
(Database)              (User Interface)         (Logic)

UploadHistory.js        client/components/      uploadController.js
└─ Schema              └─ FileUpload.js         └─ Handles requests
└─ Validation          └─ Shows UI              └─ Calls services
└─ Methods             └─ Gets data             └─ Sends response

         │                    │                      │
         └────────────────────┴──────────────────────┘
                  They communicate together
```

---

## 📊 DATA FLOW FOR UPLOAD REQUEST

```
USER UPLOADS FILE:

Frontend (React):
  FileUpload.js → User selects Excel file
  ↓
  api.js → axios.post('/api/v1/uploads', formData)
  ↓
  
Backend (Express):
  app.js → Receives request with JWT token
  ↓
  authMiddleware.js → Validates user
  ↓
  uploadRoutes.js → Matches /api/v1/uploads POST
  ↓
  uploadController.js → 
    - Validates file
    - Calls excelParserService
  ↓
  excelParserService.js →
    - Reads Excel file
    - Extracts data rows
    - Validates each row
  ↓
  UploadHistory Model →
    - Saves to MongoDB
  ↓
  uploadController.js →
    - Returns success response
  ↓
  
Frontend receives response:
  - State updates
  - Dashboard re-renders
  - Shows new data
```

---

## ⚠️ COMMON ERRORS & FIXES

```
ERROR                          CAUSE                    FIX
──────────────────────────────────────────────────────────────
Cannot POST /api/v1/uploads   Route not found          Check route spelling in server/src/routes/
CORS error                    Backend not responding   Start backend: docker-compose up
JWT token invalid             Token expired            Login again
MongoDB connection failed     DB not running           docker-compose up mongodb
File upload fails             Invalid file format      Check excelParserService validation
Cannot read property          Model field missing      Check schema in models/
504 Gateway timeout           Backend too slow         Check server logs
```

---

## 🔐 AUTHENTICATION FLOW

```
1. USER LOGS IN
   ↓
2. Frontend sends username/password to /api/v1/auth/login
   ↓
3. Backend validates in database
   ↓
4. If valid, generates JWT token
   ↓
5. Returns token to frontend
   ↓
6. Frontend stores token in localStorage
   ↓
7. Every request includes: Authorization: Bearer <token>
   ↓
8. Backend verifies token in authMiddleware
   ↓
9. If valid, request proceeds
   If invalid, returns 401 Unauthorized
```

---

## 📦 KEY FILES (What to Study First)

```
START HERE (In Order):

1. server/src/app.js
   └─ Express setup, middleware, routes

2. server/src/routes/uploadRoutes.js
   └─ API endpoint definitions

3. server/src/controllers/uploadController.js
   └─ Request handling logic

4. server/src/services/excelParserService.js
   └─ Business logic (parsing Excel)

5. server/src/models/UploadHistory.js
   └─ Database schema definition

OPTIONAL (Advanced):

6. client/src/services/api.js
   └─ Frontend API communication

7. server/src/middleware/authMiddleware.js
   └─ Authentication & authorization

8. server/src/models/Employee.js & Agent.js
   └─ Other database models
```

---

## 🧪 TESTING THE SYSTEM

```
Check if running:
$ curl http://localhost:5000/health        ✓ Backend working
$ curl http://localhost:3000               ✓ Frontend working
$ docker ps | grep mongo                   ✓ MongoDB running

Test API endpoint:
$ curl -X GET http://localhost:5000/api/v1/performance
(Use Postman app for easier testing)

Check Frontend:
Open http://localhost:3000 in browser
(Look for any red errors in console)
```

---

## 📊 DATABASE COLLECTIONS (What's Stored)

```
MongoDB Collections:

agents
├── agentId
├── name
├── email
├── performance_metrics
└── last_updated

employees  
├── employeeId
├── name
├── email
├── department
└── performance_score

uploadhistories
├── uploadId
├── filename
├── uploadedAt
├── rows_processed
└── status

users
├── userId
├── email
├── password (hashed with bcryptjs)
└── createdAt
```

---

## 🔍 DEBUGGING CHECKLIST

```
App not working? Check in order:

□ Is Docker running?
  docker ps

□ Are all services up?
  docker-compose logs

□ Can you reach frontend?
  http://localhost:3000

□ Can you reach backend?
  http://localhost:5000/health

□ Check browser console for errors
  F12 → Console tab

□ Check backend logs for errors
  docker-compose logs -f server

□ Is .env file configured?
  cat .env | grep MONGO_URI

□ Is MongoDB connected?
  docker-compose logs mongodb

□ Check docker container health
  docker ps (all should be "Up")
```

---

## 🚀 QUICK START (3 STEPS)

```
1. START EVERYTHING
   $ docker-compose up

2. WAIT 30 SECONDS
   (Services starting up)

3. OPEN IN BROWSER
   http://localhost:3000

DONE! 🎉
```

---

## 📚 FILE CATEGORIES

```
Configuration Files (Set once):
├── .env                    ← Environment variables
├── docker-compose.yml      ← Container setup
└── package.json            ← Dependencies

Application Files (Change often):
├── server/src/controllers/ ← Business logic
├── server/src/routes/      ← API endpoints
├── client/src/components/  ← UI components
└── server/src/services/    ← Business rules

Database Files (Schema):
├── server/src/models/      ← Schemas
└── server/src/middleware/  ← Auth & validation

Documentation (Reference):
├── README.md               ← Overview
├── PROJECT-STRUCTURE.md    ← Structure
└── BEGINNER-GUIDE.md       ← Learning guide
```

---

## 💡 REMEMBER

✅ Frontend talks to Backend via HTTP REST API  
✅ Backend talks to Database via Mongoose  
✅ MVC Pattern: Models (Data) → Views (UI) → Controllers (Logic)  
✅ Docker makes everything easy to manage  
✅ Start with app.js, routes, and controllers  
✅ Check logs when something breaks  
✅ Save your .env file, never commit it  
✅ Test with Postman or curl before frontend  

---

## 🎓 LEARNING PROGRESSION

```
Day 1: Understand data flow (read this cheat sheet)
Day 2: Study the 5 key files
Day 3: Make a small change (modify a controller)
Day 4: Add a new endpoint
Day 5: Debug an error
```

---

**Print This Page For Quick Reference! 📌**

**Master one section at a time → Build understanding gradually → Gain confidence! 🚀**
