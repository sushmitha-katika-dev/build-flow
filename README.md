# 🏗️ BuildFlow

### Smart Construction Operations Platform

> A real-world microservices platform that digitizes construction projects, workforce, materials, equipment, expenses, and financial analytics in one system.

<p align="center">

`Java 21` • `Spring Boot 3` • `Spring Cloud` • `React 19` • `TypeScript` • `Kafka` • `Redis` • `MySQL` • `Docker`

</p>

<p align="center">

<a href="#-architecture">Architecture</a> • <a href="#-features">Features</a> • <a href="#-tech-stack">Tech Stack</a> • <a href="#-quick-start">Quick Start</a> • <a href="#-engineering-highlights">Engineering</a>

</p>

<p align="center">
  <img src="docs/images/buildflow_demo_walkthrough.webp" alt="BuildFlow Screen Recording & Live Demo Walkthrough" width="100%" />
  <br />
  <em>🎥 BuildFlow Complete Platform Screen Recording & Live End-to-End Walkthrough</em>
</p>

---

## 🎯 The Problem

Small construction businesses often manage **projects, workers, materials, equipment, expenses and payments** using WhatsApp, spreadsheets and handwritten records.

This makes it difficult to answer simple questions:

> **How much did this project actually cost?**  
> **How much material was consumed?**  
> **How much was spent on labour?**  
> **Is the project profitable?**

### 💡 The Solution

**BuildFlow connects daily site operations with financial and analytical data.**

```text
Site Operations
      ↓
Microservices
      ↓
Kafka Events
      ↓
Finance + Reporting
      ↓
Project Cost & Profitability
```

---

# 🏛️ Architecture

<p align="center">
  <img src="docs/images/buildflow-architecture.png"
       alt="BuildFlow Microservices Architecture"
       width="100%">
</p>

### Architecture at a Glance

```text
React 19
   ↓
Spring Cloud API Gateway
   ↓
7 Domain Microservices
   ↓
Database-per-Service
   ↓
Apache Kafka
   ↓
Finance + Reporting
   ↓
Redis
```

<details>
<summary><strong>🔍 View Detailed Architecture</strong></summary>

### System Components

| Component         | Responsibility                        |
| ----------------- | ------------------------------------- |
| React SPA         | User interface                        |
| API Gateway       | Routing, authentication, RBAC         |
| Auth Service      | Users, authentication & authorization |
| Project Service   | Projects, milestones & planning       |
| Workforce Service | Workers, attendance, shifts & wages   |
| Inventory Service | Materials, stock & consumption        |
| Equipment Service | Machinery, fuel & maintenance         |
| Finance Service   | Expenses, invoices & P&L              |
| Reporting Service | KPIs, analytics & dashboards          |
| Apache Kafka      | Asynchronous event communication      |
| Redis             | Reporting and dashboard caching       |
| MySQL             | Database per microservice             |

### Service Communication

```text
Client
  │
  ▼
API Gateway
  │
  ├── Auth Service
  ├── Project Service
  ├── Workforce Service
  ├── Inventory Service
  ├── Equipment Service
  ├── Finance Service
  └── Reporting Service

Workforce ───────┐
Inventory ───────┼──→ Kafka ──→ Finance
Equipment ───────┘          └──→ Reporting
                                  │
                                  ▼
                              Redis Cache
```

</details>

---

# ⚡ Features

|     | Capability         | What it does                               |
| --- | ------------------ | ------------------------------------------ |
| 🔐  | Authentication     | JWT-based authentication and RBAC          |
| 🏗️ | Project Management | Projects, milestones, clients and planning |
| 👷  | Workforce          | Workers, attendance, shifts and wages      |
| 📦  | Inventory          | Materials, stock and consumption tracking  |
| 🚜  | Equipment          | Machinery, fuel and maintenance tracking   |
| 💰  | Finance            | Expenses, invoices, payments and P&L       |
| 📊  | Reporting          | KPIs, analytics and dashboards             |

<details>
<summary><strong>🔍 View Detailed Features</strong></summary>

### 🔐 Authentication & Authorization

* JWT authentication
* Spring Security
* Role-based access control
* Protected API routes
* Centralized authentication through API Gateway

### 🏗️ Project Management

* Project creation and management
* Client information
* Project budgets
* Milestone tracking
* Project status management

### 👷 Workforce Management

* Worker management
* Daily attendance
* Shift tracking
* Wage calculation
* Supervisor management

### 📦 Inventory Management

* Cement tracking
* Steel tracking
* Material stock
* Material consumption
* Stock movement history
* Low-stock monitoring

### 🚜 Equipment Management

* Equipment registration
* Machinery usage
* Fuel tracking
* Maintenance records
* Equipment operating costs

### 💰 Finance Management

* Project expenses
* Labour expenses
* Material expenses
* Equipment expenses
* Client payments
* Invoices
* Project profitability
* P&L tracking

### 📊 Reporting & Analytics

* Project KPIs
* Budget vs actual cost
* Workforce analytics
* Material consumption analytics
* Equipment analytics
* Financial dashboards
* Redis-backed reporting cache

</details>

---

# 🔥 Key Business Flow

### From Daily Site Activity → Project Profitability

```text
┌───────────────┐
│ Site Activity │
└───────┬───────┘
        ↓
┌────────────────────┐
│ Domain Microservice│
└─────────┬──────────┘
          ↓
┌────────────────────┐
│   Apache Kafka     │
└───────┬───────┬────┘
        ↓       ↓
   Finance    Reporting
      ↓           ↓
  Expenses      KPIs
      ↓           ↓
      └─────┬─────┘
            ↓
      Project P&L
```

<details>
<summary><strong>🔍 View Event-Driven Workflows</strong></summary>

### Workforce → Finance

```text
Attendance
    ↓
Workforce Service
    ↓
attendance event
    ↓
Apache Kafka
    ↓
Finance Service
    ↓
Labour Expense
```

### Inventory → Finance

```text
Material Consumption
    ↓
Inventory Service
    ↓
inventory event
    ↓
Apache Kafka
    ↓
Finance Service
    ↓
Material Expense
```

### Equipment → Finance

```text
Equipment Usage / Fuel
    ↓
Equipment Service
    ↓
equipment event
    ↓
Apache Kafka
    ↓
Finance Service
    ↓
Equipment Expense
```

### Events → Reporting

```text
Operational Events
       ↓
Apache Kafka
       ↓
Reporting Service
       ↓
Redis Cache
       ↓
Dashboard KPIs
```

</details>

---

# 🧩 Microservices

| Service   |   Port | Database              |
| --------- | -----: | --------------------- |
| Auth      | `8081` | `buildflow_auth`      |
| Project   | `8082` | `buildflow_project`   |
| Workforce | `8083` | `buildflow_workforce` |
| Inventory | `8084` | `buildflow_inventory` |
| Equipment | `8085` | `buildflow_equipment` |
| Finance   | `8086` | `buildflow_finance`   |
| Reporting | `8087` | `buildflow_reporting` |

<details>
<summary><strong>🔍 View Service Responsibilities</strong></summary>

### Auth Service — `8081`

Authentication, user management, JWT generation and role-based authorization.

### Project Service — `8082`

Project lifecycle, clients, milestones, budgets and project planning.

### Workforce Service — `8083`

Workers, attendance, shifts, wages and supervisor management.

### Inventory Service — `8084`

Construction materials, stock levels, material consumption and stock logs.

### Equipment Service — `8085`

Machinery, fuel consumption, usage and maintenance tracking.

### Finance Service — `8086`

Expenses, invoices, client payments and project-level profit/loss.

### Reporting Service — `8087`

Aggregated analytics, KPIs, dashboards and cached reporting data.

</details>

---

# 🛠️ Tech Stack

### Backend

`Java 21` `Spring Boot 3` `Spring Cloud Gateway` `Spring Security` `JWT` `Spring Data JPA` `Hibernate`

### Frontend

`React 19` `TypeScript` `Vite` `Tailwind CSS` `React Router` `Axios` `Recharts` `Lucide React`

### Distributed Systems

`Apache Kafka` `Redis` `Zookeeper`

### Database

`MySQL 8`

### DevOps

`Docker` `Docker Compose` `Maven`

<details>
<summary><strong>🔍 View Technology Details</strong></summary>

| Layer         | Technology            | Purpose                          |
| ------------- | --------------------- | -------------------------------- |
| Frontend      | React 19              | SPA user interface               |
| Language      | TypeScript            | Type-safe frontend development   |
| Styling       | Tailwind CSS          | UI styling                       |
| API Client    | Axios                 | REST communication               |
| Backend       | Spring Boot 3         | Microservice development         |
| Gateway       | Spring Cloud Gateway  | Routing and centralized security |
| Security      | Spring Security + JWT | Authentication and authorization |
| Persistence   | Spring Data JPA       | Database access                  |
| Database      | MySQL 8               | Persistent service data          |
| Messaging     | Apache Kafka          | Event-driven communication       |
| Cache         | Redis                 | Fast analytics access            |
| Coordination  | Zookeeper             | Kafka coordination               |
| Containers    | Docker                | Service containerization         |
| Orchestration | Docker Compose        | Local multi-service deployment   |

</details>

---

# 🗄️ Database Architecture

```text
Auth Service       → buildflow_auth
Project Service    → buildflow_project
Workforce Service  → buildflow_workforce
Inventory Service  → buildflow_inventory
Equipment Service  → buildflow_equipment
Finance Service    → buildflow_finance
Reporting Service  → buildflow_reporting
```

<details>
<summary><strong>🔍 Why Database-per-Service?</strong></summary>

Each microservice owns its own database instead of sharing a single database.

This provides:

* Data isolation
* Independent service evolution
* Reduced coupling
* Clear domain ownership
* Better scalability
* Independent persistence boundaries

A service accesses its own data through its own repository layer rather than directly accessing another service's database.

</details>

---

# ⚡ Event-Driven Architecture

```text
Workforce ──────→ attendance events ────┐
                                       │
Inventory ──────→ inventory events ─────┼──→ Kafka
                                       │
Equipment ──────→ equipment events ─────┘
                                          │
                         ┌────────────────┴──────────────┐
                         ↓                               ↓
                      Finance                        Reporting
                         ↓                               ↓
                   Auto Expenses                    Analytics
                                                         ↓
                                                       Redis
```

<details>
<summary><strong>🔍 View Kafka Design</strong></summary>

Apache Kafka decouples operational services from downstream financial and reporting workflows.

Instead of forcing services to communicate synchronously for every operation, domain services publish events that consumers can process independently.

This allows BuildFlow to support:

* Asynchronous processing
* Loose coupling
* Event-driven workflows
* Scalable consumers
* Independent service evolution

</details>

---

# 🔐 Security

```text
React Client
     ↓
Bearer JWT
     ↓
API Gateway
     ↓
JWT Validation
     ↓
RBAC
     ↓
Protected Microservice
```

<details>
<summary><strong>🔍 View Security Architecture</strong></summary>

BuildFlow uses Spring Security and JWT-based authentication.

The API Gateway acts as the primary entry point for client requests and validates authentication before routing requests to protected backend services.

Role-based access control determines which operations are available to different users.

> Production secrets should be supplied through environment variables or a secrets manager rather than committed to the repository.

</details>

---

# 🐳 Quick Start

### Requirements

* Java 21
* Node.js
* Docker
* Docker Compose
* Git

### Clone

```bash
git clone https://github.com/sushmitha-katika-dev/build-flow.git

cd build-flow
```

### Start the Platform

```bash
docker compose up --build
```

### Services

```text
Frontend       → :5173
API Gateway    → :8080

Auth           → :8081
Project        → :8082
Workforce      → :8083
Inventory      → :8084
Equipment      → :8085
Finance        → :8086
Reporting      → :8087

Kafka          → :9093
Redis          → :6379
MySQL          → :3307
Zookeeper      → :2181
```

<details>
<summary><strong>🔍 View Development Setup</strong></summary>

Additional development and configuration instructions can be maintained here without making the main README difficult to scan.

</details>

---

# 🧠 Engineering Highlights

| Concept          | Implementation                     |
| ---------------- | ---------------------------------- |
| Microservices    | 7 independent Spring Boot services |
| API Gateway      | Spring Cloud Gateway               |
| Authentication   | JWT                                |
| Authorization    | RBAC                               |
| Messaging        | Apache Kafka                       |
| Caching          | Redis                              |
| Persistence      | Database-per-Service               |
| Containerization | Docker                             |
| Orchestration    | Docker Compose                     |
| Frontend         | React + TypeScript                 |
| Analytics        | Reporting Service + Redis          |

<details>
<summary><strong>🔍 View Advanced Engineering Details</strong></summary>

### Patterns Demonstrated

* Microservices Architecture
* API Gateway Pattern
* Database-per-Service Pattern
* Event-Driven Architecture
* Asynchronous Messaging
* Centralized Authentication
* Role-Based Access Control
* Caching
* Domain-based service separation
* Containerized deployment

### Reliability & Observability

The architecture can be extended with distributed tracing, centralized logging, health checks and resilience mechanisms as the platform moves toward production deployment.

</details>

---

# 📁 Project Structure

<details>
<summary><strong>📂 View Project Structure</strong></summary>

```text
build-flow/
│
├── frontend/
│
├── api-gateway/
│
├── auth-service/
├── project-service/
├── workforce-service/
├── inventory-service/
├── equipment-service/
├── finance-service/
├── reporting-service/
│
├── docker-compose.yml
│
└── docs/
    └── images/
        ├── buildflow-architecture.png
        └── buildflow_demo_walkthrough.webp
```

</details>

---

# 📈 Project Scope

<details>
<summary><strong>🚀 View Future Enhancements</strong></summary>

Potential extensions include:

* AI-assisted project cost prediction
* Advanced construction analytics
* Mobile/PWA site operations
* Automated alerts
* Advanced reporting
* Cloud deployment
* Centralized observability
* CI/CD automation

</details>

---

# 👩‍💻 Author

**Sushmitha Katika**

B.Tech — Information Technology

**Software Engineering • Backend Development • Full Stack Development • Distributed Systems**

---

<p align="center">

### 🏗️ From Site Operations → Data → Decisions

</p>
