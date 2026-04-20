# Production Deployment Guide

This guide provides best practices for deploying the Performance Tracker API to production.

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI with authentication
- [ ] Set strong, random `CORS_ORIGIN` values (not `*`)
- [ ] Set appropriate `LOG_LEVEL` (usually `info` or `warn`)
- [ ] Configure `MAX_FILE_SIZE` based on expected upload sizes
- [ ] Test all environment variables in production environment

### 2. Security Hardening
- [ ] Enable HTTPS/TLS (use reverse proxy like nginx)
- [ ] Add rate limiting middleware (consider: express-rate-limit)
- [ ] Add request ID tracking for debugging
- [ ] Enable helmet.js for security headers
- [ ] Implement authentication/authorization (JWT recommended)
- [ ] Add request size limits
- [ ] Regular security vulnerability scanning (npm audit)

### 3. Database Optimization
- [ ] Ensure MongoDB indexes are created (handled by schema)
- [ ] Configure MongoDB connection pooling (default: 5-10 connections)
- [ ] Enable MongoDB authentication
- [ ] Set up automated backups
- [ ] Test failover procedures
- [ ] Monitor database performance

### 4. Monitoring & Logging
- [ ] Set up centralized logging (ELK, Datadog, CloudWatch)
- [ ] Configure APM (Application Performance Monitoring)
- [ ] Set up health check monitoring
- [ ] Configure alerting for error rates
- [ ] Monitor disk space usage (uploads directory)
- [ ] Track API response times and throughput

### 5. File Upload Management
- [ ] Configure secure uploads directory with appropriate permissions
- [ ] Set up automated cleanup of old uploads
- [ ] Monitor disk space usage
- [ ] Consider cloud storage (S3, Azure Blob) for scalability
- [ ] Implement virus scanning for uploaded files

### 6. Deployment Strategies

#### Using Docker (Recommended)
```bash
# Build production image
docker build --target production -t performance-tracker:1.0.0 .

# Run with environment file
docker run -p 5000:5000 --env-file .env.production performance-tracker:1.0.0

# With docker-compose
docker-compose -f docker-compose.yml up -d
```

#### Using PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start src/app.js --name "performance-tracker" --env production
pm2 logs performance-tracker
pm2 monit
```

#### Using Systemd
Create `/etc/systemd/system/performance-tracker.service`:
```
[Unit]
Description=Performance Tracker API
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/performance-tracker
EnvironmentFile=/opt/performance-tracker/.env
ExecStart=/usr/bin/node /opt/performance-tracker/src/app.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 7. Reverse Proxy Configuration (nginx)
```nginx
upstream performance_tracker {
  server localhost:5000;
}

server {
  listen 443 ssl http2;
  server_name api.example.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  client_max_body_size 10M;

  location / {
    proxy_pass http://performance_tracker;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
  }

  location /health {
    access_log off;
    proxy_pass http://performance_tracker;
  }
}
```

### 8. Performance Optimization

#### Connection Pooling
MongoDB connection pool is configured with:
- Min pool size: 5
- Max pool size: 10
- Adjust based on expected concurrent connections

#### Query Optimization
- Use `.lean()` for read-only queries
- Ensure indexes are created on frequently queried fields
- Consider query caching for top-performers endpoint

#### Load Balancing
```
Client -> Load Balancer (nginx/HAProxy)
       -> Instance 1
       -> Instance 2
       -> Instance 3
       -> Shared MongoDB
       -> Shared Upload Storage
```

### 9. Testing

Before deployment:
```bash
# Run tests
npm test

# Check linting
npm run lint

# Load testing example (using Apache Bench)
ab -n 1000 -c 10 http://localhost:5000/health

# Database connection test
npm run test:integration
```

### 10. Rollback Plan

1. Keep previous version running on different port
2. Update load balancer to switch traffic back
3. Database schema changes should be backwards compatible
4. Document breaking changes in releases

### 11. Scaling Considerations

#### Vertical Scaling
- Increase Node.js heap size (--max-old-space-size)
- Use Node clustering (cluster module)

#### Horizontal Scaling
- Run multiple instances behind load balancer
- Use shared MongoDB instance
- Use shared file storage (NFS, S3, Azure Blob)
- Implement Redis for session management (if needed)

### 12. Cost Optimization

- Monitor resource utilization
- Right-size container/VM resources
- Clean up old uploads regularly
- Use CDN for static file serving if applicable
- Consider database indexing efficiency

## Example Production .env File

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/performance-tracker?retryWrites=true&w=majority
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/mnt/uploads
API_VERSION=v1
REQUEST_TIMEOUT=30000
CORS_ORIGIN=https://app.example.com
LOG_LEVEL=info
```

## Monitoring Commands

```bash
# Check application health
curl https://api.example.com/health

# Check readiness
curl https://api.example.com/ready

# View logs (Docker)
docker logs <container-id> -f

# View logs (PM2)
pm2 logs performance-tracker
```

## Support & Debugging

For production issues:
1. Check application logs
2. Monitor MongoDB connections and performance
3. Review disk space on uploads directory
4. Check CPU and memory usage
5. Review error rates in monitoring dashboard
