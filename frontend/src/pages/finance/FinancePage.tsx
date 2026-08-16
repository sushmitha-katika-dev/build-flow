import { useEffect, useState } from 'react';
import { Plus, Banknote, Search } from 'lucide-react';
import { FinanceService } from '../../services/financeService';
import { ProjectService } from '../../services/projectService';
import type { Expense, ProfitLossSummary } from '../../types/finance';
import type { Project } from '../../types/project';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { Badge } from '../../components/common/Badge';
import { ExpenseFormModal } from './components/ExpenseFormModal';

export const FinancePage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profitLoss, setProfitLoss] = useState<ProfitLossSummary | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    ProjectService.getAllProjects().then(setProjects).catch(() => {});
  }, []);

  const fetchProjectFinance = async (projectId: number) => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [expData, plData] = await Promise.all([
        FinanceService.getProjectExpenses(projectId),
        FinanceService.getProjectProfitLoss(projectId)
      ]);
      setExpenses(expData);
      setProfitLoss(plData);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-sm text-gray-500">Track expenses, budgets, and project profitability.</p>
        </div>
        <Button onClick={() => setIsExpenseModalOpen(true)} disabled={selectedProjectId === 0}>
          <Plus className="w-4 h-4 mr-2" />
          Log Expense
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Project:</label>
        <select
          className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(Number(e.target.value))}
        >
          <option value={0}>-- Select a project to view financials --</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.projectName}</option>
          ))}
        </select>
      </div>

      {error && <Alert type="error" message={error} />}

      {selectedProjectId === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 border-dashed p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No project selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a project from the dropdown above to view its financial data.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {profitLoss && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Est. Budget</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">₹{profitLoss.totalEstimatedBudget?.toLocaleString()}</dd>
              </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                <dd className="mt-1 text-2xl font-semibold text-red-600">₹{profitLoss.totalExpenses?.toLocaleString()}</dd>
              </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Payments Received</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-600">₹{profitLoss.totalPaymentsReceived?.toLocaleString()}</dd>
              </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500 truncate">Net P&L</dt>
                  {getStatusBadge(profitLoss.status)}
                </div>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">₹{profitLoss.netProfitOrLoss?.toLocaleString()}</dd>
              </div>
            </div>
          )}

          {expenses.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 border-dashed p-12 text-center">
              <Banknote className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No expenses recorded</h3>
              <p className="mt-1 text-sm text-gray-500">Log an expense to start tracking financials.</p>
              <div className="mt-6">
                <Button onClick={() => setIsExpenseModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Expense
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Project Expenses</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref ID</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="default">
                            {['LABOUR', 'WORKFORCE', 'WORKER'].includes(expense.category) ? 'WORKFORCE' : expense.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {expense.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.referenceId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                          ₹{expense.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <ExpenseFormModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        onSuccess={() => fetchProjectFinance(selectedProjectId)}
        projectId={selectedProjectId}
      />
    </div>
  );
};
