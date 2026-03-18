'use client';

import type { ReactNode } from 'react';

interface FloresTilePreviewProps {
  children: ReactNode;
  filter: string;
  className?: string;
}

/**
 * Wraps a photo tile with a CSS filter for Flores theme preview.
 * Uses the filter string from getFloresCSSFilters().
 */
export function FloresTilePreview({ children, filter, className }: FloresTilePreviewProps) {
  return (
    <div
      className={['h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ filter, aspectRatio: '1' }}
    >
      {children}
    </div>
  );
}
