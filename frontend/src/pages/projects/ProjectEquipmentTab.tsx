import { useState, useEffect } from 'react';
import { EquipmentService } from '../../services/equipmentService';
import type { EquipmentUsageRecord, Equipment } from '../../types/equipment';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { RecordUsageModal } from './components/RecordUsageModal';

interface Props {
  projectId: number;
}

export const ProjectEquipmentTab = ({ projectId }: Props) => {
  const [usageRecords, setUsageRecords] = useState<EquipmentUsageRecord[]>([]);
  const [equipmentMap, setEquipmentMap] = useState<Record<number, Equipment>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [records, equipmentList] = await Promise.all([
        EquipmentService.getUsageByProjectId(projectId),
        EquipmentService.getAllEquipment()
      ]);
      
      setUsageRecords(records);
      
      const map: Record<number, Equipment> = {};
      equipmentList.forEach(eq => {
        map[eq.id] = eq;
      });
      setEquipmentMap(map);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load equipment usage.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Equipment Usage</h3>
        <Button onClick={() => setIsModalOpen(true)}>Record Usage</Button>
      </div>

      {error && <Alert type="error" message={error} />}

      {usageRecords.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
          <p className="text-gray-500">No equipment usage recorded for this project yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageRecords.map((record) => {
                const eq = equipmentMap[record.equipmentId];
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.usageDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{eq?.name || `Unknown (${record.equipmentId})`}</span>
                      <div className="text-xs text-gray-500">{eq?.type || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.unitsUsed} {eq?.usageUnit === 'HOURLY' ? 'hrs' : (eq?.usageUnit === 'DAILY' ? 'days' : 'units')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{record.appliedUnitRate?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{record.totalCost?.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <RecordUsageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
        projectId={projectId} 
      />
    </div>
  );
};
