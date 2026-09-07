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
  LogOut,
  HardHat,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onRequestSignOut: () => void;
}

export const Sidebar = ({ isOpen, onRequestSignOut }: SidebarProps) => {
  const { user } = useAuth();
  const isSupervisor = user?.role === 'SITE_SUPERVISOR' || user?.role === 'SUPERVISOR';

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
        { 
          name: isSupervisor ? 'Site Dashboard' : 'Dashboard', 
          path: '/', 
          icon: isSupervisor ? <HardHat className="w-4 h-4 text-amber-400" /> : <LayoutDashboard className="w-4 h-4" /> 
        }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Projects & Sites', path: '/projects', icon: <FolderKanban className="w-4 h-4" /> },
        { name: 'Workforce & Shifts', path: '/workforce', icon: <Users className="w-4 h-4" /> },
        { name: 'Inventory & Materials', path: '/inventory', icon: <Package className="w-4 h-4" /> },
        { name: 'Equipment & Machinery', path: '/equipment', icon: <Tractor className="w-4 h-4" /> }
      ]
    },
    ...(!isSupervisor ? [
      {
        title: 'FINANCE',
        items: [
          { name: 'Finance Overview', path: '/finance', icon: <IndianRupee className="w-4 h-4" /> },
          { name: 'Reports & Analytics', path: '/reports', icon: <BarChart3 className="w-4 h-4" /> }
        ]
      },
      {
        title: 'COMPANY',
        items: [
          { name: 'Company Profile', path: '/company', icon: <Building className="w-4 h-4" /> }
        ]
      }
    ] : [])
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-20 w-64 bg-slate-950 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col justify-between border-r border-slate-800/80 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center py-5 bg-slate-950 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-black text-xs text-white">BF</span>
            </div>
            <span className="font-black text-xl tracking-wider text-white">BuildFlow</span>
          </div>
          <span className="text-[9px] font-black tracking-widest uppercase text-blue-400 mt-1">
            From Work to Worth
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="overflow-y-auto overflow-x-hidden flex-grow px-3.5 py-5 space-y-6 max-h-[calc(100vh-13rem)] scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                {section.title}
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' 
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
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

      {/* Modern User Profile & Session Footer */}
      <div className="border-t border-slate-800/90 bg-slate-950 p-3.5 space-y-3">
        {/* User Identity Card */}
        <NavLink 
          to="/profile" 
          className="group flex items-center justify-between p-2.5 bg-slate-900/90 hover:bg-slate-900 rounded-2xl transition-all border border-slate-800/90 hover:border-blue-500/40 shadow-sm"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-md border ${
              isSupervisor 
                ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400/30' 
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-400/30'
            }`}>
              {getInitials(user?.username)}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <p className="text-xs font-black text-white truncate group-hover:text-blue-400 transition-colors">
                  {user?.username || 'User'}
                </p>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className={`inline-block text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded mt-0.5 ${
                isSupervisor
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
              }`}>
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>

          <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0 mr-1" />
        </NavLink>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center justify-center px-3 py-2 text-xs font-bold rounded-xl transition-all border ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' 
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900 hover:text-white border-slate-800/80'
              }`
            }
          >
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={onRequestSignOut}
            className="flex items-center justify-center px-3 py-2 text-xs font-bold text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 hover:text-rose-200 border border-rose-900/40 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
