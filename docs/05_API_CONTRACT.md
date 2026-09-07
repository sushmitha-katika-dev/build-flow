# API Contract

This document defines the core REST API endpoints for the BuildFlow Microservices. Following the ADF standards, all endpoints are routed through the API Gateway (`:8080`).

---

## 1. Authentication & User Service (`:8081`)

### 1.1 Register User
- **Endpoint:** `/api/v1/auth/register`
- **HTTP Method:** `POST`
- **Description:** Registers a new user. Registrations for Admin/Executive roles (`ADMIN`, `CONTRACTOR`, `PROJECT_MANAGER`, `FINANCE_MANAGER`) require a valid `adminSecretCode`. Site Supervisors register in `PENDING_APPROVAL` status.
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "username": "admin_user",
    "email": "admin@buildflow.com",
    "password": "securepassword123",
    "role": "ADMIN",
    "adminSecretCode": "BF-ADMIN-2026"
  }
  ```
- **Response (Success 201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "username": "admin_user",
    "role": "ADMIN"
  }
  ```

### 1.2 Login User
- **Endpoint:** `/api/v1/auth/login`
- **HTTP Method:** `POST`
- **Description:** Authenticates a user and returns a JWT. Returns HTTP 401 if account is `PENDING_APPROVAL` or `REJECTED`.
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "username": "katam",
    "password": "katampassword"
  }
  ```
- **Response (Success 200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "username": "katam",
    "role": "SITE_SUPERVISOR"
  }
  ```

### 1.3 Get All Registered Users
- **Endpoint:** `/api/v1/auth/users`
- **HTTP Method:** `GET`
- **Description:** Retrieves all registered users, their roles, and approval statuses.
- **Authentication:** Required (Bearer JWT), Roles: `ADMIN`
- **Response (Success 200 OK):**
  ```json
  [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@buildflow.com",
      "role": "ADMIN",
      "status": "APPROVED"
    },
    {
      "id": 2,
      "username": "katam",
      "email": "katam@buildflow.com",
      "role": "SITE_SUPERVISOR",
      "status": "PENDING_APPROVAL"
    }
  ]
  ```

### 1.4 Update User Status (Supervisor Approval)
- **Endpoint:** `/api/v1/auth/users/{id}/status`
- **HTTP Method:** `PUT`
- **Query Parameters:** `status` (`APPROVED` or `REJECTED`)
- **Authentication:** Required (Bearer JWT), Roles: `ADMIN`
- **Response (Success 200 OK):**
  ```json
  {
    "id": 2,
    "username": "katam",
    "status": "APPROVED"
  }
  ```

### 1.5 Get Active Admin Access Passcode
- **Endpoint:** `/api/v1/auth/admin-passcode`
- **HTTP Method:** `GET`
- **Description:** Retrieves the active secret passcode required for admin self-registration.
- **Authentication:** Required (Bearer JWT), Roles: `ADMIN`
- **Response (Success 200 OK):**
  ```json
  {
    "passcode": "BF-ADMIN-2026"
  }
  ```

### 1.6 Update Active Admin Access Passcode
- **Endpoint:** `/api/v1/auth/admin-passcode`
- **HTTP Method:** `POST`
- **Request Body:**
  ```json
  {
    "passcode": "MY-NEW-SECRET-2026"
  }
  ```
- **Response (Success 200 OK):**
  ```json
  {
    "passcode": "MY-NEW-SECRET-2026"
  }
  ```

---

## 2. Project Management Service (`:8082`)

### 2.1 Get All Projects
- **Endpoint:** `/api/v1/projects`
- **HTTP Method:** `GET`
- **Authentication:** Required (Bearer JWT)

### 2.2 Create Project
- **Endpoint:** `/api/v1/projects`
- **HTTP Method:** `POST`
- **Request Body:**
  ```json
  {
    "projectName": "Kesaram Farm House",
    "clientName": "Srikanth Reddy",
    "location": "Kesaram Village",
    "estimatedBudget": 5000000.00
  }
  ```

### 2.3 Update Project Status
- **Endpoint:** `/api/v1/projects/{id}/status`
- **HTTP Method:** `PATCH`
- **Query Parameters:** `status` (`PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`)

---

## 3. Workforce Management Service (`:8083`)

### 3.1 Log Daily Attendance
- **Endpoint:** `/api/v1/workforce/attendance`
- **HTTP Method:** `POST`
- **Request Body:**
  ```json
  {
    "labourerId": 1,
    "projectId": 2,
    "recordDate": "2026-09-01",
    "status": "PRESENT"
  }
  ```

### 3.2 Process Wage Payment
- **Endpoint:** `/api/v1/workforce/payments`
- **HTTP Method:** `POST`
- **Request Body:**
  ```json
  {
    "labourerId": 1,
    "projectId": 2,
    "amountPaid": 20000.00,
    "paymentDate": "2026-09-01"
  }
  ```

---

## 4. Material & Inventory Service (`:8084`)

### 4.1 Company Stock-In (`projectId = 0`)
- **Endpoint:** `/api/v1/inventory/transactions`
- **HTTP Method:** `POST`
- **Request Body:**
  ```json
  {
    "materialId": 1,
    "projectId": 0,
    "transactionType": "IN",
    "quantity": 100.0,
    "unitPrice": 450.00,
    "transactionDate": "2026-09-01"
  }
  ```

### 4.2 Project Stock Consumption
- **Endpoint:** `/api/v1/inventory/transactions`
- **HTTP Method:** `POST`
- **Request Body:**
  ```json
  {
    "materialId": 1,
    "projectId": 2,
    "transactionType": "OUT",
    "quantity": 40.0,
    "transactionDate": "2026-09-01"
  }
  ```

---

## 5. Equipment Management Service (`:8085`)

### 5.1 Assign Equipment
- **Endpoint:** `/api/v1/equipment/{id}/assignments`
- **HTTP Method:** `POST`

### 5.2 Record Equipment Usage
- **Endpoint:** `/api/v1/equipment/usage`
- **HTTP Method:** `POST`
- **Request Body:**
  ```json
  {
    "equipmentId": 1,
    "projectId": 2,
    "hoursUsed": 8.0,
    "usageDate": "2026-09-01"
  }
  ```

---

## 6. Finance Management Service (`:8086`)

### 6.1 Get Project Financial Budget Ledger
- **Endpoint:** `/api/v1/finance/budgets/project/{projectId}`
- **HTTP Method:** `GET`
- **Response:**
  ```json
  {
    "projectId": 2,
    "estimatedBudget": 5000000.00,
    "actualExpenses": 72800.00,
    "amountPaid": 20000.00,
    "outstandingAmount": 52800.00,
    "remainingBudget": 4927200.00
  }
  ```
