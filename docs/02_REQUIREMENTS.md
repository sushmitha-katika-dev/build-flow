# Requirements Document

## Functional Requirements
- **Project Management:** Create and manage projects, monitor status (`PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`), plan estimated budgets, track actual costs, analyze profit/loss, and auto-close equipment assignments upon project completion.
- **Workforce Management:** Onboard labourers (Daily Wage, Fixed Work Agreement, Monthly Staff), log daily attendance, calculate wages, process partial/full wage payments, track supervisor allocations, and prevent double-counting payments as new expenses.
- **Material & Inventory Management:** Dynamic material catalog (Cement, Steel, Paint, Sand, Aggregates, Bricks, Tiles, Electrical, Plumbing, Carpentry, General), log company stock-in (`projectId = 0`), log project consumption at Weighted Average Cost (WAC), generate low-stock alerts, and auto-create `MATERIAL` expenses in Finance.
- **Equipment Management:** Equipment registry (JCB Excavator, Tractors, Mixers, Scaffolding), assign equipment to active projects, track usage hours (`HOURLY` vs `DAILY` rates), log fuel expenses, schedule maintenance, and enforce conflict protection for `IN_USE` machinery.
- **Financial Management:** Consolidate labour, material, equipment, and miscellaneous expenses, manage payments vs outstanding balances, track investment allocations, and provide project-wise budget utilization ledgers.
- **Dashboard & Reporting:** Executive Command Center dashboard for Admins (hero counters, KPI cards, quick launch bar, and segmented workspace drawer) and specialized Site Dashboard for Supervisors.
- **Company Security Control:** Dynamic Admin Access Passcode management (`BF-ADMIN-2026`), copy key utility, and inline passcode generator/editor.

## Non-Functional Requirements
- **Security:** Secure authentication via JWT, Role-Based Access Control (RBAC), Admin Security Passcode verification during registration, and Supervisor Registration Approval Workflow.
- **Performance:** Fast API response times and optimized dashboard loading via Redis caching.
- **Scalability:** Microservice database-per-service architecture allowing independent scaling.
- **Data Integrity:** Idempotent Kafka event handling using transaction reference IDs (`EQUIPMENT-USAGE-{id}`, `ATT-{id}`, `INV-MAT-{id}`) to prevent duplicate cost accounting.
- **Maintainability:** Document-first approach, SOLID principles, and layered Spring Boot architecture.

## User Roles & Privileges
1. **Admin / Business Owner:** Full system access across all microservices, company financial ledgers, supervisor registration approval authority, user deletion rights, and Company Admin Passcode control.
2. **Project Manager:** Access to view and manage assigned projects, track project budgets against actual expenses, and oversee resource allocation.
3. **Site Supervisor:** Dedicated mobile-responsive field dashboard (`SupervisorDashboardPage`) to log daily labour attendance, material consumption, and equipment usage. Accounts default to `PENDING_APPROVAL` status upon self-registration and must be approved by an Admin before login is granted.
4. **Finance & Inventory Managers:** Access to material stock catalogs, inventory transactions, wage payments, and consolidated profit/loss ledgers.

## User Stories
- **As an Admin**, I want to view a consolidated executive command center dashboard so that I can monitor active projects, workforce counts, fleet availability, and financial utilization in real-time.
- **As an Admin**, I want to enforce a Company Security Passcode for Admin/Manager registrations and approve Site Supervisor accounts so that unauthorized outsiders cannot access company data.
- **As a Site Supervisor**, I want to mark daily attendance and log material usage quickly on my mobile phone so that labor wages and stock levels update automatically.
- **As a Store Manager**, I want company stock-in (`projectId = 0`) to increase inventory without charging project budgets, and project consumption to charge projects at Weighted Average Cost (WAC).
- **As a Project Manager**, I want to view project budget vs actual expenses so that I can detect cost overruns early.

## Acceptance Criteria
- **Admin Registration Security:** Registration for `ADMIN`, `CONTRACTOR`, `PROJECT_MANAGER`, or `FINANCE_MANAGER` roles must fail with HTTP `400 Bad Request` if the provided `adminSecretCode` does not match the active company passcode (`BF-ADMIN-2026`).
- **Supervisor Approval Enforcement:** Registration for `SITE_SUPERVISOR` defaults to `PENDING_APPROVAL`. Login attempts for pending or rejected supervisors must return HTTP `401 Unauthorized` (`"Account pending admin approval"`).
- **Dashboard Load Time:** Analytics dashboard must load within 2 seconds using cached metrics from Redis.
- **Attendance Validation:** System must prevent duplicate attendance logs for the same labourer on the same date for a project.
- **Closed Project Protection:** Operations (attendance, material consumption, equipment assignment, wage payments) on `COMPLETED` or `CANCELLED` projects must be rejected by backend controllers.
- **API Security:** All protected backend endpoints must return `401 Unauthorized` when a valid Bearer JWT is not provided.

## Out of Scope Features
- Direct integration with external banking APIs for automated wire transfers.
- Real-time IoT GPS hardware sensor tracking on transport vehicles.
- Automated corporate tax calculation (system tracks internal operational P&L only).
