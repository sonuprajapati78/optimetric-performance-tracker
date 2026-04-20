# Performance Tracker - Production Ready

## 📊 Overview
Simple and production-ready Performance Manager that allows managers to:
- Upload daily employee performance data (Excel/CSV)
- View top 5 performers with highlights
- See complete employee rankings with scores
- Track performance metrics in real-time

## 🎯 Key Features
✅ **Simple Manager Dashboard** - One-click upload and instant results  
✅ **Top 5 Performers** - Highlighted performers with badges  
✅ **All Employees Table** - Complete rankings with scores  
✅ **Production-Level** - Error handling, validation, responsive design  
✅ **Secure Authentication** - JWT-based authentication  
✅ **Real-time Updates** - Auto-refresh after upload  

## 📋 Required Excel/CSV Format
Your file must contain these columns:
- **Agent Name** - Employee name
- **Total Talk Time (hh:mm:ss)** - Call duration (format: 00:00:00)
- **Total Logged In Time (hh:mm:ss)** - Login duration (format: 00:00:00)
- **Total Break Duration (hh:mm:ss)** - Break duration (format: 00:00:00)

### Example CSV:
```
Agent Name,Total Talk Time (hh:mm:ss),Total Logged In Time (hh:mm:ss),Total Break Duration (hh:mm:ss)
John Doe,08:30:00,09:00:00,00:30:00
Jane Smith,07:45:00,09:00:00,01:00:00
```

## 🚀 Getting Started

### Prerequisites
- Node.js v14+
- MongoDB v4.4+
- npm v6+

### Installation

1. **Clone/Setup the project**
```bash
cd internship
```

2. **Install dependencies**
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

3. **Configure environment**
```bash
# Edit .env file with your settings
NODE_ENV=production
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret_key
```

4. **Start servers**
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

5. **Access application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📦 Deployment

### Docker Deployment
```bash
# Build production image
docker build -t performance-tracker:latest .

# Run container
docker run -p 5000:5000 -e MONGO_URI=your_mongo_url performance-tracker:latest
```

### Heroku Deployment
```bash
git push heroku main
```

### AWS/Azure Deployment
Use provided deployment scripts in deploy-production.sh

## 🔐 Security Checklist
- ✅ Change JWT_SECRET in production
- ✅ Use MongoDB Atlas for production
- ✅ Enable HTTPS
- ✅ Set proper CORS origins
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Regular backups enabled

## 📊 Performance Score Calculation
Performance Score = (Talk Time / Logged In Time) × 100

**Score Range:**
- 90-100: Excellent 🌟
- 80-89: Very Good 👍
- 70-79: Good ✅
- 60-69: Average ⚠️
- Below 60: Needs Improvement 📉

## 🛠️ API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login user

### Performance
- POST `/api/v1/performance/upload` - Upload performance data
- GET `/api/v1/performance/top-performers?limit=X` - Get top performers

### Dashboard
- GET `/api/v1/dashboard/personal` - Personal performance
- GET `/api/v1/dashboard/monthly-top` - Top performers this month

## 📱 Responsive Design
✅ Desktop (1920x1080)
✅ Tablet (768x1024)
✅ Mobile (320x480)

## 🐛 Troubleshooting

### Upload fails
- Check file format matches required columns
- Ensure file size < 10MB
- Verify you're logged in
- Check browser console for errors

### No data showing
- Verify MongoDB is running
- Check .env MONGO_URI is correct
- Try uploading a sample file
- Clear browser cache

### Authentication errors
- Check JWT_SECRET matches backend and frontend
- Verify token is not expired
- Clear localStorage and re-login

## 📈 Next Steps for Production
1. Replace hardcoded JWT_SECRET with strong secret
2. Setup MongoDB Atlas cluster
3. Configure CDN for frontend assets
4. Setup monitoring and logging
5. Configure email notifications
6. Add data export (PDF/Excel)
7. Implement user roles (Admin/Manager/Employee)

## 📞 Support
For issues or questions, check the logs:
```bash
# Backend logs
tail -f logs/app.log

# Frontend console
Open browser DevTools (F12) → Console tab
```

## 📄 License
MIT - See LICENSE file for details
