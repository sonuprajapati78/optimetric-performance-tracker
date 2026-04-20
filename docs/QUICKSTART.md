# 🚀 Quick Start Guide - Complete Setup

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment

Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Update with your MongoDB URI:
```
MONGO_URI=mongodb://localhost:27017/performance-tracker
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
NODE_ENV=development
LOG_LEVEL=debug
```

For MongoDB Atlas:
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/performance-tracker
```

### 3. Start Services

**Option A: Manual Start (2 Terminals)**

Terminal 1 - Backend:
```bash
npm start
# API runs on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

**Option B: Docker Start (Single Command)**

```bash
docker-compose up -d
```

### 4. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health
- **MongoDB Express:** http://localhost:8081 (admin/admin)

---

## API Endpoints

### Health Checks
```bash
GET /health
# Returns: { status: "OK", uptime, timestamp }

GET /ready
# Returns: { status: "READY", timestamp }
```

### Performance Data
```bash
# Upload file (Excel or CSV)
POST /api/v1/performance/upload
# Form data: file (multipart/form-data)

# Get top performers
GET /api/v1/performance/top-performers?limit=10
# Returns: top performers ranked by performance score
```

### Example Usage

Upload a file:
```bash
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@data.xlsx"
```

Get top performers:
```bash
curl http://localhost:5000/api/v1/performance/top-performers?limit=10
```

---

## Docker Setup (Development)

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f app
docker-compose logs -f mongo
```

### Clean Up (Remove data)
```bash
docker-compose down -v
```

---

## Production Deployment

### Environment Setup
```bash
# Create production .env file
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### Docker Production Build & Deploy
```bash
# Build production image
docker build -t performance-tracker:production --target production .

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d

# Verify
curl http://localhost:5000/health
curl http://localhost:5000/ready
```

---

## File Upload Format

### Supported Formats
- Excel (`.xlsx`)
- CSV (`.csv`)

### Required Column Headers
```
Agent Name | Total Talk Time (hh:mm:ss) | Total Logged In Time (hh:mm:ss) | Total Break Duration (hh:mm:ss)
```

### Sample Data
```csv
Agent Name,Total Talk Time (hh:mm:ss),Total Logged In Time (hh:mm:ss),Total Break Duration (hh:mm:ss)
John Doe,08:30:00,09:00:00,00:30:00
Jane Smith,07:45:00,08:30:00,00:45:00
Bob Johnson,09:15:00,09:30:00,00:15:00
```

---

## Common Commands

### Development
```bash
npm start              # Start backend
npm test              # Run tests
npm run lint          # Check code quality
npm run lint:fix      # Fix linting issues
```

### Frontend
```bash
cd frontend
npm start             # Start dev server (port 3000)
npm run build         # Build for production
npm test              # Run tests
```

### Docker
```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f app     # View API logs
docker-compose exec app npm test  # Run tests in container
```

---

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
**Fix:**
- Start MongoDB: `docker-compose up -d mongo`
- Or update MONGO_URI in .env
- Or check local MongoDB is running

### CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:**
- Update CORS_ORIGIN in .env to include your frontend URL
- Restart backend: kill and run `npm start` again

### Port 5000 Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Fix:**
- Change PORT in .env to 5001 or another port
- Or: `lsof -i :5000` → `kill -9 <PID>`

### Frontend Can't Reach Backend
**Fix:**
- Check REACT_APP_API_URL in `frontend/.env`
- Should be: `http://localhost:5000`
- Ensure backend is running
- Check console error for details

### Docker Images Not Updating
```bash
# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

---

## Performance Testing

### Load Testing with Apache Bench
```bash
ab -n 100 -c 10 http://localhost:5000/health
```

### API Response Times
- Check browser DevTools → Network tab
- Or: `curl -w "%{time_total}s\n" http://localhost:5000/health`

---

## Monitoring

### Check Application Status
```bash
# Health check
curl http://localhost:5000/health

# Readiness check  
curl http://localhost:5000/ready

# View detailed info
curl http://localhost:5000
```

### Monitor Logs
```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f app

# Database only
docker-compose logs -f mongo
```

### Database Management
Access MongoDB Express at: **http://localhost:8081**
- Username: admin
- Password: admin

---

## Next Steps

1. ✅ **Local Development** - Run and test locally
2. ✅ **Upload Sample Data** - Test file upload feature
3. 📖 **Read Docs** - Check [DEPLOYMENT.md](DEPLOYMENT.md) for production
4. 🔒 **Security** - Configure SSL, authentication, rate limiting
5. 📊 **Monitoring** - Set up error tracking and alerts
6. 🚀 **Deploy** - Push to production environment

---

## Useful Links

- [README](README.md) - Project overview
- [DEPLOYMENT](DEPLOYMENT.md) - Production deployment guide
- [PRODUCTION](PRODUCTION.md) - Production configuration
- [API Docs](#api-endpoints) - API endpoints

---

## Environment Variables Reference

### Development (.env)
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/performance-tracker
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
LOG_LEVEL=debug
API_VERSION=v1
REQUEST_TIMEOUT=30000
```

### Production (.env.production)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
API_VERSION=v1
REQUEST_TIMEOUT=30000
```

---

## Getting Help

**Check logs for errors:**
```bash
docker-compose logs app
```

**Test API connectivity:**
```bash
curl -i http://localhost:5000/health
```

**MongoDB connection test:**
```bash
mongo "mongodb://localhost:27017/performance-tracker"
```
```bash
curl http://localhost:5000/health
```

### 2. Check Readiness
```bash
curl http://localhost:5000/ready
```

### 3. Upload Performance Data
```bash
curl -X POST http://localhost:5000/api/v1/performance/upload \
  -F "file=@performance-data.xlsx"
```

### 4. Get Top Performers
```bash
curl http://localhost:5000/api/v1/performance/top-performers?limit=10
```

## Using Docker

### Build Image
```bash
# Development image
docker build --target development -t performance-tracker:dev .

# Production image
docker build --target production -t performance-tracker:prod .
```

### Run as Container
```bash
# Development
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/performance-tracker \
  performance-tracker:dev

# Production
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://mongo:27017/performance-tracker \
  -e NODE_ENV=production \
  performance-tracker:prod
```

### Using Docker Compose
```bash
# Start all services (app + MongoDB + mongo-express)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

Once running:
- API: http://localhost:5000
- Mongo Express: http://localhost:8081 (user: admin, password: admin)

## Development Commands

```bash
# Run in watch mode with auto-reload
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## File Format for Upload

Prepare an Excel/CSV file with these columns:
- **Agent Name** - Agent identifier (required)
- **Total Talk Time (hh:mm:ss)** - Time spent talking
- **Total Logged In Time (hh:mm:ss)** - Total logged in time
- **Total Break Duration (hh:mm:ss)** - Time on break

Example row:
| Agent Name | Total Talk Time (hh:mm:ss) | Total Logged In Time (hh:mm:ss) | Total Break Duration (hh:mm:ss) |
|---|---|---|---|
| John Doe | 06:30:45 | 08:00:00 | 01:00:00 |

## Database Queries (via Mongo Express)

Once mongo-express is running at http://localhost:8081:

1. Login with admin / admin
2. Navigate to: performance-tracker → agents
3. View and manage agent data

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| NODE_ENV | development | Environment (development/staging/production) |
| PORT | 5000 | Server port |
| MONGO_URI | - | MongoDB connection string (required) |
| MAX_FILE_SIZE | 10MB | Maximum upload file size |
| CORS_ORIGIN | * | Allowed CORS origins |
| LOG_LEVEL | info | Logging level (debug/info/warn/error) |

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
- Ensure MongoDB is running
- Check MONGO_URI in .env
- For Docker: use `mongodb://mongo:27017` instead of localhost

### File Upload Error
```
Error: Only .xlsx or .csv files are allowed
```
- Upload must be XLSX or CSV format
- Set correct Content-Type

### Port Already in Use
```
Error: listen EADDRINUSE
```
- Change PORT in .env
- Or kill process on port: `lsof -ti:5000 | xargs kill -9` (Unix/Mac)

## Next Steps

1. **Production Deployment**: See [PRODUCTION.md](./PRODUCTION.md)
2. **API Documentation**: See [README.md](./README.md)
3. **Testing**: Run `npm test` to validate setup
4. **Monitoring**: Check `/health` and `/ready` endpoints

## Support

For issues or questions, check the logs:
```bash
# With npm
npm run dev

# With Docker Compose
docker-compose logs -f app
```

Review [PRODUCTION.md](./PRODUCTION.md) for production deployment guidance and best practices.
