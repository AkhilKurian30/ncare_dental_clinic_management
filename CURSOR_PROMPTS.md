# Dental Clinic Management System - Full Stack Prompts

**Stack:** Java 25 + Spring Boot 3.5.x + Angular 21 + H2 Database (local)  
**Approach:** Build backend and frontend together, feature by feature  
**UI Components:** DataTables, Cards, Charts (Pie/Bar), Dashboard, Material Design

---

## Phase 0: Initial Setup

### Prompt 1: Verify Backend Setup
```
Check backend project at e:\GitHub\ncare_dental_clinic_management\backend:
- Java 25, Spring Boot 3.5.0 in pom.xml
- H2 database dependency present
- application.yml with H2 config (jdbc:h2:mem:dentaldb)
- Run: mvn spring-boot:run
- Verify: http://localhost:8080/api/health returns OK
- H2 Console accessible at http://localhost:8080/h2-console
```

### Prompt 2: Create Angular Project
```
Create Angular 21 project in frontend folder:
- Run: ng new dental-clinic-app --routing --style=scss
- Install Angular Material: ng add @angular/material (choose Indigo/Pink theme)
- Install dependencies: npm install chart.js ng2-charts @angular/common/http
- Install DataTables: npm install angular-datatables datatables.net datatables.net-dt
- Configure environment.ts with apiUrl: 'http://localhost:8080'
- Update app.component to use Material theme
- Create folder structure: components/, services/, models/, guards/
```

---

## Phase 1: Base Setup & Authentication

### Prompt 3: Backend - Create Base Entity
```
Create BaseEntity at com.dental.model.BaseEntity:
- @MappedSuperclass with UUID id
- createdAt, updatedAt (LocalDateTime) with @CreatedDate, @LastModifiedDate
- deleted (Boolean, default false) for soft deletes
- Use @EntityListeners(AuditingEntityListener.class)

Create JpaAuditingConfig with @EnableJpaAuditing
```

### Prompt 4: Backend - Create User Entity and Repository
```
Create Role enum: ADMIN, DOCTOR, STAFF, GUEST_DOCTOR

Create User entity extending BaseEntity:
- email (unique, @Email), password (BCrypt), firstName, lastName, role, active
- @Entity with unique index on email

Create UserRepository:
- findByEmail, existsByEmail, findByRole, findAllActive
```

### Prompt 5: Backend - User Service & Authentication
```
Create UserService:
- createUser (hash password with BCryptPasswordEncoder)
- updateUser, getById, getAll, softDelete
- validateCredentials(email, password) for login
- Check email uniqueness

Create AuthController at /api/auth:
- POST /login → { email, password } → returns { token, user info }
- POST /register → create new user
- GET /me → get current user info
For now, return simple token (UUID string), add JWT later
```

### Prompt 6: Backend - Exception Handling
```
Create custom exceptions:
- ResourceNotFoundException, DuplicateResourceException, InvalidCredentialsException

Create GlobalExceptionHandler with @RestControllerAdvice:
- Handle all exceptions with proper HTTP status codes
- Return: { timestamp, status, message, path }
```

### Prompt 7: Frontend - Auth Models & Service
```
Create models/user.model.ts:
- User interface: id, email, firstName, lastName, role, active
- LoginRequest, LoginResponse, RegisterRequest

Create services/auth.service.ts:
- login(credentials) → Observable<LoginResponse>
- register(data) → Observable<User>
- logout()
- getCurrentUser() → Observable<User>
- Store token in localStorage
- Add Authorization header to all HTTP requests
```

### Prompt 8: Frontend - Login Screen
```
Create components/auth/login:
- Material card with centered layout
- Email and password fields (mat-form-field)
- Login button with loading spinner
- Link to register page
- Show error messages from API
- Redirect to dashboard on success
- Responsive design
```

### Prompt 9: Frontend - Register Screen
```
Create components/auth/register:
- Material card with form fields: email, password, confirm password, firstName, lastName
- Role dropdown (default: STAFF)
- Form validation (email format, password min 8 chars, passwords match)
- Register button with loading state
- Link back to login
- Success message → redirect to login
```

### Prompt 10: Frontend - Auth Guard
```
Create guards/auth.guard.ts:
- Check if token exists in localStorage
- Redirect to login if not authenticated
- Implement CanActivate interface
```

---

## Phase 2: Dashboard & Navigation

### Prompt 11: Frontend - Main Layout with Sidebar
```
Create components/layout/main-layout:
- Material Sidenav with toolbar
- Sidebar menu items:
  * Dashboard (home icon)
  * Patients (people icon)
  * Appointments (calendar icon)
  * Treatments (medical icon)
  * Medicines (medication icon)
  * Invoices (receipt icon)
  * Expenses (money icon)
  * Reports (bar chart icon)
  * Users (admin only)
- Top toolbar with: app title, user name, logout button
- Collapsible sidebar for mobile
- Router outlet for content
```

### Prompt 12: Backend - Dashboard Statistics Service
```
Create DashboardService:
- getTodayAppointments() → count
- getTotalPatients() → count
- getMonthlyRevenue() → BigDecimal
- getPendingInvoices() → count
- getRecentAppointments(limit) → List<Appointment>
- getUpcomingAppointments(limit) → List<Appointment>

Create DashboardController at /api/dashboard:
- GET /stats → return all statistics
- GET /recent-activity → recent appointments, invoices
```

### Prompt 13: Frontend - Dashboard Screen with Cards & Charts
```
Create components/dashboard/dashboard:
- Top row: 4 Material cards showing:
  * Today's Appointments (blue card with number)
  * Total Patients (green card)
  * Monthly Revenue (orange card with currency)
  * Pending Invoices (red card)
- Second row: 2 charts side by side:
  * Pie Chart: Appointments by status (scheduled, completed, cancelled)
  * Bar Chart: Revenue by month (last 6 months)
- Third row: DataTable showing upcoming appointments (next 10)
  Columns: Date, Patient, Doctor, Status
  Actions: View, Edit, Cancel buttons
- Use ng2-charts for Pie and Bar charts
- Refresh data every 30 seconds
```

---

## Phase 3: Patient Management

### Prompt 14: Backend - Patient Entity & Repository
```
Create Patient entity extending BaseEntity:
- firstName, lastName, dateOfBirth, gender (enum: MALE/FEMALE/OTHER)
- phone, email, address, emergencyContact, emergencyPhone
- bloodGroup, allergies (text), notes (text)
- @Entity with indexes on phone and email

Create PatientRepository:
- findByPhone, findByEmail, searchByName (LIKE query)
- findAllActive with pagination
```

### Prompt 15: Backend - Patient Service & Controller
```
Create PatientService:
- create, update, getById, getAll(pageable), softDelete
- searchByName, findByPhone
- Validate phone uniqueness

Create PatientController at /api/patients:
- POST / → create patient
- GET /{id} → get by id
- GET / → list all (with pagination, sorting, search)
- PUT /{id} → update
- DELETE /{id} → soft delete
- GET /search?query=name → search by name
```

### Prompt 16: Frontend - Patient List with DataTable
```
Create components/patients/patient-list:
- Page title: "Patients" with "Add New Patient" button
- Search bar at top (search by name, phone, email)
- DataTable with columns:
  * Photo placeholder
  * Name (firstName + lastName)
  * Phone
  * Email
  * Age (calculated from DOB)
  * Blood Group
  * Actions: View, Edit, Delete icons
- Pagination at bottom (10, 25, 50, 100 per page)
- Sort by name, age, created date
- Click row to view details
- Use angular-datatables library
```

### Prompt 17: Frontend - Add/Edit Patient Form
```
Create components/patients/patient-form:
- Material dialog or full page form
- Fields in 2 columns:
  * Personal: firstName, lastName, DOB (datepicker), gender (dropdown)
  * Contact: phone, email, address (textarea)
  * Emergency: emergencyContact, emergencyPhone
  * Medical: bloodGroup (dropdown), allergies (textarea), notes (textarea)
- All validations (required fields, email format, phone format)
- Save button with loading state
- Cancel button
- Success/error toast messages
```

### Prompt 18: Frontend - Patient Details View
```
Create components/patients/patient-details:
- Material card layout with tabs:
  * Overview tab: All patient info in readable format with icons
  * Appointments tab: DataTable of patient's appointments (past & upcoming)
  * Treatment History tab: List of all treatments received
  * Invoices tab: List of invoices
  * Documents tab: Uploaded files (placeholder for now)
- Action buttons: Edit Patient, Delete Patient, New Appointment
- Back button to patient list
```

---

## Phase 4: Appointment Management

### Prompt 19: Backend - Appointment Entity & Repository
```
Create Appointment entity extending BaseEntity:
- patient (@ManyToOne), doctor (@ManyToOne to User)
- appointmentDate (LocalDateTime), duration (Integer minutes)
- status (enum: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED)
- reason (text), notes (text)
- @Entity with indexes on appointmentDate, status

Create AppointmentRepository:
- findByPatient, findByDoctor
- findByDateBetween, findByStatus
- findUpcoming (date >= now, status not cancelled)
- checkDoctorAvailability(doctorId, date, duration)
```

### Prompt 20: Backend - Appointment Service & Controller
```
Create AppointmentService:
- create (validate doctor availability, working hours 9am-6pm)
- update, getById, getAll, cancel
- checkAvailability(doctorId, date, duration) → boolean
- getAvailableSlots(doctorId, date) → List<TimeSlot>
- Prevent overlapping appointments

Create AppointmentController at /api/appointments:
- POST / → create appointment
- GET / → list all with filters (date, doctor, patient, status)
- GET /{id} → get by id
- PUT /{id} → update
- PUT /{id}/cancel → cancel appointment
- GET /available-slots?doctorId=&date= → get available time slots
```

### Prompt 21: Frontend - Appointment Calendar View
```
Create components/appointments/appointment-calendar:
- Full calendar view (use FullCalendar library or custom)
- Month view with appointments displayed on dates
- Color coding by status: green (confirmed), blue (scheduled), red (cancelled)
- Click date to create new appointment
- Click appointment to view/edit
- Filter by doctor dropdown
- Today button to jump to current date
- Prev/Next month navigation
```

### Prompt 22: Frontend - Appointment List with DataTable
```
Create components/appointments/appointment-list:
- "Appointments" title with "Book Appointment" button
- Filter chips at top: Today, This Week, All, By Status dropdown
- DataTable columns:
  * Date & Time
  * Patient Name (clickable → patient details)
  * Doctor Name
  * Duration
  * Status (colored chip)
  * Actions: View, Edit, Cancel, Complete
- Group by date (Today, Tomorrow, Upcoming)
- Pagination and search
```

### Prompt 23: Frontend - Book/Edit Appointment Dialog
```
Create components/appointments/appointment-form:
- Material dialog with form:
  * Patient (autocomplete search by name/phone)
  * Doctor (dropdown with available doctors)
  * Date (datepicker)
  * Time (dropdown showing available slots based on doctor & date)
  * Duration (dropdown: 15, 30, 45, 60 mins)
  * Reason (textarea)
  * Notes (textarea)
- Show "No slots available" if doctor fully booked
- Validations: all required, date not in past
- Save button
- Real-time slot availability check
```

---

## Phase 5: Treatment Management

### Prompt 24: Backend - Treatment & TreatmentRecord Entities
```
Create Treatment entity:
- name, description, defaultPrice, estimatedDuration, category, active
- Unique index on name

Create TreatmentRecord entity:
- appointment (@ManyToOne), treatment (@ManyToOne), doctor (@ManyToOne)
- actualPrice, quantity (default 1), discount, notes, completedAt
- Calculate totalPrice getter: (actualPrice * quantity) - discount

Create repositories for both with standard CRUD + search methods
```

### Prompt 25: Backend - Treatment Service & Controller
```
Create TreatmentService:
- CRUD operations
- search by name/category
- getActive treatments only

Create TreatmentRecordService:
- create record when treatment performed
- link to appointment
- calculate totals

Controllers at /api/treatments and /api/treatment-records with full CRUD
```

### Prompt 26: Frontend - Treatment Catalog (Cards Grid)
```
Create components/treatments/treatment-catalog:
- Grid layout of Material cards (3-4 per row)
- Each card shows:
  * Treatment icon/image placeholder
  * Treatment name
  * Category badge
  * Default price
  * Duration
  * Description (truncated)
  * Actions: Edit, Delete, View Details
- "Add Treatment" FAB button (floating action button)
- Search bar and category filter chips at top
- Hover effect on cards
```

### Prompt 27: Frontend - Add/Edit Treatment Form
```
Create components/treatments/treatment-form:
- Dialog with fields:
  * Name, Category (dropdown or custom input)
  * Description (textarea)
  * Default Price (number input with currency)
  * Estimated Duration (number with unit "minutes")
  * Active toggle
- Validation: name required, price min 0
- Save button
```

### Prompt 28: Frontend - Treatment Records (within Appointment)
```
Create components/appointments/treatment-records:
- Shown in appointment details view
- Add Treatment button → opens dialog:
  * Treatment (autocomplete from catalog)
  * Quantity (default 1)
  * Actual Price (pre-filled from catalog, editable)
  * Discount
  * Total (calculated automatically)
  * Notes
- List of added treatments with totals
- Remove treatment option
- Grand total at bottom
```

---

## Phase 6: Medicine & Prescription Management

### Prompt 29: Backend - Medicine & Prescription Entities
```
Create Medicine entity:
- name, description, manufacturer
- dosageForm (enum: TABLET, SYRUP, INJECTION, CAPSULE, CREAM)
- strength (e.g., "500mg"), stockQuantity, unitPrice, reorderLevel
- expiryDate, active
- Indexes on name, expiryDate

Create Prescription entity:
- appointment (@ManyToOne), medicine (@ManyToOne)
- dosage, frequency, duration, quantity, instructions
- Index on appointment

Create repositories with stock management methods
```

### Prompt 30: Backend - Medicine Service & Controller
```
Create MedicineService:
- CRUD operations
- reduceStock(medicineId, quantity)
- checkStock(medicineId) → boolean
- getLowStock() → medicines below reorderLevel
- getExpiringSoon(days) → expiring in next N days
- Prevent prescribing if out of stock

Create PrescriptionService:
- create prescription (reduce medicine stock)
- link to appointment
- validate stock availability

Controllers at /api/medicines and /api/prescriptions
```

### Prompt 31: Frontend - Medicine Inventory DataTable
```
Create components/medicines/medicine-list:
- DataTable with columns:
  * Name
  * Manufacturer
  * Dosage Form
  * Strength
  * Stock Quantity (with color: red if low, yellow if near reorder level, green if good)
  * Unit Price
  * Expiry Date (highlight if expiring soon)
  * Actions: Edit, Adjust Stock, Delete
- Alert cards at top:
  * Low Stock Items (red card with count)
  * Expiring Soon (orange card with count)
- "Add Medicine" button
- Search and filter by form, manufacturer
```

### Prompt 32: Frontend - Medicine Form & Stock Adjustment
```
Create components/medicines/medicine-form:
- Dialog for add/edit with all fields
- Dosage form dropdown
- Expiry date picker with warning if date < 6 months

Create components/medicines/stock-adjustment-dialog:
- Current stock display
- Adjustment type: Add or Reduce (radio buttons)
- Quantity (number)
- Reason (textarea)
- New stock calculation preview
- Save adjustment
```

### Prompt 33: Frontend - Prescription Dialog (within Appointment)
```
Create components/appointments/prescription-form:
- Open from appointment details
- Add Prescription button → dialog:
  * Medicine (autocomplete search)
  * Available stock display
  * Dosage (e.g., "1 tablet")
  * Frequency (e.g., "twice daily")
  * Duration (e.g., "7 days")
  * Quantity (number)
  * Instructions (textarea)
- List of added prescriptions
- Print Prescription button
- Remove prescription option
```

---

## Phase 7: Invoice & Payment Management

### Prompt 34: Backend - Invoice Entity & Service
```
Create Invoice entity:
- appointment (@ManyToOne), invoiceNumber (unique, auto-generated)
- issueDate, dueDate, subtotal, discount, tax, total
- status (enum: DRAFT, SENT, PAID, CANCELLED)
- paidAt, notes
- Unique index on invoiceNumber

Create InvoiceService:
- generateInvoiceNumber() → "INV-YYYYMMDD-0001" format
- createFromAppointment(appointmentId) → auto-calculate from treatment records
- markAsPaid(), markAsCancelled()
- calculateTotals() → (subtotal - discount) + tax
- getOverdue() → where dueDate < now and status != PAID

Create InvoiceController at /api/invoices
```

### Prompt 35: Frontend - Invoice List DataTable
```
Create components/invoices/invoice-list:
- DataTable columns:
  * Invoice Number (clickable)
  * Issue Date
  * Patient Name
  * Amount
  * Status (colored chip: green=paid, orange=sent, blue=draft, red=overdue)
  * Due Date
  * Actions: View, Print, Mark as Paid, Send Email, Cancel
- Summary cards at top:
  * Total Revenue This Month
  * Pending Amount
  * Overdue Count
- Filter by status, date range
- Search by invoice number or patient name
```

### Prompt 36: Frontend - Invoice Details & Print View
```
Create components/invoices/invoice-details:
- Professional invoice layout:
  * Clinic logo and info (top)
  * Invoice number, dates
  * Patient details (bill to)
  * Treatment records table: Name, Quantity, Price, Total
  * Medicines table if any
  * Subtotal, Discount, Tax, Grand Total (right aligned)
  * Payment status and method
  * Notes at bottom
- Action buttons: Print, Download PDF, Mark as Paid, Send Email
- Print-friendly CSS (hide buttons when printing)
```

### Prompt 37: Frontend - Generate Invoice Dialog
```
Create components/invoices/generate-invoice-dialog:
- Triggered from completed appointment
- Shows appointment details
- Auto-populated treatment records with totals
- Editable fields:
  * Issue Date (default today)
  * Due Date (default today + 30)
  * Discount (number or percentage)
  * Tax percentage
  * Notes
- Total calculation preview
- Generate Invoice button
- Success → redirect to invoice details
```

---

## Phase 8: Expense Tracking

### Prompt 38: Backend - Expense Entity & Service
```
Create Expense entity:
- expenseDate, category (enum: SALARY, RENT, UTILITIES, SUPPLIES, EQUIPMENT, MAINTENANCE, OTHER)
- amount, description, paidTo, paymentMethod (enum: CASH, CARD, BANK_TRANSFER)
- receiptNumber, notes
- Indexes on expenseDate, category

Create ExpenseService:
- CRUD operations
- getTotalByCategory(startDate, endDate)
- getTotalByDateRange(startDate, endDate)
- getMonthlySummary(year, month)

Create ExpenseController at /api/expenses
```

### Prompt 39: Frontend - Expense List DataTable
```
Create components/expenses/expense-list:
- DataTable columns:
  * Date
  * Category (with colored icon)
  * Description
  * Paid To
  * Payment Method
  * Amount (bold)
  * Actions: View, Edit, Delete
- Summary cards at top:
  * This Month Total (by category with pie chart)
  * Top Expense Category
- "Add Expense" button
- Filters: date range, category, payment method
- Export to CSV button
```

### Prompt 40: Frontend - Add/Edit Expense Form
```
Create components/expenses/expense-form:
- Dialog with fields:
  * Date (datepicker)
  * Category (dropdown with icons)
  * Amount (number with currency)
  * Description (textarea)
  * Paid To (text)
  * Payment Method (dropdown)
  * Receipt Number (optional)
  * Notes (optional)
- Validation: date, category, amount required
- Save button
- Optional: attach receipt image (file upload)
```

---

## Phase 9: Reports & Analytics

### Prompt 41: Backend - Report Service
```
Create ReportService:
- getRevenueReport(startDate, endDate) → by month breakdown
- getAppointmentReport(year, month) → by status, by doctor
- getExpenseReport(startDate, endDate) → by category
- getTopTreatments(limit) → most performed treatments
- getPatientGrowth() → new patients per month (last 12 months)
- getDoctorPerformance() → appointments/revenue by doctor

Create ReportController at /api/reports with all report endpoints
```

### Prompt 42: Frontend - Reports Dashboard
```
Create components/reports/reports-dashboard:
- Date range selector at top (last 7 days, 30 days, 3 months, custom)
- Grid layout with multiple chart cards:
  * Revenue Trend (Line Chart - month by month)
  * Appointments by Status (Pie Chart)
  * Expense Breakdown (Pie Chart by category)
  * Top 5 Treatments (Horizontal Bar Chart)
  * Patient Growth (Line Chart)
  * Doctor Performance (Bar Chart - appointments count)
- Each chart in Material card with title and export button
- Print Report button
- Export to PDF button
```

### Prompt 43: Frontend - Revenue Report Details
```
Create components/reports/revenue-report:
- Date range selector
- Summary cards: Total Revenue, Total Expenses, Net Profit, Growth %
- Bar Chart: Revenue vs Expenses by month
- DataTable: Month-wise breakdown
  Columns: Month, Revenue, Expenses, Profit, Invoices Count
- Downloadable as CSV or PDF
```

### Prompt 44: Frontend - Appointment Analytics
```
Create components/reports/appointment-analytics:
- Date range selector
- Cards: Total Appointments, Completed %, Cancellation Rate, Avg Duration
- Charts:
  * Appointments by Status (Donut Chart)
  * Appointments by Doctor (Bar Chart)
  * Appointments by Day of Week (Column Chart)
  * Peak Hours (Heat Map or Bar Chart)
- DataTable: Doctor-wise stats (appointments, completion rate, revenue)
```

---

## Phase 10: User Management (Admin Only)

### Prompt 45: Frontend - User List DataTable (Admin)
```
Create components/users/user-list:
- Guard: only accessible by ADMIN role
- DataTable columns:
  * Name (firstName + lastName)
  * Email
  * Role (colored badge)
  * Active Status (toggle switch)
  * Created Date
  * Actions: Edit, Deactivate/Activate, Reset Password
- "Add User" button
- Filter by role
- Search by name or email
```

### Prompt 46: Frontend - Add/Edit User Form (Admin)
```
Create components/users/user-form:
- Dialog with fields:
  * Email (required, unique)
  * First Name, Last Name (required)
  * Password (required for new user, optional for edit)
  * Confirm Password
  * Role (dropdown)
  * Active (toggle)
- Validations: email format, password strength, role required
- Save button
- Show success message
```

---

## Phase 11: Final Enhancements

### Prompt 47: Frontend - Profile Page
```
Create components/profile/profile-page:
- Material card with user info
- Tabs:
  * Profile Info: Display and edit name, email
  * Change Password: Old password, new password, confirm
  * Settings: Theme preference, notification preferences
- Update button for each section
- Avatar upload (optional)
```

### Prompt 48: Frontend - Notifications System
```
Create shared/notification.service.ts:
- Show toast messages using Material Snackbar
- Success, error, warning, info types
- Auto-dismiss after 3-5 seconds
- Show in top-right corner
- Queue multiple notifications

Use throughout app for all API responses
```

### Prompt 49: Frontend - Loading Indicators
```
Create loading interceptor:
- Show progress bar at top during HTTP requests
- Show spinner overlay for full-page loading
- Disable buttons during submission
- Skeleton loaders for tables and cards while fetching data
```

### Prompt 50: Frontend - Error Handling & 404 Page
```
Create error interceptor:
- Catch HTTP errors globally
- Show user-friendly messages
- Redirect to login if 401
- Handle 403, 404, 500 errors

Create components/error/not-found:
- 404 page with illustration
- "Go to Dashboard" button

Create components/error/forbidden:
- 403 page for unauthorized access
```

### Prompt 51: Backend - Data Seeder
```
Create DataSeeder at com.dental.config.DataSeeder:
- @Profile("dev") - only in dev mode
- Create:
  * Admin user (admin@dental.com / Admin@123)
  * 2 doctors
  * 1 staff
  * 10 sample patients
  * 15 treatments with prices
  * 10 medicines with stock
  * 5 appointments (past and upcoming)
  * 3 invoices (paid, pending, overdue)
  * Sample expenses
- Log all created data
```

### Prompt 52: Testing - Create Sample Data Generator
```
Add testing endpoints at /api/test (only in dev mode):
- POST /generate-sample-data → create bulk test data
- DELETE /clear-all-data → truncate all tables (except users)
- GET /data-summary → count of all entities

Use for testing UI with realistic data volumes
```

---

## Phase 12: Production Ready (PostgreSQL Migration)

### Prompt 53: Generate Flyway Migration Scripts
```
From H2 Console:
- Run: SCRIPT NODATA
- Save DDL to src/main/resources/db/migration/V1__create_tables.sql
- Adjust for PostgreSQL syntax
- Create V2__add_indexes.sql
- Create V3__insert_seed_data.sql (optional)
```

### Prompt 54: Update Configuration for PostgreSQL
```
In application.yml:
- Change active profile to 'postgres'
- Update datasource URL
- Enable Flyway
- Change hibernate.ddl-auto to 'validate'
- Add PostgreSQL dependencies in pom.xml
- Test migration on fresh PostgreSQL database
```

---

## Quick Reference

**Start Backend:**
```powershell
cd backend
mvn spring-boot:run
```

**Start Frontend:**
```powershell
cd frontend
ng serve
```

**Access:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

**Development Flow:**
1. Work through prompts sequentially
2. Test each feature end-to-end
3. Backend API → Swagger UI → Frontend UI
4. Use sample data for realistic testing

**UI Libraries Used:**
- Angular Material (buttons, forms, dialogs, cards)
- ng2-charts (Pie, Bar, Line charts)
- angular-datatables (DataTables)
- Chart.js (charting backend)

---

**Total Prompts:** 54  
**Order:** Sequential for complete features  
**Test:** After every 2-3 prompts, test the feature end-to-end
