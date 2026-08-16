import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { SignOutModal } from '../components/common/SignOutModal';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleRequestSignOut = () => setIsSignOutModalOpen(true);

  const handleConfirmSignOut = () => {
    setIsSignOutModalOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onRequestSignOut={handleRequestSignOut} />
      
      {/* Overlay for mobile to close sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header toggleSidebar={toggleSidebar} onRequestSignOut={handleRequestSignOut} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ onRequestSignOut: handleRequestSignOut }} />
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
