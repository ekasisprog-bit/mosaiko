import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Decorative mosaic 404 */}
        <div className="mx-auto mb-6 flex items-center justify-center gap-1.5">
          <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-terracotta/10">
            <span className="font-serif text-2xl font-bold text-terracotta">4</span>
          </div>
          <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-terracotta/20">
            <span className="font-serif text-2xl font-bold text-terracotta">0</span>
          </div>
          <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-terracotta/10">
            <span className="font-serif text-2xl font-bold text-terracotta">4</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="mt-4 text-warm-gray leading-relaxed">
          La página que buscas no existe o fue movida. Revisa la dirección o vuelve al inicio.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-btn-primary px-6 py-3 text-base font-semibold text-btn-text shadow-lg shadow-btn-primary/25 transition-all duration-300 hover:bg-btn-primary-hover hover:shadow-xl active:scale-[0.98]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
