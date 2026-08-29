import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import type { LabourWorkforceSummary } from '../../types/workforce';
import { Briefcase, IndianRupee, ExternalLink, ArrowUpRight, Clock, CheckCircle, Wallet, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: LabourWorkforceSummary | null;
  onUpdate: () => void;
}

export const WorkerDetailsModal = ({ isOpen, onClose, worker }: WorkerDetailsModalProps) => {
  const navigate = useNavigate();

  if (!worker) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Worker Details Summary">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-xl">
              {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold">{worker.firstName} {worker.lastName}</h3>
              <p className="text-xs text-blue-200 flex items-center mt-1 font-medium">
                <Briefcase className="w-3.5 h-3.5 mr-1 text-blue-400" />
                <span className="uppercase font-bold tracking-wider">{worker.role}</span>
                <span className="mx-1.5">•</span>
                <span>{worker.compensationType?.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-300">Worker Status</span>
            <div className="mt-0.5">
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] text-gray-500 font-bold uppercase flex items-center mb-1">
              <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" /> Days Worked
            </p>
            <p className="text-2xl font-bold text-gray-900">{worker.daysWorked || 0}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] text-gray-500 font-bold uppercase flex items-center mb-1">
              <IndianRupee className="w-3.5 h-3.5 mr-1 text-gray-400" /> Total Earned
            </p>
            <p className="text-2xl font-bold text-gray-900">₹{(worker.totalEarned || 0).toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm">
            <p className="text-[11px] text-emerald-700 font-bold uppercase flex items-center mb-1">
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Amount Paid
            </p>
            <p className="text-2xl font-bold text-emerald-700">₹{(worker.amountPaid || 0).toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-sm">
            <p className="text-[11px] text-amber-700 font-bold uppercase flex items-center mb-1">
              <IndianRupee className="w-3.5 h-3.5 mr-1 text-amber-500" /> Pending Pay
            </p>
            <p className="text-2xl font-bold text-amber-700">₹{(worker.remainingAmount || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Finance Payment Notice Card */}
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">Worker Wage Payments managed in Finance Module</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Disburse worker wages under Finance to keep Project Cost Breakdowns automatically synced.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => { onClose(); navigate('/finance'); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-xl flex items-center font-bold shadow-sm whitespace-nowrap"
          >
            Go to Finance <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* Action Controls & Navigation Footer */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button 
            variant="secondary" 
            className="text-gray-700 bg-gray-100 hover:bg-gray-200 text-xs w-full sm:w-auto font-semibold px-4 py-2 rounded-xl"
            onClick={onClose}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Registry
          </Button>

          <Button 
            variant="outline" 
            className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs w-full sm:w-auto font-semibold px-4 py-2 rounded-xl"
            onClick={() => navigate(`/workforce/${worker.id}/history`, { state: { worker } })}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Complete History Ledger
          </Button>
        </div>
      </div>
    </Modal>
  );
};
