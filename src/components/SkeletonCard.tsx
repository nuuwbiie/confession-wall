export default function SkeletonCard() {
  return (
    <div className="masonry-item bg-surface-container-lowest rounded-2xl p-8 soft-shadow border border-outline-variant/10 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 bg-surface-container rounded-full" />
          <div className="h-4 w-20 bg-surface-container rounded" />
        </div>
        <div className="h-5 w-5 bg-surface-container rounded-full" />
      </div>
      <div className="space-y-3 mb-8">
        <div className="h-4 bg-surface-container rounded w-full" />
        <div className="h-4 bg-surface-container rounded w-5/6" />
        <div className="h-4 bg-surface-container rounded w-4/6" />
      </div>
      <div className="flex items-center gap-6">
        <div className="h-5 w-16 bg-surface-container rounded" />
        <div className="h-5 w-16 bg-surface-container rounded" />
        <div className="h-5 w-16 bg-surface-container rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="masonry-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}