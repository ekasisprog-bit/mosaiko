'use client';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Decorative broken tile icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-terracotta/10">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="14" height="14" rx="2" fill="var(--terracotta)" opacity="0.8" />
            <rect x="22" y="4" width="14" height="14" rx="2" fill="var(--terracotta)" opacity="0.4" />
            <rect x="4" y="22" width="14" height="14" rx="2" fill="var(--terracotta)" opacity="0.4" />
            <rect x="22" y="22" width="14" height="14" rx="2" fill="var(--terracotta)" opacity="0.2" />
            {/* Crack line */}
            <line x1="20" y1="2" x2="20" y2="38" stroke="var(--cream)" strokeWidth="3" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
          Algo salió mal
        </h1>
        <p className="mt-4 text-warm-gray leading-relaxed">
          Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            onClick={reset}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-terracotta px-6 py-3 text-base font-semibold text-white shadow-lg shadow-terracotta/25 transition-all duration-300 hover:bg-terracotta-dark hover:shadow-xl active:scale-[0.98]"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-charcoal/15 px-6 py-3 text-base font-semibold text-charcoal transition-all duration-300 hover:border-terracotta/30 hover:bg-terracotta/5 hover:text-terracotta active:scale-[0.98]"
          >
            Ir al inicio
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-warm-gray/60">
            Código: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
