import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from '../components/ui/toastContext';

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

