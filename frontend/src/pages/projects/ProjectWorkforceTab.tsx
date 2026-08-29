import { useEffect, useState, useMemo } from 'react';
import { Users, HardHat, CalendarCheck, ArrowRight, UserPlus, Info, Phone, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkforceService } from '../../services/workforceService';
import type { LabourWorkforceSummary } from '../../types/workforce';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';

interface ProjectWorkforceTabProps {
  projectId: number;
}

export const ProjectWorkforceTab = ({ projectId }: ProjectWorkforceTabProps) => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<LabourWorkforceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkforce = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await WorkforceService.getLabourSummaryByProject(projectId);
      setSummaries(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project workforce.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforce();
  }, [projectId]);

  const { totalWorkers, totalDaysWorked, foremenCount, dailyLabourersCount } = useMemo(() => {
    let foremenCount = 0;
    let dailyLabourersCount = 0;

    summaries.forEach((s) => {
      if (s.role === 'FOREMAN') foremenCount++;
      if (s.compensationType === 'DAILY') dailyLabourersCount++;
    });

    return {
      totalWorkers: summaries.length,
      totalDaysWorked: summaries.reduce((acc, s) => acc + (s.daysWorked || 0), 0),
      foremenCount,
      dailyLabourersCount
    };
  }, [summaries]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><Skeleton className="h-24 w-full" /></Card>
          <Card><Skeleton className="h-24 w-full" /></Card>
          <Card><Skeleton className="h-24 w-full" /></Card>
        </div>
        <Card><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 backdrop-blur-md rounded-lg border border-blue-400/30">
              <HardHat className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Project Workforce Deployment</h2>
          </div>
          <p className="text-xs text-blue-200 mt-1">
            Active workers, foremen, and supervisors deployed on this project site.
          </p>
        </div>

        <Button 
          onClick={() => navigate('/workforce')}
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-md flex items-center"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Onboard / Manage in Workforce
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl mr-4 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Workers</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalWorkers}</p>
            <p className="text-xs text-gray-400 mt-1">{foremenCount} Foremen • {dailyLabourersCount} Daily Labourers</p>
          </div>
        </Card>

        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl mr-4 border border-emerald-100">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Site Days Worked</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">{totalDaysWorked}</p>
            <p className="text-xs text-emerald-600 mt-1">Total logged attendance days</p>
          </div>
        </Card>

        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl mr-4 border border-purple-100">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Foremen / Subcontractors</p>
            <p className="text-2xl font-bold text-purple-800 mt-0.5">{foremenCount}</p>
            <p className="text-xs text-purple-600 mt-1">Fixed piecework agreements</p>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Assigned Team Roster</h3>
            <p className="text-xs text-gray-500 mt-0.5">List of all workers currently assigned to this project site.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            {summaries.length} Workers Active
          </span>
        </div>

        {summaries.length === 0 ? (
          <div className="text-center py-14 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Info className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <h4 className="text-sm font-semibold text-gray-800">No Workers Assigned to this Project</h4>
            <p className="text-xs text-gray-500 mt-1">Onboard or assign workers to this project site from the Workforce Registry.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/workforce')}
              className="mt-4 text-xs font-bold"
            >
              Go to Workforce Master Registry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Worker Details</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Designation / Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Compensation Model</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Site Days Worked</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summaries.map((worker) => (
                  <tr key={worker.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Worker Details */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                        </div>
                        <div className="ml-3.5">
                          <div className="text-sm font-bold text-gray-900">{worker.firstName} {worker.lastName}</div>
                          <div className="text-xs text-gray-500 font-mono flex items-center mt-0.5">
                            ID: #{worker.id} {worker.phoneNumber && <><Phone className="w-3 h-3 ml-2 mr-1 text-gray-400" /> {worker.phoneNumber}</>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getRoleBadgeColor(worker.role)}`}>
                        {worker.role}
                      </span>
                    </td>

                    {/* Compensation Model */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs font-extrabold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {worker.compensationType ? worker.compensationType.replace('_', ' ') : 'DAILY'}
                      </span>
                    </td>

                    {/* Site Days Worked */}
                    <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                      {worker.daysWorked || 0} days
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link 
                        to="/workforce" 
                        className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all"
                      >
                        Manage in Workforce <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
