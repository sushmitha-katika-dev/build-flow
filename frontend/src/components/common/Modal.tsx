import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
  children: ReactNode;
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer,
  children,
}: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full ${sizeClasses[size]} bg-white dark:bg-slate-900 rounded-xl border border-[#E4E4DF] dark:border-slate-800 shadow-modal animate-panel-in overflow-hidden my-auto`}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#E4E4DF] dark:border-slate-800">
          <div className="min-w-0">
            <h3
              id={titleId}
              className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#F1F0EC] dark:hover:bg-slate-800 rounded-lg p-1.5 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin space-y-4">
          {children}
        </div>

        {footer && (
          <div className="px-5 py-3.5 bg-[#F7F7F5] dark:bg-slate-950/60 border-t border-[#E4E4DF] dark:border-slate-800 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
