import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { User, Lock, LogOut, Sliders, Moon, Sun, Check, Edit2, Key } from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateUsername } = useAuth();
  const { onRequestSignOut } = useOutletContext<{ onRequestSignOut: () => void }>();

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Theme State
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Modal States
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form States
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user?.username) {
      setNewUsername(user.username);
    }
  }, [user]);

  const handleThemeChange = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setMessage({ type: 'success', text: `Appearance theme updated to ${mode.toUpperCase()} mode!` });
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newUsername.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty.' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await AuthService.updateUsername(user.username, newUsername.trim());
      localStorage.setItem('token', response.token);
      updateUsername(response.username);
      setIsUsernameModalOpen(false);
      setMessage({ type: 'success', text: `Username successfully updated in database to "${response.username}"!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update username.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await AuthService.updatePassword(user.username, passwordForm.currentPassword, passwordForm.newPassword);
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Account password updated successfully in database!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password. Please check your current password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Application & Account Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage your credentials, theme appearance, profile identity, and active session.</p>
      </div>

      {message && <Alert type={message.type} message={message.text} className="mb-4" />}

      {/* 1. ACCOUNT IDENTITY SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Account Identity</h3>
            <p className="text-xs text-gray-500">Manage your display username and profile details.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-gray-900">{user?.username || 'Admin'}</h4>
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Your display username shown in reports, logs, and headers.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setIsUsernameModalOpen(true)}>
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Change Username
            </Button>
            <Link to="/profile">
              <Button variant="secondary" size="sm">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SECURITY SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Security & Password</h3>
            <p className="text-xs text-gray-500">Manage your secret account authentication password.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Account Password</h4>
            <p className="text-xs text-gray-500 mt-0.5">Regularly updating your password keeps your workspace secure.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
            <Key className="w-3.5 h-3.5 mr-1.5" />
            Change Password
          </Button>
        </div>
      </div>

      {/* 3. APPEARANCE THEME SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Appearance Theme</h3>
            <p className="text-xs text-gray-500">Switch between Light Standard and Dark Executive application themes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              themeMode === 'light' 
                ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-500/20' 
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Light Standard</p>
                <p className="text-xs text-gray-500">Clean, high-contrast light theme</p>
              </div>
            </div>
            {themeMode === 'light' && (
              <span className="p-1 bg-blue-600 text-white rounded-full">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>

          <div 
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              themeMode === 'dark' 
                ? 'bg-slate-900 text-white border-blue-500 ring-2 ring-blue-500/30' 
                : 'bg-slate-900/90 text-slate-100 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-800 text-blue-400 rounded-lg border border-slate-700">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dark Executive</p>
                <p className="text-xs text-slate-400">Sleek dark mode environment</p>
              </div>
            </div>
            {themeMode === 'dark' && (
              <span className="p-1 bg-blue-500 text-white rounded-full">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. SESSION SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Session Management</h3>
            <p className="text-xs text-gray-500">Manage your active workspace authentication session.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-rose-50/50 rounded-xl border border-rose-200">
          <div>
            <h4 className="text-sm font-bold text-rose-900">Sign Out of BuildFlow</h4>
            <p className="text-xs text-rose-700 mt-0.5">End your active workspace session safely.</p>
          </div>
          <Button variant="danger" size="sm" onClick={onRequestSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* --- CHANGE USERNAME MODAL --- */}
      {isUsernameModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsUsernameModalOpen(false)} />

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Change Display Username</h3>
              <form onSubmit={handleSaveUsername} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">New Username *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button type="button" variant="secondary" onClick={() => setIsUsernameModalOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Save Username'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- CHANGE PASSWORD MODAL --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Change Account Password</h3>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button type="button" variant="secondary" onClick={() => setIsPasswordModalOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
