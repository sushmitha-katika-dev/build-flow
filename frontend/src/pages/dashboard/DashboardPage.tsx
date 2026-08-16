import { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Wallet,
  Activity
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
        projectsData.forEach((p, idx) => {
          if (budgetResults[idx]) {
            budgetMap[p.id] = budgetResults[idx]!;
          }
        });
        setBudgets(budgetMap);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute Authoritative Financial Totals across all active projects
  const financialTotals = useMemo(() => {
    let totalBudget = 0;
    let totalActualCost = 0;
    let totalAmountPaid = 0;
    let totalOutstanding = 0;

    projects.forEach((p) => {
      const pBudget = p.estimatedBudget || 0;
      totalBudget += pBudget;

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
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Company Header */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0 border border-blue-500/20">
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
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {companyProfile?.companyName || 'ABC Constructions'}
              </h1>
              {companyProfile?.location && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">
                  {companyProfile.location}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">
              Construction Management Dashboard
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              {companyProfile?.description || 'Manage your projects, workforce, materials and equipment from one place.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
          <span className="text-sm font-semibold text-gray-700">
            Good morning, <span className="text-blue-600 font-bold">{user?.username || 'Contractor'}</span>
          </span>
          <span className="text-xs text-gray-400 mt-1">📅 {currentDateStr}</span>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* 1. KEY METRICS CARDS */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Key Operational Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Projects */}
          <Link to="/projects" className="group">
            <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all group-hover:border-blue-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Projects</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{projects.length}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-blue-600 font-medium group-hover:underline">
                View all projects <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </Link>

          {/* Total Budget */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Budget</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(financialTotals.totalBudget)}</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Allocated across {projects.length} project(s)</p>
          </div>

          {/* Actual Cost */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Actual Cost / Invested</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(financialTotals.totalActualCost)}</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">{financialTotals.utilizationPct}% of total budget utilized</p>
          </div>

          {/* Remaining Budget */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Remaining Budget</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(financialTotals.remainingBudget)}</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Available for allocation</p>
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL OVERVIEW */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Financial Overview</h2>
          </div>
          <Link to="/finance" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
            Go to Finance Module <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Total Budget</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(financialTotals.totalBudget)}</p>
          </div>
          <div className="p-4 bg-red-50/50 rounded-lg border border-red-100">
            <p className="text-xs text-gray-500 font-medium">Actual Cost / Invested</p>
            <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(financialTotals.totalActualCost)}</p>
          </div>
          <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
            <p className="text-xs text-gray-500 font-medium">Amount Paid</p>
            <p className="text-lg font-bold text-green-700 mt-1">{formatCurrency(financialTotals.totalAmountPaid)}</p>
          </div>
          <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
            <p className="text-xs text-gray-500 font-medium">Outstanding</p>
            <p className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(financialTotals.totalOutstanding)}</p>
          </div>
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 font-medium">Remaining Budget</p>
            <p className="text-lg font-bold text-blue-700 mt-1">{formatCurrency(financialTotals.remainingBudget)}</p>
          </div>
          <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
            <p className="text-xs text-gray-500 font-medium">Budget Used %</p>
            <p className="text-lg font-bold text-purple-700 mt-1">{financialTotals.utilizationPct}%</p>
          </div>
        </div>
      </div>

      {/* 3. PROJECT OVERVIEW TABLE */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Project Overview</h2>
          </div>
          <Link to="/projects" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
            View All ({projects.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No projects found. Create a project to start tracking.
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const b = budgets[project.id];
                  const actualCost = b?.actualExpenses || 0;
                  const estimatedBudget = project.estimatedBudget || 0;
                  const remaining = estimatedBudget - actualCost;
                  const usedPct = estimatedBudget > 0 ? ((actualCost / estimatedBudget) * 100).toFixed(2) : '0.00';

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{project.projectName}</div>
                        <div className="text-xs text-gray-500">ID: #{project.id} • {project.location || 'Site'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(estimatedBudget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        {formatCurrency(actualCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        {formatCurrency(remaining)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${Number(usedPct) > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min(Number(usedPct), 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{usedPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-900 font-semibold text-xs">
                          View Details
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

      {/* 4. RESOURCE OVERVIEW GRID */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Resource Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workforce */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">Workforce Summary</h3>
                </div>
                <Link to="/workforce" className="text-xs text-purple-600 font-semibold hover:underline">Manage</Link>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Active Workers</span>
                  <span className="text-sm font-bold text-gray-900">{labourers.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Supervisors / Foremen</span>
                  <span className="text-sm font-semibold text-purple-700">{workforceMetrics.supervisors}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Daily Workers</span>
                  <span className="text-sm font-medium text-gray-800">{workforceMetrics.dailyWorkers}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Fixed Work Workers</span>
                  <span className="text-sm font-medium text-gray-800">{workforceMetrics.fixedWorkers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">Inventory & Materials</h3>
                </div>
                <Link to="/inventory" className="text-xs text-orange-600 font-semibold hover:underline">Manage</Link>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Materials Catalog</span>
                  <span className="text-sm font-bold text-gray-900">{materials.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Material Categories</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {new Set(materials.map((m) => m.type)).size}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">System Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                    Active Tracking
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">Equipment Fleet</h3>
                </div>
                <Link to="/equipment" className="text-xs text-blue-600 font-semibold hover:underline">Manage</Link>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Equipment</span>
                  <span className="text-sm font-bold text-gray-900">{equipmentList.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Active / Available</span>
                  <span className="text-sm font-semibold text-blue-600">{equipmentMetrics.active}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Currently In Use</span>
                  <span className="text-sm font-semibold text-green-600">{equipmentMetrics.inUse}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PROJECTS NEEDING ATTENTION & RECENT SYSTEM STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Needing Attention */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Projects Needing Attention</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {attentionProjects.length} Flagged
            </span>
          </div>

          <div className="p-6 space-y-4">
            {attentionProjects.length === 0 ? (
              <div className="text-center py-6">
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
                  <div key={project.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{project.projectName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {Number(usedPct) > 80 && (
                          <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            High Budget Used: {usedPct}%
                          </span>
                        )}
                        {outstanding > 0 && (
                          <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Outstanding: {formatCurrency(outstanding)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={`/projects/${project.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                      Inspect
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links & Module Overview */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Module Navigation</h2>
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

            <Link to="/finance" className="p-4 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50/30 transition-all flex flex-col items-center text-center group">
              <DollarSign className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-gray-900">Finance</span>
              <span className="text-xs text-gray-500 mt-1">{formatCurrency(financialTotals.totalActualCost)} Spent</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
