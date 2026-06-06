# 🚀 FWC HRMS - Production Deployment Checklist

## Pre-Deployment

### Security
- [ ] Generate strong `BETTER_AUTH_SECRET` (32+ characters)
- [ ] Set unique database password
- [ ] Configure SSL certificates (Let's Encrypt)
- [ ] Update CORS_ORIGIN to your domain
- [ ] Set JWT_EXPIRY appropriately
- [ ] Configure API rate limiting
- [ ] Enable database encryption
- [ ] Review security headers in nginx.conf

### Environment Configuration
- [ ] Copy `.env.example` to `.env.production`
- [ ] Update all API keys:
  - [ ] `GEMINI_API_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `BETTER_AUTH_SECRET`
- [ ] Set correct URLs:
  - [ ] `FRONTEND_URL` (e.g., https://yourdomain.com)
  - [ ] `NEXT_PUBLIC_API_URL` (e.g., https://api.yourdomain.com)
  - [ ] `BACKEND_URL`
- [ ] Configure database:
  - [ ] `DATABASE_URL` pointing to production PostgreSQL
  - [ ] `DB_USER` with restricted privileges
  - [ ] `DB_PASSWORD` (strong)
  - [ ] `DB_NAME`

### Infrastructure
- [ ] Reserve domain name
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure DNS records:
  - [ ] A record for main domain
  - [ ] CNAME for api subdomain
  - [ ] MX records (if using email)
- [ ] Set up PostgreSQL 15+
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerting

### Application
- [ ] Run `npm run build` locally and verify
- [ ] Test authentication flow
- [ ] Test database connections
- [ ] Verify all API endpoints
- [ ] Test file uploads (if applicable)
- [ ] Verify email notifications (if configured)

---

## Deployment Steps

### 1. Build Docker Images
```bash
docker-compose build
```
- [ ] Frontend image builds successfully
- [ ] Backend image builds successfully
- [ ] ML services image builds successfully
- [ ] All images tagged correctly

### 2. Deploy Services
```bash
docker-compose up -d
```
- [ ] All services start without errors
- [ ] Health checks pass
- [ ] Services properly networked

### 3. Database Initialization
```bash
docker-compose exec postgres psql -U fwc_user -d fwc_hrms -c "SELECT version();"
```
- [ ] Database connection successful
- [ ] Schema tables created
- [ ] Initial data loaded (if needed)

### 4. Verify Services
```bash
# Check health endpoints
curl https://yourdomain.com/health
curl https://api.yourdomain.com/health
curl https://yourdomain.com/ml/health
```
- [ ] Frontend responding
- [ ] Backend API responding
- [ ] ML services responding

### 5. Test Core Features
- [ ] User login/signup
- [ ] Dashboard loads
- [ ] Employee list displays
- [ ] Payroll processing works
- [ ] Resume screening functional
- [ ] Analytics dashboard loads

### 6. Configure Reverse Proxy
```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/fwc-hrms
sudo ln -s /etc/nginx/sites-available/fwc-hrms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
- [ ] Nginx config valid
- [ ] HTTP → HTTPS redirect working
- [ ] SSL certificate valid
- [ ] Rate limiting working

---

## Post-Deployment

### Monitoring Setup
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Enable database backups
- [ ] Set up log aggregation
- [ ] Configure alerts for:
  - [ ] High CPU usage
  - [ ] Database connection issues
  - [ ] High error rates
  - [ ] Disk space low

### Backup Configuration
```bash
# Add to crontab for daily backups
0 2 * * * cd /path/to/FWC && docker-compose exec -T postgres pg_dump -U fwc_user -d fwc_hrms > backups/backup_$(date +\%Y\%m\%d).sql
```
- [ ] Automated backups configured
- [ ] Backup retention policy set (30+ days)
- [ ] Test restore procedure

### Security Hardening
- [ ] Enable firewall
- [ ] Configure fail2ban
- [ ] Set up intrusion detection
- [ ] Review access logs
- [ ] Disable unnecessary ports
- [ ] Configure SSH key-only access

### Documentation
- [ ] Update README with production URLs
- [ ] Document custom configurations
- [ ] Create runbook for common issues
- [ ] Document deployment procedure
- [ ] Create disaster recovery plan

### Performance Optimization
- [ ] Enable database query optimization
- [ ] Configure caching headers
- [ ] Set up CDN (if needed)
- [ ] Monitor response times
- [ ] Optimize database indexes

---

## Daily/Weekly/Monthly Checks

### Daily ✅
- Check service health endpoints
- Review error logs
- Monitor database performance
- Check disk space

### Weekly ✅
- Review security logs
- Check backup integrity
- Update dependencies (if safe)
- Performance metrics review

### Monthly ✅
- Security audit
- Backup restoration test
- Certificate expiry check
- Update documentation
- Capacity planning review

---

## Troubleshooting Quick Reference

### Services won't start
```bash
docker-compose logs
docker-compose down -v
docker-compose up -d
```

### Database connection error
```bash
docker-compose exec postgres psql -U fwc_user
\c fwc_hrms
\dt  # Show tables
```

### High memory usage
```bash
docker stats
docker-compose restart backend
```

### SSL certificate renewal
```bash
sudo certbot renew --dry-run
sudo systemctl restart nginx
```

### View logs in real-time
```bash
docker-compose logs -f [service-name]
```

---

## Emergency Contacts & Resources

- **Nginx Docs**: https://nginx.org/en/docs/
- **Docker Docs**: https://docs.docker.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Let's Encrypt**: https://letsencrypt.org/

---

## Sign-Off

- [ ] All checks completed
- [ ] Team reviewed deployment
- [ ] Backup verified
- [ ] Monitoring active
- [ ] Ready for production ✅

**Deployed by**: ________________  
**Date**: ________________  
**Version**: 1.0.0
