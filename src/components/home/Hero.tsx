'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

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

/* ── Tile spring-in for the mosaic grid ── */
const tileVariants = {
  hidden: { opacity: 0, scale: 0.7, rotateZ: -4 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotateZ: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
      delay: 0.4 + i * 0.08,
    },
  }),
};

/* ── Real product images for the mosaic ── */
const heroTiles = [
  { src: '/products/mosaico-9-proposal.png', alt: 'Mosaico propuesta' },
  { src: '/products/ghibli-chihiro.png', alt: 'Studio Ghibli' },
  { src: '/products/arte-noche-estrellada.png', alt: 'Arte clásico' },
  { src: '/products/flores-9.png', alt: 'Flores' },
  { src: '/products/polaroid-sunset.png', alt: 'Polaroid' },
  { src: '/products/save-the-date-9.png', alt: 'Save the Date' },
  { src: '/products/arte-mona-lisa.png', alt: 'La Mona Lisa' },
  { src: '/products/ghibli-totoro.png', alt: 'Mi Vecino Totoro' },
  { src: '/products/arte-el-beso.png', alt: 'El Beso' },
];

export function Hero() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-svh overflow-hidden bg-cream lg:min-h-[80vh]"
    >
      {/* ── Background texture layers ── */}
      <div className="absolute inset-0">
        {/* Diagonal warm gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 40%, #F5E6D3 70%, var(--cream) 100%)',
          }}
        />
        {/* Subtle radial glow behind content */}
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/3"
          style={{
            width: '800px',
            height: '800px',
            background:
              'radial-gradient(circle, rgba(232,168,56,0.08) 0%, transparent 60%)',
          }}
        />
        {/* Noise texture overlay */}
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
          {/* Badge */}
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

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="mt-6 font-serif text-[2.75rem] font-bold leading-[1.08] tracking-tight text-charcoal sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {t('title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-md text-lg leading-relaxed text-warm-gray sm:text-xl lg:max-w-lg"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTAs */}
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

        {/* Right: Product mosaic on fridge surface */}
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

              {/* 3x3 product mosaic grid */}
              <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8 lg:p-10">
                <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-2 sm:gap-2.5 lg:gap-3">
                  {heroTiles.map((tile, i) => (
                    <motion.div
                      key={tile.src}
                      custom={i}
                      variants={tileVariants}
                      initial="hidden"
                      animate={isInView ? 'visible' : 'hidden'}
                      className="relative overflow-hidden rounded-lg"
                      style={{
                        boxShadow:
                          '0 3px 10px -3px rgba(0,0,0,0.25), 0 1px 3px -1px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
                      }}
                    >
                      <Image
                        src={tile.src}
                        alt={tile.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 130px"
                      />
                      {/* Tile shine overlay */}
                      <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 40%)',
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating decorative elements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -right-4 top-8 hidden h-10 w-10 rounded-lg bg-gold/20 backdrop-blur-sm lg:block"
              style={{
                boxShadow: '0 4px 12px -2px rgba(232,168,56,0.2)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={
                isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
              }
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -left-6 bottom-12 hidden h-8 w-8 rounded-md bg-terracotta/15 backdrop-blur-sm lg:block"
              style={{
                boxShadow: '0 4px 12px -2px rgba(196,101,58,0.15)',
              }}
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
