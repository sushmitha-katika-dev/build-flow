import { useState } from 'react';
import { FinanceService } from '../../../services/financeService';
import type { ExpenseRequest, ExpenseCategory } from '../../../types/finance';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
}

export const ExpenseFormModal = ({ isOpen, onClose, onSuccess, projectId }: Props) => {
  const [formData, setFormData] = useState<ExpenseRequest>({
    projectId,
    amount: 0,
    category: 'MATERIAL',
    date: new Date().toISOString().split('T')[0],
    description: '',
    referenceId: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update projectId if it changes from props
  if (formData.projectId !== projectId && projectId !== 0) {
    setFormData({ ...formData, projectId });
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectId === 0) {
      setError("No project selected.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await FinanceService.logExpense(formData);
      onSuccess();
      onClose();
      setFormData({
        projectId,
        amount: 0,
        category: 'MATERIAL',
        date: new Date().toISOString().split('T')[0],
        description: '',
        referenceId: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log expense.');
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
            Log New Expense
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                >
                  <option value="WORKFORCE">Workforce / Worker</option>
                  <option value="MATERIAL">Material</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="FUEL">Fuel</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="MISCELLANEOUS">Miscellaneous</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference ID (Invoice/Receipt No.)</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.referenceId}
                onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" className="w-full sm:ml-3 sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Expense'}
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
