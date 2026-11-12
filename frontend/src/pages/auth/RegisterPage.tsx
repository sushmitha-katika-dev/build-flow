import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import { AuthField } from '../../components/auth/AuthField';
import { AuthService } from '../../services/authService';
import type { RegisterCredentials, Role } from '../../types/auth';
import { getAuthErrorMessage } from '../../utils/authError';

interface RegisterFieldErrors {
  username?: string;
  email?: string;
  password?: string;
  adminSecretCode?: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
    adminSecretCode: '',
  });

  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAdminRole =
    formData.role === 'ADMIN' ||
    formData.role === 'CONTRACTOR' ||
    formData.role === 'PROJECT_MANAGER' ||
    formData.role === 'FINANCE_MANAGER';

  const clearFieldError = (key: keyof RegisterFieldErrors) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (error) setError(null);
  };

  const validate = (): boolean => {
    const nextErrors: RegisterFieldErrors = {};

    if (!formData.username.trim()) {
      nextErrors.username = 'Username is required.';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!formData.password?.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    if (isAdminRole && !formData.adminSecretCode?.trim()) {
      nextErrors.adminSecretCode = 'Company access passcode is required for this role.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await AuthService.register({
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim(),
        adminSecretCode: formData.adminSecretCode?.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Failed to register account.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Account created
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formData.role === 'SITE_SUPERVISOR'
              ? 'Awaiting administrator approval before you can sign in.'
              : 'Redirecting you to sign in...'}
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Create account
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Set up your BuildFlow access credentials.
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
          id="register-username"
          label="Username"
          type="text"
          value={formData.username}
          onChange={(e) => {
            setFormData({ ...formData, username: e.target.value });
            clearFieldError('username');
          }}
          error={fieldErrors.username}
          placeholder="Choose a username"
          autoComplete="username"
          disabled={isSubmitting}
        />

        <AuthField
          id="register-email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            clearFieldError('email');
          }}
          error={fieldErrors.email}
          placeholder="name@company.com"
          autoComplete="email"
          disabled={isSubmitting}
        />

        <AuthField
          id="register-password"
          label="Password"
          type="password"
          enablePasswordToggle
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            clearFieldError('password');
          }}
          error={fieldErrors.password}
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          disabled={isSubmitting}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="register-role"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Role
          </label>
          <select
            id="register-role"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-amber-500 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-500/20 transition-colors"
            value={formData.role}
            onChange={(e) => {
              setFormData({ ...formData, role: e.target.value as Role });
              clearFieldError('adminSecretCode');
            }}
            disabled={isSubmitting}
          >
            <option value="ADMIN">Admin / Owner</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="FINANCE_MANAGER">Finance Manager</option>
            <option value="SITE_SUPERVISOR">Site Supervisor</option>
          </select>
        </div>

        {isAdminRole ? (
          <div className="rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-300">
              <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>Company passcode required for elevated roles</span>
            </div>
            <AuthField
              id="register-passcode"
              label="Access Passcode"
              type="password"
              enablePasswordToggle
              value={formData.adminSecretCode || ''}
              onChange={(e) => {
                setFormData({ ...formData, adminSecretCode: e.target.value });
                clearFieldError('adminSecretCode');
              }}
              error={fieldErrors.adminSecretCode}
              placeholder="Enter company passcode"
              disabled={isSubmitting}
            />
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs text-slate-600 dark:text-slate-300">
            <ShieldAlert className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Supervisor accounts require administrator approval before first sign-in.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-amber-600 dark:hover:bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40 focus-visible:ring-offset-2 disabled:opacity-65 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-slate-900 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
