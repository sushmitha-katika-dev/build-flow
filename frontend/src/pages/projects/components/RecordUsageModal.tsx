import { useState, useEffect } from 'react';
import { EquipmentService } from '../../../services/equipmentService';
import type { Equipment, EquipmentUsageCreateRequest } from '../../../types/equipment';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
}

export const RecordUsageModal = ({ isOpen, onClose, onSuccess, projectId }: Props) => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [formData, setFormData] = useState<EquipmentUsageCreateRequest>({
    equipmentId: 0,
    projectId: projectId,
    usageDate: new Date().toISOString().split('T')[0],
    unitsUsed: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch available equipment
      EquipmentService.getAllEquipment()
        .then(data => {
          setEquipmentList(data.filter(eq => eq.status !== 'RETIRED' && eq.status !== 'OUT_OF_SERVICE'));
          if (data.length > 0 && formData.equipmentId === 0) {
            setFormData(prev => ({ ...prev, equipmentId: data[0].id }));
          }
        })
        .catch(() => {
          setError('Failed to load equipment list.');
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await EquipmentService.recordUsage(formData);
      onSuccess();
      onClose();
      setFormData(prev => ({ ...prev, unitsUsed: 1 })); // reset
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record equipment usage.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEquipment = equipmentList.find(eq => eq.id === formData.equipmentId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Record Equipment Usage
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Equipment *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: parseInt(e.target.value) })}
              >
                <option value={0} disabled>Select equipment</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.registrationNumber || eq.type}) - ₹{eq.unitRate}/{eq.usageUnit === 'HOURLY' ? 'hr' : 'day'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Usage Date *</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.usageDate}
                onChange={(e) => setFormData({ ...formData, usageDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Units Used ({selectedEquipment?.usageUnit === 'HOURLY' ? 'Hours' : 'Days'}) *
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.unitsUsed || ''}
                onChange={(e) => setFormData({ ...formData, unitsUsed: parseFloat(e.target.value) || 0 })}
              />
            </div>

            {selectedEquipment && formData.unitsUsed > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Estimated Cost: </span>
                  ₹{(formData.unitsUsed * selectedEquipment.unitRate).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">Cost is finalized securely by the backend.</p>
              </div>
            )}

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" className="w-full sm:ml-3 sm:w-auto" disabled={isLoading || formData.equipmentId === 0}>
                {isLoading ? 'Saving...' : 'Record Usage'}
              </Button>
              <Button type="button" variant="secondary" className="mt-3 w-full sm:mt-0 sm:w-auto" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
