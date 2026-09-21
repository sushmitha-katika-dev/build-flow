import { useState } from 'react';
import { InventoryService } from '../../../services/inventoryService';
import type { Material, MaterialCreateRequest, MaterialType, MaterialUnit } from '../../../types/inventory';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingMaterials: Material[];
}

export const MaterialFormModal = ({ isOpen, onClose, onSuccess, existingMaterials }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('CEMENT');
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  
  const [formData, setFormData] = useState<MaterialCreateRequest>({
    name: 'Cement',
    description: '',
    type: 'CEMENT',
    unit: 'BAG',
    reorderLevel: 10
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine effective category name
  const effectiveCategoryName = selectedCategory === 'OTHER' 
    ? customCategoryName.trim() 
    : (selectedCategory === 'CEMENT' ? 'Cement' : selectedCategory === 'STEEL' ? 'Steel' : 'Paint');

  // Check if effective category name or type already exists in master catalog
  const existingDuplicate = existingMaterials.find(
    (m) => 
      m.name.trim().toLowerCase() === effectiveCategoryName.toLowerCase() ||
      m.type.trim().toLowerCase() === effectiveCategoryName.toLowerCase()
  );

  const isDuplicateCategory = !!existingDuplicate && effectiveCategoryName.length > 0;

  const handleCategorySelect = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setError(null);

    if (categoryValue === 'CEMENT') {
      setFormData({
        ...formData,
        name: 'Cement',
        type: 'CEMENT',
        unit: 'BAG'
      });
    } else if (categoryValue === 'STEEL') {
      setFormData({
        ...formData,
        name: 'Steel',
        type: 'STEEL',
        unit: 'TON'
      });
    } else if (categoryValue === 'PAINT') {
      setFormData({
        ...formData,
        name: 'Paint',
        type: 'PAINT',
        unit: 'LTR'
      });
    } else {
      // OTHER custom category
      setFormData({
        ...formData,
        name: customCategoryName || '',
        type: 'GENERAL',
        unit: 'PCS'
      });
    }
  };

  const handleCustomNameChange = (nameInput: string) => {
    setCustomCategoryName(nameInput);
    
    // Auto-detect & suggest standard engineering unit based on material keyword
    const lower = nameInput.trim().toLowerCase();
    let suggestedUnit: MaterialUnit = 'PCS';
    
    if (lower.includes('sand') || lower.includes('aggregate') || lower.includes('gravel') || lower.includes('dust') || lower.includes('stone')) {
      suggestedUnit = 'TON';
    } else if (lower.includes('brick') || lower.includes('block') || lower.includes('tile') || lower.includes('fitting') || lower.includes('door') || lower.includes('window')) {
      suggestedUnit = 'PCS';
    } else if (lower.includes('cement') || lower.includes('bag')) {
      suggestedUnit = 'BAG';
    } else if (lower.includes('steel') || lower.includes('rebar') || lower.includes('iron')) {
      suggestedUnit = 'TON';
    } else if (lower.includes('wire') || lower.includes('mesh')) {
      suggestedUnit = 'KG';
    } else if (lower.includes('paint') || lower.includes('primer') || lower.includes('chemical') || lower.includes('oil') || lower.includes('thinner')) {
      suggestedUnit = 'LTR';
    } else if (lower.includes('pipe') || lower.includes('cable') || lower.includes('conduit') || lower.includes('bar')) {
      suggestedUnit = 'METER';
    }

    setFormData({
      ...formData,
      name: nameInput,
      type: 'GENERAL',
      unit: suggestedUnit
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategory === 'OTHER' && !customCategoryName.trim()) {
      setError("Please enter a custom category / type name (e.g. Sand, Bricks, Tiles).");
      return;
    }

    if (isDuplicateCategory) {
      setError(`Material category '${effectiveCategoryName}' already exists in your catalog (ID: #${existingDuplicate?.id} ${existingDuplicate?.name}). You don't need to add it again! Use 'Add Warehouse Stock' on the inventory page to add stock for specific brands or variants.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: MaterialCreateRequest = {
      name: effectiveCategoryName,
      description: formData.description || '',
      type: (['CEMENT', 'STEEL', 'PAINT'].includes(selectedCategory) ? selectedCategory as MaterialType : 'GENERAL'),
      unit: formData.unit,
      reorderLevel: formData.reorderLevel || 0
    };

    try {
      await InventoryService.createMaterial(payload);
      onSuccess();
      onClose();
      // Reset form
      setSelectedCategory('CEMENT');
      setCustomCategoryName('');
      setFormData({
        name: 'Cement',
        description: '',
        type: 'CEMENT',
        unit: 'BAG',
        reorderLevel: 10
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create material category.');
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
            <h3 className="text-lg font-black text-slate-900">
              Add New Material Category
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
              Master Catalog
            </span>
          </div>

          {error && <Alert type="error" message={error} className="mb-4" />}

          {/* DUPLICATE CATEGORY WARNING BANNER */}
          {isDuplicateCategory && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-300/80 rounded-2xl flex items-start space-x-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-extrabold text-sm text-amber-950">
                  Category '{effectiveCategoryName}' Already Exists!
                </p>
                <p className="mt-1 font-medium text-amber-800">
                  Item <strong>#{existingDuplicate?.id} {existingDuplicate?.name}</strong> is already present in your master catalog. You cannot create duplicate material categories!
                </p>
                <p className="mt-1.5 font-bold text-amber-900">
                  💡 Tip: Click <strong>"Add Warehouse Stock"</strong> on the main inventory page to add stock quantities and brand variants (e.g. UltraTech, Birla, ACC, 12mm).
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Select Category / Material Type *
              </label>
              <select
                required
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
              >
                <option value="CEMENT">Cement (CEMENT)</option>
                <option value="STEEL">Steel / Rebar (STEEL)</option>
                <option value="PAINT">Paints & Finishes (PAINT)</option>
                <option value="OTHER">➕ Other / Custom Category (Sand, Bricks, Tiles, Wood, etc.)</option>
              </select>
            </div>

            {/* Custom Category Input if OTHER selected */}
            {selectedCategory === 'OTHER' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Enter Custom Category Name *
                </label>
                <input
                  type="text"
                  required
                  className="block w-full rounded-xl border border-blue-500 px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-blue-50/20"
                  value={customCategoryName}
                  onChange={(e) => handleCustomNameChange(e.target.value)}
                  placeholder="e.g. Sand, Bricks, Aggregates, Tiles, Electrical"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Enter a unique material category name (e.g. Sand, Bricks, Electrical, Plumbing).
                </p>
              </div>
            )}

            {/* Unit Selection */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Standard Unit of Measurement *
                </label>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Auto-Suggested
                </span>
              </div>
              <select
                required
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
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

              {/* Standard Engineering Unit Guide Box */}
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p className="font-extrabold text-slate-900 flex items-center">
                  💡 Unit Selection Guide (Avoid Mismatches):
                </p>
                <div className="grid grid-cols-2 gap-x-2 text-[10px] text-slate-700 font-medium pt-0.5">
                  <span>• <strong>Sand / Gravel / Stone</strong> → TONS</span>
                  <span>• <strong>Bricks / Blocks / Tiles</strong> → PCS</span>
                  <span>• <strong>Cement / Putty</strong> → BAGS</span>
                  <span>• <strong>Steel / Rebar</strong> → TONS / KG</span>
                  <span>• <strong>Paint / Chemicals</strong> → LITERS</span>
                  <span>• <strong>Pipes / Cables</strong> → METERS</span>
                </div>
              </div>
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
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Notes for this material category..."
              />
            </div>

            <div className="mt-6 sm:flex sm:flex-row-reverse gap-3 pt-2 border-t">
              <Button 
                type="submit" 
                className={`w-full sm:w-auto font-black px-5 py-2.5 rounded-xl ${
                  isDuplicateCategory 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20'
                }`}
                disabled={isLoading || isDuplicateCategory}
              >
                {isLoading ? 'Saving...' : 'Add Material Category'}
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
