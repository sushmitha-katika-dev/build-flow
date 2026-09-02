# Database Design Document

## ER Diagram
BuildFlow utilizes a Database-per-Service architecture. The logical relationships between distributed entities across microservice schemas are visualized below. Notice that `USER` (in `buildflow_auth`) logically references `PROJECT` assignments, `MATERIAL_TRANSACTIONS`, and supervisor registrations.

```mermaid
erDiagram
    %% Auth Service DB (buildflow_auth)
    USER {
        int id PK
        string username
        string email
        string password_hash
        string role
        string status
        timestamp created_at
    }

    %% Project Service DB (buildflow_project)
    PROJECT {
        int id PK
        string name
        string client_name
        int manager_id FK
        int supervisor_id FK
        date start_date
        date end_date
        decimal estimated_budget
        string status
    }

    %% Workforce Service DB (buildflow_workforce)
    LABOURER {
        int id PK
        string name
        string skill_type
        decimal daily_wage
        string compensation_type
    }
    ATTENDANCE {
        int id PK
        int labourer_id FK
        int project_id FK
        date record_date
        string status
        decimal calculated_wage
    }

    %% Inventory Service DB (buildflow_inventory)
    MATERIAL {
        int id PK
        string name
        string category
        string unit
        string status
    }
    STOCK {
        int id PK
        int material_id FK
        decimal total_quantity
    }
    MATERIAL_TRANSACTION {
        int id PK
        int material_id FK
        int project_id FK
        int logged_by_user_id FK
        string transaction_type
        decimal quantity
        decimal unit_price
        date transaction_date
    }

    %% Equipment Service DB (buildflow_equipment)
    EQUIPMENT {
        int id PK
        string name
        string equipment_type
        string ownership_type
        decimal unit_rate
        string rate_type
        int total_quantity
        int available_quantity
        string status
    }
    EQUIPMENT_ALLOCATION {
        int id PK
        int equipment_id FK
        int project_id FK
        date start_date
        date end_date
    }
    EQUIPMENT_USAGE_RECORD {
        int id PK
        int equipment_id FK
        int project_id FK
        decimal hours_used
        decimal applied_unit_rate
        decimal total_cost
        date usage_date
    }

    %% Finance Service DB (buildflow_finance)
    EXPENSE {
        int id PK
        int project_id FK
        string category
        decimal amount
        date expense_date
        string reference_id
    }
    PROJECT_BUDGET {
        int id PK
        int project_id FK
        decimal estimated_budget
        decimal actual_expenses
        decimal amount_paid
        decimal outstanding_amount
        decimal remaining_budget
    }

    %% Relationships
    USER ||--o{ PROJECT : "manages / supervises"
    USER ||--o{ MATERIAL_TRANSACTION : "logs"

    PROJECT ||--o{ ATTENDANCE : "has"
    LABOURER ||--o{ ATTENDANCE : "logs"
    
    PROJECT ||--o{ MATERIAL_TRANSACTION : "consumes"
    MATERIAL ||--o{ MATERIAL_TRANSACTION : "involved_in"
    MATERIAL ||--|| STOCK : "tracks"

    PROJECT ||--o{ EQUIPMENT_ALLOCATION : "uses"
    EQUIPMENT ||--o{ EQUIPMENT_ALLOCATION : "allocated_to"
    EQUIPMENT ||--o{ EQUIPMENT_USAGE_RECORD : "consumes"
    PROJECT ||--o{ EQUIPMENT_USAGE_RECORD : "charged_to"

    PROJECT ||--o{ EXPENSE : "incurs"
    PROJECT ||--|| PROJECT_BUDGET : "tracks_financials"
```

## MySQL Schema Definition Across Microservice Databases

```sql
-- 1. Auth Service Database (buildflow_auth)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'APPROVED', -- 'APPROVED', 'PENDING_APPROVAL', 'REJECTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Project Service Database (buildflow_project)
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    manager_id BIGINT,
    supervisor_id BIGINT,
    start_date DATE,
    end_date DATE,
    estimated_budget DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED' -- 'PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
);

-- 3. Workforce Service Database (buildflow_workforce)
CREATE TABLE labourers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    skill_type VARCHAR(50) NOT NULL,
    compensation_type VARCHAR(30) DEFAULT 'DAILY', -- 'DAILY', 'FIXED_WORK', 'MONTHLY'
    daily_wage DECIMAL(10, 2) NOT NULL
);

CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    labourer_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'PRESENT', 'ABSENT', 'HALF_DAY'
    calculated_wage DECIMAL(10, 2) NOT NULL
);

-- 4. Inventory Service Database (buildflow_inventory)
CREATE TABLE materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'CEMENT', 'STEEL', 'PAINT', 'SAND', 'AGGREGATE', etc.
    unit VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_id BIGINT NOT NULL UNIQUE,
    total_quantity DECIMAL(15, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE material_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL, -- '0' represents Company Stock-In
    logged_by_user_id BIGINT,
    transaction_type VARCHAR(10) NOT NULL, -- 'IN' or 'OUT'
    quantity DECIMAL(15, 2) NOT NULL,
    unit_price DECIMAL(10, 2),
    transaction_date DATE NOT NULL
);

-- 5. Equipment Service Database (buildflow_equipment)
CREATE TABLE equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(50) NOT NULL, -- 'HEAVY_MACHINERY', 'VEHICLES', 'LIGHT_EQUIPMENT', etc.
    ownership_type VARCHAR(20) DEFAULT 'OWNED', -- 'OWNED' or 'RENTED'
    unit_rate DECIMAL(10, 2) NOT NULL,
    rate_type VARCHAR(20) DEFAULT 'HOURLY', -- 'HOURLY' or 'DAILY'
    total_quantity INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    status VARCHAR(30) DEFAULT 'AVAILABLE' -- 'AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE'
);

CREATE TABLE equipment_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE
);

CREATE TABLE equipment_usage_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    hours_used DECIMAL(10, 2) NOT NULL,
    applied_unit_rate DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    usage_date DATE NOT NULL
);

-- 6. Finance Service Database (buildflow_finance)
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'WORKFORCE', 'MATERIAL', 'EQUIPMENT', 'MISC'
    amount DECIMAL(15, 2) NOT NULL,
    expense_date DATE NOT NULL,
    reference_id VARCHAR(100) UNIQUE -- Idempotency Key (e.g. 'ATT-101', 'INV-MAT-45')
);

CREATE TABLE project_budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL UNIQUE,
    estimated_budget DECIMAL(15, 2) NOT NULL,
    actual_expenses DECIMAL(15, 2) DEFAULT 0.00,
    amount_paid DECIMAL(15, 2) DEFAULT 0.00,
    outstanding_amount DECIMAL(15, 2) DEFAULT 0.00,
    remaining_budget DECIMAL(15, 2) DEFAULT 0.00
);
```

## Constraints & Indexes
- **Unique Constraints:** `users.username`, `users.email`, `stock.material_id`, `expenses.reference_id`, and `project_budgets.project_id`.
- **Indexes:**
  - `idx_users_username` on `users(username)` for login optimization.
  - `idx_users_status` on `users(status)` for supervisor approval queries.
  - `idx_expenses_reference` on `expenses(reference_id)` for Kafka idempotency verification.
  - `idx_attendance_date` on `attendance(project_id, record_date)` for fast wage aggregations.
