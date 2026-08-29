import { useState, useEffect } from 'react';
import { EquipmentService } from '../../services/equipmentService';
import type { EquipmentUsageRecord, Equipment, EquipmentAssignment } from '../../types/equipment';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { RecordUsageModal } from './components/RecordUsageModal';

interface Props {
  projectId: number;
  isReadOnly?: boolean;
}

export const ProjectEquipmentTab = ({ projectId, isReadOnly = false }: Props) => {
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
      <div className="space-y-4 mt-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const totalEquipmentCost = usageRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const activeAssignments = assignments.filter(a => !a.returnDate);
  const returnedAssignments = assignments.filter(a => a.returnDate);

  return (
    <div className="mt-4 space-y-6">
      {/* Header & Total Equipment Cost Summary */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Project Equipment & Machinery</h3>
          <p className="text-xs text-gray-500 mt-0.5">Track assigned equipment and usage costs charged to this project.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-500">Total Equipment Cost</span>
            <p className="text-xl font-extrabold text-blue-600">₹{totalEquipmentCost.toLocaleString()}</p>
          </div>
          {!isReadOnly && (
            <Button onClick={() => setIsModalOpen(true)}>Record Usage</Button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Active Equipment Assignments Section */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
          <span>Active Assigned Equipment ({activeAssignments.length})</span>
        </h4>

        {activeAssignments.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No equipment currently assigned to this project.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeAssignments.map((asgn) => {
              const eq = equipmentMap[asgn.equipmentId];
              return (
                <div key={asgn.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900">{eq?.name || `Equipment #${asgn.equipmentId}`}</h5>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Assigned: {new Date(asgn.assignmentDate).toLocaleDateString()} • Qty: {asgn.assignedQuantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {eq?.ownershipType || 'EQUIPMENT'}
                    </span>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleReturnEquipment(asgn.id)}
                      disabled={returningId === asgn.id}
                      className="w-full mt-2 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                    >
                      {returningId === asgn.id ? 'Returning...' : 'Return Equipment'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Returned Equipment History Section */}
      {returnedAssignments.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm opacity-80">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Returned Equipment History ({returnedAssignments.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {returnedAssignments.map((asgn) => {
              const eq = equipmentMap[asgn.equipmentId];
              return (
                <div key={asgn.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">{eq?.name || `Equipment #${asgn.equipmentId}`}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Assigned: {new Date(asgn.assignmentDate).toLocaleDateString()} • Returned: {new Date(asgn.returnDate!).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                    RETURNED
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Equipment Usage History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h4 className="text-sm font-bold text-gray-900">Equipment Usage Logs ({usageRecords.length})</h4>
        </div>

        {usageRecords.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No equipment usage recorded for this project yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ownership</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Units Used</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageRecords.map((record) => {
                  const eq = equipmentMap[record.equipmentId];
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(record.usageDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{eq?.name || `Equipment #${record.equipmentId}`}</span>
                        <div className="text-xs text-gray-500">{eq?.type || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {eq?.ownershipType || 'EQUIPMENT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {record.unitsUsed} {eq?.usageUnit === 'HOURLY' ? 'hrs' : (eq?.usageUnit === 'DAILY' ? 'days' : 'units')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        ₹{record.appliedUnitRate?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">
                        ₹{record.totalCost?.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RecordUsageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
        projectId={projectId} 
      />
    </div>
  );
};
