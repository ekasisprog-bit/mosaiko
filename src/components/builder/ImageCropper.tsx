'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import type { GridConfig } from '@/lib/grid-config';
import type { CropArea } from '@/lib/canvas-utils';
import { Button } from '@/components/ui/Button';

// ─── Fit mode types ─────────────────────────────────────────────────────────

type FitMode = 'fill' | 'fit' | 'stretch';

interface FitModeOption {
  mode: FitMode;
  labelKey: 'fitModeFill' | 'fitModeFit' | 'fitModeStretch';
  descKey: 'fitModeFillDesc' | 'fitModeFitDesc' | 'fitModeStretchDesc';
  icon: React.ReactNode;
}

const FIT_MODE_OPTIONS: FitModeOption[] = [
  {
    mode: 'fill',
    labelKey: 'fitModeFill',
    descKey: 'fitModeFillDesc',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 16l5-5 4 4 4-6 5 5" />
      </svg>
    ),
  },
  {
    mode: 'fit',
    labelKey: 'fitModeFit',
    descKey: 'fitModeFitDesc',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="6" y="7" width="12" height="10" rx="1" />
      </svg>
    ),
  },
  {
    mode: 'stretch',
    labelKey: 'fitModeStretch',
    descKey: 'fitModeStretchDesc',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 12h8M12 8v8" />
        <path d="M8 8l-2-2M16 8l2-2M8 16l-2 2M16 16l2 2" />
      </svg>
    ),
  },
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface ImageCropperProps {
  imageSrc: string;
  gridConfig: GridConfig;
  onCropComplete: (croppedArea: CropArea, croppedAreaPixels: CropArea, rotation: number) => void;
  /** Fires during crop/zoom/rotation changes (debounced) for live preview. */
  onCropChange?: (croppedAreaPixels: CropArea, rotation: number) => void;
}

export function ImageCropper({
  imageSrc,
  gridConfig,
  onCropComplete,
  onCropChange,
}: ImageCropperProps) {
  const t = useTranslations('builder');

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fitMode, setFitMode] = useState<FitMode>('fill');
  const [finalCropArea, setFinalCropArea] = useState<CropArea | null>(null);
  const [finalCropAreaPixels, setFinalCropAreaPixels] = useState<CropArea | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  // Refs for debounced live preview
  const cropChangeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onCropChangeRef = useRef(onCropChange);
  onCropChangeRef.current = onCropChange;

  // Load image dimensions for stretch mode
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Reset crop position when fit mode changes
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, [fitMode]);

  // Clean up debounce timer
  useEffect(() => {
    return () => clearTimeout(cropChangeTimerRef.current);
  }, []);

  const handleCropComplete = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setFinalCropArea(croppedArea);
      setFinalCropAreaPixels(croppedAreaPixels);

      // Debounced live preview callback
      clearTimeout(cropChangeTimerRef.current);
      cropChangeTimerRef.current = setTimeout(() => {
        onCropChangeRef.current?.(croppedAreaPixels, rotation);
      }, 150);
    },
    [rotation],
  );

  function handleRotate() {
    setRotation((prev) => (prev + 90) % 360);
  }

  // Emit live preview when rotation changes
  useEffect(() => {
    if (finalCropAreaPixels) {
      clearTimeout(cropChangeTimerRef.current);
      cropChangeTimerRef.current = setTimeout(() => {
        onCropChangeRef.current?.(finalCropAreaPixels, rotation);
      }, 150);
    }
  }, [rotation, finalCropAreaPixels]);

  function handleProceed() {
    if (fitMode === 'stretch' && imageSize) {
      // Stretch: use the full image as the crop area
      const fullCropArea: CropArea = { x: 0, y: 0, width: 100, height: 100 };
      const fullCropAreaPixels: CropArea = {
        x: 0,
        y: 0,
        width: imageSize.width,
        height: imageSize.height,
      };
      onCropComplete(fullCropArea, fullCropAreaPixels, 0);
    } else if (finalCropArea && finalCropAreaPixels) {
      onCropComplete(finalCropArea, finalCropAreaPixels, rotation);
    }
  }

  const canProceed = fitMode === 'stretch'
    ? imageSize !== null
    : finalCropAreaPixels !== null;

  // Map fit mode to react-easy-crop objectFit
  const objectFit = fitMode === 'fill' ? 'cover' : 'contain';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-teal md:text-3xl">
          {t('cropTitle')}
        </h2>
        <p className="mt-2 text-sm text-warm-gray">
          {t('cropHint')}
        </p>
      </div>

      {/* Fit mode selector */}
      <FitModeSelector
        selected={fitMode}
        onChange={setFitMode}
      />

      {/* Cropper container */}
      <div
        className="relative mx-auto w-full overflow-hidden rounded-xl bg-charcoal"
        style={{ aspectRatio: '1', maxWidth: '500px' }}
      >
        {fitMode === 'stretch' ? (
          <StretchPreview
            imageSrc={imageSrc}
            gridConfig={gridConfig}
            hintText={t('fitModeStretchHint')}
          />
        ) : (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={gridConfig.aspect}
            objectFit={objectFit}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            showGrid={false}
            style={{
              containerStyle: {
                borderRadius: '0.75rem',
              },
            }}
          />
        )}

        {/* Grid overlay lines */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
        >
          <GridOverlay rows={gridConfig.rows} cols={gridConfig.cols} />
        </div>
      </div>

      {/* Controls — hidden for stretch mode */}
      <AnimatePresence>
        {fitMode !== 'stretch' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mx-auto flex w-full max-w-[500px] items-center gap-3 px-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-warm-gray"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="zoom-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-light-gray outline-none"
                aria-label="Zoom"
                style={
                  {
                    '--zoom-progress': `${((zoom - 1) / 2) * 100}%`,
                  } as React.CSSProperties
                }
              />

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-warm-gray"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
                <line x1="11" y1="8" x2="11" y2="14" />
              </svg>

              {/* Rotate button */}
              <button
                type="button"
                onClick={handleRotate}
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-cream text-warm-gray ring-1 ring-light-gray transition-all duration-200 hover:bg-terracotta/10 hover:text-terracotta hover:ring-terracotta active:scale-95"
                aria-label={t('rotate')}
                title={t('rotate')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6" />
                  <path d="M21.34 15.57a10 10 0 1 1-.57-8.38L21.5 8" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proceed button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleProceed}
        disabled={!canProceed}
      >
        {t('stepPreview')}
      </Button>

      {/* Custom slider styles */}
      <style>{`
        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--terracotta);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          margin-top: -8px;
        }
        .zoom-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--terracotta);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          cursor: pointer;
        }
        .zoom-slider::-webkit-slider-runnable-track {
          background: linear-gradient(
            to right,
            var(--terracotta) 0%,
            var(--terracotta) var(--zoom-progress, 0%),
            var(--light-gray) var(--zoom-progress, 0%),
            var(--light-gray) 100%
          );
          border-radius: 9999px;
          height: 8px;
        }
        .zoom-slider::-moz-range-track {
          background: var(--light-gray);
          border-radius: 9999px;
          height: 8px;
        }
        .zoom-slider::-moz-range-progress {
          background: var(--terracotta);
          border-radius: 9999px;
          height: 8px;
        }
      `}</style>
    </motion.div>
  );
}

// ─── Fit Mode Selector ──────────────────────────────────────────────────────

function FitModeSelector({
  selected,
  onChange,
}: {
  selected: FitMode;
  onChange: (mode: FitMode) => void;
}) {
  const t = useTranslations('builder');

  return (
    <div className="mx-auto w-full max-w-[500px]">
      <div className="flex gap-2">
        {FIT_MODE_OPTIONS.map(({ mode, labelKey, descKey, icon }) => {
          const isActive = selected === mode;

          return (
            <button
              key={mode}
              onClick={() => onChange(mode)}
              className={[
                'group relative flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-center transition-all duration-200',
                isActive
                  ? 'bg-terracotta/10 ring-2 ring-terracotta shadow-sm'
                  : 'bg-cream hover:bg-terracotta/5 ring-1 ring-light-gray',
              ].join(' ')}
              aria-pressed={isActive}
            >
              <div
                className={[
                  'transition-colors duration-200',
                  isActive ? 'text-terracotta' : 'text-warm-gray group-hover:text-charcoal',
                ].join(' ')}
              >
                {icon}
              </div>
              <span
                className={[
                  'text-xs font-semibold leading-tight transition-colors duration-200',
                  isActive ? 'text-terracotta' : 'text-charcoal',
                ].join(' ')}
              >
                {t(labelKey)}
              </span>
              <span
                className={[
                  'text-[10px] leading-tight transition-colors duration-200',
                  isActive ? 'text-terracotta/70' : 'text-warm-gray',
                ].join(' ')}
              >
                {t(descKey)}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="fitModeIndicator"
                  className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-terracotta ring-2 ring-white"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stretch Preview ────────────────────────────────────────────────────────

/** Shows the image stretched to fill the grid aspect ratio (no cropping). */
function StretchPreview({
  imageSrc,
  gridConfig,
  hintText,
}: {
  imageSrc: string;
  gridConfig: GridConfig;
  hintText: string;
}) {
  // Calculate the crop area dimensions to match the grid aspect ratio
  // inside the 1:1 container
  const containerSize = 100; // percentage
  let displayWidth: number;
  let displayHeight: number;

  if (gridConfig.aspect >= 1) {
    // Landscape or square: full width, reduced height
    displayWidth = containerSize;
    displayHeight = containerSize / gridConfig.aspect;
  } else {
    // Portrait: full height, reduced width
    displayWidth = containerSize * gridConfig.aspect;
    displayHeight = containerSize;
  }

  const offsetX = (containerSize - displayWidth) / 2;
  const offsetY = (containerSize - displayHeight) / 2;

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ borderRadius: '0.75rem' }}>
      {/* Dark background like the cropper */}
      <div className="absolute inset-0 bg-charcoal" style={{ borderRadius: '0.75rem' }} />

      {/* Dimmed outside area overlay */}
      <div className="absolute inset-0 bg-black/50" style={{ borderRadius: '0.75rem' }} />

      {/* The stretched image in the crop area */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${offsetX}%`,
          top: `${offsetY}%`,
          width: `${displayWidth}%`,
          height: `${displayHeight}%`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full"
          style={{ objectFit: 'fill' }}
          draggable={false}
        />
      </div>

      {/* Checkerboard pattern hint for distortion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          <span className="text-[10px] font-medium text-white/80">
            {hintText}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Grid Overlay ───────────────────────────────────────────────────────────

/** CSS-based grid overlay that draws cut lines over the crop area. */
function GridOverlay({ rows, cols }: { rows: number; cols: number }) {
  const verticalLines = [];
  const horizontalLines = [];

  for (let i = 1; i < cols; i++) {
    const pct = (i / cols) * 100;
    verticalLines.push(
      <div
        key={`v-${i}`}
        className="absolute top-0 h-full w-px"
        style={{
          left: `${pct}%`,
          background: 'rgba(255, 255, 255, 0.4)',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
        }}
      />,
    );
  }

  for (let i = 1; i < rows; i++) {
    const pct = (i / rows) * 100;
    horizontalLines.push(
      <div
        key={`h-${i}`}
        className="absolute left-0 h-px w-full"
        style={{
          top: `${pct}%`,
          background: 'rgba(255, 255, 255, 0.4)',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
        }}
      />,
    );
  }

  return (
    <>
      {verticalLines}
      {horizontalLines}
    </>
  );
}
