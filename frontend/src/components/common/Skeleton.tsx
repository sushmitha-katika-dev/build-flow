export const Skeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#EAE9E4] dark:bg-slate-800/80 rounded-lg ${className}`}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => {
  return (
    <div className="bg-surface dark:bg-slate-900 rounded-xl border border-hairline dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-hairline dark:border-slate-800 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="divide-y divide-hairline dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-4 py-3.5 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((__, colIdx) => (
              <Skeleton key={colIdx} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
