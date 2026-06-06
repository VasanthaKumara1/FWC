#!/bin/bash

# FWC HRMS - Monitoring & Health Check Script
# Run periodically to monitor service health

set -e

SERVICES=("frontend:3000" "backend:5000" "ml-services:5001" "postgres:5432")
ALERT_EMAIL="admin@yourdomain.com"
LOG_FILE="/var/log/fwc-hrms-health.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_service_health() {
    local service=$1
    local port=$2
    local name=$(echo $service | tr ':' '_')
    
    if nc -z localhost $port 2>/dev/null; then
        log_message "✅ $service is running"
        return 0
    else
        log_message "❌ $service is NOT running"
        return 1
    fi
}

check_docker_services() {
    log_message "Checking Docker services..."
    
    if docker-compose ps | grep -q "Up"; then
        log_message "✅ Docker services are running"
        return 0
    else
        log_message "❌ Some Docker services are down"
        return 1
    fi
}

check_database() {
    log_message "Checking database..."
    
    if docker-compose exec -T postgres psql -U fwc_user -d fwc_hrms -c "SELECT 1;" &>/dev/null; then
        log_message "✅ Database is responsive"
        return 0
    else
        log_message "❌ Database is NOT responsive"
        return 1
    fi
}

check_disk_space() {
    log_message "Checking disk space..."
    
    usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -lt 85 ]; then
        log_message "✅ Disk space OK ($usage% used)"
        return 0
    else
        log_message "⚠️  Disk space LOW ($usage% used)"
        return 1
    fi
}

check_cpu_memory() {
    log_message "Checking CPU and Memory..."
    
    cpu=$(docker stats --no-stream --format "{{.CPUPerc}}" | head -n 1 | sed 's/%//' | cut -d'.' -f1)
    mem=$(docker stats --no-stream --format "{{.MemPerc}}" | head -n 1 | sed 's/%//' | cut -d'.' -f1)
    
    log_message "   CPU Usage: ${cpu}%"
    log_message "   Memory Usage: ${mem}%"
    
    if [ $cpu -lt 80 ] && [ $mem -lt 80 ]; then
        log_message "✅ CPU and Memory OK"
        return 0
    else
        log_message "⚠️  Resource usage HIGH"
        return 1
    fi
}

check_api_endpoints() {
    log_message "Checking API endpoints..."
    
    # Frontend health
    if curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/health | grep -q "200"; then
        log_message "✅ Frontend health check passed"
    else
        log_message "❌ Frontend health check failed"
    fi
    
    # Backend health
    if curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/health | grep -q "200"; then
        log_message "✅ Backend health check passed"
    else
        log_message "❌ Backend health check failed"
    fi
}

send_alert() {
    local subject=$1
    local message=$2
    
    echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
    log_message "🔔 Alert sent to $ALERT_EMAIL"
}

# Main checks
log_message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_message "FWC HRMS Health Check Started"
log_message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

failed_checks=0

# Run all checks
check_docker_services || ((failed_checks++))
check_database || ((failed_checks++))
check_disk_space || ((failed_checks++))
check_cpu_memory || ((failed_checks++))
check_api_endpoints || ((failed_checks++))

# Summary
log_message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $failed_checks -eq 0 ]; then
    log_message "✅ All health checks passed!"
    exit 0
else
    log_message "⚠️  $failed_checks check(s) failed"
    send_alert "FWC HRMS Health Check Failed" "One or more health checks failed. See logs for details."
    exit 1
fi
