'use client';

const GHIBLI_DARK = '#1a1a2e';
const GHIBLI_ACCENT = '#e94560';
const GHIBLI_CREAM = '#f5e6d3';
const GHIBLI_GOLD = '#d4a373';

interface GhibliPanelPreviewProps {
  label: 'ghibli-left' | 'ghibli-right';
  year?: string;
  japaneseText?: string;
  customText?: string;
  className?: string;
}

/**
 * Client-side SVG preview of the Ghibli text panels.
 * Mirrors the print pipeline output from processors/ghibli.ts.
 */
export function GhibliPanelPreview({
  label,
  year = '',
  japaneseText = '',
  customText = '',
  className,
}: GhibliPanelPreviewProps) {
  if (label === 'ghibli-left') {
    return <GhibliLeftPanel year={year} japaneseText={japaneseText} className={className} />;
  }
  return <GhibliRightPanel customText={customText} className={className} />;
}

function GhibliLeftPanel({
  year,
  japaneseText,
  className,
}: {
  year: string;
  japaneseText: string;
  className?: string;
}) {
  return (
    <div
      className={['flex h-full w-full items-center overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: GHIBLI_DARK, aspectRatio: '1' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Year */}
        <text
          x="50"
          y="38"
          fill={GHIBLI_CREAM}
          fontSize="18"
          fontWeight="bold"
          fontFamily="Georgia, serif"
          textAnchor="middle"
        >
          {year || '—'}
        </text>

        {/* Decorative line */}
        <text
          x="50"
          y="52"
          fill={GHIBLI_ACCENT}
          fontSize="8"
          fontFamily="serif"
          textAnchor="middle"
        >
          ———
        </text>

        {/* Decorative text */}
        <text
          x="50"
          y="70"
          fill={GHIBLI_GOLD}
          fontSize="9"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
        >
          {japaneseText.length > 10 ? japaneseText.slice(0, 10) + '…' : japaneseText || '—'}
        </text>
      </svg>
    </div>
  );
}

function GhibliRightPanel({
  customText,
  className,
}: {
  customText: string;
  className?: string;
}) {
  return (
    <div
      className={['flex h-full w-full items-center overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: GHIBLI_DARK, aspectRatio: '1' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Star */}
        <text
          x="50"
          y="30"
          fill={GHIBLI_ACCENT}
          fontSize="10"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          ★
        </text>

        {/* Custom text */}
        <text
          x="50"
          y="55"
          fill={GHIBLI_CREAM}
          fontSize="8"
          fontFamily="Georgia, serif"
          textAnchor="middle"
        >
          {customText.length > 12 ? customText.slice(0, 12) + '…' : customText || '—'}
        </text>

        {/* Decorative line */}
        <text
          x="50"
          y="72"
          fill={GHIBLI_ACCENT}
          fontSize="8"
          fontFamily="serif"
          textAnchor="middle"
        >
          ———
        </text>
      </svg>
    </div>
  );
}
