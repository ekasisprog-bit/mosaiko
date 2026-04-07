'use client';

interface GhibliPanelPreviewProps {
  label: 'ghibli-left' | 'ghibli-right';
  year?: string;
  japaneseText?: string;
  customText?: string;
  className?: string;
}

/**
 * Studio/Ghibli text panels using PNG template backgrounds.
 *
 * Font: Montserrat (all text same size per client instructions).
 * Left panel: year (regular) + "STUDIO GHIBLI" (regular) — left-aligned at bottom.
 * Right panel: Japanese text (regular) + title (bold) — right-aligned at bottom.
 */
export function GhibliPanelPreview({
  label,
  year = '',
  japaneseText = '',
  customText = '',
  className,
}: GhibliPanelPreviewProps) {
  const isLeft = label === 'ghibli-left';
  const tileNum = isLeft ? 5 : 6;

  return (
    <div
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: '1' }}
    >
      {/* PNG template background (cream bg + teal border at top) */}
      <img
        src={`/templates/studio/${tileNum}.png`}
        alt=""
        className="absolute inset-0 h-full w-full"
        style={{ objectFit: 'fill' }}
        draggable={false}
      />

      {/* Text anchored to absolute bottom */}
      {isLeft ? (
        <div
          className="absolute"
          style={{
            left: '3%',
            bottom: '3%',
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            color: '#2a2a2a',
            lineHeight: 1.3,
          }}
        >
          <div style={{ fontSize: 'clamp(8px, 8%, 16px)', fontWeight: 400 }}>
            {year || '(Año)'}
          </div>
          <div style={{ fontSize: 'clamp(8px, 8%, 16px)', fontWeight: 400 }}>
            STUDIO GHIBLI
          </div>
        </div>
      ) : (
        <div
          className="absolute text-right"
          style={{
            right: '3%',
            bottom: '3%',
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            color: '#2a2a2a',
            lineHeight: 1.3,
          }}
        >
          <div style={{ fontSize: 'clamp(8px, 8%, 16px)', fontWeight: 400 }}>
            {japaneseText || '(テキスト)'}
          </div>
          <div style={{ fontSize: 'clamp(8px, 8%, 16px)', fontWeight: 700 }}>
            {customText || '(Tu Texto)'}
          </div>
          {/* Mosaiko logo */}
          <img
            src="/logos/logo-negro.png"
            alt="Mosaiko"
            className="mt-[4%] ml-auto"
            style={{ height: 'clamp(6px, 6%, 14px)', width: 'auto', opacity: 0.5 }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
