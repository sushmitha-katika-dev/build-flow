import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { formatRoleLabel, getInitials } from '../../utils/formatters';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  onRequestSignOut: () => void;
}

interface RouteMeta {
  section?: string;
  title: string;
}

const getRouteMeta = (pathname: string, isSupervisor: boolean): RouteMeta => {
  if (pathname === '/' || pathname === '/supervisor') {
    return {
      section: 'Overview',
      title: isSupervisor ? 'Site Dashboard' : 'Executive Dashboard',
    };
  }
  if (/^\/projects\/\d+/.test(pathname)) {
    return { section: 'Projects & Sites', title: 'Project Workspace' };
  }
  if (pathname.startsWith('/projects')) {
    return { section: 'Operations', title: 'Projects & Sites' };
  }
  if (/^\/workforce\/\d+\/history/.test(pathname)) {
    return { section: 'Workforce & Shifts', title: 'Worker Ledger' };
  }
  if (pathname.startsWith('/workforce')) {
    return { section: 'Operations', title: 'Workforce & Shifts' };
  }
  if (pathname.startsWith('/inventory')) {
    return { section: 'Operations', title: 'Inventory & Materials' };
  }
  if (pathname.startsWith('/equipment')) {
    return { section: 'Operations', title: 'Equipment & Fleet' };
  }
  if (pathname.startsWith('/finance')) {
    return { section: 'Finance & Org', title: 'Finance & P&L' };
  }
  if (pathname.startsWith('/company')) {
    return { section: 'Finance & Org', title: 'Company Profile' };
  }
  if (pathname.startsWith('/settings')) {
    return { section: 'Account', title: 'Preferences & Security' };
  }
  if (pathname.startsWith('/profile')) {
    return { section: 'Account', title: 'User Profile' };
  }
  return { title: 'Workspace' };
};

export const Header = ({
  isSidebarCollapsed,
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  onRequestSignOut,
}: HeaderProps) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSupervisor = user?.role === 'SITE_SUPERVISOR' || user?.role === 'SUPERVISOR';
  const routeMeta = getRouteMeta(pathname, isSupervisor);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="h-14 shrink-0 bg-surface/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-hairline dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 z-30">
      {/* Left: Navigation toggles & Contextual Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#F1F0EC] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-[#F1F0EC] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <span className="hidden sm:block h-4 w-px bg-[#E4E4DF] dark:bg-slate-800" aria-hidden="true" />

        <div className="flex items-center gap-1.5 min-w-0 text-sm">
          {routeMeta.section && (
            <>
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500 truncate">
                {routeMeta.section}
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-600">/</span>
            </>
          )}
          <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {routeMeta.title}
          </span>
        </div>
      </div>

      {/* Right: Theme toggle & Account Menu */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-[#E4E4DF] dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-[#F1F0EC] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg border border-[#E4E4DF] dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-[#F7F7F5] dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40"
          >
            <div
              className={`w-5 h-5 rounded text-[10px] font-semibold flex items-center justify-center ${
                isSupervisor
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              }`}
            >
              {getInitials(user?.username)}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
              {user?.username || 'User'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                isDropdownOpen ? 'rotate-180 text-slate-700 dark:text-slate-200' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E4DF] dark:border-slate-800 shadow-popover p-1.5 z-50 animate-panel-in"
            >
              <div className="px-2.5 py-2 border-b border-[#E4E4DF] dark:border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatRoleLabel(user?.role)}
                </p>
              </div>

              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-[#F1F0EC] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                User Profile
              </Link>

              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-[#F1F0EC] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Account Settings
              </Link>

              <div className="my-1 border-t border-[#E4E4DF] dark:border-slate-800" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  onRequestSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
