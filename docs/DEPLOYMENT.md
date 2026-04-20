# 🚀 Production Deployment Guide

## Overview
This guide covers deploying the Performance Tracker application to production environments.

## Prerequisites
- Docker and Docker Compose installed
- MongoDB Atlas account (or managed MongoDB instance)
- Node.js 18+ installed
- npm or yarn package manager
- Domain name for your application
- SSL/TLS certificates (Let's Encrypt or provider)

## Deployment Options

### Option 1: Docker Compose (Self-Hosted)

#### Setup
1. **Create production environment file:**
   ```bash
   cp .env.production .env.prod
   # Edit .env.prod with your production values
   ```

2. **Export variables before deployment:**
   ```bash
   export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/performance-tracker"
   export CORS_ORIGIN="https://yourdomain.com"
   export MONGO_PASSWORD="your_secure_password"
   ```

3. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verify deployment:**
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:5000/ready
   ```

#### Monitoring
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check status
docker-compose -f docker-compose.prod.yml ps

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Option 2: Kubernetes Deployment

1. **Build and push image:**
   ```bash
   docker build -t your-registry/performance-tracker:latest --target production .
   docker push your-registry/performance-tracker:latest
   ```

2. **Create ConfigMap and Secrets:**
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: performance-tracker-config
   data:
     NODE_ENV: production
     API_VERSION: v1
     LOG_LEVEL: info
   ---
   apiVersion: v1
   kind: Secret
   metadata:
     name: performance-tracker-secrets
   type: Opaque
   data:
     MONGO_URI: <base64-encoded-uri>
     CORS_ORIGIN: <base64-encoded-domain>
   ```

3. **Deploy Kubernetes manifest:**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: performance-tracker
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: performance-tracker
     template:
       metadata:
         labels:
           app: performance-tracker
       spec:
         containers:
         - name: performance-tracker
           image: your-registry/performance-tracker:latest
           ports:
           - containerPort: 5000
           envFrom:
           - configMapRef:
               name: performance-tracker-config
           - secretRef:
               name: performance-tracker-secrets
           healthCheck:
             httpGet:
               path: /health
               port: 5000
             initialDelaySeconds: 30
             periodSeconds: 10
   ```

### Option 3: Cloud Platform Deployments

#### AWS (ECS/EC2)
1. Push image to ECR:
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin your-account.dkr.ecr.region.amazonaws.com
   docker tag performance-tracker:latest your-account.dkr.ecr.region.amazonaws.com/performance-tracker:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/performance-tracker:latest
   ```

2. Create ECS task definition with environment variables
3. Create ECS service with load balancer
4. Configure RDS for MongoDB (or use DocumentDB)

#### Google Cloud (Cloud Run)
```bash
gcloud run deploy performance-tracker \
  --image gcr.io/your-project/performance-tracker:latest \
  --platform managed \
  --memory 512Mi \
  --set-env-vars MONGO_URI=${MONGO_URI},CORS_ORIGIN=${CORS_ORIGIN}
```

#### Azure (Container Instances / App Service)
```bash
az container create \
  --resource-group myResourceGroup \
  --name performance-tracker \
  --image your-registry.azurecr.io/performance-tracker:latest \
  --environment-variables MONGO_URI=${MONGO_URI} CORS_ORIGIN=${CORS_ORIGIN}
```

## Production Configuration

### Environment Variables Required
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### Security Best Practices
1. **Environment Variables:**
   - Never commit `.env` files
   - Use secure secret management (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotate secrets regularly

2. **Database Security:**
   - Use MongoDB Atlas with IP whitelist
   - Enable encryption at rest and in transit
   - Use strong passwords
   - Enable database backups

3. **Application Security:**
   - Enable HTTPS/TLS
   - Set appropriate CORS origins
   - Implement rate limiting
   - Enable request logging and monitoring
   - Use security headers (HSTS, X-Frame-Options, etc.)

4. **Network Security:**
   - Use VPC/VNet for isolation
   - Implement firewall rules
   - Use security groups/NSGs
   - Enable DDoS protection

### Monitoring & Logging

1. **Application Monitoring:**
   ```bash
   # Example with Datadog
   docker run -e DD_AGENT_HOST=datadog-agent your-registry/performance-tracker:latest
   ```

2. **Logging:**
   - Configure centralized logging (ELK, Splunk, CloudWatch)
   - Set log levels appropriately
   - Monitor error rates and response times

3. **Alerting:**
   - Set up alerts for unhealthy instances
   - Monitor database connection pool
   - Track API response times
   - Monitor disk space and memory usage

### Database Backups

MongoDB Atlas automatic backups:
1. Enable continuous backups
2. Set retention policy (30 days recommended)
3. Test restore procedures regularly

## Scaling

### Horizontal Scaling
1. Use load balancer (AWS ELB, Azure Load Balancer, etc.)
2. Deploy multiple instances behind load balancer
3. Configure session affinity if needed
4. Monitor instance health

### Database Scaling
- MongoDB Atlas auto-scaling for storage
- Connection pooling optimization
- Read replicas for distributed reads

## Health Checks

Endpoints for monitoring:
- `GET /health` - Basic health check
- `GET /ready` - Readiness check (includes DB connection)
- `GET /` - API information endpoint

## Rollback Procedures

1. Keep previous version tags:
   ```bash
   docker tag performance-tracker:production performance-tracker:v1.0.0
   docker push your-registry/performance-tracker:v1.0.0
   ```

2. To rollback:
   ```bash
   docker pull your-registry/performance-tracker:v1.0.0
   docker-compose -f docker-compose.prod.yml down
   docker tag your-registry/performance-tracker:v1.0.0 performance-tracker:production
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Performance Optimization

1. Enable compression (gzip)
2. Implement caching headers
3. Use CDN for static assets (upload directory)
4. Optimize database indexes
5. Monitor and optimize slow queries
6. Use connection pooling
7. Implement circuit breakers for external services

## Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec app env
```

### Database connection issues
```bash
# Test MongoDB connection
mongo "mongodb+srv://user:pass@cluster.mongodb.net/test" --authenticationDatabase admin
```

### Port conflicts
```bash
# Check what's using port 5000
lsof -i :5000
# Kill if necessary
kill -9 <PID>
```

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
2. Implement automated testing
3. Set up monitoring and alerting
4. Configure backup and disaster recovery
5. Plan capacity and scaling strategy
6. Document runbooks for incident response
