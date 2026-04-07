'use client';

interface SpotifyBarPreviewProps {
  label: 'spotify-bar-left' | 'spotify-bar-right';
  songName?: string;
  artistName?: string;
  className?: string;
}

/**
 * Spotify bar tile preview using actual PNG template backgrounds.
 * Left tile: song name + artist text + Spotify logo over dark template bg.
 * Right tile: Mosaiko white logo over dark template bg.
 */
export function SpotifyBarPreview({
  label,
  songName = '',
  artistName = '',
  className,
}: SpotifyBarPreviewProps) {
  if (label === 'spotify-bar-left') {
    return <SpotifyBarLeft songName={songName} artistName={artistName} className={className} />;
  }
  return <SpotifyBarRight className={className} />;
}

function SpotifyBarLeft({
  songName,
  artistName,
  className,
}: {
  songName: string;
  artistName: string;
  className?: string;
}) {
  return (
    <div
      className={['relative h-full w-full overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: '1' }}
    >
      {/* Template background PNG (dark with subtle M watermark pattern) */}
      <img
        src="/templates/spotify/5.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Song name + artist — positioned to match template */}
      <div
        className="absolute flex flex-col"
        style={{
          left: '10%',
          right: '6%',
          top: '28%',
          fontFamily: 'var(--font-source-sans), "Source Sans 3", sans-serif',
        }}
      >
        <span
          className="truncate font-bold leading-tight text-white"
          style={{ fontSize: 'clamp(13px, 14%, 30px)' }}
        >
          {songName || 'Tu Texto'}
        </span>
        <span
          className="mt-[5%] truncate leading-tight text-white/70"
          style={{ fontSize: 'clamp(9px, 10%, 22px)' }}
        >
          {artistName || 'Tu Texto'}
        </span>
      </div>

      {/* Spotify logo at bottom-left (actual PNG) */}
      <img
        src="/templates/spotify/logo-spotify.png"
        alt="Spotify"
        className="absolute"
        style={{
          left: '10%',
          bottom: '10%',
          height: 'clamp(10px, 12%, 24px)',
          width: 'auto',
        }}
        draggable={false}
      />
    </div>
  );
}

function SpotifyBarRight({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={['relative h-full w-full overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: '1' }}
    >
      {/* Template background PNG */}
      <img
        src="/templates/spotify/6.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Mosaiko white full logo at bottom-right */}
      <img
        src="/logos/logo-blanco.png"
        alt="Mosaiko"
        className="absolute"
        style={{
          right: '8%',
          bottom: '10%',
          height: 'clamp(8px, 10%, 20px)',
          width: 'auto',
          opacity: 0.85,
        }}
        draggable={false}
      />
    </div>
  );
}
