import { axiosClient } from '../api/axiosClient';
import type { 
  Expense, 
  ExpenseRequest,
  ProfitLossSummary,
  ProjectBudget
} from '../types/finance';

export const FinanceService = {
  getProjectExpenses: async (projectId: number): Promise<Expense[]> => {
    const response = await axiosClient.get<Expense[]>(`/expenses/project/${projectId}`);
    return response.data;
  },

  logExpense: async (data: ExpenseRequest): Promise<Expense> => {
    const response = await axiosClient.post<Expense>('/expenses', data);
    return response.data;
  },

  getProjectProfitLoss: async (projectId: number): Promise<ProfitLossSummary> => {
    const response = await axiosClient.get<ProfitLossSummary>(`/profit-loss/project/${projectId}`);
    return response.data;
  },

  getProjectBudget: async (projectId: number): Promise<ProjectBudget> => {
    const response = await axiosClient.get<ProjectBudget>(`/budgets/project/${projectId}`);
    return response.data;
  },

  initializeBudget: async (data: { projectId: number, estimatedBudget: number }): Promise<ProjectBudget> => {
    const response = await axiosClient.post<ProjectBudget>('/budgets/initialize', data);
    return response.data;
  }
};
