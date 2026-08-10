import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, FolderKanban } from 'lucide-react';
import { DashboardService } from '../../services/dashboardService';
import type { DashboardMetrics } from '../../types/dashboard';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await DashboardService.getMetrics();
        setMetrics(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics. The reporting service might be unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <Card className="h-96">
          <Skeleton className="h-full w-full" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Alert type="info" message="No metrics available." />
      </div>
    );
  }

  const isProfitable = metrics.netProfitOrLoss >= 0;

  // Chart data formatting
  const financialData = [
    {
      name: 'Financials',
      Revenue: metrics.totalCompanyRevenue,
      Expenses: metrics.totalCompanyExpenses,
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date(metrics.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Total Revenue</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                ${metrics.totalCompanyRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Total Expenses</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                ${metrics.totalCompanyExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Net Profit / Loss</p>
              <div className="flex items-center mt-1">
                <p className={`text-3xl font-semibold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(metrics.netProfitOrLoss).toLocaleString()}
                </p>
                {isProfitable ? (
                  <TrendingUp className="w-5 h-5 ml-2 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 ml-2 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Active Projects</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {metrics.activeProjectsCount}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Revenue vs Expenses" className="lg:col-span-2">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Alerts & Notifications">
          <div className="space-y-4">
            {metrics.lowStockAlertsCount > 0 ? (
              <div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Low Stock Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {metrics.lowStockAlertsCount} items in inventory are running low.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No active alerts
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
