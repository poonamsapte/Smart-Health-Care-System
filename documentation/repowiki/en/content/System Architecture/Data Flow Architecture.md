# Data Flow Architecture

<cite>
**Referenced Files in This Document**
- [backend/main.py](file://backend/main.py)
- [backend/database.py](file://backend/database.py)
- [backend/models.py](file://backend/models.py)
- [backend/schemas.py](file://backend/schemas.py)
- [backend/auth.py](file://backend/auth.py)
- [backend/routers/patient.py](file://backend/routers/patient.py)
- [backend/routers/appointment.py](file://backend/routers/appointment.py)
- [backend/routers/ai.py](file://backend/routers/ai.py)
- [backend/routers/notification.py](file://backend/routers/notification.py)
- [backend/routers/prescription.py](file://backend/routers/prescription.py)
- [backend/scheduler.py](file://backend/scheduler.py)
- [backend/email_service.py](file://backend/email_service.py)
- [frontend/src/services/api.js](file://frontend/src/services/api.js)
- [frontend/src/services/notificationService.js](file://frontend/src/services/notificationService.js)
- [frontend/src/components/NotificationBell.jsx](file://frontend/src/components/NotificationBell.jsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the end-to-end data flow architecture of the SmartHealthCare system. It covers the request-response cycle from the frontend through FastAPI routers to SQLAlchemy persistence, Pydantic-based data validation and transformation, database transactions and entity relationships, background task scheduling for notifications, email integration, and the AI analysis pipeline. It also documents error propagation, data consistency, audit trails, caching and polling strategies, and performance monitoring approaches.

## Project Structure
SmartHealthCare is organized into a Python FastAPI backend and a Vite/React frontend. The backend defines routers for authentication, patients, doctors, appointments, AI analysis, notifications, and prescriptions. Data models define the relational schema, while Pydantic schemas enforce request/response validation. A background scheduler orchestrates recurring tasks for reminders and email delivery.

```mermaid
graph TB
FE["Frontend (Vite/React)"] --> API["FastAPI Backend"]
API --> Routers["Routers<br/>auth, patient, doctor, appointment, ai, notification, prescription"]
API --> DB["SQLAlchemy ORM"]
DB --> Models["Models<br/>User, Patient, Doctor, Appointment, HealthRecord, Notification, Prescription"]
API --> Scheduler["Background Scheduler"]
Scheduler --> Email["Email Service"]
API --> Logging["Logging"]
```

**Diagram sources**
- [backend/main.py](file://backend/main.py#L13-L44)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/scheduler.py](file://backend/scheduler.py#L1-L317)
- [backend/email_service.py](file://backend/email_service.py#L1-L161)

**Section sources**
- [backend/main.py](file://backend/main.py#L1-L61)
- [backend/database.py](file://backend/database.py#L1-L22)

## Core Components
- FastAPI Application: Central entrypoint with CORS, router registration, and lifecycle hooks for scheduler startup/shutdown.
- Authentication: JWT-based OAuth2 password flow with token creation and current user resolution.
- Data Models: SQLAlchemy declarative base with relationships among User, Patient, Doctor, Appointment, HealthRecord, Notification, and Prescription.
- Pydantic Schemas: Strongly typed request/response models for validation and serialization.
- Routers: Feature-based API endpoints implementing CRUD and orchestration logic.
- Database Layer: Engine, session factory, and dependency injection via a generator.
- Background Scheduler: APScheduler jobs for reminders, email dispatch, and cleanup.
- Email Service: SMTP-based templated emails with environment-driven configuration.

**Section sources**
- [backend/main.py](file://backend/main.py#L13-L61)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/schemas.py](file://backend/schemas.py#L1-L236)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/scheduler.py](file://backend/scheduler.py#L259-L317)
- [backend/email_service.py](file://backend/email_service.py#L1-L161)

## Architecture Overview
The system follows a layered architecture:
- Presentation Layer: Frontend Axios client and React components.
- API Layer: FastAPI routers handling requests, authorization, and response modeling.
- Domain Layer: Business logic in routers (e.g., appointment booking, prescription creation).
- Persistence Layer: SQLAlchemy ORM mapped to SQLite (with PostgreSQL example comment).
- Background Layer: APScheduler jobs for recurring tasks and email delivery.

```mermaid
graph TB
subgraph "Presentation"
FE_API["Axios Client<br/>frontend/src/services/api.js"]
FE_Notif["Notification Service<br/>frontend/src/services/notificationService.js"]
FE_Bell["NotificationBell<br/>frontend/src/components/NotificationBell.jsx"]
end
subgraph "API"
Main["FastAPI App<br/>backend/main.py"]
Auth["Auth Router<br/>backend/auth.py"]
Patient["Patient Router<br/>backend/routers/patient.py"]
Appointment["Appointment Router<br/>backend/routers/appointment.py"]
AI["AI Router<br/>backend/routers/ai.py"]
Notif["Notification Router<br/>backend/routers/notification.py"]
Presc["Prescription Router<br/>backend/routers/prescription.py"]
end
subgraph "Persistence"
DB["Engine & Session<br/>backend/database.py"]
Models["ORM Models<br/>backend/models.py"]
end
subgraph "Background"
Sched["Scheduler<br/>backend/scheduler.py"]
Email["Email Service<br/>backend/email_service.py"]
end
FE_API --> Main
FE_Notif --> Main
FE_Bell --> FE_Notif
Main --> Auth
Main --> Patient
Main --> Appointment
Main --> AI
Main --> Notif
Main --> Presc
Main --> DB
DB --> Models
Main --> Sched
Sched --> Email
```

**Diagram sources**
- [backend/main.py](file://backend/main.py#L13-L44)
- [backend/auth.py](file://backend/auth.py#L1-L120)
- [backend/routers/patient.py](file://backend/routers/patient.py#L1-L107)
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L1-L129)
- [backend/routers/ai.py](file://backend/routers/ai.py#L1-L90)
- [backend/routers/notification.py](file://backend/routers/notification.py#L1-L177)
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L1-L150)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/models.py](file://backend/models.py#L1-L110)
- [backend/scheduler.py](file://backend/scheduler.py#L259-L317)
- [backend/email_service.py](file://backend/email_service.py#L1-L161)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [frontend/src/services/notificationService.js](file://frontend/src/services/notificationService.js#L1-L117)
- [frontend/src/components/NotificationBell.jsx](file://frontend/src/components/NotificationBell.jsx#L1-L64)

## Detailed Component Analysis

### Request-Response Cycle and Data Validation
- Frontend Axios client injects Authorization header from localStorage and targets the backend API.
- FastAPI app registers routers and middleware (CORS).
- Routers depend on SQLAlchemy sessions and Pydantic schemas for validation and serialization.
- Authentication middleware resolves the current user from JWT tokens.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant API as "FastAPI App"
participant Router as "Router"
participant DB as "SQLAlchemy Session"
participant Model as "ORM Model"
FE->>API : "HTTP Request (with Bearer token)"
API->>Router : "Route to handler"
Router->>DB : "Open session via dependency"
Router->>Model : "Query/Create/Update"
DB-->>Router : "Commit/Refresh"
Router-->>FE : "Pydantic-validated Response"
```

**Diagram sources**
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [backend/main.py](file://backend/main.py#L13-L44)
- [backend/routers/patient.py](file://backend/routers/patient.py#L11-L25)
- [backend/database.py](file://backend/database.py#L16-L21)
- [backend/models.py](file://backend/models.py#L1-L110)

**Section sources**
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L1-L25)
- [backend/main.py](file://backend/main.py#L13-L44)
- [backend/auth.py](file://backend/auth.py#L39-L55)

### Authentication and Authorization Flow
- Registration hashes passwords and creates user profiles based on role.
- Login generates a short-lived JWT token containing user identity and role.
- Protected routes resolve the current user via bearer token and enforce role-based access.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Auth as "Auth Router"
participant DB as "Database"
participant JWT as "JWT"
Client->>Auth : "POST /auth/register"
Auth->>DB : "Check unique email"
Auth->>DB : "Hash password and create user"
Auth->>DB : "Create role-specific profile"
DB-->>Auth : "Persist"
Auth-->>Client : "UserOut"
Client->>Auth : "POST /auth/token"
Auth->>DB : "Verify credentials"
Auth->>JWT : "Encode access token"
Auth-->>Client : "Token"
```

**Diagram sources**
- [backend/auth.py](file://backend/auth.py#L60-L120)
- [backend/models.py](file://backend/models.py#L6-L47)

**Section sources**
- [backend/auth.py](file://backend/auth.py#L60-L120)

### Patient Profile and Health Records
- Patients can retrieve/update their profile and view/create health records.
- Access control ensures only authorized roles can access endpoints.
- Health records support selective sharing with doctors.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant Patient as "Patient Router"
participant DB as "Database"
participant Model as "ORM"
FE->>Patient : "GET /patient/me"
Patient->>DB : "Query current user and profile"
DB-->>Patient : "Patient + User"
Patient-->>FE : "PatientOut (nested User)"
FE->>Patient : "PUT /patient/me"
Patient->>DB : "Upsert profile and commit"
DB-->>Patient : "Refresh"
Patient-->>FE : "PatientOut"
```

**Diagram sources**
- [backend/routers/patient.py](file://backend/routers/patient.py#L11-L52)
- [backend/models.py](file://backend/models.py#L20-L32)

**Section sources**
- [backend/routers/patient.py](file://backend/routers/patient.py#L11-L107)

### Appointment Management
- Patients book appointments with a doctor and date/time.
- Appointments are returned with nested patient/doctor details.
- Status updates are role-restricted (doctor updates status/diagnosis; patient cancels).

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant App as "Appointment Router"
participant DB as "Database"
participant Model as "ORM"
FE->>App : "POST /appointments/"
App->>DB : "Validate doctor exists"
App->>DB : "Create Appointment"
DB-->>App : "Commit"
App-->>FE : "AppointmentOut"
FE->>App : "GET /appointments/"
App->>DB : "Load appointments (role-aware)"
App->>Model : "Build AppointmentWithDetails"
App-->>FE : "List[AppointmentWithDetails]"
```

**Diagram sources**
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L12-L92)
- [backend/models.py](file://backend/models.py#L49-L62)

**Section sources**
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L12-L129)

### Prescription Workflow
- Doctors create prescriptions with parsed start/end dates and frequency.
- Patients can view their own prescriptions and active ones.
- Access control ensures only authorized users can view specific records.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant Presc as "Prescription Router"
participant DB as "Database"
FE->>Presc : "POST /prescriptions/create"
Presc->>DB : "Validate doctor/patient"
Presc->>DB : "Compute end_date and persist"
DB-->>Presc : "Commit"
Presc-->>FE : "PrescriptionOut"
FE->>Presc : "GET /prescriptions/active/me"
Presc->>DB : "Filter by active window"
Presc-->>FE : "List[PrescriptionOut]"
```

**Diagram sources**
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L12-L150)
- [backend/models.py](file://backend/models.py#L91-L110)

**Section sources**
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L12-L150)

### AI Symptom Analysis Pipeline
- The AI endpoint accepts a structured request and applies rule-based logic to detect symptoms, predict diseases, suggest medicines, and generate recommendations.
- Responses are strongly typed via Pydantic models.

```mermaid
flowchart TD
Start(["POST /ai/analyze"]) --> Parse["Parse SymptomAnalysisRequest"]
Parse --> Detect["Detect Symptoms"]
Detect --> Rules{"Apply Rule Logic"}
Rules --> |Chest Pain/Shortness of Breath| HighRisk["High Risk Level<br/>Predict Heart Issues"]
Rules --> |Fever+Cough| MedRisk["Medium Risk Level<br/>Predict Flu/Common Cold"]
Rules --> |Headache| LowRisk["Low Risk Level<br/>Predict Headache/Migraine"]
Rules --> |Nausea| LowRisk2["Low Risk Level<br/>Predict Food Poisoning"]
Rules --> |None| General["General Fatigue"]
HighRisk --> Build["Build AIHealthReport"]
MedRisk --> Build
LowRisk --> Build
LowRisk2 --> Build
General --> Build
Build --> Return(["Return AIHealthReport"])
```

**Diagram sources**
- [backend/routers/ai.py](file://backend/routers/ai.py#L10-L90)
- [backend/schemas.py](file://backend/schemas.py#L140-L162)

**Section sources**
- [backend/routers/ai.py](file://backend/routers/ai.py#L10-L90)
- [backend/schemas.py](file://backend/schemas.py#L140-L162)

### Notification System Data Flow
- Users can list, filter, and manage notifications; stats expose unread counts and upcoming reminders.
- Background scheduler creates reminders for prescriptions and appointments at configured intervals.
- Pending notifications are sent via email service and statuses updated accordingly.
- Frontend polls notification stats and renders unread indicators.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant Notif as "Notification Router"
participant DB as "Database"
participant Sched as "Scheduler"
participant Email as "Email Service"
FE->>Notif : "GET /notifications/stats"
Notif->>DB : "Count unread/upcoming"
Notif-->>FE : "NotificationStats"
Sched->>DB : "Find active prescriptions/appointments"
Sched->>DB : "Create Notification entries"
DB-->>Sched : "Persist"
Sched->>DB : "Select pending notifications"
Sched->>Email : "send_notification_email(...)"
Email-->>Sched : "Success/Failure"
Sched->>DB : "Update status"
DB-->>Sched : "Commit"
```

**Diagram sources**
- [backend/routers/notification.py](file://backend/routers/notification.py#L13-L123)
- [backend/scheduler.py](file://backend/scheduler.py#L51-L233)
- [backend/email_service.py](file://backend/email_service.py#L141-L161)
- [frontend/src/services/notificationService.js](file://frontend/src/services/notificationService.js#L31-L43)
- [frontend/src/components/NotificationBell.jsx](file://frontend/src/components/NotificationBell.jsx#L11-L30)

**Section sources**
- [backend/routers/notification.py](file://backend/routers/notification.py#L13-L177)
- [backend/scheduler.py](file://backend/scheduler.py#L51-L233)
- [backend/email_service.py](file://backend/email_service.py#L141-L161)
- [frontend/src/services/notificationService.js](file://frontend/src/services/notificationService.js#L1-L117)
- [frontend/src/components/NotificationBell.jsx](file://frontend/src/components/NotificationBell.jsx#L1-L64)

### Database Transactions, Relationships, and Consistency
- Sessions are opened per-request and closed in a finally block to ensure cleanup.
- Commit/refresh patterns ensure data visibility and consistency after mutations.
- Relationships enable eager loading of related entities (e.g., user, patient, doctor).
- Foreign keys maintain referential integrity across entities.

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
USERS ||--o| PATIENTS : "has profile"
USERS ||--o| DOCTORS : "has profile"
PATIENTS ||--o{ APPOINTMENTS : "books"
DOCTORS ||--o{ APPOINTMENTS : "attends"
PATIENTS ||--o{ HEALTH_RECORDS : "owns"
PATIENTS ||--o{ PRESCRIPTIONS : "receives"
DOCTORS ||--o{ PRESCRIPTIONS : "writes"
APPOINTMENTS ||--o{ NOTIFICATIONS : "relates to"
PRESCRIPTIONS ||--o{ NOTIFICATIONS : "relates to"
```

**Diagram sources**
- [backend/models.py](file://backend/models.py#L6-L110)

**Section sources**
- [backend/database.py](file://backend/database.py#L16-L21)
- [backend/models.py](file://backend/models.py#L6-L110)

### Data Transformation Patterns with Pydantic
- Request schemas (e.g., UserCreate, PatientUpdate, AppointmentCreate) validate incoming payloads.
- Response schemas (e.g., PatientOut, AppointmentOut, AIHealthReport) serialize domain objects.
- Nested schemas (e.g., AppointmentWithDetails, PatientInfo, DoctorInfo) flatten related entities for richer responses.

```mermaid
classDiagram
class UserCreate {
+string email
+string password
+string full_name
+string role
}
class PatientUpdate {
+string date_of_birth
+string gender
+string blood_group
}
class AppointmentCreate {
+int doctor_id
+datetime appointment_date
+string reason
}
class PatientOut {
+int id
+int user_id
+string date_of_birth
+string gender
+string blood_group
+UserOut user
}
class AppointmentOut {
+int id
+int patient_id
+int doctor_id
+datetime appointment_date
+string status
+string reason
+string diagnosis_notes
}
class AIHealthReport {
+string risk_level
+string[] detected_symptoms
+DiseasePrediction[] predicted_diseases
+MedicineSuggestion[] suggested_medicines
+string[] recommendations
+string disclaimer
}
```

**Diagram sources**
- [backend/schemas.py](file://backend/schemas.py#L6-L236)

**Section sources**
- [backend/schemas.py](file://backend/schemas.py#L6-L236)

### Caching and Synchronization Strategies
- Frontend polls notification stats every 30 seconds to synchronize unread counts.
- Local storage stores the Bearer token for subsequent requests.
- No explicit in-memory cache is implemented in the backend; database queries are executed per request.

Recommendations:
- Introduce Redis or in-memory cache for frequently accessed stats and reduce DB load.
- Add ETags/Last-Modified headers for GET endpoints to enable client-side caching.
- Use server-sent events (SSE) or WebSockets for real-time updates instead of polling.

**Section sources**
- [frontend/src/components/NotificationBell.jsx](file://frontend/src/components/NotificationBell.jsx#L23-L30)
- [frontend/src/services/api.js](file://frontend/src/services/api.js#L10-L22)

### Performance Monitoring Approaches
- Application logs are written to a file with timestamps and levels.
- Scheduler logs indicate job execution and errors.
- Email service logs successes/failures.

Recommendations:
- Add structured logging with correlation IDs.
- Instrument routers with timing metrics (request duration, DB time).
- Monitor scheduler job latencies and failures.

**Section sources**
- [backend/main.py](file://backend/main.py#L6-L11)
- [backend/scheduler.py](file://backend/scheduler.py#L7-L8)
- [backend/email_service.py](file://backend/email_service.py#L11-L12)

## Dependency Analysis
The backend composes multiple modules with clear boundaries:
- FastAPI app depends on routers and scheduler lifecycle hooks.
- Routers depend on models, database sessions, schemas, and auth.
- Scheduler depends on database and email service.
- Frontend services depend on the backend API and local storage.

```mermaid
graph LR
Main["backend/main.py"] --> Auth["backend/auth.py"]
Main --> Patient["backend/routers/patient.py"]
Main --> Appointment["backend/routers/appointment.py"]
Main --> AI["backend/routers/ai.py"]
Main --> Notif["backend/routers/notification.py"]
Main --> Presc["backend/routers/prescription.py"]
Main --> DB["backend/database.py"]
Main --> Sched["backend/scheduler.py"]
Sched --> Email["backend/email_service.py"]
FE_API["frontend/src/services/api.js"] --> Main
FE_Notif["frontend/src/services/notificationService.js"] --> Main
FE_Bell["frontend/src/components/NotificationBell.jsx"] --> FE_Notif
```

**Diagram sources**
- [backend/main.py](file://backend/main.py#L34-L44)
- [backend/routers/*.py](file://backend/routers/patient.py#L1-L107)
- [backend/database.py](file://backend/database.py#L1-L22)
- [backend/scheduler.py](file://backend/scheduler.py#L1-L317)
- [backend/email_service.py](file://backend/email_service.py#L1-L161)
- [frontend/src/services/*.js](file://frontend/src/services/api.js#L1-L25)

**Section sources**
- [backend/main.py](file://backend/main.py#L34-L44)

## Performance Considerations
- Database Queries: Use filtered queries with appropriate indexes (e.g., user_id, scheduled_datetime, status). Consider pagination and limits for lists.
- Background Jobs: Schedule intervals should balance freshness and overhead; adjust cron/interval frequencies based on traffic.
- Serialization: Prefer returning only required fields in response schemas to minimize payload sizes.
- Network: Frontend polling can be optimized with SSE/WebSockets for real-time updates.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Authentication Failures: Ensure the Authorization header is present and the token is unexpired; verify JWT decoding and user lookup.
- Permission Denied: Role-based endpoints enforce access control; confirm current user role and ownership checks.
- Database Errors: Session lifecycle and rollback patterns prevent inconsistent states; inspect logs for exceptions during commit/refresh.
- Scheduler Issues: Verify scheduler startup/shutdown hooks and job configurations; check logs for job execution errors.
- Email Delivery: Confirm environment variables for SMTP; review email service logs for failures.

**Section sources**
- [backend/auth.py](file://backend/auth.py#L39-L55)
- [backend/routers/patient.py](file://backend/routers/patient.py#L16-L21)
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L108-L124)
- [backend/database.py](file://backend/database.py#L16-L21)
- [backend/scheduler.py](file://backend/scheduler.py#L259-L317)
- [backend/email_service.py](file://backend/email_service.py#L109-L138)

## Conclusion
SmartHealthCare implements a clean separation of concerns with FastAPI, SQLAlchemy, and Pydantic. The request-response cycle is validated and transformed using Pydantic models, while background tasks automate reminders and email delivery. Access control and relationships ensure data integrity. Enhancements in caching, real-time updates, and observability would further improve user experience and operational reliability.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Endpoint Catalog (Selected)
- Authentication
  - POST /auth/register → UserOut
  - POST /auth/token → Token
- Patient
  - GET /patient/me → PatientOut
  - PUT /patient/me → PatientOut
  - GET /patient/records → List[HealthRecordOut]
  - GET /patient/{patient_id}/records → List[HealthRecordOut]
  - POST /patient/records → HealthRecordOut
- Appointment
  - POST /appointments/ → AppointmentOut
  - GET /appointments/ → List[AppointmentWithDetails]
  - PUT /appointments/{id} → AppointmentOut
- AI
  - POST /ai/analyze → AIHealthReport
- Notification
  - GET /notifications/me → List[NotificationOut]
  - GET /notifications/stats → NotificationStats
  - GET /notifications/upcoming → List[NotificationOut]
  - PATCH /notifications/{id}/read → NotificationOut
  - PATCH /notifications/mark-all-read → { message }
  - DELETE /notifications/{id} → { message }
  - POST /notifications/create → NotificationOut
- Prescription
  - POST /prescriptions/create → PrescriptionOut
  - GET /prescriptions/me → List[PrescriptionOut]
  - GET /prescriptions/patient/{id} → List[PrescriptionOut]
  - GET /prescriptions/{id} → PrescriptionOut
  - GET /prescriptions/active/me → List[PrescriptionOut]

**Section sources**
- [backend/routers/auth.py](file://backend/routers/auth.py#L60-L120)
- [backend/routers/patient.py](file://backend/routers/patient.py#L11-L107)
- [backend/routers/appointment.py](file://backend/routers/appointment.py#L12-L129)
- [backend/routers/ai.py](file://backend/routers/ai.py#L10-L90)
- [backend/routers/notification.py](file://backend/routers/notification.py#L13-L177)
- [backend/routers/prescription.py](file://backend/routers/prescription.py#L12-L150)