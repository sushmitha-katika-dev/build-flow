import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Package, 
  Tractor, 
  DollarSign, 
  BarChart3,
  Settings
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban className="w-5 h-5" /> },
    { name: 'Workforce', path: '/workforce', icon: <Users className="w-5 h-5" /> },
    { name: 'Inventory', path: '/inventory', icon: <Package className="w-5 h-5" /> },
    { name: 'Equipment', path: '/equipment', icon: <Tractor className="w-5 h-5" /> },
    { name: 'Finance', path: '/finance', icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-20 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-center h-16 bg-gray-800 font-bold text-xl tracking-wider">
        BuildFlow
      </div>
      
      <div className="overflow-y-auto overflow-x-hidden flex-grow h-[calc(100vh-4rem)]">
        <ul className="flex flex-col py-4 space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                    isActive ? 'bg-gray-800 text-white border-l-4 border-blue-500' : 'border-l-4 border-transparent'
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
      
      <div className="absolute bottom-0 w-full bg-gray-800 p-4">
        <NavLink
          to="/settings"
          className="flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="ml-3">Settings</span>
        </NavLink>
      </div>
    </div>
  );
};
