import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HardHat } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If already logged in, don't show login page, go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-3">
          <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 text-white border border-blue-400/30">
            <HardHat className="w-10 h-10" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-white tracking-tight">
          BuildFlow
        </h1>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-[11px] font-black uppercase tracking-widest mt-2">
          FROM WORK TO WORTH
        </div>

        <p className="mt-3 text-xs text-blue-200/80 max-w-xs mx-auto italic font-medium leading-relaxed">
          "Every resource tells a story. Every project has a cost."
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
