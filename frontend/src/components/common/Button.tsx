import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex justify-center items-center gap-2 rounded-lg font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.985] select-none whitespace-nowrap';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-xs',
    accent:
      'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 shadow-xs',
    secondary:
      'bg-[#F1F0EC] text-slate-800 hover:bg-[#E7E5DF] border border-[#E4E4DF] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/40 shadow-xs',
    outline:
      'border border-[#D8D8D2] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-[#F7F7F5] dark:hover:bg-slate-800',
    ghost:
      'text-slate-600 dark:text-slate-300 hover:bg-[#F1F0EC] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-5 text-sm',
  };

  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        isDisabled ? 'opacity-60 cursor-not-allowed active:scale-100' : ''
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
};
