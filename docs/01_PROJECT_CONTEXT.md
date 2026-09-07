# Project Context

## Overview
This document outlines the high-level context, architecture, and strategies used for the BuildFlow platform, adhering to the TrainingMug AI Development Framework (ADF).

## Technology Stack
- **Frontend:** React.js (Vite), TypeScript, Tailwind CSS, Axios, React Router, Lucide Icons, React Context API (`AuthContext`)
- **Backend:** Java 17/21, Spring Boot 3.x, Spring Security (JWT), Spring Cloud Gateway, Spring Data JPA, Hibernate, Maven
- **Database:** MySQL (Database-per-Service Architecture across isolated microservice schemas)
- **Event-Driven Communication:** Apache Kafka (Message Broker & Event Streaming)
- **Caching & Telemetry:** Redis
- **API Documentation:** Swagger / OpenAPI 3.0
- **Containerization & DevOps:** Docker, Docker Compose, Git, GitHub

## Coding Standards
The project strictly adheres to clean architecture principles:
- SOLID Principles & Clean Code
- Layered Architecture (`Controller` -> `Service` / `ServiceImpl` -> `Repository` -> `Entity`)
- DTO Pattern (`Request` / `Response` DTOs with validation annotations)
- Global Exception Handler (`@RestControllerAdvice`)
- Constructor Injection (`Lombok` / Explicit Constructors)
- Idempotent Kafka Event Processing (`referenceId` duplicate protection in Finance Service)

## Architecture
BuildFlow uses a **Microservices Architecture**. An API Gateway (`port: 8080`) routes traffic from the React frontend to individual microservices (`auth-service: 8081`, `project-service: 8082`, `workforce-service: 8083`, `inventory-service: 8084`, `equipment-service: 8085`, `finance-service: 8086`, `reporting-service: 8087`). Each service connects to its own isolated MySQL database schema. Asynchronous event-driven communication and data synchronization are handled by Apache Kafka topics, and the Reporting Service leverages Redis for fast read access to aggregated dashboard analytics.

## Folder Structure
```
build-flow/
├── docs/                                   # Project Documentation
│   ├── 00_PROJECT_UNDERSTANDING.md
│   ├── 01_PROJECT_CONTEXT.md
│   ├── 02_REQUIREMENTS.md
│   ├── 03_ARCHITECTURE.md
│   ├── 04_DATABASE.md
│   ├── 05_API_CONTRACT.md
│   ├── 06_UI_FLOW.md
│   ├── 07_TASKS.md
│   ├── buildflow-final-validation.md
│   ├── equipment-integration-audit.md
│   └── BuildFlow_Postman_Collection.json
│
├── backend/
│   ├── api-gateway/                        # Spring Cloud Gateway (8080)
│   ├── auth-service/                       # JWT Auth, User & Passcode Management (8081)
│   ├── project-service/                    # Project Lifecycle & Budgets (8082)
│   ├── workforce-service/                  # Labourers, Attendance & Wage Agreements (8083)
│   ├── inventory-service/                  # Dynamic Materials, Stock & WAC Consumption (8084)
│   ├── equipment-service/                  # Machinery Registry, Usage & Fuel Logs (8085)
│   ├── finance-service/                    # Aggregated Ledger, Expenses & Payments (8086)
│   └── reporting-service/                  # Analytics & Redis Dashboard Views (8087)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                            # Axios client instance
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/                     # Reusable UI components (Input, Button, Alert, Badge)
│   │   │   └── layout/                     # Sidebar, Header navigation
│   │   ├── context/                        # AuthContext (JWT, Login, Logout)
│   │   ├── layouts/                        # AuthLayout (2-Column Landing), MainLayout
│   │   ├── pages/
│   │   │   ├── auth/                       # LoginPage, RegisterPage
│   │   │   ├── company/                    # CompanyPage
│   │   │   ├── dashboard/                  # DashboardPage (Admin Command Center), DashboardRouter
│   │   │   ├── equipment/                  # EquipmentPage
│   │   │   ├── finance/                    # FinancePage
│   │   │   ├── inventory/                  # InventoryPage
│   │   │   ├── profile/                    # ProfilePage
│   │   │   ├── projects/                   # ProjectsPage, ProjectDetailsPage
│   │   │   ├── settings/                   # SettingsPage
│   │   │   ├── supervisor/                 # SupervisorDashboardPage
│   │   │   └── workforce/                  # WorkforcePage, WorkerHistoryPage
│   │   ├── routes/                         # ProtectedRoute (Role & JWT check)
│   │   ├── services/                       # API Services (authService, projectService, etc.)
│   │   ├── types/                          # TypeScript Interfaces & Role definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
│
├── docker-compose.yml                      # Full multi-container composition
├── README.md
└── LICENSE
```

## Security & Access Control Model
- **Company Admin Access Passcode (`BF-ADMIN-2026`):**
  Self-registration for executive roles (`ADMIN`, `CONTRACTOR`, `PROJECT_MANAGER`, `FINANCE_MANAGER`) strictly requires providing the valid Company Security Key. Admins can view, copy, or change the passcode dynamically from the Admin Dashboard.
- **Site Supervisor Approval Workflow:**
  Self-registration for `SITE_SUPERVISOR` accounts defaults to `PENDING_APPROVAL` status. Supervisors are blocked from logging in until an Admin explicitly authorizes them (`APPROVED`). If an account is marked `REJECTED`, authentication is denied.

## Branching Strategy
- `main`: Production-ready release branch.
- `develop`: Primary integration branch for active development.
- `feature/<feature-name>`: Dedicated feature development branches.

## Deployment Strategy
- **Local Containerization:** Managed via Docker Compose for all 9 microservices, MySQL, Redis, and Apache Kafka.
- **Production Target:** Containerized deployment via cloud Virtual Machines (AWS EC2 / DigitalOcean Droplets) or Azure Container Apps with Docker Compose.
