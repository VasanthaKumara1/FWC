#!/bin/bash

# FWC HRMS - Pre-deployment Checklist
# Run this script before deploying to production

set -e

echo "🔍 FWC HRMS - Production Pre-deployment Checklist"
echo "=================================================="
echo ""

FAILED=0

# Check 1: Environment file
echo "1️⃣  Checking .env.production..."
if [ ! -f .env.production ]; then
    echo "   ❌ .env.production not found!"
    FAILED=1
else
    echo "   ✅ .env.production exists"
    
    # Check required variables
    required_vars=("DATABASE_URL" "BETTER_AUTH_SECRET" "GEMINI_API_KEY" "FRONTEND_URL")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.production && ! grep -q "^$var=.*your-.*" .env.production; then
            echo "   ✅ $var configured"
        else
            echo "   ⚠️  $var needs configuration"
        fi
    done
fi

# Check 2: Docker
echo ""
echo "2️⃣  Checking Docker installation..."
if command -v docker &> /dev/null; then
    echo "   ✅ Docker installed ($(docker --version))"
else
    echo "   ❌ Docker not found!"
    FAILED=1
fi

if command -v docker-compose &> /dev/null; then
    echo "   ✅ Docker Compose installed"
else
    echo "   ❌ Docker Compose not found!"
    FAILED=1
fi

# Check 3: Configuration files
echo ""
echo "3️⃣  Checking required configuration files..."
required_files=("docker-compose.yml" "Dockerfile.frontend" "backend/Dockerfile" "ml-services/Dockerfile")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file not found!"
        FAILED=1
    fi
done

# Check 4: Package files
echo ""
echo "4️⃣  Checking package files..."
if [ -f "package.json" ] && [ -f "backend/package.json" ]; then
    echo "   ✅ package.json files exist"
else
    echo "   ❌ Missing package.json files"
    FAILED=1
fi

# Check 5: Database schema
echo ""
echo "5️⃣  Checking database schema..."
if [ -f "lib/db/schema.ts" ]; then
    echo "   ✅ Database schema exists"
else
    echo "   ❌ Database schema not found"
    FAILED=1
fi

# Check 6: Server security
echo ""
echo "6️⃣  Checking server security..."
if grep -q "CORS" backend/src/server.js; then
    echo "   ✅ CORS configured"
else
    echo "   ⚠️  CORS not found in server"
fi

if grep -q "errorHandler" backend/src/server.js; then
    echo "   ✅ Error handling configured"
else
    echo "   ⚠️  Error handling not found"
fi

# Summary
echo ""
echo "=================================================="
if [ $FAILED -eq 0 ]; then
    echo "✅ Pre-deployment checklist passed!"
    echo ""
    echo "🚀 You can now deploy with:"
    echo "   docker-compose up -d"
else
    echo "❌ Pre-deployment checklist failed!"
    echo "   Please fix the issues above before deploying."
fi

exit $FAILED
