'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import type { GridConfig } from '@/lib/grid-config';
import type { CropArea } from '@/lib/canvas-utils';
import { Button } from '@/components/ui/Button';

interface ImageCropperProps {
  imageSrc: string;
  gridConfig: GridConfig;
  onCropComplete: (croppedArea: CropArea, croppedAreaPixels: CropArea) => void;
}

export function ImageCropper({
  imageSrc,
  gridConfig,
  onCropComplete,
}: ImageCropperProps) {
  const t = useTranslations('builder');

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [finalCropArea, setFinalCropArea] = useState<CropArea | null>(null);
  const [finalCropAreaPixels, setFinalCropAreaPixels] = useState<CropArea | null>(null);

  const handleCropComplete = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setFinalCropArea(croppedArea);
      setFinalCropAreaPixels(croppedAreaPixels);
    },
    [],
  );

  function handleProceed() {
    if (finalCropArea && finalCropAreaPixels) {
      onCropComplete(finalCropArea, finalCropAreaPixels);
    }
  }

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

      {/* Cropper container */}
      <div className="relative mx-auto w-full overflow-hidden rounded-xl bg-charcoal" style={{ aspectRatio: '1', maxWidth: '500px' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={gridConfig.aspect}
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

        {/* Grid overlay lines */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
        >
          <GridOverlay rows={gridConfig.rows} cols={gridConfig.cols} />
        </div>
      </div>

      {/* Zoom control */}
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
      </div>

      {/* Proceed button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleProceed}
        disabled={!finalCropAreaPixels}
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
