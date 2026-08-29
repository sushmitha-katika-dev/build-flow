import { useEffect, useState, useMemo } from 'react';
import { Users, IndianRupee, UserPlus, HardHat, Info, Edit2, Trash2, Eye, AlertTriangle, CalendarCheck, CheckCircle2, DollarSign } from 'lucide-react';
import { WorkforceService } from '../../services/workforceService';
import { ProjectService } from '../../services/projectService';
import type { LabourWorkforceSummary } from '../../types/workforce';
import type { Project } from '../../types/project';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { AddWorkforceMemberModal } from './AddWorkforceMemberModal';
import { WorkerDetailsModal } from './WorkerDetailsModal';

export const WorkforcePage = () => {
  const [summaries, setSummaries] = useState<LabourWorkforceSummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<LabourWorkforceSummary | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<LabourWorkforceSummary | null>(null);

  // Delete worker state
  const [deletingWorker, setDeletingWorker] = useState<LabourWorkforceSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Quick Attendance Logging Modal State
  const [quickAttendanceWorker, setQuickAttendanceWorker] = useState<LabourWorkforceSummary | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [attendanceStatus, setAttendanceStatus] = useState<'PRESENT' | 'ABSENT' | 'HALF_DAY'>('PRESENT');
  const [attendanceDailyRate, setAttendanceDailyRate] = useState<number | ''>('');
  const [isLoggingAttendance, setIsLoggingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [summaryData, projectData] = await Promise.all([
        WorkforceService.getLabourSummary(),
        ProjectService.getAllProjects().catch(() => [])
      ]);
      setSummaries(summaryData);
      setProjects(projectData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load workforce summary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { totalWorkers, maleWorkers, femaleWorkers, pendingPay, totalEarnedAll } = useMemo(() => {
    let maleWorkers = 0;
    let femaleWorkers = 0;
    let pendingPay = 0;
    let totalEarnedAll = 0;

    summaries.forEach((s) => {
      if (s.gender === 'MALE') maleWorkers++;
      else if (s.gender === 'FEMALE') femaleWorkers++;
      pendingPay += s.remainingAmount || 0;
      totalEarnedAll += s.totalEarned || 0;
    });

    return {
      totalWorkers: summaries.length,
      maleWorkers,
      femaleWorkers,
      pendingPay,
      totalEarnedAll
    };
  }, [summaries]);

  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      const matchesSearch = !search || 
        s.firstName.toLowerCase().includes(search.toLowerCase()) || 
        s.lastName.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [summaries, search, roleFilter]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(summaries.map(s => s.role));
    return Array.from(roles);
  }, [summaries]);

  const handleEditWorker = (worker: LabourWorkforceSummary) => {
    setEditingWorker(worker);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingWorker(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWorker) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await WorkforceService.deleteLabourer(deletingWorker.id);
      setDeletingWorker(null);
      fetchData();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete worker.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAttendanceWorker) return;
    try {
      setIsLoggingAttendance(true);
      setAttendanceError(null);
      await WorkforceService.logAttendance({
        labourId: quickAttendanceWorker.id,
        projectId: selectedProjectId ? Number(selectedProjectId) : (quickAttendanceWorker.projectId || null),
        date: attendanceDate,
        status: attendanceStatus,
        dailyRate: attendanceDailyRate ? Number(attendanceDailyRate) : undefined
      });
      setQuickAttendanceWorker(null);
      fetchData();
    } catch (err: any) {
      setAttendanceError(err.response?.data?.message || 'Failed to log attendance');
    } finally {
      setIsLoggingAttendance(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'FOREMAN':
      case 'SUPERVISOR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MASON':
      case 'CARPENTER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ELECTRICIAN':
      case 'PLUMBER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAINTER':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'TECHNICIAN':
      case 'ENGINEER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><Skeleton className="h-24 w-full" /></Card>
          <Card><Skeleton className="h-24 w-full" /></Card>
          <Card><Skeleton className="h-24 w-full" /></Card>
          <Card><Skeleton className="h-24 w-full" /></Card>
        </div>
        <Card><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Workforce Dashboard</h1>
        </div>
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 backdrop-blur-md rounded-lg border border-blue-400/30">
              <HardHat className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Workforce Master Dashboard</h1>
          </div>
          <p className="text-sm text-blue-200 mt-1">
            Complete management registry for construction workers, daily attendance, wages, and payment balances.
          </p>
        </div>
        <Button 
          onClick={() => { setEditingWorker(null); setIsAddModalOpen(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white border-none shadow-md hover:shadow-lg transition-all flex items-center px-4 py-2.5 rounded-xl font-medium"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Onboard New Worker
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl mr-4 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Active Workers</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalWorkers}</p>
            <p className="text-xs text-gray-400 mt-1">{maleWorkers} Male • {femaleWorkers} Female</p>
          </div>
        </Card>

        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl mr-4 border border-indigo-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Worker Wages Earned</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">₹{totalEarnedAll.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">Across all projects</p>
          </div>
        </Card>

        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl mr-4 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Wages Disbursed</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              ₹{(totalEarnedAll - pendingPay).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-emerald-600 mt-1">Settled payments</p>
          </div>
        </Card>

        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl mr-4 border border-amber-100">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Payable Balance</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">₹{pendingPay.toLocaleString('en-IN')}</p>
            <p className="text-xs text-amber-700 mt-1">Outstanding worker wages</p>
          </div>
        </Card>
      </div>

      {/* Main Registry Section */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Worker Registry</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage worker details, roles, rates, attendance, and actions.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <select
              className="w-full sm:w-44 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles ({summaries.length})</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <div className="w-full sm:w-64">
              <Input 
                type="text" 
                placeholder="Search by worker name or role..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Info className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Workers Found</h3>
            <p className="text-xs text-gray-500 mt-1">No registered workers match your search or role filter.</p>
            <Button 
              variant="outline"
              onClick={() => { setSearch(''); setRoleFilter('ALL'); }}
              className="mt-4 text-xs"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Worker Details</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role & Project</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Wage Rate / Type</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSummaries.map((worker) => (
                  <tr key={worker.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* 1. Worker Details */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                        </div>
                        <div className="ml-3.5">
                          <div className="text-sm font-bold text-gray-900">{worker.firstName} {worker.lastName}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">
                            ID: #{worker.id} {worker.phoneNumber ? `• ${worker.phoneNumber}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Role & Project */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getRoleBadgeColor(worker.role)}`}>
                        {worker.role}
                      </span>
                      {worker.projectId ? (
                        <div className="text-xs text-gray-500 mt-1 font-medium">
                          Project #{worker.projectId}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-1 italic">Unassigned</div>
                      )}
                    </td>

                    {/* 3. Wage Rate / Type */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs font-extrabold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {worker.compensationType ? worker.compensationType.replace('_', ' ') : 'DAILY'}
                      </span>
                    </td>

                    {/* 4. Actions in ONE Single Horizontal Row */}
                    <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Eye Symbol - View Details */}
                        <button 
                          className="inline-flex items-center justify-center p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-sm transition-all"
                          onClick={() => setSelectedWorker(worker)}
                          title="View Details (Attendance, Earnings, Pending Balance)"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="ml-1 text-xs font-bold">Details</span>
                        </button>

                        {/* Pen Symbol - Edit */}
                        <button 
                          className="inline-flex items-center justify-center p-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 shadow-sm transition-all"
                          onClick={() => handleEditWorker(worker)}
                          title="Edit Worker Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="ml-1 text-xs font-bold">Edit</span>
                        </button>

                        {/* Trash Symbol - Delete */}
                        <button 
                          className="inline-flex items-center justify-center p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-all"
                          onClick={() => { setDeletingWorker(worker); setDeleteError(null); }}
                          title="Delete Worker"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="ml-1 text-xs font-bold">Delete</span>
                        </button>

                        {/* Calendar Symbol - Log Attendance */}
                        <button 
                          className="inline-flex items-center justify-center p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-sm transition-all"
                          onClick={() => {
                            setQuickAttendanceWorker(worker);
                            setSelectedProjectId(worker.projectId ? String(worker.projectId) : '');
                            setAttendanceDailyRate(worker.dailyRate || '');
                            setAttendanceError(null);
                          }}
                          title="Log Attendance"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span className="ml-1 text-xs font-bold">Attendance</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingWorker}
        onClose={() => setDeletingWorker(null)}
        title="Remove Worker"
      >
        {deleteError && <Alert type="error" message={deleteError} className="mb-4" />}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-200">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <p className="text-sm">
              Are you sure you want to remove worker <strong>"{deletingWorker?.firstName} {deletingWorker?.lastName}"</strong>?
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Historical attendance and wage records will be preserved safely. If active history exists, status will automatically transition to <strong>INACTIVE</strong>.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setDeletingWorker(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Removing...' : 'Confirm Remove'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Attendance Logging Modal */}
      <Modal
        isOpen={!!quickAttendanceWorker}
        onClose={() => setQuickAttendanceWorker(null)}
        title={`Log Attendance — ${quickAttendanceWorker?.firstName} ${quickAttendanceWorker?.lastName}`}
      >
        {attendanceError && <Alert type="error" message={attendanceError} className="mb-4" />}
        <form onSubmit={handleQuickLogAttendance} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
            <select
              required
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- Select Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <Input
              type="date"
              required
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Wage Rate for this Day (₹)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder={`Base rate: ₹${quickAttendanceWorker?.dailyRate || 0}`}
              value={attendanceDailyRate}
              onChange={(e) => setAttendanceDailyRate(e.target.value ? parseFloat(e.target.value) : '')}
            />
            <p className="text-[11px] text-gray-500 mt-1">Can be modified per day for overtime or special task adjustments.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Status *</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  attendanceStatus === 'PRESENT' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setAttendanceStatus('PRESENT')}
              >
                Full Day (Present)
              </button>

              <button
                type="button"
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  attendanceStatus === 'HALF_DAY' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setAttendanceStatus('HALF_DAY')}
              >
                Half Day
              </button>

              <button
                type="button"
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  attendanceStatus === 'ABSENT' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setAttendanceStatus('ABSENT')}
              >
                Absent
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setQuickAttendanceWorker(null)} disabled={isLoggingAttendance}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoggingAttendance}>
              {isLoggingAttendance ? 'Saving...' : 'Submit Attendance'}
            </Button>
          </div>
        </form>
      </Modal>

      <AddWorkforceMemberModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseAddModal} 
        onSuccess={() => fetchData()} 
        initialWorker={editingWorker}
      />

      <WorkerDetailsModal
        isOpen={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        worker={selectedWorker}
        onUpdate={() => fetchData()}
      />
    </div>
  );
};
