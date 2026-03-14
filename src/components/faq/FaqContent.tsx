'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/* ── FAQ item keys ── */
const faqItems = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
  { q: 'q4', a: 'a4' },
  { q: 'q5', a: 'a5' },
  { q: 'q6', a: 'a6' },
  { q: 'q7', a: 'a7' },
  { q: 'q8', a: 'a8' },
  { q: 'q9', a: 'a9' },
  { q: 'q10', a: 'a10' },
] as const;

/* ── Animation variants ── */
const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

/* ── Chevron icon ── */
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 text-warm-gray"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/* ── Single accordion item ── */
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  id,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}) {
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  return (
    <div
      className={`border-b border-light-gray transition-colors duration-200 ${
        isOpen ? 'bg-cream/50' : ''
      }`}
    >
      <h3>
        <button
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-5 text-left transition-colors duration-200 hover:bg-cream-dark/40 sm:px-6 sm:py-6"
          style={{ minHeight: '48px' }}
        >
          <span
            className={`font-sans text-base font-semibold leading-snug transition-colors duration-200 sm:text-lg ${
              isOpen ? 'text-terracotta' : 'text-charcoal'
            }`}
          >
            {question}
          </span>
          <ChevronIcon isOpen={isOpen} />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="relative px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
              {/* Terracotta accent line */}
              <div className="absolute left-4 top-0 h-full w-0.5 rounded-full bg-terracotta/30 sm:left-6" />
              <p className="pl-4 font-sans text-sm leading-relaxed text-warm-gray sm:text-base">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main FAQ content ── */
export function FaqContent() {
  const t = useTranslations('faqPage');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const listInView = useInView(listRef, { once: true, amount: 0.1 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <main className="bg-background">
      {/* ── Header section ── */}
      <section className="bg-warm-white py-16 sm:py-20 lg:py-24">
        <div className="container-mosaiko">
          <motion.div
            ref={headerRef}
            variants={sectionVariants}
            initial="hidden"
            animate={headerInView ? 'visible' : 'hidden'}
            className="text-center"
          >
            <motion.h1
              variants={headingVariants}
              className="font-serif text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl"
            >
              {t('title')}
            </motion.h1>
            <motion.p
              variants={headingVariants}
              className="mx-auto mt-4 max-w-lg text-base text-warm-gray sm:text-lg"
            >
              {t('subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Accordion section ── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-mosaiko">
          <motion.div
            ref={listRef}
            variants={sectionVariants}
            initial="hidden"
            animate={listInView ? 'visible' : 'hidden'}
            className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-light-gray bg-warm-white shadow-sm"
          >
            {faqItems.map((item, index) => (
              <motion.div key={item.q} variants={itemVariants}>
                <AccordionItem
                  id={`faq-${index}`}
                  question={t(item.q)}
                  answer={t(item.a)}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA section ── */}
      <section ref={ctaRef} className="pb-20 sm:pb-24 lg:pb-28">
        <div className="container-mosaiko">
          <motion.div
            variants={ctaVariants}
            initial="hidden"
            animate={ctaInView ? 'visible' : 'hidden'}
            className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl bg-teal shadow-lg"
          >
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,1) 20px, rgba(255,255,255,1) 21px)',
              }}
            />

            <div className="relative px-6 py-12 text-center sm:px-12 sm:py-14">
              <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                {t('stillQuestions')}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base text-white/80 sm:text-lg">
                {t('stillQuestionsText')}
              </p>
              <div className="mt-8">
                <Link
                  href="/contacto"
                  className="group inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-teal shadow-xl shadow-black/10 transition-all duration-300 hover:bg-cream hover:shadow-2xl hover:shadow-black/15 active:scale-[0.98] sm:px-10 sm:text-lg"
                >
                  {t('contactCta')}
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
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
