import sharp from 'sharp';
import { GRID_CONFIGS, TILE_PRINT_SIZE } from '../../grid-config';
import type { SaveTheDateCustomization } from '../../customization-types';
import type { PrintJob, TileOutput } from '../types';
import { cropAndResize, splitIntoTiles } from '../utils/tile-splitter';

const TILE = TILE_PRINT_SIZE;

/**
 * Save the Date processor.
 * All tiles are the photo split normally, with text overlays
 * (eventText + date) composited onto specific tiles.
 * A semi-transparent background behind the text ensures readability.
 */
export async function processSaveTheDate(
  job: PrintJob,
): Promise<TileOutput[]> {
  const customization = job.customization as SaveTheDateCustomization;
  const grid = GRID_CONFIGS[customization.gridSize];

  // Step 1: Crop and split the full image
  const croppedBuffer = await cropAndResize(
    job.imageBuffer,
    job.cropArea,
    grid.cols * TILE,
    grid.rows * TILE,
  );

  const tileBuffers = await splitIntoTiles(croppedBuffer, grid.rows, grid.cols);

  // Step 2: Determine which tiles get text overlays
  const textTileIndices = getTextTileIndices(customization.gridSize);

  // Step 3: Group overlays by tile index and apply sequentially
  const overlaysByTile = new Map<number, TextTileConfig[]>();
  for (const config of textTileIndices) {
    const existing = overlaysByTile.get(config.index) ?? [];
    existing.push(config);
    overlaysByTile.set(config.index, existing);
  }

  // Step 4: Apply text overlays to the designated tiles
  const processedTiles = await Promise.all(
    tileBuffers.map(async (buffer, index) => {
      const overlays = overlaysByTile.get(index);
      if (!overlays) return buffer;

      // Apply each overlay sequentially to this tile
      let result = buffer;
      for (const textConfig of overlays) {
        result = await applyTextOverlay(
          result,
          textConfig.text === 'event'
            ? customization.eventText
            : customization.date,
          textConfig.fontSize,
          textConfig.y,
        );
      }
      return result;
    }),
  );

  return processedTiles.map((buffer, index) => ({
    index,
    buffer,
    filename: `${job.jobId}_save-the-date_tile_${index}.png`,
  }));
}

interface TextTileConfig {
  index: number;
  text: 'event' | 'date';
  fontSize: number;
  y: number; // vertical position within the tile
}

/**
 * Returns which tiles get text overlays based on grid size.
 * Places event text on an upper tile and date on a lower tile.
 */
function getTextTileIndices(gridSize: 3 | 6 | 9): TextTileConfig[] {
  switch (gridSize) {
    case 3:
      // 1x3 grid: event text on center tile, date below it
      return [
        { index: 1, text: 'event', fontSize: 56, y: TILE / 2 - 40 },
        { index: 1, text: 'date', fontSize: 44, y: TILE / 2 + 60 },
      ];
    case 6:
      // 3x2 grid: event text on tile 2 (row 1 left), date on tile 3 (row 1 right)
      return [
        { index: 2, text: 'event', fontSize: 52, y: TILE / 2 },
        { index: 3, text: 'date', fontSize: 44, y: TILE / 2 },
      ];
    case 9:
      // 3x3 grid: event text on center tile (4), date on bottom center (7)
      return [
        { index: 4, text: 'event', fontSize: 56, y: TILE / 2 },
        { index: 7, text: 'date', fontSize: 44, y: TILE / 2 },
      ];
    default:
      return [];
  }
}

/**
 * Composites text with a semi-transparent background onto a tile.
 */
async function applyTextOverlay(
  tileBuffer: Buffer,
  text: string,
  fontSize: number,
  yPosition: number,
): Promise<Buffer> {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  // Estimate text dimensions for background box
  const textWidth = Math.min(TILE - 60, escapedText.length * fontSize * 0.55);
  const textHeight = fontSize * 1.8;
  const bgX = (TILE - textWidth) / 2 - 20;
  const bgY = yPosition - fontSize - 10;
  const bgWidth = textWidth + 40;
  const bgHeight = textHeight + 20;

  const overlaySvg = `<svg width="${TILE}" height="${TILE}" xmlns="http://www.w3.org/2000/svg">
    <!-- Semi-transparent background -->
    <rect x="${bgX}" y="${bgY}" width="${bgWidth}" height="${bgHeight}" rx="12" fill="rgba(0,0,0,0.55)" />

    <!-- Text -->
    <text x="${TILE / 2}" y="${yPosition}" font-family="serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="auto">${escapedText}</text>
  </svg>`;

  const overlayBuffer = await sharp(Buffer.from(overlaySvg))
    .resize(TILE, TILE)
    .png()
    .toBuffer();

  return sharp(tileBuffer)
    .composite([{ input: overlayBuffer, blend: 'over' }])
    .png()
    .toBuffer();
}
