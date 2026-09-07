import { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { WorkforceService } from '../../services/workforceService';
import { ProjectService } from '../../services/projectService';
import type { LabourCreateRequest, Gender, LabourRole, CompensationType, LabourWorkforceSummary } from '../../types/workforce';
import type { Project } from '../../types/project';

interface AddWorkforceMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialWorker?: LabourWorkforceSummary | null;
}

export const AddWorkforceMemberModal = ({ isOpen, onClose, onSuccess, initialWorker }: AddWorkforceMemberModalProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
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

  const [fixedWorkAmount, setFixedWorkAmount] = useState<number | undefined>(undefined);
  const [fixedWorkScope, setFixedWorkScope] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      ProjectService.getActiveProjects().then(setProjects).catch(() => {});
    }
  }, [isOpen]);

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
      setFixedWorkAmount(undefined);
      setFixedWorkScope('');
    }
  }, [initialWorker, isOpen]);

  // Handle Role change to auto-set default Compensation Model
  const handleRoleChange = (newRole: LabourRole) => {
    let newComp: CompensationType = 'DAILY';
    if (newRole === 'FOREMAN') {
      newComp = 'FIXED_WORK';
    } else if (newRole === 'SUPERVISOR' || newRole === 'ENGINEER') {
      newComp = 'MONTHLY';
    } else {
      newComp = 'DAILY';
    }

    setFormData({
      ...formData,
      role: newRole,
      compensationType: newComp
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      let createdWorker;
      if (initialWorker && initialWorker.id) {
        createdWorker = await WorkforceService.updateLabourer(initialWorker.id, formData);
      } else {
        createdWorker = await WorkforceService.createLabourer(formData);
      }

      // If Foreman / Fixed Work with agreement amount and project, register agreement
      if (formData.compensationType === 'FIXED_WORK' && formData.projectId && fixedWorkAmount && createdWorker?.id) {
        await WorkforceService.createFixedWorkAgreement({
          labourId: createdWorker.id,
          projectId: formData.projectId,
          agreedAmount: fixedWorkAmount,
          description: fixedWorkScope || `Fixed work contract for ${formData.firstName} ${formData.lastName}`
        }).catch((err) => console.error("Failed to create fixed agreement", err));
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialWorker ? "Edit Worker Profile" : "Add New Worker / Subcontractor"}>
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
            <Input
              required
              placeholder="e.g. Gopal"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
            <Input
              required
              placeholder="e.g. M"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        {/* Contact & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="10-digit phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>

        {/* Role & Compensation Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role / Designation *</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm font-bold shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value as LabourRole)}
            >
              <option value="LABORER">Labourer (Daily Worker)</option>
              <option value="FOREMAN">Foreman (Fixed Subcontractor)</option>
              <option value="SUPERVISOR">Supervisor (Salaried Manager)</option>
              <option value="ENGINEER">Engineer (Salaried)</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Compensation Type *</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm font-bold shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={formData.compensationType}
              onChange={(e) => setFormData({ ...formData, compensationType: e.target.value as CompensationType })}
            >
              <option value="DAILY">Daily Wages (per day)</option>
              <option value="FIXED_WORK">Fixed Work (Piecework Contract)</option>
              <option value="MONTHLY">Monthly Salary</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC FIELDS BASED ON COMPENSATION TYPE */}

        {/* 1. DAILY LABOURER FIELDS */}
        {formData.compensationType === 'DAILY' && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider">Base Daily Rate (Optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={formData.dailyRate || ''}
              onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g. 800"
            />
            <p className="text-[11px] text-blue-700 font-medium">
              💡 Daily labourers can be assigned dynamically to any project on the <strong>Daily Attendance</strong> screen.
            </p>
          </div>
        )}

        {/* 2. FOREMAN / FIXED WORK CONTRACT FIELDS */}
        {formData.compensationType === 'FIXED_WORK' && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Fixed Work Contract Details</span>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">Subcontractor</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assign to Project *</label>
              <select
                required
                className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={formData.projectId || 0}
                onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) || undefined })}
              >
                <option value={0} disabled>Select Project for Agreement</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.projectName}</option>
                ))}
              </select>
            </div>

            {!initialWorker && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Fixed Agreement Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    value={fixedWorkAmount || ''}
                    onChange={(e) => setFixedWorkAmount(parseFloat(e.target.value))}
                    placeholder="e.g. 50000 (total price for the task)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Task Scope / Description</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    value={fixedWorkScope}
                    onChange={(e) => setFixedWorkScope(e.target.value)}
                    placeholder="e.g. Centering & Slab Shuttering Work"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. SUPERVISOR / ENGINEER MONTHLY SALARY FIELDS */}
        {formData.compensationType === 'MONTHLY' && (
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Staff Salary & Project Assignment</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Project *</label>
                <select
                  required
                  className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.projectId || 0}
                  onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) || undefined })}
                >
                  <option value={0} disabled>Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Salary (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.monthlySalary || ''}
                  onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) })}
                  placeholder="e.g. 30000"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-slate-900 text-white hover:bg-slate-800 font-bold">
            {isLoading ? 'Saving...' : initialWorker ? 'Update Worker' : 'Add Worker'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
