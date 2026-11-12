import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', wrapperClassName = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`w-full mb-4 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full h-10 px-3 text-sm rounded-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-[border-color,box-shadow] duration-150 focus:outline-none ${
            error
              ? 'border-rose-400 dark:border-rose-500/70 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
              : 'border-[#D8D8D2] dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-slate-900 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-600/15'
          } disabled:bg-[#F1F0EC] dark:disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
