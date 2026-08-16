import React from 'react';
import { Button } from './Button';
import { LogOut } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative inline-block w-full max-w-sm p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-gray-100">
          <div className="flex items-center space-x-3 text-red-600 mb-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sign out of BuildFlow?</h3>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            You'll need to sign in again to access your workspace.
          </p>

          <div className="flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
