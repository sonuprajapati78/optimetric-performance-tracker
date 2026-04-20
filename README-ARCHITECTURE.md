# Performance Tracker - Full Stack Architecture

```
performance-tracker/
│
├── 📱 FRONTEND (React)
│   └── frontend/
│       ├── package.json
│       ├── README.md
│       ├── public/
│       │   └── index.html
│       ├── src/
│       │   ├── index.js
│       │   ├── App.js
│       │   ├── App.css
│       │   ├── components/        # React components
│       │   └── services/          # API calls
│       └── build/                 # Production build
│
├── 🔧 BACKEND (Node.js/Express)
│   ├── src/
│   │   ├── app.js                 # Main app entry
│   │   ├── app-production.js      # Production-ready version
│   │   ├── constants.js
│   │   ├── config/
│   │   │   └── index.js           # Environment config
│   │   ├── middleware/
│   │   │   └── errorHandler-production.js
│   │   ├── middlewares/
│   │   │   └── multerConfig-production.js
│   │   ├── routes/
│   │   │   └── performanceRoutes-production.js
│   │   ├── controllers/
│   │   │   └── performanceController-production.js
│   │   ├── services/
│   │   │   ├── performanceCalculationService-production.js
│   │   │   ├── performanceService-production.js
│   │   │   └── excelParserService-production.js
│   │   ├── models/
│   │   │   └── Agent.js           # Database schema
│   │   └── utils/
│   │       ├── calculateScore.js
│   │       ├── convertToSeconds.js
│   │       ├── logger.js
│   │       └── ... other utilities
│   ├── package.json               # Backend dependencies
│   ├── README.md                  # Backend setup guide
│   └── .env                       # Environment variables
│
├── 📚 DOCUMENTATION
│   └── docs/
│       ├── PRODUCTION_MODULAR_STRUCTURE.md
│       ├── QUICK_INTEGRATION_PRODUCTION.md
│       └── IMPLEMENTATION_CHECKLIST.md
│
├── 🐳 DOCKER
│   ├── Dockerfile                 # Backend container
│   ├── frontend/Dockerfile        # Frontend container
│   └── docker-compose.yml         # Compose configuration
│
├── 📦 PROJECT CONFIGURATION
│   ├── package.json               # ROOT - Both frontend & backend scripts
│   ├── README.md                  # Main project README
│   └── .env                       # Configuration
│
└── uploads/                       # NOT USED (memoryStorage)
```

---

## 🚀 Quick Start (Both Parts)

### Option 1: Run Both Together
```bash
# Terminal 1: Backend
cd c:\internship
npm install
npm run dev          # Starts backend on port 5000

# Terminal 2: Frontend
cd c:\internship\frontend
npm install
npm start            # Starts frontend on port 3000
```

### Option 2: Run Separately

#### Backend Only
```bash
cd c:\internship
npm install
npm run dev          # http://localhost:5000
```

#### Frontend Only
```bash
cd c:\internship\frontend
npm install
npm start            # http://localhost:3000
```

---

## 🔌 API Communication

**Frontend** (React on port 3000) → **Backend** (Express on port 5000)

### Backend Endpoints:
```
POST   /api/v1/performance/upload    - Upload Excel
GET    /api/v1/performance/report    - Get Report
DELETE /api/v1/performance/reset     - Reset Data
```

### Frontend Services:
Location: `frontend/src/services/`
- Axios calls to backend
- Error handling
- Response formatting

---

## 📁 Part 1: BACKEND

**Location:** `c:\internship/src`

### What it does:
- ✅ Accept Excel file uploads
- ✅ Parse and calculate performance metrics
- ✅ Store in MongoDB
- ✅ Serve performance reports
- ✅ Reset data

### Start Backend:
```bash
cd c:\internship
npm install
npm run dev
```

### Test Backend:
```bash
# Check health
curl http://localhost:5000/health

# Upload file
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@test.xlsx"

# Get report
curl http://localhost:5000/api/v1/performance/report
```

### Key Files:
- `app-production.js` - Main application
- `src/routes/*` - API endpoints
- `src/controllers/*` - Request handlers
- `src/services/*` - Business logic

---

## 📁 Part 2: FRONTEND

**Location:** `c:\internship/frontend`

### What it does:
- ✅ Upload Excel file UI
- ✅ Display performance dashboard
- ✅ Show top performers
- ✅ Reset data button

### Start Frontend:
```bash
cd c:\internship/frontend
npm install
npm start
```

### Access Frontend:
Open `http://localhost:3000` in browser

### Key Files:
- `src/App.js` - Main component
- `src/components/*` - React components
- `src/services/*` - API calls

---

## 🔗 Communication Flow

```
Browser (Frontend: 3000)
        ↓
React App (App.js)
        ↓
Upload Component
        ↓
Axios POST to Backend
        ↓
Express Backend (5000)
        ↓
Excel Parser
        ↓
Calculate Performance
        ↓
Save to MongoDB
        ↓
JSON Response
        ↓
Frontend Updates UI
```

---

## ⚙️ Environment Setup

### .env (Backend)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/performance-tracker
CORS_ORIGIN=http://localhost:3000
API_VERSION=v1
LOG_LEVEL=info
```

### Frontend Configuration
In `frontend/src/services/api.js`:
```javascript
const BASE_URL = 'http://localhost:5000/api/v1';
```

---

## 📊 Data Flow

### Upload Flow:
1. User selects Excel file (Frontend)
2. Frontend sends POST to `/api/v1/performance/upload`
3. Backend receives file in memory (multer)
4. Parses Excel and calculates scores
5. Saves to MongoDB
6. Returns success response
7. Frontend updates UI with results

### Report Flow:
1. Frontend loads dashboard
2. Sends GET to `/api/v1/performance/report?limit=10`
3. Backend queries MongoDB
4. Returns top performers sorted
5. Frontend displays charts/tables

---

## 🐳 Docker Setup

### Build Both Containers
```bash
docker-compose up -d
```

### Frontend Container
- Image: Runs React app in production
- Port: 3000
- Build: `npm run build`

### Backend Container
- Image: Runs Node.js/Express
- Port: 5000
- Build: `npm install && npm start`

---

## 📝 Development Guidelines

### Backend Development:
- Edit files in `src/`
- Server auto-restarts (with nodemon)
- Check logs in terminal

### Frontend Development:
- Edit files in `frontend/src/`
- Hot reload enabled
- Check browser console

### Both Running:
- Backend on 5000
- Frontend on 3000
- React proxy configured

---

## 🧪 Testing

### Backend Tests:
```bash
cd c:\internship
npm test
```

### Frontend Tests:
```bash
cd c:\internship\frontend
npm test
```

### Integration Test:
1. Start backend: `npm run dev`
2. Start frontend: `npm start`
3. Upload file via UI
4. Check results

---

## 📚 Documentation

### Backend Docs:
- `src/README.md` - Backend setup
- `docs/PRODUCTION_MODULAR_STRUCTURE.md` - Architecture
- `docs/QUICK_INTEGRATION_PRODUCTION.md` - Integration

### Frontend Docs:
- `frontend/README.md` - Frontend setup

### Full Project Docs:
- This file - Overview
- Main `README.md` - Project information

---

## 🔐 Security Notes

### Backend:
- CORS configured to allow only frontend origin
- File upload limited to 10MB
- Input validation on all endpoints
- Error messages don't expose internals

### Frontend:
- API calls through axios with error handling
- No sensitive data in localStorage
- Environment variables for API base URL

---

## 🚀 Production Deployment

### Backend:
```bash
NODE_ENV=production npm start
```

### Frontend:
```bash
npm run build
# Deploy 'build' folder to static hosting (Vercel, Netlify, etc.)
```

### With Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🆘 Troubleshooting

### Frontend won't connect to backend?
- Check backend running on 5000: `curl http://localhost:5000/health`
- Check CORS_ORIGIN in .env: `http://localhost:3000`
- Check frontend API base URL

### Backend not starting?
- Check MongoDB connection: `MONGO_URI` in .env
- Check port 5000 not in use: `netstat -ano | findstr :5000`
- Check dependencies: `npm install`

### Files upload fails?
- Check file size < 10MB
- Check file format: .xlsx or .csv
- Check backend logs for details

---

## 📋 Checklist

Before deployment:
- [ ] Backend running on 5000
- [ ] Frontend running on 3000
- [ ] Upload endpoint works
- [ ] Report endpoint works
- [ ] Reset endpoint works
- [ ] CORS configured
- [ ] MongoDB connected
- [ ] Environment variables set

---

**Now your project is clearly divided! 🎉**
