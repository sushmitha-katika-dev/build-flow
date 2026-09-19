import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import type { LabourWorkforceSummary, FixedWorkAgreement, AttendanceRecord, WageRecord } from '../../types/workforce';
import type { Project } from '../../types/project';
import { WorkforceService } from '../../services/workforceService';
import { ProjectService } from '../../services/projectService';
import { Briefcase, IndianRupee, ExternalLink, ArrowUpRight, Clock, CheckCircle, Wallet, ArrowLeft, Plus, FolderKanban, FileText, Phone, UserCheck, ShieldCheck, Calendar, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../components/common/Alert';

interface WorkerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: LabourWorkforceSummary | null;
  onUpdate: () => void;
}

type TabType = 'OVERVIEW' | 'ATTENDANCE' | 'PAYMENTS';

export const WorkerDetailsModal = ({ isOpen, onClose, worker, onUpdate }: WorkerDetailsModalProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

  const [agreements, setAgreements] = useState<FixedWorkAgreement[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [wageHistory, setWageHistory] = useState<WageRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingAgreement, setIsAddingAgreement] = useState(false);

  const [newProjectId, setNewProjectId] = useState<number | 0>(0);
  const [newAgreedAmount, setNewAgreedAmount] = useState<number | ''>('');
  const [newScopeDescription, setNewScopeDescription] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters for History Tabs
  const [filterProjectId, setFilterProjectId] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  useEffect(() => {
    if (isOpen && worker) {
      setActiveTab('OVERVIEW');
      loadAllWorkerData();
    }
  }, [isOpen, worker]);

  const loadAllWorkerData = async () => {
    if (!worker) return;
    try {
      setIsLoading(true);
      const [projData, attData, wageData] = await Promise.all([
        ProjectService.getAllProjects().catch(() => []),
        WorkforceService.getAttendanceByLabourId(worker.id).catch(() => []),
        WorkforceService.getWagesByLabourId(worker.id).catch(() => [])
      ]);

      setProjects(projData);
      setAttendanceHistory(Array.isArray(attData) ? attData : []);
      setWageHistory(Array.isArray(wageData) ? wageData : []);

      if (worker.compensationType === 'FIXED_WORK') {
        const agData = await WorkforceService.getFixedWorkAgreementsByLabour(worker.id).catch(() => []);
        setAgreements(agData);
      }
    } catch (err) {
      console.error("Failed to load worker details", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgreements = async () => {
    if (!worker) return;
    try {
      const data = await WorkforceService.getFixedWorkAgreementsByLabour(worker.id);
      setAgreements(data);
    } catch (err) {
      console.error("Failed to load worker agreements", err);
    }
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker || !newProjectId || !newAgreedAmount) {
      setError("Please select a project and enter an agreed contract amount.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await WorkforceService.createFixedWorkAgreement({
        labourId: worker.id,
        projectId: newProjectId,
        agreedAmount: Number(newAgreedAmount),
        description: newScopeDescription || `Project Contract for ${worker.firstName} ${worker.lastName}`
      });

      setIsAddingAgreement(false);
      setNewProjectId(0);
      setNewAgreedAmount('');
      setNewScopeDescription('');
      fetchAgreements();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add project agreement.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRecordDate = (dateVal: any) => {
    if (!dateVal) return 'Unknown';
    if (Array.isArray(dateVal)) {
      return `${dateVal[0]}-${String(dateVal[1]).padStart(2, '0')}-${String(dateVal[2]).padStart(2, '0')}`;
    }
    return String(dateVal);
  };

  const getProjectName = (projId: number | null | undefined, notes?: string) => {
    if (!projId) {
      return notes ? `Other: ${notes}` : 'General Site';
    }
    const p = projects.find(proj => proj.id === projId);
    return p ? p.projectName : `Project #${projId}`;
  };

  const filteredAttendance = attendanceHistory.filter(record => {
    const recordDate = formatRecordDate(record.date);
    if (filterProjectId && String(record.projectId) !== filterProjectId) return false;
    if (filterStartDate && recordDate < filterStartDate) return false;
    if (filterEndDate && recordDate > filterEndDate) return false;
    return true;
  });

  const filteredWages = wageHistory.filter(record => {
    const recordDate = formatRecordDate(record.paymentDate);
    if (filterProjectId && String(record.projectId) !== filterProjectId) return false;
    if (filterStartDate && recordDate < filterStartDate) return false;
    if (filterEndDate && recordDate > filterEndDate) return false;
    return true;
  });

  if (!isOpen || !worker) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 overflow-y-auto min-h-screen w-screen animate-fadeIn">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Worker Registry
          </button>
          <span className="text-slate-700">|</span>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              {worker.firstName} {worker.lastName} — Profile & Detailed Records
            </h1>
            <p className="text-[11px] text-slate-400">ID: #{worker.id} • {worker.role}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="text-slate-300 border-slate-700 hover:bg-slate-800 text-xs px-3.5 py-2 rounded-xl font-bold"
            onClick={() => navigate(`/workforce/${worker.id}/history`, { state: { worker } })}
          >
            <ExternalLink className="w-4 h-4 mr-1.5 text-blue-400" /> Full Screen History Ledger
          </Button>
        </div>
      </div>

      {/* Main Full-Page Scrollable Content Container */}
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 pb-20">
        {/* Executive Profile Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-extrabold text-3xl shadow-inner flex-shrink-0">
              {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-extrabold tracking-tight">{worker.firstName} {worker.lastName}</h2>
                <span className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30">
                  ACTIVE
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-blue-200 font-medium">
                <span className="flex items-center bg-white/10 px-3 py-1 rounded-xl">
                  <Briefcase className="w-4 h-4 mr-1.5 text-blue-400" />
                  DESIGNATION: <strong className="ml-1.5 uppercase text-white font-bold">{worker.role}</strong>
                </span>
                <span className="flex items-center bg-white/10 px-3 py-1 rounded-xl">
                  <UserCheck className="w-4 h-4 mr-1.5 text-blue-400" />
                  PAYMENT TYPE: <strong className="ml-1.5 uppercase text-white font-bold">{worker.compensationType?.replace('_', ' ')}</strong>
                </span>
                {worker.phoneNumber && (
                  <span className="flex items-center bg-white/10 px-3 py-1 rounded-xl">
                    <Phone className="w-4 h-4 mr-1.5 text-blue-400" />
                    {worker.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center bg-white/5 border border-white/10 p-4 rounded-2xl w-full md:w-auto">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-300 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" /> Employment Record Status
            </span>
            <span className="text-lg font-black text-white mt-1">Verified Worker Profile</span>
          </div>
        </div>

        {/* 4 Core Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center mb-1">
              <Clock className="w-4 h-4 mr-1.5 text-blue-500" /> Days Worked
            </p>
            <p className="text-3xl font-black text-gray-900 mt-2">{worker.daysWorked || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Attendance presence logs</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center mb-1">
              <IndianRupee className="w-4 h-4 mr-1.5 text-indigo-500" /> Total Earned
            </p>
            <p className="text-3xl font-black text-gray-900 mt-2">₹{(worker.totalEarned || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">Gross earnings/agreements</p>
          </div>

          <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider flex items-center mb-1">
              <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" /> Amount Paid
            </p>
            <p className="text-3xl font-black text-emerald-700 mt-2">₹{(worker.amountPaid || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-emerald-600 mt-1">Total settled payouts</p>
          </div>

          <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs text-amber-900 font-bold uppercase tracking-wider flex items-center mb-1">
              <IndianRupee className="w-4 h-4 mr-1.5 text-amber-600" /> Pending Balance
            </p>
            <p className="text-3xl font-black text-amber-700 mt-2">₹{(worker.remainingAmount || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-amber-700 mt-1">Outstanding payable</p>
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION TABS */}
        <div className="border-b border-slate-200 flex space-x-2 bg-white p-2 rounded-2xl shadow-xs">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Overview & Contracts</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'ATTENDANCE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Attendance History ({attendanceHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'PAYMENTS'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Payment History ({wageHistory.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CONTRACTS */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* SALARIED STAFF RATE DISPLAY */}
            {(worker.compensationType === 'MONTHLY' || worker.compensationType === 'DAILY') && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {worker.compensationType === 'MONTHLY' ? 'Monthly Fixed Salary Rate' : 'Base Daily Wage Rate'}
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    ₹{((worker.compensationType === 'MONTHLY' ? worker.monthlySalary : worker.dailyRate) || 0).toLocaleString('en-IN')}
                    <span className="text-xs text-slate-500 font-normal ml-1">
                      {worker.compensationType === 'MONTHLY' ? '/ month' : '/ day'}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Need to revise salary or wage rate?</p>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">Click "Edit" on Worker Registry table to adjust rate anytime.</p>
                </div>
              </div>
            )}

            {/* MULTI-PROJECT CONTRACTS SECTION FOR FOREMEN / FIXED WORK */}
            {worker.compensationType === 'FIXED_WORK' && (
              <div className="space-y-4 p-6 sm:p-8 bg-white rounded-3xl border border-amber-200 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center">
                      <FolderKanban className="w-5 h-5 mr-2.5 text-amber-600" /> Multi-Project Work Agreements ({agreements.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Active piecework contracts assigned to this Foreman across project sites.</p>
                  </div>
                  <Button 
                    onClick={() => setIsAddingAgreement(!isAddingAgreement)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2.5 rounded-xl flex items-center font-bold shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Project Contract
                  </Button>
                </div>

                {error && <Alert type="error" message={error} />}

                {/* INLINE ADD NEW PROJECT AGREEMENT FORM */}
                {isAddingAgreement && (
                  <form onSubmit={handleCreateAgreement} className="p-5 bg-amber-50/70 rounded-2xl border border-amber-300 shadow-sm space-y-4">
                    <p className="text-xs font-black text-amber-950 uppercase tracking-wider">Create New Project Contract</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Target Project *</label>
                        <select
                          required
                          className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                          value={newProjectId}
                          onChange={(e) => setNewProjectId(Number(e.target.value))}
                        >
                          <option value={0} disabled>Select Project</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.projectName}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Agreed Contract Amount (₹) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                          placeholder="e.g. 50000"
                          value={newAgreedAmount}
                          onChange={(e) => setNewAgreedAmount(e.target.value ? Number(e.target.value) : '')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Task Scope / Description</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                        placeholder="e.g. Slab Shuttering & Centering Work"
                        value={newScopeDescription}
                        onChange={(e) => setNewScopeDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <Button type="button" variant="secondary" className="text-xs px-4 py-2 rounded-xl" onClick={() => setIsAddingAgreement(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-amber-700 text-white text-xs px-5 py-2 rounded-xl font-bold" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Contract'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* LIST OF AGREEMENTS */}
                {agreements.length === 0 ? (
                  <div className="text-center py-10 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200 p-6">
                    <FolderKanban className="mx-auto h-10 w-10 text-amber-500 mb-2" />
                    <p className="text-sm font-bold text-amber-900">No Project Contracts Assigned</p>
                    <p className="text-xs text-amber-700 mt-1">Click "Add Project Contract" above to assign this Foreman to a project.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agreements.map((ag) => {
                      const projectMatch = projects.find(p => p.id === ag.projectId);
                      return (
                        <div key={ag.id} className="p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between transition-colors">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-base font-black text-slate-900">
                                {projectMatch?.projectName || `Project #${ag.projectId}`}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                                {ag.status || 'ACTIVE'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 flex items-center font-medium">
                              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {ag.description || 'Fixed Work Contract'}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-black text-amber-900">
                              ₹{ag.agreedAmount?.toLocaleString('en-IN') || '0'}
                            </span>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Contract #{ag.id}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick Preview summary of Attendance & Payments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-slate-900 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" /> Recent Attendance Logs
                  </h4>
                  <button onClick={() => setActiveTab('ATTENDANCE')} className="text-xs font-bold text-blue-600 hover:underline">
                    View All ({attendanceHistory.length}) &rarr;
                  </button>
                </div>
                {attendanceHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No attendance recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {attendanceHistory.slice(0, 4).map(att => (
                      <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{formatRecordDate(att.date)}</span>
                          <span className="text-slate-500 ml-2">({getProjectName(att.projectId, att.notes)})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          att.status === 'HALF_DAY' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {att.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-slate-900 flex items-center">
                    <Receipt className="w-4 h-4 mr-2 text-emerald-600" /> Recent Payment History
                  </h4>
                  <button onClick={() => setActiveTab('PAYMENTS')} className="text-xs font-bold text-emerald-600 hover:underline">
                    View All ({wageHistory.length}) &rarr;
                  </button>
                </div>
                {wageHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No payment disbursements recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {wageHistory.slice(0, 4).map(w => (
                      <div key={w.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{formatRecordDate(w.paymentDate)}</span>
                          <span className="text-slate-500 ml-2">({getProjectName(w.projectId, w.notes)})</span>
                        </div>
                        <span className="font-black text-emerald-700">
                          ₹{w.amountPaid?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE HISTORY */}
        {activeTab === 'ATTENDANCE' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Complete Attendance History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Detailed daily presence & earned wages log for {worker.firstName}.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-slate-300 p-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterProjectId}
                  onChange={e => setFilterProjectId(e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectName}</option>
                  ))}
                </select>

                <input
                  type="date"
                  className="rounded-xl border border-slate-300 p-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  title="From Date"
                />
                <input
                  type="date"
                  className="rounded-xl border border-slate-300 p-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  title="To Date"
                />
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700">No Attendance Logs Found</p>
                <p className="text-xs text-slate-500 mt-1">No attendance records match the selected project or date filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-extrabold">
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Project Site</th>
                      <th className="p-3.5">Attendance Status</th>
                      <th className="p-3.5">Notes / Task</th>
                      <th className="p-3.5 text-right">Daily Earned (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                          {formatRecordDate(record.date)}
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">
                          {getProjectName(record.projectId, record.notes)}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${
                            record.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : record.status === 'HALF_DAY'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {record.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {record.notes || '—'}
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-900">
                          ₹{(record.earned || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PAYMENT HISTORY */}
        {activeTab === 'PAYMENTS' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-emerald-600" /> Complete Payment History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Recorded wage payouts & contract disbursements for {worker.firstName}.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-slate-300 p-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={filterProjectId}
                  onChange={e => setFilterProjectId(e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectName}</option>
                  ))}
                </select>

                <input
                  type="date"
                  className="rounded-xl border border-slate-300 p-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  title="From Date"
                />
                <input
                  type="date"
                  className="rounded-xl border border-slate-300 p-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  title="To Date"
                />
              </div>
            </div>

            {filteredWages.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <IndianRupee className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700">No Payment History Found</p>
                <p className="text-xs text-slate-500 mt-1">No payment transactions match the selected project or date filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-extrabold">
                      <th className="p-3.5">Payment Date</th>
                      <th className="p-3.5">Project Site</th>
                      <th className="p-3.5">Disbursement Status</th>
                      <th className="p-3.5">Notes</th>
                      <th className="p-3.5 text-right">Amount Paid (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredWages.map((record) => (
                      <tr key={record.id} className={record.status === 'CANCELLED' ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50 transition-colors'}>
                        <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                          {formatRecordDate(record.paymentDate)}
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">
                          {getProjectName(record.projectId, record.notes)}
                        </td>
                        <td className="p-3.5">
                          {record.status === 'CANCELLED' ? (
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">
                              CANCELLED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              SETTLED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {record.notes || 'Disbursement payout'}
                        </td>
                        <td className={`p-3.5 text-right font-black text-sm ${record.status === 'CANCELLED' ? 'line-through text-slate-400' : 'text-emerald-700'}`}>
                          ₹{(record.amountPaid || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Finance Module Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-2xl shadow-sm flex-shrink-0">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Wage & Contract Disbursements managed under Finance</p>
              <p className="text-xs text-blue-200 mt-0.5">
                Record wage disbursements under Finance to keep Project Cost Breakdowns automatically updated in real-time.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => { onClose(); navigate('/finance'); }}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-5 py-3 rounded-xl flex items-center font-bold shadow-md whitespace-nowrap"
          >
            Go to Finance Module <ArrowUpRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={onClose}
            className="text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 text-xs px-6 py-3 rounded-xl font-bold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-blue-600" /> Back to Worker Registry
          </Button>

          <span className="text-xs text-slate-400 font-medium">BuildFlow Enterprise Workforce Suite</span>
        </div>
      </div>
    </div>
  );
};

