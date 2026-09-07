import { useAuth } from '../../context/AuthContext';
import { DashboardPage } from './DashboardPage';
import { SupervisorDashboardPage } from '../supervisor/SupervisorDashboardPage';

export const DashboardRouter = () => {
  const { user } = useAuth();

  const isSupervisor = user?.role === 'SITE_SUPERVISOR' || user?.role === 'SUPERVISOR';

  if (isSupervisor) {
    return <SupervisorDashboardPage />;
  }

  return <DashboardPage />;
};
