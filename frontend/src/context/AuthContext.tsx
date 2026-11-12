import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { LoginCredentials, Role } from '../types/auth';
import { AuthService } from '../services/authService';
import { getAuthErrorMessage } from '../utils/authError';

interface User {
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUsername: (newUsername: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Tracks initial localStorage session hydration only so login attempts keep form state mounted.
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    try {
      const data = await AuthService.login(credentials);

      localStorage.setItem('token', data.token);

      const userData: User = { username: data.username, role: data.role };
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Invalid username or password.'));
      throw err;
    }
  };

  const updateUsername = (newUsername: string) => {
    if (!user) return;
    const updatedUser = { ...user, username: newUsername };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        updateUsername,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
