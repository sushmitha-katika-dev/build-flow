import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Package,
  Tractor,
  IndianRupee,
  Building2,
  Settings,
  LogOut,
  HardHat,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from '../auth/BrandMark';
import { formatRoleLabel, getInitials } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onCloseMobile: () => void;
  onRequestSignOut: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: ReactNode;
  end?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar = ({
  isOpen,
  isCollapsed,
  onCloseMobile,
  onRequestSignOut,
}: SidebarProps) => {
  const { user } = useAuth();
  const isSupervisor = user?.role === 'SITE_SUPERVISOR' || user?.role === 'SUPERVISOR';

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        {
          name: isSupervisor ? 'Site Dashboard' : 'Dashboard',
          path: '/',
          end: true,
          icon: isSupervisor ? (
            <HardHat className="w-4 h-4 shrink-0" />
          ) : (
            <LayoutDashboard className="w-4 h-4 shrink-0" />
          ),
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        { name: 'Projects & Sites', path: '/projects', icon: <FolderKanban className="w-4 h-4 shrink-0" /> },
        { name: 'Workforce & Shifts', path: '/workforce', icon: <Users className="w-4 h-4 shrink-0" /> },
        { name: 'Inventory & Materials', path: '/inventory', icon: <Package className="w-4 h-4 shrink-0" /> },
        { name: 'Equipment & Fleet', path: '/equipment', icon: <Tractor className="w-4 h-4 shrink-0" /> },
      ],
    },
    ...(!isSupervisor
      ? [
          {
            title: 'Finance & Org',
            items: [
              { name: 'Finance & P&L', path: '/finance', icon: <IndianRupee className="w-4 h-4 shrink-0" /> },
              { name: 'Company Profile', path: '/company', icon: <Building2 className="w-4 h-4 shrink-0" /> },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside
      aria-label="Primary navigation"
      className={`fixed inset-y-0 left-0 z-40 flex flex-col justify-between bg-[#0F172A] text-slate-100 border-r border-slate-800/90 transition-[width,transform] duration-200 ease-out lg:static lg:translate-x-0 shrink-0 ${
        isOpen ? 'translate-x-0 w-[248px]' : '-translate-x-full w-[248px]'
      } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[248px]'}`}
    >
      {/* Top Brand Header */}
      <div className="flex flex-col min-h-0 flex-1">
        <div
          className={`h-14 flex items-center border-b border-slate-800/80 shrink-0 transition-[padding] duration-200 ${
            isCollapsed ? 'lg:justify-center lg:px-2 px-4 justify-between' : 'px-4 justify-between'
          }`}
        >
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-lg"
            title="BuildFlow Home"
          >
            <BrandMark
              inverted
              compact={isCollapsed}
              subtitle={isSupervisor ? 'Field Operations' : 'Operations Suite'}
            />
          </NavLink>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 space-y-5 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed ? (
                <div className="px-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em] mb-1.5">
                  {section.title}
                </div>
              ) : (
                <div className="hidden lg:block mx-2.5 my-2 border-t border-slate-800/80" aria-hidden="true" />
              )}

              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `group relative flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 ${
                          isCollapsed ? 'lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2 gap-3' : 'px-3 py-2 gap-3'
                        } ${
                          isActive
                            ? 'bg-white/[0.09] text-white'
                            : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Crisp amber left rail indicator on active link */}
                          <span
                            aria-hidden="true"
                            className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-amber-500 transition-opacity duration-150 ${
                              isActive ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          <span
                            className={`transition-colors duration-150 ${
                              isActive
                                ? 'text-amber-400'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span
                            className={`truncate transition-opacity duration-150 ${
                              isCollapsed ? 'lg:hidden' : 'block'
                            }`}
                          >
                            {item.name}
                          </span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile & Session Controls */}
      <div className="border-t border-slate-800/80 p-2.5 space-y-1.5 shrink-0 bg-[#0B1220]">
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          title={isCollapsed ? `${user?.username || 'User'} — Profile` : undefined}
          className={({ isActive }) =>
            `group flex items-center rounded-lg p-2 transition-colors duration-150 border ${
              isCollapsed ? 'lg:justify-center' : 'gap-2.5'
            } ${
              isActive
                ? 'bg-white/[0.09] border-slate-700 text-white'
                : 'border-transparent hover:bg-white/[0.05] hover:border-slate-800 text-slate-200'
            }`
          }
        >
          <div
            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 border ${
              isSupervisor
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-slate-800 text-slate-100 border-slate-700'
            }`}
          >
            {getInitials(user?.username)}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-100 truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {formatRoleLabel(user?.role)}
              </p>
            </div>
          )}
        </NavLink>

        <div className={`grid gap-1.5 ${isCollapsed ? 'lg:grid-cols-1 grid-cols-2' : 'grid-cols-2'}`}>
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            title="Settings"
            className={({ isActive }) =>
              `flex items-center justify-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium border transition-colors duration-150 ${
                isActive
                  ? 'bg-white/[0.09] text-white border-slate-700'
                  : 'text-slate-300 border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>

          <button
            type="button"
            onClick={onRequestSignOut}
            title="Sign Out"
            className="flex items-center justify-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium text-rose-300 border border-rose-950/60 bg-rose-950/25 hover:bg-rose-950/55 hover:text-rose-200 transition-colors duration-150"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
