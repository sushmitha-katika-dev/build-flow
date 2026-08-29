import { useState, useEffect } from 'react';
import { EquipmentService } from '../../../services/equipmentService';
import type { Equipment, EquipmentUsageCreateRequest } from '../../../types/equipment';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';
import { Info, Truck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
}

interface AssignedEquipmentOption {
  equipment: Equipment;
  agreedRate: number;
  assignedQty: number;
}

export const RecordUsageModal = ({ isOpen, onClose, onSuccess, projectId }: Props) => {
  const [assignedOptions, setAssignedOptions] = useState<AssignedEquipmentOption[]>([]);
  const [formData, setFormData] = useState<EquipmentUsageCreateRequest>({
    equipmentId: 0,
    projectId: projectId,
    usageDate: new Date().toISOString().split('T')[0],
    unitsUsed: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      setIsFetchingData(true);
      setError(null);
      
      // Fetch ONLY equipment currently assigned & deployed to THIS project
      Promise.all([
        EquipmentService.getProjectAssignments(projectId).catch(() => []),
        EquipmentService.getAllEquipment().catch(() => [])
      ])
        .then(([assignments, allEquipment]) => {
          const eqMap: Record<number, Equipment> = {};
          allEquipment.forEach(e => { eqMap[e.id] = e; });

          // Filter active site assignments only (not returned)
          const activeAssignments = assignments.filter(a => !a.returnDate);
          
          const options: AssignedEquipmentOption[] = activeAssignments.map(a => {
            const eq = eqMap[a.equipmentId] || {
              id: a.equipmentId,
              name: `Equipment #${a.equipmentId}`,
              type: 'MACHINERY',
              ownershipType: 'OWNED',
              unitRate: a.agreedUnitRate || 0,
              usageUnit: 'HOURLY'
            };
            return {
              equipment: eq,
              agreedRate: a.agreedUnitRate ?? eq.unitRate ?? 0,
              assignedQty: a.assignedQuantity || 1
            };
          });

          setAssignedOptions(options);

          if (options.length > 0) {
            setFormData(prev => ({ ...prev, equipmentId: options[0].equipment.id, projectId }));
          } else {
            setFormData(prev => ({ ...prev, equipmentId: 0, projectId }));
          }
        })
        .catch(() => {
          setError('Failed to load deployed equipment for this site.');
        })
        .finally(() => {
          setIsFetchingData(false);
        });
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.equipmentId === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await EquipmentService.recordUsage(formData);
      onSuccess();
      onClose();
      setFormData(prev => ({ ...prev, unitsUsed: 1 }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record equipment usage.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOption = assignedOptions.find(opt => opt.equipment.id === formData.equipmentId);
  const selectedEquipment = selectedOption?.equipment;
  const appliedRate = selectedOption?.agreedRate ?? selectedEquipment?.unitRate ?? 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Record Equipment Usage</h3>
              <p className="text-xs text-gray-500">Log operational hours/days for machinery assigned to this site.</p>
            </div>
          </div>

          {error && <Alert type="error" message={error} className="mb-4" />}

          {isFetchingData ? (
            <div className="py-8 text-center text-xs text-gray-500 font-medium">
              Loading active site machinery...
            </div>
          ) : assignedOptions.length === 0 ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-800 text-xs flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">No Machinery Currently Deployed</p>
                  <p className="mt-1 text-amber-700 leading-relaxed">
                    There is no active equipment currently assigned to this project site. You must deploy machinery from the <strong>Equipment Master Registry</strong> first before logging usage.
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Deployed Equipment *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: parseInt(e.target.value) })}
                >
                  {assignedOptions.map(opt => (
                    <option key={opt.equipment.id} value={opt.equipment.id}>
                      {opt.equipment.name} ({opt.equipment.registrationNumber || opt.equipment.type}) — Agreed: ₹{opt.agreedRate.toLocaleString()}/{opt.equipment.usageUnit === 'HOURLY' ? 'hr' : 'day'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Usage Date *</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.usageDate}
                  onChange={(e) => setFormData({ ...formData, usageDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Units Used ({selectedEquipment?.usageUnit === 'HOURLY' ? 'Hours' : 'Days'}) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  value={formData.unitsUsed || ''}
                  onChange={(e) => setFormData({ ...formData, unitsUsed: parseFloat(e.target.value) || 0 })}
                />
              </div>

              {selectedEquipment && formData.unitsUsed > 0 && (
                <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs">
                  <div className="flex justify-between items-center text-blue-900 font-bold">
                    <span>Estimated Usage Cost:</span>
                    <span className="text-base text-blue-700">₹{(formData.unitsUsed * appliedRate).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-blue-600 mt-1 font-medium">
                    Calculated at agreed site rate (₹{appliedRate.toLocaleString()}/{selectedEquipment.usageUnit === 'HOURLY' ? 'hr' : 'day'}) × {formData.unitsUsed} {selectedEquipment.usageUnit === 'HOURLY' ? 'hrs' : 'days'}.
                  </p>
                </div>
              )}

              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse space-x-2 space-x-reverse">
                <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl" disabled={isLoading || formData.equipmentId === 0}>
                  {isLoading ? 'Saving...' : 'Record Usage'}
                </Button>
                <Button type="button" variant="secondary" className="w-full sm:w-auto rounded-xl" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
