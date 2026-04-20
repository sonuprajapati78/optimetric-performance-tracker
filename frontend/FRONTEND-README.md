# 📱 Frontend Dashboard - Performance Tracker

**Frontend**: React Application  
**UI Framework**: HTML/CSS/React  
**Port**: 3000  

---

## 📁 Frontend Folder Structure

```
frontend/
├── public/
│   └── index.html                # HTML entry point
│
├── src/
│   ├── index.js                  # React entry
│   ├── index.css                 # Global styles
│   ├── App.js                    # Main component
│   ├── App.css                   # App styles
│   │
│   ├── components/
│   │   ├── UploadSection.js      # File upload component
│   │   ├── PerformanceTable.js   # Results table
│   │   ├── ChartComponent.js     # Charts/graphs
│   │   └── ... other components
│   │
│   └── services/
│       ├── api.js                # Axios configuration
│       └── performanceService.js # API calls
│
├── build/                        # Production build (generated)
│
├── package.json                  # React dependencies
├── README.md                     # Frontend setup (this file)
└── Dockerfile                    # Container config

```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd c:\internship\frontend
npm install
```

### 2. Configure API Connection

Edit `src/services/api.js`:
```javascript
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export const performanceAPI = {
  uploadFile: (file) => axios.post(`${BASE_URL}/performance/upload`, data),
  getReport: (limit) => axios.get(`${BASE_URL}/performance/report`, { params: { limit } }),
  resetData: () => axios.delete(`${BASE_URL}/performance/reset`, { params: { confirm: true } }),
};
```

### 3. Start Frontend
```bash
npm start
```

**Opens:** `http://localhost:3000`

### 4. Start Backend (separate terminal)
```bash
cd c:\internship
npm run dev
```

**Backend:** `http://localhost:5000`

---

## 🎨 UI Features

### 1️⃣ Upload Section
- File input for Excel upload
- Drag-and-drop support (optional)
- Upload status indicator
- Error messages

### 2️⃣ Performance Dashboard
- Table of top performers
- Performance scores
- Time metrics (Talk Time, Logged In Time, Break Time)
- Sort and filter (optional)

### 3️⃣ Charts & Graphs
- Top performers bar chart
- Performance distribution
- Trend analysis

### 4️⃣ Control Buttons
- Upload file
- Refresh data
- Reset database (with confirmation)

---

## 🔌 API Integration

### Connected Endpoints

```javascript
// src/services/performanceService.js

// 1. Upload Excel
POST /api/v1/performance/upload
Body: multipart/form-data { file }

// 2. Get Report
GET /api/v1/performance/report?limit=10

// 3. Reset Data
DELETE /api/v1/performance/reset?confirm=true
```

### API Service Example

```javascript
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

export const performanceService = {
  // Upload file
  uploadPerformance: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${BASE_URL}/performance/upload`, formData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get report
  getReport: async (limit = 5) => {
    try {
      const response = await axios.get(`${BASE_URL}/performance/report`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Reset data
  resetData: async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/performance/reset`, {
        params: { confirm: true }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};
```

---

## 🎯 Component Structure

### App.js (Main Component)
```javascript
import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import PerformanceTable from './components/PerformanceTable';
import { performanceService } from './services/performanceService';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load report
  const loadReport = async () => {
    setLoading(true);
    try {
      const result = await performanceService.getReport(10);
      setData(result.data.topPerformers);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle upload
  const handleUpload = async (file) => {
    try {
      await performanceService.uploadPerformance(file);
      loadReport(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="App">
      <h1>Performance Tracker</h1>
      <UploadSection onUpload={handleUpload} />
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <PerformanceTable data={data} />
    </div>
  );
}

export default App;
```

---

## 📊 Display Data Format

Data received from backend:

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
  "message": "Performance report generated successfully"
}
```

Display Table:

| Rank | Agent Name | Performance Score | Talk Time | Logged In Time | Break Time |
|------|-----------|-----------------|-----------|---------------|-----------|
| 1    | Agent Smith | 95.5 | 10:00 | 12:00 | 01:00 |
| 2    | Agent Jones | 92.3 | 09:30 | 11:45 | 01:15 |

---

## 🚀 Development

### Start Development Server
```bash
npm start
```

**Features:**
- Hot reload on file changes
- Developer tools available
- Error overlay in browser

### Available Scripts
```bash
npm start          # Start dev server (port 3000)
npm build          # Build for production
npm test           # Run tests
npm eject          # Eject from create-react-app (not reversible!)
```

---

## 🏗️ Building for Production

### Create Production Build
```bash
npm run build
```

**Output:** `frontend/build/` folder

### Deploy Built Files
```bash
# Copy 'build' folder to static hosting
# Options:
# - Vercel (automatic from GitHub)
# - Netlify (automatic from GitHub)
# - AWS S3 + CloudFront
# - GitHub Pages
# - Traditional web server (nginx, Apache)
```

### Production Configuration

```javascript
// .env.production
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
```

---

## 🐳 Docker

### Build Docker Image
```bash
docker build -t performance-dashboard .
```

### Run Container
```bash
docker run -p 3000:3000 performance-dashboard
```

### Docker Compose
```bash
docker-compose up frontend
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test File Location
```
frontend/src/components/__tests__/
```

### Test Example
```javascript
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders upload section', () => {
  render(<App />);
  expect(screen.getByText(/Upload/i)).toBeInTheDocument();
});
```

---

## 📦 Dependencies

### Main Dependencies
- **react**: UI framework
- **react-dom**: React DOM rendering
- **react-scripts**: Create React App build tools
- **axios**: HTTP client
- **chart.js**: Charting library
- **react-chartjs-2**: Chart components
- **react-icons**: Icon library

### Dev Dependencies
- **@testing-library/react**: Testing utilities
- **@testing-library/jest-dom**: Jest matchers
- **@testing-library/user-event**: User interaction testing

---

## 🔐 Security

✅ CORS requests only to backend  
✅ Sensitive data not stored in localStorage  
✅ API responses validated  
✅ Error messages user-friendly  
✅ No hardcoded secrets  

---

## 🆘 Troubleshooting

### Issue: "Cannot GET /"
**Solution:**
- Check backend running: `curl http://localhost:5000/health`
- Check CORS_ORIGIN in backend .env includes `http://localhost:3000`

### Issue: "Failed to fetch from backend"
**Solution:**
- Verify API URL in `src/services/api.js`
- Check backend port: 5000
- Check backend is running

### Issue: "Module not found"
**Solution:**
- Run: `npm install`
- Clear cache: `rm -rf node_modules && npm install`
- Restart dev server

### Issue: Port 3000 already in use
**Solution:**
```bash
# Use different port
PORT=3001 npm start

# Or kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

---

## 📚 Useful Resources

- [React Documentation](https://react.dev/)
- [Axios Documentation](https://axios-http.com/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Create React App Documentation](https://create-react-app.dev/)

---

## 🔄 Development Workflow

1. **Frontend Dev**
   ```bash
   cd frontend
   npm start
   # Auto-reloads on changes
   ```

2. **Backend Dev** (separate terminal)
   ```bash
   npm run dev
   # Restart on changes
   ```

3. **Test Together**
   - Upload file via UI
   - Check results displayed
   - Check backend logs

4. **Build for Production**
   ```bash
   npm run build
   # Deploy 'build' folder
   ```

---

## 📋 Checklist

Before deployment:
- [ ] All components render correctly
- [ ] API calls work (check Network tab)
- [ ] Error handling works
- [ ] Mobile responsive (check different screen sizes)
- [ ] Performance acceptable (check React DevTools)
- [ ] No console errors
- [ ] Backend API base URL set correctly

---

**Frontend is ready for development! 🎉**
