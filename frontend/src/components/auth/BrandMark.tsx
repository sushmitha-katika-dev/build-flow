import React from 'react';

interface BrandMarkProps {
  className?: string;
}

/**
 * Minimal architectural brand mark for BuildFlow auth screens.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center shadow-xs border border-slate-800 dark:border-slate-700"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 20V8L12 4L20 8V20"
            stroke="#F8FAFC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 20V13H15V20"
            stroke="#D97706"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 20H22"
            stroke="#94A3B8"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          BuildFlow
        </span>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
          Operations Portal
        </span>
      </div>
    </div>
  );
};

