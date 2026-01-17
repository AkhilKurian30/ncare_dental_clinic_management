# Setup Guide - Dental Clinic Backend

## Prerequisites Installation

### 1. Install Java 25

Download and install from:
- **Oracle JDK**: https://www.oracle.com/java/technologies/downloads/
- **OpenJDK**: https://jdk.java.net/25/

Add Java to your PATH:
```powershell
# Verify installation (should show version 25.x.x)
java -version
```

### 2. Install Apache Maven

**Option A: Using Chocolatey (Recommended for Windows)**
```powershell
choco install maven
```

**Option B: Manual Installation**
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to `C:\Program Files\Apache\maven`
3. Add to PATH:
   - System Properties → Environment Variables
   - Add `C:\Program Files\Apache\maven\bin` to PATH
4. Verify:
```powershell
mvn --version
```

### 3. No Database Installation Required!

This project uses **H2 in-memory database** for local development:
- ✅ **No installation needed** - H2 is embedded in the application
- ✅ **Auto-configured** - Works out of the box
- ✅ **H2 Console** - Web UI at http://localhost:8080/h2-console
- ✅ **Perfect for testing** - Data resets on restart

**Future Migration to PostgreSQL:**
When you're ready for production, see `MIGRATION_TO_POSTGRESQL.md` for migration guide.

## Running the Application

### 1. Quick Start (No Database Setup!)

Just run the application - H2 database starts automatically!

### 2. Build the Project

```powershell
cd e:\GitHub\ncare_dental_clinic_management\backend
mvn clean install
```

### 3. Run the Application

```powershell
# Using Maven
mvn spring-boot:run

# Or run the JAR directly
java -jar target/clinic-backend-0.0.1-SNAPSHOT.jar
```

### 4. Verify the Application

Open your browser:
- **Health Check**: http://localhost:8080/api/health
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console

### 5. H2 Console Login
- **JDBC URL**: `jdbc:h2:mem:dentaldb`
- **Username**: `sa`
- **Password**: (leave empty)

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the backend directory or set system environment variables:

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/dental_clinic_dev
DB_USERNAME=postgres
DB_PASSWORD=your_password_here

# Server
SERVER_PORT=8080

# Profile
SPRING_PROFILE=dev
```

### Default Values

If you don't set environment variables, the application will use these defaults:
- Database URL: `jdbc:postgresql://localhost:5432/dental_clinic_dev`
- Username: `postgres`
- Password: `postgres`
- Port: `8080`
- Profile: `dev`

## Troubleshooting

### Issue: "java: invalid target release: 25"

**Solution**: Ensure you have JDK 25 installed:
1. Verify Java version: `java -version`
2. If you have a different version, download JDK 25 from https://jdk.java.net/25/
3. Update JAVA_HOME environment variable to point to JDK 25
4. Restart your IDE/terminal

### Issue: H2 Console not accessible

**Solution**:
1. Verify application is running: check http://localhost:8080/api/health
2. Access H2 Console: http://localhost:8080/h2-console
3. Use JDBC URL: `jdbc:h2:mem:dentaldb`
4. Username: `sa`, Password: (empty)

### Issue: Port 8080 already in use

**Solution**: Change the port by setting environment variable:
```powershell
$env:SERVER_PORT=8081
mvn spring-boot:run
```

## IDE Setup

### IntelliJ IDEA
1. Open `backend` folder
2. Wait for Maven dependencies to download
3. Enable annotation processing: Settings → Build → Compiler → Annotation Processors
4. Run `ClinicBackendApplication`

### Visual Studio Code
1. Install extensions:
   - Extension Pack for Java
   - Spring Boot Extension Pack
2. Open `backend` folder
3. Press F5 to run

### Eclipse
1. Import → Existing Maven Project
2. Select `backend` folder
3. Right-click project → Run As → Spring Boot App

## Next Steps

After successful setup:
1. Database schema will be managed by Flyway migrations
2. Add migration files to `src/main/resources/db/migration/`
3. Start implementing domain models, repositories, services, and controllers
4. All API endpoints will be automatically documented in Swagger UI

## Quick Start Commands

```powershell
# Build
mvn clean install

# Run
mvn spring-boot:run

# Run tests
mvn test

# Package for production
mvn clean package -DskipTests

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```
