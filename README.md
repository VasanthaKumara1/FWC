# FWC AI-Powered HRMS

## 🎯 Enterprise HR Management System

A production-ready Human Resource Management System with AI capabilities for resume screening, employee management, payroll processing, attendance tracking, and performance analytics.

> **Status**: ✅ Production Ready | **Version**: 1.0.0 | **License**: MIT

## ✨ Core Features

### HR Operations
- ✅ **Employee Management** - Complete CRUD operations with department assignment
- ✅ **Attendance Tracking** - Check-in/check-out with monthly analytics
- ✅ **Leave Management** - Request workflow with approval system
- ✅ **Payroll Processing** - Automated salary calculations with deductions & bonuses
- ✅ **Performance Reviews** - Rating system with detailed feedback

### AI & Analytics
- ✅ **AI Resume Screening** - Automated resume analysis & candidate evaluation (Gemini 2.0)
- ✅ **Analytics Dashboard** - Real-time HR metrics and insights
- ✅ **Performance Analytics** - Rating distribution and trends
- ✅ **Payroll Analytics** - Salary trends and financial insights

### Security & Authentication
- ✅ **Multi-User Authentication** - BetterAuth with OAuth 2.0 & JWT
- ✅ **Role-Based Access Control** - Secure user authorization
- ✅ **Session Management** - Secure session handling
- ✅ **API Security** - CORS protection and request validation

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 15, React 18, TypeScript, TailwindCSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL 15 (Drizzle ORM) |
| **AI/ML** | Google Gemini 2.0 Flash API, Python Flask |
| **Authentication** | BetterAuth, JWT, OAuth 2.0 |
| **Deployment** | Docker, Docker Compose |
| **DevOps** | GitHub Actions, Health Checks, Multi-stage builds |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (local development)
- PostgreSQL 15+ (local development)

### Installation

```bash
# Clone repository
git clone https://github.com/VasanthaKumara1/FWC.git
cd FWC

# Setup environment
cp .env.example .env.local

# Local development
npm run dev

# Or with Docker
docker-compose up -d
```

### Environment Variables

```bash
cp .env.example .env.production
# Edit with your actual values
nano .env.production
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection
- `GEMINI_API_KEY` - AI resume screening API
- `BETTER_AUTH_SECRET` - Authentication secret
- `FRONTEND_URL` - Application URL

---

## 📊 Project Structure

```
FWC/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── employees.ts
│   │   ├── payroll.ts
│   │   ├── performance.ts
│   │   ├── attendance.ts
│   │   ├── leaves.ts
│   │   ├── analytics.ts
│   │   └── resume-screening.ts
│   ├── dashboard/                # Admin dashboard
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
│
├── backend/                      # Express.js API
│   ├── src/
│   │   ├── server.js
│   │   ├── middleware.js
│   │   └── db.js
│   ├── Dockerfile
│   └── package.json
│
├── ml-services/                  # Python ML Services
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── lib/
│   ├── auth.ts                   # Authentication setup
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts             # Database schema
│   └── utils.ts
│
├── components/                   # React components
├── public/                       # Static assets
├── docker-compose.yml            # Production compose file
├── Dockerfile.frontend           # Frontend build
├── PRODUCTION.md                 # Deployment guide
└── package.json
```

---

## 🗄️ Database Schema

PostgreSQL with Drizzle ORM:

```
Authentication:
  - users
  - sessions
  - accounts
  - verification

HR Management:
  - employees
  - departments
  - attendance
  - leaves
  - payroll
  - performance_reviews
  - analytics_snapshots
```

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Service Endpoints
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health
- **ML Services**: http://localhost:5001/health

### Cloud Deployment

**Vercel** (Frontend)
```bash
# Deploy Next.js frontend
vercel deploy
```

**Render.com** (Backend)
- Connect GitHub repository
- Set environment variables
- Deploy Docker image

**Database** (AWS RDS / Neon)
- Create PostgreSQL instance
- Update DATABASE_URL
- Run migrations

---

## 📖 API Documentation

See [PRODUCTION.md](PRODUCTION.md) for complete API documentation and deployment guide.

Base URL: `http://localhost:5000/api/v1`

### Key Endpoints
- `GET /health` - Health check
- `POST /auth/login` - User authentication
- `GET/POST/PUT /employees` - Employee management
- `POST /payroll/generate` - Generate payroll
- `POST /performance` - Add performance review

---

## ✅ Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Employee Management | ✅ Complete | Full CRUD with search |
| Payroll System | ✅ Complete | Auto-calculation, approval workflow |
| Attendance | ✅ Complete | Check-in/out tracking |
| Leave Management | ✅ Complete | Request & approval system |
| Performance Reviews | ✅ Complete | Rating & analytics |
| AI Resume Screening | ✅ Complete | Gemini 2.0 integration |
| Analytics Dashboard | ✅ Complete | Real-time metrics |
| Mobile Responsive | ✅ Complete | TailwindCSS responsive |
| Authentication | ✅ Complete | BetterAuth + OAuth |
| Docker Support | ✅ Complete | Multi-stage builds |

---

## 🔒 Security

- **JWT Authentication** - Stateless secure tokens
- **CORS Protection** - Restricted to authorized origins
- **Environment Variables** - Sensitive data protected
- **Hashed Passwords** - Industry-standard hashing
- **Database SSL** - Encrypted connections
- **Health Checks** - Automatic service restart

---

## 📈 Performance

- **Next.js Optimization** - Built-in code splitting & optimization
- **Multi-stage Docker builds** - Lightweight production images
- **Connection pooling** - Optimized database connections
- **Caching** - Browser and server-side caching
- **Compression** - Gzip response compression

---

## 🐛 Troubleshooting

```bash
# Check service health
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Database backup
docker-compose exec postgres pg_dump -U fwc_user -d fwc_hrms > backup.sql
```

---

## 📚 Documentation

- [Deployment Guide](PRODUCTION.md) - Production deployment instructions
- [API Documentation](docs/API.md) - Complete API reference

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support

For issues and questions:
- 🐛 [GitHub Issues](https://github.com/VasanthaKumara1/FWC/issues)
- 📧 Email: support@fwc.local
- 📚 [Documentation](docs/)

---

**Made with ❤️ by VasanthaKumara1**  
**Last Updated**: June 2026 | **Version**: 1.0.0

- [Architecture Diagram](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)

---

## 🔐 Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Role-based Access Control (RBAC)
- ✅ Input Validation & Sanitization
- ✅ SQL Injection Prevention
- ✅ CORS Configuration

---

## 📊 Performance Requirements

- ✅ Mobile Responsive Design
- ✅ Fast Load Times (<3s)
- ✅ Optimized Database Queries
- ✅ Caching Strategies

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

## 👥 Team Collaboration

- Use **Jira/Asana** for task tracking
- **GitHub Projects** for sprint planning
- **Discord/Slack** for communication
- Daily standup meetings

---

## ✅ Submission Checklist

- [ ] All 4+ AI features implemented
- [ ] Mobile responsive design
- [ ] Code documentation complete
- [ ] README with setup instructions
- [ ] Architecture diagram
- [ ] API documentation
- [ ] GitHub repository with clean history
- [ ] Live deployment link
- [ ] Video walkthrough (optional)

---

## 📄 License

This project is part of the FWC AI/ML with Fullstack Hackathon 2026.

---

**Let's build the future of HR management! 🚀**
