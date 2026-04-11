interface SkeletonCardProps {
  compact?: boolean;
}

export function SkeletonCard({ compact = false }: SkeletonCardProps) {
  return (
    <div className="bg-white rounded overflow-hidden shadow-sm animate-pulse">
      <div
        className={`w-full bg-neutral-200 ${compact ? 'aspect-square' : 'aspect-[4/3]'}`}
      />
      <div className={compact ? 'p-2' : 'p-5'}>
        {!compact && <div className="h-2.5 bg-neutral-200 rounded w-16 mb-2" />}
        <div className="h-3 bg-neutral-200 rounded w-3/4 mb-2" />
        <div className="h-3.5 bg-neutral-200 rounded w-12" />
      </div>
    </div>
  );
}
