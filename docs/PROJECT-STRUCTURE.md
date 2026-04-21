# Project Structure - Clean MERN Stack

## 📁 Directory Tree

```
project-root/
│
├── client/                          # React Frontend (Port 3000)
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API service layer
│   │   ├── utils/                   # Helper functions
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── App.js                   # Main App component
│   │   └── index.js                 # React entry point
│   ├── public/                      # Static assets
│   ├── build/                       # Production build (generated)
│   ├── package.json                 # Frontend dependencies
│   ├── .env.example                 # Environment template
│   ├── .gitignore                   # Git ignore rules
│   ├── Dockerfile                   # Container configuration
│   └── README.md                    # Frontend documentation
│
├── server/                          # Node.js/Express Backend (Port 5000)
│   ├── src/
│   │   ├── controllers/             # Business logic (MVC Pattern)
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── performanceController.js
│   │   │   ├── reportController.js
│   │   │   └── uploadController.js
│   │   ├── models/                  # Mongoose schemas (MVC Pattern)
│   │   │   ├── Agent.js
│   │   │   ├── Employee.js
│   │   │   └── UploadHistory.js
│   │   ├── routes/                  # API endpoints (MVC Pattern)
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   ├── performanceRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── uploadRoutes.js
│   │   ├── middleware/              # Express middleware
│   │   ├── services/                # Business logic abstraction
│   │   ├── utils/                   # Helper functions
│   │   ├── config/                  # Configuration files
│   │   ├── seeds/                   # Database seed scripts
│   │   └── app.js                   # Express app configuration
│   ├── tests/                       # Test files
│   ├── uploads/                     # File upload storage
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Environment template
│   ├── .gitignore                   # Git ignore rules
│   ├── Dockerfile                   # Container configuration
│   └── README.md                    # Backend documentation
│
├── docs/                            # Project documentation
│
├── ARCHIVED_DOCS/                   # Old documentation (reference)
│
├── docker-compose.yml               # Development orchestration
├── docker-compose.prod.yml          # Production orchestration
├── .gitignore                       # Root git ignore
├── .env                             # Root environment variables
├── .env.example                     # Root environment template
├── .dockerignore                    # Docker ignore
├── .eslintrc.json                   # ESLint configuration
├── package.json                     # Root package.json
└── README.md                        # Main documentation

```

---

## 🏗️ Architecture Overview

### Frontend (client/)
- **Framework**: React 18+
- **HTTP Client**: Axios
- **State Management**: Context API / Redux (optional)
- **Port**: 3000

### Backend (server/)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Pattern**: MVC (Models, Views, Controllers)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Port**: 5000

### Database
- **Service**: MongoDB (containerized)
- **Port**: 27017 (internal only)
- **Authentication**: Username/Password required

---

## 📦 Key Features

### MVC Pattern Implementation
```
Request → Route → Controller → Service → Model → Database
```

**Controllers** → Handle HTTP requests and responses
**Models** → Define database schemas (Mongoose)
**Routes** → Define API endpoints
**Services** → Abstract business logic
**Middleware** → Authentication, validation, error handling

---

## 🐳 Docker Configuration

### Development
```bash
docker-compose up
```
- Hot-reloading enabled
- Source code volumes mounted
- Development environment

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```
- Multi-stage builds (optimized)
- Health checks
- Restart policies
- Environment variables from .env

---

## 🚀 Quick Commands

### Start Development
```bash
# Docker (recommended)
docker-compose up

# Local development
cd server && npm install && npm run dev  # Terminal 1
cd client && npm install && npm start    # Terminal 2
```

### Build Docker Images
```bash
docker-compose build
```

### View Logs
```bash
docker-compose logs -f server
docker-compose logs -f client
```

### Stop Services
```bash
docker-compose down
```

---

## 📋 Essential Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `docker-compose.yml` | Development orchestration |
| `docker-compose.prod.yml` | Production orchestration |
| `.env.example` | Environment template |
| `.gitignore` | Git ignore rules |
| `client/Dockerfile` | Frontend container config |
| `server/Dockerfile` | Backend container config |

---

## ✅ Best Practices Implemented

✓ **Separation of Concerns** - Client and server completely separate  
✓ **MVC Pattern** - Clear Models, Views (Routes), Controllers  
✓ **Containerization** - Docker for consistent environments  
✓ **Environment Management** - .env files for configuration  
✓ **Minimal Structure** - Only essential files at root  
✓ **Production Ready** - Multi-stage builds, health checks  
✓ **Easy to Scale** - Clear folder organization  
✓ **Developer Friendly** - Hot reloading, clear structure  

---

## 🔗 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017 |
| Health Check | http://localhost:5000/health |
| API Base | http://localhost:5000/api/v1 |

---

## 📝 Notes

- Keep `ARCHIVED_DOCS/` for historical reference only
- Update `.env.example` files with new variables
- Maintain `.gitignore` files in each folder
- Follow MVC pattern for new features
- Use Docker for consistent development/production

