import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

import { DashboardRouter } from './pages/dashboard/DashboardRouter';
import { SupervisorDashboardPage } from './pages/supervisor/SupervisorDashboardPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectDetailsPage } from './pages/projects/ProjectDetailsPage';
import { WorkforcePage } from './pages/workforce/WorkforcePage';
import { WorkerHistoryPage } from './pages/workforce/WorkerHistoryPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { EquipmentPage } from './pages/equipment/EquipmentPage';
import { FinancePage } from './pages/finance/FinancePage';
import { CompanyPage } from './pages/company/CompanyPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ProfilePage } from './pages/profile/ProfilePage';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
              <Route path="/" element={<DashboardRouter />} />
              <Route path="/supervisor" element={<SupervisorDashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/workforce" element={<WorkforcePage />} />
              <Route path="/workforce/:id/history" element={<WorkerHistoryPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/company" element={<CompanyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/reports" element={<Navigate to="/" replace />} />
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
