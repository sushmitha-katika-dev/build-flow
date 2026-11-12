import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
  children: ReactNode;
}

const widthClasses: Record<NonNullable<SlideOverDrawerProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
};

export const SlideOverDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer,
  children,
}: SlideOverDrawerProps) => {
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
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`relative z-10 w-full ${widthClasses[size]} h-full bg-white dark:bg-slate-900 border-l border-[#E4E4DF] dark:border-slate-800 shadow-modal flex flex-col animate-drawer-right`}
      >
        <div className="px-5 py-4 border-b border-[#E4E4DF] dark:border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#F1F0EC] dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">{children}</div>

        {footer && (
          <div className="px-5 py-3.5 border-t border-[#E4E4DF] dark:border-slate-800 bg-[#F7F7F5] dark:bg-slate-950/60 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
};

