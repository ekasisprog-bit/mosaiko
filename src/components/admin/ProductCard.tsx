'use client';

import { CATEGORY_ACCENT, formatPrice } from '@/lib/catalog-data';
import type { CatalogProduct } from '@/lib/catalog-data';
import { CATEGORY_REGISTRY } from '@/lib/customization-types';

interface ProductCardProps {
  product: CatalogProduct;
  isStatic: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, isStatic, onEdit, onDelete }: ProductCardProps) {
  const categoryLabel = CATEGORY_REGISTRY[product.category]?.label ?? product.category;
  const accentClass = CATEGORY_ACCENT[product.category] ?? 'bg-warm-gray';

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-xl bg-white transition-shadow hover:shadow-md"
      style={{ border: '1px solid #e5e0d4' }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Static badge */}
        {isStatic && (
          <span className="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warm-gray backdrop-blur-sm">
            Estatico
          </span>
        )}

        {/* Grid badge */}
        <span className="absolute right-2 top-2 rounded-md bg-charcoal/80 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {product.grid}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight text-charcoal line-clamp-2">
            {product.name}
          </h3>
          <span className="shrink-0 text-sm font-bold text-charcoal">
            {formatPrice(product.price)}
          </span>
        </div>

        <span className={`inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${accentClass}`}>
          {categoryLabel}
        </span>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          {!isStatic && (
            <>
              <button
                onClick={onEdit}
                className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium text-warm-gray transition-colors hover:bg-cream hover:text-charcoal"
                style={{ border: '1px solid #e5e0d4' }}
              >
                Editar
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                style={{ border: '1px solid #fecaca' }}
              >
                Eliminar
              </button>
            </>
          )}
          {isStatic && (
            <span className="flex-1 rounded-lg px-3 py-1.5 text-center text-xs text-warm-gray/60">
              No editable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
