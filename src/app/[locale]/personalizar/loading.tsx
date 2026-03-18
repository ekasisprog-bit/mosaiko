export default function BuilderLoading() {
  return (
    <div className="min-h-[80vh] px-6 py-24">
      <div className="container-mosaiko">
        {/* Step indicator skeleton */}
        <div className="mx-auto mb-12 flex max-w-md items-center justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-9 w-9 animate-pulse rounded-full bg-light-gray" />
              {i < 3 && <div className="h-0.5 w-12 animate-pulse bg-light-gray" />}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Left: upload / grid area */}
          <div className="flex-1">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-light-gray" />
          </div>

          {/* Right: controls */}
          <div className="w-full space-y-6 lg:w-80">
            <div className="h-6 w-32 animate-pulse rounded-lg bg-light-gray" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-light-gray" />
              ))}
            </div>
            <div className="h-[52px] w-full animate-pulse rounded-xl bg-light-gray" />
          </div>
        </div>
      </div>
    </div>
  );
}
