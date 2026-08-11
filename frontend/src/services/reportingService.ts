import { axiosClient } from '../api/axiosClient';
import type { DashboardMetrics } from '../types/reporting';

export const ReportingService = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await axiosClient.get<DashboardMetrics>('/reporting/dashboard');
    return response.data;
  }
};
