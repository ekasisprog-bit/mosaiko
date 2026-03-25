'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/* ── Animation variants ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

/* ── Section data ── */
const sections = Array.from({ length: 10 }, (_, i) => ({
  titleKey: `section${i + 1}Title` as const,
  textKey: `section${i + 1}Text` as const,
}));

export function TermsContent() {
  const t = useTranslations('termsPage');
  const tNav = useTranslations('nav');
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const contentInView = useInView(contentRef, { once: true, amount: 0.1 });

  return (
    <div className="bg-warm-white">
      {/* ── Hero banner ── */}
      <div
        ref={headerRef}
        className="relative overflow-hidden bg-terracotta py-16 sm:py-20 lg:py-24"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg
            className="h-full w-full"
            viewBox="0 0 400 200"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="terms-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <rect width="40" height="40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#terms-grid)" />
          </svg>
        </div>

        <motion.div
          className="container-mosaiko relative text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-serif text-3xl font-bold text-warm-white sm:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-sm text-warm-white/60 sm:text-base">
            {t('lastUpdated')}
          </p>
        </motion.div>
      </div>

      {/* ── Content ── */}
      <div ref={contentRef} className="container-mosaiko py-12 sm:py-16 lg:py-20">
        <motion.div
          className="mx-auto max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate={contentInView ? 'visible' : 'hidden'}
        >
          {/* Intro */}
          <motion.p
            variants={itemVariants}
            className="text-base leading-relaxed text-warm-gray sm:text-lg"
          >
            {t('intro')}
          </motion.p>

          {/* Sections */}
          <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-12">
            {sections.map((section, index) => (
              <motion.div key={section.titleKey} variants={itemVariants}>
                <h2 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
                  <span className="text-terracotta">{index + 1}.</span>{' '}
                  {t(section.titleKey).replace(/^\d+\.\s*/, '')}
                </h2>
                <div className="mt-1 h-0.5 w-12 rounded-full bg-terracotta/20" />
                <p className="mt-4 text-base leading-relaxed text-warm-gray">
                  {t(section.textKey)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact info */}
          <motion.div
            variants={itemVariants}
            className="mt-12 rounded-2xl border border-light-gray bg-cream p-6 text-center sm:mt-16 sm:p-8"
          >
            <p className="text-base text-warm-gray sm:text-lg">
              {t('contactInfo')}
            </p>
            <Link
              href="/contacto"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-btn-primary px-6 py-2.5 text-sm font-medium text-btn-text transition-colors duration-200 hover:bg-btn-primary-hover"
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
                <path d="M2 4l6 4 6-4" />
                <rect x="1" y="3" width="14" height="10" rx="2" />
              </svg>
              {tNav('contact')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
