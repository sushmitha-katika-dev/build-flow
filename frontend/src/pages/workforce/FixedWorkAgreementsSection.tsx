import { useState, useEffect } from 'react';
import { WorkforceService } from '../../services/workforceService';
import type { FixedWorkAgreement, LabourWorkforceSummary } from '../../types/workforce';
import type { Project } from '../../types/project';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';

interface Props {
  worker: LabourWorkforceSummary;
  projects: Project[];
  onPaymentRecord: (agreementId: number, projectId: number, remaining: number) => void;
}

export const FixedWorkAgreementsSection = ({ worker, projects, onPaymentRecord }: Props) => {
  const [agreements, setAgreements] = useState<FixedWorkAgreement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    projectId: '',
    description: '',
    agreedAmount: ''
  });

  const loadAgreements = async () => {
    try {
      setIsLoading(true);
      const data = await WorkforceService.getFixedWorkAgreementsByLabour(worker.id);
      setAgreements(data);
    } catch (err: any) {
      setError('Failed to load fixed work agreements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, [worker.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.description || !formData.agreedAmount) return;

    try {
      setIsLoading(true);
      await WorkforceService.createFixedWorkAgreement({
        labourId: worker.id,
        projectId: Number(formData.projectId),
        description: formData.description,
        agreedAmount: Number(formData.agreedAmount)
      });
      setIsCreating(false);
      setFormData({ projectId: '', description: '', agreedAmount: '' });
      loadAgreements();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create agreement');
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.description || !formData.agreedAmount) return;

    try {
      setIsLoading(true);
      await WorkforceService.updateFixedWorkAgreement(id, {
        description: formData.description,
        agreedAmount: Number(formData.agreedAmount)
      });
      setIsEditing(null);
      setFormData({ projectId: '', description: '', agreedAmount: '' });
      loadAgreements();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update agreement');
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      setIsLoading(true);
      await WorkforceService.updateFixedWorkAgreementStatus(id, status);
      loadAgreements();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
      setIsLoading(false);
    }
  };

  const getProjectName = (id: number) => projects.find(p => p.id === id)?.projectName || 'Unknown Project';

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Fixed Work Agreements</h3>
        {!isCreating && (
          <Button variant="outline" onClick={() => setIsCreating(true)}>
            + New Agreement
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-4">
          <h4 className="font-medium text-gray-900">Create Agreement</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Project *</label>
              <select 
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                required
              >
                <option value="">-- Select Project --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Agreed Amount (₹) *</label>
              <Input 
                type="number" min="1" step="0.01" required
                value={formData.agreedAmount}
                onChange={(e) => setFormData({ ...formData, agreedAmount: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Work Description / Scope *</label>
            <Input 
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Create Agreement'}</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {agreements.length === 0 && !isCreating && (
          <p className="text-sm text-gray-500 text-center py-4">No fixed work agreements found.</p>
        )}
        
        {agreements.map((agreement) => (
          <div key={agreement.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            {isEditing === agreement.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Project</label>
                    <input disabled value={getProjectName(agreement.projectId)} className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Agreed Amount (₹) *</label>
                    <Input 
                      type="number" min="1" step="0.01" required
                      value={formData.agreedAmount}
                      onChange={(e) => setFormData({ ...formData, agreedAmount: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Work Description / Scope *</label>
                  <Input 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                  <Button onClick={() => handleUpdate(agreement.id)} disabled={isLoading}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{getProjectName(agreement.projectId)}</h4>
                    <p className="text-sm text-gray-600">{agreement.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      agreement.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                      agreement.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {agreement.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Agreed Amount</p>
                    <p className="font-bold text-gray-900">₹{agreement.agreedAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Paid</p>
                    <p className="font-bold text-green-600">₹{(agreement.amountPaid || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Outstanding</p>
                    <p className="font-bold text-amber-600">₹{(agreement.outstandingAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 border-t border-gray-100 pt-3">
                  {agreement.status === 'ACTIVE' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-sm py-1 px-3"
                        onClick={() => onPaymentRecord(agreement.id, agreement.projectId, agreement.outstandingAmount || 0)}
                      >
                        Log Payment
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-sm py-1 px-3"
                        onClick={() => {
                          setFormData({
                            projectId: agreement.projectId.toString(),
                            description: agreement.description,
                            agreedAmount: agreement.agreedAmount.toString()
                          });
                          setIsEditing(agreement.id);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-sm py-1 px-3 border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusChange(agreement.id, 'COMPLETED')}
                      >
                        Complete
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-sm py-1 px-3 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if(confirm('Are you sure you want to cancel this agreement?')) {
                            handleStatusChange(agreement.id, 'CANCELLED');
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
