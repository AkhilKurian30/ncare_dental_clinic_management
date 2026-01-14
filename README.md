# Dental Clinic Management System

A modern dental clinic management system built with a monorepo architecture.

## Tech Stack

- **Backend**: Java 25 LTS with Spring Boot 3.5.x
- **Frontend**: Angular 21
- **Database**: PostgreSQL 17
- **Containerization**: Docker & Docker Compose

## Project Structure

```
.
├── backend/          # Spring Boot REST API
├── frontend/         # Angular web application
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Prerequisites

- Docker Desktop (latest version)
- Docker Compose V2
- Java 25 (for local development)
- Node.js 20+ (for local development)
- Maven or Gradle (for backend)
- Angular CLI (for frontend)

## Quick Start with Docker Compose

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ncare_dental_clinic_management
```

### 2. Run with Docker Compose

Start all services (backend, frontend, and PostgreSQL):

```bash
docker-compose up -d
```

### 3. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **PostgreSQL**: localhost:5432 (username: `postgres`, password: `postgres`)

### 4. Stop All Services

```bash
docker-compose down
```

To stop and remove volumes (including database data):

```bash
docker-compose down -v
```

## Local Development

### Backend Development

```bash
cd backend
./mvnw spring-boot:run
# or with Gradle:
# ./gradlew bootRun
```

The backend API will be available at http://localhost:8080

### Frontend Development

```bash
cd frontend
npm install
npm start
```

The frontend will be available at http://localhost:4200

### Database Access

Connect to PostgreSQL locally:

```bash
docker-compose up -d postgres
```

Connection details:
- Host: localhost
- Port: 5432
- Database: clinic_db
- Username: postgres
- Password: postgres

## Environment Configuration

### Backend Configuration

Create `backend/src/main/resources/application-dev.properties` for local development:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/clinic_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### Frontend Configuration

Create `frontend/src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## Docker Images

The project includes Dockerfiles for:
- Backend: Multi-stage build with Maven/Gradle
- Frontend: Multi-stage build with Node.js and nginx

## API Documentation

Once the backend is running, access the API documentation at:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI Spec: http://localhost:8080/v3/api-docs

## Testing

### Backend Tests

```bash
cd backend
./mvnw test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Building for Production

### Build All Services

```bash
docker-compose build
```

### Build Individual Services

```bash
# Backend
docker build -t clinic-backend ./backend

# Frontend
docker build -t clinic-frontend ./frontend
```

## Troubleshooting

### Port Conflicts

If ports 4200, 8080, or 5432 are already in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Clear Everything and Start Fresh

```bash
docker-compose down -v
docker-compose up -d --build
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions, please open an issue in the repository.
