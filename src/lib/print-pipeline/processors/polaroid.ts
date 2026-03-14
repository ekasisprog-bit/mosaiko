import sharp from 'sharp';
import { TILE_PRINT_SIZE } from '../../grid-config';
import type { PrintJob, TileOutput } from '../types';
import { cropAndResize } from '../utils/tile-splitter';

const TILE = TILE_PRINT_SIZE;

// Polaroid frame dimensions (within a TILE x TILE square)
// Classic Polaroid: thicker bottom border
const BORDER_TOP = 50;
const BORDER_SIDES = 50;
const BORDER_BOTTOM = 140; // Classic thick bottom for the Polaroid look

const PHOTO_WIDTH = TILE - BORDER_SIDES * 2;
const PHOTO_HEIGHT = TILE - BORDER_TOP - BORDER_BOTTOM;

/**
 * Polaroid processor.
 * Grid is always 4 (2x2):
 *   - Each tile: photo portion inside a white Polaroid-style frame
 *   - White border with thicker bottom (classic Polaroid)
 *   - Photo area is inset within the frame
 */
export async function processPolaroid(job: PrintJob): Promise<TileOutput[]> {
  // Step 1: Crop the full image for 2x2 splitting
  const croppedBuffer = await cropAndResize(
    job.imageBuffer,
    job.cropArea,
    2 * PHOTO_WIDTH,
    2 * PHOTO_HEIGHT,
  );

  // Step 2: Split the cropped photo into 2x2 tile-sized portions
  const photoPortions = await splitIntoPhotoPortions(croppedBuffer);

  // Step 3: Frame each photo portion in a Polaroid border
  const framedTiles = await Promise.all(
    photoPortions.map((photoBuffer) => framePolaroid(photoBuffer)),
  );

  // Step 4: Map to TileOutput
  return framedTiles.map((buffer, index) => ({
    index,
    buffer,
    filename: `${job.jobId}_polaroid_tile_${index}.png`,
  }));
}

/**
 * Splits the cropped photo into 4 portions sized for the Polaroid photo area.
 * Each portion will fill the photo area within the Polaroid frame.
 */
async function splitIntoPhotoPortions(
  croppedBuffer: Buffer,
): Promise<Buffer[]> {
  const totalWidth = 2 * PHOTO_WIDTH;
  const totalHeight = 2 * PHOTO_HEIGHT;

  // Resize to exact dimensions first
  const resized = await sharp(croppedBuffer)
    .resize(totalWidth, totalHeight, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const portions: Buffer[] = [];

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const portion = await sharp(resized)
        .extract({
          left: col * PHOTO_WIDTH,
          top: row * PHOTO_HEIGHT,
          width: PHOTO_WIDTH,
          height: PHOTO_HEIGHT,
        })
        .png()
        .toBuffer();

      portions.push(portion);
    }
  }

  return portions;
}

/**
 * Places a photo portion inside a white Polaroid frame.
 * Creates a TILE x TILE image with white background,
 * then composites the photo inset at the correct position.
 */
async function framePolaroid(photoBuffer: Buffer): Promise<Buffer> {
  // Add a subtle shadow/border for depth
  const shadowSvg = `<svg width="${TILE}" height="${TILE}" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer subtle shadow -->
    <rect x="4" y="4" width="${TILE - 8}" height="${TILE - 8}" rx="2" fill="none" stroke="#E0E0E0" stroke-width="2" />

    <!-- Inner photo border (thin line around photo area) -->
    <rect x="${BORDER_SIDES - 2}" y="${BORDER_TOP - 2}" width="${PHOTO_WIDTH + 4}" height="${PHOTO_HEIGHT + 4}" fill="none" stroke="#F0F0F0" stroke-width="1" />
  </svg>`;

  const shadowBuffer = await sharp(Buffer.from(shadowSvg))
    .resize(TILE, TILE)
    .png()
    .toBuffer();

  // Composite: white frame + shadow + photo
  const frameBuffer = await sharp({
    create: {
      width: TILE,
      height: TILE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  return sharp(frameBuffer)
    .composite([
      { input: shadowBuffer, blend: 'over' },
      {
        input: photoBuffer,
        top: BORDER_TOP,
        left: BORDER_SIDES,
        blend: 'over',
      },
    ])
    .png()
    .toBuffer();
}
