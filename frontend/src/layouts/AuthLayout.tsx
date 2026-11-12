import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from '../components/auth/BrandMark';

/**
 * Centered minimal shell for authentication views (/login, /register).
 */
export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] dark:bg-slate-950">
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-amber-500"
          role="status"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-[#F7F7F5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-8 sm:px-6 antialiased"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(15, 23, 42, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div aria-hidden="true" className="h-4" />

      <main className="w-full max-w-[420px] mx-auto my-auto flex flex-col items-center">
        <div className="mb-7">
          <BrandMark />
        </div>

        <section
          aria-label="Authentication"
          className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-t-2 border-t-amber-600 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-8px_rgba(15,23,42,0.08)] p-6 sm:p-8"
        >
          <Outlet />
        </section>
      </main>

      <footer className="pt-8 pb-2 text-center text-xs text-slate-500 dark:text-slate-500">
        © {new Date().getFullYear()} BuildFlow
      </footer>
    </div>
  );
};
