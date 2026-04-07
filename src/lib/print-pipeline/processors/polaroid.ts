import sharp from 'sharp';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { TILE_PRINT_SIZE } from '../../grid-config';
import type { PrintJob, TileOutput } from '../types';
import { cropAndResize, splitIntoTiles } from '../utils/tile-splitter';

const TILE = TILE_PRINT_SIZE;

// Path to the template PNGs (relative to project root)
const TEMPLATE_DIR = join(process.cwd(), 'mosaic-categories/polaroid/polaroid-template-PNGs');

/**
 * Polaroid processor — uses actual PNG templates from the client.
 *
 * Grid is always 4 (2x2):
 *   - Each tile: photo with PNG frame overlay composited on top
 *   - PNG has off-white Polaroid frame with transparent center
 *   - Tile 4 includes Mosaiko white logo in bottom-right thick border area
 */
export async function processPolaroid(job: PrintJob): Promise<TileOutput[]> {
  // Step 1: Crop and split photo into 2x2 tiles at full TILE size
  const croppedBuffer = await cropAndResize(
    job.imageBuffer,
    job.cropArea,
    2 * TILE,
    2 * TILE,
  );

  const photoTiles = await splitIntoTiles(croppedBuffer, 2, 2);

  // Step 2: Overlay PNG template frames on each photo tile
  const framedTiles = await Promise.all(
    photoTiles.map(async (photoBuffer, index) => {
      const templatePath = join(TEMPLATE_DIR, `${index + 1}.png`);
      const templateBuffer = await readFile(templatePath);
      const resizedTemplate = await sharp(templateBuffer)
        .resize(TILE, TILE, { fit: 'fill' })
        .png()
        .toBuffer();

      return sharp(photoBuffer)
        .composite([{ input: resizedTemplate }])
        .png()
        .toBuffer();
    }),
  );

  // Step 3: Map to TileOutput
  return framedTiles.map((buffer, index) => ({
    index,
    buffer,
    filename: `${job.jobId}_polaroid_tile_${index}.png`,
  }));
}
