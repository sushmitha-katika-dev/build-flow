import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Dummy Dashboard for now until we build the Dashboard module
const DummyDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
    <p className="text-gray-600">Welcome to the BuildFlow operations platform!</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public / Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DummyDashboard />} />
              <Route path="/projects" element={<div>Projects coming soon</div>} />
              <Route path="/workforce" element={<div>Workforce coming soon</div>} />
              <Route path="/inventory" element={<div>Inventory coming soon</div>} />
              <Route path="/equipment" element={<div>Equipment coming soon</div>} />
              <Route path="/finance" element={<div>Finance coming soon</div>} />
              <Route path="/reports" element={<div>Reports coming soon</div>} />
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
