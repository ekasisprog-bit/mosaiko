'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

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

const headingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function ProductCarousel() {
  const t = useTranslations('carousel');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.12 });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: false,
      dragFree: true,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-cream py-20 sm:py-24 lg:py-32"
    >
      {/* Heading — stays inside the container */}
      <motion.div
        variants={headingVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="container-mosaiko mb-12 sm:mb-16"
      >
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
              {t('title')}
            </h2>
            <p className="mt-3 max-w-lg text-base text-warm-gray sm:text-lg">
              {t('subtitle')}
            </p>
          </div>

          {/* Desktop nav arrows — aligned with heading */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-light-gray bg-white text-charcoal transition-all hover:border-terracotta hover:text-terracotta disabled:opacity-30 disabled:hover:border-light-gray disabled:hover:text-charcoal"
              aria-label="Anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-light-gray bg-white text-charcoal transition-all hover:border-terracotta hover:text-terracotta disabled:opacity-30 disabled:hover:border-light-gray disabled:hover:text-charcoal"
              aria-label="Siguiente"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full-bleed Embla carousel */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-cream to-transparent sm:w-12" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-cream to-transparent sm:w-16" />

        {/* Embla viewport — full-bleed with container-aligned padding */}
        <div ref={emblaRef} className="carousel-track overflow-hidden">
          <div className="flex gap-5 sm:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.src}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.15 + index * 0.05,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="group min-w-0 flex-[0_0_280px] sm:flex-[0_0_320px] lg:flex-[0_0_340px]"
              >
                <div className="relative overflow-hidden rounded-2xl border border-transparent bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-light-gray group-hover:shadow-lg">
                  {/* Category badge — floating overlay */}
                  <div className="absolute left-3 top-3 z-[2]">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-teal backdrop-blur-sm">
                      {product.category}
                    </span>
                  </div>

                  {/* Grid badge — top right */}
                  <div className="absolute right-3 top-3 z-[2]">
                    <span className="inline-flex items-center rounded-full bg-charcoal/70 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                      {product.grid}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-warm-white">
                    <Image
                      src={product.src}
                      alt={product.alt}
                      fill
                      className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 340px"
                    />
                  </div>

                  {/* Bottom info bar */}
                  <div className="border-t border-cream-dark px-4 py-3">
                    <p className="truncate text-sm font-medium text-charcoal">
                      {product.alt}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
