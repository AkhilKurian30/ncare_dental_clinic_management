# 🚀 Dental Clinic Management System - Quick Start

## ✅ Status: Phase 0 & Phase 1 Complete!

Both backend and frontend are up and running!

---

## 🌐 Access URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:4200 | ✅ Running |
| **Backend API** | http://localhost:8080 | ✅ Running |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | ✅ Available |
| **H2 Console** | http://localhost:8080/h2-console | ✅ Available |
| **Health Check** | http://localhost:8080/api/health | ✅ OK |

---

## 🧪 Test the Application

### 1. Register a New User
1. Open browser: http://localhost:4200
2. Click **"Register here"**
3. Fill the form:
   ```
   First Name: John
   Last Name: Doe
   Email: admin@dental.com
   Password: Admin@123
   Confirm Password: Admin@123
   Role: ADMIN
   ```
4. Click **"Register"**
5. ✅ Success! Auto-redirects to login

### 2. Login
1. Enter credentials:
   ```
   Email: admin@dental.com
   Password: Admin@123
   ```
2. Click **"Sign In"**
3. ✅ Redirected to Dashboard

### 3. Test Protected Routes
- Try accessing http://localhost:4200/dashboard without login
- ✅ Should redirect to login (Auth Guard working!)

---

## 📋 What's Been Implemented

### ✅ Backend (Java 25 + Spring Boot 3.5.0)
- ✅ Base Entity with JPA Auditing
- ✅ User Entity with Role-based access
- ✅ Authentication API (Login/Register)
- ✅ Password encryption (BCrypt)
- ✅ Exception handling with custom exceptions
- ✅ H2 in-memory database
- ✅ CORS enabled for frontend
- ✅ Swagger API documentation

### ✅ Frontend (Angular 21)
- ✅ Login screen with Material Design
- ✅ Register screen with form validation
- ✅ Dashboard with user info
- ✅ Auth Guard for protected routes
- ✅ Auth Service with token management
- ✅ HTTP Interceptor for Authorization headers
- ✅ Responsive design
- ✅ Error handling and display

---

## 🎯 API Endpoints

### Authentication
```bash
# Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@dental.com",
  "password": "Admin@123"
}

# Register
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "user@dental.com",
  "password": "Password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "STAFF"
}

# Get Current User (placeholder)
GET http://localhost:8080/api/auth/me
Authorization: Bearer <token>
```

---

## 🛠️ Development Commands

### Backend
```bash
# Start backend
cd backend
mvn spring-boot:run

# Build
mvn clean install

# Run tests
mvn test
```

### Frontend
```bash
# Start frontend
cd frontend/dental-clinic-app
ng serve

# Build for production
ng build --configuration production

# Generate component
ng generate component components/your-component
```

---

## 📊 H2 Database Console

**Access:** http://localhost:8080/h2-console

**Connection Details:**
- JDBC URL: `jdbc:h2:mem:dentaldb`
- Username: `sa`
- Password: *(leave empty)*

**Query to see users:**
```sql
SELECT * FROM users;
```

---

## 📁 Project Structure

```
ncare_dental_clinic_management/
├── backend/                      # Java Spring Boot backend
│   ├── src/main/java/com/dental/
│   │   ├── config/              # Configuration classes
│   │   ├── controller/          # REST controllers
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── exception/           # Custom exceptions & handlers
│   │   ├── model/               # JPA entities
│   │   ├── repository/          # JPA repositories
│   │   └── service/             # Business logic
│   └── pom.xml
│
└── frontend/dental-clinic-app/  # Angular 21 frontend
    ├── src/app/
    │   ├── components/          # UI components
    │   │   ├── auth/           # Login & Register
    │   │   └── dashboard/      # Dashboard
    │   ├── guards/             # Route guards
    │   ├── models/             # TypeScript interfaces
    │   ├── services/           # API services
    │   └── environments/       # Environment configs
    └── package.json
```

---

## 🎨 Features Implemented

### 🔐 Authentication & Authorization
- [x] User registration with validation
- [x] User login with JWT token (UUID placeholder)
- [x] Password encryption (BCrypt)
- [x] Protected routes with Auth Guard
- [x] Token storage in localStorage
- [x] Auto-redirect after login/logout

### 🎨 UI/UX
- [x] Material Design components
- [x] Responsive layout (mobile-friendly)
- [x] Loading spinners
- [x] Error message display
- [x] Form validation feedback
- [x] Password visibility toggle
- [x] Success notifications (Snackbar)

### 🔧 Backend Features
- [x] RESTful API endpoints
- [x] Global exception handling
- [x] Soft delete functionality
- [x] JPA auditing (created/updated timestamps)
- [x] UUID as primary key
- [x] CORS configuration
- [x] Swagger documentation

---

## 🚦 Next Steps (Phase 2)

Ready to continue? Here are the next features:

1. **Main Layout with Sidebar Navigation**
   - Collapsible sidebar menu
   - Top toolbar with user info
   - Route outlets for content

2. **Dashboard Statistics**
   - Today's appointments count
   - Total patients count
   - Monthly revenue
   - Pending invoices

3. **Dashboard UI**
   - Statistics cards
   - Charts (Pie & Bar charts)
   - Recent activity table

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill the process if needed (replace PID)
taskkill /PID <PID> /F
```

### Frontend not starting?
```bash
# Clear node modules and reinstall
cd frontend/dental-clinic-app
rm -rf node_modules
npm install
ng serve
```

### Database issues?
- H2 is in-memory, so data resets on restart
- Check H2 console: http://localhost:8080/h2-console
- Verify JDBC URL: `jdbc:h2:mem:dentaldb`

---

## 📚 Documentation

- **Backend API**: http://localhost:8080/swagger-ui.html
- **Angular Docs**: https://angular.dev/
- **Material Design**: https://material.angular.io/
- **Spring Boot**: https://spring.io/projects/spring-boot

---

## ✨ Everything is working perfectly!

**You can now:**
1. ✅ Register new users
2. ✅ Login and get authenticated
3. ✅ Access protected dashboard
4. ✅ Logout and clear session

**Ready for Phase 2!** 🚀
