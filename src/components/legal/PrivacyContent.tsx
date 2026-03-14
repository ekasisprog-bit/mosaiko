'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/* ── Animation variants ── */
const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

/* ── Section keys ── */
const SECTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export function PrivacyContent() {
  const t = useTranslations('privacyPage');
  const tNav = useTranslations('nav');
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.05 });

  return (
    <article className="bg-warm-white">
      {/* ── Decorative Header Banner ── */}
      <div className="relative overflow-hidden bg-teal py-16 sm:py-20 lg:py-24">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="container-mosaiko relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h1 className="font-serif text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-sm text-cream/60 sm:text-base">
              {t('lastUpdated')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div ref={contentRef} className="container-mosaiko py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl"
        >
          {/* Intro */}
          <motion.p
            variants={headerVariants}
            className="text-base leading-relaxed text-warm-gray sm:text-lg"
          >
            {t('intro')}
          </motion.p>

          {/* Sections */}
          <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-12">
            {SECTIONS.map((num, index) => (
              <motion.section key={num} variants={itemVariants}>
                <h2 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
                  <span className="text-terracotta">{index + 1}.</span>{' '}
                  {t(`section${num}Title` as 'section1Title').replace(/^\d+\.\s*/, '')}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-warm-gray sm:text-[17px]">
                  {t(`section${num}Text` as 'section1Text')}
                </p>
              </motion.section>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            variants={itemVariants}
            className="mt-12 rounded-xl border border-light-gray bg-cream p-6 sm:mt-14 sm:p-8"
          >
            <p className="text-base leading-relaxed text-warm-gray sm:text-[17px]">
              {t('contactInfo')}
            </p>
            <Link
              href="/contacto"
              className="mt-4 inline-flex items-center gap-1.5 font-medium text-terracotta underline decoration-terracotta/30 underline-offset-2 transition-colors hover:text-terracotta-dark hover:decoration-terracotta-dark/50"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 12l4-4-4-4" />
              </svg>
              {tNav('contact')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </article>
  );
}
