import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Package, 
  Tractor, 
  IndianRupee, 
  BarChart3,
  Building,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onRequestSignOut: () => void;
}

export const Sidebar = ({ isOpen, onRequestSignOut }: SidebarProps) => {
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Projects', path: '/projects', icon: <FolderKanban className="w-4 h-4" /> },
        { name: 'Workforce', path: '/workforce', icon: <Users className="w-4 h-4" /> },
        { name: 'Inventory', path: '/inventory', icon: <Package className="w-4 h-4" /> },
        { name: 'Equipment', path: '/equipment', icon: <Tractor className="w-4 h-4" /> }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Finance', path: '/finance', icon: <IndianRupee className="w-4 h-4" /> },
        { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-4 h-4" /> }
      ]
    },
    {
      title: 'COMPANY',
      items: [
        { name: 'Company', path: '/company', icon: <Building className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-20 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center py-4 bg-slate-950 border-b border-slate-800/80">
          <span className="font-black text-xl tracking-wider text-white">BuildFlow</span>
          <span className="text-[9px] font-black tracking-widest uppercase text-blue-400 mt-0.5">
            From Work to Worth
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="overflow-y-auto overflow-x-hidden flex-grow px-3 py-4 space-y-5 max-h-[calc(100vh-12rem)]">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {section.title}
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* System Settings & User Profile Footer */}
      <div className="border-t border-slate-800 bg-slate-950 p-3 space-y-3">
        <div className="space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span className="ml-3">Settings</span>
          </NavLink>

          <button
            onClick={onRequestSignOut}
            className="w-full flex items-center px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-3">Sign Out</span>
          </button>
        </div>

        {/* User Identity Card */}
        <NavLink to="/profile" className="flex items-center space-x-3 p-2 bg-slate-900 rounded-xl hover:bg-slate-850 transition-colors border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-blue-400/30">
            {getInitials(user?.username)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.username || 'Admin'}</p>
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">{user?.role || 'ADMIN'}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
};
