import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { User, Lock, LogOut, Sliders, Moon, Sun, Check, Edit2, Key, ShieldCheck, UserCheck } from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateUsername } = useAuth();
  const { onRequestSignOut } = useOutletContext<{ onRequestSignOut: () => void }>();
  const isSupervisor = user?.role === 'SITE_SUPERVISOR' || user?.role === 'SUPERVISOR';

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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Executive Title Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Application & Account Settings</h1>
            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
              isSupervisor
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            }`}>
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">Manage your user identity, secret credentials, interface themes, and security session.</p>
        </div>

        <Link to="/profile">
          <Button className="bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl font-bold text-xs px-5 py-3 shadow-md flex items-center">
            <UserCheck className="w-4 h-4 mr-2 text-blue-400" />
            View User Profile
          </Button>
        </Link>
      </div>

      {message && <Alert type={message.type} message={message.text} className="mb-4" />}

      {/* 1. ACCOUNT IDENTITY SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Account Display Identity</h3>
            <p className="text-xs text-slate-500">Manage your display username shown across site logs and headers.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          <div>
            <div className="flex items-center space-x-2.5">
              <h4 className="text-base font-extrabold text-slate-900">{user?.username || 'User'}</h4>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase border ${
                isSupervisor
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {user?.role || 'SITE_SUPERVISOR'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Your display username logged for audit trails and reports.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" size="sm" onClick={() => setIsUsernameModalOpen(true)} className="rounded-xl font-bold text-xs">
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Change Username
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SECURITY SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Security & Password Credentials</h3>
            <p className="text-xs text-slate-500">Manage your account authentication password.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" /> Account Secret Password
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-medium">Updating your password periodically ensures robust account security.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsPasswordModalOpen(true)} className="rounded-xl font-bold text-xs">
            <Key className="w-3.5 h-3.5 mr-1.5" />
            Change Password
          </Button>
        </div>
      </div>

      {/* 3. APPEARANCE THEME SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Workspace Appearance Theme</h3>
            <p className="text-xs text-slate-500">Choose between Light Standard and Dark Executive interface themes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => handleThemeChange('light')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              themeMode === 'light' 
                ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Light Standard</p>
                <p className="text-xs text-slate-500 font-medium">Clean, high-contrast light layout</p>
              </div>
            </div>
            {themeMode === 'light' && (
              <span className="p-1.5 bg-blue-600 text-white rounded-full shadow-sm">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>

          <div 
            onClick={() => handleThemeChange('dark')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              themeMode === 'dark' 
                ? 'bg-slate-900 text-white border-blue-500 ring-2 ring-blue-500/30 shadow-md' 
                : 'bg-slate-900/90 text-slate-100 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-slate-800 text-blue-400 rounded-xl border border-slate-700">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dark Executive</p>
                <p className="text-xs text-slate-400 font-medium">Sleek dark mode environment</p>
              </div>
            </div>
            {themeMode === 'dark' && (
              <span className="p-1.5 bg-blue-500 text-white rounded-full shadow-sm">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. SESSION MANAGEMENT SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Workspace Session</h3>
            <p className="text-xs text-slate-500">Safely log out of your session</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-rose-50/60 rounded-2xl border border-rose-200/80">
          <div>
            <h4 className="text-sm font-extrabold text-rose-950">Sign Out of BuildFlow</h4>
            <p className="text-xs text-rose-700 mt-1 font-medium">Terminate active workspace session and clear local token.</p>
          </div>
          <Button variant="danger" size="sm" onClick={onRequestSignOut} className="rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white">
            Sign Out
          </Button>
        </div>
      </div>

      {/* --- CHANGE USERNAME MODAL --- */}
      {isUsernameModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsUsernameModalOpen(false)} />

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Change Display Username</h3>
              <form onSubmit={handleSaveUsername} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Username *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="secondary" onClick={() => setIsUsernameModalOpen(false)} disabled={isLoading} className="rounded-xl font-bold text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs">
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

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Change Account Password</h3>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="secondary" onClick={() => setIsPasswordModalOpen(false)} disabled={isLoading} className="rounded-xl font-bold text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs">
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
