import { useEffect, useState } from 'react';
import { Plus, Search, Wallet, Receipt } from 'lucide-react';
import { FinanceService } from '../../services/financeService';
import { ProjectService } from '../../services/projectService';
import { WorkforceService } from '../../services/workforceService';
import type { Expense, ProfitLossSummary } from '../../types/finance';
import type { Project } from '../../types/project';
import type { LabourWorkforceSummary } from '../../types/workforce';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ExpenseFormModal } from './components/ExpenseFormModal';

export const FinancePage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profitLoss, setProfitLoss] = useState<ProfitLossSummary | null>(null);
  const [workers, setWorkers] = useState<LabourWorkforceSummary[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Worker Wage Disbursal Modal in Finance
  const [isWageModalOpen, setIsWageModalOpen] = useState(false);
  const [selectedLabourId, setSelectedLabourId] = useState<string>('');
  const [wageAmount, setWageAmount] = useState<number | ''>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isSubmittingWage, setIsSubmittingWage] = useState(false);
  const [wageError, setWageError] = useState<string | null>(null);

  useEffect(() => {
    ProjectService.getAllProjects().then(setProjects).catch(() => {});
  }, []);

  const fetchProjectFinance = async (projectId: number) => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [expData, plData, workerData] = await Promise.all([
        FinanceService.getProjectExpenses(projectId),
        FinanceService.getProjectProfitLoss(projectId),
        WorkforceService.getLabourSummaryByProject(projectId).catch(() => [])
      ]);
      setExpenses(expData.sort((a, b) => b.id - a.id));
      setProfitLoss(plData);
      setWorkers(workerData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load financial data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId !== 0) {
      fetchProjectFinance(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handlePayWorkerWage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabourId || !wageAmount || Number(wageAmount) <= 0) {
      setWageError("Please select a worker and enter a valid payment amount.");
      return;
    }

    const worker = workers.find(w => w.id === Number(selectedLabourId));
    if (!worker) return;

    try {
      setIsSubmittingWage(true);
      setWageError(null);
      const paidAmt = Number(wageAmount);

      // 1. Log Expense in Finance Service
      await FinanceService.logExpense({
        projectId: selectedProjectId,
        amount: paidAmt,
        category: 'WORKFORCE',
        description: `Worker Wage Disbursal: ${worker.firstName} ${worker.lastName} (${worker.role})`,
        date: new Date().toISOString().split('T')[0]
      });

      // 2. Record Wage in Workforce Service
      await WorkforceService.recordWage({
        labourId: worker.id,
        projectId: selectedProjectId,
        amountPaid: paidAmt,
        paymentDate: new Date().toISOString().split('T')[0],
        notes: paymentNotes || undefined
      } as any);

      setIsWageModalOpen(false);
      setSelectedLabourId('');
      setWageAmount('');
      setPaymentNotes('');
      fetchProjectFinance(selectedProjectId);
    } catch (err: any) {
      setWageError(err.response?.data?.message || 'Failed to disburse worker wage.');
    } finally {
      setIsSubmittingWage(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PROFIT': return <Badge variant="success">Profit</Badge>;
      case 'LOSS': return <Badge variant="error">Loss</Badge>;
      case 'BREAK_EVEN': return <Badge variant="info">Break Even</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance & Cost Management</h1>
          <p className="text-sm text-blue-200 mt-1">
            Central ledger for expenses, worker wage disbursements, project budgets, and P&L analysis.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => { setWageError(null); setIsWageModalOpen(true); }}
            disabled={selectedProjectId === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md flex items-center"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Disburse Worker Wage
          </Button>

          <Button 
            onClick={() => setIsExpenseModalOpen(true)} 
            disabled={selectedProjectId === 0 || (projects.find(p => p.id === selectedProjectId)?.status === 'COMPLETED' || projects.find(p => p.id === selectedProjectId)?.status === 'CANCELLED')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md flex items-center disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log General Expense
          </Button>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-4 w-full max-w-md">
          <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Select Project:</label>
          <select
            className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
          >
            <option value={0}>-- Choose a Project to View Financial Ledger --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.projectName} {p.status === 'COMPLETED' || p.status === 'CANCELLED' ? `(${p.status})` : ''}</option>
            ))}
          </select>
        </div>

        {selectedProjectId !== 0 && (projects.find(p => p.id === selectedProjectId)?.status === 'COMPLETED' || projects.find(p => p.id === selectedProjectId)?.status === 'CANCELLED') && (
          <span className="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl flex items-center">
            🔒 Project is {projects.find(p => p.id === selectedProjectId)?.status} — New general expenses disabled. Wage payments open for settlement.
          </span>
        )}
      </div>

      {error && <Alert type="error" message={error} />}

      {selectedProjectId === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center shadow-sm">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-base font-bold text-gray-900">No Project Selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a project from the dropdown menu above to manage expenses and worker wage payments.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {profitLoss && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Budget</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">₹{profitLoss.totalEstimatedBudget?.toLocaleString('en-IN')}</dd>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Expenses</dt>
                <dd className="mt-1 text-2xl font-bold text-rose-600">₹{profitLoss.totalExpenses?.toLocaleString('en-IN')}</dd>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payments Received</dt>
                <dd className="mt-1 text-2xl font-bold text-emerald-600">₹{profitLoss.totalPaymentsReceived?.toLocaleString('en-IN')}</dd>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net P&L</dt>
                  {getStatusBadge(profitLoss.status)}
                </div>
                <dd className={`mt-1 text-2xl font-bold ${profitLoss.netProfitOrLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  ₹{profitLoss.netProfitOrLoss?.toLocaleString('en-IN')}
                </dd>
              </div>
            </div>
          )}

          {/* EXPENSE LEDGER */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Project Expense & Wage Ledger</h3>
                <p className="text-xs text-gray-500 mt-0.5">Comprehensive audit trail of worker wage payments, materials, and equipment cost entries.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                {expenses.length} Total Ledger Entries
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <Receipt className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-700">No expenses recorded for this project yet.</p>
                <p className="text-xs text-gray-400 mt-1">Disburse worker wages or log expenses using the buttons above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Reference ID</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => {
                      const cat = (expense.category || '').toUpperCase();
                      const isWorkforce = ['LABOUR', 'WORKFORCE', 'WORKER', 'WAGE'].includes(cat);

                      return (
                        <tr key={expense.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-800">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-lg border ${
                              isWorkforce ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {isWorkforce ? 'WORKFORCE' : cat}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ₹{expense.amount?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">
                            {expense.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400">
                            {expense.referenceId || `#EXP-${expense.id}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* General Expense Modal */}
      <ExpenseFormModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => fetchProjectFinance(selectedProjectId)}
        projectId={selectedProjectId}
      />

      {/* Disburse Worker Wage Modal in Finance */}
      <Modal
        isOpen={isWageModalOpen}
        onClose={() => setIsWageModalOpen(false)}
        title="Disburse Worker Wage (Finance Module)"
      >
        {wageError && <Alert type="error" message={wageError} className="mb-4" />}
        <form onSubmit={handlePayWorkerWage} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Worker *</label>
            <select
              required
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedLabourId}
              onChange={(e) => {
                setSelectedLabourId(e.target.value);
                const w = workers.find(item => item.id === Number(e.target.value));
                if (w && w.remainingAmount && w.remainingAmount > 0) {
                  setWageAmount(w.remainingAmount);
                }
              }}
            >
              <option value="">-- Select Worker Assigned to Project --</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.firstName} {w.lastName} ({w.role}) — Outstanding Pay: ₹{(w.remainingAmount || 0).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Amount (₹) *</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 1200"
              value={wageAmount}
              onChange={(e) => setWageAmount(e.target.value ? parseFloat(e.target.value) : '')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Notes / Description</label>
            <Input
              type="text"
              placeholder="e.g. Weekly wage payment"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsWageModalOpen(false)} disabled={isSubmittingWage}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmittingWage} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmittingWage ? 'Processing Payment...' : 'Disburse Wage & Record Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
