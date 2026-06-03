# FWC AI-Powered HRMS

## 🎯 Project Overview

An intelligent Human Resource Management System that leverages AI to automate and streamline HR operations including resume screening, employee management, attendance tracking, payroll, and performance analysis.

### ✨ Key Features

- **AI Resume Screening** - Bulk resume parsing and evaluation using OpenAI/Claude API
- **Multi-User Authentication** - JWT-based secure login system
- **Employee Management** - Complete CRUD operations for employee data
- **Attendance Tracking** - Automated attendance and leave management
- **Payroll System** - Salary calculation and payroll processing
- **Performance Tracking** - Employee performance ratings and reviews
- **Video Interviews** - Integration for recording and managing interviews
- **Analytics Dashboard** - Real-time HR analytics and insights
- **Onboarding Workflow** - Automated employee onboarding process
- **Mobile Responsive** - Fully responsive UI for all devices

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js, React, TailwindCSS, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **AI/ML** | OpenAI API, Claude API, Python (ML services) |
| **Authentication** | JWT, Firebase Auth |
| **Deployment** | Vercel, Render, Heroku |
| **DevOps** | Docker, GitHub Actions |

---

## 📁 Project Structure

```
FWC-HRMS/
├── frontend/                  # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
├── backend/                   # Node.js Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
├── ml-services/              # Python AI Services
│   ├── resume_screening.py
│   ├── requirements.txt
│   └── app.py
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/VasanthaKumara1/FWC.git
cd FWC

# Install dependencies
npm install          # Root dependencies
cd frontend && npm install
cd ../backend && npm install
cd ../ml-services && pip install -r requirements.txt
```

---

## 📋 AI Features (Minimum 4 Required)

1. **AI Resume Screening** - Extract and evaluate resumes automatically
2. **Performance Prediction** - ML model to predict employee performance
3. **Sentiment Analysis** - Analyze feedback and reviews
4. **Recommendation System** - Suggest suitable candidates for roles
5. **Data Analytics** - Predictive analytics for HR insights

---

## 📝 Documentation

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
