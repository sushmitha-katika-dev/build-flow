import { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { WorkforceService } from '../../services/workforceService';
import type { LabourCreateRequest, Gender, LabourRole, CompensationType, LabourWorkforceSummary } from '../../types/workforce';

interface AddWorkforceMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialWorker?: LabourWorkforceSummary | null;
}

export const AddWorkforceMemberModal = ({ isOpen, onClose, onSuccess, initialWorker }: AddWorkforceMemberModalProps) => {
  const [formData, setFormData] = useState<LabourCreateRequest>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: 'MALE',
    role: 'LABORER',
    compensationType: 'DAILY',
    dailyRate: undefined,
    monthlySalary: undefined,
    projectId: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialWorker) {
      setFormData({
        firstName: initialWorker.firstName || '',
        lastName: initialWorker.lastName || '',
        phoneNumber: initialWorker.phoneNumber || '',
        gender: initialWorker.gender || 'MALE',
        role: initialWorker.role || 'LABORER',
        compensationType: initialWorker.compensationType || 'DAILY',
        dailyRate: initialWorker.dailyRate || undefined,
        monthlySalary: initialWorker.monthlySalary || undefined,
        projectId: initialWorker.projectId || undefined,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        gender: 'MALE',
        role: 'LABORER',
        compensationType: 'DAILY',
        dailyRate: undefined,
        monthlySalary: undefined,
        projectId: undefined,
      });
    }
  }, [initialWorker, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      if (initialWorker && initialWorker.id) {
        await WorkforceService.updateLabourer(initialWorker.id, formData);
      } else {
        await WorkforceService.createLabourer(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save worker.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialWorker ? "Edit Worker" : "Add Worker"}>
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <Input
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <Input
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.phoneNumber || ''}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="Optional"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as LabourRole })}
            >
              <option value="ENGINEER">Engineer</option>
              <option value="FOREMAN">Foreman</option>
              <option value="LABORER">Laborer</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Compensation Type *</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.compensationType}
            onChange={(e) => setFormData({ ...formData, compensationType: e.target.value as CompensationType })}
          >
            <option value="DAILY">Daily</option>
            <option value="FIXED_WORK">Fixed Work</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>

        {!initialWorker && formData.compensationType === 'DAILY' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Daily Rate (Optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.dailyRate || ''}
              onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g. 800 (rates can also be logged per day during attendance)"
            />
          </div>
        )}

        {!initialWorker && formData.compensationType === 'MONTHLY' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.monthlySalary || ''}
              onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) })}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialWorker ? 'Update Worker' : 'Add Worker'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
