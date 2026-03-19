'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CATALOG_CATEGORIES, getCategoryI18nKey } from '@/lib/catalog-data';
import type { CategoryType } from '@/lib/customization-types';

export function CategoryQuickNav() {
  const t = useTranslations('catalogPage');
  const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const pillRefs = useRef<Map<CategoryType, HTMLButtonElement>>(new Map());

  // IntersectionObserver to track which category section is most visible
  useEffect(() => {
    const sections = CATALOG_CATEGORIES.map((cat) =>
      document.getElementById(`category-${cat.type}`)
    ).filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        let topEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
              topEntry = entry;
            }
          }
        }

        if (topEntry) {
          const id = topEntry.target.id.replace('category-', '') as CategoryType;
          setActiveCategory(id);
        }
      },
      { threshold: 0.3, rootMargin: '-120px 0px -40% 0px' }
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll pill bar to keep active pill visible
  useEffect(() => {
    if (!activeCategory || !navRef.current) return;
    const pill = pillRefs.current.get(activeCategory);
    if (!pill) return;

    const nav = navRef.current;
    const navRect = nav.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();

    if (pillRect.left < navRect.left || pillRect.right > navRect.right) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  const handleClick = useCallback((type: CategoryType) => {
    const section = document.getElementById(`category-${type}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const setPillRef = useCallback((type: CategoryType, el: HTMLButtonElement | null) => {
    if (el) {
      pillRefs.current.set(type, el);
    } else {
      pillRefs.current.delete(type);
    }
  }, []);

  return (
    <div className="sticky top-0 z-30 border-b border-light-gray/60 bg-warm-white/80 backdrop-blur-xl">
      <div className="container-mosaiko">
        <nav
          ref={navRef}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-2.5 sm:overflow-visible sm:px-0 sm:py-4"
          aria-label="Navegacion de categorias"
        >
          {CATALOG_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.type;
            return (
              <button
                key={cat.type}
                ref={(el) => setPillRef(cat.type, el)}
                onClick={() => handleClick(cat.type)}
                className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-terracotta text-cream shadow-md shadow-terracotta/20'
                    : 'bg-light-gray/60 text-charcoal hover:bg-light-gray hover:text-charcoal'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {t(getCategoryI18nKey(cat.type))}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
