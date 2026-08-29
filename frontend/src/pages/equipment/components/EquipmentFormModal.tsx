import { useState } from 'react';
import { EquipmentService } from '../../../services/equipmentService';
import type { EquipmentCreateRequest, EquipmentType } from '../../../types/equipment';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EquipmentFormModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState<EquipmentCreateRequest>({
    name: '',
    type: 'HEAVY_MACHINERY',
    status: 'AVAILABLE',
    registrationNumber: '',
    ownershipType: 'OWNED',
    usageUnit: 'HOURLY',
    unitRate: 0,
    isBulk: false,
    totalQuantity: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await EquipmentService.createEquipment(formData);
      onSuccess();
      onClose();
      setFormData({
        name: '',
        type: 'HEAVY_MACHINERY',
        status: 'AVAILABLE',
        registrationNumber: '',
        ownershipType: 'OWNED',
        usageUnit: 'HOURLY',
        unitRate: 0,
        isBulk: false,
        totalQuantity: 1
      });
    } catch (err: any) {
      console.error("Add equipment error:", err.response?.data);
      if (err.response?.data?.errors) {
        const fieldErrors = Object.entries(err.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        setError(`Validation failed: ${fieldErrors}`);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to add equipment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Add New Equipment
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EquipmentType })}
              >
                <option value="HEAVY_MACHINERY">Heavy Machinery (Excavators, Cranes)</option>
                <option value="VEHICLE">Vehicle (Dumpers, Trucks)</option>
                <option value="POWER_TOOL">Power Tool (Generators, Mixers)</option>
                <option value="HAND_TOOL">Hand Tool</option>
                <option value="SAFETY_GEAR">Safety Gear</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ownership *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.ownershipType}
                  onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value as any })}
                >
                  <option value="OWNED">Owned</option>
                  <option value="RENTED">Rented</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Usage Unit *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.usageUnit}
                  onChange={(e) => setFormData({ ...formData, usageUnit: e.target.value as any })}
                >
                  <option value="HOURLY">Hourly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Default Base Rate (₹) <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Base fallback rate. The agreed rate for a site is configured during project assignment.
              </p>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 800 (Optional)"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.unitRate === 0 ? '' : formData.unitRate}
                onChange={(e) => setFormData({ ...formData, unitRate: e.target.value ? parseFloat(e.target.value) : 0 })}
              />
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="isBulk"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.isBulk}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData({ ...formData, isBulk: checked, totalQuantity: checked ? (formData.totalQuantity || 10) : 1 });
                }}
              />
              <label htmlFor="isBulk" className="text-sm font-medium text-gray-700">
                Is Bulk Item? (e.g. Scaffolding, Helmets)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Quantity * {formData.isBulk ? '(Bulk Items)' : '(Single Machine Unit = 1)'}
              </label>
              <input
                type="number"
                min="1"
                required
                disabled={!formData.isBulk}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                value={formData.isBulk ? (formData.totalQuantity || '') : 1}
                onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" className="w-full sm:ml-3 sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Add Equipment'}
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
