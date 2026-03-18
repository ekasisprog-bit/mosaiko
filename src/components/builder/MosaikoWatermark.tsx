'use client';

import Image from 'next/image';

/**
 * Small Mosaiko logo watermark for the bottom-right corner of mosaic previews.
 * Matches the branding seen on product photos: M icon + lowercase "osaiko".
 * Positioned absolutely within the tile grid container.
 */
export function MosaikoWatermark() {
  return (
    <div
      className="pointer-events-none absolute bottom-1 right-1 z-20 flex items-end opacity-70"
      style={{ gap: '1px' }}
      aria-hidden="true"
    >
      <Image
        src="/logos/logo-dark.png"
        alt=""
        width={14}
        height={14}
        className="shrink-0"
        style={{ width: '14px', height: '14px' }}
      />
      <span
        className="font-bold font-brand leading-none text-charcoal"
        style={{ fontSize: '10px', marginBottom: '0.5px' }}
      >
        osaiko
      </span>
    </div>
  );
}
