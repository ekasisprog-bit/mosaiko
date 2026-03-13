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
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/* ── Category data ── */
const categories = [
  {
    slug: 'mosaicos',
    translationKey: 'mosaicos' as const,
    gradient: 'from-terracotta via-terracotta-light to-gold',
    accent: 'rgba(196,101,58,0.9)',
  },
  {
    slug: 'studio-ghibli',
    translationKey: 'ghibli' as const,
    gradient: 'from-teal via-teal-light to-gold-light',
    accent: 'rgba(27,77,79,0.9)',
  },
  {
    slug: 'arte',
    translationKey: 'arte' as const,
    gradient: 'from-gold-dark via-terracotta to-terracotta-dark',
    accent: 'rgba(196,138,32,0.9)',
  },
  {
    slug: 'flores',
    translationKey: 'flores' as const,
    gradient: 'from-terracotta-light via-gold to-gold-light',
    accent: 'rgba(212,132,95,0.9)',
  },
];

export function FeaturedCategories() {
  const t = useTranslations('featured');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      className="relative bg-warm-white py-20 sm:py-24 lg:py-32"
    >
      <div className="container-mosaiko">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* ── Heading ── */}
          <motion.div variants={headingVariants} className="text-center">
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
              {t('title')}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-warm-gray sm:text-lg">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* ── Category cards — horizontally scrollable on mobile ── */}
          <div className="mt-12 sm:mt-16 lg:mt-20">
            {/* Mobile: horizontal scroll */}
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-6">
              {categories.map((cat) => (
                <motion.div
                  key={cat.slug}
                  variants={cardVariants}
                  className="w-[72vw] min-w-[260px] flex-shrink-0 snap-start sm:w-auto sm:min-w-0 sm:flex-shrink"
                >
                  <Link
                    href={`/catalogo`}
                    className="group relative block overflow-hidden rounded-2xl"
                  >
                    {/* Card image area (placeholder gradient) */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} transition-transform duration-500 ease-out group-hover:scale-110`}
                      />
                      {/* Subtle pattern overlay on the gradient */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                        }}
                      />
                      {/* Decorative mini-grid pattern */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.12]">
                        <div className="grid h-20 w-20 grid-cols-3 grid-rows-3 gap-1">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div
                              key={i}
                              className="rounded-sm bg-white"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Category name overlay */}
                    <div className="absolute inset-x-0 bottom-0">
                      <div
                        className="px-5 pb-5 pt-12"
                        style={{
                          background: `linear-gradient(to top, ${cat.accent} 0%, ${cat.accent.replace('0.9', '0.6')} 50%, transparent 100%)`,
                        }}
                      >
                        <h3 className="font-serif text-lg font-semibold text-white transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
                          {t(cat.translationKey)}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-sm text-white/80 opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <span>Ver coleccion</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 7h8M8 3.5L11 7l-3 3.5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hide scrollbar utility (CSS) */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
