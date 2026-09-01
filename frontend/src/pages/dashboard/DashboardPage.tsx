import { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  ArrowRight,
  IndianRupee,
  HardHat,
  CheckCircle2,
  XCircle,
  Trash2,
  Mail,
  AlertTriangle,
  Clock,
  UserCheck,
  ShieldCheck,
  Briefcase,
  Users,
  Tractor,
  Package,
  ChevronRight,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { ProjectService } from '../../services/projectService';
import { FinanceService } from '../../services/financeService';
import { CompanyService } from '../../services/companyService';
import { AuthService } from '../../services/authService';
import { WorkforceService } from '../../services/workforceService';
import { InventoryService } from '../../services/inventoryService';
import { EquipmentService } from '../../services/equipmentService';

import type { Project } from '../../types/project';
import type { ProjectBudget } from '../../types/finance';
import type { CompanyProfile } from '../../types/company';
import type { RegisteredUser } from '../../types/auth';
import type { Labourer } from '../../types/workforce';
import type { Material } from '../../types/inventory';
import type { Equipment } from '../../types/equipment';

import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgets, setBudgets] = useState<Record<number, ProjectBudget>>({});
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<number | null>(null);

  // Admin Security Passcode State
  const [adminPasscode, setAdminPasscode] = useState('BF-ADMIN-2026');
  const [isEditingPasscode, setIsEditingPasscode] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');

  // Active Workspace Tab: null = Collapsed workspace; 'supervisors' | 'admins' | 'projects' | 'finance'
  const [activeTab, setActiveTab] = useState<'supervisors' | 'admins' | 'projects' | 'finance' | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        companyData,
        projectsData,
        usersData,
        workforceData,
        inventoryData,
        equipData,
        passcodeData
      ] = await Promise.all([
        CompanyService.getCompanyProfile().catch(() => null),
        ProjectService.getAllProjects().catch(() => []),
        AuthService.getAllUsers().catch(() => []),
        WorkforceService.getAllLabourers().catch(() => []),
        InventoryService.getAllMaterials().catch(() => []),
        EquipmentService.getAllEquipment().catch(() => []),
        AuthService.getAdminPasscode().catch(() => 'BF-ADMIN-2026')
      ]);

      if (companyData) setCompanyProfile(companyData);
      setProjects(projectsData);
      setRegisteredUsers(usersData);
      setLabourers(workforceData);
      setMaterials(inventoryData);
      setEquipmentList(equipData);
      if (passcodeData) setAdminPasscode(passcodeData);

      if (projectsData.length > 0) {
        const budgetPromises = projectsData.map((p) =>
          FinanceService.getProjectBudget(p.id).catch(() => null)
        );
        const budgetResults = await Promise.all(budgetPromises);

        const budgetMap: Record<number, ProjectBudget> = {};
        budgetResults.forEach((b) => {
          if (b && b.projectId) {
            budgetMap[b.projectId] = b;
          }
        });
        setBudgets(budgetMap);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load operational metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Supervisor Approval Actions
  const handleApproveSupervisor = async (userId: number, username: string) => {
    try {
      setIsProcessingId(userId);
      await AuthService.updateUserStatus(userId, 'APPROVED');
      setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'APPROVED' } : u));
      setActionMessage(`Supervisor "${username}" authorized successfully.`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve supervisor.');
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleRejectSupervisor = async (userId: number, username: string) => {
    try {
      setIsProcessingId(userId);
      await AuthService.updateUserStatus(userId, 'REJECTED');
      setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'REJECTED' } : u));
      setActionMessage(`Supervisor "${username}" access rejected.`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject supervisor.');
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Permanently delete account "${username}" from system database?`)) return;

    try {
      setIsProcessingId(userId);
      await AuthService.deleteUser(userId);
      setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
      setActionMessage(`User "${username}" deleted permanently.`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setIsProcessingId(null);
    }
  };

  // Admin Passcode Handlers
  const handleSavePasscode = async () => {
    if (!newPasscode.trim()) return;
    try {
      const updated = await AuthService.updateAdminPasscode(newPasscode.trim());
      setAdminPasscode(updated);
      setIsEditingPasscode(false);
      setNewPasscode('');
      setActionMessage(`Admin Access Passcode updated successfully to "${updated}"!`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setError('Failed to update admin passcode.');
    }
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'BF-ADM-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasscode(result);
  };

  // Financial Totals
  const financialTotals = useMemo(() => {
    let totalBudget = 0;
    let totalActualCost = 0;
    let totalAmountPaid = 0;
    let totalOutstanding = 0;

    projects.forEach((p) => {
      totalBudget += p.estimatedBudget || 0;
      const b = budgets[p.id];
      if (b) {
        totalActualCost += b.actualExpenses || 0;
        totalAmountPaid += b.amountPaid || 0;
        totalOutstanding += b.outstandingAmount || 0;
      }
    });

    const remainingBudget = totalBudget - totalActualCost;
    const utilizationPct = totalBudget > 0 ? ((totalActualCost / totalBudget) * 100).toFixed(1) : '0.0';

    return {
      totalBudget,
      totalActualCost,
      totalAmountPaid,
      totalOutstanding,
      remainingBudget,
      utilizationPct
    };
  }, [projects, budgets]);

  // Separated User Lists
  const supervisorUsers = useMemo(() => {
    return registeredUsers.filter(
      (u) => u.role === 'SITE_SUPERVISOR' || u.role === 'SUPERVISOR'
    );
  }, [registeredUsers]);

  const adminUsers = useMemo(() => {
    return registeredUsers.filter(
      (u) => u.role !== 'SITE_SUPERVISOR' && u.role !== 'SUPERVISOR'
    );
  }, [registeredUsers]);

  const pendingSupervisors = useMemo(() => {
    return supervisorUsers.filter((u) => u.status === 'PENDING_APPROVAL');
  }, [supervisorUsers]);

  const approvedSupervisors = useMemo(() => {
    return supervisorUsers.filter((u) => u.status === 'APPROVED');
  }, [supervisorUsers]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="success">Active Site</Badge>;
      case 'PLANNED': return <Badge variant="info">Planned Site</Badge>;
      case 'COMPLETED': return <Badge variant="default">Completed Site</Badge>;
      case 'ON_HOLD': return <Badge variant="warning">On Hold</Badge>;
      case 'CANCELLED': return <Badge variant="error">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
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
      <div className="space-y-6 max-w-7xl mx-auto p-2">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* 1. EXECUTIVE HERO COMMAND BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-2xl overflow-hidden border border-blue-900/40">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/15 via-indigo-600/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border border-white/20">
              {companyProfile?.logoUrl ? (
                <img
                  src={companyProfile.logoUrl}
                  alt={companyProfile.companyName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                getInitials(companyProfile?.companyName || 'ABC Constructions')
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {companyProfile?.companyName || 'ABC Constructions'}
                </h1>
                <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full shadow-md border border-white/20 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> EXECUTIVE COMMAND
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-200/90 mt-1 max-w-xl">
                Real-time contractor oversight for field supervisors, projects, fleet, and financial health.
              </p>
            </div>
          </div>

          {/* Quick Live Stats Pills Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10 shrink-0">
            <div className="bg-white/5 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-blue-300 font-bold uppercase block">Sites</span>
              <span className="text-lg font-black text-white">{projects.length} Active</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-amber-300 font-bold uppercase block">Supervisors</span>
              <span className="text-lg font-black text-white">{approvedSupervisors.length} Approved</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">Workforce</span>
              <span className="text-lg font-black text-white">{labourers.length} Crew</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-purple-300 font-bold uppercase block">Fleet Units</span>
              <span className="text-lg font-black text-white">{equipmentList.length} Units</span>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {actionMessage && <Alert type="success" message={actionMessage} />}

      {/* 2. PENDING SUPERVISORS ALERT BANNER */}
      {pendingSupervisors.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/80 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-950">
                {pendingSupervisors.length} Site Supervisor{pendingSupervisors.length > 1 ? 's' : ''} Awaiting Registration Approval
              </p>
              <p className="text-[11px] text-amber-800">
                Unapproved supervisor accounts are blocked from logging in until authorized by an Admin.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'supervisors' ? null : 'supervisors')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center shrink-0"
          >
            {activeTab === 'supervisors' ? 'Close Drawer' : 'Review & Approve →'}
          </button>
        </div>
      )}

      {/* 3. EXECUTIVE KPI CARDS (Interactive Module Summaries) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Construction Projects */}
        <div 
          onClick={() => setActiveTab(activeTab === 'projects' ? null : 'projects')}
          className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'projects'
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
              : 'border-slate-200/90 hover:border-blue-400 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Construction Sites</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{projects.length}</h3>
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>{activeTab === 'projects' ? 'Collapse Projects List' : 'Inspect Projects List'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'projects' ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
          </div>
        </div>

        {/* Card 2: Field Supervisors */}
        <div 
          onClick={() => setActiveTab(activeTab === 'supervisors' ? null : 'supervisors')}
          className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'supervisors'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
              : 'border-slate-200/90 hover:border-amber-400 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Supervisors</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-3xl font-black text-slate-900">{approvedSupervisors.length}</h3>
                {pendingSupervisors.length > 0 && (
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    +{pendingSupervisors.length} Pending
                  </span>
                )}
              </div>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <HardHat className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>{activeTab === 'supervisors' ? 'Collapse Supervisors' : 'Manage Supervisors'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'supervisors' ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
          </div>
        </div>

        {/* Card 3: System Administrators */}
        <div 
          onClick={() => setActiveTab(activeTab === 'admins' ? null : 'admins')}
          className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'admins'
              ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
              : 'border-slate-200/90 hover:border-purple-400 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admins & Managers</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{adminUsers.length}</h3>
            </div>
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-purple-700">
            <span>{activeTab === 'admins' ? 'Collapse Admins' : 'Inspect Admin Directory'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'admins' ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
          </div>
        </div>

        {/* Card 4: Portfolio Finances */}
        <div 
          onClick={() => setActiveTab(activeTab === 'finance' ? null : 'finance')}
          className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'finance'
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
              : 'border-slate-200/90 hover:border-rose-400 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Expenses</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(financialTotals.totalActualCost)}</h3>
            </div>
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>{activeTab === 'finance' ? 'Collapse Financial Ledger' : 'View Financial Ledger'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'finance' ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
          </div>
        </div>
      </div>

      {/* 4. SITE OPERATIONAL QUICK SHORTCUT LAUNCHPAD BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-3xl text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 text-white rounded-xl shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white">Quick Module Shortcuts</h3>
            <p className="text-[11px] text-slate-300">Direct operational navigation for contractor tasks</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/workforce"
            className="bg-white/10 hover:bg-blue-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-white/10 flex items-center"
          >
            <Users className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Workforce ({labourers.length})
          </Link>

          <Link
            to="/equipment"
            className="bg-white/10 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-white/10 flex items-center"
          >
            <Tractor className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Equipment ({equipmentList.length})
          </Link>

          <Link
            to="/inventory"
            className="bg-white/10 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-white/10 flex items-center"
          >
            <Package className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Inventory ({materials.length})
          </Link>

          <Link
            to="/projects"
            className="bg-white/10 hover:bg-purple-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-white/10 flex items-center"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            Projects ({projects.length})
          </Link>
        </div>
      </div>

      {/* 5. INTERACTIVE WORKSPACE DRAWER PANEL */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Tab Headers Switcher */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('supervisors')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'supervisors'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>1. Site Supervisors List</span>
              {pendingSupervisors.length > 0 && (
                <span className="bg-white text-amber-900 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingSupervisors.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admins'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>2. System Admins List</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'projects'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>3. Construction Projects</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'finance'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
              <span>4. Project-Wise Financial Ledger</span>
            </button>
          </div>

          {activeTab !== null && (
            <button
              onClick={() => setActiveTab(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕ Collapse Drawer
            </button>
          )}
        </div>

        {/* DEFAULT COLLAPSED STATE */}
        {activeTab === null && (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Executive Workspace Ready</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select any category tab above or click KPI cards to expand and inspect specific field supervisors, admin accounts, projects, or project-wise financial ledgers.
            </p>
          </div>
        )}

        {/* TAB 1: ONLY SITE SUPERVISORS LIST */}
        {activeTab === 'supervisors' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">1. Registered Site Supervisors</h2>
                  <p className="text-xs text-slate-500">Authorize supervisor registrations, reject access, or manage field accounts.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {supervisorUsers.length} Supervisors ({approvedSupervisors.length} Approved)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Supervisor Name</th>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Assigned Role</th>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Approval Status</th>
                    <th className="px-6 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {supervisorUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">
                        No site supervisors registered yet.
                      </td>
                    </tr>
                  ) : (
                    supervisorUsers.map((usr) => {
                      const isPending = usr.status === 'PENDING_APPROVAL';
                      const isRejected = usr.status === 'REJECTED';
                      const isApproved = usr.status === 'APPROVED' || !usr.status;

                      return (
                        <tr key={usr.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center text-white shrink-0 shadow-sm border bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 border-amber-400/40">
                                {getInitials(usr.username)}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm flex items-center">
                                  {usr.username}
                                  <HardHat className="w-3.5 h-3.5 ml-1.5 text-amber-500" />
                                </div>
                                <span className="text-[10px] text-slate-400">Supervisor ID: #{usr.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                            <div className="flex items-center">
                              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              {usr.email || 'N/A'}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md border tracking-wider bg-amber-50 text-amber-800 border-amber-200">
                              {usr.role}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {isPending ? (
                              <span className="inline-flex items-center font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                                <Clock className="w-3 h-3 mr-1 text-amber-600 animate-pulse" /> Pending Approval
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300">
                                <XCircle className="w-3 h-3 mr-1 text-rose-600" /> Rejected Access
                              </span>
                            ) : (
                              <span className="inline-flex items-center font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Approved Active
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isPending && (
                                <>
                                  <button
                                    disabled={isProcessingId === usr.id}
                                    onClick={() => handleApproveSupervisor(usr.id, usr.username)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs text-xs flex items-center"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Approve
                                  </button>
                                  <button
                                    disabled={isProcessingId === usr.id}
                                    onClick={() => handleRejectSupervisor(usr.id, usr.username)}
                                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-xl transition-all border border-amber-300 text-xs flex items-center"
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Access
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <button
                                  disabled={isProcessingId === usr.id}
                                  onClick={() => handleRejectSupervisor(usr.id, usr.username)}
                                  className="bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 font-bold px-2.5 py-1 rounded-xl transition-all border border-slate-200 text-xs"
                                >
                                  Reject Access
                                </button>
                              )}

                              {isRejected && (
                                <button
                                  disabled={isProcessingId === usr.id}
                                  onClick={() => handleApproveSupervisor(usr.id, usr.username)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-xl transition-all border border-emerald-200 text-xs"
                                >
                                  Re-Approve
                                </button>
                              )}

                              <button
                                disabled={isProcessingId === usr.id}
                                onClick={() => handleDeleteUser(usr.id, usr.username)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                                title="Delete Supervisor Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ONLY SYSTEM ADMINISTRATORS LIST & SECURITY PASSCODE */}
        {activeTab === 'admins' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">2. System Administrators & Security Passcode</h2>
                  <p className="text-xs text-slate-500">Executive contractor accounts & registration security control.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                {adminUsers.length} Admin Account(s)
              </span>
            </div>

            {/* ADMIN ACCESS PASSCODE MANAGEMENT CARD */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl text-white shadow-md border border-indigo-900/50 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">🔒 Active Admin Registration Passcode:</span>
                    <span className="bg-white/10 text-emerald-400 font-mono font-black text-base px-3 py-1 rounded-lg border border-white/20 tracking-widest">
                      {adminPasscode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    New users must enter this secret passcode on the registration form to create an Admin or Manager account.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(adminPasscode);
                      setActionMessage(`Admin Access Passcode "${adminPasscode}" copied to clipboard!`);
                      setTimeout(() => setActionMessage(null), 3000);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all border border-white/20"
                  >
                    📋 Copy Key
                  </button>

                  <button
                    onClick={() => {
                      setIsEditingPasscode(!isEditingPasscode);
                      setNewPasscode(adminPasscode);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm"
                  >
                    {isEditingPasscode ? 'Cancel' : '✏️ Change Passcode'}
                  </button>
                </div>
              </div>

              {/* INLINE PASSCODE EDITOR */}
              {isEditingPasscode && (
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new secret passcode"
                    className="bg-slate-900 text-emerald-400 font-mono font-bold text-sm px-4 py-2 rounded-xl border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase tracking-widest shrink-0"
                  />

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={generateRandomKey}
                      className="bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs px-3 py-2 rounded-xl transition-all border border-white/20"
                    >
                      🎲 Auto-Generate Key
                    </button>

                    <button
                      onClick={handleSavePasscode}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      ✓ Save Passcode
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Admin Name</th>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Role Privilege</th>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">System Status</th>
                    <th className="px-6 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {adminUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center text-white shrink-0 shadow-sm border bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400/40">
                            {getInitials(usr.username)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm flex items-center">
                              {usr.username}
                              <ShieldCheck className="w-3.5 h-3.5 ml-1.5 text-blue-600" />
                            </div>
                            <span className="text-[10px] text-slate-400">Admin ID: #{usr.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                        <div className="flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {usr.email || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md border tracking-wider bg-purple-50 text-purple-800 border-purple-200">
                          {usr.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Full Access
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {usr.username !== user?.username && (
                          <button
                            disabled={isProcessingId === usr.id}
                            onClick={() => handleDeleteUser(usr.id, usr.username)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ONLY CONSTRUCTION PROJECTS LIST */}
        {activeTab === 'projects' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">3. Construction Projects Directory</h2>
                <p className="text-xs text-slate-500">Overview of all registered sites, clients, and budgets.</p>
              </div>
              <Link to="/projects" className="text-xs font-bold text-blue-600 hover:underline flex items-center bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                Go to Projects Module <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Allocated Budget</th>
                    <th className="px-6 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Actual Expenses</th>
                    <th className="px-6 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {projects.map((project) => {
                    const b = budgets[project.id];
                    const actualCost = b?.actualExpenses || 0;
                    const budget = project.estimatedBudget || 0;

                    return (
                      <tr key={project.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-sm">{project.projectName}</div>
                          <div className="text-[11px] text-slate-500">ID: #{project.id} • {project.location || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                          {project.clientName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(project.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-900">
                          {formatCurrency(budget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-rose-600">
                          {formatCurrency(actualCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link to={`/projects/${project.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PROJECT-WISE FINANCIAL BREAKDOWN */}
        {activeTab === 'finance' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">4. Project-Wise Financial Breakdown</h2>
                <p className="text-xs text-slate-500">Detailed financial figures, budgets, actual expenses, and outstanding balances per project site.</p>
              </div>
              <Link to="/finance" className="text-xs font-bold text-rose-600 hover:underline flex items-center bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                Open Full Finance Module <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Overall Aggregate KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="p-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Portfolio Budget</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{formatCurrency(financialTotals.totalBudget)}</p>
              </div>
              <div className="p-2">
                <p className="text-[10px] text-rose-700 font-bold uppercase">Total Actual Costs</p>
                <p className="text-sm font-extrabold text-rose-600 mt-0.5">{formatCurrency(financialTotals.totalActualCost)}</p>
              </div>
              <div className="p-2">
                <p className="text-[10px] text-emerald-700 font-bold uppercase">Total Amount Paid</p>
                <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{formatCurrency(financialTotals.totalAmountPaid)}</p>
              </div>
              <div className="p-2">
                <p className="text-[10px] text-amber-700 font-bold uppercase">Total Outstanding</p>
                <p className="text-sm font-extrabold text-amber-600 mt-0.5">{formatCurrency(financialTotals.totalOutstanding)}</p>
              </div>
              <div className="p-2">
                <p className="text-[10px] text-blue-700 font-bold uppercase">Total Remaining Funds</p>
                <p className="text-sm font-extrabold text-blue-700 mt-0.5">{formatCurrency(financialTotals.remainingBudget)}</p>
              </div>
              <div className="p-2">
                <p className="text-[10px] text-purple-700 font-bold uppercase">Portfolio Used %</p>
                <p className="text-sm font-extrabold text-purple-700 mt-0.5">{financialTotals.utilizationPct}%</p>
              </div>
            </div>

            {/* PROJECT-WISE FINANCIAL BREAKDOWN TABLE */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-rose-600" />
                Project Financial Ledger
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Project / Site</th>
                      <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Allocated Budget</th>
                      <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Actual Expenses</th>
                      <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Amount Paid</th>
                      <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Outstanding Balance</th>
                      <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Remaining Budget</th>
                      <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Budget Utilized</th>
                      <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-slate-400 font-medium">
                          No project financial records available.
                        </td>
                      </tr>
                    ) : (
                      projects.map((p) => {
                        const b = budgets[p.id];
                        const estBudget = p.estimatedBudget || 0;
                        const actualExp = b?.actualExpenses || 0;
                        const paid = b?.amountPaid || 0;
                        const outstanding = b?.outstandingAmount || 0;
                        const remaining = estBudget - actualExp;
                        const utilPct = estBudget > 0 ? Math.min(((actualExp / estBudget) * 100), 100).toFixed(1) : '0';

                        return (
                          <tr key={p.id} className="hover:bg-rose-50/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-extrabold text-slate-900 text-sm">{p.projectName}</div>
                              <div className="text-[11px] text-slate-500">ID: #{p.id} • {p.clientName || 'N/A'}</div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-900">
                              {formatCurrency(estBudget)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-rose-600">
                              {formatCurrency(actualExp)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-700">
                              {formatCurrency(paid)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-amber-600">
                              {formatCurrency(outstanding)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-blue-700">
                              {formatCurrency(remaining)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="w-24 mx-auto">
                                <div className="flex justify-between text-[10px] font-extrabold mb-0.5">
                                  <span className="text-slate-600">{utilPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                  <div 
                                    className={`h-full rounded-full ${
                                      Number(utilPct) > 90 ? 'bg-rose-500' : Number(utilPct) > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${utilPct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Link 
                                to={`/projects/${p.id}`} 
                                className="text-xs font-bold text-blue-600 hover:underline"
                              >
                                Financial Details →
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
