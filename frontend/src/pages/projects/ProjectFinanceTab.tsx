import { useState, useEffect } from 'react';
import { FinanceService } from '../../services/financeService';
import type { Expense, ProjectBudget } from '../../types/finance';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { Alert } from '../../components/common/Alert';

interface Props {
  projectId: number;
  budget: ProjectBudget;
}

export const ProjectFinanceTab = ({ projectId, budget }: Props) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await FinanceService.getProjectExpenses(projectId);
        // Sort descending by date/id
        setExpenses(data.sort((a, b) => b.id - a.id));
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load project expenses.');
        } else {
          setExpenses([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} className="mt-4" />;
  }

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Actual Cost</p>
          <p className="text-xl font-bold text-gray-900">₹{budget.actualExpenses?.toLocaleString() || '0'}</p>
        </Card>
        <Card className="p-4 bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Amount Paid</p>
          <p className="text-xl font-bold text-blue-900">₹{budget.amountPaid?.toLocaleString() || '0'}</p>
        </Card>
        <Card className="p-4 bg-orange-50 border border-orange-100">
          <p className="text-sm text-orange-600 font-medium">Outstanding</p>
          <p className="text-xl font-bold text-orange-900">₹{budget.outstandingAmount?.toLocaleString() || '0'}</p>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Ledger</h3>
        {expenses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
            <p className="text-gray-500">No expenses recorded for this project yet.</p>
            <p className="text-sm text-gray-400 mt-1">Expenses are automatically generated from workforce, materials, and equipment modules.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {['LABOUR', 'WORKFORCE', 'WORKER'].includes(expense.category) ? 'WORKFORCE' : expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{expense.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {expense.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.referenceId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
