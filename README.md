# Dental Clinic Management System

A comprehensive dental clinic management system built with modern technologies and a microservices architecture.

## 🚀 Tech Stack

- **Backend**: Java 25 with Spring Boot 3.5.x
- **Frontend**: Angular 21+ (to be implemented)
- **Database**: H2 In-Memory (local development)
- **Future Migration**: PostgreSQL 16.x (production)
- **API Documentation**: Swagger/OpenAPI 3.0

## 📁 Project Structure

```
.
├── backend/                      # Spring Boot REST API
│   ├── src/main/java/com/dental/ # Java source code
│   ├── src/main/resources/       # Configuration files
│   ├── pom.xml                   # Maven dependencies
│   ├── README.md                 # Backend documentation
│   ├── SETUP.md                  # Setup instructions
│   └── MIGRATION_TO_POSTGRESQL.md # PostgreSQL migration guide
├── frontend/                     # Angular app (to be implemented)
├── CURSOR_PROMPTS.md             # 📌 START HERE - Step-by-step prompts
└── README.md                     # This file
```

## ⚡ Quick Start (Local Development)

### Step 1: Install Prerequisites
- Install JDK 25
- Install Maven 3.9+
- No database installation needed!

### Step 2: Run the Backend
```powershell
cd backend
mvn spring-boot:run
```

### Step 3: Access the Application
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console
- **Health Check**: http://localhost:8080/api/health

### 📌 Start Building Features
Open `CURSOR_PROMPTS.md` and follow the prompts sequentially!

## 💻 Local Development (Without Docker)

### Prerequisites for Local Development

- JDK 25 - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://jdk.java.net/25/)
- Maven 3.9+
- Node.js 20+ (for frontend later)
- **No database installation required!** (H2 is embedded)

### Backend Development

```powershell
cd backend

# Install dependencies and run
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/clinic-backend-0.0.1-SNAPSHOT.jar
```

The backend API will be available at:
- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console

📚 **Documentation:**
- **`CURSOR_PROMPTS.md`** ← **START HERE!** Step-by-step prompts for Cursor AI
- `backend/README.md` - Backend documentation
- `backend/SETUP.md` - Installation guide
- `backend/MIGRATION_TO_POSTGRESQL.md` - PostgreSQL migration (for production later)

### Frontend Development

```powershell
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

The frontend will be available at http://localhost:4200

### H2 Database Access

H2 in-memory database is automatically configured. Access the console:
- **URL**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:dentaldb`
- **Username**: `sa`
- **Password**: (leave empty)

No additional configuration needed! Data persists in memory while the application runs.

## 📖 Development Guide

### Using Cursor AI Prompts (Full Stack Approach)

1. Open `CURSOR_PROMPTS.md`
2. Start with **Phase 0: Initial Setup** (Prompts 1-2)
3. Then follow **Phase by Phase** - each phase builds a complete feature
4. Copy one prompt → Paste into Cursor → Let it generate code
5. **Test immediately** after backend + frontend prompts
6. Move to next prompt

### Example Workflow (Phase 1 - Authentication):

1. **Prompt 3-6**: Build backend (entities, services, controllers)
   - Test in Swagger UI: http://localhost:8080/swagger-ui.html
   - Try login/register endpoints

2. **Prompt 7-9**: Build frontend (login/register screens)
   - Test in browser: http://localhost:4200
   - Try logging in with test user

3. **Prompt 10**: Add auth guard
   - Test: Try accessing routes without login

✅ Now authentication is complete! Move to Phase 2 (Dashboard)

### Testing Your Work

```powershell
# Backend
cd backend
mvn spring-boot:run
# Access: http://localhost:8080/swagger-ui.html

# Frontend (new terminal)
cd frontend
npm install  # first time only
ng serve
# Access: http://localhost:4200

# H2 Console
# Access: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:dentaldb
# Username: sa
# Password: (empty)
```

### UI Components You'll Build:
- 🔐 Login/Register screens
- 📊 Dashboard with charts and cards
- 📋 DataTables for all lists (patients, appointments, invoices, etc.)
- 📅 Calendar view for appointments
- 🎴 Card grids for treatments
- 🖨️ Printable invoices
- 📈 Analytics with pie/bar/line charts
- 👤 User profile and settings

## 🚀 Features To Build (54 Prompts)

### Phase 1: Authentication & Setup
- ⏳ Login & Registration screens (backend + frontend)
- ⏳ Auth guard & routing
- ⏳ Base entities & error handling

### Phase 2: Dashboard
- ⏳ Statistics cards (today's appointments, revenue, patients)
- ⏳ Pie charts (appointments by status)
- ⏳ Bar charts (monthly revenue)
- ⏳ Recent activity DataTable

### Phase 3: Patient Management
- ⏳ Patient list with DataTable (search, sort, paginate)
- ⏳ Add/Edit patient form
- ⏳ Patient details with tabs (overview, appointments, history)

### Phase 4: Appointment Management
- ⏳ Calendar view with color-coded appointments
- ⏳ Appointment list DataTable
- ⏳ Book appointment dialog with slot availability

### Phase 5: Treatment Management
- ⏳ Treatment catalog (card grid layout)
- ⏳ Add/Edit treatment forms
- ⏳ Treatment records within appointments

### Phase 6: Medicine & Prescriptions
- ⏳ Medicine inventory with stock alerts
- ⏳ Stock adjustment dialogs
- ⏳ Prescription management within appointments

### Phase 7: Invoicing
- ⏳ Invoice list with status chips
- ⏳ Professional invoice layout (print-ready)
- ⏳ Auto-generate invoices from appointments

### Phase 8: Expense Tracking
- ⏳ Expense list DataTable with category filters
- ⏳ Add/Edit expense forms
- ⏳ Monthly expense summary

### Phase 9: Reports & Analytics
- ⏳ Reports dashboard with multiple charts
- ⏳ Revenue vs Expense reports
- ⏳ Appointment analytics by doctor/status/time

### Phase 10-12: Final Polish & Production
- ⏳ User management (admin)
- ⏳ Profile page & notifications
- ⏳ Loading indicators & error handling
- ⏳ PostgreSQL migration

## 📝 Current Status

✅ **Ready:** Spring Boot skeleton with H2 database  
🔨 **Next:** Follow prompts in `CURSOR_PROMPTS.md` to build features  
⏳ **Later:** Migrate to PostgreSQL for production

## 🎯 Getting Started

1. Read `backend/SETUP.md` for installation
2. Run `mvn spring-boot:run` in backend folder
3. Open `CURSOR_PROMPTS.md`
4. Start with Prompt 1 and work sequentially
5. Test each feature in Swagger UI and H2 Console

---

**Ready to build!** 🚀 Open `CURSOR_PROMPTS.md` and start coding!
