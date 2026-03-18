export default function Loading() {
  return (
    <div className="min-h-[60vh] px-6 py-20">
      <div className="container-mosaiko">
        {/* Hero skeleton */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1 space-y-5">
            <div className="h-5 w-28 animate-pulse rounded-full bg-light-gray" />
            <div className="space-y-3">
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-light-gray" />
              <div className="h-10 w-1/2 animate-pulse rounded-lg bg-light-gray" />
            </div>
            <div className="h-5 w-full max-w-sm animate-pulse rounded-lg bg-light-gray" />
            <div className="h-5 w-2/3 max-w-xs animate-pulse rounded-lg bg-light-gray" />
            <div className="flex gap-3 pt-2">
              <div className="h-[52px] w-40 animate-pulse rounded-xl bg-light-gray" />
              <div className="h-[52px] w-36 animate-pulse rounded-xl bg-light-gray/60" />
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="h-[300px] w-[300px] animate-pulse rounded-2xl bg-light-gray sm:h-[350px] sm:w-[350px] lg:h-[440px] lg:w-[440px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
