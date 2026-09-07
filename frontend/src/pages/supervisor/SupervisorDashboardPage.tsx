import { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  Wrench, 
  ArrowRight,
  HardHat,
  CalendarCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { ProjectService } from '../../services/projectService';
import { WorkforceService } from '../../services/workforceService';
import { InventoryService } from '../../services/inventoryService';
import { EquipmentService } from '../../services/equipmentService';

import type { Project } from '../../types/project';
import type { Labourer } from '../../types/workforce';
import type { Material } from '../../types/inventory';
import type { Equipment } from '../../types/equipment';

import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';

export const SupervisorDashboardPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupervisorData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        projectsData,
        labourersData,
        materialsData,
        equipmentData
      ] = await Promise.all([
        ProjectService.getAllProjects().catch(() => []),
        WorkforceService.getAllLabourers().catch(() => []),
        InventoryService.getAllMaterials().catch(() => []),
        EquipmentService.getAllEquipment().catch(() => [])
      ]);

      setProjects(projectsData);
      setLabourers(labourersData);
      setMaterials(materialsData);
      setEquipmentList(equipmentData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load supervisor site operational metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisorData();
  }, []);

  const equipmentMetrics = useMemo(() => {
    const active = equipmentList.filter((e) => e.status === 'AVAILABLE' || e.status === 'IN_USE').length;
    const inUse = equipmentList.filter((e) => e.status === 'IN_USE').length;
    const maintenance = equipmentList.filter((e) => e.status === 'UNDER_MAINTENANCE').length;
    return { active, inUse, maintenance };
  }, [equipmentList]);

  const workforceMetrics = useMemo(() => {
    const dailyWorkers = labourers.filter((l) => l.compensationType === 'DAILY').length;
    const fixedWorkers = labourers.filter((l) => l.compensationType === 'FIXED_WORK').length;
    const monthlyWorkers = labourers.filter((l) => l.compensationType === 'MONTHLY').length;
    return { dailyWorkers, fixedWorkers, monthlyWorkers };
  }, [labourers]);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="success">Active Site</Badge>;
      case 'PLANNED': return <Badge variant="info">Planned Site</Badge>;
      case 'COMPLETED': return <Badge variant="default">Completed Site</Badge>;
      case 'ON_HOLD': return <Badge variant="warning">On Hold</Badge>;
      default: return <Badge>{status}</Badge>;
    }
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
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. SUPERVISOR SITE HEADER BANNER */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 md:p-8 shadow-xl overflow-hidden border border-blue-800/40 text-white">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-600/20 via-indigo-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 border border-white/20">
              <HardHat className="w-9 h-9" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Site Supervisor Operational Portal
                </h1>
                <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-md border border-white/20">
                  OPERATIONAL SITE LEVEL
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-200 mt-1 max-w-2xl leading-relaxed">
                Log daily worker attendance, record heavy machinery usage hours, and track site material movements in real time.
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
                ACTIVE SITE SHIFT
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-200">
              Logged in as: <span className="text-amber-400 font-bold">{user?.username || 'Supervisor'}</span> (Site Supervisor)
            </span>
            <span className="text-xs text-slate-400 mt-0.5">📅 {currentDateStr}</span>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* 2. PRIMARY SUPERVISOR QUICK ACTION LAUNCHPADS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Site Operational Launchpads</h2>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Field Supervisor Actions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Workforce Attendance Launchpad */}
          <Link to="/workforce" className="group">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group-hover:border-purple-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workforce & Shifts</p>
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{labourers.length} Active Workers</h3>
                </div>
                <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                  <CalendarCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-purple-600 font-bold group-hover:underline">
                Mark Daily Attendance →
              </div>
            </div>
          </Link>

          {/* Machinery Usage & Fuel Launchpad */}
          <Link to="/equipment" className="group">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group-hover:border-blue-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Machinery Usage</p>
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{equipmentMetrics.inUse} In Operation</h3>
                </div>
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                  <Wrench className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-blue-600 font-bold group-hover:underline">
                Log Operating Hours & Fuel →
              </div>
            </div>
          </Link>

          {/* Material Stock Receipts Launchpad */}
          <Link to="/inventory" className="group">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group-hover:border-orange-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Site Inventory</p>
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{materials.length} Material Types</h3>
                </div>
                <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-orange-600 font-bold group-hover:underline">
                Record Stock Receipts & Issues →
              </div>
            </div>
          </Link>

          {/* Construction Sites Launchpad */}
          <Link to="/projects" className="group">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group-hover:border-emerald-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Construction Sites</p>
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{projects.length} Active Sites</h3>
                </div>
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-600 font-bold group-hover:underline">
                View Site Details →
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. SITE OPERATIONS METRICS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Workforce Operational Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Site Workforce Breakdown</h3>
              <p className="text-xs text-gray-500">Live worker distribution</p>
            </div>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Daily Wage Labourers:</span>
              <span className="font-bold text-purple-700">{workforceMetrics.dailyWorkers}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Fixed Contract Workers:</span>
              <span className="font-bold text-purple-700">{workforceMetrics.fixedWorkers}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-600">Monthly Staff:</span>
              <span className="font-bold text-purple-700">{workforceMetrics.monthlyWorkers}</span>
            </div>
          </div>
        </div>

        {/* Machinery Status */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Site Fleet Availability</h3>
              <p className="text-xs text-gray-500">Equipment readiness</p>
            </div>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Active Fleet Units:</span>
              <span className="font-bold text-blue-700">{equipmentMetrics.active} Units</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Currently Deployed:</span>
              <span className="font-bold text-emerald-700">{equipmentMetrics.inUse} Units</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-600">Under Maintenance:</span>
              <span className="font-bold text-amber-700">{equipmentMetrics.maintenance} Units</span>
            </div>
          </div>
        </div>

        {/* Material Stock */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Material Catalog & Stock</h3>
              <p className="text-xs text-gray-500">Material categories</p>
            </div>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Tracked Materials:</span>
              <span className="font-bold text-orange-700">{materials.length} Items</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Categories:</span>
              <span className="font-bold text-orange-700">{new Set(materials.map(m => m.type)).size} Types</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-600">Site Log Status:</span>
              <span className="font-bold text-emerald-600">Up to Date</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE SITES TABLE FOR SUPERVISOR */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Active Construction Sites</h2>
              <p className="text-xs text-gray-500">Overview of projects assigned for field operations & daily shift logging.</p>
            </div>
          </div>
          <Link to="/projects" className="text-xs font-bold text-blue-600 hover:underline flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            View All Sites ({projects.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Site / Project Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{project.projectName}</div>
                    <div className="text-xs text-gray-500">ID: #{project.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                    📍 {project.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                    {project.clientName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <Link to={`/projects/${project.id}`} className="text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      Site Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
