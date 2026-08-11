import { useEffect, useState } from 'react';
import { Plus, Tractor, ArrowRightLeft } from 'lucide-react';
import { EquipmentService } from '../../services/equipmentService';
import type { Equipment } from '../../types/equipment';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';
import { EquipmentFormModal } from './components/EquipmentFormModal';
import { AssignEquipmentModal } from './components/AssignEquipmentModal';

export const EquipmentPage = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await EquipmentService.getAllEquipment();
      setEquipmentList(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load equipment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge variant="success">Available</Badge>;
      case 'IN_USE': return <Badge variant="info">In Use</Badge>;
      case 'UNDER_MAINTENANCE': return <Badge variant="warning">Maintenance</Badge>;
      case 'OUT_OF_SERVICE': return <Badge variant="error">Out of Service</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-sm text-gray-500">Manage machinery and tools.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setIsAssignModalOpen(true)}>
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Assign Equipment
          </Button>
          <Button onClick={() => setIsEquipmentModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 border-dashed p-12 text-center">
          <Tractor className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No equipment found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding machinery or tools.</p>
          <div className="mt-6">
            <Button onClick={() => setIsEquipmentModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Reg No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                      <div className="text-sm text-gray-500">{eq.registrationNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eq.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(eq.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eq.isBulk ? `${eq.availableQuantity} / ${eq.totalQuantity}` : eq.totalQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EquipmentFormModal 
        isOpen={isEquipmentModalOpen} 
        onClose={() => setIsEquipmentModalOpen(false)} 
        onSuccess={fetchEquipment} 
      />

      <AssignEquipmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        equipmentList={equipmentList}
      />
    </div>
  );
};
