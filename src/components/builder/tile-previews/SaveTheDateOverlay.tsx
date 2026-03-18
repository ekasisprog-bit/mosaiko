'use client';

interface SaveTheDateOverlayProps {
  eventText?: string;
  date?: string;
  className?: string;
}

/**
 * Semi-transparent overlay with event text and date.
 * Applied on top of photo tiles for Save the Date category.
 */
export function SaveTheDateOverlay({
  eventText = '',
  date = '',
  className,
}: SaveTheDateOverlayProps) {
  // Only show overlay on certain tiles (e.g., center tile or overlay area)
  if (!eventText && !date) return null;

  return (
    <div className={['absolute inset-0 flex flex-col items-center justify-center', className].filter(Boolean).join(' ')}>
      <div className="flex flex-col items-center gap-0.5 rounded-md bg-black/40 px-2 py-1.5 backdrop-blur-[1px]">
        {eventText && (
          <span className="text-[8px] font-bold leading-tight text-white drop-shadow-sm md:text-[10px]">
            {eventText.length > 16 ? eventText.slice(0, 16) + '…' : eventText}
          </span>
        )}
        {date && (
          <span className="text-[6px] leading-tight text-white/80 drop-shadow-sm md:text-[8px]">
            {date}
          </span>
        )}
      </div>
    </div>
  );
}
