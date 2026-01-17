# Dental Clinic Management System - Backend

Spring Boot 3.5.x backend application for the Dental Clinic Management System.

## Technology Stack

- **Java**: 25
- **Spring Boot**: 3.5.0
- **Database**: H2 In-Memory (for local development)
- **Future Migration**: PostgreSQL 16 (see MIGRATION_TO_POSTGRESQL.md)
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Build Tool**: Maven

## Prerequisites

- JDK 25
- Maven 3.9+
- No database installation required (H2 is embedded)

## Getting Started

### 1. No Database Setup Required!

H2 in-memory database is automatically configured. No installation needed!

### 2. H2 Console Access

After starting the application, access H2 Console at:
- **URL**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:dentaldb`
- **Username**: `sa`
- **Password**: (leave empty)

### 3. Environment Variables

Optional (H2 uses defaults):

```bash
# Server Configuration (optional)
SERVER_PORT=8080

# Active Profile (optional, defaults to 'dev')
SPRING_PROFILES_ACTIVE=dev
```

### 4. Build the Project

```bash
mvn clean install
```

### 5. Run the Application

```bash
mvn spring-boot:run
```

Or with a specific profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 6. Access the Application

- **API Base URL**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console
- **API Docs**: http://localhost:8080/api-docs

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/dental/
│   │   │       ├── config/          # Configuration classes
│   │   │       ├── controller/      # REST controllers (to be added)
│   │   │       ├── service/         # Business logic (to be added)
│   │   │       ├── repository/      # Data access (to be added)
│   │   │       ├── model/           # Domain entities (to be added)
│   │   │       ├── dto/             # Data transfer objects (to be added)
│   │   │       └── ClinicBackendApplication.java
│   │   └── resources/
│   │       ├── db/migration/        # Flyway migration scripts
│   │       ├── application.yml      # Main configuration
│   │       └── application.properties
│   └── test/
│       ├── java/
│       │   └── com/dental/
│       └── resources/
│           └── application-test.yml
└── pom.xml
```

## Configuration Profiles

### Development (`dev`)
- Verbose logging
- SQL logging enabled
- Database: `dental_clinic_dev`
- Auto-configuration for local development

### Production (`prod`)
- Minimal logging
- All sensitive configurations via environment variables
- Enhanced security settings
- Connection pooling optimized

## Dependencies

- `spring-boot-starter-web` - REST API support
- `spring-boot-starter-validation` - Bean validation
- `spring-boot-starter-security` - Security framework
- `spring-boot-starter-data-jpa` - JPA/Hibernate
- `postgresql` - PostgreSQL driver
- `flyway-core` - Database migrations
- `springdoc-openapi-starter-webmvc-ui` - API documentation
- `lombok` - Reduce boilerplate code
- `jackson-datatype-jsr310` - Java 8 date/time support
- `mapstruct` - Object mapping

## Database Migrations

Flyway migrations are located in `src/main/resources/db/migration/`.

Migration file naming convention: `V{version}__{description}.sql`

Example: `V1__create_users_table.sql`

## API Documentation

The API is documented using SpringDoc OpenAPI 3. After starting the application, visit:
- Swagger UI: http://localhost:8080/swagger-ui.html

## Testing

Run tests with:

```bash
mvn test
```

## Building for Production

```bash
mvn clean package -DskipTests
```

The executable JAR will be created in the `target/` directory.

## Running in Production

```bash
java -jar target/clinic-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Make sure all required environment variables are set for the production profile.
