# Task Breakdown Document

This document tracks the high-level development tasks required to build the BuildFlow platform.

---

### Task ID: TSK-001
- **Description:** Initialize Spring Boot Authentication Service and configure JWT Security.
- **Priority:** High
- **Estimated Time:** 8 Hours
- **Dependencies:** None
- **Deliverables:** A running Spring Boot microservice connected to the Auth MySQL database.
- **Definition of Done:** Code committed, unit tests passing, `/api/v1/auth/login` successfully authenticates a user and returns a valid JWT token.

---

### Task ID: TSK-002
- **Description:** Initialize React.js Frontend, configure React Router, and set up Redux state management.
- **Priority:** High
- **Estimated Time:** 6 Hours
- **Dependencies:** None
- **Deliverables:** Base React application scaffolded with the Login Screen UI.
- **Definition of Done:** React app compiles without warnings, Login UI renders, and Redux is configured to store the JWT token upon successful login.

---

### Task ID: TSK-003
- **Description:** Build the Project Management Microservice and implement core CRUD REST APIs.
- **Priority:** High
- **Estimated Time:** 12 Hours
- **Dependencies:** TSK-001 (Requires JWT validation for role-based access).
- **Deliverables:** REST endpoints for creating, retrieving, and updating projects. Project Database schema initialized.
- **Definition of Done:** Endpoints match the API contract in Phase 6, MySQL schema matches Phase 5, and all endpoints return correct Status Codes.

---

### Task ID: TSK-004
- **Description:** Set up Apache Kafka and the Notification Service.
- **Priority:** Medium
- **Estimated Time:** 8 Hours
- **Dependencies:** TSK-003 (Needs a service to produce events).
- **Deliverables:** Kafka broker running, Notification Service listening to topics (e.g., `project-created-topic`).
- **Definition of Done:** Producing a test event successfully triggers a log/email in the Notification service.

---

### Task ID: TSK-005
- **Description:** Develop the React Main Dashboard Layout (Navbar, Sidebar, Grid).
- **Priority:** Medium
- **Estimated Time:** 10 Hours
- **Dependencies:** TSK-002
- **Deliverables:** Responsive dashboard UI with navigation links to empty module pages.
- **Definition of Done:** Sidebar navigation correctly routes the user to different placeholder pages without full page reloads.

---

*(Note: Additional tasks for Workforce, Inventory, Equipment, and Finance modules will be appended here iteratively as the project progresses).*
