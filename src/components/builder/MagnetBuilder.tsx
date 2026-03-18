'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_CONFIGS, formatPrice, type GridSize, type GridConfig } from '@/lib/grid-config';
import type { CropArea } from '@/lib/canvas-utils';
import { useCartStore } from '@/lib/cart-store';
import { createPreviewCanvas, getCroppedCanvas, loadImage } from '@/lib/canvas-utils';
import { GridSelector } from './GridSelector';
import { PhotoUploader } from './PhotoUploader';
import { ImageCropper } from './ImageCropper';
import { MagnetPreview } from './MagnetPreview';

type Step = 1 | 2 | 3 | 4;

const STEP_KEYS = ['stepGrid', 'stepUpload', 'stepCrop', 'stepPreview'] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export function MagnetBuilder() {
  const t = useTranslations('builder');
  const tc = useTranslations('common');
  const addItem = useCartStore((s) => s.addItem);

  // Flow state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [selectedGrid, setSelectedGrid] = useState<GridSize | null>(null);
  const [, setImageFile] = useState<File | null>(null);
  const imageFileRef = useRef<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropAreaPixels, setCropAreaPixels] = useState<CropArea | null>(null);
  const [rotation, setRotation] = useState(0);
  const [liveCropArea, setLiveCropArea] = useState<CropArea | null>(null);
  const [liveRotation, setLiveRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const gridConfig: GridConfig | null = useMemo(
    () => (selectedGrid ? GRID_CONFIGS[selectedGrid] : null),
    [selectedGrid],
  );

  // ─── Navigation ───
  function goToStep(step: Step) {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  }

  function goBack() {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as Step);
    }
  }

  // ─── Step Handlers ───
  const handleGridSelect = useCallback((grid: GridSize) => {
    setSelectedGrid(grid);
    // Auto-advance after a brief pause for the selection animation
    setTimeout(() => {
      setDirection(1);
      setCurrentStep(2);
    }, 250);
  }, []);

  const handleImageSelected = useCallback((file: File) => {
    setImageFile(file);
    imageFileRef.current = file;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setDirection(1);
    setCurrentStep(3);
  }, []);

  const handleCropComplete = useCallback(
    (_croppedArea: CropArea, croppedAreaPixels: CropArea, cropRotation: number) => {
      setCropAreaPixels(croppedAreaPixels);
      setRotation(cropRotation);
      setDirection(1);
      setCurrentStep(4);
    },
    [],
  );

  const handleCropChange = useCallback(
    (croppedAreaPixels: CropArea, cropRotation: number) => {
      setLiveCropArea(croppedAreaPixels);
      setLiveRotation(cropRotation);
    },
    [],
  );

  const handleAddToCart = useCallback(async () => {
    if (!imageSrc || !cropAreaPixels || !gridConfig) return;

    setIsUploading(true);

    try {
      // Generate a preview data URL for the cart
      const image = await loadImage(imageSrc);
      const previewCanvas = createPreviewCanvas(image, cropAreaPixels, gridConfig, 120, 4, rotation);
      const previewUrl = previewCanvas.toDataURL('image/jpeg', 0.85);

      // Upload original photo to R2 so it survives browser close
      let photoStorageUrl = '';
      const file = imageFileRef.current;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const { publicUrl } = await uploadRes.json();
          photoStorageUrl = publicUrl;
        }
      }

      addItem({
        type: 'custom',
        name: `Mosaico ${gridConfig.size} piezas`,
        gridSize: gridConfig.size,
        gridLayout: { rows: gridConfig.rows, cols: gridConfig.cols },
        price: gridConfig.price,
        quantity: 1,
        previewUrl,
        tileUrls: [],
        customizations: {
          categoryType: 'mosaicos',
          photoStorageUrl,
          cropArea: cropAreaPixels,
          rotation,
        },
      });
    } catch {
      addItem({
        type: 'custom',
        name: `Mosaico ${gridConfig.size} piezas`,
        gridSize: gridConfig.size,
        gridLayout: { rows: gridConfig.rows, cols: gridConfig.cols },
        price: gridConfig.price,
        quantity: 1,
        previewUrl: '',
        tileUrls: [],
      });
    } finally {
      setIsUploading(false);
    }
  }, [imageSrc, cropAreaPixels, gridConfig, rotation, addItem]);

  const handleReset = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setSelectedGrid(null);
    setImageFile(null);
    imageFileRef.current = null;
    setImageSrc(null);
    setCropAreaPixels(null);
    setRotation(0);
    setLiveCropArea(null);
    setLiveRotation(0);
    setDirection(-1);
    setCurrentStep(1);
  }, [imageSrc]);

  return (
    <div className="container-mosaiko py-6 md:py-10">
      {/* ── Header ── */}
      <div className="mb-6 text-center md:mb-8">
        <h1 className="font-serif text-3xl font-bold text-teal md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-warm-gray md:text-base">
          {t('subtitle')}
        </p>
      </div>

      {/* ── Step Indicator ── */}
      <StepIndicator
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) goToStep(step);
        }}
      />

      {/* ── Two-column layout on desktop ── */}
      <div className="mt-6 md:mt-8 lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">
        {/* Left column: Active step content */}
        <div className="min-w-0">
          {/* Back button */}
          <AnimatePresence>
            {currentStep > 1 && (
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                onClick={goBack}
                className="mb-4 flex min-h-[48px] items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-warm-gray transition-colors hover:text-charcoal cursor-pointer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                {tc('back')}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Step content with slide animations */}
          <div className="relative overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {currentStep === 1 && (
                  <GridSelector
                    onSelect={handleGridSelect}
                    selected={selectedGrid}
                  />
                )}
                {currentStep === 2 && gridConfig && (
                  <PhotoUploader
                    onImageSelected={handleImageSelected}
                    gridConfig={gridConfig}
                  />
                )}
                {currentStep === 3 && imageSrc && gridConfig && (
                  <ImageCropper
                    imageSrc={imageSrc}
                    gridConfig={gridConfig}
                    onCropComplete={handleCropComplete}
                    onCropChange={handleCropChange}
                  />
                )}
                {currentStep === 4 && imageSrc && cropAreaPixels && gridConfig && (
                  <MagnetPreview
                    imageSrc={imageSrc}
                    cropArea={cropAreaPixels}
                    gridConfig={gridConfig}
                    rotation={rotation}
                    onAddToCart={handleAddToCart}
                    onReset={handleReset}
                    isUploading={isUploading}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right column: Live preview sidebar (desktop only) */}
        <aside className="hidden lg:block" aria-label="Vista previa en vivo">
          <LivePreviewSidebar
            currentStep={currentStep}
            selectedGrid={selectedGrid}
            imageSrc={imageSrc}
            gridConfig={gridConfig}
            liveCropArea={liveCropArea}
            liveRotation={liveRotation}
          />
        </aside>
      </div>
    </div>
  );
}

// ─── Step Indicator Component ───────────────────────────────────────────────

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: Step;
  onStepClick: (step: Step) => void;
}) {
  const t = useTranslations('builder');

  return (
    <div className="flex items-center justify-center gap-0">
      {STEP_KEYS.map((key, index) => {
        const step = (index + 1) as Step;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isClickable = step < currentStep;

        return (
          <div key={key} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step)}
              disabled={!isClickable}
              className={[
                'flex flex-col items-center gap-1.5',
                isClickable ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
              aria-label={`${t(key)} — Paso ${step}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  'md:h-10 md:w-10 md:text-sm',
                  isActive
                    ? 'bg-terracotta text-white shadow-md shadow-terracotta/30'
                    : isCompleted
                      ? 'bg-teal text-white'
                      : 'bg-light-gray text-warm-gray',
                ].join(' ')}
              >
                {isCompleted ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={[
                  'hidden text-xs font-medium sm:block',
                  isActive
                    ? 'text-terracotta'
                    : isCompleted
                      ? 'text-teal'
                      : 'text-warm-gray',
                ].join(' ')}
              >
                {t(key)}
              </span>
            </button>

            {/* Connector line */}
            {index < STEP_KEYS.length - 1 && (
              <div
                className={[
                  'mx-2 h-0.5 w-8 rounded-full transition-colors duration-300 md:mx-3 md:w-12',
                  step < currentStep ? 'bg-teal' : 'bg-light-gray',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Live Preview Sidebar (Desktop) ─────────────────────────────────────────

function LivePreviewSidebar({
  currentStep,
  selectedGrid,
  imageSrc,
  gridConfig,
  liveCropArea,
  liveRotation = 0,
}: {
  currentStep: Step;
  selectedGrid: GridSize | null;
  imageSrc: string | null;
  gridConfig: GridConfig | null;
  liveCropArea?: CropArea | null;
  liveRotation?: number;
}) {
  const t = useTranslations('builder');

  return (
    <div className="sticky top-[calc(var(--header-height)+2rem)] rounded-2xl bg-white p-6 shadow-sm border border-light-gray">
      <h3 className="mb-4 text-center font-serif text-lg font-semibold text-teal">
        {t('stepPreview')}
      </h3>

      <div
        className="relative flex items-center justify-center overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(145deg, #E8E2DA 0%, #D8D2CA 50%, #E0DAD2 100%)',
          minHeight: '240px',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {/* Fridge texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
          aria-hidden="true"
        />

        <AnimatePresence mode="wait">
          {!selectedGrid && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 p-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/60">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-warm-gray"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </div>
              <p className="text-sm text-warm-gray">{t('subtitle')}</p>
            </motion.div>
          )}

          {selectedGrid && !imageSrc && gridConfig && (
            <motion.div
              key="grid-selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6"
            >
              <PlaceholderGrid rows={gridConfig.rows} cols={gridConfig.cols} />
            </motion.div>
          )}

          {selectedGrid && imageSrc && gridConfig && (
            <motion.div
              key="has-image"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6"
            >
              <ImagePreviewGrid
                rows={gridConfig.rows}
                cols={gridConfig.cols}
                imageSrc={imageSrc}
                cropArea={liveCropArea}
                rotation={liveRotation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected grid info */}
      {gridConfig && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-between"
        >
          <span className="text-sm text-warm-gray">
            {t(
              `grid${gridConfig.size}` as
                | 'grid3'
                | 'grid4'
                | 'grid6'
                | 'grid9',
            )}
          </span>
          <span className="text-lg font-bold text-teal">
            {formatPrice(gridConfig.price)}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Helper Sub-components ──────────────────────────────────────────────────

/** Placeholder grid shown before an image is uploaded. */
function PlaceholderGrid({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: `${cols * 80}px`,
        maxWidth: '100%',
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: i * 0.04,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className="rounded-md bg-white/50"
          style={{
            aspectRatio: '1',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        />
      ))}
    </div>
  );
}

/** Grid that shows the uploaded image split visually. Uses canvas-based
 *  rendering when a crop area is provided, otherwise falls back to CSS. */
function ImagePreviewGrid({
  rows,
  cols,
  imageSrc,
  cropArea,
  rotation = 0,
}: {
  rows: number;
  cols: number;
  imageSrc: string;
  cropArea?: CropArea | null;
  rotation?: number;
}) {
  const [tiles, setTiles] = useState<string[] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Generate canvas-based tile previews when crop area is available
  useEffect(() => {
    if (!cropArea) {
      setTiles(null);
      return;
    }

    clearTimeout(timerRef.current);
    let cancelled = false;

    timerRef.current = setTimeout(async () => {
      try {
        const image = await loadImage(imageSrc);
        if (cancelled) return;

        const tileSize = 80;
        const totalW = cols * tileSize;
        const totalH = rows * tileSize;
        const cropped = getCroppedCanvas(image, cropArea, totalW, totalH, rotation);

        const urls: string[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const tc = document.createElement('canvas');
            tc.width = tileSize;
            tc.height = tileSize;
            const tctx = tc.getContext('2d')!;
            tctx.drawImage(
              cropped,
              c * tileSize, r * tileSize, tileSize, tileSize,
              0, 0, tileSize, tileSize,
            );
            urls.push(tc.toDataURL('image/jpeg', 0.7));
            tc.width = 0;
            tc.height = 0;
          }
        }
        cropped.width = 0;
        cropped.height = 0;

        if (!cancelled) setTiles(urls);
      } catch {
        // Preview is non-critical; silently fall back to CSS
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
    };
  }, [imageSrc, cropArea, rotation, rows, cols]);

  // Canvas-based tiles when available
  if (tiles && tiles.length === rows * cols) {
    return (
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          width: `${cols * 80}px`,
          maxWidth: '100%',
        }}
      >
        {tiles.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: i * 0.04,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="overflow-hidden rounded-md"
            style={{
              aspectRatio: '1',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
          </motion.div>
        ))}
      </div>
    );
  }

  // CSS fallback (no crop area yet)
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: `${cols * 80}px`,
        maxWidth: '100%',
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: i * 0.04,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="overflow-hidden rounded-md"
            style={{
              aspectRatio: '1',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: `${cols * 100}% ${rows * 100}%`,
              backgroundPosition: `${cols > 1 ? (col / (cols - 1)) * 100 : 50}% ${rows > 1 ? (row / (rows - 1)) * 100 : 50}%`,
            }}
          />
        );
      })}
    </div>
  );
}
