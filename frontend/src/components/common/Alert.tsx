import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = '', onDismiss }) => {
  const styles: Record<AlertProps['type'], string> = {
    error:
      'bg-rose-50 text-rose-900 border-rose-200 border-l-rose-600 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-900/70 dark:border-l-rose-500',
    success:
      'bg-emerald-50 text-emerald-900 border-emerald-200 border-l-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-900/70 dark:border-l-emerald-500',
    info:
      'bg-sky-50 text-sky-900 border-sky-200 border-l-sky-600 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-900/70 dark:border-l-sky-500',
    warning:
      'bg-amber-50 text-amber-900 border-amber-200 border-l-amber-600 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900/70 dark:border-l-amber-500',
  };

  const icons: Record<AlertProps['type'], React.ReactNode> = {
    error: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg border border-l-[3px] text-[13px] leading-snug animate-fade-in ${styles[type]} ${className}`}
    >
      {icons[type]}
      <span className="flex-1 font-medium">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="text-current/60 hover:text-current p-0.5 rounded transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
