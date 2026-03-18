export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page title skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-light-gray" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-light-gray" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-light-gray/60 bg-warm-white p-5"
          >
            <div className="h-4 w-20 animate-pulse rounded bg-light-gray" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-light-gray" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-light-gray/60 bg-warm-white">
        {/* Tab bar */}
        <div className="flex gap-2 border-b border-light-gray/40 p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-light-gray" />
          ))}
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-light-gray/20 p-4 last:border-0"
          >
            <div className="h-10 w-10 animate-pulse rounded-lg bg-light-gray" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-light-gray" />
              <div className="h-3 w-48 animate-pulse rounded bg-light-gray/60" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-light-gray" />
          </div>
        ))}
      </div>
    </div>
  );
}
