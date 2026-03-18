'use client';

interface ArteInfoPreviewProps {
  title?: string;
  artist?: string;
  year?: string;
  className?: string;
}

/**
 * Client-side SVG preview of the Arte info tile.
 * Mirrors the print pipeline output from processors/arte.ts.
 */
export function ArteInfoPreview({
  title = '',
  artist = '',
  year = '',
  className,
}: ArteInfoPreviewProps) {
  return (
    <div
      className={['flex h-full w-full items-center overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: '#000000', aspectRatio: '1' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Title */}
        <text
          x="50"
          y="38"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="bold"
          fontFamily="Georgia, serif"
          textAnchor="middle"
        >
          {title.length > 14 ? title.slice(0, 14) + '…' : title || '—'}
        </text>

        {/* Artist */}
        <text
          x="50"
          y="56"
          fill="#CCCCCC"
          fontSize="7"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
        >
          {artist.length > 16 ? artist.slice(0, 16) + '…' : artist || '—'}
        </text>

        {/* Year */}
        <text
          x="50"
          y="72"
          fill="#999999"
          fontSize="6"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
        >
          {year || '—'}
        </text>
      </svg>
    </div>
  );
}
