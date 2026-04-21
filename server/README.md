# Backend API - Performance Tracker

Production-ready Node.js/Express backend for the Performance Tracker application.

## 📋 Overview

This backend API provides:
- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** for secure endpoints
- **File Upload** support (Excel/CSV)
- **Docker** containerization
- **Health Checks** for monitoring
- **Error Handling** and logging
- **Input Validation** with Joi

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- npm or yarn

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

### Using Docker

1. **Build image**
   ```bash
   npm run docker:build
   ```

2. **Run with docker-compose**
   ```bash
   docker-compose up
   ```

3. **Production build**
   ```bash
   npm run docker:build:prod
   ```

## 📁 Project Structure

```
src/
├── config/              # Database & app configuration
├── controllers/         # Route handlers
├── models/             # Mongoose schemas
├── routes/             # API route definitions
├── middleware/         # Custom middleware
├── services/           # Business logic layer
├── utils/              # Utility functions
├── constants.js        # Application constants
└── app.js             # Express app setup

tests/                  # Test files
uploads/                # File upload directory
```

## 🔐 Authentication

- JWT-based authentication
- Access tokens and refresh tokens
- Automatic token expiration
- Secure password hashing with bcryptjs

## 📝 API Endpoints

See [API_ENDPOINTS.md](../docs/API_ENDPOINTS.md) for detailed documentation.

### Common Endpoints
```
POST   /api/v1/auth/register      - Register new user
POST   /api/v1/auth/login         - Login user
POST   /api/v1/auth/refresh       - Refresh token
GET    /api/v1/users              - Get all users
GET    /api/v1/health             - Health check
POST   /api/v1/upload/excel       - Upload Excel file
```

## 🛠️ Scripts

```bash
# Development
npm run dev              # Start dev server with nodemon
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch      # Watch mode testing

# Linting
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues

# Docker
npm run docker:build    # Build dev Docker image
npm run docker:up       # Start all services
npm run docker:down     # Stop all services
npm run docker:logs     # View container logs
```

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins

## 🧪 Testing

Run tests with:
```bash
npm test
npm run test:watch      # Watch mode
```

Tests are configured with Jest and Supertest.

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
- Check console output during development
- In production, logs are written to `./logs/app.log`

## 🚢 Deployment

### Prerequisites
- MongoDB Atlas or self-hosted MongoDB
- Node.js hosting (Render, Railway, Heroku, etc.)
- Or use Docker on any cloud platform

### Environment Setup
1. Create `.env` with production values
2. Ensure `NODE_ENV=production`
3. Use strong `JWT_SECRET`
4. Configure `CORS_ORIGIN` properly

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Connection Issues
- Verify MongoDB is running
- Check `MONGO_URI` in .env
- Ensure port 5000 is available

### Authentication Errors
- Verify `JWT_SECRET` is set
- Check token expiration
- Ensure headers include Authorization

### File Upload Issues
- Check `UPLOAD_DIR` path exists
- Verify `MAX_FILE_SIZE` setting
- Ensure correct MIME types

## 📚 Documentation

- [Setup Guide](../docs/SETUP.md)
- [API Endpoints](../docs/API_ENDPOINTS.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Architecture](../docs/ARCHITECTURE.md)

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Push to repository
4. Create pull request

## 📄 License

MIT License

## 📞 Support

For issues and questions:
- Check troubleshooting section
- Review documentation
- Contact development team
