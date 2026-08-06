# API Contract

This document defines the core REST API endpoints for the BuildFlow Microservices. Following the ADF standards, no backend implementation will begin before these contracts are approved.

---

## 1. Authentication Service

### Login User
- **Endpoint:** `/api/v1/auth/login`
- **HTTP Method:** `POST`
- **Description:** Authenticates a user and returns a JWT.
- **Authentication:** None (Public)
- **Request Body:** Required (See Sample JSON)
- **Query Parameters:** None
- **Path Variables:** None
- **Success Response:** Returns a JWT token and user role.
- **Error Response:** Returns an error message for invalid credentials.
- **Validation Rules:** `username` (Not Null, Not Empty), `password` (Not Null, Not Empty).
- **Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`
- **Sample JSON:**
  *Request:*
  ```json
  {
    "username": "admin_user",
    "password": "securepassword123"
  }
  ```
  *Response (Success):*
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "role": "ADMIN",
    "expires_in": 3600
  }
  ```

---

## 2. Project Management Service

### Create a New Project
- **Endpoint:** `/api/v1/projects`
- **HTTP Method:** `POST`
- **Description:** Creates a new construction project.
- **Authentication:** Required (Bearer JWT), Roles: `ADMIN`, `PROJECT_MANAGER`
- **Request Body:** Required (See Sample JSON)
- **Query Parameters:** None
- **Path Variables:** None
- **Success Response:** Returns the created project object with ID.
- **Error Response:** Returns an error message if privileges are insufficient or data is invalid.
- **Validation Rules:** `name` (Not Null, Length 3-100), `estimated_budget` (Minimum 0, Not Null).
- **Status Codes:** `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`
- **Sample JSON:**
  *Request:*
  ```json
  {
    "name": "Downtown Highrise",
    "client_name": "Apex Corp",
    "manager_id": 101,
    "supervisor_id": 205,
    "start_date": "2026-09-01",
    "estimated_budget": 5000000.00
  }
  ```
  *Response (Success):*
  ```json
  {
    "id": 1,
    "name": "Downtown Highrise",
    "status": "ACTIVE",
    "message": "Project created successfully"
  }
  ```

### Get Project Details
- **Endpoint:** `/api/v1/projects/{id}`
- **HTTP Method:** `GET`
- **Description:** Retrieves details of a specific project.
- **Authentication:** Required (Bearer JWT)
- **Request Body:** None
- **Query Parameters:** None
- **Path Variables:** `id` (Integer) - The unique ID of the project.
- **Success Response:** Returns the project details.
- **Error Response:** Returns 404 if the project ID does not exist.
- **Validation Rules:** `id` must be a positive integer.
- **Status Codes:** `200 OK`, `401 Unauthorized`, `404 Not Found`
- **Sample JSON:**
  *Response (Success):*
  ```json
  {
    "id": 1,
    "name": "Downtown Highrise",
    "client_name": "Apex Corp",
    "manager_id": 101,
    "supervisor_id": 205,
    "estimated_budget": 5000000.00,
    "status": "ACTIVE"
  }
  ```

---

## 3. Workforce Management Service

### Log Daily Attendance
- **Endpoint:** `/api/v1/workforce/attendance`
- **HTTP Method:** `POST`
- **Description:** Logs the daily attendance for a labourer on a specific project.
- **Authentication:** Required (Bearer JWT), Roles: `ADMIN`, `SUPERVISOR`
- **Request Body:** Required (See Sample JSON)
- **Query Parameters:** None
- **Path Variables:** None
- **Success Response:** Returns the recorded attendance and calculated wage.
- **Error Response:** Returns a conflict error if attendance is already logged today.
- **Validation Rules:** `labourer_id` (Not Null), `project_id` (Not Null), `status` (Must be PRESENT, ABSENT, or HALF_DAY).
- **Status Codes:** `201 Created`, `400 Bad Request`, `401 Unauthorized`, `409 Conflict`
- **Sample JSON:**
  *Request:*
  ```json
  {
    "labourer_id": 501,
    "project_id": 1,
    "record_date": "2026-08-06",
    "status": "PRESENT"
  }
  ```
  *Response (Success):*
  ```json
  {
    "id": 1050,
    "calculated_wage": 850.00,
    "message": "Attendance logged successfully"
  }
  ```
