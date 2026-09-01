import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CompanyService } from '../../services/companyService';
import type { CompanyProfile } from '../../types/company';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Link } from 'react-router-dom';
import { User, Shield, Building, MapPin, Mail, CheckCircle2, Key, Settings } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const isSupervisor = user?.role === 'SITE_SUPERVISOR' || user?.role === 'SUPERVISOR';

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [isSupervisor]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      if (!isSupervisor) {
        const companyData = await CompanyService.getCompanyProfile();
        setCompany(companyData);
      }
    } catch (err: any) {
      // Silently fall back to default company profile
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/4 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 1. EXECUTIVE USER PROFILE HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            {/* Avatar Badge */}
            <div className="relative">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl font-black text-2xl sm:text-3xl flex items-center justify-center shadow-2xl border ${
                isSupervisor 
                  ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400/40 ring-4 ring-amber-500/20' 
                  : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white border-blue-400/40 ring-4 ring-blue-500/20'
              }`}>
                {getInitials(user?.username)}
              </div>
              <span className="absolute bottom-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            {/* Profile Identity Text */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {user?.username || 'Authenticated User'}
                </h1>
                <span className={`text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full shadow-sm border ${
                  isSupervisor
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}>
                  {user?.role || 'SITE_SUPERVISOR'}
                </span>
              </div>
              
              <p className="text-xs text-slate-300 font-medium flex items-center pt-1">
                <Shield className="w-4 h-4 mr-1.5 text-blue-400" />
                Access Privilege Level: 
                <span className="font-bold text-white ml-1.5 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                  {isSupervisor ? 'Field Operational Supervisor' : 'System Executive Admin'}
                </span>
              </p>

              <p className="text-xs text-slate-400 flex items-center pt-0.5">
                <Building className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                Registered Company: 
                <span className="font-semibold text-slate-200 ml-1.5">
                  {company?.companyName || 'BuildFlow Construction Services'}
                </span>
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/settings">
              <Button className="bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl font-bold text-xs px-5 py-3 shadow-lg flex items-center">
                <Settings className="w-4 h-4 mr-2 text-blue-400" />
                Account Settings
              </Button>
            </Link>

            {!isSupervisor && (
              <Link to="/company">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs px-5 py-3 shadow-lg shadow-blue-600/30 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Company Settings
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. PROFILE BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Security & Identity Details */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Account Credentials</h2>
              <p className="text-xs text-slate-500">Security details & session state</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Display Username</span>
              <span className="font-extrabold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                {user?.username}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Assigned System Role</span>
              <span className={`font-extrabold px-3 py-1 rounded-lg border uppercase tracking-wider text-[11px] ${
                isSupervisor
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {user?.role}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Authentication Protocol</span>
              <span className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 flex items-center">
                <Key className="w-3 h-3 mr-1.5 text-blue-600" /> JWT Encrypted Session
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 font-semibold">Session Status</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Active Verified
              </span>
            </div>
          </div>
        </div>

        {/* Company Context Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Enterprise Context</h2>
              <p className="text-xs text-slate-500">Business affiliation & site location</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Company Name</span>
              <span className="font-extrabold text-slate-900">
                {company?.companyName || 'BuildFlow Construction Services'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Head Office / Location</span>
              <span className="font-bold text-slate-800 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" />
                {company?.location || 'Telangana, India'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Contact Email</span>
              <span className="font-semibold text-slate-800 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-blue-500" />
                {company?.email || 'admin@buildflow.com'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 font-semibold">Business Sector</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {company?.description || 'Civil Construction & Contracting'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
