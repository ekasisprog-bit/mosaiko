import sharp from 'sharp';
import type { GridSize } from '@/lib/grid-config';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SeamDetectionResult {
  gridSize: GridSize;
  rows: number;
  cols: number;
  grid: string;           // "2x3", "3x3", etc.
  confidence: number;     // 0-1
  seamPositions: {
    vertical: number[];   // normalized 0-1 x positions
    horizontal: number[]; // normalized 0-1 y positions
  };
  seamWidthPercent: number;
  imageWidth: number;
  imageHeight: number;
}

interface GridCandidate {
  gridSize: GridSize;
  rows: number;
  cols: number;
  expectedAspect: number;
}

// ─── Grid candidates ────────────────────────────────────────────────────────

const GRID_CANDIDATES: GridCandidate[] = [
  { gridSize: 3, rows: 1, cols: 3, expectedAspect: 3.0 },
  { gridSize: 4, rows: 2, cols: 2, expectedAspect: 1.0 },
  { gridSize: 6, rows: 3, cols: 2, expectedAspect: 2 / 3 },
  { gridSize: 9, rows: 3, cols: 3, expectedAspect: 1.0 },
];

const ASPECT_TOLERANCE = 0.25;
const BAND_PERCENT = 0.04;    // search band ±4% of dimension around expected seam
const MIN_BAND_PX = 16;
const MIN_CONTRAST_DIFF = 25; // minimum absolute difference between seam and baseline

// ─── Main detection function ────────────────────────────────────────────────

export async function detectSeams(
  imageBuffer: Buffer,
  forceGrid?: { rows: number; cols: number; gridSize: GridSize },
): Promise<SeamDetectionResult> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width!;
  const height = metadata.height!;
  const aspect = width / height;

  let candidates: GridCandidate[];
  if (forceGrid) {
    candidates = [{ gridSize: forceGrid.gridSize, rows: forceGrid.rows, cols: forceGrid.cols, expectedAspect: forceGrid.cols / forceGrid.rows }];
  } else {
    candidates = GRID_CANDIDATES.filter((c) => {
      const ratio = aspect / c.expectedAspect;
      return ratio >= 1 - ASPECT_TOLERANCE && ratio <= 1 + ASPECT_TOLERANCE;
    });
    if (candidates.length === 0) {
      candidates = [...GRID_CANDIDATES];
    }
  }

  let bestResult: SeamDetectionResult | null = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const result = await analyzeCandidate(imageBuffer, width, height, candidate);
    if (result.confidence > bestScore) {
      bestScore = result.confidence;
      bestResult = result;
    }
  }

  return bestResult!;
}

// ─── Per-candidate analysis ─────────────────────────────────────────────────

async function analyzeCandidate(
  imageBuffer: Buffer,
  width: number,
  height: number,
  candidate: GridCandidate,
): Promise<SeamDetectionResult> {
  const { rows, cols, gridSize } = candidate;

  const verticalSeams: number[] = [];
  const verticalWidths: number[] = [];
  for (let i = 1; i < cols; i++) {
    const expectedX = Math.round(width * i / cols);
    const result = await findSeam(imageBuffer, width, height, 'vertical', expectedX);
    if (result) {
      verticalSeams.push(result.position / width);
      verticalWidths.push(result.width / width);
    }
  }

  const horizontalSeams: number[] = [];
  const horizontalWidths: number[] = [];
  for (let j = 1; j < rows; j++) {
    const expectedY = Math.round(height * j / rows);
    const result = await findSeam(imageBuffer, width, height, 'horizontal', expectedY);
    if (result) {
      horizontalSeams.push(result.position / height);
      horizontalWidths.push(result.width / height);
    }
  }

  const expectedSeams = (cols - 1) + (rows - 1);
  const detectedSeams = verticalSeams.length + horizontalSeams.length;
  const confidence = expectedSeams > 0 ? detectedSeams / expectedSeams : 1;

  const allWidths = [...verticalWidths, ...horizontalWidths];
  const avgWidth = allWidths.length > 0
    ? allWidths.reduce((a, b) => a + b, 0) / allWidths.length
    : 0.005;

  return {
    gridSize,
    rows,
    cols,
    grid: `${cols}x${rows}`,
    confidence,
    seamPositions: {
      vertical: verticalSeams,
      horizontal: horizontalSeams,
    },
    seamWidthPercent: avgWidth,
    imageWidth: width,
    imageHeight: height,
  };
}

// ─── Find a single seam (dark OR light) using mean brightness ───────────────

interface SeamResult {
  position: number;
  width: number;
}

async function findSeam(
  imageBuffer: Buffer,
  imgWidth: number,
  imgHeight: number,
  direction: 'vertical' | 'horizontal',
  expectedPos: number,
): Promise<SeamResult | null> {
  const dimension = direction === 'vertical' ? imgWidth : imgHeight;
  const bandHalf = Math.max(MIN_BAND_PX, Math.round(dimension * BAND_PERCENT));
  const bandStart = Math.max(0, expectedPos - bandHalf);
  const bandEnd = Math.min(dimension, expectedPos + bandHalf);

  let extractRegion: { left: number; top: number; width: number; height: number };
  if (direction === 'vertical') {
    extractRegion = { left: bandStart, top: 0, width: bandEnd - bandStart, height: imgHeight };
  } else {
    extractRegion = { left: 0, top: bandStart, width: imgWidth, height: bandEnd - bandStart };
  }

  if (extractRegion.width <= 0 || extractRegion.height <= 0) return null;

  const { data, info } = await sharp(imageBuffer)
    .extract(extractRegion)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bandSize = direction === 'vertical' ? info.width : info.height;
  const scanLength = direction === 'vertical' ? info.height : info.width;

  // Compute mean brightness for each scanline in the band
  const means: number[] = [];
  for (let s = 0; s < bandSize; s++) {
    let sum = 0;
    for (let p = 0; p < scanLength; p++) {
      const pixelIdx = direction === 'vertical'
        ? p * info.width + s
        : s * info.width + p;
      sum += data[pixelIdx];
    }
    means.push(sum / scanLength);
  }

  // Compute baseline from band edges (tile content)
  const edgeSamples = Math.min(4, Math.floor(bandSize / 4));
  let baselineSum = 0;
  let baselineCount = 0;
  for (let i = 0; i < edgeSamples; i++) {
    baselineSum += means[i] + means[bandSize - 1 - i];
    baselineCount += 2;
  }
  const baseline = baselineSum / baselineCount;

  // Find both the darkest and lightest scanlines
  let minMean = Infinity, minIdx = 0;
  let maxMean = -Infinity, maxIdx = 0;
  for (let i = 0; i < means.length; i++) {
    if (means[i] < minMean) { minMean = means[i]; minIdx = i; }
    if (means[i] > maxMean) { maxMean = means[i]; maxIdx = i; }
  }

  // Pick whichever has more contrast from baseline
  const darkContrast = baseline - minMean;
  const lightContrast = maxMean - baseline;

  let seamIdx: number;
  let seamMean: number;
  let contrast: number;

  if (darkContrast >= lightContrast) {
    seamIdx = minIdx;
    seamMean = minMean;
    contrast = darkContrast;
  } else {
    seamIdx = maxIdx;
    seamMean = maxMean;
    contrast = lightContrast;
  }

  // Must have sufficient contrast
  if (contrast < MIN_CONTRAST_DIFF) return null;

  // Measure seam width using the appropriate threshold
  const isDark = darkContrast >= lightContrast;
  const threshold = isDark
    ? baseline - contrast * 0.5  // scanlines darker than half the contrast
    : baseline + contrast * 0.5; // scanlines lighter than half the contrast

  let seamStart = seamIdx;
  let seamEnd = seamIdx;

  if (isDark) {
    while (seamStart > 0 && means[seamStart - 1] < threshold) seamStart--;
    while (seamEnd < means.length - 1 && means[seamEnd + 1] < threshold) seamEnd++;
  } else {
    while (seamStart > 0 && means[seamStart - 1] > threshold) seamStart--;
    while (seamEnd < means.length - 1 && means[seamEnd + 1] > threshold) seamEnd++;
  }

  const seamCenter = bandStart + Math.round((seamStart + seamEnd) / 2);
  const seamWidth = seamEnd - seamStart + 1;

  return { position: seamCenter, width: seamWidth };
}
