import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';

interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const FilterToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  className = '',
}: FilterToolbarProps) => {
  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface dark:bg-slate-900 p-3 rounded-xl border border-hairline dark:border-slate-800 shadow-card ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full h-9 pl-9 pr-8 text-sm rounded-lg border border-[#D8D8D2] dark:border-slate-700 bg-[#F7F7F5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-600/15 transition-[border-color,background-color,box-shadow] duration-150"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};

