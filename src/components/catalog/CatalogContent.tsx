'use client';

import { useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CATALOG_CATEGORIES, getProductsByCategory } from '@/lib/catalog-data';
import { CategoryQuickNav } from './CategoryQuickNav';
import { CategoryRow } from './CategoryRow';

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

/* ── Component ── */
export function CatalogContent() {
  const t = useTranslations('catalogPage');
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  const productsByCategory = useMemo(() => getProductsByCategory(), []);

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

      {/* ── Sticky category navigation ── */}
      <CategoryQuickNav />

      {/* ── Category rows ── */}
      <section className="space-y-12 py-10 sm:space-y-16 sm:py-14 lg:space-y-20 lg:py-16">
        {CATALOG_CATEGORIES.map((cat, index) => {
          const products = productsByCategory.get(cat.type) ?? [];
          return (
            <CategoryRow
              key={cat.type}
              category={cat}
              products={products}
              index={index}
            />
          );
        })}
      </section>

      {/* ── Bottom CTA ── */}
      <CustomCtaSection />
    </div>
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
