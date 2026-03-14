import sharp from 'sharp';
import { TILE_PRINT_SIZE } from '../../grid-config';
import type { SpotifyCustomization } from '../../customization-types';
import type { PrintJob, TileOutput } from '../types';
import { cropAndResize, splitIntoTiles } from '../utils/tile-splitter';

const SPOTIFY_BLACK = '#191414';
const SPOTIFY_GREEN = '#1DB954';
const SPOTIFY_WHITE = '#FFFFFF';
const SPOTIFY_GRAY = '#B3B3B3';
const TILE = TILE_PRINT_SIZE;

/**
 * Spotify processor.
 * Grid is always 6 (3 rows x 2 cols):
 *   - Top 4 tiles (rows 0-1): 2x2 photo split
 *   - Bottom 2 tiles (row 2): Spotify-style black bar with song info
 *     - Left: play button area + song/artist text
 *     - Right: waveform/progress area
 */
export async function processSpotify(job: PrintJob): Promise<TileOutput[]> {
  const customization = job.customization as SpotifyCustomization;
  const { songName, artistName } = customization;

  // Step 1: Crop and split photo into 2x2 (top 4 tiles)
  const croppedBuffer = await cropAndResize(
    job.imageBuffer,
    job.cropArea,
    2 * TILE,
    2 * TILE,
  );

  const photoTiles = await splitIntoTiles(croppedBuffer, 2, 2);

  // Step 2: Generate bottom-left tile (play button + song info)
  const bottomLeftBuffer = await renderBottomLeftTile(songName, artistName);

  // Step 3: Generate bottom-right tile (waveform/progress bar)
  const bottomRightBuffer = await renderBottomRightTile(songName);

  // Step 4: Assemble all tiles
  const tiles: TileOutput[] = [
    ...photoTiles.map((buffer, index) => ({
      index,
      buffer,
      filename: `${job.jobId}_spotify_tile_${index}.png`,
    })),
    {
      index: 4,
      buffer: bottomLeftBuffer,
      filename: `${job.jobId}_spotify_tile_4.png`,
    },
    {
      index: 5,
      buffer: bottomRightBuffer,
      filename: `${job.jobId}_spotify_tile_5.png`,
    },
  ];

  return tiles;
}

/**
 * Renders the bottom-left Spotify bar tile:
 * - Play button circle
 * - Song name
 * - Artist name (smaller, gray)
 */
async function renderBottomLeftTile(
  songName: string,
  artistName: string,
): Promise<Buffer> {
  // Build SVG with play button and text
  const playButtonCx = 120;
  const playButtonCy = TILE / 2;
  const playRadius = 60;

  // Triangle points for play button (pointing right)
  const triX = playButtonCx - 15;
  const triY1 = playButtonCy - 30;
  const triY2 = playButtonCy + 30;
  const triRight = playButtonCx + 25;

  const svg = `<svg width="${TILE}" height="${TILE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${TILE}" height="${TILE}" fill="${SPOTIFY_BLACK}" />

    <!-- Play button circle -->
    <circle cx="${playButtonCx}" cy="${playButtonCy}" r="${playRadius}" fill="${SPOTIFY_GREEN}" />

    <!-- Play triangle -->
    <polygon points="${triX},${triY1} ${triRight},${playButtonCy} ${triX},${triY2}" fill="${SPOTIFY_BLACK}" />

    <!-- Song name -->
    <text x="250" y="${TILE / 2 - 20}" font-family="sans-serif" font-size="48" font-weight="bold" fill="${SPOTIFY_WHITE}" text-anchor="start" dominant-baseline="auto">${escapeXml(songName)}</text>

    <!-- Artist name -->
    <text x="250" y="${TILE / 2 + 40}" font-family="sans-serif" font-size="36" fill="${SPOTIFY_GRAY}" text-anchor="start" dominant-baseline="auto">${escapeXml(artistName)}</text>
  </svg>`;

  return sharp(Buffer.from(svg))
    .resize(TILE, TILE)
    .png()
    .toBuffer();
}

/**
 * Renders the bottom-right Spotify bar tile:
 * - Waveform visualization (decorative bars)
 * - Progress bar at bottom
 * - Timestamp text
 */
async function renderBottomRightTile(songName: string): Promise<Buffer> {
  // Generate decorative waveform bars
  const barCount = 40;
  const barWidth = 12;
  const barGap = 6;
  const barStartX = 40;
  const barBaseY = TILE / 2 + 40;
  const maxBarHeight = 180;

  let waveBars = '';
  for (let i = 0; i < barCount; i++) {
    // Pseudo-random bar heights based on position
    const seed = Math.sin(i * 0.7 + songName.length) * 0.5 + 0.5;
    const height = 20 + seed * maxBarHeight;
    const x = barStartX + i * (barWidth + barGap);
    const y = barBaseY - height;

    // Bars before "playhead" are green, after are gray
    const isPlayed = i < barCount * 0.6;
    const color = isPlayed ? SPOTIFY_GREEN : '#535353';

    waveBars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="3" fill="${color}" />`;
  }

  // Progress bar
  const progressY = TILE - 120;
  const progressWidth = TILE - 80;
  const progressFill = progressWidth * 0.6;

  const svg = `<svg width="${TILE}" height="${TILE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${TILE}" height="${TILE}" fill="${SPOTIFY_BLACK}" />

    <!-- Waveform bars -->
    ${waveBars}

    <!-- Progress bar background -->
    <rect x="40" y="${progressY}" width="${progressWidth}" height="8" rx="4" fill="#535353" />

    <!-- Progress bar fill -->
    <rect x="40" y="${progressY}" width="${progressFill}" height="8" rx="4" fill="${SPOTIFY_GREEN}" />

    <!-- Progress dot -->
    <circle cx="${40 + progressFill}" cy="${progressY + 4}" r="12" fill="${SPOTIFY_GREEN}" />

    <!-- Timestamps -->
    <text x="40" y="${progressY + 50}" font-family="sans-serif" font-size="28" fill="${SPOTIFY_GRAY}">2:14</text>
    <text x="${TILE - 40}" y="${progressY + 50}" font-family="sans-serif" font-size="28" fill="${SPOTIFY_GRAY}" text-anchor="end">3:45</text>
  </svg>`;

  return sharp(Buffer.from(svg))
    .resize(TILE, TILE)
    .png()
    .toBuffer();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
