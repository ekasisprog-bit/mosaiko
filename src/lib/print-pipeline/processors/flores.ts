import sharp from 'sharp';
import { GRID_CONFIGS, TILE_PRINT_SIZE } from '../../grid-config';
import type { FloresCustomization } from '../../customization-types';
import type { PrintJob, TileOutput, SharpFilterConfig } from '../types';
import { cropAndResize, splitIntoTiles } from '../utils/tile-splitter';
import { getFloresFilters } from '../utils/filter-presets';

/**
 * Flores processor.
 * All tiles contain the photo, but each tile gets different color filters
 * based on the selected theme. The center tile keeps the original image.
 */
export async function processFlores(job: PrintJob): Promise<TileOutput[]> {
  const customization = job.customization as FloresCustomization;
  const grid = GRID_CONFIGS[customization.gridSize];

  // Step 1: Crop the image to the user's selected area
  const croppedBuffer = await cropAndResize(
    job.imageBuffer,
    job.cropArea,
    grid.cols * TILE_PRINT_SIZE,
    grid.rows * TILE_PRINT_SIZE,
  );

  // Step 2: Split into tiles (all tiles get the photo)
  const tileBuffers = await splitIntoTiles(croppedBuffer, grid.rows, grid.cols);

  // Step 3: Get filter configs for the selected theme
  const filters = getFloresFilters(customization.theme, customization.gridSize);

  // Step 4: Apply filters to each tile
  const processedTiles = await Promise.all(
    tileBuffers.map((buffer, index) => {
      const filterConfig = filters.find((f) => f.tileIndex === index);
      if (!filterConfig || filterConfig.isOriginal) {
        return buffer; // Center tile stays unfiltered
      }
      return applySharpFilter(buffer, filterConfig);
    }),
  );

  // Step 5: Map to TileOutput
  return processedTiles.map((buffer, index) => ({
    index,
    buffer,
    filename: `${job.jobId}_flores_${customization.theme}_tile_${index}.png`,
  }));
}

/**
 * Applies a SharpFilterConfig to a tile buffer using Sharp's modulate and tint.
 */
async function applySharpFilter(
  buffer: Buffer,
  config: SharpFilterConfig,
): Promise<Buffer> {
  let pipeline = sharp(buffer);

  // Apply hue/saturation/brightness modulation
  if (
    config.hueRotation !== undefined ||
    config.saturation !== undefined ||
    config.brightness !== undefined
  ) {
    pipeline = pipeline.modulate({
      ...(config.hueRotation !== undefined && { hue: config.hueRotation }),
      ...(config.saturation !== undefined && { saturation: config.saturation }),
      ...(config.brightness !== undefined && { brightness: config.brightness }),
    });
  }

  // Apply color tint
  if (config.tint) {
    pipeline = pipeline.tint(config.tint);
  }

  // Apply slight blur (film grain/vintage effect)
  if (config.blur && config.blur > 0) {
    pipeline = pipeline.blur(config.blur);
  }

  return pipeline.png().toBuffer();
}
