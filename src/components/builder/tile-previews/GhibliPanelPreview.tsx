'use client';

interface GhibliPanelPreviewProps {
  label: 'ghibli-left' | 'ghibli-right';
  year?: string;
  japaneseText?: string;
  customText?: string;
  studioText?: string;
  className?: string;
}

/**
 * Studio/Ghibli text panels using PNG template backgrounds.
 * Text centered vertically within the cream area (below teal strip).
 * Font: Montserrat, all same size 11 per client instructions.
 */
export function GhibliPanelPreview({
  label,
  year = '',
  japaneseText = '',
  customText = '',
  studioText = '',
  className,
}: GhibliPanelPreviewProps) {
  const isLeft = label === 'ghibli-left';
  const tileNum = isLeft ? 5 : 6;

  return (
    <div
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: '1' }}
    >
      {/* PNG template (cream bg + teal border at top, transparent strip) */}
      <img
        src={`/templates/studio/${tileNum}.png`}
        alt=""
        className="absolute inset-0 h-full w-full"
        style={{ objectFit: 'fill' }}
        draggable={false}
      />

      {/* Text centered vertically within cream area (below ~15% teal strip) */}
      {isLeft ? (
        <div
          className="absolute flex flex-col justify-center"
          style={{
            left: '5%',
            right: '10%',
            top: '18%',
            bottom: '10%',
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            color: '#2a2a2a',
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: 'clamp(8px, 8%, 16px)', fontWeight: 400 }}>
            {year || '(Año)'}
          </div>
          <div style={{ fontSize: 'clamp(8px, 8%, 16px)', fontWeight: 400 }}>
            {studioText || 'STUDIO GHIBLI'}
          </div>
        </div>
      ) : (
        <div
          className="absolute flex flex-col items-end justify-center"
          style={{
            left: '10%',
            right: '5%',
            top: '18%',
            bottom: '10%',
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            color: '#2a2a2a',
            lineHeight: 1.4,
          }}
        >
          <div className="text-right" style={{ fontSize: 'clamp(8px, 8%, 16px)', fontWeight: 400 }}>
            {japaneseText || '(テキスト)'}
          </div>
          <div className="text-right" style={{ fontSize: 'clamp(8px, 8%, 16px)', fontWeight: 700 }}>
            {customText || '(Tu Texto)'}
          </div>
          <img
            src="/logos/logo-negro.png"
            alt="Mosaiko"
            className="mt-[6%]"
            style={{ height: 'clamp(6px, 6%, 14px)', width: 'auto', opacity: 0.5 }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
