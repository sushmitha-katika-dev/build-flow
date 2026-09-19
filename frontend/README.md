# 🖥️ BuildFlow Frontend — React & TypeScript Web Client

> **BuildFlow Web App** is a modern, responsive Single Page Application (SPA) built with **React 19**, **TypeScript**, **Vite**, and styled with **Tailwind CSS**. It serves as the unified dashboard interface for construction site supervisors, project managers, and executives.

---

## 🚀 Key Frontend Features

- **🔐 Auth & Security**: JWT-based stateful session management, automatic redirect guards, and Role-Based Access Control (RBAC) UI views (`ADMIN` vs `SITE_SUPERVISOR`).
- **📊 Real-time Executive Dashboard**: Interactive financial burn-down, budget variance, and resource utilization charts powered by **Recharts**.
- **🏗️ Construction Project Control**: Milestone tracker, stage transitions, and dynamic financial cost-breakdown breakdown filters.
- **👷 Workforce Management**: Worker rosters, skill tags, shift assignments, and real-time attendance clock-in with wage previews.
- **📦 Inventory & Equipment Hub**: Visual low-stock alert badges, consumption entry modal, machinery runtime telemetry, and maintenance schedules.
- **⚡ Fast Network Layer**: Axios client configured with automatic request/response interceptors for Bearer JWT injection and centralized 401/403 error handling.

---

## 🛠️ Tech Stack & Libraries

- **Core**: React 19, TypeScript 5.x, Vite 8
- **Styling**: Tailwind CSS 3.4, PostCSS, Lucide React (Icons)
- **Charts & Visualizations**: Recharts
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios

---

## 📦 Getting Started

### 1. Prerequisites
Ensure [Node.js](https://nodejs.org/) (v18+ or v20+ recommended) is installed.

### 2. Installation
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install
```

### 3. Environment Variables
Create or verify the `.env` file in the `frontend` root:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 4. Running Locally
```bash
# Start development server with Hot Module Replacement (HMR)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
# Type check and build optimized static bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Architecture & Directory Structure

```text
frontend/src/
├── assets/          # Static logos, illustrations, and styling assets
├── components/      # Reusable UI components (Navbar, Sidebar, Modals, Badges)
│   ├── common/      # Generic Buttons, Inputs, Cards, Alert Banners
│   └── layout/      # AppLayout, Navigation Guards
├── context/         # React Contexts (AuthContext, ThemeContext)
├── pages/           # Route views
│   ├── auth/        # Login & Register with secret passcode verification
│   ├── dashboard/   # Analytics & KPI Overview
│   ├── projects/    # Project creation, status filters, and budget details
│   ├── workforce/   # Worker registry, shift logs, and wage calculations
│   ├── inventory/   # Stock levels, material requisitions, and threshold alerts
│   ├── equipment/   # Machinery fleet telemetry and maintenance schedules
│   └── finance/     # Expense ledgers and budget vs actual variance
├── services/        # Axios API service instances configured for Gateway endpoints
└── types/           # TypeScript interfaces, enums, and data models
```

---
*Part of the [BuildFlow Enterprise Architecture](https://github.com/sushmitha-katika-dev/build-flow).*
