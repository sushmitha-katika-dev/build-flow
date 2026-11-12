import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 rounded-xl border border-dashed border-[#D8D8D2] dark:border-slate-700 bg-surface dark:bg-slate-900/50 ${className}`}
    >
      <div className="w-11 h-11 rounded-lg bg-[#F1F0EC] dark:bg-slate-800 border border-[#E4E4DF] dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3.5">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

