import { axiosClient } from '../api/axiosClient';
import type { 
  Expense, 
  ExpenseRequest,
  ProfitLossSummary
} from '../types/finance';

export const FinanceService = {
  getProjectExpenses: async (projectId: number): Promise<Expense[]> => {
    const response = await axiosClient.get<Expense[]>(`/finance/expenses/project/${projectId}`);
    return response.data;
  },

  logExpense: async (data: ExpenseRequest): Promise<Expense> => {
    const response = await axiosClient.post<Expense>('/finance/expenses', data);
    return response.data;
  },

  getProjectProfitLoss: async (projectId: number): Promise<ProfitLossSummary> => {
    const response = await axiosClient.get<ProfitLossSummary>(`/finance/profit-loss/project/${projectId}`);
    return response.data;
  }
};
