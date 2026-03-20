'use client';

import { useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { getProductById, CATEGORY_ACCENT, type SeamData, type CatalogProduct } from '@/lib/catalog-data';
import { getEffectiveGridConfig, formatPrice } from '@/lib/grid-config';
import { CATEGORY_REGISTRY, getTileLayout } from '@/lib/customization-types';
import type { CategoryCustomization } from '@/lib/customization-types';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/Button';

interface PredesignedPreviewProps {
  productId: string;
  initialProduct?: CatalogProduct; // pre-fetched for dynamic products
}

export function PredesignedPreview({ productId, initialProduct }: PredesignedPreviewProps) {
  const t = useTranslations('catalogPage');
  const tb = useTranslations('builder');
  const tc = useTranslations('common');
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const product = useMemo(() => initialProduct ?? getProductById(productId), [productId, initialProduct]);
  const gridConfig = useMemo(
    () => product ? getEffectiveGridConfig(product.gridSize, product.category) : null,
    [product],
  );

  // Derive actual rows/cols from seamData when available (handles non-standard grids)
  const effectiveGrid = useMemo(() => {
    if (!product || !gridConfig) return null;
    if (product.seamData) {
      const cols = product.seamData.vertical.length + 1;
      const rows = product.seamData.horizontal.length + 1;
      return { rows, cols };
    }
    return { rows: gridConfig.rows, cols: gridConfig.cols };
  }, [product, gridConfig]);

  const occupiedCells = useMemo(() => {
    if (!product || !gridConfig || !effectiveGrid) return [];
    const { rows, cols } = effectiveGrid;

    // Arte has a 4×3 grid but only 9 of 12 cells are occupied (row 3 only col 4)
    if (product.category === 'arte') {
      const layout = getTileLayout({
        categoryType: product.category,
        gridSize: gridConfig.size,
      } as CategoryCustomization);
      return layout.map((tile) => ({
        index: tile.index,
        col: tile.gridColumn ? tile.gridColumn - 1 : tile.index % cols,
        row: tile.gridRow ? tile.gridRow - 1 : Math.floor(tile.index / cols),
        gridColumn: tile.gridColumn,
        gridRow: tile.gridRow,
      }));
    }

    // All other categories: fill the full rows × cols grid
    return Array.from({ length: rows * cols }, (_, i) => ({
      index: i,
      col: i % cols,
      row: Math.floor(i / cols),
      gridColumn: undefined as number | undefined,
      gridRow: undefined as number | undefined,
    }));
  }, [product, gridConfig, effectiveGrid]);

  const tileRotations = useMemo(() => {
    return Array.from({ length: occupiedCells.length }, () => ({
      initial: -2 + Math.random() * 4,
      hover: -1.5 + Math.random() * 3,
    }));
  }, [occupiedCells.length]);

  const handleAddToCart = useCallback(() => {
    if (!product || !gridConfig) return;
    const categoryLabel = CATEGORY_REGISTRY[product.category].label;

    addItem({
      type: 'predesigned',
      productId: product.id,
      categorySlug: product.category,
      name: `${categoryLabel} — ${product.name}`,
      gridSize: gridConfig.size,
      gridLayout: { rows: gridConfig.rows, cols: gridConfig.cols },
      price: product.price,
      quantity: 1,
      previewUrl: product.image,
      tileUrls: [],
    });
  }, [product, gridConfig, addItem]);

  const handleBack = useCallback(() => {
    router.push('/catalogo');
  }, [router]);

  if (!product || !product.isPredesigned || !gridConfig || !effectiveGrid) return null;

  const categoryLabel = CATEGORY_REGISTRY[product.category].label;
  const accentClass = CATEGORY_ACCENT[product.category];
  const priceFormatted = formatPrice(product.price);

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-warm-gray transition-colors hover:text-terracotta"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t('backToCatalog')}
      </button>

      {/* Product heading */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium text-white ${accentClass}`}>
            {categoryLabel}
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal md:text-3xl">
            {product.name}
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-2 text-sm text-warm-gray"
        >
          {t('previewSubtitle')}
        </motion.p>
      </div>

      {/* Product display — background-image sprite grid with per-tile hover */}
      <div className="mx-auto w-full max-w-[420px]">
        {/* Hidden img for SEO/a11y alt text */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="sr-only" />

        <div
          className="grid"
          style={{
            gridTemplateColumns: product.seamData
              ? seamGridTemplate(product.seamData.vertical)
              : `repeat(${effectiveGrid.cols}, 1fr)`,
            gridTemplateRows: product.seamData
              ? seamGridTemplate(product.seamData.horizontal)
              : `repeat(${effectiveGrid.rows}, 1fr)`,
            gap: product.seamData ? 0 : '3px',
            aspectRatio: `${effectiveGrid.cols} / ${effectiveGrid.rows}`,
          }}
        >
          {occupiedCells.map((cell, i) => {
            const tileStyle = product.seamData
              ? seamTileStyle(product.image, cell.col, cell.row, effectiveGrid.cols, effectiveGrid.rows, product.seamData)
              : {
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: `${effectiveGrid.cols * 100}% ${effectiveGrid.rows * 100}%`,
                  backgroundPosition: bgPos(cell.col, cell.row, effectiveGrid.cols, effectiveGrid.rows),
                };

            return (
              <motion.div
                key={cell.index}
                initial={{ opacity: 0, scale: 0.8, rotateZ: tileRotations[i].initial }}
                animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: cell.index * 0.05 + 0.15,
                }}
                whileHover={{
                  scale: 1.04,
                  rotateZ: tileRotations[i].hover,
                  zIndex: 10,
                  transition: { duration: 0.2 },
                }}
                className="group/tile relative cursor-default rounded-md"
                style={{
                  ...tileStyle,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
                  ...(cell.gridColumn ? { gridColumn: cell.gridColumn, gridRow: cell.gridRow } : {}),
                }}
              >
                {/* Magnetic shadow — visible on hover */}
                <div
                  className="absolute -bottom-1 left-1/2 -z-10 h-2 w-4/5 -translate-x-1/2 rounded-full opacity-0 transition-opacity group-hover/tile:opacity-20"
                  style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)' }}
                  aria-hidden="true"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="flex flex-col gap-4"
      >
        {/* Product info card */}
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm text-warm-gray">
              {tb(`grid${gridConfig.size}` as 'grid3' | 'grid4' | 'grid6' | 'grid9')}
            </span>
            <span className="text-xs text-warm-gray">
              {product.category === 'arte'
                ? `4×2+1 — ${gridConfig.size} ${tc('pieces')}`
                : `${gridConfig.rows} x ${gridConfig.cols} — ${gridConfig.size} ${tc('pieces')}`}
              {' · '}{categoryLabel}
            </span>
          </div>
          <span className="text-xl font-bold text-charcoal">
            {priceFormatted}
          </span>
        </div>

        {/* Add to cart button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleAddToCart}
        >
          {t('addToCartPrice', { price: priceFormatted })}
        </Button>

        {/* Back to catalog link */}
        <button
          onClick={handleBack}
          className="mx-auto cursor-pointer text-sm font-medium text-warm-gray underline underline-offset-2 transition-colors hover:text-terracotta"
        >
          {t('backToCatalog')}
        </button>
      </motion.div>
    </div>
  );
}

/** Compute CSS background-position for a cell in the sprite grid (fallback for products without seamData) */
function bgPos(col: number, row: number, cols: number, rows: number): string {
  const x = cols > 1 ? (col / (cols - 1)) * 100 : 50;
  const y = rows > 1 ? (row / (rows - 1)) * 100 : 50;
  return `${x}% ${y}%`;
}

/**
 * Build CSS grid-template from seam positions.
 * Seam positions define boundaries between tiles. E.g., for 3 cols with seams at [0.333, 0.667]:
 * → column widths are [33.3%, 33.4%, 33.3%]
 * The seam pixels themselves are "absorbed" into adjacent tiles since gap=0.
 */
function seamGridTemplate(seams: number[]): string {
  const boundaries = [0, ...seams, 1];
  const fractions = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    fractions.push(`${((boundaries[i + 1] - boundaries[i]) * 100).toFixed(3)}%`);
  }
  return fractions.join(' ');
}

/**
 * Compute background-image CSS for a tile using precise seam positions.
 * Each tile shows exactly the portion of the composite between its boundary seams.
 */
function seamTileStyle(
  imageUrl: string,
  col: number,
  row: number,
  cols: number,
  rows: number,
  seamData: SeamData,
): React.CSSProperties {
  const xBounds = [0, ...seamData.vertical, 1];
  const yBounds = [0, ...seamData.horizontal, 1];

  const x0 = xBounds[col];
  const x1 = xBounds[col + 1];
  const y0 = yBounds[row];
  const y1 = yBounds[row + 1];

  const tileW = x1 - x0; // fraction of image this tile occupies horizontally
  const tileH = y1 - y0; // fraction of image this tile occupies vertically

  // backgroundSize: scale so the full image fills 1/tileW and 1/tileH of the tile
  const bgW = (1 / tileW) * 100;
  const bgH = (1 / tileH) * 100;

  // backgroundPosition: offset so the correct portion is visible
  // position = -x0 * bgW (in tile-relative coordinates)
  const bgX = tileW < 1 ? (x0 / (1 - tileW)) * 100 : 0;
  const bgY = tileH < 1 ? (y0 / (1 - tileH)) * 100 : 0;

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${bgW.toFixed(2)}% ${bgH.toFixed(2)}%`,
    backgroundPosition: `${bgX.toFixed(2)}% ${bgY.toFixed(2)}%`,
  };
}
