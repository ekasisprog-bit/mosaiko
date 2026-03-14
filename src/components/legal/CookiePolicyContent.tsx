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

/* ── Cookie type cards ── */
const COOKIE_TYPES = [
  {
    titleKey: 'essentialTitle' as const,
    textKey: 'essentialText' as const,
    icon: ShieldIcon,
    accent: 'teal' as const,
  },
  {
    titleKey: 'analyticsTitle' as const,
    textKey: 'analyticsText' as const,
    icon: ChartIcon,
    accent: 'gold' as const,
  },
  {
    titleKey: 'marketingTitle' as const,
    textKey: 'marketingText' as const,
    icon: MegaphoneIcon,
    accent: 'terracotta' as const,
  },
];

/* ── Icons ── */
function ShieldIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
    </svg>
  );
}

function CookieIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="8" r="1" fill="currentColor" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

/* ── Accent color map ── */
const accentMap = {
  teal: {
    bg: 'bg-teal/5',
    border: 'border-teal/20',
    iconBg: 'bg-teal/10',
    iconText: 'text-teal',
    dot: 'bg-teal',
  },
  gold: {
    bg: 'bg-gold/5',
    border: 'border-gold/20',
    iconBg: 'bg-gold/10',
    iconText: 'text-gold-dark',
    dot: 'bg-gold',
  },
  terracotta: {
    bg: 'bg-terracotta/5',
    border: 'border-terracotta/20',
    iconBg: 'bg-terracotta/10',
    iconText: 'text-terracotta',
    dot: 'bg-terracotta',
  },
};

export function CookiePolicyContent() {
  const t = useTranslations('cookiePolicyPage');
  const tNav = useTranslations('nav');
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.05 });

  return (
    <article className="bg-warm-white">
      {/* ── Decorative Header Banner ── */}
      <div className="relative overflow-hidden bg-teal py-16 sm:py-20 lg:py-24">
        {/* Background pattern — diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
          }}
        />

        <div className="container-mosaiko relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream/10 text-cream/80">
              <CookieIcon />
            </div>
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

          {/* Section 1 — What are cookies? */}
          <motion.section variants={itemVariants} className="mt-10 sm:mt-12">
            <h2 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
              <span className="text-terracotta">1.</span>{' '}
              {t('section1Title').replace(/^\d+\.\s*/, '')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-warm-gray sm:text-[17px]">
              {t('section1Text')}
            </p>
          </motion.section>

          {/* Section 2 — Cookies we use (with sub-cards) */}
          <motion.section variants={itemVariants} className="mt-10 sm:mt-12">
            <h2 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
              <span className="text-terracotta">2.</span>{' '}
              {t('section2Title').replace(/^\d+\.\s*/, '')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-warm-gray sm:text-[17px]">
              {t('section2Intro')}
            </p>

            {/* Cookie type cards */}
            <div className="mt-6 space-y-4">
              {COOKIE_TYPES.map((cookie) => {
                const Icon = cookie.icon;
                const colors = accentMap[cookie.accent];

                return (
                  <motion.div
                    key={cookie.titleKey}
                    variants={itemVariants}
                    className={`rounded-xl border ${colors.border} ${colors.bg} p-5 sm:p-6`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.iconBg} ${colors.iconText}`}
                      >
                        <Icon />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif text-lg font-semibold text-charcoal">
                          {t(cookie.titleKey)}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-warm-gray sm:text-base">
                          {t(cookie.textKey)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Section 3 — Managing cookies */}
          <motion.section variants={itemVariants} className="mt-10 sm:mt-12">
            <h2 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
              <span className="text-terracotta">3.</span>{' '}
              {t('section3Title').replace(/^\d+\.\s*/, '')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-warm-gray sm:text-[17px]">
              {t('section3Text')}
            </p>
          </motion.section>

          {/* Section 4 — Third-party cookies */}
          <motion.section variants={itemVariants} className="mt-10 sm:mt-12">
            <h2 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
              <span className="text-terracotta">4.</span>{' '}
              {t('section4Title').replace(/^\d+\.\s*/, '')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-warm-gray sm:text-[17px]">
              {t('section4Text')}
            </p>
          </motion.section>

          {/* Section 5 — Updates */}
          <motion.section variants={itemVariants} className="mt-10 sm:mt-12">
            <h2 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
              <span className="text-terracotta">5.</span>{' '}
              {t('section5Title').replace(/^\d+\.\s*/, '')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-warm-gray sm:text-[17px]">
              {t('section5Text')}
            </p>
          </motion.section>

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
