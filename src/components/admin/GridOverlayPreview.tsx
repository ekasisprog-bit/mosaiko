'use client';

import { useMemo } from 'react';
import type { SeamDetectionResult } from '@/lib/admin/seam-detection';

interface GridOverlayPreviewProps {
  imageUrl: string;
  detection: SeamDetectionResult;
  onOverrideGrid?: (rows: number, cols: number, gridSize: number) => void;
}

const GRID_OPTIONS = [
  { label: '1x3 — 3 piezas', rows: 1, cols: 3, gridSize: 3 },
  { label: '3x1 — 3 piezas', rows: 3, cols: 1, gridSize: 3 },
  { label: '2x2 — 4 piezas', rows: 2, cols: 2, gridSize: 4 },
  { label: '2x3 — 6 piezas', rows: 3, cols: 2, gridSize: 6 },
  { label: '3x2 — 6 piezas', rows: 2, cols: 3, gridSize: 6 },
  { label: '3x3 — 9 piezas', rows: 3, cols: 3, gridSize: 9 },
  { label: '4x3 — 9 piezas (arte)', rows: 3, cols: 4, gridSize: 9 },
];

export function GridOverlayPreview({ imageUrl, detection, onOverrideGrid }: GridOverlayPreviewProps) {
  const confidenceColor = useMemo(() => {
    if (detection.confidence >= 0.9) return '#22c55e'; // green
    if (detection.confidence >= 0.7) return '#eab308'; // yellow
    return '#ef4444'; // red
  }, [detection.confidence]);

  return (
    <div className="flex flex-col gap-4">
      {/* Image with seam overlay */}
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg" style={{ border: '1px solid #e5e0d4' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Producto a analizar" className="block w-full" />

        {/* Vertical seam lines */}
        {detection.seamPositions.vertical.map((pos, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 h-full"
            style={{
              left: `${pos * 100}%`,
              width: '2px',
              background: 'rgba(196, 107, 72, 0.7)',
              boxShadow: '0 0 4px rgba(196, 107, 72, 0.5)',
            }}
          />
        ))}

        {/* Horizontal seam lines */}
        {detection.seamPositions.horizontal.map((pos, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 w-full"
            style={{
              top: `${pos * 100}%`,
              height: '2px',
              background: 'rgba(196, 107, 72, 0.7)',
              boxShadow: '0 0 4px rgba(196, 107, 72, 0.5)',
            }}
          />
        ))}
      </div>

      {/* Detection info */}
      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3" style={{ border: '1px solid #e5e0d4' }}>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-charcoal">
            {detection.grid} — {detection.gridSize} piezas
          </span>
          <span className="text-xs text-warm-gray">
            {detection.imageWidth}×{detection.imageHeight}px
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: confidenceColor }} />
          <span className="text-sm font-medium" style={{ color: confidenceColor }}>
            {Math.round(detection.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Grid override dropdown */}
      {onOverrideGrid && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-warm-gray">
            Cambiar cuadricula (si la deteccion es incorrecta):
          </label>
          <select
            defaultValue={`${detection.rows}x${detection.cols}`}
            onChange={(e) => {
              const opt = GRID_OPTIONS.find((o) => `${o.rows}x${o.cols}` === e.target.value);
              if (opt) onOverrideGrid(opt.rows, opt.cols, opt.gridSize);
            }}
            className="rounded-lg bg-white px-3 py-2 text-sm text-charcoal"
            style={{ border: '1px solid #e5e0d4' }}
          >
            {GRID_OPTIONS.map((opt) => (
              <option key={`${opt.rows}x${opt.cols}`} value={`${opt.rows}x${opt.cols}`}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
