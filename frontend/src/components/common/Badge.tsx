import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'amber';
  dot?: boolean;
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  dot = false,
  className = '',
}: BadgeProps) => {
  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    amber:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    error:
      'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    info:
      'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
    default:
      'bg-[#F1F0EC] text-slate-700 border-[#E4E4DF] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const dotColors: Record<NonNullable<BadgeProps['variant']>, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    amber: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-sky-500',
    default: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium leading-4 ${variants[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
};
