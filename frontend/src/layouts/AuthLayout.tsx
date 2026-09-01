import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HardHat, 
  Building2, 
  Users, 
  Tractor, 
  IndianRupee, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If already logged in, redirect directly to executive dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP LANDING HEADER */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 text-white border border-white/20">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center">
              BuildFlow <span className="ml-1 text-xs font-bold text-blue-400">Enterprise</span>
            </h1>
            <p className="text-[10px] text-blue-200/80 font-bold uppercase tracking-widest">
              Contractor & Field Operations
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-xs font-bold text-slate-300">
          <span className="flex items-center text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> System Operational
          </span>
        </div>
      </header>

      {/* MAIN TWO-COLUMN SPLIT LANDING & AUTH SECTION */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
        
        {/* LEFT COLUMN: COMPANY & PROJECT LANDING OVERVIEW */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              INTEGRATED CONSTRUCTION PLATFORM
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Every Resource Tells a Story. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Every Project Has a Cost.
              </span>
            </h2>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              BuildFlow is an enterprise-grade construction management system unifying site supervisors, field workforce, heavy fleet machinery, inventory stock, and project financial ledgers in real-time.
            </p>
          </div>

          {/* KEY CAPABILITIES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                <Building2 className="w-4 h-4" />
                <span>Active Site Operations</span>
              </div>
              <p className="text-xs text-slate-400">
                Track site milestones, client contracts, and location logs seamlessly across all projects.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <Users className="w-4 h-4" />
                <span>Workforce & Attendance</span>
              </div>
              <p className="text-xs text-slate-400">
                Manage daily wage labourers, fixed contracts, monthly staff, and daily shift logs.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                <Tractor className="w-4 h-4" />
                <span>Fleet & Inventory Control</span>
              </div>
              <p className="text-xs text-slate-400">
                Monitor equipment operating hours, fuel receipts, and material stock transfers.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <IndianRupee className="w-4 h-4" />
                <span>Project Financial Ledger</span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time tracking of estimated budgets, actual costs, paid amounts, and outstanding balances.
              </p>
            </div>
          </div>

          {/* TRUST BADGE STRIP */}
          <div className="flex items-center space-x-6 text-xs text-slate-400 border-t border-white/10 pt-4">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Role-Based Passcode Security</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Project-Wise Analytics</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION FORM CARD */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white text-slate-900 shadow-2xl rounded-3xl p-6 sm:p-8 border border-white/20 relative z-10">
            <Outlet />
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} BuildFlow Enterprise Operations. All rights reserved.
      </footer>
    </div>
  );
};
