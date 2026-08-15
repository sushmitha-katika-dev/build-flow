import { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { WorkforceService } from '../../services/workforceService';
import { ProjectService } from '../../services/projectService';
import type { LabourWorkforceSummary } from '../../types/workforce';
import type { Project } from '../../types/project';
import { User, Briefcase, IndianRupee, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { FixedWorkAgreementsSection } from './FixedWorkAgreementsSection';

interface WorkerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: LabourWorkforceSummary | null;
  onUpdate: () => void;
}

export const WorkerDetailsModal = ({ isOpen, onClose, worker, onUpdate }: WorkerDetailsModalProps) => {
  const navigate = useNavigate();
  const [isLoggingAttendance, setIsLoggingAttendance] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      ProjectService.getAllProjects()
        .then(data => setProjects(Array.isArray(data) ? data : []))
        .catch(console.error);
    } else {
      setIsLoggingAttendance(false);
      setIsRecordingPayment(false);
      setPaymentAmount('');
      setSelectedProjectId('');
      setSelectedAgreementId(null);
      setNotes('');
      setError(null);
    }
  }, [isOpen, worker]);

  if (!worker) return null;

  const handleMarkAttendance = async (status: 'PRESENT' | 'ABSENT' | 'HALF_DAY') => {
    if (!selectedProjectId) {
      setError("Please select a project for this attendance.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await WorkforceService.logAttendance({
        labourId: worker.id,
        projectId: selectedProjectId === 'OTHER' ? null : Number(selectedProjectId),
        date: attendanceDate,
        status,
        notes: selectedProjectId === 'OTHER' ? notes : undefined
      });
      setIsLoggingAttendance(false);
      setNotes('');
      onUpdate(); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    if (!selectedProjectId) {
      setError("Please select a project for this payment.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await WorkforceService.recordWage({
        labourId: worker.id,
        projectId: selectedProjectId === 'OTHER' ? undefined : Number(selectedProjectId),
        agreementId: selectedAgreementId || undefined,
        amountPaid: Number(paymentAmount),
        paymentDate: new Date().toISOString().split('T')[0],
        notes: selectedProjectId === 'OTHER' ? notes : undefined
      } as any); 
      setIsRecordingPayment(false);
      setPaymentAmount('');
      setNotes('');
      setSelectedAgreementId(null);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentForAgreement = (agreementId: number, projectId: number, remaining: number) => {
    setIsRecordingPayment(true);
    setSelectedProjectId(projectId.toString());
    setSelectedAgreementId(agreementId);
    setPaymentAmount(remaining > 0 ? remaining : '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Worker Details">
      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
      
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{worker.firstName} {worker.lastName}</h3>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Briefcase className="w-4 h-4 mr-1" />
              {worker.role} • {worker.compensationType?.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> Days Worked
            </p>
            <p className="text-xl font-bold text-gray-900">{worker.daysWorked || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" /> Total Earned
            </p>
            <p className="text-xl font-bold text-gray-900">₹{(worker.totalEarned || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" /> Amount Paid
            </p>
            <p className="text-xl font-bold text-green-600">₹{(worker.amountPaid || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" /> Pending Pay
            </p>
            <p className="text-xl font-bold text-amber-600">₹{(worker.remainingAmount || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Fixed Work Agreements Section */}
        {worker.compensationType === 'FIXED_WORK' && (
          <FixedWorkAgreementsSection 
            worker={worker} 
            projects={projects} 
            onPaymentRecord={startPaymentForAgreement} 
          />
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          {!isLoggingAttendance && !isRecordingPayment && (
            <div className="flex flex-col space-y-3">
              <Button 
                variant="primary" 
                onClick={() => setIsLoggingAttendance(true)}
              >
                Log Attendance
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsRecordingPayment(true)}
              >
                Record Payment
              </Button>
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => navigate(`/workforce/${worker.id}/history`, { state: { worker } })}
              >
                <ExternalLink className="w-4 h-4 mr-2" /> View Full History
              </Button>
            </div>
          )}

          {isLoggingAttendance && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Log Attendance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Project</label>
                  <select 
                    className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                    <option value="OTHER">Other (Not Project Specific)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date</label>
                  <Input 
                    type="date"
                    required
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>
              </div>
              {selectedProjectId === 'OTHER' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Work Description / Notes</label>
                  <Input 
                    placeholder="e.g. cleaning the garden, general maintenance"
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}
              <div className="flex space-x-2 pt-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleMarkAttendance('PRESENT')} disabled={isLoading}>Present</Button>
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={() => handleMarkAttendance('HALF_DAY')} disabled={isLoading}>Half Day</Button>
                {worker.role !== 'LABORER' && (
                  <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleMarkAttendance('ABSENT')} disabled={isLoading}>Absent</Button>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setIsLoggingAttendance(false)}>Cancel</Button>
            </div>
          )}

          {isRecordingPayment && (
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Record Wage Payment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Project</label>
                  <select 
                    className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    required
                    disabled={!!selectedAgreementId}
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                    <option value="OTHER">Other (Not Project Specific)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Amount (₹)</label>
                  <Input 
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder={`Pending: ₹${worker.remainingAmount || 0}`}
                  />
                </div>
              </div>
              {selectedProjectId === 'OTHER' && !selectedAgreementId && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Payment Description / Notes</label>
                  <Input 
                    placeholder="e.g. bonus, general labor"
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}
              {selectedAgreementId && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-100 flex items-center">
                  This payment is logged against a Fixed Work Agreement.
                </div>
              )}
              <div className="flex space-x-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  setIsRecordingPayment(false);
                  setSelectedAgreementId(null);
                }}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? 'Saving...' : 'Confirm Payment'}</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
};
