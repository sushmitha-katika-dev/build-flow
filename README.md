# 🏗️ BuildFlow — Enterprise Construction Resource Planning (CRP)

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.x-green.svg?logo=spring&logoColor=white)](https://spring.io/projects/spring-cloud)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-Distributed%20Events-231F20.svg?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Containerized-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)

> **BuildFlow** is an enterprise-grade, event-driven Construction Resource Planning (CRP) platform architected using **Java Spring Boot microservices**, **Apache Kafka**, **Redis**, and a high-performance **React 19 / TypeScript** single-page application.

---

## 📑 Table of Contents
- [System Architecture](#-system-architecture)
- [Microservices Ecosystem](#-microservices-ecosystem)
- [Key Enterprise Features](#-key-enterprise-features)
- [Event-Driven Flow (Kafka)](#-event-driven-flow-kafka)
- [Database-per-Service Architecture](#-database-per-service-architecture)
- [Tech Stack](#-tech-stack)
- [Quickstart with Docker Compose](#-quickstart-with-docker-compose)
- [Local Development Setup](#-local-development-setup)
- [API Documentation & Postman](#-api-documentation--postman)
- [Project Directory Structure](#-project-directory-structure)

---

## 🏛️ System Architecture

BuildFlow employs a **Microservices Architecture** with a centralized **Spring Cloud API Gateway**, service-to-service asynchronous event streaming via **Apache Kafka**, and an in-memory **Redis** cache for near real-time executive dashboard KPIs.

```mermaid
graph TD
    Client["🖥️ Web Browser / React 19 SPA (Port 80 / 5173)"] -->|REST API + Bearer JWT| Gateway["🛡️ Spring Cloud API Gateway (Port 8080)"]

    Gateway -->|Authentication & RBAC| Auth["🔑 Auth Service (:8081)"]
    Gateway -->|Projects & Milestones| Proj["🏗️ Project Service (:8082)"]
    Gateway -->|Workers, Shifts & Wages| Work["👷 Workforce Service (:8083)"]
    Gateway -->|Material & Stock Logs| Inv["📦 Inventory Service (:8084)"]
    Gateway -->|Machinery & Fuel Tracking| Equip["🚜 Equipment Service (:8085)"]
    Gateway -->|Expenses, Invoices & P&L| Fin["💰 Finance Service (:8086)"]
    Gateway -->|Aggregated Analytics & KPIs| Rep["📊 Reporting Service (:8087)"]

    %% Kafka Events
    Work -.->|kafka: attendance.events| Kafka(("⚡ Apache Kafka (:9093)"))
    Inv -.->|kafka: inventory.events| Kafka
    Equip -.->|kafka: equipment.events| Kafka
    Kafka -.->|Event Consumer (Auto-Expense)| Fin
    Kafka -.->|Event Consumer (Analytics Sink)| Rep

    %% Caching Layer
    Rep --- Redis[("⚡ Redis Cache (:6379)")]

    %% Isolated Databases
    Auth --> DBAuth[("🗄️ MySQL: buildflow_auth")]
    Proj --> DBProj[("🗄️ MySQL: buildflow_project")]
    Work --> DBWork[("🗄️ MySQL: buildflow_workforce")]
    Inv --> DBInv[("🗄️ MySQL: buildflow_inventory")]
    Equip --> DBEquip[("🗄️ MySQL: buildflow_equipment")]
    Fin --> DBFin[("🗄️ MySQL: buildflow_finance")]
    Rep --> DBRep[("🗄️ MySQL: buildflow_reporting")]
```

---

## 🧩 Microservices Ecosystem

| Service | Port | Database Schema | Primary Responsibility |
| :--- | :---: | :--- | :--- |
| **API Gateway** | `8080` | *Stateless* | Central ingress routing, CORS policies, JWT validation filter, rate limiting. |
| **Auth Service** | `8081` | `buildflow_auth` | User registration, admin passcode verification, BCrypt hashing, JWT issuance & RBAC. |
| **Project Service** | `8082` | `buildflow_project` | Construction projects, client metadata, budget allocations, stage & milestone tracking. |
| **Workforce Service** | `8083` | `buildflow_workforce` | Worker profiles, daily attendance logging, shift management, automated wage computations. |
| **Inventory Service** | `8084` | `buildflow_inventory` | Raw material stock levels, consumption logs, reorder thresholds, supplier orders. |
| **Equipment Service** | `8085` | `buildflow_equipment` | Heavy machinery fleet, maintenance schedules, operational hours, and fuel consumption logs. |
| **Finance Service** | `8086` | `buildflow_finance` | Project budgets, expense tracking, P&L statements, automated Kafka event cost processing. |
| **Reporting Service** | `8087` | `buildflow_reporting` | Real-time executive dashboards, cross-service metric aggregation, Redis caching. |

---

## 🚀 Key Enterprise Features

### 🔐 1. Role-Based Access Control (RBAC) & Security
- Secure registration requiring an authorized company secret key (`BF-ADMIN-2026`) for `ADMIN` role creation.
- Fine-grained permissions for `ADMIN` and `SITE_SUPERVISOR`.
- Stateless JWT verification on every downstream request via the Gateway.

### 👷 2. Workforce & Auto-Wage Computation
- Real-time clock-in/clock-out tracking with shift categorization (`DAY`, `NIGHT`, `OVERTIME`).
- Automated daily wage calculation based on specialized skill rates (Mason, Electrician, Carpenter, Welder, Laborer).
- Produces `attendance.events` on Kafka to automatically debit wage expenditures in the Finance Service.

### 📦 3. Smart Material Inventory
- Real-time stock decrement tracking upon job-site consumption.
- Visual warning badges for stock levels below safety thresholds (`CRITICAL`, `LOW`, `OPTIMAL`).
- Produces `inventory.events` on Kafka for automated purchase order ledger entries.

### 🚜 4. Heavy Equipment Fleet Management
- Machinery health telemetry, runtime hour tracking, and routine maintenance scheduling.
- Automated fuel consumption cost logging published directly to Kafka.

### 💰 5. Automated Financial Expense Pipeline
- Consumes Kafka events across Workforce, Materials, and Equipment to create immutable, synchronized expense transactions without direct synchronous coupling.
- Live budget-vs-actual variance tracking per project.

### 📊 6. Executive Dashboards & Analytics
- Visual interactive charts powered by Recharts (Burn-down charts, project cost distribution, workforce productivity).
- In-memory Redis caching for sub-10ms response times on aggregated KPI endpoints.

---

## ⚡ Event-Driven Flow (Kafka)

```
[Workforce Service]  ──▶  (Topic: workforce-attendance)  ──┐
[Inventory Service]  ──▶  (Topic: inventory-consumption) ──┼──▶  [Finance Service] (Auto-Expense)
[Equipment Service]  ──▶  (Topic: equipment-usage)       ──┘     └──▶ [Reporting Service] (Realtime KPIs)
```

- **Loose Coupling**: Services operate independently without blocking REST calls during high-concurrency site operations.
- **Data Consistency**: Eventual consistency guarantees financial ledgers always reconcile with physical job-site actions.

---

## 🛠️ Tech Stack

### Backend
- **Core Framework**: Java 21, Spring Boot 3.2.x, Spring Cloud Gateway
- **Persistence**: Spring Data JPA, Hibernate, MySQL 8.0 (Database-per-Service)
- **Messaging & Event Streaming**: Apache Kafka, Zookeeper
- **Caching**: Redis 7.2
- **Security**: Spring Security 6, JJWT (JSON Web Token), BCrypt

### Frontend
- **Framework**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS 3.4, Lucide React Icons
- **Visualizations**: Recharts
- **Routing & Networking**: React Router DOM 7, Axios (Interceptors for Bearer Token)

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose (Multi-stage builds)
- **CI/CD Readiness**: Production-ready environment variable externalization

---

## 🐳 Quickstart with Docker Compose

Spin up the entire platform (Databases, Kafka, Redis, 7 Microservices, and Frontend) in **one command**:

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (v24.0+) & [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the repository
```bash
git clone https://github.com/sushmitha-katika-dev/build-flow.git
cd build-flow
```

### 2. Launch the entire cluster
```bash
docker compose up -d --build
```

### 3. Access the Application
- 🌐 **Web Application**: [http://localhost:5173](http://localhost:5173) (or `http://localhost:80` in production mode)
- 🛡️ **API Gateway**: [http://localhost:8080](http://localhost:8080)
- 📊 **Redis Cache**: `localhost:6379`
- ⚡ **Kafka Broker**: `localhost:9093`
- 🗄️ **MySQL Database**: `localhost:3307`

---

## 💻 Local Development Setup

If you prefer to run services individually for debugging:

### 1. Start Infrastructure Dependencies
```bash
# Starts MySQL, Kafka, Zookeeper, and Redis
docker compose up -d mysql zookeeper kafka redis
```

### 2. Start Backend Microservices
Run each service in `backend/` using Maven:
```bash
cd backend/<service-name>
./mvnw spring-boot:run
```
*(Recommended startup order: `auth-service` &rarr; `project-service` &rarr; `workforce-service` &rarr; `inventory-service` &rarr; `equipment-service` &rarr; `finance-service` &rarr; `reporting-service` &rarr; `api-gateway`)*

### 3. Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```

---

## 📑 API Documentation & Postman

A complete Postman collection covering all authentication, project, workforce, inventory, equipment, finance, and reporting endpoints is available in the repository:

- 📂 Postman Collection: [`docs/BuildFlow_Postman_Collection.json`](docs/BuildFlow_Postman_Collection.json)
- 📄 Comprehensive Project Walkthrough: [`docs/08_COMPLETE_PROJECT_WALKTHROUGH.md`](docs/08_COMPLETE_PROJECT_WALKTHROUGH.md)
- 📄 Architecture Specification: [`docs/03_ARCHITECTURE.md`](docs/03_ARCHITECTURE.md)
- 📄 Database Schemas: [`docs/04_DATABASE.md`](docs/04_DATABASE.md)

---

## 📂 Project Directory Structure

```text
build-flow/
├── docker-compose.yml            # Multi-container orchestration config
├── docs/                         # Architecture, schemas, API specifications & guides
│   ├── 03_ARCHITECTURE.md
│   ├── 04_DATABASE.md
│   ├── 05_API_CONTRACT.md
│   ├── 08_COMPLETE_PROJECT_WALKTHROUGH.md
│   └── BuildFlow_Postman_Collection.json
├── backend/                      # Spring Boot Microservices
│   ├── api-gateway/              # Spring Cloud Gateway (Port 8080)
│   ├── auth-service/             # Authentication & User Service (Port 8081)
│   ├── project-service/          # Construction Projects Service (Port 8082)
│   ├── workforce-service/        # Workforce & Attendance Service (Port 8083)
│   ├── inventory-service/        # Material & Inventory Service (Port 8084)
│   ├── equipment-service/        # Heavy Machinery Service (Port 8085)
│   ├── finance-service/          # Finance & Budgeting Service (Port 8086)
│   └── reporting-service/        # Executive Analytics & Redis Cache (Port 8087)
└── frontend/                     # React 19 + Vite + TypeScript SPA
    ├── src/
    │   ├── components/           # Reusable UI components & modals
    │   ├── context/              # Auth & Global state providers
    │   ├── pages/                # Projects, Workforce, Inventory, Finance, Analytics
    │   └── services/             # Axios API client instances
    └── package.json
```

---

## 👤 Author & Contact

**Sushmitha Katika**
- GitHub: [@sushmitha-katika-dev](https://github.com/sushmitha-katika-dev)
- Project Repository: [build-flow](https://github.com/sushmitha-katika-dev/build-flow)

---
*Built with passion for scalable distributed systems and modern web engineering.*
