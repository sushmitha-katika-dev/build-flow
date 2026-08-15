import { useEffect, useState } from 'react';
import { Users, CheckCircle } from 'lucide-react';
import { WorkforceService } from '../../services/workforceService';
import { ProjectService } from '../../services/projectService';
import type { Labourer, LogAttendanceRequest, AttendanceStatus } from '../../types/workforce';
import type { Project } from '../../types/project';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';

export const WorkforcePage = () => {
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<LogAttendanceRequest>({
    labourer_id: 0,
    project_id: 0,
    record_date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch both concurrently
        const [labourData, projectData] = await Promise.all([
          WorkforceService.getAllLabourers(),
          ProjectService.getAllProjects(),
        ]);
        setLabourers(labourData);
        setProjects(projectData);

        if (labourData.length > 0) {
          setFormData(prev => ({ ...prev, labourer_id: labourData[0].id }));
        }
        if (projectData.length > 0) {
          setFormData(prev => ({ ...prev, project_id: projectData[0].id }));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load workforce data. The service might be unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!formData.labourer_id || !formData.project_id) {
      setFormError('Please select a labourer and a project.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await WorkforceService.logAttendance(formData);
      setSuccessMessage(`Attendance logged! Calculated wage: $${res.calculated_wage.toLocaleString()}`);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to log attendance. (Conflict: Already logged today?)');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Workforce Management</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Skeleton className="h-48 w-full" /></Card>
          <Card><Skeleton className="h-48 w-full" /></Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Workforce Management</h1>
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workforce Management</h1>
        <p className="text-sm text-gray-500">Log attendance and view the labour registry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Form */}
        <Card title="Log Daily Attendance">
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {successMessage && <Alert type="success" message={successMessage} />}
            {formError && <Alert type="error" message={formError} />}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Worker</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.labourer_id}
                onChange={(e) => setFormData({ ...formData, labourer_id: parseInt(e.target.value) })}
                disabled={isSubmitting}
              >
                {labourers.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.firstName} {l.lastName} - {l.trade || 'Worker'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 mt-4">
              <label className="block text-sm font-medium text-gray-700">Project Assignment</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) })}
                disabled={isSubmitting}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Record Date"
              type="date"
              value={formData.record_date}
              onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
              disabled={isSubmitting}
            />

            <div className="space-y-1 mt-4">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AttendanceStatus })}
                disabled={isSubmitting}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={isSubmitting} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Attendance
              </Button>
            </div>
          </form>
        </Card>

        {/* Worker Registry Table */}
        <Card title="Worker Registry">
          {labourers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p>No labourers found in the registry.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {labourers.map((labourer) => (
                    <tr key={labourer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{labourer.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {labourer.firstName} {labourer.lastName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{labourer.trade}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        ${labourer.dailyRate}/day
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
