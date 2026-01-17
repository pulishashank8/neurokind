export function PostCardSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] p-4 sm:p-6 border border-[var(--border-light)] animate-pulse">
      <div className="flex items-start gap-3 sm:gap-4 mb-3">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--bg-elevated)] rounded w-32" />
          <div className="h-3 bg-[var(--bg-elevated)] rounded w-24" />
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-6 bg-[var(--bg-elevated)] rounded w-3/4" />
        <div className="h-4 bg-[var(--bg-elevated)] rounded w-full" />
        <div className="h-4 bg-[var(--bg-elevated)] rounded w-5/6" />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-[var(--bg-elevated)] rounded-full w-20" />
        <div className="h-6 bg-[var(--bg-elevated)] rounded-full w-24" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-10 bg-[var(--bg-elevated)] rounded w-24" />
        <div className="h-10 bg-[var(--bg-elevated)] rounded w-20" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="animate-pulse py-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[var(--bg-elevated)] rounded w-24" />
          <div className="h-4 bg-[var(--bg-elevated)] rounded w-full" />
          <div className="h-4 bg-[var(--bg-elevated)] rounded w-4/5" />
          <div className="h-8 bg-[var(--bg-elevated)] rounded w-32 mt-3" />
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`${sizeClasses[size]} border-4 border-[var(--border-light)] border-t-[var(--primary)] rounded-full animate-spin`}
      />
    </div>
  );
}
