'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { MosaikoLogo } from '@/components/ui/MosaikoLogo';

/* ── Stagger animation orchestrator ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

/* ── Products that cycle through the hero mosaic ── */
type TileRegion = { x: number; y: number; w: number; h: number };

interface HeroProduct {
  src: string;
  cols: number;
  rows: number;
  label: string;
  // Mosaic region within the product photo (0-1 fractions)
  region: TileRegion;
  // Per-tile regions for products with unequal magnet sizes (overrides equal division)
  tileRegions?: TileRegion[];
}

const heroProducts: HeroProduct[] = [
  {
    src: '/products/mosaico-9-proposal.png',
    cols: 3,
    rows: 3,
    label: '9 piezas',
    region: { x: 0.1997, y: 0.0949, w: 0.5697, h: 0.7369 },
    // Pixel-measured per-magnet regions (gaps: 16px h, 16px v)
    tileRegions: [
      { x: 0.1997, y: 0.0949, w: 0.1864, h: 0.2420 }, // row0 col0
      { x: 0.3909, y: 0.0949, w: 0.1873, h: 0.2420 }, // row0 col1
      { x: 0.5830, y: 0.0949, w: 0.1864, h: 0.2420 }, // row0 col2
      { x: 0.1997, y: 0.3424, w: 0.1864, h: 0.2420 }, // row1 col0
      { x: 0.3909, y: 0.3424, w: 0.1873, h: 0.2420 }, // row1 col1
      { x: 0.5830, y: 0.3424, w: 0.1864, h: 0.2420 }, // row1 col2
      { x: 0.1997, y: 0.5898, w: 0.1864, h: 0.2420 }, // row2 col0
      { x: 0.3909, y: 0.5898, w: 0.1873, h: 0.2420 }, // row2 col1
      { x: 0.5830, y: 0.5898, w: 0.1864, h: 0.2420 }, // row2 col2
    ],
  },
  {
    src: '/products/mosaico-3-panoramic.png',
    cols: 3,
    rows: 1,
    label: '3 piezas',
    region: { x: 0.1997, y: 0.5800, w: 0.5697, h: 0.2420 },
    // Pixel-measured per-magnet regions (magnets: 615, 615, 615px wide)
    tileRegions: [
      { x: 0.1997, y: 0.5800, w: 0.1864, h: 0.2420 }, // magnet 1
      { x: 0.3909, y: 0.5800, w: 0.1864, h: 0.2420 }, // magnet 2
      { x: 0.5830, y: 0.5800, w: 0.1864, h: 0.2420 }, // magnet 3
    ],
  },
  {
    src: '/products/polaroid-sunset.png',
    cols: 2,
    rows: 2,
    label: '4 piezas',
    region: { x: 0.2549, y: 0.2770, w: 0.4890, h: 0.3779 },
    // Pixel-measured per-magnet regions (gaps: 16px h, 13px v)
    tileRegions: [
      { x: 0.2549, y: 0.2770, w: 0.2412, h: 0.1873 }, // row0 col0
      { x: 0.5024, y: 0.2770, w: 0.2416, h: 0.1873 }, // row0 col1
      { x: 0.2549, y: 0.4682, w: 0.2412, h: 0.1867 }, // row1 col0
      { x: 0.5024, y: 0.4682, w: 0.2416, h: 0.1867 }, // row1 col1
    ],
  },
  {
    src: '/products/mosaico-6-family.png',
    cols: 2,
    rows: 3,
    label: '6 piezas',
    region: { x: 0.1997, y: 0.0953, w: 0.3788, h: 0.7361 },
    // Pixel-measured per-magnet regions (gaps: 15-17px)
    tileRegions: [
      { x: 0.1997, y: 0.0953, w: 0.1864, h: 0.2412 }, // row0 col0
      { x: 0.3912, y: 0.0953, w: 0.1873, h: 0.2412 }, // row0 col1
      { x: 0.1997, y: 0.3424, w: 0.1864, h: 0.2416 }, // row1 col0
      { x: 0.3912, y: 0.3424, w: 0.1873, h: 0.2416 }, // row1 col1
      { x: 0.1997, y: 0.5898, w: 0.1864, h: 0.2416 }, // row2 col0
      { x: 0.3912, y: 0.5898, w: 0.1873, h: 0.2416 }, // row2 col1
    ],
  },
];

/* ── Tile position calculators ── */

/** Default: equal division of a single region across the grid */
function getTileStyle(
  col: number,
  row: number,
  cols: number,
  rows: number,
  region: TileRegion
) {
  const imgWidth = (cols / region.w) * 100;
  const imgHeight = (rows / region.h) * 100;
  const imgLeft = -(region.x * cols / region.w + col) * 100;
  const imgTop = -(region.y * rows / region.h + row) * 100;

  return {
    width: `${imgWidth}%`,
    height: `${imgHeight}%`,
    left: `${imgLeft}%`,
    top: `${imgTop}%`,
  };
}

/** Per-tile: each tile maps to its own measured region in the image */
function getDirectTileStyle(region: TileRegion) {
  return {
    width: `${100 / region.w}%`,
    height: `${100 / region.h}%`,
    left: `${-(region.x / region.w) * 100}%`,
    top: `${-(region.y / region.h) * 100}%`,
  };
}

/* ── Mosaic Grid Component ── */
function MosaicGrid({
  product,
  isInView,
}: {
  product: HeroProduct;
  isInView: boolean;
}) {
  const { cols, rows, src, region } = product;
  const totalTiles = cols * rows;

  const tiles = Array.from({ length: totalTiles }, (_, i) => ({
    row: Math.floor(i / cols),
    col: i % cols,
    index: i,
  }));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 flex items-center justify-center p-8 sm:p-10 lg:p-12"
    >
      <div
        className="grid gap-1 sm:gap-1.5 lg:gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          aspectRatio: `${cols} / ${rows}`,
          ...(cols >= rows
            ? { width: '100%' }
            : { height: '100%' }),
        }}
      >
        {tiles.map((tile) => (
          <motion.div
            key={`${tile.col}-${tile.row}`}
            initial={{ opacity: 0, scale: 0.6, rotateZ: -6 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateZ: 0,
              transition: {
                type: 'spring' as const,
                stiffness: 260,
                damping: 20,
                delay: 0.3 + tile.index * 0.09,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.6,
              rotateZ: 6,
              transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 25,
                delay: (totalTiles - 1 - tile.index) * 0.06,
              },
            }}
            className="relative overflow-hidden rounded-lg"
            style={{
              boxShadow:
                '0 3px 10px -3px rgba(0,0,0,0.25), 0 1px 3px -1px rgba(0,0,0,0.15), inset 0 0 0 1.5px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Full image scaled and positioned to show this tile's portion */}
            <div
              className="absolute"
              style={product.tileRegions
                ? getDirectTileStyle(product.tileRegions[tile.index])
                : getTileStyle(tile.col, tile.row, cols, rows, region)}
            >
              <Image
                src={src}
                alt={`Mosaiko magnet tile ${tile.index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 300px, (max-width: 1024px) 350px, 440px"
                priority
              />
            </div>
            {/* Tile shine overlay */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Hero ── */
export function Hero() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProduct = heroProducts[currentIndex];

  // Cycle through products: enter → hold → exit → next
  useEffect(() => {
    if (!isInView) return;

    const tileCount = currentProduct.cols * currentProduct.rows;
    // Time for all tiles to spring in + settle
    const enterTime = 300 + tileCount * 90 + 600;
    // Hold visible
    const holdTime = 2500;
    // Total before triggering next (exit animation plays via AnimatePresence)
    const totalTime = enterTime + holdTime;

    const timer = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % heroProducts.length);
    }, totalTime);

    return () => clearTimeout(timer);
  }, [currentIndex, isInView, currentProduct]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-svh overflow-hidden bg-cream lg:min-h-[80vh]"
    >
      {/* ── Background texture layers ── */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 40%, #F5E6D3 70%, var(--cream) 100%)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/3"
          style={{
            width: '800px',
            height: '800px',
            background:
              'radial-gradient(circle, rgba(232,168,56,0.08) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="container-mosaiko relative z-10 flex min-h-svh flex-col justify-center lg:min-h-[80vh] lg:flex-row lg:items-center lg:gap-12 xl:gap-20">
        {/* Left: Text content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-col items-start pt-28 pb-8 sm:pt-32 lg:w-1/2 lg:py-20"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3.5 py-1.5 text-sm font-medium text-gold-dark">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="text-gold"
              >
                <path
                  d="M8 1l1.796 3.64L14 5.42l-3 2.924.708 4.13L8 10.67l-3.708 1.804L5 8.344 2 5.42l4.204-.78L8 1z"
                  fill="currentColor"
                />
              </svg>
              {t('badge')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-serif text-[2.75rem] font-bold leading-[1.08] tracking-tight text-charcoal sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {t('title')}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-md text-lg leading-relaxed text-warm-gray sm:text-xl lg:max-w-lg"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
          >
            <Link
              href="/personalizar"
              className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-terracotta px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-terracotta/25 transition-all duration-300 hover:bg-terracotta-dark hover:shadow-xl hover:shadow-terracotta/30 active:scale-[0.98]"
            >
              {t('cta')}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path
                  d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border-2 border-charcoal/15 px-7 py-3.5 text-base font-semibold text-charcoal transition-all duration-300 hover:border-terracotta/30 hover:bg-terracotta/5 hover:text-terracotta active:scale-[0.98]"
            >
              {t('ctaSecondary')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Cycling mosaic on fridge surface */}
        <div className="relative flex flex-1 items-center justify-center pb-16 lg:pb-0">
          <div className="relative">
            {/* Fridge surface */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={
                isInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.92 }
              }
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
              className="relative mx-auto h-[300px] w-[300px] rounded-2xl sm:h-[350px] sm:w-[350px] lg:h-[440px] lg:w-[440px]"
              style={{
                background:
                  'linear-gradient(160deg, #E8E2DA 0%, #D9D0C5 50%, #E0D8CE 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.5), 0 20px 60px -12px rgba(0,0,0,0.15), 0 8px 24px -8px rgba(0,0,0,0.1)',
              }}
            >
              {/* Subtle fridge texture */}
              <div
                className="absolute inset-0 rounded-2xl opacity-30"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px)',
                }}
              />

              {/* Cycling mosaic tiles */}
              <AnimatePresence mode="wait">
                <MosaicGrid
                  key={currentIndex}
                  product={currentProduct}
                  isInView={isInView}
                />
              </AnimatePresence>

              {/* Mosaiko watermark — bottom-right of fridge surface */}
              <div
                className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-end opacity-60"
                style={{ gap: '1.5px' }}
                aria-hidden="true"
              >
                <Image
                  src="/logos/logo-dark.png"
                  alt=""
                  width={16}
                  height={16}
                  style={{ width: '16px', height: '16px' }}
                />
                <span
                  className="font-bold font-brand leading-none text-charcoal"
                  style={{ fontSize: '11px', marginBottom: '0.5px' }}
                >
                  osaiko
                </span>
              </div>

              {/* Piece count label */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`label-${currentIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.4 } }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/8 px-3 py-1 text-xs font-medium text-warm-gray">
                    <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                    {currentProduct.label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Floating decorative elements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -right-4 top-8 hidden h-10 w-10 rounded-lg bg-gold/20 backdrop-blur-sm lg:block"
              style={{ boxShadow: '0 4px 12px -2px rgba(232,168,56,0.2)' }}
            />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -left-6 bottom-12 hidden h-8 w-8 rounded-md bg-terracotta/15 backdrop-blur-sm lg:block"
              style={{ boxShadow: '0 4px 12px -2px rgba(196,101,58,0.15)' }}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom decorative wave ── */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block h-8 w-full sm:h-12 lg:h-14"
        >
          <path
            d="M0 28C240 56 480 56 720 28C960 0 1200 0 1440 28V56H0V28Z"
            fill="var(--warm-white)"
          />
        </svg>
      </div>
    </section>
  );
}
