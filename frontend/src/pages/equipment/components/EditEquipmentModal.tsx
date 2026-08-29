import { useState, useEffect } from 'react';
import { EquipmentService } from '../../../services/equipmentService';
import type { Equipment, EquipmentType, EquipmentStatus, OwnershipType, UsageUnit } from '../../../types/equipment';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipment: Equipment | null;
}

export const EditEquipmentModal = ({ isOpen, onClose, onSuccess, equipment }: Props) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'HEAVY_MACHINERY' as EquipmentType,
    status: 'AVAILABLE' as EquipmentStatus,
    registrationNumber: '',
    ownershipType: 'OWNED' as OwnershipType,
    usageUnit: 'HOURLY' as UsageUnit,
    unitRate: 0,
    isBulk: false,
    totalQuantity: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        type: equipment.type || 'HEAVY_MACHINERY',
        status: equipment.status || 'AVAILABLE',
        registrationNumber: equipment.registrationNumber || '',
        ownershipType: equipment.ownershipType || 'OWNED',
        usageUnit: equipment.usageUnit || 'HOURLY',
        unitRate: equipment.unitRate || 0,
        isBulk: equipment.isBulk || false,
        totalQuantity: equipment.totalQuantity || 1
      });
    }
  }, [equipment]);

  if (!isOpen || !equipment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await EquipmentService.updateEquipment(equipment.id, formData as any);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update equipment details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Edit Equipment & Status: {equipment.name}
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Equipment Name *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Operational Status *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                >
                  <option value="AVAILABLE">Available (In Yard)</option>
                  <option value="IN_USE">In Use (On Site)</option>
                  <option value="UNDER_MAINTENANCE">🔧 Under Maintenance (Repair/Servicing)</option>
                  <option value="OUT_OF_SERVICE">🚫 Out of Service (Decommissioned)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Type / Category *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EquipmentType })}
                >
                  <option value="HEAVY_MACHINERY">Heavy Machinery</option>
                  <option value="VEHICLE">Vehicle</option>
                  <option value="POWER_TOOL">Power Tool</option>
                  <option value="HAND_TOOL">Hand Tool</option>
                  <option value="SAFETY_GEAR">Safety Gear</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Registration / Serial Number</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Ownership *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.ownershipType}
                  onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value as OwnershipType })}
                >
                  <option value="OWNED">Owned</option>
                  <option value="RENTED">Rented</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Usage Unit *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.usageUnit}
                  onChange={(e) => setFormData({ ...formData, usageUnit: e.target.value as UsageUnit })}
                >
                  <option value="HOURLY">Hourly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Default Base Rate (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.unitRate === 0 ? '' : formData.unitRate}
                onChange={(e) => setFormData({ ...formData, unitRate: e.target.value ? parseFloat(e.target.value) : 0 })}
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse space-x-2 space-x-reverse">
              <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto rounded-xl" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
