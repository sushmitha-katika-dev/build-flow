import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, HardHat, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error, clearError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (!username.trim() || !password.trim()) {
      setValidationError('Username and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ username, password });
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Autofill Helper
  const fillDemoAccount = (userRole: 'ADMIN' | 'SUPERVISOR') => {
    clearError();
    setValidationError('');
    if (userRole === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('katam');
      setPassword('katam123');
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Sign In to BuildFlow
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Access your contractor dashboard & field operations
        </p>
      </div>

      {/* QUICK DEMO LOGIN SHORTCUT PILLS */}
      <div className="mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">
          ⚡ Quick Demo Account Autofill:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('ADMIN')}
            className="flex items-center justify-center space-x-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 hover:border-blue-300 font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemoAccount('SUPERVISOR')}
            className="flex items-center justify-center space-x-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-slate-200 hover:border-amber-300 font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-2xs"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-600" />
            <span>Supervisor</span>
          </button>
        </div>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error && <Alert type="error" message={error} className="mb-4" />}
        {validationError && <Alert type="error" message={validationError} className="mb-4" />}

        <Input
          label="Username"
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. admin or katam"
          autoComplete="username"
          disabled={isSubmitting}
        />

        <Input
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isSubmitting}
        />

        <Button type="submit" className="w-full text-sm font-bold flex items-center justify-center space-x-2 py-3 mt-2" isLoading={isSubmitting}>
          <LogIn className="w-4 h-4 mr-1.5" />
          <span>Sign In to Dashboard</span>
        </Button>

        <div className="text-center pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-500">Need a new account? </span>
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Register Account →
          </Link>
        </div>
      </form>
    </div>
  );
};
