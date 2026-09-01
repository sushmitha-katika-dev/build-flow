import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { AuthService } from '../../services/authService';
import type { RegisterCredentials, Role } from '../../types/auth';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
    adminSecretCode: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAdminRole = formData.role === 'ADMIN' || 
                      formData.role === 'CONTRACTOR' || 
                      formData.role === 'PROJECT_MANAGER' || 
                      formData.role === 'FINANCE_MANAGER';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim() || !formData.email.trim() || !formData.password?.trim()) {
      setError('All fields are required.');
      return;
    }

    if (isAdminRole && !formData.adminSecretCode?.trim()) {
      setError('Company Admin Access Passcode is required to register an Admin or Manager account.');
      return;
    }

    try {
      setIsSubmitting(true);
      await AuthService.register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900">Registration Successful!</h3>
        <p className="text-slate-600 text-xs max-w-sm mx-auto">
          {formData.role === 'SITE_SUPERVISOR'
            ? 'Your supervisor account has been created. Awaiting Admin authorization before sign-in.'
            : 'Your Admin account has been authorized & created successfully. Redirecting to login...'}
        </p>
        <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition-all">
          Go to Login now →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
        Create a New Account
      </h2>
      <p className="text-xs text-gray-500 text-center mb-6">
        BuildFlow Enterprise Operations Portal
      </p>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error && <Alert type="error" message={error} className="mb-4" />}

        <Input
          label="Username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="admin_user"
          disabled={isSubmitting}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="admin@buildflow.com"
          disabled={isSubmitting}
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter a secure password"
          disabled={isSubmitting}
        />

        <div className="space-y-1 mb-4">
          <label className="block text-sm font-medium text-gray-700">Account Role Privilege</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
            disabled={isSubmitting}
          >
            <option value="ADMIN">Admin / Owner</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="FINANCE_MANAGER">Finance Manager</option>
            <option value="SITE_SUPERVISOR">Site Supervisor (Requires Admin Approval)</option>
          </select>
        </div>

        {/* ADMIN SECURITY ACCESS PASSCODE FIELD */}
        {isAdminRole ? (
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Company Admin Access Passcode Required</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Security Notice: Admin accounts require the active company passcode provided by your company owner.
            </p>
            <Input
              label="Company Security Key"
              type="password"
              value={formData.adminSecretCode || ''}
              onChange={(e) => setFormData({ ...formData, adminSecretCode: e.target.value })}
              placeholder="e.g. BF-ADMIN-2026"
              disabled={isSubmitting}
            />
          </div>
        ) : (
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>Site Supervisors register into <strong>Pending Approval</strong> state until authorized by an Admin.</span>
          </div>
        )}

        <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
          Create Authorized Account
        </Button>

        <div className="text-center mt-4 text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};
