'use client';

const GHIBLI_BG = '#EDE8E0';
const GHIBLI_TEXT = '#2a2a2a';

interface GhibliPanelPreviewProps {
  label: 'ghibli-left' | 'ghibli-right';
  year?: string;
  japaneseText?: string;
  customText?: string;
  className?: string;
}

/**
 * Client-side SVG preview of the Ghibli text panels.
 * Cream background with dark text — clean, museum-like aesthetic.
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
    return <GhibliLeftPanel year={year} className={className} />;
  }
  return <GhibliRightPanel japaneseText={japaneseText} customText={customText} className={className} />;
}

/**
 * Bottom-left panel: Year (large) + "STUDIO GHIBLI" (smaller).
 * Left-aligned, cream background.
 */
function GhibliLeftPanel({
  year,
  className,
}: {
  year: string;
  className?: string;
}) {
  return (
    <div
      className={['flex h-full w-full items-center overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: GHIBLI_BG, aspectRatio: '1' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Year — large, left-aligned */}
        <text
          x="12"
          y="42"
          fill={GHIBLI_TEXT}
          fontSize="22"
          fontWeight="bold"
          fontFamily="Georgia, 'Times New Roman', serif"
          textAnchor="start"
        >
          {year || ''}
        </text>

        {/* STUDIO GHIBLI — smaller, left-aligned below year */}
        <text
          x="12"
          y="58"
          fill={GHIBLI_TEXT}
          fontSize="8"
          fontWeight="500"
          fontFamily="system-ui, 'Helvetica Neue', sans-serif"
          textAnchor="start"
          letterSpacing="0.5"
        >
          STUDIO GHIBLI
        </text>
      </svg>
    </div>
  );
}

/**
 * Bottom-right panel: japaneseText (top) + customText (below) + Mosaiko logo (bottom-right).
 * Left-aligned, cream background.
 */
function GhibliRightPanel({
  japaneseText,
  customText,
  className,
}: {
  japaneseText: string;
  customText: string;
  className?: string;
}) {
  return (
    <div
      className={['flex h-full w-full items-center overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: GHIBLI_BG, aspectRatio: '1' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Japanese text — top, left-aligned */}
        <text
          x="12"
          y="38"
          fill={GHIBLI_TEXT}
          fontSize="9"
          fontFamily="system-ui, 'Helvetica Neue', sans-serif"
          textAnchor="start"
        >
          {japaneseText.length > 10 ? japaneseText.slice(0, 10) + '\u2026' : japaneseText || ''}
        </text>

        {/* Custom text / movie title — below Japanese text, left-aligned */}
        <text
          x="12"
          y="54"
          fill={GHIBLI_TEXT}
          fontSize="8"
          fontWeight="500"
          fontFamily="Georgia, 'Times New Roman', serif"
          textAnchor="start"
        >
          {customText.length > 14 ? customText.slice(0, 14) + '\u2026' : customText || ''}
        </text>

        {/* Mosaiko — small, bottom-right */}
        <text
          x="88"
          y="90"
          fill={GHIBLI_TEXT}
          fontSize="5"
          fontFamily="system-ui, 'Helvetica Neue', sans-serif"
          textAnchor="end"
          opacity="0.5"
        >
          Mosaiko
        </text>
      </svg>
    </div>
  );
}
