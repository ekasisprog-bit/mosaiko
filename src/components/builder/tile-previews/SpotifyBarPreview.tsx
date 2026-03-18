'use client';

import { useMemo } from 'react';

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
 * Client-side SVG preview of the Spotify bar tiles.
 * Mirrors the print pipeline output from processors/spotify.ts.
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
  return <SpotifyBarRight songName={songName} className={className} />;
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
      className={['flex h-full w-full items-center overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: SPOTIFY_BLACK, aspectRatio: '1' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Play button */}
        <circle cx="18" cy="50" r="12" fill={SPOTIFY_GREEN} />
        <polygon points="15,44 15,56 24,50" fill={SPOTIFY_BLACK} />

        {/* Song name */}
        <text
          x="36"
          y="46"
          fill={SPOTIFY_WHITE}
          fontSize="9"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          {songName.length > 12 ? songName.slice(0, 12) + '…' : songName || '—'}
        </text>

        {/* Artist name */}
        <text
          x="36"
          y="60"
          fill={SPOTIFY_GRAY}
          fontSize="7"
          fontFamily="system-ui, sans-serif"
        >
          {artistName.length > 14 ? artistName.slice(0, 14) + '…' : artistName || '—'}
        </text>
      </svg>
    </div>
  );
}

function SpotifyBarRight({
  songName,
  className,
}: {
  songName: string;
  className?: string;
}) {
  // Generate deterministic waveform bars
  const bars = useMemo(() => {
    const result = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const seed = Math.sin(i * 0.7 + (songName?.length || 3)) * 0.5 + 0.5;
      const height = 5 + seed * 35;
      const isPlayed = i < count * 0.6;
      result.push({ x: 5 + i * 4.5, height, color: isPlayed ? SPOTIFY_GREEN : '#535353' });
    }
    return result;
  }, [songName]);

  return (
    <div
      className={['flex h-full w-full items-center overflow-hidden rounded-md', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: SPOTIFY_BLACK, aspectRatio: '1' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Waveform bars */}
        {bars.map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y={55 - bar.height}
            width="3"
            height={bar.height}
            rx="1"
            fill={bar.color}
          />
        ))}

        {/* Progress bar */}
        <rect x="5" y="70" width="90" height="2" rx="1" fill="#535353" />
        <rect x="5" y="70" width="54" height="2" rx="1" fill={SPOTIFY_GREEN} />
        <circle cx="59" cy="71" r="3" fill={SPOTIFY_GREEN} />

        {/* Timestamps */}
        <text x="5" y="82" fill={SPOTIFY_GRAY} fontSize="5" fontFamily="system-ui, sans-serif">2:14</text>
        <text x="95" y="82" fill={SPOTIFY_GRAY} fontSize="5" fontFamily="system-ui, sans-serif" textAnchor="end">3:45</text>
      </svg>
    </div>
  );
}
