'use client';

import type { ReactNode } from 'react';

interface PolaroidFrameProps {
  children: ReactNode;
  className?: string;
}

/**
 * CSS-based Polaroid frame wrapper.
 * Mirrors the print pipeline: 50px sides, 50px top, 140px bottom (proportional).
 * At preview scale: ~6% sides, ~6% top, ~17% bottom.
 */
export function PolaroidFrame({ children, className }: PolaroidFrameProps) {
  return (
    <div
      className={['overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{
        aspectRatio: '1',
        backgroundColor: '#FFFFFF',
        padding: '6% 6% 17% 6%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.1)',
      }}
    >
      <div
        className="h-full w-full overflow-hidden"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }}
      >
        {children}
      </div>
    </div>
  );
}
