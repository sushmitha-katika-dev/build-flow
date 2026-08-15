export type ExpenseCategory = 'LABOUR' | 'MATERIAL' | 'EQUIPMENT' | 'FUEL' | 'TRANSPORT' | 'MISCELLANEOUS';
export type PaymentType = 'ADVANCE' | 'MILESTONE' | 'FINAL';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Expense {
  id: number;
  projectId: number;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description?: string;
  referenceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseRequest {
  projectId: number;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description?: string;
  referenceId?: string;
}

export interface ProfitLossSummary {
  projectId: number;
  totalEstimatedBudget: number;
  totalExpenses: number;
  totalPaymentsReceived: number;
  netProfitOrLoss: number;
  status: 'PROFIT' | 'LOSS' | 'BREAK_EVEN';
}

export interface ProjectBudget {
  id: number;
  projectId: number;
  estimatedBudget: number;
  actualExpenses: number;
  remainingBudget: number;
  amountPaid: number;
  outstandingAmount: number;
  createdAt?: string;
  updatedAt?: string;
}
