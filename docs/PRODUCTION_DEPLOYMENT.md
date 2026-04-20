# 🚀 Production Deployment Guide - Performance Tracker

## ✅ Pre-Deployment Checklist

- [x] Frontend optimized build created
- [x] Backend dependencies installed
- [x] MongoDB Atlas configured
- [x] Environment variables set
- [x] Docker image built
- [x] Health checks configured
- [x] Logging configured

## 🔧 Deployment Options

### Option 1: Docker Compose (Recommended for Small-Medium)

```bash
# 1. Update production environment
cp .env.production .env

# 2. Set your MongoDB URI
export MONGO_URI="mongodb+srv://user:password@cluster.mongodb.net/performance-tracker?retryWrites=true&w=majority"

# 3. Set your CORS origin
export CORS_ORIGIN="https://yourdomain.com"

# 4. Build and deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify
curl http://localhost:5000/health
```

### Option 2: Docker Only (Cloud Ready)

```bash
# Build image
docker build -t performance-tracker:latest --target production .

# Run container
docker run -d \
  --name performance-tracker \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGO_URI="mongodb+srv://..." \
  -e CORS_ORIGIN="https://yourdomain.com" \
  performance-tracker:latest
```

### Option 3: Kubernetes

```bash
# Create namespace
kubectl create namespace performance-tracker

# Deploy
kubectl apply -f k8s-deployment.yaml -n performance-tracker

# Verify
kubectl get pods -n performance-tracker
kubectl logs -n performance-tracker -f deployment/performance-tracker
```

## 📋 Configuration Steps

### 1. **MongoDB Setup**

```bash
# Using MongoDB Atlas:
1. Create cluster at https://cloud.mongodb.com
2. Create database user with credentials
3. Get connection string: mongodb+srv://user:pass@cluster...
4. Add IP whitelist (or 0.0.0.0/0 for all)
5. Copy to .env.production as MONGO_URI
```

### 2. **Environment Variables**

Edit `.env.production`:

```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/performance-tracker
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### 3. **SSL/HTTPS Setup**

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d yourdomain.com

# Or use Nginx with SSL
# Configure in reverse proxy
```

## 🏗️ Production Architecture

```
┌─────────────────────────────────────────┐
│        Users (Browser)                  │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│   Nginx/Load Balancer (SSL)             │
│   - HTTPS termination                   │
│   - Reverse proxy                       │
│   - Static file serving                 │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│   Container: Performance Tracker API    │
│   - Node.js/Express                     │
│   - Serves both API & React Frontend    │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│   MongoDB Atlas (Cloud)                 │
│   - Managed database                    │
│   - Automated backups                   │
│   - High availability                   │
└─────────────────────────────────────────┘
```

## 🔒 Security Checklist

- [ ] Enable HTTPS/TLS
- [ ] Set CORS to specific domain
- [ ] Configure MongoDB authentication
- [ ] Set LOG_LEVEL to 'info' (not 'debug')
- [ ] Use secrets manager for sensitive data
- [ ] Configure firewall rules
- [ ] Enable MongoDB encryption
- [ ] Set up API rate limiting
- [ ] Configure DDoS protection
- [ ] Enable audit logging

## 📊 Monitoring & Logs

### Health Checks

```bash
# Basic health
curl https://yourdomain.com/health

# Database ready check
curl https://yourdomain.com/ready

# API status
curl https://yourdomain.com
```

### View Logs

```bash
# Docker Compose
docker-compose logs -f app

# Docker
docker logs -f performance-tracker

# Kubernetes
kubectl logs -f deployment/performance-tracker -n performance-tracker
```

## 🚨 Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs app

# Verify MongoDB connection
mongosh "mongodb+srv://user:pass@cluster..." --eval "db.version()"
```

### CORS errors
```bash
# Update CORS_ORIGIN to match frontend domain
# Restart container after updating
docker-compose restart app
```

### Memory issues
```bash
# Increase Node memory
# In docker-compose.prod.yml, add:
environment:
  - NODE_OPTIONS=--max-old-space-size=2048
```

## 📈 Performance Optimization

### Database Indexes
Already configured in schemas for:
- Agent names
- Upload dates
- Performance scores

### Caching Strategy
```bash
# Consider adding Redis for session caching
# Update docker-compose.prod.yml to include Redis service
```

### Load Balancing
```bash
# For multiple instances:
- Use reverse proxy (Nginx, HAProxy)
- Configure sticky sessions if needed
- Use shared MongoDB database
```

## 🔄 CI/CD Integration

### GitHub Actions
See `.github/workflows/deploy.yml`:

```yaml
- Build Docker image
- Push to container registry
- Deploy to production
- Run health checks
```

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify MongoDB connection
3. Check network/firewall rules
4. Review environment variables
5. Test health endpoints

---

**Last Updated:** 2026-04-19  
**Status:** ✅ Production Ready
