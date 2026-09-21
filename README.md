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
  <img src="docs/assets/screenrecordings/buildflow_demo_walkthrough.webp" alt="BuildFlow Platform Screen Recording & Live Demo Walkthrough" width="100%" />
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

<details>
<summary><strong>🚀 Click to Expand Step-by-Step Installation & Execution Guide</strong></summary>

<br />

### 📋 Prerequisites
Ensure you have the following installed on your machine:
* **Java 21 JDK** (for local backend service execution)
* **Node.js 18+ & npm** (for frontend Vite SPA development)
* **Docker Desktop** (with Docker Compose enabled)
* **Git CLI**

---

### 1️⃣ Step 1: Clone the Repository
Open your terminal/command prompt and run:
```bash
git clone https://github.com/sushmitha-katika-dev/build-flow.git
cd build-flow
```

---

### 2️⃣ Step 2: Option A — Launch Entire Platform via Docker (Recommended)
Build and spin up all 13 containerized services (Frontend, API Gateway, 7 Spring Boot Microservices, MySQL, Kafka, Redis, Zookeeper) with a single command:

```bash
docker compose up --build
```

> **Note:** Allow 2-3 minutes on initial launch for Maven compilation and database migrations to complete.

---

### 3️⃣ Step 3: Option B — Run Manually in Local Development Mode

#### A. Start Core Infrastructure Containers (Databases & Messaging)
If running services manually, spin up only MySQL, Kafka, Zookeeper & Redis:
```bash
docker compose up buildflow-mysql buildflow-zookeeper buildflow-kafka buildflow-redis -d
```

#### B. Run Frontend SPA
```bash
cd frontend
npm install
npm run dev
```
The frontend web app will start on `http://localhost:5173`.

#### C. Run Spring Boot Microservices
Navigate into each microservice directory (`api-gateway`, `auth-service`, `project-service`, `workforce-service`, `inventory-service`, `equipment-service`, `finance-service`, `reporting-service`) and run:
```bash
./mvnw spring-boot:run
```

---

### 🌐 Microservice Ports & Endpoints

| Service | Port | Local Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Frontend Web App** | `5173` / `80` | `http://localhost:5173` | React 19 Single Page Application |
| **API Gateway** | `8080` | `http://localhost:8080` | Centralized REST Routing & Security Passcode |
| **Auth Service** | `8081` | `http://localhost:8081` | JWT Authentication & User Approval |
| **Project Service** | `8082` | `http://localhost:8082` | Projects, Locations & Budget Tracking |
| **Workforce Service** | `8083` | `http://localhost:8083` | Workers, Attendance & Daily Wages |
| **Inventory Service** | `8084` | `http://localhost:8084` | Stock Logs, Material Catalog & Consumption |
| **Equipment Service** | `8085` | `http://localhost:8085` | Machinery Fleet, Fuel & Maintenance |
| **Finance Service** | `8086` | `http://localhost:8086` | Expense Ledger & Project Profit/Loss |
| **Reporting Service** | `8087` | `http://localhost:8087` | Real-time Dashboard Analytics |
| **Apache Kafka** | `9093` | `localhost:9093` | Event Streaming Broker |
| **Redis Cache** | `6379` | `localhost:6379` | Analytics Materialized View Cache |
| **MySQL Database** | `3307` | `localhost:3307` | Database per Microservice Server |

---

### 🔑 Demo Login Credentials

* **Company Admin Login:**
  * **Email:** `admin@buildflow.com`
  * **Password:** `admin123`
  * **Company Admin Passcode:** `BF-ADMIN-2026`

* **Site Supervisor Login:**
  * **Email:** `supervisor@buildflow.com`
  * **Password:** `supervisor123`

---

### 🛑 Stopping the Containers
To stop all services cleanly:
```bash
docker compose down
```

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
