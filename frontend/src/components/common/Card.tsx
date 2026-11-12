import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  padding = 'md',
}: CardProps) => {
  const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-surface dark:bg-slate-900 rounded-xl border border-hairline dark:border-slate-800 shadow-card overflow-hidden ${className}`}
    >
      {(title || headerAction) && (
        <div className="px-5 py-4 border-b border-hairline dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
};
