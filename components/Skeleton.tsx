interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-card ${className}`}
      aria-hidden="true"
    />
  );
}

export function MealPlanSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <Skeleton className="h-6 w-32" />

      {/* Grid rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      ))}
    </div>
  );
}

export function ShoppingListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Trip header */}
      <Skeleton className="h-6 w-40" />

      {/* Category sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
