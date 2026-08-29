import { useState, useEffect } from 'react';
import { EquipmentService } from '../../services/equipmentService';
import type { EquipmentUsageRecord, Equipment, EquipmentAssignment } from '../../types/equipment';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { RecordUsageModal } from './components/RecordUsageModal';
import { Truck, Wrench, IndianRupee, Clock, RotateCcw, Plus, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';

interface Props {
  projectId: number;
  isReadOnly?: boolean;
}

export const ProjectEquipmentTab = ({ projectId, isReadOnly = false }: Props) => {
  const navigate = useNavigate();
  const [usageRecords, setUsageRecords] = useState<EquipmentUsageRecord[]>([]);
  const [assignments, setAssignments] = useState<EquipmentAssignment[]>([]);
  const [equipmentMap, setEquipmentMap] = useState<Record<number, Equipment>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returningId, setReturningId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [records, assignmentList, equipmentList] = await Promise.all([
        EquipmentService.getUsageByProjectId(projectId).catch(() => []),
        EquipmentService.getProjectAssignments(projectId).catch(() => []),
        EquipmentService.getAllEquipment().catch(() => [])
      ]);
      
      setUsageRecords(records);
      setAssignments(assignmentList);
      
      const map: Record<number, Equipment> = {};
      equipmentList.forEach(eq => {
        map[eq.id] = eq;
      });
      setEquipmentMap(map);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load equipment data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleReturnEquipment = async (assignmentId: number) => {
    if (isReadOnly) return;
    try {
      setReturningId(assignmentId);
      await EquipmentService.returnEquipment(assignmentId);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to return equipment.');
    } finally {
      setReturningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><Skeleton className="h-24 w-full" /></Card>
          <Card><Skeleton className="h-24 w-full" /></Card>
          <Card><Skeleton className="h-24 w-full" /></Card>
        </div>
        <Card><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  const totalEquipmentCost = usageRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const activeAssignments = assignments.filter(a => !a.returnDate);
  const returnedAssignments = assignments.filter(a => a.returnDate);

  return (
    <div className="mt-4 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 backdrop-blur-md rounded-lg border border-blue-400/30">
              <Truck className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Project Equipment & Machinery Hub</h2>
          </div>
          <p className="text-xs text-blue-200 mt-1">
            Track deployed heavy machinery, rental/owned equipment, and site usage costs.
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-md flex items-center"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Record Usage Log
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/equipment')}
              className="text-white border-white/20 hover:bg-white/10 text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center"
            >
              Master Fleet <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-blue-300" />
            </Button>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl mr-4 border border-blue-100">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Deployed Equipment</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{activeAssignments.length} Units</p>
            <p className="text-xs text-gray-400 mt-1">Currently on site</p>
          </div>
        </Card>

        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl mr-4 border border-emerald-100">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Equipment Usage Cost</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">₹{totalEquipmentCost.toLocaleString('en-IN')}</p>
            <p className="text-xs text-emerald-600 mt-1">Charged to project cost</p>
          </div>
        </Card>

        <Card className="flex items-center p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl mr-4 border border-indigo-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage Sessions Logged</p>
            <p className="text-2xl font-bold text-indigo-800 mt-0.5">{usageRecords.length} Sessions</p>
            <p className="text-xs text-indigo-600 mt-1">Recorded usage logs</p>
          </div>
        </Card>
      </div>

      {/* Active Equipment Assignments Section */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Active Machinery Deployed ({activeAssignments.length})</h3>
            <p className="text-xs text-gray-500 mt-0.5">Machinery currently assigned and operating on this site.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
            {activeAssignments.length} Operating
          </span>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Info className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-semibold text-gray-800">No Equipment Currently Deployed</p>
            <p className="text-xs text-gray-500 mt-1">Assign equipment from the Equipment Master Registry to deploy machinery here.</p>
            {!isReadOnly && (
              <Button
                variant="outline"
                onClick={() => navigate('/equipment')}
                className="mt-4 text-xs font-bold"
              >
                Go to Equipment Registry
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAssignments.map((asgn) => {
              const eq = equipmentMap[asgn.equipmentId];
              return (
                <div key={asgn.id} className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <h4 className="text-sm font-bold text-gray-900">{eq?.name || `Equipment #${asgn.equipmentId}`}</h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Reg/ID: {eq?.registrationNumber || `#${asgn.equipmentId}`} • Qty: <strong>{asgn.assignedQuantity}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Assigned: {new Date(asgn.assignmentDate).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-blue-700 font-bold mt-1">
                        Agreed Rate: ₹{(asgn.agreedUnitRate ?? eq?.unitRate ?? 0).toLocaleString('en-IN')}/{eq?.usageUnit === 'HOURLY' ? 'hr' : 'day'}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                      {eq?.ownershipType || 'EQUIPMENT'}
                    </span>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => handleReturnEquipment(asgn.id)}
                      disabled={returningId === asgn.id}
                      className="w-full mt-2 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center justify-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      {returningId === asgn.id ? 'Returning...' : 'Return Equipment'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Returned Equipment History Section */}
      {returnedAssignments.length > 0 && (
        <Card className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm opacity-90">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-slate-500" /> Returned Equipment History ({returnedAssignments.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {returnedAssignments.map((asgn) => {
              const eq = equipmentMap[asgn.equipmentId];
              return (
                <div key={asgn.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-gray-800">{eq?.name || `Equipment #${asgn.equipmentId}`}</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Assigned: {new Date(asgn.assignmentDate).toLocaleDateString()} • Returned: {new Date(asgn.returnDate!).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">
                    RETURNED
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Equipment Usage History Table */}
      <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Equipment Usage Logs ({usageRecords.length})</h3>
            <p className="text-xs text-gray-500 mt-0.5">Chronological record of operational hours/days logged on this site.</p>
          </div>
        </div>

        {usageRecords.length === 0 ? (
          <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Info className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-semibold text-gray-800">No Equipment Usage Logged Yet</p>
            <p className="text-xs text-gray-500 mt-1">Click "Record Usage Log" to record hours or daily usage for machinery.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Usage Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Equipment Details</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ownership</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Units Used</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Applied Rate</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Total Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageRecords.map((record) => {
                  const eq = equipmentMap[record.equipmentId];
                  return (
                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {new Date(record.usageDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Wrench className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-bold text-gray-900">{eq?.name || `Equipment #${record.equipmentId}`}</span>
                            <div className="text-xs text-gray-500 font-mono">{eq?.type || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {eq?.ownershipType || 'EQUIPMENT'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-extrabold text-gray-900">
                        {record.unitsUsed} {eq?.usageUnit === 'HOURLY' ? 'hrs' : (eq?.usageUnit === 'DAILY' ? 'days' : 'units')}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        ₹{record.appliedUnitRate?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-black text-blue-600">
                        ₹{record.totalCost?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <RecordUsageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
        projectId={projectId} 
      />
    </div>
  );
};
