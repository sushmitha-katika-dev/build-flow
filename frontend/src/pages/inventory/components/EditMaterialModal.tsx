import { useState, useEffect } from 'react';
import { InventoryService } from '../../../services/inventoryService';
import type { Material, MaterialUnit } from '../../../types/inventory';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';
import { Edit3 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  material: Material | null;
}

export const EditMaterialModal = ({ isOpen, onClose, onSuccess, material }: Props) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: 'BAG' as MaterialUnit,
    reorderLevel: 10,
    description: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        unit: material.unit || 'BAG',
        reorderLevel: material.reorderLevel || 0,
        description: material.description || ''
      });
      setError(null);
    }
  }, [material, isOpen]);

  if (!isOpen || !material) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Material category name cannot be empty.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await InventoryService.updateMaterial(material.id, {
        name: formData.name.trim(),
        unit: formData.unit,
        reorderLevel: formData.reorderLevel,
        description: formData.description
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update material category.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

        <div className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-slate-200">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center">
              <Edit3 className="w-5 h-5 mr-2 text-blue-600" /> Edit Material Category #{material.id}
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
              Fix Category / Unit
            </span>
          </div>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Material Category Name *
              </label>
              <input
                type="text"
                required
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sand, Bricks, Cement"
              />
            </div>

            {/* Standard Unit Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Standard Unit of Measurement * (Fix Mismatches)
              </label>
              <select
                required
                className="block w-full rounded-xl border border-blue-500 px-3.5 py-2.5 text-sm font-bold bg-blue-50/30 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as MaterialUnit })}
              >
                <option value="TON">Tons (TON) — e.g. Sand, Steel, Aggregates, Stone</option>
                <option value="PCS">Pieces (PCS) — e.g. Bricks, Blocks, Tiles, Doors</option>
                <option value="BAG">Bags (BAG) — e.g. Cement, Putty, Mortar</option>
                <option value="KG">Kilograms (KG) — e.g. Binding Wire, Nails, Mesh</option>
                <option value="LTR">Liters (LTR) — e.g. Paint, Thinner, Chemicals</option>
                <option value="METER">Meters (METER) — e.g. Pipes, Cables, Wires</option>
              </select>
              <p className="text-[11px] text-blue-700 mt-1.5 font-medium">
                💡 Select the correct engineering unit (e.g. Change <strong>PCS ➔ TON</strong> for Sand, or <strong>TON ➔ PCS</strong> for Bricks).
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Godown Reorder Safety Limit
              </label>
              <input
                type="number"
                min="0"
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. 20"
                value={formData.reorderLevel === 0 ? '' : formData.reorderLevel}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, reorderLevel: val === '' ? 0 : parseFloat(val) || 0 });
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Description / Notes
              </label>
              <textarea
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Notes for this material category..."
              />
            </div>

            <div className="mt-6 sm:flex sm:flex-row-reverse gap-3 pt-2 border-t">
              <Button 
                type="submit" 
                className="w-full sm:w-auto font-black px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                disabled={isLoading}
              >
                {isLoading ? 'Saving Changes...' : 'Save Unit & Category Fix'}
              </Button>
              <Button type="button" variant="secondary" className="mt-3 sm:mt-0 w-full sm:w-auto font-bold rounded-xl" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
