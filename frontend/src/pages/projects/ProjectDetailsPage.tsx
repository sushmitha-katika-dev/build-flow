import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, CheckCircle, XCircle, Trash2, AlertTriangle, BellRing, User, MapPin, Calendar, FileText, HardHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProjectService } from '../../services/projectService';
import { FinanceService } from '../../services/financeService';
import type { Project } from '../../types/project';
import type { ProjectBudget, Expense } from '../../types/finance';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

import { ProjectWorkforceTab } from './ProjectWorkforceTab';
import { ProjectMaterialsTab } from './ProjectMaterialsTab';
import { ProjectEquipmentTab } from './ProjectEquipmentTab';
import { ProjectFinanceTab } from './ProjectFinanceTab';

type Tab = 'overview' | 'workforce' | 'materials' | 'equipment' | 'finance';

export const ProjectDetailsPage = () => {
  const { user } = useAuth();
  const isSupervisor = user?.role === 'SITE_SUPERVISOR' || user?.role === 'SUPERVISOR';

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [budget, setBudget] = useState<ProjectBudget | null>(null);
  const [, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Actions & Modals State
  const [statusTarget, setStatusTarget] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProjectService.getProjectById(parseInt(id));
      setProject(data);

      if (!isSupervisor) {
        try {
          const [budgetData, expensesData] = await Promise.all([
            FinanceService.getProjectBudget(data.id!),
            FinanceService.getProjectExpenses(data.id!)
          ]);
          setBudget(budgetData);
          setExpenses(expensesData);
        } catch (err) {
          console.warn("Could not load financial data");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id, isSupervisor]);

  const handleConfirmStatusUpdate = async () => {
    if (isSupervisor) return; // Prevent supervisors from status transitions
    if (!project?.id || !statusTarget) return;
    try {
      setIsSubmittingAction(true);
      setActionError(null);
      const updated = await ProjectService.updateProjectStatus(project.id, statusTarget);
      setProject(updated);
      setStatusTarget(null);
      fetchProjectData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update project status.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isSupervisor) return; // Prevent supervisors from deleting project
    if (!project?.id) return;
    try {
      setIsSubmittingAction(true);
      setActionError(null);
      await ProjectService.deleteProject(project.id);
      setIsDeleteModalOpen(false);
      navigate('/projects');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Card className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Link to="/projects" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-bold">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Projects Directory
        </Link>
        <Alert type="error" message={error || 'Project not found.'} />
      </div>
    );
  }

  const isReadOnly = project?.status === 'COMPLETED' || project?.status === 'CANCELLED';
  const outstandingAmount = budget?.outstandingAmount || 0;
  const isPaymentSettled = outstandingAmount <= 0;
  const budgetUsedPct = Math.min(((budget?.actualExpenses || 0) / (project.estimatedBudget || 1)) * 100, 100);

  const availableTabs: Tab[] = isSupervisor 
    ? ['overview', 'workforce', 'materials', 'equipment']
    : ['overview', 'workforce', 'materials', 'equipment', 'finance'];

  return (
    <div className="space-y-6">
      {/* SCROLLING STATUS TICKER BAR FOR COMPLETED/CANCELLED PROJECTS */}
      {isReadOnly && !isSupervisor && (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 flex items-center overflow-hidden">
          <div className="flex items-center px-3.5 py-1 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex-shrink-0 mr-3 shadow-md">
            <BellRing className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Project Status Ticker
          </div>
          <div className="overflow-x-auto whitespace-nowrap scrollbar-none flex items-center space-x-6 text-xs font-bold">
            <span className="inline-flex items-center px-3.5 py-1 rounded-xl bg-slate-800 border border-slate-700">
              {isPaymentSettled ? (
                <span className="text-emerald-400 font-black flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Project "{project.projectName}" (#{project.id}) — {project.status} WITH PAYMENTS FULLY SETTLED
                </span>
              ) : (
                <span className="text-amber-400 font-black flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  Project "{project.projectName}" (#{project.id}) — {project.status} WITHOUT PAYMENTS SETTLED (₹{outstandingAmount.toLocaleString('en-IN')} Outstanding)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start space-x-4">
          <Link to="/projects" className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 hover:text-white transition-all shadow-md mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{project.projectName}</h1>
              <Badge variant={project.status === 'ACTIVE' ? 'success' : (isReadOnly ? 'warning' : 'default')} className="text-xs font-black px-3 py-1 shadow-sm">
                {project.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1.5 flex items-center">
              <span className="px-2 py-0.5 bg-slate-800 rounded-md text-blue-300 font-bold mr-2">ID: #{project.id}</span>
              {project.location && (
                <span className="flex items-center text-slate-300 font-semibold">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-400" />
                  {project.location}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons: Restricted for Supervisor */}
        <div className="flex flex-wrap items-center gap-3">
          {isSupervisor ? (
            <span className="px-3.5 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 flex items-center shadow-sm">
              <HardHat className="w-4 h-4 mr-2 text-amber-400" />
              Field Supervisor (Operational Access Only)
            </span>
          ) : (
            <>
              {!isReadOnly && (
                <>
                  <button
                    onClick={() => { setStatusTarget('COMPLETED'); setActionError(null); }}
                    className="inline-flex items-center text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Mark Completed
                  </button>

                  <button
                    onClick={() => { setStatusTarget('CANCELLED'); setActionError(null); }}
                    className="inline-flex items-center text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Cancel Project
                  </button>
                </>
              )}

              <button
                onClick={() => { setIsDeleteModalOpen(true); setActionError(null); }}
                className="inline-flex items-center text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete Project
              </button>
            </>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-amber-50/90 border border-amber-300 p-5 rounded-2xl text-amber-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-xs font-black bg-amber-200 text-amber-950 rounded-xl uppercase tracking-wider flex-shrink-0 shadow-xs">
              Read Only Mode
            </span>
            <p className="text-xs font-bold text-amber-900">
              This project is <strong>{project.status}</strong>. Operations, material consumptions, and equipment assignments are locked.
            </p>
          </div>
        </div>
      )}

      {/* Financial Overview Metric Cards — Hidden for Site Supervisors */}
      {!isSupervisor && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-slate-200/80 shadow-md rounded-2xl hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estimated Budget</p>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">₹{project.estimatedBudget?.toLocaleString('en-IN')}</p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200/80 shadow-md rounded-2xl hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Invested / Actual Cost</p>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 mt-2">₹{budget?.actualExpenses?.toLocaleString('en-IN') || '0'}</p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200/80 shadow-md rounded-2xl hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Remaining Budget</p>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-700 mt-2">₹{((project.estimatedBudget || 0) - (budget?.actualExpenses || 0)).toLocaleString('en-IN')}</p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200/80 shadow-md rounded-2xl hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Budget Used</p>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-700 mt-2">{budgetUsedPct.toFixed(2)}%</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full transition-all" style={{ width: `${budgetUsedPct}%` }} />
            </div>
          </Card>
        </div>
      )}

      {/* Modern Tabs Bar */}
      <div className="border-b border-slate-200 bg-white p-2 rounded-2xl border shadow-sm">
        <nav className="flex space-x-2 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <Card className="p-8 bg-white border border-slate-200 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">Project Client & Overview Details</h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                Master Record
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <dt className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-blue-600" /> Client Name
                </dt>
                <dd className="mt-2 text-base font-extrabold text-slate-900">{project.clientName}</dd>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <dt className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-rose-500" /> Location
                </dt>
                <dd className="mt-2 text-base font-extrabold text-slate-900">{project.location || 'N/A'}</dd>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <dt className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-emerald-600" /> Timeline
                </dt>
                <dd className="mt-2 text-xs font-bold text-slate-900 space-y-1">
                  <div>Start: <strong className="text-slate-800">{project.startDate || 'N/A'}</strong></div>
                  <div>Completion: <strong className="text-slate-800">{project.expectedEndDate || 'N/A'}</strong></div>
                </dd>
              </div>

              <div className="md:col-span-2 lg:col-span-3 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <dt className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center mb-2">
                  <FileText className="w-4 h-4 mr-1.5 text-indigo-600" /> Project Description & Scope
                </dt>
                <dd className="text-sm text-slate-700 leading-relaxed font-medium">
                  {project.description || 'No detailed project description logged for this construction project.'}
                </dd>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'workforce' && <ProjectWorkforceTab projectId={project.id!} />}
        {activeTab === 'materials' && <ProjectMaterialsTab projectId={project.id!} />}
        {activeTab === 'equipment' && <ProjectEquipmentTab projectId={project.id!} isReadOnly={isReadOnly} />}
        {activeTab === 'finance' && !isSupervisor && budget && <ProjectFinanceTab projectId={project.id!} budget={budget} />}
      </div>

      {/* STATUS UPDATE CONFIRMATION MODAL */}
      {!isSupervisor && (
        <Modal
          isOpen={!!statusTarget}
          onClose={() => setStatusTarget(null)}
          title={`Confirm Status Transition — ${statusTarget}`}
        >
          {actionError && <Alert type="error" message={actionError} className="mb-4" />}
          {statusTarget && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-800">
                Are you sure you want to transition project <strong>"{project.projectName}"</strong> to <span className="uppercase text-blue-600 font-bold">{statusTarget}</span>?
              </p>

              {outstandingAmount > 0 ? (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center font-bold text-amber-800 text-sm">
                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-600 flex-shrink-0" />
                    Payment Warning: Incomplete Payments Remaining
                  </div>
                  <p className="text-xs text-amber-800">
                    This project currently has <strong>₹{outstandingAmount.toLocaleString('en-IN')}</strong> in remaining outstanding expenses / unpaid balances.
                  </p>
                  <p className="text-[11px] text-amber-700 italic">
                    Note: Marking the project as {statusTarget} blocks new daily operational entries, but remaining worker wages and vendor expenses can still be paid and settled in the Finance module anytime.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-bold">All financial payments for this project are fully settled (₹0 Outstanding).</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setStatusTarget(null)} disabled={isSubmittingAction}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmStatusUpdate} 
                  disabled={isSubmittingAction}
                  className={statusTarget === 'COMPLETED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : 'bg-amber-600 hover:bg-amber-700 text-white font-bold'}
                >
                  {isSubmittingAction ? 'Updating Status...' : `Confirm ${statusTarget}`}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* DELETE PROJECT CONFIRMATION MODAL */}
      {!isSupervisor && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Project Confirmation"
        >
          {actionError && <Alert type="error" message={actionError} className="mb-4" />}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-rose-900 bg-rose-50 p-5 rounded-2xl border border-rose-200">
              <AlertTriangle className="w-7 h-7 text-rose-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-extrabold">
                  Are you sure you want to permanently delete project "{project.projectName}"?
                </p>
                <p className="text-xs text-rose-700 mt-1 font-medium">
                  This action will delete the project record from the system.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmittingAction}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} disabled={isSubmittingAction} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                {isSubmittingAction ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
