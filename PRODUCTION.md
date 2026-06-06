# FWC AI-Powered HRMS - Production Deployment Guide

## Overview

FWC HRMS is an enterprise-grade Human Resource Management System with AI capabilities for resume screening, employee management, payroll processing, attendance tracking, and performance analytics.

## 🏗️ Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer / Reverse Proxy             │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)    │  Backend API (Express.js)           │
│  Port: 3000            │  Port: 5000                         │
├─────────────────────────────────────────────────────────────┤
│              PostgreSQL Database (Port: 5432)                │
├─────────────────────────────────────────────────────────────┤
│         ML Services (Python Flask - Port: 5001)              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for ML services)
- PostgreSQL 15+

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/VasanthaKumara1/FWC.git
   cd FWC
   ```

2. **Create production environment file**
   ```bash
   cp .env.example .env.production
   ```

3. **Update .env.production with your values**
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@postgres:5432/fwc_hrms
   DB_USER=fwc_user
   DB_PASSWORD=secure_password_here
   DB_NAME=fwc_hrms

   # APIs
   GEMINI_API_KEY=your-gemini-api-key
   OPENAI_API_KEY=your-openai-api-key

   # URLs
   FRONTEND_URL=https://yourdomain.com
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com

   # Authentication
   # Authentication
   # Using JWT/session secret for free-tier auth setup
   # (Update with your own strong secret)
   AUTH_SECRET=generate-a-secure-secret
   AUTH_URL=https://yourdomain.com

   # Environment
   NODE_ENV=production
   ```

### Deployment

#### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ml-services

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

#### Using Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Service Configuration

### Frontend (Next.js)
- **Port**: 3000
- **Health Check**: GET /
- **Build**: Multi-stage optimization
- **Environment**: Production-optimized

### Backend (Express.js)
- **Port**: 5000
- **Health Check**: GET /health
- **API Base**: /api/v1/
- **CORS**: Configured to frontend URL

### Database (PostgreSQL)
- **Port**: 5432
- **Container**: postgres:15-alpine
- **Volumes**: postgres_data
- **Backups**: Configure pg_dump periodically

### ML Services (Python/Flask)
- **Port**: 5001
- **Health Check**: GET /health
- **Prediction**: POST /predict
- **Worker**: Gunicorn (4 workers)

## 📊 Monitoring & Health Checks

### Service Health Endpoints
```bash
# Frontend
curl http://localhost:3000

# Backend API
curl http://localhost:5000/health

# ML Services
curl http://localhost:5001/health

# Database
curl http://postgres:5432
```

### Docker Health Status
```bash
docker-compose ps
```

All services include health checks that restart on failure.

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit .env.production
   - Use strong database passwords
   - Rotate API keys regularly

2. **Authentication**
   - BetterAuth handles JWT tokens
   - CORS configured to specific origins
   - Session timeout: 24 hours (configurable)

3. **Database**
   - Enable backups
   - Use SSL connections in production
   - Restrict network access

4. **API**
   - Rate limiting recommended
   - HTTPS/SSL required
   - API key validation on all endpoints

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml
services:
  frontend:
    deploy:
      replicas: 3  # Multiple frontend instances
  backend:
    deploy:
      replicas: 2  # Multiple backend instances
```

### Database Optimization
- Enable query caching
- Create indexes on frequently queried columns
- Archive old records

### Load Balancing
- Use Nginx or HAProxy
- Sticky sessions for authentication
- Health-based routing

## 📦 Backup & Recovery

### Database Backup
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U fwc_user -d fwc_hrms > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U fwc_user -d fwc_hrms < backup.sql
```

### Automated Backups
Add to crontab:
```bash
0 2 * * * cd /path/to/FWC && docker-compose exec -T postgres pg_dump -U fwc_user -d fwc_hrms > backups/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Verify environment file
cat .env.production

# Check port availability
lsof -i :3000 :5000 :5001 :5432
```

### Database connection error
```bash
# Verify database is running
docker-compose ps postgres

# Check database credentials
docker-compose exec postgres psql -U fwc_user -d fwc_hrms -c "SELECT version();"
```

### Performance issues
```bash
# Check container resource usage
docker stats

# View database query logs
docker-compose exec postgres tail -f /var/log/postgresql.log
```

## 🚢 Deployment to Cloud Platforms

### Vercel (Frontend)
```bash
# Connect GitHub repository
# Deploy from Vercel dashboard
# Environment variables: .env.production
```

### Render.com (Backend)
```bash
# Create Web Service
# Connect GitHub repository
# Set environment from .env.production
# Deploy
```

### AWS/GCP/Azure
- Use Docker images directly
- Configure RDS for PostgreSQL
- Use API Gateway for load balancing

## 📝 API Documentation

Base URL: `https://yourdomain.com/api/v1`

### Available Endpoints
- Health Check: `GET /health`
- Authentication: OAuth 2.0 + JWT
- Employees: CRUD operations
- Payroll: Processing & reports
- Attendance: Tracking & analytics
- Performance: Reviews & ratings
- Analytics: Dashboard metrics

## 🎯 Performance Optimization

- Frontend: Vercel Analytics enabled
- Backend: Request compression enabled
- Database: Connection pooling configured
- Images: Optimized with Next.js Image
- Caching: Browser cache headers set

## 📞 Support & Maintenance

### Regular Tasks
- Monitor error logs daily
- Update dependencies weekly
- Backup database daily
- Review security logs monthly

### Contact
- GitHub Issues: Report bugs
- Email: support@fwc.local
- Documentation: `/docs`

## 📄 License

MIT - See LICENSE file for details

---

**Last Updated**: June 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
