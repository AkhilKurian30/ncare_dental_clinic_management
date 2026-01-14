# Dental Clinic App — End-to-End Build Prompts (Java 25 LTS + Spring Boot 3.5.x + Angular 21, PostgreSQL, Docker Compose)

These **Cursor-friendly prompts** scaffold a full application with:

- **Backend:** Java 25 LTS + **Spring Boot 3.5.x**
- **Frontend:** **Angular 21** with **Angular Material** + **ngx-admin** shell
- **DB:** **PostgreSQL**
- **Infra:** **Docker Compose** (backend, frontend, Postgres, optional pgAdmin)
- **Deployment:** **Cheap VPS** ($4-7/month total cost)
- **Features:** RBAC (Admin, Doctor, Staff, Guest Doctor), Appointments, Patients, Treatments, Medicines, Prescriptions (PDF), Invoices (PDF, cash only), Expenses & Reports (bar/pie charts), Molds Orders, Guest Doctor commissions, CSV/Excel exports, Swagger, audit logging, **clinic branding (name/logo/address)**, file **attachments** (bill photos/PDFs) by date/category.

> **Admin password visibility:** By default passwords should be **hashed (BCrypt)** and not reversible. You requested that Admin can see passwords, so prompts include two paths:
> - **Prompt 5A (Recommended):** Admin can view only the **last temporary password** (encrypted until first login), then cleared.
> - **Prompt 5B (Enabled per request):** Feature‑flagged **reversible encryption** so Admin can view the **current password**. This is risky—log every access.

---

## Deployment Overview for Cheap VPS

This application is designed to run cost-effectively on a cheap VPS. **Estimated monthly cost: $4-7/month total.**

### Recommended VPS Providers (Cheapest)
1. **Hetzner Cloud** — $3.79/month (CAX11: 2vCPU, 4GB RAM, 40GB SSD) — **Best value**
2. **DigitalOcean** — $6/month (Basic Droplet: 1vCPU, 1GB RAM, 25GB SSD)
3. **Vultr** — $5/month (similar specs)
4. **Contabo** — $4.50/month (budget option, mixed reviews)

### Cost Breakdown
- **VPS Hosting:** $3.79-$6/month
- **Domain Name:** $1-12/year ($0.08-$1/month) — Namecheap, Porkbun
- **SSL Certificate:** $0 (Let's Encrypt — free, auto-renewing)
- **Database:** $0 (PostgreSQL on same VPS)
- **Backups:** $0-$1/month (Backblaze B2 10GB free or local backups)
- **Monitoring:** $0 (UptimeRobot free tier, Netdata self-hosted)

**Total: ~$4-7/month** for a fully functional clinic management system!

### What You Get
- Professional domain with HTTPS/SSL
- Automated daily backups
- Uptime monitoring and alerts
- Full Docker-based deployment
- Room to scale as clinic grows

---

## Prompt 1: Create repository layout
```
Create a new monorepo called `clinic-app` with two folders:
- `backend` for Spring Boot (Java 25, Boot 3.5.x)
- `frontend` for Angular 21

Add a root `README.md` describing:
- Stack (Java 25 LTS, Spring Boot 3.5.x, Angular 21, PostgreSQL)
- How to run with Docker Compose

Initialize Git and add a `.gitignore` that covers Java/Maven/Gradle, Node/Angular, Docker.
```

## Prompt 2: Spring Boot skeleton (Java 25, Boot 3.5.x)
```
Inside `backend`, generate a Spring Boot 3.5.x project (Maven) with:

Group: com.dental
Artifact: clinic-backend
Java: 25
Packaging: jar

Dependencies:
- spring-boot-starter-web
- spring-boot-starter-validation
- spring-boot-starter-security
- spring-boot-starter-data-jpa
- flyway-core
- postgresql
- springdoc-openapi-starter-webmvc-ui
- lombok
- jackson-datatype-jsr310
- (optional) mapstruct

Add `src/main/resources/application.yml` with `dev` and `prod` profiles:
- Postgres configs via env vars
- Springdoc UI at `/swagger-ui.html`
- Jackson JavaTimeModule & ISO dates

Create main class `com.dental.ClinicBackendApplication` and ensure the app boots.
```

## Prompt 3: Docker Compose (PostgreSQL + pgAdmin + backend + frontend)
```
At repo root, create `docker-compose.yml` with services:

1) postgres:
   image: postgres:16.11
   env_file: .env
   environment:
     POSTGRES_DB=${POSTGRES_DB}
     POSTGRES_USER=${POSTGRES_USER}
     POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
   ports: ["5432:5432"]
   healthcheck: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} || exit 1"]
   volumes:
     - pgdata:/var/lib/postgresql/data

2) pgadmin (optional):
   image: dpage/pgadmin4:latest
   env_file: .env
   environment:
     PGADMIN_DEFAULT_EMAIL=${PGADMIN_DEFAULT_EMAIL}
     PGADMIN_DEFAULT_PASSWORD=${PGADMIN_DEFAULT_PASSWORD}
   ports: ["5050:80"]
   depends_on: [postgres]

3) backend:
   build: ./backend
   environment:
     SPRING_PROFILES_ACTIVE: dev
     SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
     SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
     SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
   ports: ["8080:8080"]
   depends_on:
     postgres:
       condition: service_healthy

4) frontend:
   build: ./frontend
   ports: ["4200:80"]   # serve via Nginx
   depends_on: [backend]

volumes:
  pgdata:

Create `.env`:
POSTGRES_DB=clinicdb
POSTGRES_USER=clinic_admin
POSTGRES_PASSWORD=changeMeNow
PGADMIN_DEFAULT_EMAIL=admin@local
PGADMIN_DEFAULT_PASSWORD=changeMeNow
```

## Prompt 4: DB schema via Flyway (initial migration)
```
Add Flyway migration `backend/src/main/resources/db/migration/V1__init.sql` with tables:

- users (id, username unique, password_hash, role, full_name, enabled, created_at, updated_at,
         temp_password_encrypted nullable, temp_password_set_at nullable,
         must_change_password boolean default false,
         current_password_encrypted nullable)
- patients (id, first_name, last_name, gender, dob, contact_number, email, address_line, city, state, pincode, notes)
- appointments (id, patient_id, doctor_id, scheduled_at, status [SCHEDULED, COMPLETED, CANCELLED], reason)
- treatments (id, patient_id, doctor_id, appointment_id nullable, description, tooth, notes, date, cost)
- medicines (id, name, brand, dosage_info, stock_qty, unit, notes)
- prescriptions (id, patient_id, doctor_id, appointment_id nullable, issued_date, notes)
- prescription_items (id, prescription_id, medicine_id, dose, frequency, duration_days, instructions)
- invoices (id, patient_id, appointment_id nullable, issue_date, total_amount, paid_cash_amount, notes)
- invoice_items (id, invoice_id, item_type [TREATMENT|MEDICINE], ref_id, description, quantity, unit_price, line_total)
- expenses (id, category [SALARY,WATER,RENT,ELECTRICITY,BROADBAND,MOLDS_ORDER,COMMISSION,MISC], description, amount, expense_date, vendor, notes)
- molds_orders (id, model_name, size, count, order_date, vendor, status, expected_delivery_date, notes)
- commissions (id, guest_doctor_id, patient_id, amount, commission_date, notes)
- guest_access (id, guest_doctor_id, patient_id, granted_at)

# Clinic branding & attachments
- clinic_profile (id singleton=1, clinic_name, logo_url, address_line1, address_line2, city, state, pincode, phone, email, updated_at)
- documents (id, file_name, mime_type, size_bytes, storage_path, category, reference_type [INVOICE|EXPENSE|GENERIC], reference_id nullable, bill_date nullable, notes, uploaded_by, uploaded_at)

FKs:
- appointments.patient_id -> patients.id
- appointments.doctor_id -> users.id
- treatments.patient_id -> patients.id
- treatments.doctor_id -> users.id
- prescriptions.patient_id -> patients.id
- prescriptions.doctor_id -> users.id
- prescription_items.prescription_id -> prescriptions.id
- prescription_items.medicine_id -> medicines.id
- invoices.patient_id -> patients.id
- invoice_items.invoice_id -> invoices.id
- commissions.guest_doctor_id -> users.id (role=GUEST_DOCTOR)
- guest_access.guest_doctor_id -> users.id, guest_access.patient_id -> patients.id
- documents.uploaded_by -> users.id

Seed default ADMIN user:
- username=admin, role=ADMIN, enabled=true, password_hash = bcrypt("Admin@12345").
- Seed clinic_profile row with empty values (id=1).
```

## Prompt 5: Security & JWT (RBAC) — base
```
Implement JWT-based security:

- Roles: ADMIN, DOCTOR, STAFF, GUEST_DOCTOR
- Auth endpoints:
  - POST /api/auth/login -> returns accessToken, refreshToken
  - POST /api/auth/refresh -> returns new access token
- Passwords stored as BCrypt hashes.
- Admin-only user management endpoints:
  - POST /api/admin/users -> create user (role, full_name, enabled, username, password)
  - PUT  /api/admin/users/{id}/reset-password -> set a NEW password
  - PUT  /api/admin/users/{id}/enable or /disable
  - DELETE /api/admin/users/{id} -> remove/soft-delete

Security config:
- Permit `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- Everything else requires JWT
- Method-level `@PreAuthorize` for role enforcement.

Provide `JwtTokenProvider`, `UserDetailsService`, `SecurityConfig`, `AuthController`.
```

## Prompt 5A (Recommended): Admin can see only the **last temporary password**
```
Add columns to `users`: temp_password_encrypted (nullable), temp_password_set_at (timestamp), must_change_password (boolean).

Behavior:
- When Admin creates or resets a user:
  - Generate a temporary password (e.g., 12–16 chars).
  - Store BCrypt(password) in password_hash (for login).
  - Also store an **AES-GCM** encrypted copy of this temp password in `temp_password_encrypted`.
  - Set `must_change_password=true`.

- On first user login + change password:
  - Clear `temp_password_encrypted` and set `must_change_password=false`.

Admin UI:
- “Reveal temp password” visible **only** if `temp_password_encrypted` exists.
- Decrypt on demand (server-side), return once per view; **audit-log** the reveal.

Env vars:
- `APP_MASTER_KEY` (strong key for AES-GCM).
- Add `AuditService` to log who viewed which temp password and when.
```

## Prompt 5B (Enabled & Insecure): Admin can view **current password** (feature‑flag)
```
Per your request, enable flag: `ALLOW_ADMIN_VIEW_PLAINTEXT_PASSWORDS=true`.

Add column: `current_password_encrypted` (nullable).

Flow:
- Continue using BCrypt in `password_hash` for authentication.
- With flag ON:
  - On user create/reset/change, store the **current password** encrypted with AES-GCM in `current_password_encrypted`.
  - Admin endpoint `/api/admin/users/{id}/password/view`:
    - Requires ADMIN.
    - Decrypt and return plaintext.
    - **Audit every access**.

UI warns with danger banner + double-confirm before reveal.
```

## Prompt 6: Backend domain, DTOs, services, controllers
```
Create entities + repositories: User, Patient, Appointment, Treatment, Medicine, Prescription, PrescriptionItem, Invoice, InvoiceItem, Expense, MoldsOrder, Commission, GuestAccess, ClinicProfile, Document.

Controllers:
- PatientsController:
  - STAFF: create/update patient, read **only** contact/address (mask history)
  - DOCTOR/ADMIN: full read (include history tabs via separate endpoints)
- AppointmentsController:
  - STAFF: create/schedule appointments
  - DOCTOR/ADMIN: update status; list by date range
- TreatmentsController:
  - DOCTOR/ADMIN: create/view treatments
  - STAFF: forbidden to read treatment history
- MedicinesController:
  - ADMIN: full CRUD
  - DOCTOR/STAFF: read
- PrescriptionsController:
  - DOCTOR/ADMIN: create; manage items; printable endpoint later
- InvoicesController:
  - DOCTOR/ADMIN: create invoices (cash only, paid_cash_amount); printable endpoint later
- ExpensesController:
  - ADMIN: manage expenses, filters by category/date
- MoldsOrdersController:
  - ADMIN: manage
- CommissionsController:
  - ADMIN: manage; per guest doctor
- GuestAccessController:
  - ADMIN/DOCTOR: grant/revoke patient access to specific Guest Doctors
  - GUEST_DOCTOR: listing scoped to `guest_access`
- ClinicProfileController (ADMIN-only):
  - GET /api/admin/clinic-profile
  - PUT /api/admin/clinic-profile
  - POST /api/admin/clinic-logo (multipart upload)
- DocumentsController (ADMIN-only; optional DOCTOR for clinical docs):
  - POST /api/admin/documents (multipart)
  - GET /api/admin/documents (filter/paging)
  - GET /api/admin/documents/{id}/download
  - DELETE /api/admin/documents/{id}
```

## Prompt 7: Reports & aggregates (income/expenses/charts)
```
Add ReportsService + ReportsController endpoints:

- GET /api/reports/income-expense-summary?from=YYYY-MM-DD&to=YYYY-MM-DD
  -> { totalIncome, totalExpenses, net }

- GET /api/reports/monthly-bars?months=3
  -> { months: [MMM-YYYY...], income: [..], expenses: [..] }

- GET /api/reports/expense-by-category?from&to
  -> [{ category, total }...]

- GET /api/reports/doctor-commissions?from&to
  -> [{ doctorId, doctorName, totalCommission }...]

Use indexes for performance.
```

## Prompt 8: Print/Export PDFs (prescriptions, invoices, treatment summary)
```
Add dependency `com.github.librepdf:openpdf` (or Apache PDFBox).

Create PrintService with:
- generatePrescriptionPdf(prescriptionId)
- generateInvoicePdf(invoiceId)
- generateTreatmentSummaryPdf(patientId, optional from/to)

Branding integration (from clinic_profile):
- Header shows logo (if available), clinic_name, address, phone, email

Controllers:
- GET /api/print/prescription/{id}.pdf
- GET /api/print/invoice/{id}.pdf
- GET /api/print/treatment-summary/{patientId}.pdf

PDF guidance:
- A4, clean margins
- Patient block
- Tables for Rx and Invoice with totals
- Footer with timestamp
```

## Prompt 9: Swagger/OpenAPI + global error handling
```
Enable Springdoc OpenAPI UI at `/swagger-ui.html`.

Add `@ControllerAdvice` to standardize errors:
{ timestamp, status, code, message, details }

Map validation errors and AccessDenied.
```

## Prompt 10: Dev seed data & role tests
```
Flyway `V2__seed_dev_data.sql`:
- Users: admin(Admin@12345), staff1(Staff@12345), doctor1(Doctor@12345), guest1(Guest@12345)
- Sample patients, appointments, treatments, medicines, expenses, molds_orders, commissions
- guest_access rows for guest1
- Seed clinic_profile with demo clinic name/address

Tests:
- STAFF blocked from treatment history
- DOCTOR/ADMIN allowed
- GUEST_DOCTOR limited via guest_access
- Admin updates clinic profile & uploads logo
- Admin uploads/lists documents by date/category
```

## Prompt 11: Angular 21 app scaffold
```
Inside `frontend`, create Angular 21 project:
- Name: clinic-frontend
- Routing: yes
- Styles: SCSS

Add Angular Material:
- `ng add @angular/material`

Add ngx-admin (Nebular) for shell layout:
- Sidebar nav, header with user menu, responsive layout

Add charting & tables:
- `npm i ngx-echarts echarts`
- Use Material `MatTable`, `MatPaginator`, `MatSort`

Routes:
- /dashboard, /patients, /appointments, /treatments, /medicines,
  /prescriptions, /invoices, /expenses, /molds-orders, /commissions,
  /reports, /admin
```

## Prompt 12: Front-end auth (JWT) & guards
```
AuthService:
- login(username, password) -> stores accessToken/refreshToken
- auto-refresh
- logout()

HTTP interceptor:
- Attach Authorization: Bearer <token>
- Handle 401/403 globally

Route guards:
- AuthGuard
- RoleGuard (ADMIN, DOCTOR, STAFF, GUEST_DOCTOR)

Login page:
- Simple form with username/password
- Redirect by role after login
```

## Prompt 13: Patients module (role-aware)
```
PatientsModule components:
- patients-list (MatTable + search + pagination)
- patient-create-edit (reactive form)
- patient-view (tabs)

Role rules (UI):
- STAFF: sees only contact/address; hide medical history tabs
- DOCTOR/ADMIN: show tabs for appointments, treatments, prescriptions

Integrate with /api/patients.
```

## Prompt 14: Appointments module (STAFF workflow)
```
AppointmentsModule:
- List with date filters (today, week, custom range)
- Create/edit dialogs
- Status update (SCHEDULED/COMPLETED/CANCELLED)
- Link patient search (autocomplete)
- STAFF: can create/schedule
- DOCTOR/ADMIN: can update status
```

## Prompt 15: Treatments module (DOCTOR)
```
TreatmentsModule:
- treatment-entry form for DOCTOR/ADMIN
- Patient treatment history tab (visible to DOCTOR/ADMIN)
- STAFF blocked from viewing treatments

Connect to /api/treatments.
```

## Prompt 16: Medicines + Prescriptions (printing)
```
MedicinesModule:
- Inventory table (name/brand/dosage/unit/stock)
- ADMIN: add/edit/delete
- DOCTOR/STAFF: read

PrescriptionsModule:
- Create prescription: select patient; add items (medicine, dose, frequency, duration)
- Print button -> /api/print/prescription/{id}.pdf
- Print-friendly HTML view as fallback
```

## Prompt 17: Invoices (cash only) + PDF
```
InvoicesModule:
- Create invoice from selected treatments/medicines
- Fields: description, qty, unit price, totals; paid_cash_amount
- Print invoice: /api/print/invoice/{id}.pdf

Role:
- DOCTOR/ADMIN: create
- STAFF: read totals and print
```

## Prompt 18: Expenses + Reports dashboard (charts & tables)
```
ExpensesModule:
- Add/edit expenses with categories: SALARY, WATER, RENT, ELECTRICITY, BROADBAND, MOLDS_ORDER, COMMISSION, MISC
- Filters by category/date range
- Export CSV

ReportsModule (Dashboard):
- KPI Cards: Total Income, Total Expenses, Net
- Bar chart: last 3 months income vs expenses (ngx-echarts)
- Pie chart: expense by category
- Tables: recent invoices, expenses

Integrate with /api/reports.
```

## Prompt 19: Molds orders & Guest doctor commissions
```
MoldsOrdersModule:
- List + create/edit
- Fields: model_name, size, count, order_date, vendor, expected_delivery_date, status
- Filters by vendor/date/status

CommissionsModule:
- Manage guest doctor commissions linked to patients
- Summary per guest doctor
- Link to reporting endpoint

Status badges and totals.
```

## Prompt 20: Admin module (user & clinic setup)
```
AdminModule:
- Users page:
  - List, create, enable/disable, reset password
  - "Reveal temp password" (Prompt 5A) if present
  - "Reveal current password" (Prompt 5B) with danger banner + double-confirm
- Medicines management (CRUD)
- Clinic Settings: form for clinic_name, address lines, city/state/pincode, phone, email; logo upload; header preview
- Documents: upload photos/PDFs for bills or special categories; list/filter by date/category/reference; download; delete
- Audit log viewer
```

## Prompt 21: Theming & UX polish
```
Use Angular Material theme with clinic brand colors.
Integrate ngx-admin (Nebular) cards for dashboard feel.
Snackbars for success/error.
Global loading spinner for HTTP.
Responsive SCSS.
```

## Prompt 22: CI scripts & run commands
```
Frontend `package.json` scripts:
- "start": "ng serve"
- "build": "ng build --configuration production"

Backend:
- Maven wrapper and "spring-boot:run"

Docker:
- Multi-stage Dockerfiles (backend & frontend)

`docker compose up --build` runs full stack.
Update README with commands.
```

## Prompt 23: Testing smoke & API collections
```
Backend tests:
- Security tests for role-restricted endpoints
- Reports aggregation tests

Postman (or REST Client) collection:
- Auth, Users, ClinicProfile, Documents, Patients, Appointments, Treatments, Prescriptions, Invoices, Expenses, Reports, Print

Frontend e2e smoke:
- Auth flow
- Guards
- Charts render
- Clinic Settings & Documents uploads
```

## Prompt 24: Performance & pagination
```
Server-side pagination & filtering for large lists.
Add DB indexes:
- appointments(scheduled_at)
- expenses(expense_date, category)
- invoices(issue_date)
- treatments(date)
- prescriptions(issued_date)
- documents(bill_date, category, reference_type)
```

## Prompt 25: Data export (CSV/Excel)
```
Endpoints:
- GET /api/export/patients.csv
- GET /api/export/expenses.csv?from&to
- GET /api/export/invoices.csv?from&to
- GET /api/export/documents.csv?from&to&category

Frontend: export buttons + file-saver.
```

## Prompt 26: Production config & CORS (Enhanced)
```
Create `application-prod.yml` with production-optimized settings:

spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    hikari:
      maximum-pool-size: 5
      minimum-idle: 2
      connection-timeout: 20000
      idle-timeout: 300000
      max-lifetime: 1200000
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: false
        jdbc:
          batch_size: 20
  
  servlet:
    multipart:
      max-file-size: 20MB
      max-request-size: 25MB

server:
  port: 8080
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/xml,text/plain
  error:
    include-message: true
    include-stacktrace: never

logging:
  level:
    root: INFO
    com.dental: INFO
    org.springframework.web: WARN
    org.hibernate: WARN
  file:
    name: /var/log/clinic-app/application.log
    max-size: 10MB
    max-history: 7

security:
  cors:
    allowed-origins: ${ALLOWED_ORIGINS:https://yourdomain.com}
    allowed-methods: GET,POST,PUT,DELETE,OPTIONS
    allowed-headers: "*"
    allow-credentials: true
  jwt:
    expiration: 3600000  # 1 hour
    refresh-expiration: 604800000  # 7 days

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized

Environment variables required:
- SPRING_DATASOURCE_URL
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD
- ALLOWED_ORIGINS
- JWT_SECRET
- APP_MASTER_KEY (for password encryption)
- FILE_STORAGE_ROOT

Compose override for prod if needed.
```

## Prompt 27: Audit & logging
```
`audit_log` table: id, actor_user_id, action, entity_type, entity_id, timestamp, metadata JSON.

Log:
- User create/reset/enable/disable
- Viewing temp/current password
- Invoice/prescription creation and print
- Clinic profile updates and logo uploads
- Document uploads/deletes

AuditController for ADMIN with filters and paging.
```

## Prompt 28: Guest Doctor access scoping
```
Use `guest_access`:
- ADMIN/DOCTOR grant/revoke patient access to a Guest Doctor
- GUEST_DOCTOR queries scoped to guest_access

Frontend:
- Share with Guest Doctor action in patient view
- Guest Doctor sees shared patients only
```

## Prompt 29: Print styling & localization
```
PDF font & layout:
- Roboto/Lato, A4 margins, header with logo/name/address/contact
- Consistent tables and totals

i18n placeholders (English default; Malayalam later if needed).

Print-friendly HTML routes align with PDF.
```

## Prompt 30: Final docs & onboarding
```
README.md:
- Tech stack & versions (Java 25 LTS, Spring Boot 3.5.x, Angular 21, PostgreSQL 16)
- Run: `docker compose up --build`
- URLs: Backend (8080), Swagger, Frontend (4200 or Nginx port)
- Default admin: admin / Admin@12345 (change immediately)
- RBAC summary
- Backups: pg_dump/restore
- Security notes: Prompt 5A recommended; Prompt 5B enabled only per request
- Known limitations & future enhancements
```

## Prompt 31: Backend — Clinic branding API & storage
```
Implement `ClinicProfileService` and `ClinicProfileController` (ADMIN-only):
- GET /api/admin/clinic-profile
- PUT /api/admin/clinic-profile (JSON: clinic_name, address_line1, address_line2, city, state, pincode, phone, email)
- POST /api/admin/clinic-logo (multipart): saves file under `/data/branding/` and updates `logo_url`

Add `FileStorageService`:
- Saves uploads to local disk (e.g., `/data/uploads/`)
- Generates safe unique file names; records paths in `documents` table
- Validates allowed MIME types (image/png, image/jpeg, application/pdf)

Env vars:
- `FILE_STORAGE_ROOT=/data` (mounted volume)
- `MAX_UPLOAD_SIZE_MB=20`
```

## Prompt 32: Backend — Documents (bill photos/PDFs) by date/category
```
Implement `DocumentsController` (ADMIN-only; optionally DOCTOR for clinical docs):
- POST /api/admin/documents (multipart): fields category, reference_type [INVOICE|EXPENSE|GENERIC], reference_id (optional), bill_date (optional), notes
- GET /api/admin/documents?from&to&category&reference_type -> list with paging
- GET /api/admin/documents/{id}/download -> stream file
- DELETE /api/admin/documents/{id}

Validation:
- If reference_type=INVOICE, reference_id must exist in invoices
- If reference_type=EXPENSE, reference_id must exist in expenses

Update `PrintService` to optionally embed a small thumbnail of the logo in headers.
```

## Prompt 33: Frontend — Clinic Settings & Documents modules
```
AdminModule additions:
- ClinicSettingsComponent:
  - Form for clinic_name, address lines, city/state/pincode, phone, email
  - Logo upload (drag-drop, preview); save
  - Preview header block used in PDFs

- DocumentsComponent:
  - Upload dialog (photo/PDF) with fields: category, reference_type, reference_id, bill_date, notes
  - List with filters (date range, category, type), pagination
  - Actions: download, delete

Update dashboard card to show clinic name + small logo.
```

## Prompt 34: Print integration & examples
```
Update PrintService to inject ClinicProfile:
- Header: logo (if available), clinic_name, address, phone, email

Update Invoice PDF:
- Include `paid_cash_amount` and optional note (“See attached bill in Documents section”)

Update Prescription PDF:
- Header branding
- Medicines table with dose/frequency/duration/instructions

Add sample PDFs and confirm formatting with clinic printer.
```

## Prompt 35: Docker Versions & Images — Workflow A (Everything in Docker)
```
For stability and long-term support, set container versions as follows:

PostgreSQL:
- Best choice: postgres:16.11  (stable; supported until Nov 2028)
- Alternatives: postgres:17.7 (supported until Nov 2029), postgres:18.1 (latest; newer, test thoroughly)

Backend (Java):
- Base image: eclipse-temurin:25-jdk  (Java 25 LTS)

Frontend (Angular build):
- Build stage: node:20-alpine  (Node 20 LTS)
- Serve stage: nginx:1.25-alpine

Update docker-compose.yml:
services:
  postgres:
    image: postgres:16.11
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile

Backend Dockerfile (example):
---
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/clinic-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
---

Frontend Dockerfile (example):
---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:1.25-alpine
COPY --from=build /app/dist/clinic-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
---

Notes:
- Use postgres:16.11 for production stability now; upgrade to 17.x later if needed.
- Keep minor versions updated (e.g., 16.11 → 16.12 when released).
```

## Prompt 36: Cost-Optimized VPS Selection & Setup
```
Select and set up a cheap VPS for deployment:

VPS Provider Selection ($3-6/month):
1. **Hetzner Cloud (Recommended)** — https://www.hetzner.com/cloud
   - CAX11 (ARM): €3.79/month ($3.79) — 2vCPU, 4GB RAM, 40GB SSD, 20TB traffic
   - CPX11 (x86): €4.51/month ($4.51) — 2vCPU, 2GB RAM, 40GB SSD
   - Location: Germany or Finland (low latency)
   
2. **DigitalOcean** — https://www.digitalocean.com
   - Basic Droplet: $6/month — 1vCPU, 1GB RAM, 25GB SSD, 1TB transfer
   
3. **Vultr** — https://www.vultr.com
   - Cloud Compute: $5/month — 1vCPU, 1GB RAM, 25GB SSD
   
4. **Contabo** — https://contabo.com
   - VPS S: €4.50/month — 4vCPU, 8GB RAM, 200GB SSD (best value, mixed reviews)

Initial VPS Setup (Ubuntu 22.04 LTS or 24.04 LTS):

1. Create VPS instance with SSH key authentication

2. First login and basic setup:
   ssh root@your-vps-ip
   
   apt update && apt upgrade -y
   hostnamectl set-hostname clinic-app
   
   # Create non-root user
   adduser clinic
   usermod -aG sudo clinic
   
   # Copy SSH keys to new user
   mkdir -p /home/clinic/.ssh
   cp ~/.ssh/authorized_keys /home/clinic/.ssh/
   chown -R clinic:clinic /home/clinic/.ssh
   chmod 700 /home/clinic/.ssh
   chmod 600 /home/clinic/.ssh/authorized_keys

3. Setup firewall (UFW):
   ufw default deny incoming
   ufw default allow outgoing
   ufw allow 22/tcp    # SSH
   ufw allow 80/tcp    # HTTP
   ufw allow 443/tcp   # HTTPS
   ufw enable

4. Install Docker & Docker Compose:
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Add user to docker group
   usermod -aG docker clinic
   
   # Install Docker Compose
   apt install docker-compose-plugin -y
   
   # Verify
   docker --version
   docker compose version

5. Create swap file (important for 1-2GB RAM VPS):
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   
   # Adjust swappiness
   sysctl vm.swappiness=10
   echo 'vm.swappiness=10' >> /etc/sysctl.conf

6. Create application directory:
   mkdir -p /opt/clinic-app
   mkdir -p /opt/clinic-app/data/uploads
   mkdir -p /opt/clinic-app/data/backups
   chown -R clinic:clinic /opt/clinic-app

7. Set timezone:
   timedatectl set-timezone Asia/Kolkata  # or your timezone
   
Now VPS is ready for application deployment.
```

## Prompt 37: Domain & SSL Setup (Free)
```
Set up a domain name and free SSL certificate:

Domain Purchase ($1-12/year):
- **Namecheap** — https://www.namecheap.com
  - .com: $9-13/year
  - .xyz: $1/year (first year promo)
  - .online: $1-2/year (first year)
  
- **Porkbun** — https://porkbun.com
  - .com: $10/year
  - .dev: $12/year
  - Often cheaper than Namecheap

DNS Configuration:
1. In your domain registrar, add DNS A record:
   - Type: A
   - Name: @ (or your-subdomain)
   - Value: YOUR_VPS_IP_ADDRESS
   - TTL: 300 (5 minutes)
   
2. Optional: Add www subdomain:
   - Type: CNAME
   - Name: www
   - Value: yourdomain.com
   - TTL: 300

3. Wait 5-30 minutes for DNS propagation
   - Test: ping yourdomain.com

Install Nginx as Reverse Proxy:
1. Install Nginx:
   apt install nginx -y
   systemctl enable nginx
   systemctl start nginx

2. Install Certbot (Let's Encrypt):
   apt install certbot python3-certbot-nginx -y

3. Create Nginx config for your app:
   nano /etc/nginx/sites-available/clinic-app
   
   ---
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       # Certbot will add SSL config here
       
       location / {
           proxy_pass http://localhost:4200;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       location /api/ {
           proxy_pass http://localhost:8080/api/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           client_max_body_size 25M;
       }
       
       location /swagger-ui/ {
           proxy_pass http://localhost:8080/swagger-ui/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
       }
   }
   ---
   
4. Enable site:
   ln -s /etc/nginx/sites-available/clinic-app /etc/nginx/sites-enabled/
   nginx -t  # Test config
   systemctl reload nginx

5. Obtain SSL certificate (automated):
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   
   # Follow prompts, provide email
   # Certbot will auto-configure HTTPS and redirect HTTP to HTTPS
   
6. Test auto-renewal:
   certbot renew --dry-run
   
   # Certificates auto-renew via systemd timer
   systemctl status certbot.timer

Now your app is accessible via:
- https://yourdomain.com (frontend)
- https://yourdomain.com/api (backend)
- https://yourdomain.com/swagger-ui.html (API docs)
```

## Prompt 38: Production Docker Compose with Nginx & SSL
```
Update docker-compose.yml for production deployment on VPS:

Create `/opt/clinic-app/docker-compose.prod.yml`:
---
version: '3.8'

services:
  postgres:
    image: postgres:16.11
    container_name: clinic-postgres
    restart: unless-stopped
    env_file: .env
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - clinic-network
    # Do NOT expose 5432 to host in production (internal only)

  backend:
    image: clinic-backend:latest
    container_name: clinic-backend
    restart: unless-stopped
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      APP_MASTER_KEY: ${APP_MASTER_KEY}
      FILE_STORAGE_ROOT: /data
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    volumes:
      - app-data:/data
      - app-logs:/var/log/clinic-app
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - clinic-network
    ports:
      - "127.0.0.1:8080:8080"  # Only accessible from localhost
    deploy:
      resources:
        limits:
          memory: 768M
        reservations:
          memory: 512M

  frontend:
    image: clinic-frontend:latest
    container_name: clinic-frontend
    restart: unless-stopped
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    networks:
      - clinic-network
    ports:
      - "127.0.0.1:4200:80"  # Only accessible from localhost
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          memory: 128M

volumes:
  pgdata:
    driver: local
  app-data:
    driver: local
  app-logs:
    driver: local

networks:
  clinic-network:
    driver: bridge
---

Create `.env` file (NEVER commit to git):
---
# Database
POSTGRES_DB=clinicdb
POSTGRES_USER=clinic_admin
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE

# Security
JWT_SECRET=CHANGE_ME_64_CHAR_RANDOM_STRING_HERE
APP_MASTER_KEY=CHANGE_ME_32_CHAR_AES_KEY_HERE

# Application
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FILE_STORAGE_ROOT=/data
---

Generate strong secrets:
# JWT Secret (64 chars)
openssl rand -base64 48

# AES Master Key (32 chars)
openssl rand -hex 16

Add to .gitignore:
---
.env
.env.prod
*.log
/data/
---

Deploy commands:
cd /opt/clinic-app
docker compose -f docker-compose.prod.yml up -d --build

Check status:
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

## Prompt 39: Database Backups & Restore
```
Set up automated PostgreSQL backups:

1. Create backup script `/opt/clinic-app/scripts/backup-db.sh`:
---
#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/opt/clinic-app/data/backups"
CONTAINER_NAME="clinic-postgres"
DB_NAME="clinicdb"
DB_USER="clinic_admin"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/clinic-backup-$(date +%Y%m%d-%H%M%S).sql.gz"

# Perform backup
echo "Starting backup of $DB_NAME..."
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
    
    # Calculate backup size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $SIZE"
else
    echo "Backup failed!"
    exit 1
fi

# Delete old backups (keep last 7 days)
echo "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "clinic-backup-*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# List current backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"
---

2. Make script executable:
   chmod +x /opt/clinic-app/scripts/backup-db.sh

3. Test backup manually:
   /opt/clinic-app/scripts/backup-db.sh

4. Set up daily automatic backup with cron:
   crontab -e -u clinic
   
   # Add this line (runs daily at 2 AM):
   0 2 * * * /opt/clinic-app/scripts/backup-db.sh >> /var/log/clinic-backup.log 2>&1

5. Create restore script `/opt/clinic-app/scripts/restore-db.sh`:
---
#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file.sql.gz>"
    echo "Available backups:"
    ls -lh /opt/clinic-app/data/backups/
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="clinic-postgres"
DB_NAME="clinicdb"
DB_USER="clinic_admin"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will restore database from: $BACKUP_FILE"
echo "All current data will be LOST!"
read -p "Are you sure? (type 'yes' to continue): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Stopping backend container..."
docker compose -f /opt/clinic-app/docker-compose.prod.yml stop backend

echo "Restoring database..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "Restore successful!"
else
    echo "Restore failed!"
    exit 1
fi

echo "Starting backend container..."
docker compose -f /opt/clinic-app/docker-compose.prod.yml start backend

echo "Database restored successfully!"
---

6. Make restore script executable:
   chmod +x /opt/clinic-app/scripts/restore-db.sh

7. Test restore (dry run):
   # Create test backup first
   /opt/clinic-app/scripts/backup-db.sh
   
   # Test restore (be careful!)
   /opt/clinic-app/scripts/restore-db.sh /opt/clinic-app/data/backups/clinic-backup-YYYYMMDD-HHMMSS.sql.gz

8. Optional: Backup to cloud storage (Backblaze B2 - 10GB free):
   # Install rclone
   curl https://rclone.org/install.sh | sudo bash
   
   # Configure B2 (follow prompts)
   rclone config
   
   # Add to backup script to sync to cloud
   rclone copy "$BACKUP_DIR" b2:clinic-backups/

Backup verification checklist:
- [ ] Backup script runs successfully
- [ ] Backups are created in /opt/clinic-app/data/backups
- [ ] Old backups are automatically deleted after 7 days
- [ ] Cron job is set up and running
- [ ] Test restore works correctly
- [ ] Optional cloud sync configured
```

## Prompt 40: Security Hardening for VPS
```
Harden VPS security for production:

1. SSH Security:
   # Edit SSH config
   nano /etc/ssh/sshd_config
   
   # Make these changes:
   PermitRootLogin no
   PasswordAuthentication no
   PubkeyAuthentication yes
   X11Forwarding no
   MaxAuthTries 3
   ClientAliveInterval 300
   ClientAliveCountMax 2
   
   # Restart SSH
   systemctl restart sshd

2. Install and configure Fail2Ban (prevent brute-force):
   apt install fail2ban -y
   
   # Create local config
   nano /etc/fail2ban/jail.local
   ---
   [DEFAULT]
   bantime = 3600
   findtime = 600
   maxretry = 5
   destemail = your-email@example.com
   sendername = Fail2Ban
   action = %(action_mwl)s
   
   [sshd]
   enabled = true
   port = 22
   logpath = /var/log/auth.log
   
   [nginx-http-auth]
   enabled = true
   logpath = /var/log/nginx/error.log
   ---
   
   systemctl enable fail2ban
   systemctl start fail2ban
   
   # Check status
   fail2ban-client status

3. Automatic security updates:
   apt install unattended-upgrades -y
   dpkg-reconfigure -plow unattended-upgrades
   
   # Edit config
   nano /etc/apt/apt.conf.d/50unattended-upgrades
   # Enable security updates

4. Spring Boot security headers (add to SecurityConfig):
   ---
   @Bean
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
       http
           .headers()
               .contentSecurityPolicy("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'")
               .and()
               .xssProtection().and()
               .contentTypeOptions().and()
               .frameOptions().deny()
               .httpStrictTransportSecurity()
                   .maxAgeInSeconds(31536000)
                   .includeSubDomains(true);
       // ... rest of security config
   }
   ---

5. Rate limiting on login endpoint (Spring Boot):
   # Add dependency to pom.xml:
   <dependency>
       <groupId>com.bucket4j</groupId>
       <artifactId>bucket4j-core</artifactId>
       <version>8.10.1</version>
   </dependency>
   
   # Implement rate limiter for /api/auth/login
   # Max 5 attempts per minute per IP

6. Database security:
   - Database NOT exposed to public internet (docker internal network only)
   - Strong password (minimum 20 chars)
   - Regular updates: docker pull postgres:16.11

7. Docker security:
   # Run containers as non-root (add to Dockerfile)
   RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
   USER appuser
   
   # Scan images for vulnerabilities
   docker scan clinic-backend:latest

8. Application secrets:
   - NEVER commit .env to git
   - Use strong random secrets (see Prompt 38)
   - Rotate JWT_SECRET periodically (invalidates all sessions)
   - Rotate APP_MASTER_KEY carefully (requires data migration)

9. Firewall rules review:
   ufw status numbered
   # Should only have: 22 (SSH), 80 (HTTP), 443 (HTTPS)
   # Backend port 8080 should NOT be exposed

10. Regular maintenance checklist:
   - [ ] System updates: apt update && apt upgrade (monthly)
   - [ ] Docker updates: docker compose pull (monthly)
   - [ ] Review fail2ban logs: fail2ban-client status sshd
   - [ ] Check disk space: df -h
   - [ ] Review application logs for errors
   - [ ] Test backups and restore (quarterly)
   - [ ] Review user accounts and disable inactive users
   - [ ] Update dependencies in pom.xml and package.json (quarterly)

11. Emergency access:
   - Keep a backup SSH key in safe location
   - Document VPS provider console access
   - Have disaster recovery plan documented
```

## Prompt 41: Monitoring & Logging (Free Tier)
```
Set up monitoring and logging with free tools:

1. Uptime Monitoring (External - Free):
   
   Option A: UptimeRobot (Recommended)
   - Sign up: https://uptimerobot.com (50 monitors free)
   - Add HTTP(S) monitor: https://yourdomain.com
   - Add keyword monitor: Check for specific text on homepage
   - Configure alerts: email, SMS, Slack
   - Check interval: 5 minutes
   
   Option B: Hetrix Tools
   - Sign up: https://hetrixtools.com (15 monitors free)
   - Similar setup to UptimeRobot
   - Includes basic server monitoring

2. Self-Hosted Monitoring: Netdata (Beautiful & Free)
   # Install Netdata (one-line)
   bash <(curl -Ss https://my-netdata.io/kickstart.sh)
   
   # Configure to only listen on localhost
   nano /etc/netdata/netdata.conf
   # Under [web]:
   bind to = 127.0.0.1
   
   # Access via SSH tunnel or add to Nginx config
   # Add to /etc/nginx/sites-available/clinic-app:
   location /netdata/ {
       proxy_pass http://127.0.0.1:19999/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       
       # Require basic auth
       auth_basic "Monitoring";
       auth_basic_user_file /etc/nginx/.htpasswd;
   }
   
   # Create password file
   apt install apache2-utils -y
   htpasswd -c /etc/nginx/.htpasswd admin
   
   # Reload Nginx
   nginx -t && systemctl reload nginx
   
   # Access: https://yourdomain.com/netdata/
   
   Netdata monitors:
   - CPU, RAM, Disk usage
   - Network traffic
   - Docker containers
   - PostgreSQL queries (if configured)
   - Alerts for disk space, high CPU, etc.

3. Application Logging:
   
   Docker log configuration (add to docker-compose.prod.yml):
   ---
   services:
     backend:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
     frontend:
       logging:
         driver: "json-file"
         options:
           max-size: "5m"
           max-file: "2"
   ---
   
   View logs:
   docker compose -f docker-compose.prod.yml logs -f backend
   docker compose -f docker-compose.prod.yml logs -f frontend --tail=100

4. Error Tracking: Sentry (Free Tier - 5K events/month)
   
   Backend integration:
   # Add to pom.xml:
   <dependency>
       <groupId>io.sentry</groupId>
       <artifactId>sentry-spring-boot-starter</artifactId>
       <version>7.16.0</version>
   </dependency>
   
   # Add to application-prod.yml:
   sentry:
     dsn: ${SENTRY_DSN}
     environment: production
     traces-sample-rate: 0.1
   
   Frontend integration:
   # Install
   npm install --save @sentry/angular
   
   # Configure in main.ts
   import * as Sentry from "@sentry/angular";
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     environment: "production",
     tracesSampleRate: 0.1,
   });
   
   Sign up: https://sentry.io/signup/
   - Create new project for backend (Java/Spring Boot)
   - Create new project for frontend (Angular)
   - Copy DSN to .env and rebuild

5. Log Aggregation (Simple):
   # Create log viewer script
   nano /opt/clinic-app/scripts/view-logs.sh
   ---
   #!/bin/bash
   echo "=== Backend Logs (last 50 lines) ==="
   docker compose -f /opt/clinic-app/docker-compose.prod.yml logs --tail=50 backend
   
   echo -e "\n=== Frontend Logs (last 20 lines) ==="
   docker compose -f /opt/clinic-app/docker-compose.prod.yml logs --tail=20 frontend
   
   echo -e "\n=== PostgreSQL Logs (last 20 lines) ==="
   docker compose -f /opt/clinic-app/docker-compose.prod.yml logs --tail=20 postgres
   
   echo -e "\n=== Nginx Logs (last 20 lines) ==="
   tail -n 20 /var/log/nginx/error.log
   ---
   chmod +x /opt/clinic-app/scripts/view-logs.sh

6. Disk Space Monitoring:
   # Create alert script
   nano /opt/clinic-app/scripts/check-disk.sh
   ---
   #!/bin/bash
   THRESHOLD=80
   CURRENT=$(df / | grep / | awk '{ print $5}' | sed 's/%//g')
   
   if [ "$CURRENT" -gt "$THRESHOLD" ]; then
       echo "WARNING: Disk usage is ${CURRENT}% (threshold: ${THRESHOLD}%)"
       # Send email or alert
       echo "Disk usage critical: ${CURRENT}%" | mail -s "Clinic App Alert" your-email@example.com
   fi
   ---
   
   # Add to cron (check daily)
   crontab -e
   0 8 * * * /opt/clinic-app/scripts/check-disk.sh

7. Health Check Endpoint:
   Spring Boot already provides /actuator/health
   Monitor this endpoint with UptimeRobot:
   - URL: https://yourdomain.com/api/actuator/health
   - Expected response: {"status":"UP"}

8. Monitoring Dashboard Summary:
   - External uptime: UptimeRobot (https://uptimerobot.com)
   - Server metrics: Netdata (https://yourdomain.com/netdata/)
   - Error tracking: Sentry (https://sentry.io)
   - Logs: Docker logs + SSH access
   - Backups: Automated daily at 2 AM
   
All monitoring tools above are FREE for single clinic use!
```

## Prompt 42: Deployment Workflow & CI/CD
```
Set up a simple Git-based deployment workflow:

1. Git Repository Setup:
   # On your VPS
   cd /opt/clinic-app
   git init
   git remote add origin https://github.com/yourusername/clinic-app.git
   
   # Create .gitignore (important!)
   ---
   .env
   .env.*
   *.log
   /data/
   /backend/target/
   /frontend/dist/
   /frontend/node_modules/
   /backend/.mvn/
   ---

2. Simple Deployment Script:
   Create `/opt/clinic-app/deploy.sh`:
   ---
   #!/bin/bash
   set -e
   
   echo "========================================="
   echo "Dental Clinic App - Deployment Script"
   echo "========================================="
   echo ""
   
   # Colors
   GREEN='\033[0;32m'
   YELLOW='\033[1;33m'
   RED='\033[0;31m'
   NC='\033[0m' # No Color
   
   # Configuration
   COMPOSE_FILE="/opt/clinic-app/docker-compose.prod.yml"
   BACKUP_SCRIPT="/opt/clinic-app/scripts/backup-db.sh"
   
   # Step 1: Pre-deployment backup
   echo -e "${YELLOW}Step 1: Creating pre-deployment backup...${NC}"
   if [ -f "$BACKUP_SCRIPT" ]; then
       $BACKUP_SCRIPT
       echo -e "${GREEN}✓ Backup completed${NC}"
   else
       echo -e "${RED}✗ Backup script not found, skipping...${NC}"
   fi
   echo ""
   
   # Step 2: Pull latest code
   echo -e "${YELLOW}Step 2: Pulling latest code from Git...${NC}"
   git fetch origin
   git pull origin main
   echo -e "${GREEN}✓ Code updated${NC}"
   echo ""
   
   # Step 3: Check environment file
   echo -e "${YELLOW}Step 3: Checking environment configuration...${NC}"
   if [ ! -f ".env" ]; then
       echo -e "${RED}✗ Error: .env file not found!${NC}"
       echo "Please create .env file with required variables."
       exit 1
   fi
   echo -e "${GREEN}✓ Environment file found${NC}"
   echo ""
   
   # Step 4: Pull latest Docker images
   echo -e "${YELLOW}Step 4: Pulling Docker images...${NC}"
   docker compose -f "$COMPOSE_FILE" pull postgres
   echo -e "${GREEN}✓ Images updated${NC}"
   echo ""
   
   # Step 5: Build application images
   echo -e "${YELLOW}Step 5: Building application...${NC}"
   docker compose -f "$COMPOSE_FILE" build --no-cache
   echo -e "${GREEN}✓ Build completed${NC}"
   echo ""
   
   # Step 6: Deploy (zero-downtime strategy)
   echo -e "${YELLOW}Step 6: Deploying application...${NC}"
   docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
   echo -e "${GREEN}✓ Deployment completed${NC}"
   echo ""
   
   # Step 7: Health check
   echo -e "${YELLOW}Step 7: Performing health check...${NC}"
   sleep 10  # Wait for services to start
   
   if curl -f -s http://localhost:8080/actuator/health > /dev/null; then
       echo -e "${GREEN}✓ Backend is healthy${NC}"
   else
       echo -e "${RED}✗ Backend health check failed!${NC}"
       echo "Check logs: docker compose -f $COMPOSE_FILE logs backend"
   fi
   
   if curl -f -s http://localhost:4200 > /dev/null; then
       echo -e "${GREEN}✓ Frontend is healthy${NC}"
   else
       echo -e "${RED}✗ Frontend health check failed!${NC}"
       echo "Check logs: docker compose -f $COMPOSE_FILE logs frontend"
   fi
   echo ""
   
   # Step 8: Cleanup
   echo -e "${YELLOW}Step 8: Cleaning up...${NC}"
   docker system prune -f
   echo -e "${GREEN}✓ Cleanup completed${NC}"
   echo ""
   
   echo -e "${GREEN}=========================================${NC}"
   echo -e "${GREEN}Deployment completed successfully!${NC}"
   echo -e "${GREEN}=========================================${NC}"
   echo ""
   echo "Application URLs:"
   echo "  - Frontend: https://yourdomain.com"
   echo "  - Backend API: https://yourdomain.com/api"
   echo "  - Swagger: https://yourdomain.com/swagger-ui.html"
   echo ""
   echo "Useful commands:"
   echo "  - View logs: docker compose -f $COMPOSE_FILE logs -f"
   echo "  - Restart: docker compose -f $COMPOSE_FILE restart"
   echo "  - Stop: docker compose -f $COMPOSE_FILE down"
   ---
   
   chmod +x /opt/clinic-app/deploy.sh

3. Quick rollback script:
   Create `/opt/clinic-app/rollback.sh`:
   ---
   #!/bin/bash
   set -e
   
   echo "Rolling back to previous version..."
   
   # Get previous commit
   PREVIOUS_COMMIT=$(git log --pretty=format:"%h" -n 2 | tail -1)
   
   echo "Rolling back to commit: $PREVIOUS_COMMIT"
   read -p "Continue? (yes/no): " CONFIRM
   
   if [ "$CONFIRM" = "yes" ]; then
       git reset --hard $PREVIOUS_COMMIT
       ./deploy.sh
       echo "Rollback completed!"
   else
       echo "Rollback cancelled."
   fi
   ---
   
   chmod +x /opt/clinic-app/rollback.sh

4. Deployment workflow:
   
   From your local machine:
   # Make changes to code
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   
   On VPS (as clinic user):
   ssh clinic@your-vps-ip
   cd /opt/clinic-app
   ./deploy.sh

5. Optional: GitHub Actions CI (Basic Tests):
   Create `.github/workflows/ci.yml` in your repository:
   ---
   name: CI Tests
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main ]
   
   jobs:
     backend-test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Set up JDK 25
           uses: actions/setup-java@v4
           with:
             java-version: '25'
             distribution: 'temurin'
         
         - name: Build with Maven
           working-directory: ./backend
           run: ./mvnw clean test
     
     frontend-test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Set up Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
         
         - name: Install dependencies
           working-directory: ./frontend
           run: npm ci
         
         - name: Run tests
           working-directory: ./frontend
           run: npm test -- --watch=false --browsers=ChromeHeadless
         
         - name: Build
           working-directory: ./frontend
           run: npm run build -- --configuration production
   ---
   
   This runs tests on every push (free for public repos, 2000 mins/month for private)

6. Deployment checklist:
   Before deploying:
   - [ ] Code changes tested locally
   - [ ] Database migrations reviewed (if any)
   - [ ] .env variables updated (if needed)
   - [ ] Backup completed
   
   After deploying:
   - [ ] Health checks pass
   - [ ] Login works
   - [ ] Test critical features (create patient, appointment, etc.)
   - [ ] Check error logs
   - [ ] Monitor for 15-30 minutes

7. Emergency procedures:
   If deployment fails:
   ./rollback.sh
   
   If database corrupted:
   /opt/clinic-app/scripts/restore-db.sh /opt/clinic-app/data/backups/clinic-backup-latest.sql.gz
   
   If containers won't start:
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml up -d
```

## Prompt 43: Cost Optimization Strategies
```
Optimize costs for running on cheap VPS:

1. VPS Sizing Recommendations:
   
   Minimum viable setup (1 doctor, 20-30 patients/day):
   - RAM: 2GB (4GB recommended)
   - CPU: 1-2 vCPU
   - Storage: 25-40GB SSD
   - Cost: $4-6/month
   
   Comfortable setup (2-3 doctors, 50+ patients/day):
   - RAM: 4GB
   - CPU: 2 vCPU
   - Storage: 40-80GB SSD
   - Cost: $8-12/month
   
   Start small, monitor usage, scale up if needed!

2. PostgreSQL Memory Optimization:
   
   For 1-2GB RAM VPS, tune PostgreSQL:
   Add to docker-compose.prod.yml under postgres service:
   ---
   command: 
     - "postgres"
     - "-c"
     - "max_connections=20"
     - "-c"
     - "shared_buffers=128MB"
     - "-c"
     - "effective_cache_size=256MB"
     - "-c"
     - "maintenance_work_mem=64MB"
     - "-c"
     - "checkpoint_completion_target=0.9"
     - "-c"
     - "wal_buffers=4MB"
     - "-c"
     - "default_statistics_target=100"
     - "-c"
     - "random_page_cost=1.1"
     - "-c"
     - "effective_io_concurrency=200"
     - "-c"
     - "work_mem=6MB"
     - "-c"
     - "min_wal_size=1GB"
     - "-c"
     - "max_wal_size=4GB"
   ---

3. Container Memory Limits:
   Already added in Prompt 38:
   - Backend: 512MB-768MB (sufficient for single clinic)
   - Frontend: 128MB (Nginx is very light)
   - PostgreSQL: No explicit limit (uses what's available)

4. Disk Space Management:
   
   # Monitor disk usage
   df -h
   docker system df
   
   # Clean up regularly (add to monthly cron)
   docker system prune -a -f --volumes
   
   # Rotate logs
   # Already configured in logging settings
   
   # Archive old backups to cloud
   # Keep only last 7 days local, rest on Backblaze B2

5. Network/Bandwidth Optimization:
   
   - Enable Nginx compression (already in Prompt 37)
   - Optimize images before upload (client-side)
   - Lazy load images in Angular
   - Use CDN for static assets (optional, Cloudflare free tier)

6. Free Services Utilized:
   ✓ SSL Certificate: Let's Encrypt (free)
   ✓ Uptime Monitoring: UptimeRobot (free tier)
   ✓ Error Tracking: Sentry (5K events/month free)
   ✓ Backups: Backblaze B2 (10GB free) or local
   ✓ CI/CD: GitHub Actions (2000 mins/month free)
   ✓ Email: Gmail SMTP (free for low volume)

7. Alternative: Even Cheaper (H2 Database):
   If you want ZERO database cost, replace PostgreSQL with H2:
   
   Pros:
   - File-based, no separate container needed
   - ~200MB memory savings
   - Fast for single-user
   
   Cons:
   - Less robust than PostgreSQL
   - No pgAdmin
   - Not ideal for concurrent users
   
   For single clinic with 1-2 concurrent users, H2 is viable.
   Change backend dependency and configuration.

8. Backup Storage Costs:
   
   Local only (FREE):
   - Keep 7 days of backups on VPS (~1-2GB total)
   - Manually download monthly backups to your PC
   
   Cloud (FREE tier):
   - Backblaze B2: 10GB free, then $0.005/GB/month
   - Cloudflare R2: 10GB free, then $0.015/GB/month
   - For typical clinic: ~500MB/month = FREE

9. Domain Cost Reduction:
   - Use .xyz or .online TLD: $1-2/year (first year)
   - Transfer to Cloudflare after purchase: Free DNS + CDN
   - Avoid .com if budget is tight: Save $8-10/year

10. Monitoring Costs:
    Everything mentioned uses FREE tiers:
    - UptimeRobot: 50 monitors (you need 1-2)
    - Netdata: Self-hosted, free
    - Sentry: 5K events/month (more than enough)
    
    No paid monitoring needed for single clinic!

11. Avoid These Costs:
    ✗ Managed databases (DigitalOcean: +$15/month) — Use PostgreSQL in Docker
    ✗ Load balancers — Not needed for single server
    ✗ CDN (except Cloudflare free) — Not critical for clinic app
    ✗ Premium monitoring — Free tier sufficient
    ✗ Paid SSL — Let's Encrypt is free

12. Total Cost Summary:
    
    Monthly:
    - VPS (Hetzner CAX11): $3.79
    - Domain (amortized): $0.50
    - Backups (B2): $0
    - Monitoring: $0
    - SSL: $0
    - Total: ~$4-5/month
    
    Annual:
    - VPS: $45
    - Domain: $6-12
    - Total: ~$55/year
    
    This is EXTREMELY affordable for a professional clinic management system!

13. Scale-Up Path (if clinic grows):
    
    If you need more power later:
    - Hetzner CPX21: €10/month (3vCPU, 4GB RAM) — 2x performance
    - Hetzner CPX31: €17/month (4vCPU, 8GB RAM) — 4x performance
    - Upgrade is just: resize VPS, restart Docker
    
    But start with cheapest and monitor!
```

## Prompt 44: Testing & Pre-Launch Checklist
```
Complete testing and pre-launch checklist before going live:

PHASE 1: Development Testing
- [ ] All backend unit tests pass (mvn test)
- [ ] All frontend unit tests pass (ng test)
- [ ] Integration tests for critical flows pass
- [ ] Swagger API documentation generated correctly
- [ ] All CRUD operations work for each entity
- [ ] File uploads work (logo, documents)
- [ ] PDF generation works (prescriptions, invoices)

PHASE 2: Security Testing
- [ ] Default admin password changed from Admin@12345
- [ ] All user passwords use BCrypt hashing
- [ ] JWT tokens expire correctly (1 hour access, 7 days refresh)
- [ ] Role-based access control (RBAC) enforced:
  - [ ] STAFF cannot view treatment history
  - [ ] GUEST_DOCTOR sees only shared patients
  - [ ] DOCTOR has full clinical access
  - [ ] ADMIN has user management access
- [ ] SQL injection attempts blocked
- [ ] XSS attacks prevented (CSP headers)
- [ ] CORS configured correctly
- [ ] Rate limiting on login endpoint works
- [ ] File upload validation (size, type) works
- [ ] Sensitive data not exposed in logs

PHASE 3: Database & Data Integrity
- [ ] Flyway migrations run successfully
- [ ] All foreign keys properly set
- [ ] Cascade deletes work correctly (or prevented)
- [ ] Test data seeded for development
- [ ] Backup script runs successfully
- [ ] Restore script tested and works
- [ ] Database indexes created for performance
- [ ] No sensitive data in version control

PHASE 4: VPS Setup
- [ ] VPS created and accessible via SSH
- [ ] SSH key authentication working
- [ ] Password authentication disabled
- [ ] Firewall (UFW) configured: only 22, 80, 443 open
- [ ] Fail2Ban installed and running
- [ ] Swap file created (for low RAM VPS)
- [ ] Docker and Docker Compose installed
- [ ] Non-root user (clinic) created with sudo access
- [ ] Automatic security updates enabled

PHASE 5: Domain & SSL
- [ ] Domain purchased and DNS configured
- [ ] DNS A record points to VPS IP
- [ ] Domain resolves correctly (ping test)
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained from Let's Encrypt
- [ ] HTTPS working (no browser warnings)
- [ ] HTTP redirects to HTTPS
- [ ] SSL auto-renewal tested (certbot renew --dry-run)
- [ ] www subdomain works (if configured)

PHASE 6: Application Deployment
- [ ] .env file created with strong secrets
- [ ] JWT_SECRET generated (64 chars random)
- [ ] APP_MASTER_KEY generated (32 chars)
- [ ] Database password strong (20+ chars)
- [ ] docker-compose.prod.yml configured
- [ ] All containers start successfully
- [ ] Backend health check passes (/actuator/health)
- [ ] Frontend accessible via domain
- [ ] API accessible via domain/api
- [ ] Swagger UI accessible (if allowed)
- [ ] Nginx reverse proxy working
- [ ] Static assets served correctly

PHASE 7: Monitoring & Backups
- [ ] UptimeRobot monitor configured
- [ ] Email alerts set up for downtime
- [ ] Netdata installed and accessible
- [ ] Sentry error tracking configured (optional)
- [ ] Daily backup cron job set up (2 AM)
- [ ] Backup script tested manually
- [ ] Backup location has sufficient space
- [ ] Old backups cleaned up automatically (7 days)
- [ ] Cloud backup sync configured (optional)
- [ ] Disk space monitoring script set up

PHASE 8: Functional Testing (Production Environment)
- [ ] Admin can log in with new password
- [ ] Admin can create users (STAFF, DOCTOR, GUEST_DOCTOR)
- [ ] Admin can view temp password for new users
- [ ] Admin can reset user passwords
- [ ] Admin can enable/disable users
- [ ] Admin can update clinic profile (name, address)
- [ ] Admin can upload clinic logo
- [ ] Logo appears in header/PDFs
- [ ] Admin can upload documents (bills, PDFs)
- [ ] Admin can filter and download documents
- [ ] STAFF can create/edit patients (contact info only)
- [ ] STAFF cannot view treatment history
- [ ] STAFF can create appointments
- [ ] DOCTOR can log in
- [ ] DOCTOR can view full patient history
- [ ] DOCTOR can create treatments
- [ ] DOCTOR can create prescriptions
- [ ] DOCTOR can create invoices
- [ ] DOCTOR can grant patient access to Guest Doctor
- [ ] GUEST_DOCTOR can log in
- [ ] GUEST_DOCTOR sees only shared patients
- [ ] GUEST_DOCTOR cannot see other patients
- [ ] Medicine inventory CRUD works
- [ ] Expenses CRUD works
- [ ] Molds orders CRUD works
- [ ] Commissions CRUD works
- [ ] Reports dashboard shows correct data
- [ ] Bar chart (income vs expenses) renders
- [ ] Pie chart (expenses by category) renders
- [ ] CSV export works for patients
- [ ] CSV export works for expenses
- [ ] CSV export works for invoices

PHASE 9: PDF Generation Testing
- [ ] Prescription PDF generates correctly
- [ ] Prescription shows clinic branding
- [ ] Prescription includes patient details
- [ ] Prescription lists all medicines
- [ ] Invoice PDF generates correctly
- [ ] Invoice shows clinic branding
- [ ] Invoice includes patient details
- [ ] Invoice calculates totals correctly
- [ ] Treatment summary PDF works
- [ ] PDFs are print-friendly

PHASE 10: Performance Testing
- [ ] Page load times acceptable (<3 seconds)
- [ ] API response times acceptable (<500ms average)
- [ ] Large lists paginate correctly
- [ ] Search/filter works efficiently
- [ ] File uploads work for files up to 20MB
- [ ] Multiple concurrent users work (test with 3-5 users)
- [ ] No memory leaks (monitor for 24 hours)
- [ ] Database queries optimized (check slow query log)

PHASE 11: Mobile & Browser Testing
- [ ] Works on Chrome (desktop)
- [ ] Works on Firefox (desktop)
- [ ] Works on Safari (desktop, if Mac available)
- [ ] Works on Edge (desktop)
- [ ] Responsive on mobile (Chrome Android)
- [ ] Responsive on mobile (Safari iOS)
- [ ] Touch interactions work on mobile
- [ ] Forms usable on mobile
- [ ] No horizontal scrolling on mobile

PHASE 12: Disaster Recovery Testing
- [ ] Simulate backend crash: docker stop clinic-backend
- [ ] Container auto-restarts (restart: unless-stopped)
- [ ] Simulate database crash: docker stop clinic-postgres
- [ ] Application handles database unavailability gracefully
- [ ] Restore from backup works
- [ ] Deploy script works correctly
- [ ] Rollback script works correctly
- [ ] Can SSH into VPS if all else fails
- [ ] Have VPS provider console access

PHASE 13: Documentation
- [ ] README.md updated with deployment instructions
- [ ] Environment variables documented
- [ ] Architecture diagram created (optional)
- [ ] Admin user guide written (basic)
- [ ] Staff user guide written (basic)
- [ ] Doctor user guide written (basic)
- [ ] Backup/restore procedures documented
- [ ] Emergency contact info documented
- [ ] VPS login credentials stored securely

PHASE 14: Final Pre-Launch
- [ ] Inform clinic staff of launch date
- [ ] Schedule launch during low-traffic time
- [ ] Plan for someone to monitor for first 2 hours
- [ ] Have backup plan ready (rollback)
- [ ] Double-check all passwords changed
- [ ] Remove any test data
- [ ] Verify email notifications work (if implemented)
- [ ] Verify printing works from clinic computer
- [ ] Test with actual clinic printer
- [ ] Get sign-off from clinic owner (your wife!)

PHASE 15: Post-Launch (First Week)
- [ ] Monitor uptime daily
- [ ] Check error logs daily
- [ ] Verify backups running successfully
- [ ] Monitor disk space
- [ ] Check Sentry for errors
- [ ] Get feedback from users
- [ ] Fix any critical bugs immediately
- [ ] Document any issues encountered
- [ ] Verify billing/invoices accurate
- [ ] Ensure reports show correct data

PHASE 16: Monthly Maintenance Checklist
- [ ] Review UptimeRobot history
- [ ] Check disk space usage
- [ ] Review database size
- [ ] Test backup restore (quarterly)
- [ ] Update system packages (apt update && upgrade)
- [ ] Update Docker images (docker compose pull)
- [ ] Review error logs for patterns
- [ ] Check SSL certificate expiry (should auto-renew)
- [ ] Review user accounts (disable inactive)
- [ ] Update dependencies (Java/npm packages)

Launch Readiness Score: ____ / 85 items completed

CRITICAL: Do not launch until ALL items in Phases 1-7 are complete!
Phases 8-14 should be complete before launch.
Phases 15-16 are post-launch ongoing tasks.

Good luck with your launch! 🚀
```

---

## Role Summary (RBAC)
- **STAFF**: add patients (contact/address only), schedule appointments, trigger prints, read medicines; **no clinical history**.
- **DOCTOR (Chief)**: full clinical access (treatments, prescriptions), create invoices, share patients with Guest Doctors.
- **ADMIN**: manage users (create/reset/enable/disable), **view temp password**; **view current password** (feature‑flag enabled per request), manage medicines, expenses, reports, molds orders, commissions, **clinic branding**, **documents**.
- **GUEST DOCTOR**: sees only patients shared via `guest_access`.

## Quick Start

### Development (Local):
```
# Build & run everything
docker compose up --build

# Open
Frontend: http://localhost:4200
Backend:  http://localhost:8080
Swagger:  http://localhost:8080/swagger-ui.html

# Default admin (change immediately)
admin / Admin@12345
```

### Production (VPS Deployment):
```
Follow these prompts in order:
1. Prompt 36: Set up VPS (Hetzner/DigitalOcean)
2. Prompt 37: Configure domain and SSL certificate
3. Prompt 38: Deploy with production Docker Compose
4. Prompt 39: Set up automated backups
5. Prompt 40: Harden security
6. Prompt 41: Configure monitoring
7. Prompt 44: Complete pre-launch checklist

Total setup time: 2-4 hours
Monthly cost: $4-7 (VPS + domain)

# Deploy command (after setup)
cd /opt/clinic-app
./deploy.sh
```
