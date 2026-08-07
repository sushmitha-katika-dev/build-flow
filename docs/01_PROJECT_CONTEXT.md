# Project Context

## Overview
This document outlines the high-level context, architecture, and strategies used for the BuildFlow project, adhering to the TrainingMug AI Development Framework (ADF).

## Technology Stack
- **Frontend:** React.js, TypeScript, Tailwind CSS, Axios, React Router, Chart.js / Recharts
- **Backend:** Java 21, Spring Boot, Spring Security (JWT), Spring Cloud Gateway, Spring Data JPA, Hibernate, Maven
- **Database:** MySQL (Database-per-Service Architecture)
- **Event-Driven Communication:** Apache Kafka
- **Caching:** Redis
- **API Documentation:** Swagger / OpenAPI
- **Containerization & DevOps:** Docker, Docker Compose, Git, GitHub

## Coding Standards
The project strictly follows the standards defined in the `08_CODING_STANDARDS.md` (to be created in a later phase). Core principles include:
- SOLID Principles
- Layered Architecture (Controller -> Service -> Repository)
- DTO Pattern
- Global Exception Handler
- Constructor Injection

## Architecture
BuildFlow uses a **Microservices Architecture**. An API Gateway routes traffic from the React frontend to individual microservices (Auth, Project, Workforce, Material, Equipment, Finance, Reporting). Each service connects to its own isolated MySQL database. Asynchronous communication and event-driven data flow are handled by Apache Kafka, and the Reporting Service leverages Redis for fast read access to dashboard analytics.

## Folder Structure
```
build-flow/
├── docs/                                   # Project Documentation
│   ├── PROJECT_PROPOSAL.md
│   ├── PROJECT_CONTEXT.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── API_CONTRACT.md
│   ├── UI_FLOW.md
│   ├── TASKS.md
│   ├── TEST_REPORT.md
│   └── DEPLOYMENT_GUIDE.md
│
├── backend/
│   │
│   ├── api-gateway/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── README.md
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/buildflow/auth/
│   │   │   │   │   ├── config/
│   │   │   │   │   ├── controller/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entity/
│   │   │   │   │   ├── exception/
│   │   │   │   │   ├── repository/
│   │   │   │   │   ├── security/
│   │   │   │   │   ├── service/
│   │   │   │   │   ├── util/
│   │   │   │   │   └── AuthServiceApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/
│   │   ├── src/test/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── project-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── workforce-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── inventory-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── equipment-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── finance-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   └── reporting-service/
│       ├── src/
│       ├── Dockerfile
│       └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── workforce/
│   │   │   ├── inventory/
│   │   │   ├── equipment/
│   │   │   ├── finance/
│   │   │   └── reports/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
│
├── database/
│   ├── auth-db/
│   ├── project-db/
│   ├── workforce-db/
│   ├── inventory-db/
│   ├── equipment-db/
│   ├── finance-db/
│   └── reporting-db/
│
├── docker/
│   ├── docker-compose.yml
│   ├── kafka/
│   ├── mysql/
│   └── redis/
│
├── postman/
│   └── BuildFlow.postman_collection.json
│
├── scripts/
│   ├── setup.sh
│   └── setup.bat
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .gitignore
├── README.md
└── LICENSE
```

## Development order 
build-flow
│
├── Documentation
│
├── API Gateway
│
├── Authentication Service
│
├── Project Service
│
├── Workforce Service
│
├── Inventory Service
│
├── Equipment Service
│
├── Finance Service
│
├── Reporting Service
│
├── Frontend
│
├── Testing
│
├── Docker
│
├── CI/CD
│
└── Deployment


## Structure inside every service 

project-service/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── buildflow/
│   │   │           └── project/
│   │   │
│   │   │               ├── config/
│   │   │               │
│   │   │               ├── controller/
│   │   │               │
│   │   │               ├── dto/
│   │   │               │   ├── request/
│   │   │               │   └── response/
│   │   │               │
│   │   │               ├── entity/
│   │   │               │
│   │   │               ├── enums/
│   │   │               │
│   │   │               ├── exception/
│   │   │               │
│   │   │               ├── mapper/
│   │   │               │
│   │   │               ├── repository/
│   │   │               │
│   │   │               ├── security/
│   │   │               │
│   │   │               ├── service/
│   │   │               │
│   │   │               ├── service/
│   │   │               │    └── impl/
│   │   │               │
│   │   │               ├── util/
│   │   │               │
│   │   │               ├── validator/
│   │   │               │
│   │   │               └── ProjectServiceApplication.java
│   │   │
│   │   └── resources/
│   │        ├── application.yml
│   │        ├── application-dev.yml
│   │        ├── application-prod.yml
│   │        └── db/
│   │
│   └── test/
│
├── Dockerfile
│
├── pom.xml
│
└── README.md

## Branching Strategy
- `main`: Stable, production-ready code.
- `develop`: Integration branch for active development.
- `feature/<feature-name>`: Dedicated branches for specific features or modules (e.g., `feature/login`, `feature/inventory`).
- `bugfix/<issue>`: Branches used to resolve issues found during testing.

## Deployment Strategy
- **Local Development:** Handled via Docker Compose for backing services (MySQL, Redis, Kafka) and standard runtime environments for apps.
- **Cloud Deployment:** Target deployment includes Azure Static Web Apps for the frontend, Azure Container Apps / App Service for the backend microservices, and Azure MySQL for the databases.
