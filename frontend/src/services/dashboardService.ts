import { axiosClient } from '../api/axiosClient';
import type { DashboardMetrics } from '../types/dashboard';

export const DashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await axiosClient.get<DashboardMetrics>('/reporting/dashboard');
    return response.data;
  }
};
