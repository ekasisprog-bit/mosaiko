'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';

/* ── Animation variants ── */

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
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

const fadeUpSlow = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

/* ── SVG Icons for Values ── */

function QualityIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Diamond / gem shape */}
      <path d="M16 3L6 13l10 16 10-16L16 3z" />
      <path d="M6 13h20" />
      <path d="M16 3l-4 10" />
      <path d="M16 3l4 10" />
      <path d="M12 13l4 16" />
      <path d="M20 13l-4 16" />
    </svg>
  );
}

function MexicoIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Heart with a small star inside */}
      <path d="M16 28S4 20 4 12a6 6 0 0112-1 6 6 0 0112 1c0 8-12 16-12 16z" />
      <path
        d="M16 14l1.09 2.21 2.44.35-1.77 1.72.42 2.43L16 19.5l-2.18 1.21.42-2.43-1.77-1.72 2.44-.35L16 14z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function SatisfactionIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Star with sparkle effect */}
      <path d="M16 4l3.09 6.26L26 11.46l-5 4.87 1.18 6.88L16 19.77l-6.18 3.44L11 16.33l-5-4.87 6.91-1.2L16 4z" />
      <path d="M26 4l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5L26 4z" />
      <path d="M6 22l.5 1.5 1.5.5-1.5.5L6 26l-.5-1.5L4 24l1.5-.5L6 22z" />
    </svg>
  );
}

function AccessibilityIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Two people / community */}
      <circle cx="12" cy="8" r="3" />
      <circle cx="22" cy="10" r="2.5" />
      <path d="M4 28v-4a8 8 0 0116 0v4" />
      <path d="M18 28v-3.5a6 6 0 018 0V28" />
    </svg>
  );
}

/* ── Decorative mosaic tile pattern for hero ── */
function MosaicPattern() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.04]"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Scattered rotated rectangles evoking magnet tiles */}
      <rect x="20" y="30" width="40" height="40" rx="6" fill="white" transform="rotate(-12 40 50)" />
      <rect x="320" y="20" width="50" height="50" rx="8" fill="white" transform="rotate(8 345 45)" />
      <rect x="180" y="200" width="35" height="35" rx="5" fill="white" transform="rotate(15 197 217)" />
      <rect x="60" y="220" width="45" height="45" rx="7" fill="white" transform="rotate(-6 82 242)" />
      <rect x="340" y="180" width="30" height="30" rx="4" fill="white" transform="rotate(20 355 195)" />
      <rect x="280" y="120" width="38" height="38" rx="6" fill="white" transform="rotate(-8 299 139)" />
      <rect x="100" y="120" width="28" height="28" rx="4" fill="white" transform="rotate(10 114 134)" />
      <rect x="220" y="60" width="32" height="32" rx="5" fill="white" transform="rotate(-15 236 76)" />
    </svg>
  );
}

/* ── Value card data ── */
const values = [
  {
    icon: QualityIcon,
    titleKey: 'value1Title' as const,
    textKey: 'value1Text' as const,
    accentColor: 'var(--gold)',
    accentBg: 'var(--gold)',
  },
  {
    icon: MexicoIcon,
    titleKey: 'value2Title' as const,
    textKey: 'value2Text' as const,
    accentColor: 'var(--terracotta)',
    accentBg: 'var(--terracotta)',
  },
  {
    icon: SatisfactionIcon,
    titleKey: 'value3Title' as const,
    textKey: 'value3Text' as const,
    accentColor: 'var(--teal)',
    accentBg: 'var(--teal)',
  },
  {
    icon: AccessibilityIcon,
    titleKey: 'value4Title' as const,
    textKey: 'value4Text' as const,
    accentColor: 'var(--terracotta-light)',
    accentBg: 'var(--terracotta-light)',
  },
];

/* ── Hero Section ── */
function HeroSection() {
  const t = useTranslations('aboutPage');
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-teal py-24 sm:py-32 lg:py-40"
    >
      {/* Background layers */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, var(--teal-dark) 0%, var(--teal) 40%, var(--teal-light) 100%)',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '900px',
          height: '500px',
          background:
            'radial-gradient(ellipse, rgba(232,168,56,0.1) 0%, transparent 60%)',
        }}
      />

      {/* Decorative tile pattern */}
      <MosaicPattern />

      {/* Diagonal stripe pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(255,255,255,1) 24px, rgba(255,255,255,1) 25px)',
        }}
      />

      {/* Content */}
      <div className="container-mosaiko relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-col items-center text-center"
        >
          {/* Small decorative line */}
          <motion.div
            variants={fadeUp}
            className="mb-6 h-px w-12 bg-gold/60"
          />

          <motion.h1
            variants={fadeUp}
            className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {t('title')}
          </motion.h1>

          <motion.p
            variants={fadeUpSlow}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl lg:text-2xl lg:leading-relaxed"
          >
            {t('heroSubtitle')}
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex items-center gap-3"
          >
            <span className="h-1 w-1 rounded-full bg-gold/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
            <span className="h-2 w-2 rounded-full bg-gold" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
            <span className="h-1 w-1 rounded-full bg-gold/50" />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom wave transition */}
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
            fill="var(--cream)"
          />
        </svg>
      </div>
    </section>
  );
}

/* ── Story Section ── */
function StorySection() {
  const t = useTranslations('aboutPage');
  const tCommon = useTranslations('common');
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="relative bg-cream py-20 sm:py-28 lg:py-36"
    >
      <div className="container-mosaiko">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto max-w-4xl"
        >
          {/* Section heading */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="font-brand text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">
              {tCommon('brandName')}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
              {t('storyTitle')}
            </h2>
          </motion.div>

          {/* Story paragraphs with editorial layout */}
          <div className="mt-14 space-y-0 sm:mt-16 lg:mt-20">
            {/* Paragraph 1 - full width with drop cap feel */}
            <motion.div
              variants={fadeUpSlow}
              className="relative"
            >
              <div className="absolute -left-4 top-0 hidden h-full w-px bg-gradient-to-b from-terracotta/30 via-terracotta/10 to-transparent lg:-left-8 lg:block" />
              <p className="text-lg leading-[1.85] text-charcoal/80 sm:text-xl sm:leading-[1.85] lg:text-[1.375rem] lg:leading-[1.85]">
                <span className="font-serif text-2xl font-semibold text-charcoal sm:text-3xl lg:text-4xl">
                  {t('storyP1').charAt(0)}
                </span>
                {t('storyP1').slice(1)}
              </p>
            </motion.div>

            {/* Decorative break */}
            <motion.div
              variants={scaleIn}
              className="flex items-center justify-center py-8 sm:py-10"
            >
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-light-gray sm:w-12" />
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className="text-terracotta/40"
                >
                  <rect
                    x="3"
                    y="3"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                  />
                  <rect
                    x="11"
                    y="3"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="3"
                    y="11"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="11"
                    y="11"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.3"
                  />
                </svg>
                <span className="h-px w-8 bg-light-gray sm:w-12" />
              </div>
            </motion.div>

            {/* Paragraph 2 - slightly indented for visual rhythm */}
            <motion.div
              variants={fadeUpSlow}
              className="sm:pl-8 lg:pl-16"
            >
              <p className="text-lg leading-[1.85] text-charcoal/80 sm:text-xl sm:leading-[1.85] lg:text-[1.375rem] lg:leading-[1.85]">
                {t('storyP2')}
              </p>
            </motion.div>

            {/* Decorative break */}
            <motion.div
              variants={scaleIn}
              className="flex items-center justify-center py-8 sm:py-10"
            >
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-light-gray sm:w-12" />
                <span className="h-1.5 w-1.5 rounded-full bg-gold/50" />
                <span className="h-px w-8 bg-light-gray sm:w-12" />
              </div>
            </motion.div>

            {/* Paragraph 3 - back to full width, slightly larger for emphasis */}
            <motion.div variants={fadeUpSlow}>
              <p className="text-lg font-medium leading-[1.85] text-charcoal/90 sm:text-xl sm:leading-[1.85] lg:text-[1.375rem] lg:leading-[1.85]">
                {t('storyP3')}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Values Section ── */
function ValuesSection() {
  const t = useTranslations('aboutPage');
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      ref={ref}
      className="relative bg-warm-white py-20 sm:py-28 lg:py-36"
    >
      {/* Subtle background radial */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: '1000px',
          height: '600px',
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, var(--cream-dark) 0%, transparent 70%)',
        }}
      />

      <div className="container-mosaiko relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section heading */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="font-brand text-sm font-semibold uppercase tracking-[0.2em] text-teal">
              {t('valuesTitle').split(' ')[0]}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
              {t('valuesTitle')}
            </h2>
          </motion.div>

          {/* Values grid */}
          <div className="mt-14 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:mt-20 lg:gap-10">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.titleKey}
                  variants={fadeUpSlow}
                  className="group relative rounded-2xl bg-cream p-8 shadow-sm ring-1 ring-light-gray/50 transition-shadow duration-500 hover:shadow-lg sm:p-10"
                >
                  {/* Accent bar at top */}
                  <div
                    className="absolute left-8 top-0 h-1 w-12 rounded-b-full transition-all duration-500 group-hover:w-20 sm:left-10"
                    style={{ backgroundColor: value.accentBg, opacity: 0.7 }}
                  />

                  {/* Icon container */}
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${value.accentBg} 12%, transparent)`,
                      color: value.accentColor,
                    }}
                  >
                    <Icon />
                  </div>

                  {/* Text */}
                  <h3 className="mt-5 font-serif text-xl font-semibold text-charcoal sm:text-2xl">
                    {t(value.titleKey)}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-warm-gray sm:text-lg sm:leading-relaxed">
                    {t(value.textKey)}
                  </p>

                  {/* Corner decoration */}
                  <div
                    className="absolute bottom-4 right-4 h-6 w-6 rounded-md opacity-[0.06] sm:bottom-6 sm:right-6 sm:h-8 sm:w-8"
                    style={{
                      backgroundColor: value.accentBg,
                      transform: `rotate(${12 + index * 8}deg)`,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Promise Section ── */
function PromiseSection() {
  const t = useTranslations('aboutPage');
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-teal py-20 sm:py-28 lg:py-32"
    >
      {/* Background layers */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 50%, var(--teal-light) 100%)',
        }}
      />

      {/* Radial warm highlight */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '800px',
          height: '400px',
          background:
            'radial-gradient(ellipse, rgba(232,168,56,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Diagonal stripe pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,1) 20px, rgba(255,255,255,1) 21px)',
        }}
      />

      {/* Floating decorative tiles */}
      <div
        className="absolute -left-4 top-8 h-16 w-16 rounded-xl opacity-[0.06] sm:left-8 sm:h-20 sm:w-20"
        style={{ background: 'white', transform: 'rotate(-12deg)' }}
      />
      <div
        className="absolute -right-2 top-12 h-12 w-12 rounded-lg opacity-[0.05] sm:right-12 sm:h-16 sm:w-16"
        style={{ background: 'white', transform: 'rotate(8deg)' }}
      />
      <div
        className="absolute bottom-6 left-12 h-10 w-10 rounded-lg opacity-[0.04] sm:left-24"
        style={{ background: 'white', transform: 'rotate(15deg)' }}
      />
      <div
        className="absolute -right-4 bottom-10 h-14 w-14 rounded-xl opacity-[0.06] sm:right-16"
        style={{ background: 'white', transform: 'rotate(-6deg)' }}
      />

      {/* Content */}
      <div className="container-mosaiko relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          {/* Small mosaic icon */}
          <motion.div variants={scaleIn}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
              className="text-gold/70"
            >
              <rect x="6" y="6" width="14" height="14" rx="3" fill="currentColor" opacity="0.9" />
              <rect x="24" y="6" width="14" height="14" rx="3" fill="currentColor" opacity="0.6" />
              <rect x="6" y="24" width="14" height="14" rx="3" fill="currentColor" opacity="0.6" />
              <rect x="24" y="24" width="14" height="14" rx="3" fill="currentColor" opacity="0.35" />
            </svg>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="mt-6 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.5rem]"
          >
            {t('promiseTitle')}
          </motion.h2>

          <motion.p
            variants={fadeUpSlow}
            className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl sm:leading-relaxed lg:text-2xl lg:leading-relaxed"
          >
            {t('promiseText')}
          </motion.p>

          {/* Decorative dots */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex items-center gap-3"
          >
            <span className="h-1 w-1 rounded-full bg-gold/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold/60" />
            <span className="h-2 w-2 rounded-full bg-gold/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold/60" />
            <span className="h-1 w-1 rounded-full bg-gold/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main AboutContent ── */
export function AboutContent() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <ValuesSection />
      <PromiseSection />
    </>
  );
}
