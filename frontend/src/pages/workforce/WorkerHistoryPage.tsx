import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { WorkforceService } from '../../services/workforceService';
import { ProjectService } from '../../services/projectService';
import type { LabourWorkforceSummary, AttendanceRecord, WageRecord } from '../../types/workforce';
import type { Project } from '../../types/project';
import { User, Briefcase, IndianRupee, Calendar, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export const WorkerHistoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const workerId = Number(id);

  const [worker, setWorker] = useState<LabourWorkforceSummary | null>(location.state?.worker || null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [wageHistory, setWageHistory] = useState<WageRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<number[]>([]);
  const [selectedWageIds, setSelectedWageIds] = useState<number[]>([]);

  // Filter state
  const [filterProjectId, setFilterProjectId] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const loadData = async () => {
    if (!workerId) return;
    try {
      setIsLoading(true);
      // If worker state wasn't passed via routing, fetch it
      if (!worker) {
        const summaries = await WorkforceService.getLabourSummary();
        const found = summaries.find(w => w.id === workerId);
        if (found) setWorker(found);
        else throw new Error("Worker not found");
      }

      const [attData, wageData, projData] = await Promise.all([
        WorkforceService.getAttendanceByLabourId(workerId).catch(() => []),
        WorkforceService.getWagesByLabourId(workerId).catch(() => []),
        ProjectService.getAllProjects().catch(() => [])
      ]);

      setAttendanceHistory(Array.isArray(attData) ? attData : []);
      setWageHistory(Array.isArray(wageData) ? wageData : []);
      setProjects(Array.isArray(projData) ? projData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load worker history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workerId]);

  const formatRecordDate = (dateVal: any) => {
    if (!dateVal) return 'Unknown';
    if (Array.isArray(dateVal)) {
      return `${dateVal[0]}-${String(dateVal[1]).padStart(2, '0')}-${String(dateVal[2]).padStart(2, '0')}`;
    }
    return String(dateVal);
  };

  const getProjectName = (projId: number | null | undefined, notes?: string) => {
    if (!projId) {
      return notes ? `Other: ${notes}` : 'Other';
    }
    const p = projects.find(proj => proj.id === projId);
    return p ? p.projectName : `Project #${projId}`;
  };

  const handleDeleteSelectedAttendance = async () => {
    if (selectedAttendanceIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedAttendanceIds.length} attendance record(s)?`)) return;

    try {
      setIsLoading(true);
      await WorkforceService.bulkDeleteAttendance(selectedAttendanceIds);
      setSelectedAttendanceIds([]);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSelectedWages = async () => {
    if (selectedWageIds.length === 0) return;
    if (!confirm(`Are you sure you want to cancel ${selectedWageIds.length} wage payment(s)?`)) return;

    try {
      setIsLoading(true);
      await WorkforceService.bulkCancelWages(selectedWageIds);
      setSelectedWageIds([]);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel wages');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttendanceSelection = (id: number) => {
    setSelectedAttendanceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleWageSelection = (id: number) => {
    setSelectedWageIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredAttendance = attendanceHistory.filter(record => {
    const recordDate = formatRecordDate(record.date);
    if (filterProjectId && String(record.projectId) !== filterProjectId) return false;
    if (filterStartDate && recordDate < filterStartDate) return false;
    if (filterEndDate && recordDate > filterEndDate) return false;
    return true;
  });

  if (!worker && !isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/workforce')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <Alert type="error" message="Worker not found" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/workforce')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workforce
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Worker History</h1>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {worker && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{worker.firstName} {worker.lastName}</h2>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Briefcase className="w-4 h-4 mr-1" />
                {worker.role} • {worker.compensationType?.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1 flex items-center"><Calendar className="w-4 h-4 mr-1" /> Days Worked</p>
              <p className="text-xl font-bold text-gray-900">{worker.daysWorked || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1 flex items-center"><IndianRupee className="w-4 h-4 mr-1" /> Total Earned</p>
              <p className="text-xl font-bold text-gray-900">₹{(worker.totalEarned || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1 flex items-center"><IndianRupee className="w-4 h-4 mr-1" /> Amount Paid</p>
              <p className="text-xl font-bold text-green-600">₹{(worker.amountPaid || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1 flex items-center"><IndianRupee className="w-4 h-4 mr-1" /> Pending Pay</p>
              <p className="text-xl font-bold text-amber-600">₹{(worker.remainingAmount || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" /> Attendance History
            </h3>
            {selectedAttendanceIds.length > 0 && (
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs py-1" onClick={handleDeleteSelectedAttendance} disabled={isLoading}>
                <Trash2 className="w-3 h-3 mr-1" /> Delete ({selectedAttendanceIds.length})
              </Button>
            )}
          </div>
          
          <div className="p-3 border-b border-gray-200 flex space-x-2 text-sm bg-white">
            <select className="border border-gray-300 rounded px-2 py-1 flex-1" value={filterProjectId} onChange={e => setFilterProjectId(e.target.value)}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
            </select>
            <input type="date" className="border border-gray-300 rounded px-2 py-1" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} title="From Date" />
            <input type="date" className="border border-gray-300 rounded px-2 py-1" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} title="To Date" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {filteredAttendance.length === 0 ? (
              <div className="text-center text-gray-500 py-10 italic">No attendance records found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttendance.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" checked={selectedAttendanceIds.includes(record.id)} onChange={() => toggleAttendanceSelection(record.id)} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatRecordDate(record.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{getProjectName(record.projectId, record.notes)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' : record.status === 'HALF_DAY' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {record.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">₹{record.earned || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-2" /> Payment History
            </h3>
            {selectedWageIds.length > 0 && (
              <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs py-1" onClick={handleCancelSelectedWages} disabled={isLoading}>
                <Trash2 className="w-3 h-3 mr-1" /> Cancel ({selectedWageIds.length})
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {wageHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-10 italic">No payment records found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wageHistory.map(record => (
                    <tr key={record.id} className={record.status === 'CANCELLED' ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" checked={selectedWageIds.includes(record.id)} onChange={() => toggleWageSelection(record.id)} disabled={record.status === 'CANCELLED'} />
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${record.status === 'CANCELLED' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{formatRecordDate(record.paymentDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{getProjectName(record.projectId, record.notes)}</td>
                      <td className="px-4 py-3">
                        {record.status === 'CANCELLED' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500">CANCELLED</span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">ACTIVE</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold ${record.status === 'CANCELLED' ? 'text-gray-400' : 'text-gray-900'}`}>₹{record.amountPaid.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
