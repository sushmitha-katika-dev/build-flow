import { useEffect, useState } from 'react';
import { 
  Building2, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Activity,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReportingService } from '../../services/reportingService';
import type { DashboardMetrics } from '../../types/reporting';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ReportingService.getDashboardMetrics();
        setMetrics(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const getMetricCard = (
    title: string, 
    value: string | number, 
    icon: React.ReactNode, 
    trend?: { value: string; isPositive: boolean },
    linkTo?: string,
    colorClass: string = "bg-blue-50 text-blue-600"
  ) => {
    const CardContent = () => (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
          <div className={`p-3 rounded-lg ${colorClass}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={trend.isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {trend.value}
            </span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        )}
      </div>
    );

    return linkTo ? (
      <Link to={linkTo} className="block group">
        <CardContent />
      </Link>
    ) : (
      <CardContent />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Welcome back. Here's what's happening today.</p>
        </div>
        {metrics && metrics.generatedAt && (
          <div className="text-xs text-gray-400">
            Last updated: {new Date(metrics.generatedAt).toLocaleString()}
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : metrics ? (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getMetricCard(
              "Active Projects",
              metrics.activeProjectsCount,
              <Building2 className="w-6 h-6" />,
              { value: "+2", isPositive: true },
              "/projects",
              "bg-blue-50 text-blue-600"
            )}
            
            {getMetricCard(
              "Workers",
              metrics.workersCount,
              <Users className="w-6 h-6" />,
              { value: "+12", isPositive: true },
              "/workforce",
              "bg-purple-50 text-purple-600"
            )}

            {getMetricCard(
              "Material Investment",
              `₹${metrics.materialInvestment?.toLocaleString() || '18.4L'}`,
              <AlertTriangle className="w-6 h-6" />,
              undefined,
              "/inventory",
              "bg-orange-50 text-orange-600"
            )}

            {getMetricCard(
              "Total Expenses",
              `₹${metrics.totalCompanyExpenses?.toLocaleString()}`,
              <Activity className="w-6 h-6" />,
              { value: "+5.2%", isPositive: false },
              "/finance",
              "bg-red-50 text-red-600"
            )}

            {getMetricCard(
              "Revenue",
              `₹${metrics.totalCompanyRevenue?.toLocaleString()}`,
              <TrendingUp className="w-6 h-6" />,
              { value: "+8.4%", isPositive: true },
              "/finance",
              "bg-blue-50 text-blue-600"
            )}

            {getMetricCard(
              "Estimated Profit",
              `₹${metrics.netProfitOrLoss?.toLocaleString()}`,
              <DollarSign className="w-6 h-6" />,
              { value: "+12.5%", isPositive: true },
              "/finance",
              "bg-green-50 text-green-600"
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Activity placeholder (can be expanded later) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 text-center py-8">Activity feed integration coming soon...</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <Link to="/projects" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                  New Project
                </Link>
                <Link to="/workforce" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  Add Worker
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
