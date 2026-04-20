# Performance Tracker - Full Stack Application

**Production-Ready Performance Analysis System**

```
  📊 PERFORMANCE TRACKER
  
  🔧 Backend (Node.js/Express)     📱 Frontend (React)
     Port: 5000                        Port: 3000
     API Server                        Dashboard UI
```

---

## 🎯 Project Overview

A complete full-stack application for tracking and analyzing agent performance metrics.

### Features:
✅ Upload Excel performance data  
✅ Automatic score calculation  
✅ MongoDB data persistence  
✅ Performance ranking & reporting  
✅ Real-time dashboard  
✅ Data reset capability  

---

## 📁 Project Structure - Frontend & Backend Divided

```
performance-tracker/
│
├── 🔧 BACKEND (Node.js/Express)
│   ├── src/
│   │   ├── app-production.js      ← USE THIS
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── package.json
│   └── BACKEND-README.md
│
├── 📱 FRONTEND (React)
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   └── services/
│   ├── package.json
│   └── FRONTEND-README.md
│
├── 📚 DOCUMENTATION
│   ├── docs/
│   ├── README-ARCHITECTURE.md
│   └── README.md (this file)
│
└── 🐳 CONFIGURATION
    ├── package.json (root)
    ├── .env
    └── docker-compose.yml
```

---

## 🚀 Quick Start (5 Minutes)

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 3. Start Backend (Terminal 1)

```bash
cd backend
npm start
# Backend runs on http://localhost:5000
```

### 4. Start Frontend (Terminal 2)

```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000 (auto-opens in browser)
```

### ✅ Access the App
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health

---

## 📖 Architecture Overview

**See [CLIENT_SERVER_ARCHITECTURE.md](CLIENT_SERVER_ARCHITECTURE.md) for complete architecture guide!**

### Quick Explanation

```
Frontend (React)              Backend (Node.js)           Database (MongoDB)
┌──────────────────┐         ┌──────────────────┐        ┌──────────────┐
│  User Interface  │ ◄────► │  Business Logic  │ ◄────► │   Data      │
│  - Components    │  HTTP  │  - Controllers   │        │             │
│  - API Calls     │        │  - Routes        │        │             │
│  - Validation    │        │  - Middleware    │        │             │
│  Port: 3000      │        │  Port: 5000      │        │   Atlas     │
└──────────────────┘        └──────────────────┘        └──────────────┘
```

- **Frontend** (`/frontend`): React app - what users see
- **Backend** (`/backend`): Node.js API - handles data & logic
- **Communication**: HTTP requests/responses (JSON)

**To learn the architecture in detail, read [CLIENT_SERVER_ARCHITECTURE.md](CLIENT_SERVER_ARCHITECTURE.md)**

---

## � Documentation

**Architecture Guide:** [CLIENT_SERVER_ARCHITECTURE.md](CLIENT_SERVER_ARCHITECTURE.md) - **START HERE! Complete beginner's guide to the Client-Server architecture**

**Other Documentation:** See `/docs` folder for all detailed guides:
- Deployment guides
- Feature documentation
- Setup instructions
- API examples
- And more...

---

## 🏗️ Project Structure

```
internship/                            # ROOT DIRECTORY
│
├── 📁 backend/                        [SERVER - Node.js + Express]
│   ├── src/
│   │   ├── app.js                    # Express entry point
│   │   ├── constants.js              # Constants
│   │   ├── routes/                   # 🚦 Traffic Control (6 files)
│   │   ├── controllers/              # 🧠 Business Logic (5 files)
│   │   ├── models/                   # 💾 Database Schema (3 files)
│   │   ├── middleware/               # 🔒 Security/Auth (4 files)
│   │   ├── utils/                    # 🛠️ Helper Functions (4 files)
│   │   └── config/                   # ⚙️ Configuration (1 file)
│   ├── tests/                        # Test files
│   ├── uploads/                      # Upload directory
│   ├── package.json                  # Dependencies
│   ├── package-lock.json             # Lock file
│   ├── .env                          # Environment config
│   ├── .env.example                  # Config template
│   └── .eslintrc.json                # Code quality rules
│
├── 📁 frontend/                       [CLIENT - React App]
│   ├── src/
│   │   ├── components/               # 🎨 UI Components
│   │   ├── services/                 # 🔌 API Calls
│   │   ├── App.js                    # Main component
│   │   ├── index.js                  # React entry point
│   │   ├── App.css                   # App styles
│   │   └── index.css                 # Global styles
│   ├── public/
│   │   ├── index.html                # HTML entry point
│   │   └── favicon.ico
│   ├── package.json                  # React dependencies
│   ├── build/                        # Production build
│   └── README.md                     # Frontend docs
│
├── 📁 docs/                          # Documentation (23 files)
│   ├── README.md                     # Docs index
│   ├── PRODUCTION_DEPLOYMENT.md      # Deployment guide
│   ├── EXCEL_UPLOAD_SYSTEM.md        # Feature guide
│   └── ... (20 more documentation files)
│
├── 📄 README.md                      # Main documentation
├── 📄 CLIENT_SERVER_ARCHITECTURE.md  # Architecture guide ⭐ READ THIS!
└── 📄 .gitignore                     # Git ignore rules
```

**See [CLIENT_SERVER_ARCHITECTURE.md](CLIENT_SERVER_ARCHITECTURE.md) for detailed structure explanation!**

---

## 🔌 API Endpoints

### Health & Monitoring
```
GET  /                    # API info and status
GET  /health             # Health check
GET  /ready              # Readiness check (includes DB)
```

### Performance Data
```
POST /api/v1/performance/upload
# Download: Upload Excel/CSV file
# Returns: { message, count, errors?: [] }

GET  /api/v1/performance/top-performers?limit=10
# Get top performers by score
# Returns: { data: [{ name, performanceScore, ... }] }
```

### Example Requests

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Upload Data:**
```bash
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@performance_data.xlsx"
```

**Get Top Performers:**
```bash
curl "http://localhost:5000/api/v1/performance/top-performers?limit=10"
```

---

## 📊 File Upload Format

### Supported Formats
- Excel (`.xlsx`)
- CSV (`.csv`)

### Required Columns
| Column | Format | Example |
|--------|--------|---------|
| Agent Name | Text | John Doe |
| Total Talk Time (hh:mm:ss) | HH:MM:SS | 08:30:00 |
| Total Logged In Time (hh:mm:ss) | HH:MM:SS | 09:00:00 |
| Total Break Duration (hh:mm:ss) | HH:MM:SS | 00:30:00 |

### Sample CSV
```csv
Agent Name,Total Talk Time (hh:mm:ss),Total Logged In Time (hh:mm:ss),Total Break Duration (hh:mm:ss)
John Doe,08:30:00,09:00:00,00:30:00
Jane Smith,07:45:00,08:30:00,00:45:00
Bob Johnson,09:15:00,09:30:00,00:15:00
Alice Williams,08:00:00,08:45:00,00:45:00
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

## 🌐 Frontend & Backend Separation

### Frontend (`/frontend`)
- **Purpose:** User interface and user interactions
- **Technology:** React.js
- **Port:** 3000
- **Structure:**
  - `src/components/` - React components
  - `src/services/api.js` - API calls to backend
  - `public/index.html` - HTML entry point

### Backend (`/backend`)
- **Purpose:** Business logic and data management
- **Technology:** Node.js + Express
- **Port:** 5000
- **Structure:**
  - `src/routes/` - API endpoints (traffic control)
  - `src/controllers/` - Business logic
  - `src/models/` - Database schemas
  - `src/middleware/` - Security & validation
  - `src/utils/` - Helper functions
  - `src/config/` - Configuration

**Learn more:** See [CLIENT_SERVER_ARCHITECTURE.md](CLIENT_SERVER_ARCHITECTURE.md)

---

## 🔒 Security

### Implemented
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Error message sanitization
- ✅ MongoDB injection prevention
- ✅ File upload validation
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ Environment variable protection

---

## 🛠️ Development Commands

### Backend
```bash
cd backend
npm start              # Start development server
npm test               # Run tests
```

### Frontend
```bash
cd frontend
npm start              # Start development server
npm test               # Run tests
npm run build          # Create production build
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Ensure MongoDB is running or update MONGO_URI in `.env`

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Update CORS_ORIGIN in `.env` to include `http://localhost:3000`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in `.env` or close the application using that port

---

## 📚 Learn More

- **[CLIENT_SERVER_ARCHITECTURE.md](CLIENT_SERVER_ARCHITECTURE.md)** - Complete architecture guide (★ Start here!)
- **[/docs](docs/README.md)** - All documentation files
- **[Backend README](backend/README.md)** - Backend-specific documentation
- **[Frontend README](frontend/README.md)** - Frontend-specific documentation

---

## ✅ Project Checklist

- ✅ **Clean Separation:** Frontend & Backend in separate folders
- ✅ **Organized Structure:** Professional folder hierarchy
- ✅ **Documentation:** Comprehensive guides included
- ✅ **Beginner-Friendly:** Well-documented and easy to understand
- ✅ **Production-Ready:** Tested and verified
- ✅ **Scalable:** Easy to add new features
- ✅ **Security:** Authentication, validation, error handling

---

## 🎉 Ready to Start?

1. **Understand the architecture:** Read [CLIENT_SERVER_ARCHITECTURE.md](CLIENT_SERVER_ARCHITECTURE.md)
2. **Install dependencies:** `cd backend && npm install && cd ../frontend && npm install`
3. **Configure backend:** `cd backend && cp .env.example .env` (add your MongoDB URI)
4. **Start development:** Run `npm start` in both `/backend` and `/frontend` folders
5. **Explore the code:** Look at the folder structure and understand how everything connects

**Happy coding! 🚀**
