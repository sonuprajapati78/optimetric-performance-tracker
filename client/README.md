# Frontend UI - Performance Tracker

Production-ready React frontend for the Performance Tracker application.

## 📋 Overview

This frontend provides:
- **React 18+** with modern hooks and features
- **Component-based** architecture
- **API Service Layer** for backend communication
- **Authentication** handling (JWT)
- **File Upload** capabilities
- **Docker** containerization
- **Responsive Design** for all devices
- **Real-time Dashboard** with analytics
- **Error Handling** and user feedback

### Features

- 📊 Real-time performance analytics
- 📤 File upload for bulk data import (XLSX/CSV)
- 🏆 Leaderboard with top performers
- 📈 Interactive charts and visualizations
- 📱 Fully responsive design
- 🎨 Modern UI with gradient design
- ⚡ Fast and lightweight
- 🔄 Auto-refresh capabilities
- 🔐 Secure JWT authentication

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment (already set):
```bash
# .env is pre-configured for local development
REACT_APP_API_URL=http://localhost:5000
```

## Running the Application

### Development Mode
```bash
npm start
```

The dashboard will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## API Configuration

The dashboard connects to your Node.js backend at:
- Backend URL: `http://localhost:5000`
- API Base: `/api/v1`

Make sure your backend server is running before starting the dashboard.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.js
│   │   ├── FileUpload.js
│   │   ├── TopPerformers.js
│   │   ├── Header.js
│   │   ├── LoadingSpinner.js
│   │   └── ErrorAlert.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Features Overview

### Dashboard Tab
- Summary statistics (total agents, average score, top score)
- Performance distribution pie chart
- Performance scores comparison bar chart
- Recent activity feed

### Upload Tab
- Drag-and-drop file upload
- XLSX and CSV file support
- Real-time upload progress
- File validation and error messages

### Top Performers Tab
- Leaderboard with rankings
- Detailed performance metrics
- Time breakdown (talk, logged in, break)
- Statistics summary

## API Endpoints Used

- `GET /health` - Check server status
- `POST /api/v1/performance/upload` - Upload performance data
- `GET /api/v1/performance/top-performers` - Get top performers

## File Upload Format

Required columns in Excel/CSV:
- **Agent Name** - Agent identifier
- **Total Talk Time (hh:mm:ss)**
- **Total Logged In Time (hh:mm:ss)**
- **Total Break Duration (hh:mm:ss)**

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Technologies Used

- React 18
- Axios for API calls
- Chart.js for visualizations
- React ChartJS 2
- React Icons
- CSS3 with gradients and animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1024px and above)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## Error Handling

- Connection errors display helpful messages
- File upload validation
- API response error handling
- Auto-dismiss error alerts after 5 seconds

## Performance Optimization

- Lazy loading of components
- Optimized re-renders
- Efficient API calls
- CSS animations with GPU acceleration
- Minified production build

## Security Features

- Environment variable protection
- CORS-enabled API requests
- Input validation
- File type validation
- File size limits (10MB)

## Deployment

### To AWS/Azure/Heroku

1. Build the application:
```bash
npm run build
```

2. Deploy the `build/` folder to your hosting platform

### Docker

Build and run with Docker:
```bash
docker build -t performance-dashboard .
docker run -p 3000:3000 performance-dashboard
```

## License

MIT

## Support

For issues or questions, check:
1. Backend API status at `http://localhost:5000/health`
2. Browser console for error messages
3. Network tab in DevTools for API issues
