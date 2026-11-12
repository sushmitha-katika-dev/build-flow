import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

export interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>, durationMs?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

