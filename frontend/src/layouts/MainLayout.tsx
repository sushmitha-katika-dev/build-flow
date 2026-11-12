import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { SignOutModal } from '../components/common/SignOutModal';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_COLLAPSED_KEY = 'bf-sidebar-collapsed';

export const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleToggleDesktopSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  };

  const handleRequestSignOut = () => setIsSignOutModalOpen(true);

  const handleConfirmSignOut = () => {
    setIsSignOutModalOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-canvas text-ink overflow-hidden">
      <Sidebar
        isOpen={mobileSidebarOpen}
        isCollapsed={sidebarCollapsed}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onRequestSignOut={handleRequestSignOut}
      />

      {/* Mobile backdrop overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/55 backdrop-blur-[1px] z-30 lg:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          isSidebarCollapsed={sidebarCollapsed}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          onToggleDesktopSidebar={handleToggleDesktopSidebar}
          onRequestSignOut={handleRequestSignOut}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-canvas p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <div key={location.pathname} className="max-w-[1440px] mx-auto w-full animate-page-enter">
            <Outlet context={{ onRequestSignOut: handleRequestSignOut }} />
          </div>
        </main>
      </div>

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  );
};
