import type { CategoryCustomization } from '../customization-types';
import type { CropArea } from '../canvas-utils';

// ─── Print job input ────────────────────────────────────────────────────────

export interface PrintJob {
  /** Raw image buffer (PNG/JPEG) */
  imageBuffer: Buffer;
  /** Customization config from the builder (discriminated union) */
  customization: CategoryCustomization;
  /** Crop area selected by the user */
  cropArea: CropArea;
  /** Unique order/job identifier for filename generation */
  jobId: string;
}

// ─── Single tile output ─────────────────────────────────────────────────────

export interface TileOutput {
  /** Zero-based tile index (left-to-right, top-to-bottom) */
  index: number;
  /** Print-ready 827x827 PNG buffer */
  buffer: Buffer;
  /** Filename for storage, e.g. "job123_tile_0.png" */
  filename: string;
}

// ─── Processor result ───────────────────────────────────────────────────────

export interface ProcessorResult {
  /** All generated tiles for this print job */
  tiles: TileOutput[];
  /** Total number of tiles */
  tileCount: number;
  /** Category type that was processed */
  categoryType: CategoryCustomization['categoryType'];
  /** Job identifier */
  jobId: string;
}

// ─── Text rendering options (for SVG → Sharp text generation) ───────────────

export interface TextRenderOptions {
  text: string;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  padding?: number;
}

// ─── Sharp filter config (for Flores theme filters) ─────────────────────────

export interface SharpFilterConfig {
  tileIndex: number;
  /** Hue rotation in degrees */
  hueRotation?: number;
  /** Saturation multiplier (1.0 = no change) */
  saturation?: number;
  /** Brightness multiplier (1.0 = no change) */
  brightness?: number;
  /** RGB tint to apply */
  tint?: { r: number; g: number; b: number };
  /** Whether to apply a slight blur (film grain effect) */
  blur?: number;
  /** Whether this tile keeps the original unfiltered image */
  isOriginal?: boolean;
}

// ─── CSS filter equivalent (for client-side preview) ────────────────────────

export interface CSSFilterPreset {
  tileIndex: number;
  filter: string;
  isOriginal?: boolean;
}
