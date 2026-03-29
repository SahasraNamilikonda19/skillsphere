export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded-lg w-3/4" />
          <div className="h-3 skeleton rounded-lg w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 skeleton rounded-lg" />
        <div className="h-3 skeleton rounded-lg w-5/6" />
        <div className="h-3 skeleton rounded-lg w-4/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-9 skeleton rounded-xl flex-1" />
        <div className="h-9 skeleton rounded-xl flex-1" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton rounded-lg w-1/3" />
              <div className="h-3 skeleton rounded-lg w-1/2" />
            </div>
            <div className="h-8 w-20 skeleton rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-8 skeleton rounded-lg w-16 mx-auto mb-2" />
      <div className="h-3 skeleton rounded-lg w-20 mx-auto" />
    </div>
  );
}

export default function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}