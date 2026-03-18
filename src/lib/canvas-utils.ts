import { TILE_PRINT_SIZE, type GridConfig } from './grid-config';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Loads an image from a URL/data URL and returns an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Gets the cropped region of the source image as a canvas.
 * When rotation is non-zero, the image is rotated first and the crop
 * coordinates are applied to the rotated result (matching react-easy-crop output).
 */
export function getCroppedCanvas(
  image: HTMLImageElement,
  cropArea: CropArea,
  outputWidth: number,
  outputHeight: number,
  rotation: number = 0,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (rotation === 0) {
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );
    return canvas;
  }

  // Rotate the full image onto a temp canvas, then crop from it
  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const { naturalWidth: w, naturalHeight: h } = image;

  const rotW = Math.round(w * cos + h * sin);
  const rotH = Math.round(w * sin + h * cos);

  const rotCanvas = document.createElement('canvas');
  rotCanvas.width = rotW;
  rotCanvas.height = rotH;
  const rotCtx = rotCanvas.getContext('2d')!;

  rotCtx.translate(rotW / 2, rotH / 2);
  rotCtx.rotate(radians);
  rotCtx.drawImage(image, -w / 2, -h / 2);

  ctx.drawImage(
    rotCanvas,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  rotCanvas.width = 0;
  rotCanvas.height = 0;

  return canvas;
}

/**
 * Splits a cropped image into grid tiles for printing.
 * Each tile is TILE_PRINT_SIZE × TILE_PRINT_SIZE pixels (7cm at 300dpi).
 * Returns an array of data URLs ordered left-to-right, top-to-bottom.
 */
export function splitImageIntoTiles(
  image: HTMLImageElement,
  cropArea: CropArea,
  grid: GridConfig,
  rotation: number = 0,
): string[] {
  const totalWidth = grid.cols * TILE_PRINT_SIZE;
  const totalHeight = grid.rows * TILE_PRINT_SIZE;

  // First, get the full cropped image at print resolution
  const fullCanvas = getCroppedCanvas(image, cropArea, totalWidth, totalHeight, rotation);
  const fullCtx = fullCanvas.getContext('2d')!;

  const tiles: string[] = [];

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = TILE_PRINT_SIZE;
      tileCanvas.height = TILE_PRINT_SIZE;
      const tileCtx = tileCanvas.getContext('2d')!;

      tileCtx.imageSmoothingEnabled = true;
      tileCtx.imageSmoothingQuality = 'high';

      tileCtx.drawImage(
        fullCanvas,
        col * TILE_PRINT_SIZE,
        row * TILE_PRINT_SIZE,
        TILE_PRINT_SIZE,
        TILE_PRINT_SIZE,
        0,
        0,
        TILE_PRINT_SIZE,
        TILE_PRINT_SIZE,
      );

      tiles.push(tileCanvas.toDataURL('image/jpeg', 0.95));
    }
  }

  // Clean up
  fullCanvas.width = 0;
  fullCanvas.height = 0;

  return tiles;
}

/**
 * Creates a preview image (lower resolution) of the split tiles
 * assembled in a grid with gaps, suitable for display.
 */
export function createPreviewCanvas(
  image: HTMLImageElement,
  cropArea: CropArea,
  grid: GridConfig,
  previewTileSize: number = 120,
  gap: number = 4,
  rotation: number = 0,
): HTMLCanvasElement {
  const totalWidth = grid.cols * previewTileSize + (grid.cols - 1) * gap;
  const totalHeight = grid.rows * previewTileSize + (grid.rows - 1) * gap;

  const croppedWidth = grid.cols * previewTileSize;
  const croppedHeight = grid.rows * previewTileSize;
  const croppedCanvas = getCroppedCanvas(image, cropArea, croppedWidth, croppedHeight, rotation);

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = totalWidth;
  previewCanvas.height = totalHeight;
  const ctx = previewCanvas.getContext('2d')!;

  // Fill with fridge-like background
  ctx.fillStyle = '#E8E2DA';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const srcX = col * previewTileSize;
      const srcY = row * previewTileSize;
      const destX = col * (previewTileSize + gap);
      const destY = row * (previewTileSize + gap);

      // Draw tile with rounded corners
      ctx.save();
      roundedRect(ctx, destX, destY, previewTileSize, previewTileSize, 4);
      ctx.clip();
      ctx.drawImage(
        croppedCanvas,
        srcX,
        srcY,
        previewTileSize,
        previewTileSize,
        destX,
        destY,
        previewTileSize,
        previewTileSize,
      );
      ctx.restore();
    }
  }

  return previewCanvas;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Validates image resolution for print quality.
 * Returns 'good' | 'medium' | 'low' based on the effective DPI
 * the image would achieve at the selected grid size.
 */
export function assessImageQuality(
  imageWidth: number,
  imageHeight: number,
  grid: GridConfig,
): 'good' | 'medium' | 'low' {
  const requiredWidth = grid.cols * TILE_PRINT_SIZE;
  const requiredHeight = grid.rows * TILE_PRINT_SIZE;

  const widthRatio = imageWidth / requiredWidth;
  const heightRatio = imageHeight / requiredHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  if (ratio >= 0.8) return 'good';
  if (ratio >= 0.5) return 'medium';
  return 'low';
}
