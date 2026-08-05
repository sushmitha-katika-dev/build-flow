# Requirements Document

## Functional Requirements
- **Project Management:** Create and manage projects, monitor status, plan budgets, track actuals, compare budget vs. actual, analyze profitability.
- **Workforce Management:** Register labourers/employees, log daily attendance, calculate wages, handle supervisor salaries, project allocation, and labour cost analysis.
- **Material & Inventory:** Maintain material catalog, track cement/steel inventory by brand/type/diameter, track paint/sand/aggregates, log purchasing and consumption, and generate low-stock alerts.
- **Equipment Management:** Register tractors/equipment, allocate to projects, track fuel expenses, log maintenance, and monitor utilization.
- **Financial Management:** Track labour, material, equipment, and miscellaneous expenses, manage investments, and monitor overall P&L.
- **Dashboard & Reporting:** Provide active projects overview, daily operational summaries, investment analysis, cost analytics, stock status, and daily/monthly/custom filtered reports.

## Non Functional Requirements
- **Security:** Secure authentication via JWT and Role-Based Access Control (RBAC).
- **Performance:** Fast API response times and optimized dashboard loading via Redis caching.
- **Scalability:** Microservice architecture to allow independent scaling of high-traffic modules (e.g., Workforce Service).
- **Availability:** High availability achieved through containerized, resilient deployments.
- **Maintainability:** Document-first approach, adhering to SOLID principles and Clean Architecture.

## User Roles
1. **Admin / Business Owner:** Full system access to all modules, financial data, cross-project dashboards, and profitability reports.
2. **Project Manager:** Access to view and manage specific assigned projects, track project budgets, and view project-level resource allocation.
3. **Site Supervisor:** Access to mobile-friendly interfaces to mark daily attendance, log daily material consumption, and track local equipment usage.
4. **Store / Inventory Manager:** Access to material catalogs, inventory logs, purchase records, and low-stock alerts.

## User Stories
- **As an Admin**, I want to view a consolidated dashboard of all active projects so that I can monitor overall profitability and make informed business decisions.
- **As a Site Supervisor**, I want to mark the daily attendance of labourers quickly on my phone so that their wages are calculated accurately without paper records.
- **As a Store Manager**, I want to log incoming material deliveries and outflows so that the central stock levels are always up to date in real-time.
- **As a Project Manager**, I want to compare the estimated budget against actual expenditures so that I can detect budget overruns early.

## Acceptance Criteria
- **Dashboard Load Time:** The main analytics dashboard must load within 2 seconds using aggregated data from the Redis cache.
- **Attendance Validation:** The system must prevent marking attendance for the same labourer twice on the same day across different projects (unless explicitly allocated as a split shift).
- **Inventory Alerts:** The system must generate an automatic alert (via Notification Service) when critical stock items (like cement or steel) fall below their predefined minimum threshold.
- **API Security:** All backend endpoints (except `/auth/login`) must return a `401 Unauthorized` if a valid JWT is not provided.

## Out of Scope Features
- Integration with external banking or payment gateways for automated payroll disbursement.
- Real-time GPS tracking or IoT sensor integration for equipment/transport vehicles.
- Automated tax calculation for corporate accounting (the system tracks operational profit/loss only).
