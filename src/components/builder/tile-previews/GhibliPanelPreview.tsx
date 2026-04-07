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
 * Studio/Ghibli text panels.
 * PNG template background + Montserrat text centered in cream area.
 * Same simple approach as Spotify bar tiles.
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
      {/* PNG template background */}
      <img
        src={`/templates/studio/${tileNum}.png`}
        alt=""
        className="absolute inset-0 h-full w-full"
        style={{ objectFit: 'fill' }}
        draggable={false}
      />

      {isLeft ? (
        /* Left panel: year + studioText — left-aligned, centered vertically in cream area */
        <div
          className="absolute flex flex-col justify-center"
          style={{
            left: '5%',
            right: '8%',
            top: '20%',
            bottom: '15%',
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            color: '#2a2a2a',
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontSize: 'clamp(9px, 9%, 20px)', fontWeight: 400 }}>
            {year || '(Año)'}
          </div>
          <div style={{ fontSize: 'clamp(9px, 9%, 20px)', fontWeight: 400 }}>
            {studioText || 'STUDIO GHIBLI'}
          </div>
        </div>
      ) : (
        /* Right panel: japaneseText + title — right-aligned, centered vertically */
        <>
          <div
            className="absolute flex flex-col items-end justify-center"
            style={{
              left: '8%',
              right: '5%',
              top: '20%',
              bottom: '22%',
              fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
              color: '#2a2a2a',
              lineHeight: 1.5,
            }}
          >
            <div className="text-right" style={{ fontSize: 'clamp(9px, 9%, 20px)', fontWeight: 400 }}>
              {japaneseText || '(テキスト)'}
            </div>
            <div className="text-right" style={{ fontSize: 'clamp(9px, 9%, 20px)', fontWeight: 700 }}>
              {customText || '(Tu Texto)'}
            </div>
          </div>
          {/* Mosaiko logo at bottom-right, independent of text */}
          <img
            src="/logos/logo-negro.png"
            alt="Mosaiko"
            className="pointer-events-none absolute"
            style={{
              right: '5%',
              bottom: '5%',
              height: 'clamp(10px, 10%, 22px)',
              width: 'auto',
              opacity: 0.6,
            }}
            draggable={false}
          />
        </>
      )}
    </div>
  );
}
