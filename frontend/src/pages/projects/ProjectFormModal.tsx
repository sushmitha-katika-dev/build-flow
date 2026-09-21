import { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { ProjectService } from '../../services/projectService';
import { FinanceService } from '../../services/financeService';
import type { CreateProjectRequest } from '../../types/project';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export const ProjectFormModal = ({ isOpen, onClose, onProjectCreated }: ProjectFormModalProps) => {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    projectName: '',
    clientName: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: new Date().toISOString().split('T')[0],
    estimatedBudget: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!formData.projectName.trim() || formData.projectName.length < 3) {
      setValidationError('Project name must be at least 3 characters.');
      return;
    }

    if (formData.estimatedBudget <= 0) {
      setValidationError('Estimated budget must be greater than 0.');
      return;
    }

    try {
      setIsLoading(true);
      const project = await ProjectService.createProject(formData);
      
      if (project.id) {
        try {
          await FinanceService.initializeBudget({
            projectId: project.id,
            estimatedBudget: formData.estimatedBudget
          });
        } catch (budgetErr) {
          console.warn("Could not initialize budget:", budgetErr);
        }
      }

      onProjectCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}
        {validationError && <Alert type="error" message={validationError} />}

        <Input
          label="Project Name"
          value={formData.projectName}
          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
          placeholder="e.g. Downtown Highrise"
          disabled={isLoading}
        />

        <Input
          label="Client Name"
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          placeholder="e.g. Apex Corp"
          disabled={isLoading}
        />

        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g. 123 Main St"
          disabled={isLoading}
        />

        <Input
          label="Estimated Budget (₹)"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 500000"
          value={formData.estimatedBudget === 0 ? '' : formData.estimatedBudget}
          onChange={(e) => {
            const val = e.target.value;
            setFormData({ ...formData, estimatedBudget: val === '' ? 0 : parseFloat(val) || 0 });
          }}
          disabled={isLoading}
        />

        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          disabled={isLoading}
        />

        <Input
          label="Expected End Date"
          type="date"
          value={formData.expectedEndDate}
          onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
          disabled={isLoading}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
