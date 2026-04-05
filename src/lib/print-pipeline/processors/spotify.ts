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
 *     - Left: song name + artist name centered, Spotify logo at bottom-left
 *     - Right: solid black, Mosaiko logo at bottom-right
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

  // Step 2: Generate bottom-left tile (song info + Spotify logo)
  const bottomLeftBuffer = await renderBottomLeftTile(songName, artistName);

  // Step 3: Generate bottom-right tile (black + Mosaiko logo)
  const bottomRightBuffer = await renderBottomRightTile();

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
 * - Song name (large, white, bold) centered vertically in left area
 * - Artist name (smaller, gray) below song name
 * - Spotify green circle icon + "Spotify" text at bottom-left
 */
async function renderBottomLeftTile(
  songName: string,
  artistName: string,
): Promise<Buffer> {
  const textX = Math.round(TILE * 0.12);
  const songY = Math.round(TILE * 0.45);
  const artistY = Math.round(TILE * 0.55);

  // Spotify icon at bottom-left
  const iconSize = 28;
  const iconX = textX;
  const iconY = Math.round(TILE * 0.88);
  const iconCx = iconX + iconSize / 2;
  const iconCy = iconY + iconSize / 2;
  const iconR = iconSize / 2;

  const spotifyTextX = iconX + iconSize + 6;
  const spotifyTextY = iconY + iconSize - 4;

  const svg = `<svg width="${TILE}" height="${TILE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${TILE}" height="${TILE}" fill="${SPOTIFY_BLACK}" />

    <!-- Song name -->
    <text x="${textX}" y="${songY}" font-family="sans-serif" font-size="52" font-weight="bold" fill="${SPOTIFY_WHITE}" dominant-baseline="auto">${escapeXml(songName)}</text>

    <!-- Artist name -->
    <text x="${textX}" y="${artistY}" font-family="sans-serif" font-size="36" fill="${SPOTIFY_GRAY}" dominant-baseline="auto">${escapeXml(artistName)}</text>

    <!-- Spotify green circle icon -->
    <circle cx="${iconCx}" cy="${iconCy}" r="${iconR}" fill="${SPOTIFY_GREEN}" />
    <path d="M${iconCx - 7} ${iconCy - 4} Q${iconCx} ${iconCy - 7} ${iconCx + 8} ${iconCy - 3}" stroke="${SPOTIFY_BLACK}" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M${iconCx - 6} ${iconCy} Q${iconCx} ${iconCy - 2.5} ${iconCx + 6} ${iconCy + 1}" stroke="${SPOTIFY_BLACK}" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M${iconCx - 4.5} ${iconCy + 3.5} Q${iconCx} ${iconCy + 2} ${iconCx + 5} ${iconCy + 4.5}" stroke="${SPOTIFY_BLACK}" stroke-width="1.5" stroke-linecap="round" fill="none" />

    <!-- "Spotify" text -->
    <text x="${spotifyTextX}" y="${spotifyTextY}" font-family="sans-serif" font-size="24" font-weight="bold" fill="${SPOTIFY_WHITE}">${escapeXml('Spotify')}</text>
  </svg>`;

  return sharp(Buffer.from(svg))
    .resize(TILE, TILE)
    .png()
    .toBuffer();
}

/**
 * Renders the bottom-right Spotify bar tile:
 * - Solid black background
 * - "Mosaiko" text logo at bottom-right corner
 */
async function renderBottomRightTile(): Promise<Buffer> {
  const logoX = Math.round(TILE * 0.92);
  const logoY = Math.round(TILE * 0.92);

  const svg = `<svg width="${TILE}" height="${TILE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${TILE}" height="${TILE}" fill="${SPOTIFY_BLACK}" />

    <!-- Mosaiko logo text at bottom-right -->
    <text x="${logoX}" y="${logoY}" font-family="sans-serif" font-size="22" font-weight="bold" fill="${SPOTIFY_WHITE}" text-anchor="end" opacity="0.7">Mosaiko</text>
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
