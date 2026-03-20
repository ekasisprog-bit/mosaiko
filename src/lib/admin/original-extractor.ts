import sharp from 'sharp';
import type { SeamDetectionResult } from './seam-detection';

/**
 * Given a composite image with visible seams, extract the tiles and stitch
 * them back together without seam gaps — producing a clean "original" for
 * the print pipeline.
 */
export async function extractOriginal(
  compositeBuffer: Buffer,
  detection: SeamDetectionResult,
): Promise<Buffer> {
  const { imageWidth, imageHeight, seamPositions, seamWidthPercent } = detection;
  const halfSeamPx = Math.ceil((seamWidthPercent * Math.max(imageWidth, imageHeight)) / 2);

  // Compute tile pixel regions (excluding seam pixels)
  const xBounds = [0, ...seamPositions.vertical.map((v) => Math.round(v * imageWidth)), imageWidth];
  const yBounds = [0, ...seamPositions.horizontal.map((h) => Math.round(h * imageHeight)), imageHeight];

  const tiles: { buffer: Buffer; col: number; row: number; w: number; h: number }[] = [];

  for (let row = 0; row < yBounds.length - 1; row++) {
    for (let col = 0; col < xBounds.length - 1; col++) {
      // Inset by half seam width to exclude seam pixels
      const left = col === 0 ? 0 : xBounds[col] + halfSeamPx;
      const right = col === xBounds.length - 2 ? imageWidth : xBounds[col + 1] - halfSeamPx;
      const top = row === 0 ? 0 : yBounds[row] + halfSeamPx;
      const bottom = row === yBounds.length - 2 ? imageHeight : yBounds[row + 1] - halfSeamPx;

      const w = Math.max(1, right - left);
      const h = Math.max(1, bottom - top);

      const tileBuffer = await sharp(compositeBuffer)
        .extract({ left, top, width: w, height: h })
        .toBuffer();

      tiles.push({ buffer: tileBuffer, col, row, w, h });
    }
  }

  // Determine uniform tile size (use first tile's dimensions)
  const tileW = tiles[0].w;
  const tileH = tiles[0].h;
  const cols = xBounds.length - 1;
  const rows = yBounds.length - 1;

  // Resize all tiles to uniform size and composite them
  const resizedTiles = await Promise.all(
    tiles.map(async (tile) => ({
      input: await sharp(tile.buffer).resize(tileW, tileH, { fit: 'fill' }).toBuffer(),
      left: tile.col * tileW,
      top: tile.row * tileH,
    })),
  );

  return sharp({
    create: {
      width: cols * tileW,
      height: rows * tileH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite(resizedTiles)
    .png()
    .toBuffer();
}
