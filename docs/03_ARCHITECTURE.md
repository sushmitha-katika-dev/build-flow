# Architecture Document

## High Level Architecture
BuildFlow utilizes a Microservices Architecture to ensure scalability, fault isolation, and independent deployments. 

The platform consists of a single-page application (React.js + Vite) communicating via REST APIs through an API Gateway (`port 8080`) with multiple Spring Boot microservices. Each microservice manages its own isolated MySQL database schema (Database-per-Service pattern). Asynchronous event-driven communication is handled by Apache Kafka to decouple services, and Redis is used for caching aggregated analytics data to ensure rapid dashboard load times.

```mermaid
graph LR
    User(["Construction Staff / Admins / Supervisors"]) --> |Uses| UI["React.js Web App (Vite)"]
    UI --> |REST API + Bearer JWT| Gateway["API Gateway (:8080)"]
    Gateway --> |Routes| Microservices["Spring Boot Microservices"]
    Microservices --> |Reads/Writes| DB[("MySQL Database Schemas")]
    Microservices -.-> |Event Streaming| Kafka["Apache Kafka Message Broker"]
    Microservices --- Cache[("Redis Cache")]
```

## Microservice Diagram
```mermaid
graph TD
    Client["Web Browser / React Frontend"] --> APIGateway["Spring Cloud Gateway (:8080)"]
    
    APIGateway --> AuthService["Authentication & User Service (:8081)"]
    APIGateway --> ProjService["Project Management Service (:8082)"]
    APIGateway --> WorkService["Workforce Management Service (:8083)"]
    APIGateway --> InvService["Material & Inventory Service (:8084)"]
    APIGateway --> EquipService["Equipment Management Service (:8085)"]
    APIGateway --> FinService["Finance & Expense Service (:8086)"]
    APIGateway --> RepService["Reporting & Analytics Service (:8087)"]
    
    AuthService --> DBAuth[("MySQL: buildflow_auth")]
    ProjService --> DBProj[("MySQL: buildflow_project")]
    WorkService --> DBWork[("MySQL: buildflow_workforce")]
    InvService --> DBInv[("MySQL: buildflow_inventory")]
    EquipService --> DBEquip[("MySQL: buildflow_equipment")]
    FinService --> DBFin[("MySQL: buildflow_finance")]
    RepService --> DBRep[("MySQL: buildflow_reporting")]

    %% Event-Driven Data Flow
    ProjService -.-> Kafka["Apache Kafka (Message Topics)"]
    WorkService -.-> Kafka
    InvService -.-> Kafka
    EquipService -.-> Kafka
    FinService -.-> Kafka
    
    Kafka -.-> RepService
    
    %% Caching Layer
    RepService --- Redis[("Redis Cache")]
```

## Component Diagram
```mermaid
graph TD
    subgraph Frontend ["Frontend (React Application)"]
        UI["UI Components / Pages"] --> AuthCtx["AuthContext (JWT & User State)"]
        AuthCtx --> Axios["Axios Client Instance (:8080)"]
    end
    
    subgraph Backend ["Backend Microservice (Spring Boot)"]
        Controller["REST Controller Layer"] --> Service["Business Service Layer"]
        Service --> Repository["Spring Data JPA Repository"]
        Repository --> DB[("MySQL Database Schema")]
        Service --> KafkaProducer["Kafka Producer Template"]
    end
    
    Axios --> Controller
```

## Service Responsibilities
- **API Gateway (8080):** Single entry point for frontend traffic. Handles routing, rate limiting, and global CORS configuration.
- **Authentication & User Service (8081):** Manages user authentication, JWT generation, Company Admin Access Passcode verification (`BF-ADMIN-2026`), Site Supervisor status approval (`APPROVED`, `PENDING_APPROVAL`, `REJECTED`), and user management endpoints.
- **Project Management Service (8082):** Manages project lifecycles (`PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`), project details, location logs, and estimated budgets.
- **Workforce Management Service (8083):** Onboards labourers (Daily, Fixed Work, Monthly), records daily attendance, calculates wages, manages supervisor allocations, and handles wage payments.
- **Material & Inventory Service (8084):** Dynamic material catalog management, company stock-in (`projectId = 0`), project stock consumption at Weighted Average Cost (WAC), and low-stock threshold monitoring.
- **Equipment Management Service (8085):** Equipment asset registry, project allocations, usage logging (`HOURLY` / `DAILY` costing rates), fuel logs, and maintenance tracking.
- **Finance & Expense Service (8086):** Consolidates expenses (`WORKFORCE`, `MATERIAL`, `EQUIPMENT`, `MISC`), maintains payment ledger, tracks outstanding balances, and calculates profit/loss.
- **Reporting & Analytics Service (8087):** Consumes Kafka events to build materialized views in Redis for dashboard analytics.

## Authentication & Security Passcode Sequence Flow

### 1. Admin Registration with Company Passcode Flow
```mermaid
sequenceDiagram
    participant User as Admin Applicant
    participant Frontend as React App
    participant Gateway as API Gateway
    participant AuthService as Auth Service
    
    User->>Frontend: Fill Registration (Role: ADMIN, Passcode: BF-ADMIN-2026)
    Frontend->>Gateway: POST /api/v1/auth/register
    Gateway->>AuthService: Route Request
    AuthService->>AuthService: Validate provided adminSecretCode == activePasscode
    alt Invalid or Missing Passcode
        AuthService-->>Frontend: HTTP 400 Bad Request ("Invalid Admin Passcode")
    else Valid Passcode
        AuthService->>AuthService: Create User (Status: APPROVED)
        AuthService-->>Frontend: Return JWT + UserDto (Status 201 Created)
    end
```

### 2. Supervisor Registration & Admin Approval Sequence Flow
```mermaid
sequenceDiagram
    participant Sup as Supervisor Applicant
    participant Admin as Admin User
    participant Frontend as React App
    participant AuthService as Auth Service
    
    Sup->>Frontend: Register as SITE_SUPERVISOR
    Frontend->>AuthService: POST /api/v1/auth/register (role: SITE_SUPERVISOR)
    AuthService->>AuthService: Save User with status = 'PENDING_APPROVAL'
    AuthService-->>Frontend: Account created (Pending Approval)
    
    Note over Sup,AuthService: Login blocked while status == PENDING_APPROVAL
    
    Admin->>Frontend: Open Admin Dashboard -> Supervisors List
    Frontend->>AuthService: GET /api/v1/auth/users
    AuthService-->>Frontend: Return registered users list
    Admin->>Frontend: Click "Approve Supervisor"
    Frontend->>AuthService: PUT /api/v1/auth/users/{id}/status?status=APPROVED
    AuthService->>AuthService: Update status = 'APPROVED'
    AuthService-->>Frontend: Return updated UserDto
    
    Note over Sup,AuthService: Supervisor can now successfully log in!
```

## Deployment Diagram
```mermaid
graph TD
    subgraph HostServer ["Cloud Host Server / Virtual Machine"]
        ContainerGateway["Docker Container: api-gateway (:8080)"]
        ContainerAuth["Docker Container: auth-service (:8081)"]
        ContainerProj["Docker Container: project-service (:8082)"]
        ContainerWork["Docker Container: workforce-service (:8083)"]
        ContainerInv["Docker Container: inventory-service (:8084)"]
        ContainerEquip["Docker Container: equipment-service (:8085)"]
        ContainerFin["Docker Container: finance-service (:8086)"]
        ContainerRep["Docker Container: reporting-service (:8087)"]
        ContainerUI["Docker Container: buildflow-frontend (:80)"]
        
        DBMySQL[("MySQL Docker Container (:3306)")]
        DBRedis[("Redis Docker Container (:6379)")]
        MQKafka[("Kafka Docker Container (:9092)")]
    end
    
    Client["User Mobile / Web Browser"] --> ContainerUI
    ContainerUI --> ContainerGateway
    ContainerGateway --> ContainerAuth
    ContainerGateway --> ContainerProj
    ContainerGateway --> ContainerWork
    ContainerGateway --> ContainerInv
    ContainerGateway --> ContainerEquip
    ContainerGateway --> ContainerFin
    ContainerGateway --> ContainerRep
    
    ContainerAuth --> DBMySQL
    ContainerProj --> DBMySQL
    ContainerWork --> DBMySQL
    ContainerInv --> DBMySQL
    ContainerEquip --> DBMySQL
    ContainerFin --> DBMySQL
    ContainerRep --> DBMySQL
    
    ContainerProj -.-> MQKafka
    ContainerWork -.-> MQKafka
    ContainerInv -.-> MQKafka
    ContainerEquip -.-> MQKafka
    ContainerFin -.-> MQKafka
    
    ContainerRep --- DBRedis
```
