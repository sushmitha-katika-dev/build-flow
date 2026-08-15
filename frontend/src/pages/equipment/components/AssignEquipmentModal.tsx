import { useState, useEffect } from 'react';
import { EquipmentService } from '../../../services/equipmentService';
import { ProjectService } from '../../../services/projectService';
import type { EquipmentAssignmentRequest, Equipment } from '../../../types/equipment';
import type { Project } from '../../../types/project';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Equipment[];
}

export const AssignEquipmentModal = ({ isOpen, onClose, equipmentList }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [equipmentId, setEquipmentId] = useState<number>(0);
  const [formData, setFormData] = useState<EquipmentAssignmentRequest>({
    projectId: 0,
    assignedQuantity: 1,
    assignmentDate: new Date().toISOString().split('T')[0],
    returnDate: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      ProjectService.getAllProjects().then(setProjects).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (equipmentId === 0 || formData.projectId === 0) {
      setError("Please select both equipment and a project.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await EquipmentService.assignEquipment(equipmentId, formData);
      onClose();
      setEquipmentId(0);
      setFormData({
        projectId: 0,
        assignedQuantity: 1,
        assignmentDate: new Date().toISOString().split('T')[0],
        returnDate: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign equipment.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEquipment = equipmentList.find(e => e.id === equipmentId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Assign Equipment
          </h3>

          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Equipment *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={equipmentId}
                onChange={(e) => setEquipmentId(Number(e.target.value))}
              >
                <option value={0}>Select Equipment</option>
                {equipmentList.filter(e => e.status === 'AVAILABLE' || e.isBulk).map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} {eq.isBulk ? `(${eq.availableQuantity} available)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project *</label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) })}
              >
                <option value={0}>Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.projectName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedEquipment?.isBulk ? selectedEquipment.availableQuantity : 1}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.assignedQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, assignedQuantity: parseInt(e.target.value) })}
                  disabled={!selectedEquipment?.isBulk}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assignment Date *</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.assignmentDate}
                  onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Return Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.returnDate || ''}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              />
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" className="w-full sm:ml-3 sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Assign'}
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
