import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { HardHat } from 'lucide-react';
import { AuthService } from '../../services/authService';
import type { RegisterCredentials, Role } from '../../types/auth';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim() || !formData.email.trim() || !formData.password?.trim()) {
      setError('All fields are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await AuthService.register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <HardHat className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
        <p className="text-gray-600 mb-6">You will be redirected to the login page shortly.</p>
        <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
          Go to Login now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-blue-100 rounded-full">
          <HardHat className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
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
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
            disabled={isSubmitting}
          >
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="SITE_SUPERVISOR">Site Supervisor</option>
            <option value="FINANCE_MANAGER">Finance Manager</option>
          </select>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create Account
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
