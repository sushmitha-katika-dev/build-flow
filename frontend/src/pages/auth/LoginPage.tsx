import React, { useState } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { HardHat } from 'lucide-react';

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

    // Basic Form Validation
    if (!username.trim() || !password.trim()) {
      setValidationError('Username and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ username, password });
      // On success, AuthLayout will automatically redirect to '/' via context change
    } catch (err) {
      // Error is handled by AuthContext and passed down via 'error'
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-blue-100 rounded-full">
          <HardHat className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {error && <Alert type="error" message={error} className="mb-4" />}
        {validationError && <Alert type="error" message={validationError} className="mb-4" />}

        <Input
          label="Username"
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          autoComplete="username"
          disabled={isSubmitting}
        />

        <Input
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={isSubmitting}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>

        <div className="text-center mt-4 text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register now
          </a>
        </div>
      </form>
    </div>
  );
};
