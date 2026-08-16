import { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  Wrench, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Wallet,
  Activity,
  IndianRupee,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { ProjectService } from '../../services/projectService';
import { FinanceService } from '../../services/financeService';
import { WorkforceService } from '../../services/workforceService';
import { InventoryService } from '../../services/inventoryService';
import { EquipmentService } from '../../services/equipmentService';
import { CompanyService } from '../../services/companyService';

import type { Project } from '../../types/project';
import type { ProjectBudget } from '../../types/finance';
import type { Labourer } from '../../types/workforce';
import type { Material } from '../../types/inventory';
import type { Equipment } from '../../types/equipment';
import type { CompanyProfile } from '../../types/company';

import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgets, setBudgets] = useState<Record<number, ProjectBudget>>({});
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all core resources from existing services in parallel
      const [
        companyData,
        projectsData,
        labourersData,
        materialsData,
        equipmentData
      ] = await Promise.all([
        CompanyService.getCompanyProfile().catch(() => null),
        ProjectService.getAllProjects().catch(() => []),
        WorkforceService.getAllLabourers().catch(() => []),
        InventoryService.getAllMaterials().catch(() => []),
        EquipmentService.getAllEquipment().catch(() => [])
      ]);

      if (companyData) setCompanyProfile(companyData);
      setProjects(projectsData);
      setLabourers(labourersData);
      setMaterials(materialsData);
      setEquipmentList(equipmentData);

      // Fetch financial budgets for each project
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
      setError(err.response?.data?.message || 'Failed to load operational dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Aggregated Financial Totals across all projects
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
    const utilizationPct = totalBudget > 0 ? ((totalActualCost / totalBudget) * 100).toFixed(2) : '0.00';

    return {
      totalBudget,
      totalActualCost,
      totalAmountPaid,
      totalOutstanding,
      remainingBudget,
      utilizationPct
    };
  }, [projects, budgets]);

  // Projects needing attention (high budget utilization or outstanding payment)
  const attentionProjects = useMemo(() => {
    return projects.filter((p) => {
      const b = budgets[p.id];
      const actualCost = b?.actualExpenses || 0;
      const budget = p.estimatedBudget || 1;
      const usedPct = (actualCost / budget) * 100;
      const hasOutstanding = (b?.outstandingAmount || 0) > 0;
      return usedPct > 80 || hasOutstanding;
    });
  }, [projects, budgets]);

  // Workforce role counts
  const workforceMetrics = useMemo(() => {
    const supervisors = labourers.filter((l) => l.role === 'SUPERVISOR' || l.role === 'FOREMAN').length;
    const dailyWorkers = labourers.filter((l) => l.compensationType === 'DAILY').length;
    const fixedWorkers = labourers.filter((l) => l.compensationType === 'FIXED_WORK').length;
    const monthlyWorkers = labourers.filter((l) => l.compensationType === 'MONTHLY').length;
    return { supervisors, dailyWorkers, fixedWorkers, monthlyWorkers };
  }, [labourers]);

  // Equipment metrics
  const equipmentMetrics = useMemo(() => {
    const active = equipmentList.filter((e) => e.status === 'AVAILABLE' || e.status === 'IN_USE').length;
    const inUse = equipmentList.filter((e) => e.status === 'IN_USE').length;
    const maintenance = equipmentList.filter((e) => e.status === 'UNDER_MAINTENANCE').length;
    return { active, inUse, maintenance };
  }, [equipmentList]);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="success">Active</Badge>;
      case 'PLANNED': return <Badge variant="info">Planned</Badge>;
      case 'COMPLETED': return <Badge variant="default">Completed</Badge>;
      case 'ON_HOLD': return <Badge variant="warning">On Hold</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ABC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. EXECUTIVE COMPANY HEADER BANNER */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 md:p-8 shadow-xl overflow-hidden border border-blue-900/40 text-white">
        {/* Glow & Backdrop Accents */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-600/20 via-indigo-600/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 border border-white/20">
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
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {companyProfile?.companyName || 'ABC Constructions'}
                </h1>
                <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full shadow-md border border-white/20">
                  FROM WORK TO WORTH
                </span>
                {companyProfile?.location && (
                  <span className="text-xs text-blue-200 bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full font-medium border border-white/10">
                    📍 {companyProfile.location}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-blue-300 mt-1 max-w-2xl leading-relaxed">
                Turn every workforce activity, material consumption, and equipment usage into clear project cost and financial insight.
              </p>
              <p className="text-xs text-slate-400 mt-1 hidden sm:block">
                {companyProfile?.description || 'Manage your projects, workforce, materials and equipment from one place.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end border-t md:border-t-0 pt-4 md:pt-0 border-white/10 shrink-0">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30">
                LIVE OPERATIONAL SYSTEM
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-200">
              Good morning, <span className="text-blue-400 font-bold">{user?.username || 'Admin'}</span>
            </span>
            <span className="text-xs text-slate-400 mt-0.5">📅 {currentDateStr}</span>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* 2. KEY OPERATIONAL METRICS CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Key Operational Metrics</h2>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            Real-time Aggregation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Projects */}
          <Link to="/projects" className="group">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group-hover:border-blue-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Projects</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{projects.length}</h3>
                </div>
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-blue-600 font-bold group-hover:underline">
                View all projects <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </Link>

          {/* Total Budget */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Allocated Budget</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(financialTotals.totalBudget)}</h3>
              </div>
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 font-medium">Across {projects.length} active project(s)</p>
          </div>

          {/* Actual Cost */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual Cost Incurred</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(financialTotals.totalActualCost)}</h3>
              </div>
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 font-semibold">{financialTotals.utilizationPct}% of total budget utilized</p>
          </div>

          {/* Remaining Budget */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remaining Budget</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(financialTotals.remainingBudget)}</h3>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 font-medium">Available for project execution</p>
          </div>
        </div>
      </div>

      {/* 3. FINANCIAL OVERVIEW CARD */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Financial Overview & Budget Utilization</h2>
              <p className="text-xs text-gray-500">Live authoritative cost breakdown synchronized from Finance Service.</p>
            </div>
          </div>
          <Link to="/finance" className="text-xs font-bold text-blue-600 hover:underline flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            Go to Finance Module <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-gray-700">Budget Utilization Progress</span>
            <span className="text-blue-700 font-extrabold">{financialTotals.utilizationPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200/60">
            <div 
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(Number(financialTotals.utilizationPct), 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Budget</p>
            <p className="text-base font-extrabold text-gray-900 mt-1">{formatCurrency(financialTotals.totalBudget)}</p>
          </div>
          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/80">
            <p className="text-xs text-rose-700 font-semibold uppercase tracking-wider">Actual Cost</p>
            <p className="text-base font-extrabold text-rose-600 mt-1">{formatCurrency(financialTotals.totalActualCost)}</p>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Amount Paid</p>
            <p className="text-base font-extrabold text-emerald-700 mt-1">{formatCurrency(financialTotals.totalAmountPaid)}</p>
          </div>
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Outstanding</p>
            <p className="text-base font-extrabold text-amber-600 mt-1">{formatCurrency(financialTotals.totalOutstanding)}</p>
          </div>
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80">
            <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Remaining</p>
            <p className="text-base font-extrabold text-blue-700 mt-1">{formatCurrency(financialTotals.remainingBudget)}</p>
          </div>
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/80">
            <p className="text-xs text-purple-700 font-semibold uppercase tracking-wider">Budget Used %</p>
            <p className="text-base font-extrabold text-purple-700 mt-1">{financialTotals.utilizationPct}%</p>
          </div>
        </div>
      </div>

      {/* 4. PROJECT OVERVIEW TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Overview</h2>
              <p className="text-xs text-gray-500">Live operational status and financial breakdown for all construction projects.</p>
            </div>
          </div>
          <Link to="/projects" className="text-xs font-bold text-blue-600 hover:underline flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            View All ({projects.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Invested / Actual</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Used %</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => {
                const b = budgets[project.id];
                const actualCost = b?.actualExpenses || 0;
                const budget = project.estimatedBudget || 0;
                const remaining = budget - actualCost;
                const usedPct = budget > 0 ? ((actualCost / budget) * 100).toFixed(1) : '0.0';

                return (
                  <tr key={project.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{project.projectName}</div>
                      <div className="text-xs text-gray-500">ID: #{project.id} • {project.location || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                      {project.clientName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatCurrency(budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-rose-600">
                      {formatCurrency(actualCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600">
                      {formatCurrency(remaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {usedPct}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link to={`/projects/${project.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
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

      {/* 5. RESOURCE MODULE OVERVIEW CARDS */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Resource Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workforce Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Workforce</h3>
                    <p className="text-xs text-gray-500">Laborers & Foremen</p>
                  </div>
                </div>
                <Link to="/workforce" className="text-xs text-purple-600 font-bold hover:underline bg-purple-50 px-2.5 py-1 rounded-lg">Manage</Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Active Workers</span>
                  <span className="font-bold text-gray-900 text-sm">{labourers.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Supervisors / Foremen</span>
                  <span className="font-semibold text-purple-700">{workforceMetrics.supervisors}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Daily Workers</span>
                  <span className="font-medium text-gray-800">{workforceMetrics.dailyWorkers}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Fixed Agreement Workers</span>
                  <span className="font-medium text-gray-800">{workforceMetrics.fixedWorkers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Inventory</h3>
                    <p className="text-xs text-gray-500">Materials & Stock</p>
                  </div>
                </div>
                <Link to="/inventory" className="text-xs text-orange-600 font-bold hover:underline bg-orange-50 px-2.5 py-1 rounded-lg">Manage</Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Total Materials Catalog</span>
                  <span className="font-bold text-gray-900 text-sm">{materials.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Material Categories</span>
                  <span className="font-semibold text-orange-600">
                    {new Set(materials.map((m) => m.type)).size} Categories
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">System Tracking</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Stock Valuation
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Equipment</h3>
                    <p className="text-xs text-gray-500">Machinery & Tools</p>
                  </div>
                </div>
                <Link to="/equipment" className="text-xs text-blue-600 font-bold hover:underline bg-blue-50 px-2.5 py-1 rounded-lg">Manage</Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Total Fleet Equipment</span>
                  <span className="font-bold text-gray-900 text-sm">{equipmentList.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Active / Available</span>
                  <span className="font-semibold text-blue-600">{equipmentMetrics.active}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Currently In Use</span>
                  <span className="font-semibold text-emerald-600">{equipmentMetrics.inUse} Units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. PROJECTS NEEDING ATTENTION & MODULE NAVIGATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Needing Attention */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Projects Needing Attention</h2>
                <p className="text-xs text-gray-500">Projects exceeding 80% budget or with outstanding balances.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {attentionProjects.length} Flagged
            </span>
          </div>

          <div className="p-6 space-y-3">
            {attentionProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 font-medium">All projects are performing within healthy parameters.</p>
              </div>
            ) : (
              attentionProjects.map((project) => {
                const b = budgets[project.id];
                const actualCost = b?.actualExpenses || 0;
                const budget = project.estimatedBudget || 1;
                const usedPct = ((actualCost / budget) * 100).toFixed(1);
                const outstanding = b?.outstandingAmount || 0;

                return (
                  <div key={project.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between hover:bg-amber-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{project.projectName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {Number(usedPct) > 80 && (
                          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            High Budget Used: {usedPct}%
                          </span>
                        )}
                        {outstanding > 0 && (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Outstanding: {formatCurrency(outstanding)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={`/projects/${project.id}`} className="text-xs font-bold text-blue-600 hover:underline bg-white px-3 py-1.5 rounded-lg border border-amber-200">
                      Inspect →
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Module Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Quick Module Navigation</h2>
                <p className="text-xs text-gray-500">Instant access to core system modules.</p>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link to="/projects" className="p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center text-center group">
              <Building2 className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-gray-900">Projects</span>
              <span className="text-xs text-gray-500 mt-1">{projects.length} Managed</span>
            </Link>

            <Link to="/workforce" className="p-4 border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50/30 transition-all flex flex-col items-center text-center group">
              <Users className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-gray-900">Workforce</span>
              <span className="text-xs text-gray-500 mt-1">{labourers.length} Workers</span>
            </Link>

            <Link to="/inventory" className="p-4 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50/30 transition-all flex flex-col items-center text-center group">
              <Package className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-gray-900">Inventory</span>
              <span className="text-xs text-gray-500 mt-1">{materials.length} Materials</span>
            </Link>

            <Link to="/finance" className="p-4 border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex flex-col items-center text-center group">
              <IndianRupee className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-gray-900">Finance</span>
              <span className="text-xs text-gray-500 mt-1">{formatCurrency(financialTotals.totalActualCost)} Spent</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
