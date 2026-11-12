import React from 'react';
import { LogOut } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign out of BuildFlow"
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Stay Signed In
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/70 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
          <LogOut className="w-4 h-4" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Your current session will end and you will need to authenticate again to access site operations.
        </p>
      </div>
    </Modal>
  );
};
