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
├── docs/                      # Standardized project documentation
├── frontend/                  # React.js SPA application
├── backend/                   # Spring Boot microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── project-service/
│   ├── workforce-service/
│   ├── inventory-service/
│   ├── equipment-service/
│   ├── finance-service/
│   ├── notification-service/
│   └── reporting-service/
├── docker/                    # Docker Compose files & configurations
├── postman/                   # API testing collections
├── .github/                   # GitHub Actions for CI/CD pipelines
└── README.md                  # Project root overview
```

## Branching Strategy
- `main`: Stable, production-ready code.
- `develop`: Integration branch for active development.
- `feature/<feature-name>`: Dedicated branches for specific features or modules (e.g., `feature/login`, `feature/inventory`).
- `bugfix/<issue>`: Branches used to resolve issues found during testing.

## Deployment Strategy
- **Local Development:** Handled via Docker Compose for backing services (MySQL, Redis, Kafka) and standard runtime environments for apps.
- **Cloud Deployment:** Target deployment includes Azure Static Web Apps for the frontend, Azure Container Apps / App Service for the backend microservices, and Azure MySQL for the databases.
