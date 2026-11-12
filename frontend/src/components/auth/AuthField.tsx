import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  labelAction?: ReactNode;
  enablePasswordToggle?: boolean;
}

/**
 * Accessible form input for authentication flows with inline validation and optional password visibility toggle.
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  (
    {
      id,
      label,
      error,
      labelAction,
      enablePasswordToggle = false,
      type = 'text',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = enablePasswordToggle || type === 'password';
    const resolvedType =
      enablePasswordToggle && type === 'password'
        ? showPassword
          ? 'text'
          : 'password'
        : type;

    const errorId = `${id}-error`;

    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
          {labelAction}
        </div>

        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={resolvedType}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800/60 ${
              isPasswordField && enablePasswordToggle ? 'pr-10' : ''
            } ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-slate-900 dark:focus:border-amber-500 focus:ring-slate-900/10 dark:focus:ring-amber-500/20'
            }`}
            {...props}
          />

          {enablePasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus-visible:text-slate-900 dark:focus-visible:text-white disabled:pointer-events-none transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthField.displayName = 'AuthField';

