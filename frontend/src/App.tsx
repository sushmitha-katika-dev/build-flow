import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Dummy Dashboard for now until we build the ApplicationLayout
const DummyDashboard = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
    <p>Welcome to BuildFlow!</p>
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
            <Route path="/" element={<DummyDashboard />} />
            {/* Future routes will go here under a MainLayout */}
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
