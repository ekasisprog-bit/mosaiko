'use client';

export type TextPortion = 'save' | 'the' | 'date' | 'full' | 'date-only';

interface SaveTheDateOverlayProps {
  /** Which portion of the "Save The Date" text to display on this tile */
  textPortion?: TextPortion;
  /** The date string (e.g., "30.05.2026") — shown when textPortion is 'the', 'full', or 'date-only' */
  dateText?: string;
  /** @deprecated Use textPortion + dateText instead. Kept for backward compat with MagnetPreview. */
  eventText?: string;
  /** @deprecated Use dateText instead. Kept for backward compat with MagnetPreview. */
  date?: string;
  className?: string;
}

/**
 * Elegant semi-transparent overlay for Save the Date tiles.
 * Renders a light wash with white script text and subtle shadow.
 *
 * Usage per grid:
 *  - 9-piece (3x3): tile 0 = "save", tile 1 = "the" + date, tile 2 = "date"
 *  - 6-piece (3x2): tile 0 = "full" ("Save The Date"), tile 1 = "date-only"
 *  - 3-piece (1x3): tile 2 = "date-only"
 */
export function SaveTheDateOverlay({
  textPortion,
  dateText = '',
  eventText,
  date,
  className,
}: SaveTheDateOverlayProps) {
  // Backward compat: if called with old props (eventText/date) and no textPortion,
  // fall back to 'full' mode showing everything on one tile.
  const resolvedPortion: TextPortion = textPortion ?? 'full';
  const resolvedDate = dateText || date || '';

  // Legacy fallback: if no textPortion was provided and no eventText/date either, hide
  if (!textPortion && !eventText && !date) return null;

  return (
    <div
      className={[
        'absolute inset-0 flex flex-col items-center justify-center',
        'bg-white/25 backdrop-blur-[0.5px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Script text: Save / The / Date / Full */}
      {resolvedPortion === 'save' && (
        <span
          className="font-serif text-[clamp(12px,4vw,22px)] italic leading-tight text-white md:text-[clamp(16px,3vw,26px)]"
          style={{
            textShadow: '0 1px 4px rgba(0,0,0,0.45), 0 0px 1px rgba(0,0,0,0.3)',
            letterSpacing: '0.04em',
          }}
        >
          Save
        </span>
      )}

      {resolvedPortion === 'the' && (
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="font-serif text-[clamp(12px,4vw,22px)] italic leading-tight text-white md:text-[clamp(16px,3vw,26px)]"
            style={{
              textShadow: '0 1px 4px rgba(0,0,0,0.45), 0 0px 1px rgba(0,0,0,0.3)',
              letterSpacing: '0.04em',
            }}
          >
            The
          </span>
          {resolvedDate && (
            <span
              className="font-serif text-[clamp(7px,2.5vw,13px)] leading-tight tracking-wider text-white md:text-[clamp(9px,2vw,15px)]"
              style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              {resolvedDate}
            </span>
          )}
        </div>
      )}

      {resolvedPortion === 'date' && (
        <span
          className="font-serif text-[clamp(12px,4vw,22px)] italic leading-tight text-white md:text-[clamp(16px,3vw,26px)]"
          style={{
            textShadow: '0 1px 4px rgba(0,0,0,0.45), 0 0px 1px rgba(0,0,0,0.3)',
            letterSpacing: '0.04em',
          }}
        >
          Date
        </span>
      )}

      {resolvedPortion === 'full' && (
        <div className="flex flex-col items-center gap-1">
          <span
            className="font-serif text-[clamp(10px,3.5vw,20px)] italic leading-tight text-white md:text-[clamp(14px,2.5vw,24px)]"
            style={{
              textShadow: '0 1px 4px rgba(0,0,0,0.45), 0 0px 1px rgba(0,0,0,0.3)',
              letterSpacing: '0.04em',
            }}
          >
            Save The Date
          </span>
          {resolvedDate && (
            <span
              className="font-serif text-[clamp(7px,2.5vw,12px)] leading-tight tracking-wider text-white md:text-[clamp(9px,2vw,14px)]"
              style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              {resolvedDate}
            </span>
          )}
        </div>
      )}

      {resolvedPortion === 'date-only' && resolvedDate && (
        <span
          className="font-serif text-[clamp(8px,3vw,14px)] leading-tight tracking-wider text-white md:text-[clamp(10px,2vw,16px)]"
          style={{
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          {resolvedDate}
        </span>
      )}
    </div>
  );
}
