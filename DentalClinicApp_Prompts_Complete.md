# Dental Clinic App — End-to-End Build Prompts (Java 25 LTS + Spring Boot 3.5.x + Angular 21, PostgreSQL, Docker Compose)

These **Cursor-friendly prompts** scaffold a full application with:

- **Backend:** Java 25 LTS + **Spring Boot 3.5.x**
- **Frontend:** **Angular 21** with **Angular Material** + **ngx-admin** shell
- **DB:** **PostgreSQL**
- **Infra:** **Docker Compose** (backend, frontend, Postgres, optional pgAdmin)
- **Features:** RBAC (Admin, Doctor, Staff, Guest Doctor), Appointments, Patients, Treatments, Medicines, Prescriptions (PDF), Invoices (PDF, cash only), Expenses & Reports (bar/pie charts), Molds Orders, Guest Doctor commissions, CSV/Excel exports, Swagger, audit logging, **clinic branding (name/logo/address)**, file **attachments** (bill photos/PDFs) by date/category.

> **Admin password visibility:** By default passwords should be **hashed (BCrypt)** and not reversible. You requested that Admin can see passwords, so prompts include two paths:
> - **Prompt 5A (Recommended):** Admin can view only the **last temporary password** (encrypted until first login), then cleared.
> - **Prompt 5B (Enabled per request):** Feature‑flagged **reversible encryption** so Admin can view the **current password**. This is risky—log every access.

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

## Prompt 26: Production config & CORS
```
`application-prod.yml`:
- DB creds via env
- Logging at INFO
- CORS: allow frontend origin

Compose override if needed.
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

---

## Role Summary (RBAC)
- **STAFF**: add patients (contact/address only), schedule appointments, trigger prints, read medicines; **no clinical history**.
- **DOCTOR (Chief)**: full clinical access (treatments, prescriptions), create invoices, share patients with Guest Doctors.
- **ADMIN**: manage users (create/reset/enable/disable), **view temp password**; **view current password** (feature‑flag enabled per request), manage medicines, expenses, reports, molds orders, commissions, **clinic branding**, **documents**.
- **GUEST DOCTOR**: sees only patients shared via `guest_access`.

## Quick Start
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
