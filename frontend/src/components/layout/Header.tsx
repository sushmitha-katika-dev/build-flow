import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, ChevronDown, User as UserIcon, Settings, LogOut, HardHat, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  onRequestSignOut: () => void;
}

export const Header = ({ toggleSidebar, onRequestSignOut }: HeaderProps) => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSupervisor = user?.role === 'SITE_SUPERVISOR' || user?.role === 'SUPERVISOR';

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 z-30 relative shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="text-slate-600 hover:text-slate-900 focus:outline-none lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <span className="font-black text-xl text-slate-900 tracking-wider">BuildFlow</span>
          <span className="text-[9px] font-black tracking-widest uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
            From Work to Worth
          </span>
        </div>
      </div>
      
      {/* Top-Right User Profile Dropdown */}
      <div className="relative z-50" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-3 p-1.5 px-3 rounded-2xl hover:bg-slate-100/80 transition-all border border-slate-200/80 focus:outline-none shadow-xs"
        >
          <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center text-white shadow-sm border ${
            isSupervisor 
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 border-amber-400/30' 
              : 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400/30'
          }`}>
            {getInitials(user?.username)}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-black text-slate-900 leading-tight">{user?.username || 'User'}</span>
            <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider">{user?.role || 'ADMIN'}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-slate-700' : ''}`} />
        </button>

        {/* Solid Non-Transparent High-Z Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-xs ring-1 ring-black/5 divide-y divide-slate-100">
            {/* Header info */}
            <div className="p-3 bg-slate-900 text-white rounded-xl mb-1 flex items-center space-x-3 border border-slate-800 shadow-md">
              <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center text-white shrink-0 border ${
                isSupervisor
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400/40'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400/40'
              }`}>
                {getInitials(user?.username)}
              </div>
              <div className="overflow-hidden">
                <p className="font-extrabold text-sm text-white truncate">{user?.username || 'User'}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  {isSupervisor ? (
                    <span className="inline-flex items-center font-black text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">
                      <HardHat className="w-3 h-3 mr-1 text-amber-400" /> Supervisor
                    </span>
                  ) : (
                    <span className="inline-flex items-center font-black text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 mr-1 text-blue-400" /> {user?.role || 'ADMIN'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1 space-y-1">
              <Link
                to="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center px-3.5 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-blue-600 font-bold rounded-xl transition-all"
              >
                <UserIcon className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                User Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center px-3.5 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-blue-600 font-bold rounded-xl transition-all"
              >
                <Settings className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                Account Settings
              </Link>
            </div>

            <div className="pt-1 mt-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onRequestSignOut();
                }}
                className="w-full flex items-center px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-extrabold rounded-xl transition-all text-left"
              >
                <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                Sign Out Session
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
