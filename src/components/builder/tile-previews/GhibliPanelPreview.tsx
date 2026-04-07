'use client';

interface GhibliPanelPreviewProps {
  label: 'ghibli-left' | 'ghibli-right';
  year?: string;
  japaneseText?: string;
  customText?: string;
  className?: string;
}

/**
 * Studio/Ghibli text panels using actual PNG template backgrounds.
 * PNG provides the cream bg + teal border at top.
 * Text overlaid with Montserrat font (client spec).
 *
 * Left panel (tile 5): year + "STUDIO GHIBLI" — left-aligned
 * Right panel (tile 6): Japanese text + title — right-aligned
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

function GhibliLeftPanel({
  year,
  className,
}: {
  year: string;
  className?: string;
}) {
  return (
    <div
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: '1' }}
    >
      {/* PNG template background (cream bg + teal border at top) */}
      <img
        src="/templates/studio/5.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Text: year + "STUDIO GHIBLI" — left-aligned, positioned at bottom of tile */}
      <div
        className="absolute flex flex-col justify-end"
        style={{
          left: '5%',
          bottom: '5%',
          right: '10%',
          top: '68%',
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          color: '#2a2a2a',
        }}
      >
        <span
          className="leading-tight"
          style={{ fontSize: 'clamp(11px, 12%, 26px)', fontWeight: 400 }}
        >
          {year || '(Año)'}
        </span>
        <span
          className="mt-[2%] leading-tight tracking-wide"
          style={{ fontSize: 'clamp(7px, 7.5%, 16px)', fontWeight: 500 }}
        >
          STUDIO GHIBLI
        </span>
      </div>
    </div>
  );
}

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
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: '1' }}
    >
      {/* PNG template background */}
      <img
        src="/templates/studio/6.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Text: Japanese + title — right-aligned, positioned at bottom of tile */}
      <div
        className="absolute flex flex-col items-end justify-end"
        style={{
          right: '5%',
          bottom: '5%',
          left: '10%',
          top: '62%',
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          color: '#2a2a2a',
        }}
      >
        <span
          className="leading-tight text-right"
          style={{ fontSize: 'clamp(7px, 7.5%, 16px)', fontWeight: 400 }}
        >
          {japaneseText || '(テキスト)'}
        </span>
        <span
          className="mt-[4%] text-right font-bold leading-tight tracking-wide"
          style={{ fontSize: 'clamp(7px, 7.5%, 16px)' }}
        >
          {customText || '(Tu Texto)'}
        </span>
      </div>
    </div>
  );
}
