import { useEffect, useState, useMemo } from 'react';
import { Users, HardHat, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
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

  const { totalWorkers, totalDaysWorked } = useMemo(() => {
    return {
      totalWorkers: summaries.length,
      totalDaysWorked: summaries.reduce((acc, s) => acc + (s.daysWorked || 0), 0)
    };
  }, [summaries]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><Skeleton className="h-20" /></Card>
          <Card><Skeleton className="h-20" /></Card>
        </div>
        <Card><Skeleton className="h-64" /></Card>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Project Workforce</h2>
        <Button variant="primary">
          + Assign Worker
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex items-center space-x-4 p-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Workers</p>
            <p className="text-xl font-bold text-gray-900">{totalWorkers}</p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4 p-4 border-l-4 border-green-500">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Days Worked</p>
            <p className="text-xl font-bold text-gray-900">{totalDaysWorked}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compensation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No workers assigned to this project yet.
                  </td>
                </tr>
              ) : summaries.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        <HardHat className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{worker.firstName} {worker.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {worker.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {worker.compensationType.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to="/workforce" className="text-blue-600 hover:text-blue-900">
                      Manage in Workforce
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
