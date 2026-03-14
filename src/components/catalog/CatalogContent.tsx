'use client';

import { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

/* ── Categories ── */
const CATEGORIES = [
  'mosaicos',
  'ghibli',
  'arte',
  'saveTheDate',
  'flores',
  'spotify',
  'polaroid',
] as const;

type Category = (typeof CATEGORIES)[number];

/* ── Product type ── */
interface Product {
  id: string;
  category: Category;
  name: string;
  price: number;
  image: string;
  pieces: number;
  grid: string;
}

/* ── Category badge colors ── */
const CATEGORY_ACCENT: Record<Category, string> = {
  mosaicos: 'bg-terracotta',
  ghibli: 'bg-teal',
  arte: 'bg-gold',
  saveTheDate: 'bg-terracotta-light',
  flores: 'bg-terracotta',
  spotify: 'bg-teal-light',
  polaroid: 'bg-warm-gray',
};

/* ── Static product data with real images ── */
const PRODUCTS: Product[] = [
  // Mosaicos
  { id: 'mos-1', category: 'mosaicos', name: 'Mosaico Familiar 3x3', price: 480, image: '/products/mosaicos/familiar-9.png', pieces: 9, grid: '3x3' },
  { id: 'mos-2', category: 'mosaicos', name: 'Mosaico Pareja 2x3', price: 360, image: '/products/mosaicos/pareja-6.png', pieces: 6, grid: '2x3' },
  { id: 'mos-3', category: 'mosaicos', name: 'Mosaico Panoramico', price: 200, image: '/products/mosaicos/panoramico-3.png', pieces: 3, grid: '1x3' },
  { id: 'mos-4', category: 'mosaicos', name: 'Mosaico Mascota', price: 360, image: '/products/mosaicos/mascota-6.png', pieces: 6, grid: '2x3' },
  { id: 'mos-5', category: 'mosaicos', name: 'Mosaico Recuerdo', price: 480, image: '/products/mosaicos/familiar-9-2.png', pieces: 9, grid: '3x3' },
  { id: 'mos-6', category: 'mosaicos', name: 'Mosaico Tira', price: 200, image: '/products/mosaicos/panoramico-3-2.png', pieces: 3, grid: '1x3' },
  // Studio Ghibli
  { id: 'ghi-1', category: 'ghibli', name: 'El Viaje de Chihiro', price: 480, image: '/products/ghibli/chihiro.png', pieces: 9, grid: '3x3' },
  { id: 'ghi-2', category: 'ghibli', name: 'Mi Vecino Totoro', price: 480, image: '/products/ghibli/totoro.png', pieces: 9, grid: '3x3' },
  { id: 'ghi-3', category: 'ghibli', name: 'Princesa Mononoke', price: 480, image: '/products/ghibli/mononoke.png', pieces: 9, grid: '3x3' },
  { id: 'ghi-4', category: 'ghibli', name: 'El Castillo Vagabundo', price: 480, image: '/products/ghibli/howl.png', pieces: 9, grid: '3x3' },
  { id: 'ghi-5', category: 'ghibli', name: 'El Viaje de Chihiro II', price: 480, image: '/products/ghibli/chihiro-2.png', pieces: 9, grid: '3x3' },
  { id: 'ghi-6', category: 'ghibli', name: 'Kiki Entregas a Domicilio', price: 480, image: '/products/ghibli/kiki.png', pieces: 9, grid: '3x3' },
  { id: 'ghi-7', category: 'ghibli', name: 'Ponyo', price: 480, image: '/products/ghibli/ponyo.png', pieces: 9, grid: '3x3' },
  { id: 'ghi-8', category: 'ghibli', name: 'El Nino y la Garza', price: 480, image: '/products/ghibli/garza.png', pieces: 9, grid: '3x3' },
  // Arte
  { id: 'art-1', category: 'arte', name: 'La Noche Estrellada', price: 480, image: '/products/arte/noche-estrellada.png', pieces: 9, grid: '3x3' },
  { id: 'art-2', category: 'arte', name: 'La Mona Lisa', price: 480, image: '/products/arte/mona-lisa.png', pieces: 9, grid: '3x3' },
  { id: 'art-3', category: 'arte', name: 'El Beso — Klimt', price: 480, image: '/products/arte/el-beso.png', pieces: 9, grid: '3x3' },
  { id: 'art-4', category: 'arte', name: 'La Gran Ola', price: 480, image: '/products/arte/gran-ola.png', pieces: 9, grid: '3x3' },
  { id: 'art-5', category: 'arte', name: 'La Joven de la Perla', price: 480, image: '/products/arte/joven-perla.png', pieces: 9, grid: '3x3' },
  { id: 'art-6', category: 'arte', name: 'Las Dos Fridas', price: 480, image: '/products/arte/dos-fridas.png', pieces: 9, grid: '3x3' },
  { id: 'art-7', category: 'arte', name: 'Nenufares — Monet', price: 480, image: '/products/arte/nenufares.png', pieces: 9, grid: '3x3' },
  { id: 'art-8', category: 'arte', name: 'El Nacimiento de Venus', price: 480, image: '/products/arte/venus.png', pieces: 9, grid: '3x3' },
  // Save the Date
  { id: 'std-1', category: 'saveTheDate', name: 'Boda Elegante', price: 480, image: '/products/save-the-date/boda-9.png', pieces: 9, grid: '3x3' },
  { id: 'std-2', category: 'saveTheDate', name: 'Compromiso', price: 360, image: '/products/save-the-date/compromiso-6.png', pieces: 6, grid: '2x3' },
  { id: 'std-3', category: 'saveTheDate', name: 'Baby Shower', price: 200, image: '/products/save-the-date/baby-3.png', pieces: 3, grid: '1x3' },
  // Flores
  { id: 'flo-1', category: 'flores', name: 'Ramo de Rosas', price: 480, image: '/products/flores/rosas-9.png', pieces: 9, grid: '3x3' },
  { id: 'flo-2', category: 'flores', name: 'Girasoles', price: 200, image: '/products/flores/girasoles-3.png', pieces: 3, grid: '1x3' },
  // Spotify
  { id: 'spo-1', category: 'spotify', name: 'Album Cover Custom', price: 480, image: '/products/spotify/album-1.png', pieces: 9, grid: '3x3' },
  { id: 'spo-2', category: 'spotify', name: 'Personalizado', price: 480, image: '/products/spotify/personalizado.png', pieces: 9, grid: '3x3' },
  // Polaroid
  { id: 'pol-1', category: 'polaroid', name: 'Tu Foto Polaroid', price: 480, image: '/products/polaroid/clasico.png', pieces: 9, grid: '3x3' },
  { id: 'pol-2', category: 'polaroid', name: 'Polaroid Vintage', price: 480, image: '/products/polaroid/vintage.png', pieces: 9, grid: '3x3' },
];

/* ── Price formatter ── */
const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price);

/* ── Animation variants ── */
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const headerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.25, ease },
  },
};

/* ── Component ── */
export function CatalogContent() {
  const t = useTranslations('catalogPage');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const gridInView = useInView(gridRef, { once: true, amount: 0.05 });

  const filteredProducts = useMemo(
    () =>
      activeCategory
        ? PRODUCTS.filter((p) => p.category === activeCategory)
        : PRODUCTS,
    [activeCategory]
  );

  return (
    <div className="bg-cream">
      {/* ── Header section ── */}
      <section className="bg-warm-white pb-6 pt-16 sm:pb-8 sm:pt-20 lg:pt-24">
        <div className="container-mosaiko">
          <motion.div
            ref={headerRef}
            variants={headerVariants}
            initial="hidden"
            animate={headerInView ? 'visible' : 'hidden'}
            className="text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="font-serif text-4xl font-bold text-charcoal sm:text-5xl lg:text-6xl"
            >
              {t('title')}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-lg text-base text-warm-gray sm:text-lg"
            >
              {t('subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Category filter bar (sticky) ── */}
      <div className="sticky top-0 z-30 border-b border-light-gray/60 bg-warm-white/80 backdrop-blur-xl">
        <div className="container-mosaiko">
          <nav
            className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-2.5 sm:overflow-visible sm:px-0 sm:py-4"
            aria-label="Category filters"
          >
            {/* "All" pill */}
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                activeCategory === null
                  ? 'bg-terracotta text-cream shadow-md shadow-terracotta/20'
                  : 'bg-light-gray/60 text-charcoal hover:bg-light-gray hover:text-charcoal'
              }`}
            >
              {t('allCategories')}
            </button>

            {/* Category pills */}
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-terracotta text-cream shadow-md shadow-terracotta/20'
                    : 'bg-light-gray/60 text-charcoal hover:bg-light-gray hover:text-charcoal'
                }`}
              >
                {t(cat)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Product grid ── */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-mosaiko" ref={gridRef}>
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              <motion.div
                key={activeCategory ?? 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    variants={cardVariants}
                    initial="hidden"
                    animate={gridInView ? 'visible' : 'hidden'}
                    exit="exit"
                    transition={{ delay: index * 0.04 }}
                  >
                    <ProductCard product={product} categoryLabel={t(product.category)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState
                message={t('noResults')}
                hint={t('noResultsHint')}
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <CustomCtaSection />
    </div>
  );
}

/* ── Product Card ── */
function ProductCard({
  product,
  categoryLabel,
}: {
  product: Product;
  categoryLabel: string;
}) {
  const accent = CATEGORY_ACCENT[product.category];

  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl bg-warm-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-charcoal/5">
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-cream-dark">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Grid badge top-left */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="sm:h-3 sm:w-3"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {product.grid}
          </span>
        </div>

        {/* Category label bottom-left */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
          <span
            className={`inline-block rounded-full ${accent} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:px-3 sm:py-1 sm:text-[11px]`}
          >
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="truncate font-serif text-sm font-semibold text-charcoal transition-colors duration-200 group-hover:text-terracotta sm:text-base">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <span className="text-base font-bold text-charcoal sm:text-lg">
            {formatPrice(product.price)}
          </span>
          <span className="text-[11px] text-warm-gray sm:text-xs">
            {product.pieces} piezas
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center py-20 text-center sm:py-28"
    >
      {/* Friendly illustration */}
      <div className="mb-6 rounded-2xl bg-light-gray/40 p-6">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          className="text-warm-gray/60"
          aria-hidden="true"
        >
          <path
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
        {message}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-warm-gray sm:text-base">
        {hint}
      </p>
    </motion.div>
  );
}

/* ── Custom CTA section ── */
function CustomCtaSection() {
  const t = useTranslations('catalogPage');
  const ctaRef = useRef<HTMLElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={ctaRef}
      className="relative overflow-hidden bg-terracotta py-16 sm:py-20 lg:py-24"
    >
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,1) 20px, rgba(255,255,255,1) 21px)',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '700px',
          height: '350px',
          background:
            'radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 60%)',
        }}
      />

      {/* Floating tiles */}
      <div
        className="absolute -left-4 top-6 h-14 w-14 rounded-xl bg-white opacity-[0.07] sm:left-10"
        style={{ transform: 'rotate(-12deg)' }}
      />
      <div
        className="absolute -right-2 top-10 h-10 w-10 rounded-lg bg-white opacity-[0.05] sm:right-14"
        style={{ transform: 'rotate(8deg)' }}
      />
      <div
        className="absolute bottom-8 left-16 h-8 w-8 rounded-lg bg-white opacity-[0.04]"
        style={{ transform: 'rotate(18deg)' }}
      />
      <div
        className="absolute -right-3 bottom-6 h-12 w-12 rounded-xl bg-white opacity-[0.06] sm:right-20"
        style={{ transform: 'rotate(-6deg)' }}
      />

      {/* Content */}
      <div className="container-mosaiko relative z-10">
        <motion.div
          initial="hidden"
          animate={ctaInView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
          }}
          className="flex flex-col items-center text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            {t('customCta')}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-md text-base text-white/80 sm:text-lg"
          >
            {t('customCtaText')}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8">
            <Link
              href="/personalizar"
              className="group inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-terracotta shadow-xl shadow-black/10 transition-all duration-300 hover:bg-cream hover:shadow-2xl hover:shadow-black/15 active:scale-[0.98] sm:px-10 sm:text-lg"
            >
              {t('customCtaButton')}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
