import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, Eye, Trash2, AlertTriangle, CheckCircle, Clock, XCircle, ChevronRight, Layers, MapPin } from 'lucide-react';
import { ProjectService } from '../../services/projectService';
import type { Project } from '../../types/project';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ProjectFormModal } from './ProjectFormModal';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProjectService.getAllProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsSubmittingAction(true);
      setActionError(null);
      await ProjectService.deleteProject(deleteTarget.id!);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const metrics = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'ACTIVE').length;
    const completed = projects.filter(p => p.status === 'COMPLETED').length;
    const cancelled = projects.filter(p => p.status === 'CANCELLED').length;
    return { total, active, completed, cancelled };
  }, [projects]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': 
        return (
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-sm shadow-emerald-500/50" />
            ACTIVE
          </span>
        );
      case 'PLANNED': 
        return (
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-sky-500/10 text-sky-700 border border-sky-500/30 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-2" />
            PLANNED
          </span>
        );
      case 'COMPLETED': 
        return (
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-900 text-white border border-slate-700 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'CANCELLED': 
        return (
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/10 text-rose-700 border border-rose-500/30 shadow-xs">
            <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            CANCELLED
          </span>
        );
      default: 
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-2xl border border-slate-800/80">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">Projects Directory</h1>
                <p className="text-sm text-slate-300 font-medium">Enterprise project command center for lifecycle management & tracking.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider px-6 py-3.5 shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Projects</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Operations</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.active}</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Completed Projects</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{metrics.completed}</p>
          </div>
          <div className="p-3.5 bg-slate-100 text-slate-700 rounded-2xl group-hover:bg-slate-800 group-hover:text-white transition-colors">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cancelled Projects</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{metrics.cancelled}</p>
          </div>
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Main Table Card */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center shadow-sm">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Construction Projects Created Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Get started by creating your first construction project to manage workforce, inventory, equipment, and financial ledgers.</p>
          <div className="mt-6">
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase px-5 py-3">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200/90">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-slate-200">
                    Project Name & Info
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-wider text-slate-200">
                    Status
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-black uppercase tracking-wider text-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {projects.map((project) => {
                  return (
                    <tr key={project.id} className="hover:bg-blue-50/20 transition-all group">
                      {/* Project Name & Info Column */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-black flex items-center justify-center text-lg shadow-lg ring-2 ring-blue-100 group-hover:scale-105 transition-transform flex-shrink-0">
                            {project.projectName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                              {project.projectName}
                            </div>
                            <div className="text-xs text-slate-500 font-medium flex items-center mt-1 space-x-2">
                              <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-md font-mono text-[11px] font-bold shadow-xs">
                                ID: #{project.id}
                              </span>
                              {project.location && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                                  <MapPin className="w-3 h-3 mr-1 text-rose-500" />
                                  {project.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        {getStatusBadge(project.status)}
                      </td>

                      {/* Actions Column: View Details & Delete */}
                      <td className="px-6 py-5 whitespace-nowrap text-right text-xs font-medium space-x-2.5">
                        <Link 
                          to={`/projects/${project.id}`} 
                          className="inline-flex items-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-black px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                          title="View Complete Project Details"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> View Details
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Link>

                        <button
                          onClick={() => { setDeleteTarget(project); setActionError(null); }}
                          className="inline-flex items-center text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-xs"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELETE PROJECT CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Project Confirmation"
      >
        {actionError && <Alert type="error" message={actionError} className="mb-4" />}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-rose-900 bg-rose-50 p-5 rounded-2xl border border-rose-200">
            <AlertTriangle className="w-7 h-7 text-rose-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-extrabold">
                Are you sure you want to permanently delete project "{deleteTarget?.projectName}"?
              </p>
              <p className="text-xs text-rose-700 mt-1 font-medium">
                This action will delete the project record from the system.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isSubmittingAction}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={isSubmittingAction} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
              {isSubmittingAction ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      <ProjectFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={fetchProjects} 
      />
    </div>
  );
};
