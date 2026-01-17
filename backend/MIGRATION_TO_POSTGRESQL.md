# Migration Guide: H2 to PostgreSQL

## Current Setup
- **Database**: H2 In-Memory (for local development)
- **Profile**: `dev` (default)
- **H2 Console**: http://localhost:8080/h2-console

## When to Migrate
Migrate to PostgreSQL when:
- ✅ All entities and repositories are implemented
- ✅ All business logic is tested locally
- ✅ Application is stable and working with H2
- ✅ Ready for production deployment

## Migration Steps

### Step 1: Install PostgreSQL
```powershell
# Using Chocolatey
choco install postgresql16

# Or download from https://www.postgresql.org/download/
```

### Step 2: Create Database
```sql
-- Connect to PostgreSQL (default user: postgres)
CREATE DATABASE dental_clinic_dev;
CREATE DATABASE dental_clinic_test;

-- Create application user (optional but recommended)
CREATE USER clinic_admin WITH PASSWORD 'changeMeNow';
GRANT ALL PRIVILEGES ON DATABASE dental_clinic_dev TO clinic_admin;
GRANT ALL PRIVILEGES ON DATABASE dental_clinic_test TO clinic_admin;
```

### Step 3: Update pom.xml
Uncomment PostgreSQL dependencies in `backend/pom.xml`:

```xml
<!-- Uncomment these dependencies -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

### Step 4: Change Spring Profile
Update application to use `postgres` profile:

**Option A: Environment Variable**
```powershell
$env:SPRING_PROFILES_ACTIVE="postgres"
mvn spring-boot:run
```

**Option B: application.yml**
```yaml
spring:
  profiles:
    active: postgres  # Change from 'dev' to 'postgres'
```

**Option C: Command Line**
```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

### Step 5: Create Flyway Migrations
Create migration files in `src/main/resources/db/migration/`:

**V1__create_tables.sql**
```sql
-- Copy the SQL DDL from H2 Console
-- Tables will be auto-created based on your JPA entities
-- Example:
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE patients (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    -- ... other fields
);

-- Add more tables as needed
```

**V2__add_indexes.sql**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_phone ON patients(phone);
-- Add more indexes for performance
```

### Step 6: Export Data from H2 (Optional)
If you have test data in H2:

```sql
-- In H2 Console
SCRIPT TO 'data_export.sql';
```

Then modify the SQL to be PostgreSQL-compatible and run it.

### Step 7: Test the Migration
```powershell
# Clean rebuild
mvn clean install

# Run with PostgreSQL profile
mvn spring-boot:run -Dspring-boot.run.profiles=postgres

# Verify
# - Check logs for successful connection
# - Visit http://localhost:8080/swagger-ui.html
# - Test all endpoints
```

### Step 8: Update application.yml (Optional)
After successful migration, you can:
1. Remove the H2 dependency from pom.xml
2. Delete the `dev` profile from application.yml
3. Set `postgres` as the default active profile

## Troubleshooting

### Issue: Connection Refused
```
Solution: Ensure PostgreSQL service is running
Windows: Services → PostgreSQL → Start
```

### Issue: Authentication Failed
```
Solution: Check username/password in application.yml
Or set environment variables:
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
```

### Issue: Database Does Not Exist
```sql
Solution: Create the database manually:
psql -U postgres
CREATE DATABASE dental_clinic_dev;
```

### Issue: Flyway Validation Failed
```
Solution: If tables already exist, baseline Flyway:
flyway:
  baseline-on-migrate: true
```

## Configuration Comparison

| Feature | H2 (Dev) | PostgreSQL (Production) |
|---------|----------|------------------------|
| **Type** | In-memory | Persistent |
| **Data Loss** | On restart | Never |
| **Performance** | Fast (memory) | Good (disk) |
| **Setup** | None required | Install PostgreSQL |
| **Console** | http://localhost:8080/h2-console | pgAdmin |
| **DDL Mode** | create-drop | validate |
| **Flyway** | Disabled | Enabled |

## Environment Variables

### H2 (Current)
```powershell
# No environment variables needed
SPRING_PROFILES_ACTIVE=dev
```

### PostgreSQL (Migration)
```powershell
SPRING_PROFILES_ACTIVE=postgres
DB_URL=jdbc:postgresql://localhost:5432/dental_clinic_dev
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

## Testing Both Databases

You can keep both configurations and switch profiles:

```powershell
# Test with H2
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Test with PostgreSQL
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

## Rollback Plan

If migration fails:
1. Stop the application
2. Change profile back to `dev` (H2)
3. Restart: `mvn spring-boot:run`
4. All test data will be recreated in H2

## Next Steps After Migration

1. ✅ Set up database backups
2. ✅ Configure connection pooling (already configured)
3. ✅ Add database monitoring
4. ✅ Create database indexes for performance
5. ✅ Set up automated migrations in CI/CD

---

**Note**: Keep this file for future reference when you're ready to migrate to PostgreSQL.
