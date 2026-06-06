# FWC HRMS - Quick Start Guide

## 🚀 Start Your Production Environment

### Step 1: Verify Environment Setup
```bash
# Check that all required files exist
bash check-deployment.sh
```

### Step 2: Build & Deploy
```bash
# Start all services
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check service logs
docker-compose logs -f
```

### Step 3: Verify Services Are Healthy
```bash
# Check frontend
curl http://localhost:3000

# Check backend API
curl http://localhost:5000/health

# Check ML services
curl http://localhost:5001/health

# Check database
docker-compose exec postgres psql -U fwc_user -d fwc_hrms -c "SELECT 1;"
```

### Step 4: Access the Application
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
ML API:   http://localhost:5001
```

---

## 📊 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ml-services
docker-compose logs -f postgres
```

### Database Operations
```bash
# Connect to database
docker-compose exec postgres psql -U fwc_user -d fwc_hrms

# Backup database
docker-compose exec postgres pg_dump -U fwc_user -d fwc_hrms > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U fwc_user -d fwc_hrms < backup.sql

# View database tables
docker-compose exec postgres psql -U fwc_user -d fwc_hrms -c "\dt"
```

### Service Management
```bash
# Stop all services
docker-compose stop

# Start all services
docker-compose start

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose build backend

# Remove all containers and volumes (⚠️ destructive)
docker-compose down -v
```

### Monitoring
```bash
# Real-time resource usage
docker stats

# Container info
docker-compose ps

# Service health
docker-compose exec postgres pg_isready -U fwc_user
```

---

## ⚠️ Common Issues & Solutions

### "Cannot connect to database"
```bash
# Check database is running
docker-compose ps postgres

# Check credentials
cat .env.production | grep DATABASE_URL

# Restart database
docker-compose restart postgres
```

### "Port already in use"
```bash
# Find what's using the port
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :5001  # ML Services
lsof -i :5432  # Database

# Free the port
kill -9 <PID>
```

### "Out of disk space"
```bash
# Check disk usage
df -h

# Remove unused Docker images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### "Services crashing immediately"
```bash
# Check logs
docker-compose logs

# Verify environment file
cat .env.production

# Check for missing required variables
grep "undefined" docker-compose.yml
```

---

## 🔒 Security Tips

1. **Never commit sensitive files**
   - .env.production
   - Private keys
   - Database backups

2. **Rotate secrets regularly**
   - BETTER_AUTH_SECRET
   - Database password
   - API keys

3. **Use strong passwords**
   - Database: 20+ characters, mix of types
   - API keys: Use generated secrets

4. **Restrict access**
   - Firewall: Only open necessary ports
   - Database: User with limited privileges
   - APIs: Enable rate limiting

5. **Monitor activity**
   - Review logs regularly
   - Set up alerts
   - Check access logs

---

## 📈 Performance Tuning

### Database
```sql
-- Create indexes for common queries
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_payroll_month_year ON payroll(month, year);
CREATE INDEX idx_attendance_date ON attendance(date);
```

### Backend
```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max_old_space_size=4096
```

### Nginx (if using)
```nginx
# Increase worker connections
worker_connections 4096;

# Enable gzip compression
gzip on;
gzip_vary on;
```

---

## 🆘 Emergency Procedures

### Complete System Restart
```bash
# Stop all services
docker-compose down

# Remove everything
docker-compose down -v

# Restart fresh
docker-compose up -d
```

### Database Recovery from Backup
```bash
# Restore from backup file
docker-compose exec -T postgres psql -U fwc_user -d fwc_hrms < backup_YYYYMMDD.sql

# Verify restore
docker-compose exec postgres psql -U fwc_user -d fwc_hrms -c "SELECT COUNT(*) FROM employees;"
```

### View System Metrics
```bash
# CPU, Memory, IO
docker stats

# Detailed container info
docker inspect <container_name>

# View network details
docker network inspect fwc-network
```

---

## 📞 Need Help?

1. Check logs: `docker-compose logs`
2. Run health check: `bash check-deployment.sh`
3. Review PRODUCTION.md for detailed guide
4. Check DEPLOYMENT_CHECKLIST.md for setup verification

---

**Last Updated**: June 2026 | **Version**: 1.0.0
