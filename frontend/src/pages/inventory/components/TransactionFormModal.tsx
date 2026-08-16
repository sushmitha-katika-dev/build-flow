import { useState, useEffect } from 'react';
import { InventoryService } from '../../../services/inventoryService';
import { ProjectService } from '../../../services/projectService';
import type { InventoryTransactionRequest, TransactionType, Material } from '../../../types/inventory';
import type { Project } from '../../../types/project';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  mode: 'COMPANY_STOCK_IN' | 'PROJECT_DISPATCH' | 'GENERIC';
}

export const TransactionFormModal = ({ isOpen, onClose, materials, mode }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<InventoryTransactionRequest>({
    materialId: 0,
    projectId: mode === 'COMPANY_STOCK_IN' ? 0 : 0,
    transactionType: mode === 'COMPANY_STOCK_IN' ? 'STOCK_IN' : mode === 'PROJECT_DISPATCH' ? 'TRANSFER' : 'STOCK_IN',
    quantity: 0,
    unitCost: 0,
    transactionDate: new Date().toISOString().split('T')[0],
    notes: '',
    variant: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      ProjectService.getAllProjects().then(setProjects).catch(() => {});
      
      setFormData({
        materialId: 0,
        projectId: mode === 'COMPANY_STOCK_IN' ? 0 : 0,
        transactionType: mode === 'COMPANY_STOCK_IN' ? 'STOCK_IN' : mode === 'PROJECT_DISPATCH' ? 'TRANSFER' : 'STOCK_IN',
        quantity: 0,
        unitCost: 0,
        transactionDate: new Date().toISOString().split('T')[0],
        notes: '',
        variant: ''
      });
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.materialId === 0 || (mode !== 'COMPANY_STOCK_IN' && formData.projectId === 0)) {
      setError("Please select a material and a project.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        transactionDate: formData.transactionDate.includes('T') 
          ? formData.transactionDate 
          : `${formData.transactionDate}T00:00:00`
      };
      await InventoryService.logTransaction(submitData);
      onClose();
      setFormData({
        materialId: 0,
        projectId: 0,
        transactionType: 'STOCK_IN',
        quantity: 0,
        unitCost: 0,
        transactionDate: new Date().toISOString().split('T')[0],
        notes: '',
        variant: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log transaction.');
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
            {mode === 'COMPANY_STOCK_IN' ? 'Add Stock to Company' : mode === 'PROJECT_DISPATCH' ? 'Dispatch to Project' : 'Log Material Transaction'}
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'COMPANY_STOCK_IN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) })}
                >
                  <option value={0} disabled>Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.projectName}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Material *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.materialId}
                onChange={(e) => setFormData({ ...formData, materialId: Number(e.target.value) })}
              >
                <option value={0}>Select Material</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Specification / Variant / Size</label>
              <input
                type="text"
                placeholder={mode === 'COMPANY_STOCK_IN' ? 'e.g. 8mm, OPC 53 Grade' : 'Enter exact variant to dispatch'}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.variant || ''}
                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">Leave blank for default</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {mode === 'GENERIC' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.transactionType}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as TransactionType })}
                  >
                    <option value="STOCK_IN">Stock In (Receive Purchase)</option>
                    <option value="CONSUMPTION">Consumption (Use on Project)</option>
                    <option value="TRANSFER">Transfer to Project</option>
                    <option value="ADJUSTMENT">Adjustment (Correction)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                />
              </div>
              
              {formData.transactionType === 'STOCK_IN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.unitCost || ''}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" className="w-full sm:ml-3 sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Log Transaction'}
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
