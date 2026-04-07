# System Architecture

<cite>
**Referenced Files in This Document**
- [backend/main.py](file://backend/main.py)
- [backend/auth.py](file://backend/auth.py)
- [backend/models.py](file://backend/models.py)
- [backend/schemas.py](file://backend/schemas.py)
- [backend/database.py](file://backend/database.py)
- [backend/routers/patient.py](file://backend/routers/patient.py)
- [backend/routers/doctor.py](file://backend/routers/doctor.py)
- [backend/routers/appointment.py](file://backend/routers/appointment.py)
- [backend/routers/notification.py](file://backend/routers/notification.py)
- [backend/routers/prescription.py](file://backend/routers/prescription.py)
- [backend/routers/ai.py](file://backend/routers/ai.py)
- [frontend/src/App.jsx](file://frontend/src/App.jsx)
- [frontend/src/services/api.js](file://frontend/src/services/api.js)
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx)
- [frontend/src/pages/PatientDashboard.jsx](file://frontend/src/pages/PatientDashboard.jsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Security Architecture](#security-architecture)
9. [Scalability Considerations](#scalability-considerations)
10. [Deployment Topology](#deployment-topology)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Conclusion](#conclusion)

## Introduction
This document describes the SmartHealthCare system architecture. It covers the frontend React Single Page Application (SPA), the backend FastAPI server, and the database layer. It explains the clean architecture approach with clear separation between presentation, business logic, and data access layers. It documents the authentication architecture using JWT tokens and role-based access control, the modular router-based API design, and component communication patterns. It also addresses scalability, security, and deployment topology.

## Project Structure
SmartHealthCare is organized into two main parts:
- Frontend: A React SPA with routing and service abstractions for API communication.
- Backend: A FastAPI application with modular routers grouped by domain resources, SQLAlchemy ORM models, Pydantic schemas, and a database configuration.

```mermaid
graph TB
subgraph "Frontend (React SPA)"
FE_App["frontend/src/App.jsx"]
FE_Login["frontend/src/pages/Login.jsx"]
FE_Dashboard["frontend/src/pages/PatientDashboard.jsx"]
FE_API["frontend/src/services/api.js"]
end
subgraph "Backend (FastAPI)"
BE_Main["backend/main.py"]
BE_Auth["backend/auth.py"]
BE_DB["backend/database.py"]
BE_Models["backend/models.py"]
BE_Schemas["backend/schemas.py"]
BE_Router_Patient["backend/routers/patient.py"]
BE_Router_Doctor["backend/routers/doctor.py"]
BE_Router_Appointment["backend/routers/appointment.py"]
BE_Router_Notification["backend/routers/notification.py"]
BE_Router_Prescription["backend/routers/prescription.py"]
BE_Router_AI["backend/routers/ai.py"]
end
FE_App --> FE_API
FE_Login --> FE_API
FE_Dashboard --> FE_API
FE_API --> BE_Main
BE_Main --> BE_Auth
BE_Main --> BE_Router_Patient
BE_Main --> BE_Router_Doctor
BE_Main --> BE_Router_Appointment
BE_Main --> BE_Router_Notification
BE_Main --> BE_Router_Prescription
BE_Main --> BE_Router_AI
BE_Auth --> BE_DB
BE_Router_Patient --> BE_DB
BE_Router_Doctor --> BE_DB
BE_Router_Appointment --> BE_DB
BE_Router_Notification --> BE_DB
BE_Router_Prescription --> BE_DB
BE_Router_AI --> BE_DB
BE_DB --> BE_Models
BE_DB --> BE_Schemas
```

**Diagram sources**
- [backend/main.py](file://backend/main.py#L1-L61)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/schemas.py](file://backend/schemas.py#L1-L236)
- [backend/routers/patient.py](file://backend/routers/patient.py#L1-L107)
- [backend/routers/doctor.py](file://backend/routers/doctor.py#L1-L120)
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L1-L129)
- [backend/routers/notification.py](file://backend/routers/notification.py#L1-L177)
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L1-L145)
- [backend/routers/ai.py](file://backend/routers/ai.py#L1-L90)
- [frontend/src/App.jsx](file://frontend/src/App.jsx#L1-L28)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104)
- [frontend/src/pages/PatientDashboard.jsx](file://frontend/src/pages/PatientDashboard.jsx#L1-L674)

**Section sources**
- [backend/main.py](file://backend/main.py#L1-L61)
- [frontend/src/App.jsx](file://frontend/src/App.jsx#L1-L28)

## Core Components
- Frontend SPA
  - Routing via React Router DOM with protected routes and navigation.
  - API client built on Axios with automatic bearer token injection from local storage.
  - Pages for authentication and dashboards, integrating with backend APIs.
- Backend API
  - FastAPI application with CORS enabled for development.
  - Modular routers per resource domain (patient, doctor, appointment, notification, prescription, AI).
  - Authentication module implementing JWT-based login and user retrieval.
  - SQLAlchemy ORM models and Pydantic schemas for data representation.
  - Centralized database configuration supporting SQLite for development and PostgreSQL for production.

Key implementation references:
- Backend entrypoint and router registration: [backend/main.py](file://backend/main.py#L1-L61)
- Authentication and JWT utilities: [backend/auth.py](file://backend/auth.py#L1-L120)
- Data models: [backend/models.py](file://backend/models.py#L1-L110)
- Pydantic schemas: [backend/schemas.py](file://backend/schemas.py#L1-L236)
- Database configuration: [backend/database.py](file://backend/database.py#L1-L22)
- Router modules: [backend/routers/patient.py](file://backend/routers/patient.py#L1-L107), [backend/routers/doctor.py](file://backend/routers/doctor.py#L1-L120), [backend/routers/appointment.py](file://backend/routers/appointment.py#L1-L129), [backend/routers/notification.py](file://backend/routers/notification.py#L1-L177), [backend/routers/prescription.py](file://backend/routers/prescription.py#L1-L145), [backend/routers/ai.py](file://backend/routers/ai.py#L1-L90)
- Frontend routing and API client: [frontend/src/App.jsx](file://frontend/src/App.jsx#L1-L28), [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25), [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104), [frontend/src/pages/PatientDashboard.jsx](file://frontend/src/pages/PatientDashboard.jsx#L1-L674)

**Section sources**
- [backend/main.py](file://backend/main.py#L1-L61)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/schemas.py](file://backend/schemas.py#L1-L236)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/routers/patient.py](file://backend/routers/patient.py#L1-L107)
- [backend/routers/doctor.py](file://backend/routers/doctor.py#L1-L120)
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L1-L129)
- [backend/routers/notification.py](file://backend/routers/notification.py#L1-L177)
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L1-L145)
- [backend/routers/ai.py](file://backend/routers/ai.py#L1-L90)
- [frontend/src/App.jsx](file://frontend/src/App.jsx#L1-L28)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104)
- [frontend/src/pages/PatientDashboard.jsx](file://frontend/src/pages/PatientDashboard.jsx#L1-L674)

## Architecture Overview
SmartHealthCare follows a clean architecture approach:
- Presentation Layer (Frontend): React SPA handles UI, routing, and user interactions.
- Application Layer (Backend): FastAPI routers orchestrate requests, enforce authorization, and coordinate business actions.
- Domain and Data Access Layers (Backend): SQLAlchemy models define domain entities; Pydantic schemas define request/response contracts; database configuration abstracts persistence.

```mermaid
graph TB
subgraph "Presentation Layer"
UI_Login["Login.jsx"]
UI_Dashboard["PatientDashboard.jsx"]
UI_Router["App.jsx"]
API_Client["services/api.js"]
end
subgraph "Application Layer"
R_Patient["routers/patient.py"]
R_Doctor["routers/doctor.py"]
R_Appointment["routers/appointment.py"]
R_Notification["routers/notification.py"]
R_Prescription["routers/prescription.py"]
R_AI["routers/ai.py"]
Auth["auth.py"]
end
subgraph "Domain/Data Access"
Models["models.py"]
Schemas["schemas.py"]
DB["database.py"]
end
UI_Router --> UI_Login
UI_Router --> UI_Dashboard
UI_Login --> API_Client
UI_Dashboard --> API_Client
API_Client --> R_Patient
API_Client --> R_Doctor
API_Client --> R_Appointment
API_Client --> R_Notification
API_Client --> R_Prescription
API_Client --> R_AI
API_Client --> Auth
R_Patient --> DB
R_Doctor --> DB
R_Appointment --> DB
R_Notification --> DB
R_Prescription --> DB
R_AI --> DB
DB --> Models
DB --> Schemas
```

**Diagram sources**
- [frontend/src/App.jsx](file://frontend/src/App.jsx#L1-L28)
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104)
- [frontend/src/pages/PatientDashboard.jsx](file://frontend/src/pages/PatientDashboard.jsx#L1-L674)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [backend/routers/patient.py](file://backend/routers/patient.py#L1-L107)
- [backend/routers/doctor.py](file://backend/routers/doctor.py#L1-L120)
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L1-L129)
- [backend/routers/notification.py](file://backend/routers/notification.py#L1-L177)
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L1-L145)
- [backend/routers/ai.py](file://backend/routers/ai.py#L1-L90)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/schemas.py](file://backend/schemas.py#L1-L236)
- [backend/database.py](file://backend/database.py#L1-L22)

## Detailed Component Analysis

### Authentication and Authorization
- JWT-based login generates access tokens with an expiration and includes the user role.
- The OAuth2 password flow is used for token acquisition.
- A dependency retrieves the current user from the JWT token and validates against the database.
- Role checks are enforced in routers to restrict access to endpoints.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Frontend as "Login.jsx"
participant API as "services/api.js"
participant AuthRouter as "auth.py"
participant DB as "database.py"
Browser->>Frontend : Submit credentials
Frontend->>API : POST "/auth/token" (x-www-form-urlencoded)
API->>AuthRouter : /auth/token
AuthRouter->>DB : Query user by email
DB-->>AuthRouter : User record
AuthRouter->>AuthRouter : Verify password hash
AuthRouter-->>API : {access_token, token_type}
API-->>Frontend : Store token in localStorage
Frontend-->>Browser : Redirect based on role
```

**Diagram sources**
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/database.py](file://backend/database.py#L1-L22)

**Section sources**
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)

### Router-Based API Design
- The backend registers routers under distinct prefixes (/patient, /doctors, /appointments, /notifications, /prescriptions, /ai).
- Each router encapsulates CRUD and domain-specific operations, leveraging SQLAlchemy sessions and Pydantic schemas for validation and serialization.
- Authorization is applied via dependencies that extract the current user from the JWT token and enforce role-based checks.

```mermaid
graph LR
Main["backend/main.py"] --> AuthR["auth.py"]
Main --> PatientR["routers/patient.py"]
Main --> DoctorR["routers/doctor.py"]
Main --> AppointmentR["routers/appointment.py"]
Main --> NotificationR["routers/notification.py"]
Main --> PrescriptionR["routers/prescription.py"]
Main --> AIR["routers/ai.py"]
```

**Diagram sources**
- [backend/main.py](file://backend/main.py#L1-L61)
- [backend/routers/patient.py](file://backend/routers/patient.py#L1-L107)
- [backend/routers/doctor.py](file://backend/routers/doctor.py#L1-L120)
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L1-L129)
- [backend/routers/notification.py](file://backend/routers/notification.py#L1-L177)
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L1-L145)
- [backend/routers/ai.py](file://backend/routers/ai.py#L1-L90)

**Section sources**
- [backend/main.py](file://backend/main.py#L1-L61)
- [backend/routers/patient.py](file://backend/routers/patient.py#L1-L107)
- [backend/routers/doctor.py](file://backend/routers/doctor.py#L1-L120)
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L1-L129)
- [backend/routers/notification.py](file://backend/routers/notification.py#L1-L177)
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L1-L145)
- [backend/routers/ai.py](file://backend/routers/ai.py#L1-L90)

### Data Models and Schemas
- SQLAlchemy models define entities (User, Patient, Doctor, Appointment, HealthRecord, Notification, Prescription) and relationships.
- Pydantic schemas define request/response contracts for endpoints, enabling validation and serialization.

```mermaid
erDiagram
USERS {
int id PK
string email UK
string hashed_password
string full_name
boolean is_active
string role
}
PATIENTS {
int id PK
int user_id FK
string date_of_birth
string gender
string blood_group
}
DOCTORS {
int id PK
int user_id FK
string specialization
int experience_years
string hospital_affiliation
int consultation_fee
string license_number
string availability
boolean is_verified
}
APPOINTMENTS {
int id PK
int patient_id FK
int doctor_id FK
datetime appointment_date
string status
text reason
text diagnosis_notes
}
HEALTH_RECORDS {
int id PK
int patient_id FK
string record_type
text details
datetime created_at
boolean is_shared_with_doctor
}
NOTIFICATIONS {
int id PK
int user_id FK
string notification_type
string title
text message
datetime scheduled_datetime
string status
boolean is_read
datetime created_at
int related_entity_id
}
PRESCRIPTIONS {
int id PK
int patient_id FK
int doctor_id FK
int appointment_id FK
string medicine_name
string dosage
string frequency
int duration_days
datetime start_date
datetime end_date
text instructions
datetime created_at
}
USERS ||--o{ PATIENTS : "has profile"
USERS ||--o{ DOCTORS : "has profile"
PATIENTS ||--o{ APPOINTMENTS : "books"
DOCTORS ||--o{ APPOINTMENTS : "provides"
PATIENTS ||--o{ HEALTH_RECORDS : "generates"
USERS ||--o{ NOTIFICATIONS : "receives"
PATIENTS ||--o{ PRESCRIPTIONS : "receives"
DOCTORS ||--o{ PRESCRIPTIONS : "creates"
```

**Diagram sources**
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/schemas.py](file://backend/schemas.py#L1-L236)

**Section sources**
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/schemas.py](file://backend/schemas.py#L1-L236)

### Frontend Component Communication
- The SPA uses React Router for navigation among pages.
- The API client injects the Bearer token from localStorage into outgoing requests.
- Pages consume backend endpoints for authentication, booking appointments, retrieving notifications, and accessing AI insights.

```mermaid
sequenceDiagram
participant User as "User"
participant Login as "Login.jsx"
participant API as "services/api.js"
participant Main as "backend/main.py"
participant Auth as "backend/auth.py"
User->>Login : Enter credentials
Login->>API : POST "/auth/token"
API->>Main : Forward request
Main->>Auth : /auth/token
Auth-->>API : {access_token}
API-->>Login : Persist token
Login-->>User : Navigate to dashboard
```

**Diagram sources**
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [backend/main.py](file://backend/main.py#L1-L61)
- [backend/auth.py](file://backend/auth.py#L1-L120)

**Section sources**
- [frontend/src/App.jsx](file://frontend/src/App.jsx#L1-L28)
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)

## Dependency Analysis
- Backend entrypoint wires CORS, registers routers, and starts/stops a background scheduler.
- Routers depend on authentication for current user extraction and on the database session factory.
- Models and schemas are shared across routers for data validation and persistence.

```mermaid
graph TB
Main["backend/main.py"] --> CORS["CORS Middleware"]
Main --> Routers["Routers"]
Routers --> AuthDep["auth.get_current_user"]
AuthDep --> DBDep["database.get_db"]
DBDep --> Models["models.py"]
DBDep --> Schemas["schemas.py"]
```

**Diagram sources**
- [backend/main.py](file://backend/main.py#L1-L61)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/schemas.py](file://backend/schemas.py#L1-L236)

**Section sources**
- [backend/main.py](file://backend/main.py#L1-L61)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/schemas.py](file://backend/schemas.py#L1-L236)

## Performance Considerations
- Database queries should leverage indexes on frequently filtered columns (e.g., user_id, scheduled_datetime).
- Pagination and limits should be consistently applied in list endpoints to prevent large result sets.
- Caching strategies can be considered for read-heavy resources like doctor listings and static content.
- Asynchronous tasks (e.g., reminders) should be scheduled efficiently to avoid contention.

## Security Architecture
- Authentication: JWT tokens with HS256 algorithm; tokens carry user identity and role.
- Authorization: Role checks in routers (patient, doctor, admin) to restrict endpoint access.
- Transport: HTTPS should be used in production; CORS is configured for development origins.
- Secrets: The secret key is embedded in code; in production, it should be managed via environment variables and secure secret stores.

Recommendations:
- Rotate secrets regularly and store them outside the codebase.
- Enforce HTTPS and secure cookie attributes for token storage.
- Add rate limiting and input sanitization to mitigate abuse.
- Audit logs for sensitive operations and token issuance.

**Section sources**
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/main.py](file://backend/main.py#L1-L61)

## Scalability Considerations
- Horizontal scaling: Stateless backend allows load balancing across instances; persist sessions externally if needed.
- Database: Migrate to PostgreSQL for production; enable connection pooling and read replicas for read-heavy workloads.
- Background jobs: Offload long-running tasks (e.g., notifications) to a queue and worker processes.
- Caching: Introduce Redis for session storage and caching of frequently accessed data.
- CDN: Serve static assets via CDN to reduce origin load.

## Deployment Topology
Recommended deployment units:
- Frontend: Host static assets behind a CDN or reverse proxy.
- Backend: Run FastAPI behind a WSGI server (e.g., Uvicorn) behind a reverse proxy (e.g., Nginx).
- Database: PostgreSQL in a managed service or containerized with persistent volumes.
- Background tasks: Separate worker processes for scheduled jobs.

```mermaid
graph TB
subgraph "Edge"
CDN["CDN/Reverse Proxy"]
end
subgraph "Platform"
LB["Load Balancer"]
API["FastAPI Instances"]
Worker["Background Workers"]
DB["PostgreSQL"]
end
CDN --> LB
LB --> API
API --> DB
Worker --> DB
```

[No sources needed since this diagram shows conceptual deployment topology]

## Troubleshooting Guide
- Authentication failures:
  - Verify token presence and validity in localStorage.
  - Ensure the Authorization header is set by the API client.
  - Confirm the backend secret key and algorithm match expectations.
- Authorization errors:
  - Check role claims embedded in the token payload.
  - Validate router-level role checks align with user roles.
- Database connectivity:
  - Confirm the database URL and credentials.
  - Ensure migrations are applied and tables exist.
- CORS issues:
  - Verify allowed origins in the backend configuration.

**Section sources**
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [frontend/src/pages/Login.jsx](file://frontend/src/pages/Login.jsx#L1-L104)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/main.py](file://backend/main.py#L1-L61)

## Conclusion
SmartHealthCare employs a clean architecture with clear separation between presentation, application, and data layers. The React SPA communicates with a modular FastAPI backend secured by JWT and role-based access control. The system’s design supports incremental enhancements for scalability, security, and operational robustness, with straightforward migration paths to production-grade infrastructure.