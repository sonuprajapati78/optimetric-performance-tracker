# Performance Tracker - MERN Application

A production-ready MERN stack application with separate client and server.

## Quick Start

```bash
# Using Docker
docker-compose up

# Local Development
# Terminal 1 - Backend
cd server && npm install && npm run dev

# Terminal 2 - Frontend
cd client && npm install && npm start
```

## Project Structure

```
project-root/
├── client/                    # React Frontend (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── server/                    # Node.js/Express Backend (Port 5000)
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Helper functions
│   │   └── app.js             # Express app
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml         # Docker Compose configuration
├── .gitignore
└── README.md

```

## Tech Stack

- **Frontend:** React 18+, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT + bcryptjs
- **DevOps:** Docker, Docker Compose

## Features

- Real-time data analytics
- Excel/CSV file upload
- User authentication (JWT)
- Responsive UI
- RESTful API
- Docker containerized

## Development

```bash
# Backend environment
cd server
cp .env.example .env
npm install
npm run dev

# Frontend environment
cd client
cp .env.example .env
npm install
npm start
```

## Production

```bash
docker-compose up -d
```

## API

Backend runs on `http://localhost:5000`
- Health check: `GET /health`
- API base: `/api/v1/`

## Frontend

Frontend runs on `http://localhost:3000`

## License

MIT
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend (new terminal)
cd frontend && cp .env.example .env && npm install && npm start
```

## 🔌 Health Check

```bash
curl http://localhost:5000/health
```

## 📄 License

MIT

---

**Status:** ✅ Production Ready
