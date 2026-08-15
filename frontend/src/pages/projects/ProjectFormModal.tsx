import { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { ProjectService } from '../../services/projectService';
import type { CreateProjectRequest } from '../../types/project';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export const ProjectFormModal = ({ isOpen, onClose, onProjectCreated }: ProjectFormModalProps) => {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    client_name: '',
    manager_id: 1, // Defaulting for now
    supervisor_id: 2, // Defaulting for now
    start_date: new Date().toISOString().split('T')[0],
    estimated_budget: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!formData.name.trim() || formData.name.length < 3) {
      setValidationError('Project name must be at least 3 characters.');
      return;
    }

    if (formData.estimated_budget <= 0) {
      setValidationError('Estimated budget must be greater than 0.');
      return;
    }

    try {
      setIsLoading(true);
      await ProjectService.createProject(formData);
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
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Downtown Highrise"
          disabled={isLoading}
        />

        <Input
          label="Client Name"
          value={formData.client_name}
          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
          placeholder="e.g. Apex Corp"
          disabled={isLoading}
        />

        <Input
          label="Estimated Budget ($)"
          type="number"
          min="0"
          step="0.01"
          value={formData.estimated_budget}
          onChange={(e) => setFormData({ ...formData, estimated_budget: parseFloat(e.target.value) || 0 })}
          disabled={isLoading}
        />

        <Input
          label="Start Date"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
