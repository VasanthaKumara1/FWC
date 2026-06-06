#!/bin/bash
# Production deployment script

set -e

echo "🚀 Starting FWC HRMS Production Deployment..."

# Check environment
if [ ! -f .env.production ]; then
  echo "❌ .env.production file not found!"
  echo "📋 Please create .env.production with required variables"
  exit 1
fi

# Load environment
export $(cat .env.production | xargs)

echo "📦 Building Docker images..."
docker-compose -f docker-compose.yml build

echo "🗄️  Starting services..."
docker-compose -f docker-compose.yml up -d

echo "✅ Waiting for services to be healthy..."
sleep 10

echo "🔍 Checking service health..."
docker-compose -f docker-compose.yml ps

echo "✨ Deployment complete!"
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000/health"
echo "   ML API:   http://localhost:5001/health"
