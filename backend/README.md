# ⚙️ BuildFlow Backend — Distributed Microservices Ecosystem

> **BuildFlow Backend** is an event-driven, distributed microservices suite built with **Java 21**, **Spring Boot 3**, **Spring Cloud Gateway**, **Apache Kafka**, **Redis**, and **MySQL 8.0**.

---

## 🏛️ Microservice Catalog & Port Mapping

| Directory | Service Name | Port | Database | Primary Function |
| :--- | :--- | :---: | :--- | :--- |
| `api-gateway/` | **API Gateway** | `8080` | *Stateless* | Central routing, CORS handling, JWT authentication filter. |
| `auth-service/` | **Auth Service** | `8081` | `buildflow_auth` | User identity, RBAC (`ADMIN`, `SITE_SUPERVISOR`), JWT issuance. |
| `project-service/` | **Project Service** | `8082` | `buildflow_project` | Construction sites, milestone tracking, budget limits. |
| `workforce-service/`| **Workforce Service** | `8083` | `buildflow_workforce`| Worker profiles, shifts, clock-in attendance & wage calculations. |
| `inventory-service/`| **Inventory Service** | `8084` | `buildflow_inventory`| Raw material stocks, consumption logs, safety thresholds. |
| `equipment-service/`| **Equipment Service** | `8085` | `buildflow_equipment`| Machinery fleet, maintenance telemetry, operating hours & fuel. |
| `finance-service/`  | **Finance Service** | `8086` | `buildflow_finance`  | Expense logs, budget ledger, Kafka auto-expense consumer. |
| `reporting-service/`| **Reporting Service**| `8087` | `buildflow_reporting`| Analytics sink, Redis dashboard caching, metric aggregation. |

---

## ⚡ Asynchronous Event Streaming (Kafka)

| Topic | Producer Service | Consumer Service(s) | Payload / Purpose |
| :--- | :--- | :--- | :--- |
| `attendance.events` | `workforce-service` | `finance-service`, `reporting-service` | Worker shift completed & wage calculated &rarr; creates labor expense entry. |
| `inventory.events` | `inventory-service` | `finance-service`, `reporting-service` | Material consumed on site &rarr; creates material cost entry. |
| `equipment.events` | `equipment-service` | `finance-service`, `reporting-service` | Fuel / maintenance logged &rarr; creates operational expense entry. |

---

## 🚀 Running Backend Services

### Option A: Using Docker Compose (Recommended)
```bash
# In the root project directory:
docker compose up -d
```

### Option B: Local Maven Execution
1. Start infrastructure:
   ```bash
   docker compose up -d mysql zookeeper kafka redis
   ```
2. Run individual services:
   ```bash
   cd <service-folder>
   ./mvnw spring-boot:run
   ```

---
*Part of the [BuildFlow Enterprise Architecture](https://github.com/sushmitha-katika-dev/build-flow).*
