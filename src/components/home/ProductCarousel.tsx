'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const products = [
  {
    src: '/products/mosaico-9-proposal.png',
    alt: 'Mosaico 9 piezas — Propuesta de matrimonio',
    category: 'Mosaicos',
    grid: '3×3',
  },
  {
    src: '/products/ghibli-chihiro.png',
    alt: 'El Viaje de Chihiro — Studio Ghibli',
    category: 'Studio Ghibli',
    grid: '2×3',
  },
  {
    src: '/products/arte-noche-estrellada.png',
    alt: 'La Noche Estrellada — Van Gogh',
    category: 'Arte',
    grid: '4×2+1',
  },
  {
    src: '/products/flores-9.png',
    alt: 'Flores — 9 piezas',
    category: 'Flores',
    grid: '3×3',
  },
  {
    src: '/products/polaroid-sunset.png',
    alt: 'Polaroid — Atardecer',
    category: 'Polaroid',
    grid: '2×2',
  },
  {
    src: '/products/save-the-date-9.png',
    alt: 'Save the Date — 9 piezas',
    category: 'Save the Date',
    grid: '3×3',
  },
  {
    src: '/products/arte-mona-lisa.png',
    alt: 'La Mona Lisa — Leonardo da Vinci',
    category: 'Arte',
    grid: '4×2+1',
  },
  {
    src: '/products/ghibli-totoro.png',
    alt: 'Mi Vecino Totoro — Studio Ghibli',
    category: 'Studio Ghibli',
    grid: '2×3',
  },
  {
    src: '/products/arte-el-beso.png',
    alt: 'El Beso — Gustav Klimt',
    category: 'Arte',
    grid: '4×2+1',
  },
  {
    src: '/products/ghibli-mononoke.png',
    alt: 'La Princesa Mononoke — Studio Ghibli',
    category: 'Studio Ghibli',
    grid: '2×3',
  },
  {
    src: '/products/mosaico-6-family.png',
    alt: 'Mosaico 6 piezas — Familia',
    category: 'Mosaicos',
    grid: '2×3',
  },
  {
    src: '/products/mosaico-3-panoramic.png',
    alt: 'Mosaico 3 piezas — Panorámica',
    category: 'Mosaicos',
    grid: '1×3',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
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

export function ProductCarousel() {
  const t = useTranslations('carousel');
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('div')?.offsetWidth || 300;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream py-20 sm:py-24 lg:py-32"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* Heading */}
        <motion.div variants={headingVariants} className="container-mosaiko text-center">
          <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-warm-gray sm:text-lg">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-12 sm:mt-16">
          {/* Navigation arrows */}
          <button
            onClick={() => scroll('left')}
            className={`absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl sm:flex h-12 w-12 ${
              canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-label="Anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className={`absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl sm:flex h-12 w-12 ${
              canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-label="Siguiente"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-[5] h-full w-8 bg-gradient-to-r from-cream to-transparent sm:w-16" />
          <div className="pointer-events-none absolute right-0 top-0 z-[5] h-full w-8 bg-gradient-to-l from-cream to-transparent sm:w-16" />

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto px-6 pb-4 pt-2 snap-x snap-mandatory sm:gap-6 sm:px-12 lg:px-20"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  delay: 0.2 + index * 0.06,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="group w-[260px] flex-shrink-0 snap-start sm:w-[300px] lg:w-[320px]"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-warm-white">
                    <Image
                      src={product.src}
                      alt={product.alt}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 260px, (max-width: 1024px) 300px, 320px"
                    />
                  </div>
                  {/* Info */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-teal">
                        {product.category}
                      </span>
                      <span className="text-xs text-warm-gray">
                        {product.grid}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hide scrollbar */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
