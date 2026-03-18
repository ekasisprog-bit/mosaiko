'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { splitImageIntoTiles, loadImage } from '@/lib/canvas-utils';
import type { CropArea } from '@/lib/canvas-utils';
import { formatPrice, type GridConfig } from '@/lib/grid-config';
import type { CategoryType, FloresTheme } from '@/lib/customization-types';
import { Button } from '@/components/ui/Button';

interface MagnetPreviewProps {
  imageSrc: string;
  cropArea: CropArea;
  gridConfig: GridConfig;
  rotation?: number;
  onAddToCart: () => void;
  onReset: () => void;
  isUploading?: boolean;
  categoryType?: CategoryType;
  textFields?: Record<string, string>;
  filterTheme?: FloresTheme;
}

export function MagnetPreview({
  imageSrc,
  cropArea,
  gridConfig,
  rotation = 0,
  onAddToCart,
  onReset,
  isUploading = false,
  categoryType: _categoryType,
  textFields: _textFields,
  filterTheme: _filterTheme,
}: MagnetPreviewProps) {
  const t = useTranslations('builder');
  const tc = useTranslations('common');

  const [tiles, setTiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function generateTiles() {
      try {
        setIsLoading(true);
        setError(null);

        const image = await loadImage(imageSrc);
        if (cancelled) return;

        const tileDataUrls = splitImageIntoTiles(image, cropArea, gridConfig, rotation);
        if (cancelled) return;

        setTiles(tileDataUrls);
      } catch {
        if (!cancelled) {
          setError('Error al generar la vista previa. Intenta de nuevo.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    generateTiles();

    return () => {
      cancelled = true;
    };
  }, [imageSrc, cropArea, gridConfig, rotation]);

  const priceText = t('addToCart', { price: formatPrice(gridConfig.price) });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-serif text-2xl font-bold text-teal md:text-3xl"
        >
          {t('previewTitle')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-2 text-sm text-warm-gray"
        >
          {t('previewHint')}
        </motion.p>
      </div>

      {/* Fridge surface simulation */}
      <div className="mx-auto w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl p-6 md:p-8"
          style={{
            background: 'linear-gradient(145deg, #E8E2DA 0%, #D8D2CA 50%, #E0DAD2 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          {/* Subtle fridge texture dots */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}
            aria-hidden="true"
          />

          {isLoading ? (
            /* Loading state */
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-light-gray border-t-terracotta" />
              </div>
              <p className="text-sm text-warm-gray">{tc('loading')}</p>
            </div>
          ) : error ? (
            /* Error state */
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-error">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm text-error text-center">{error}</p>
              <Button variant="outline" size="sm" onClick={onReset}>
                {t('startOver')}
              </Button>
            </div>
          ) : (
            /* Tile grid */
            <div
              className="relative mx-auto grid"
              style={{
                gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
                gap: '4px',
                maxWidth: `${gridConfig.cols * 120}px`,
              }}
            >
              {tiles.map((tileSrc, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotateZ: -2 + Math.random() * 4 }}
                  animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    scale: 1.04,
                    rotateZ: -1 + Math.random() * 2,
                    zIndex: 10,
                    transition: { duration: 0.2 },
                  }}
                  className="group relative cursor-default"
                >
                  <div
                    className="overflow-hidden rounded-md"
                    style={{
                      aspectRatio: '1',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <img
                      src={tileSrc}
                      alt={`Pieza ${index + 1} de ${gridConfig.size}`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                  {/* Magnetic shadow underneath */}
                  <div
                    className="absolute -bottom-1 left-1/2 -z-10 h-2 w-4/5 -translate-x-1/2 rounded-full opacity-20"
                    style={{
                      background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
                    }}
                    aria-hidden="true"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Info section */}
      {!isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: tiles.length * 0.05 + 0.2, duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          {/* Product info card */}
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm text-warm-gray">
                {t(`grid${gridConfig.size}` as 'grid3' | 'grid4' | 'grid6' | 'grid9')}
              </span>
              <span className="text-xs text-warm-gray">
                {gridConfig.rows} x {gridConfig.cols} — {gridConfig.size} {tc('pieces')}
              </span>
            </div>
            <span className="text-xl font-bold text-teal">
              {formatPrice(gridConfig.price)}
            </span>
          </div>

          {/* Action buttons */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onAddToCart}
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo foto...' : priceText}
          </Button>

          <button
            onClick={onReset}
            className="mx-auto cursor-pointer text-sm font-medium text-warm-gray underline underline-offset-2 transition-colors hover:text-terracotta"
          >
            {t('startOver')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
