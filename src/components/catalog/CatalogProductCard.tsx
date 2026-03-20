'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { type CatalogProduct, CATEGORY_ACCENT, getCategoryI18nKey, formatPrice } from '@/lib/catalog-data';

interface CatalogProductCardProps {
  product: CatalogProduct;
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const t = useTranslations('catalogPage');
  const accent = CATEGORY_ACCENT[product.category];
  const categoryLabel = t(getCategoryI18nKey(product.category));

  const href = product.isPredesigned
    ? { pathname: '/catalogo/[productId]' as const, params: { productId: product.id } }
    : { pathname: '/personalizar' as const, query: { category: product.category, grid: String(product.gridSize) } };

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-warm-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-charcoal/5"
    >
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-cream-dark">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 72vw, 280px"
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Grid badge top-left */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="sm:h-3 sm:w-3"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {product.grid}
          </span>
        </div>

        {/* Category label bottom-left */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
          <span
            className={`inline-block rounded-full ${accent} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:px-3 sm:py-1 sm:text-[11px]`}
          >
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="truncate font-serif text-sm font-semibold text-charcoal transition-colors duration-200 group-hover:text-terracotta sm:text-base">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <span className="text-base font-bold text-charcoal sm:text-lg">
            {formatPrice(product.price)}
          </span>
          <span className="text-[11px] text-warm-gray sm:text-xs">
            {product.pieces} {t('pieces', { count: product.pieces })}
          </span>
        </div>

        {/* CTA button */}
        <div className="mt-3">
          <span className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-terracotta px-4 py-2 text-sm font-semibold text-white transition-all duration-200 group-hover:bg-terracotta-dark sm:min-h-[48px]">
            {product.isPredesigned ? t('viewDesign') : t('personalizeButton')}
          </span>
        </div>
      </div>
    </Link>
  );
}
