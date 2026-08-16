import { useState } from 'react';
import { InventoryService } from '../../../services/inventoryService';
import type { MaterialCreateRequest, MaterialType, MaterialUnit } from '../../../types/inventory';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MaterialFormModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState<MaterialCreateRequest>({
    name: '',
    description: '',
    type: 'GENERAL',
    unit: 'PCS',
    reorderLevel: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await InventoryService.createMaterial(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'GENERAL',
        unit: 'PCS',
        reorderLevel: 0
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create material.');
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
            Add New Material
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Material Name (e.g. Cement OPC 53 Grade) *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Specifications / Brand / Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MaterialType })}
                >
                  <option value="CEMENT">Cement</option>
                  <option value="STEEL">Steel</option>
                  <option value="PAINT">Paint</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Unit *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as MaterialUnit })}
                >
                  <option value="KG">Kilograms (KG)</option>
                  <option value="LTR">Liters (LTR)</option>
                  <option value="TON">Tons</option>
                  <option value="PCS">Pieces (PCS)</option>
                  <option value="METER">Meters</option>
                  <option value="BAG">Bags</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.reorderLevel || ''}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" className="w-full sm:ml-3 sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Add Material'}
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
