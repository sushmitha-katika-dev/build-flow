import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, ChevronDown, User as UserIcon, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  onRequestSignOut: () => void;
}

export const Header = ({ toggleSidebar, onRequestSignOut }: HeaderProps) => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-white border-b border-gray-200/80 h-16 flex items-center justify-between px-4 lg:px-8 z-10 relative shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">BuildFlow</span>
          <span className="text-[10px] font-black tracking-widest uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
            From Work to Worth
          </span>
        </div>
      </div>
      
      {/* Top-Right User Profile Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {getInitials(user?.username)}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-900 leading-tight">{user?.username || 'Admin'}</span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{user?.role || 'ADMIN'}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-xs">
            {/* Header info */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {getInitials(user?.username)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-900 truncate">{user?.username || 'Admin'}</p>
                <span className="inline-block font-extrabold text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 mt-0.5">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1">
              <Link
                to="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
              >
                <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
              >
                <Settings className="w-4 h-4 mr-3 text-gray-400" />
                Settings
              </Link>
            </div>

            <div className="border-t border-gray-100 pt-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onRequestSignOut();
                }}
                className="w-full flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left"
              >
                <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
