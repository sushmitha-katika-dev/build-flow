import React, { useCallback, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ToastContext, type ToastItem, type ToastType } from './toastContext';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>, durationMs = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      if (durationMs > 0) {
        window.setTimeout(() => removeToast(id), durationMs);
      }
    },
    [removeToast]
  );

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    error: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E4DF] dark:border-slate-800 shadow-popover animate-toast-in"
            >
              {iconMap[toast.type]}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {toast.title}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
