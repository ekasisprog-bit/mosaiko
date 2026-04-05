'use client';

import Image from 'next/image';

const SPOTIFY_BLACK = '#191414';
const SPOTIFY_GREEN = '#1DB954';
const SPOTIFY_WHITE = '#FFFFFF';
const SPOTIFY_GRAY = '#B3B3B3';

interface SpotifyBarPreviewProps {
  label: 'spotify-bar-left' | 'spotify-bar-right';
  songName?: string;
  artistName?: string;
  className?: string;
}

/**
 * Client-side preview of the Spotify bar tiles.
 * Mirrors the print pipeline output from processors/spotify.ts.
 *
 * Left tile: song name + artist name centered, Spotify logo at bottom-left.
 * Right tile: solid black, Mosaiko logo at bottom-right.
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
      className={['relative flex h-full w-full flex-col overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: SPOTIFY_BLACK, aspectRatio: '1' }}
    >
      {/* Song name + artist name — positioned in center-left area */}
      <div className="flex flex-1 flex-col justify-center px-[12%]">
        <span
          className="truncate font-bold leading-tight"
          style={{
            color: SPOTIFY_WHITE,
            fontSize: 'clamp(10px, 9%, 22px)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {songName || '\u2014'}
        </span>
        <span
          className="mt-[3%] truncate leading-tight"
          style={{
            color: SPOTIFY_GRAY,
            fontSize: 'clamp(7px, 6.5%, 16px)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {artistName || '\u2014'}
        </span>
      </div>

      {/* Spotify logo + text at bottom-left */}
      <div
        className="absolute bottom-[8%] left-[8%] flex items-center"
        style={{ gap: '3px' }}
      >
        {/* Spotify green circle with wave lines */}
        <svg
          viewBox="0 0 24 24"
          style={{ width: 'clamp(10px, 10%, 20px)', height: 'clamp(10px, 10%, 20px)' }}
          fill="none"
        >
          <circle cx="12" cy="12" r="12" fill={SPOTIFY_GREEN} />
          {/* Three curved lines */}
          <path
            d="M7 9.5c2.5-1 6.5-1 10 0.5"
            stroke={SPOTIFY_BLACK}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M8 12.5c2-0.8 5-0.8 7.5 0.3"
            stroke={SPOTIFY_BLACK}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M9.5 15.3c1.5-0.5 3.5-0.5 5.5 0.2"
            stroke={SPOTIFY_BLACK}
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span
          className="font-bold leading-none"
          style={{
            color: SPOTIFY_WHITE,
            fontSize: 'clamp(6px, 5.5%, 12px)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Spotify
        </span>
      </div>
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
      className={['relative flex h-full w-full overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: SPOTIFY_BLACK, aspectRatio: '1' }}
    >
      {/* Mosaiko logo at bottom-right */}
      <div
        className="absolute bottom-[8%] right-[8%] flex items-end opacity-70"
        style={{ gap: '1px' }}
      >
        <Image
          src="/logos/logo-dark.png"
          alt=""
          width={14}
          height={14}
          className="shrink-0"
          style={{ width: 'clamp(8px, 8%, 14px)', height: 'clamp(8px, 8%, 14px)' }}
          unoptimized
        />
        <span
          className="font-bold font-brand leading-none"
          style={{
            color: SPOTIFY_WHITE,
            fontSize: 'clamp(6px, 7%, 12px)',
            marginBottom: '0.5px',
          }}
        >
          osaiko
        </span>
      </div>
    </div>
  );
}
