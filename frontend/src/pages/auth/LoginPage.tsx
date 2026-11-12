import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthField } from '../../components/auth/AuthField';

interface FieldErrors {
  username?: string;
  password?: string;
}

export const LoginPage: React.FC = () => {
  const { login, error, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetHelp, setShowResetHelp] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};
    if (!username.trim()) {
      nextErrors.username = 'Username is required.';
    }
    if (!password.trim()) {
      nextErrors.password = 'Password is required.';
    }
    setFieldErrors(nextErrors);

    if (nextErrors.username) {
      usernameRef.current?.focus();
      return false;
    }
    if (nextErrors.password) {
      passwordRef.current?.focus();
      return false;
    }
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (fieldErrors.username) {
      setFieldErrors((prev) => ({ ...prev, username: undefined }));
    }
    if (error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ username: username.trim(), password });
    } catch {
      // Error state is populated cleanly in AuthContext via getAuthErrorMessage
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to continue.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthField
          ref={usernameRef}
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          error={fieldErrors.username}
          placeholder="Enter username"
          autoComplete="username"
          autoFocus
          disabled={isSubmitting}
        />

        <AuthField
          ref={passwordRef}
          id="password"
          label="Password"
          type="password"
          enablePasswordToggle
          value={password}
          onChange={handlePasswordChange}
          error={fieldErrors.password}
          placeholder="Enter password"
          autoComplete="current-password"
          disabled={isSubmitting}
          labelAction={
            <button
              type="button"
              onClick={() => setShowResetHelp((prev) => !prev)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:underline"
            >
              Forgot password?
            </button>
          }
        />

        {showResetHelp && (
          <p className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Contact your company administrator for password assistance, or update your password under Profile once signed in.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-amber-600 dark:hover:bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40 focus-visible:ring-offset-2 disabled:opacity-65 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
        Need an account?{' '}
        <Link
          to="/register"
          className="font-medium text-slate-900 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
        >
          Create account
        </Link>
      </div>
    </div>
  );
};
