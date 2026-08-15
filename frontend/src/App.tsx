import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectDetailsPage } from './pages/projects/ProjectDetailsPage';
import { WorkforcePage } from './pages/workforce/WorkforcePage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { EquipmentPage } from './pages/equipment/EquipmentPage';
import { FinancePage } from './pages/finance/FinancePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public / Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/workforce" element={<WorkforcePage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/reports" element={<Navigate to="/" replace />} />
              <Route path="/settings" element={<div>Settings coming soon</div>} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
