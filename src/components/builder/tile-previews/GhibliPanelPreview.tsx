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
 * Studio/Ghibli text panels (tiles 5-6).
 * PNG template background + Montserrat text at print-pipeline-exact positions.
 *
 * Positioning derived from ghibli.ts SVG baseline → CSS top conversion:
 *   CSS top = (SVG_y - fontSize) / TILE
 *   Left:  year 75.9%, studioText 84.9%  (baseline 81%, 90%)
 *   Right: japaneseText 72.9%, customText 84.9%  (baseline 78%, 90%)
 *   Font:  42/827 = 5.08% of tile width → 5.08cqi
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

  const textStyle: React.CSSProperties = {
    fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
    fontSize: 'clamp(10px, 5.08cqi, 20px)',
    color: '#2a2a2a',
    lineHeight: 1,
  };

  return (
    <div
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: '1', backgroundColor: 'transparent', containerType: 'inline-size' }}
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
        /* Left panel: year + studioText — absolutely positioned to match print pipeline */
        <>
          <span
            className="absolute"
            style={{ ...textStyle, top: '75.9%', left: '5%', fontWeight: 400 }}
          >
            {year || '(Ano)'}
          </span>
          <span
            className="absolute"
            style={{ ...textStyle, top: '84.9%', left: '5%', fontWeight: 400 }}
          >
            {studioText || 'STUDIO GHIBLI'}
          </span>
        </>
      ) : (
        /* Right panel: japaneseText + customText — right-aligned */
        <>
          <span
            className="absolute text-right"
            style={{ ...textStyle, top: '72.9%', right: '5%', fontWeight: 400 }}
          >
            {japaneseText || '(テキスト)'}
          </span>
          <span
            className="absolute text-right"
            style={{ ...textStyle, top: '84.9%', right: '5%', fontWeight: 700 }}
          >
            {customText || '(Tu Texto)'}
          </span>
        </>
      )}
    </div>
  );
}
