# FWC HRMS - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

---

## Employee Endpoints

### Get All Employees
```
GET /employees
Headers: Authorization: Bearer <token>

Response: 200 OK
[
  {
    "_id": "...",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "position": "Software Engineer",
    "salary": 500000,
    "status": "active"
  },
  ...
]
```

### Get Employee by ID
```
GET /employees/:id
Headers: Authorization: Bearer <token>

Response: 200 OK
{ employee object }
```

### Create Employee
```
POST /employees
Headers: Authorization: Bearer <token>
Content-Type: application/json
Role: admin, hr

{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "department": "Engineering",
  "position": "Software Engineer",
  "salary": 500000
}

Response: 201 Created
```

### Update Employee
```
PUT /employees/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json
Role: admin, hr

Response: 200 OK
```

### Delete Employee
```
DELETE /employees/:id
Headers: Authorization: Bearer <token>
Role: admin

Response: 200 OK
```

---

## Resume Screening Endpoints

### Upload Resume
```
POST /resume/upload
Headers: Authorization: Bearer <token>
Role: admin, hr
Content-Type: application/json

{
  "fileName": "resume.pdf",
  "fileUrl": "https://...",
  "candidateName": "Jane Doe",
  "candidateEmail": "jane@example.com",
  "candidatePhone": "9876543210"
}

Response: 201 Created
{
  "message": "Resume uploaded successfully",
  "resume": { ... }
}
```

### Get All Resumes
```
GET /resume
Headers: Authorization: Bearer <token>

Response: 200 OK
[{ resume objects }]
```

### Get Resume by ID
```
GET /resume/:id
Headers: Authorization: Bearer <token>

Response: 200 OK
{ resume object }
```

### Update Resume Status
```
PATCH /resume/:id/status
Headers: Authorization: Bearer <token>
Role: admin, hr
Content-Type: application/json

{
  "status": "shortlisted"
}

Response: 200 OK
```

### Bulk Screen Resumes
```
POST /resume/bulk-screen
Headers: Authorization: Bearer <token>
Role: admin, hr
Content-Type: application/json

{
  "resumeIds": ["id1", "id2", "id3"]
}

Response: 200 OK
{
  "message": "Bulk screening completed",
  "processed": 3
}
```

---

## Attendance Endpoints

### Check In
```
POST /attendance/check-in
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "emp_id"
}

Response: 201 Created
```

### Check Out
```
POST /attendance/check-out
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "emp_id"
}

Response: 200 OK
```

### Get Employee Attendance
```
GET /attendance/employee/:employeeId
Headers: Authorization: Bearer <token>

Response: 200 OK
[{ attendance records }]
```

### Get Monthly Report
```
GET /attendance/report/:month
Headers: Authorization: Bearer <token>
Role: admin, hr, manager

Response: 200 OK
[{ attendance records for month }]
```

---

## Payroll Endpoints

### Generate Payroll
```
POST /payroll/generate
Headers: Authorization: Bearer <token>
Role: admin, hr
Content-Type: application/json

{
  "month": "June",
  "year": 2026
}

Response: 201 Created
```

### Get Payroll by ID
```
GET /payroll/:id
Headers: Authorization: Bearer <token>

Response: 200 OK
{ payroll object }
```

### Get Employee Payroll
```
GET /payroll/employee/:employeeId
Headers: Authorization: Bearer <token>

Response: 200 OK
[{ payroll records }]
```

### Update Payroll Status
```
PATCH /payroll/:id/status
Headers: Authorization: Bearer <token>
Role: admin, hr
Content-Type: application/json

{
  "status": "paid",
  "paymentDate": "2026-06-15"
}

Response: 200 OK
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided" or "Invalid token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error description"
}
```
