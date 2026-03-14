import type { GridSize } from '../../grid-config';
import type { FloresTheme } from '../../customization-types';
import type { SharpFilterConfig, CSSFilterPreset } from '../types';

// ─── Theme definitions ──────────────────────────────────────────────────────
// Each theme defines base Sharp operations. The center tile is always original.

interface ThemeBase {
  hueRotation: number;
  saturation: number;
  brightness: number;
  tint: { r: number; g: number; b: number };
  blur?: number;
}

const THEME_BASES: Record<FloresTheme, ThemeBase> = {
  calido: {
    hueRotation: 15,
    saturation: 1.3,
    brightness: 1.05,
    tint: { r: 240, g: 200, b: 150 },
  },
  fresco: {
    hueRotation: -20,
    saturation: 1.1,
    brightness: 1.0,
    tint: { r: 150, g: 180, b: 240 },
  },
  vintage: {
    hueRotation: 10,
    saturation: 0.6,
    brightness: 0.95,
    tint: { r: 210, g: 190, b: 160 },
    blur: 0.5,
  },
  pastel: {
    hueRotation: 0,
    saturation: 0.5,
    brightness: 1.15,
    tint: { r: 230, g: 220, b: 230 },
  },
};

// ─── Variation multipliers per tile position ────────────────────────────────
// These create subtle per-tile variation so not every tile looks identical.
// Values multiply the base theme settings for slight differentiation.

interface TileVariation {
  hueDelta: number;
  saturationMul: number;
  brightnessMul: number;
  tintBlend: number; // 0 = no tint, 1 = full tint
}

/**
 * Generates per-tile variations based on position in the grid.
 * Tiles closer to the center get weaker filters, outer tiles get stronger.
 */
function getTileVariation(
  tileIndex: number,
  rows: number,
  cols: number,
): TileVariation {
  const row = Math.floor(tileIndex / cols);
  const col = tileIndex % cols;

  // Distance from center (normalized 0-1)
  const centerRow = (rows - 1) / 2;
  const centerCol = (cols - 1) / 2;
  const maxDist = Math.sqrt(centerRow ** 2 + centerCol ** 2) || 1;
  const dist =
    Math.sqrt((row - centerRow) ** 2 + (col - centerCol) ** 2) / maxDist;

  // More distant tiles get stronger filter variation
  const intensity = 0.5 + dist * 0.5;

  return {
    hueDelta: (tileIndex % 3 === 0 ? -5 : tileIndex % 3 === 1 ? 5 : 0) * intensity,
    saturationMul: 0.9 + intensity * 0.2,
    brightnessMul: 0.95 + intensity * 0.1,
    tintBlend: intensity * 0.3,
  };
}

/**
 * Returns the center tile index for a given grid configuration.
 */
function getCenterTileIndex(gridSize: GridSize): number {
  switch (gridSize) {
    case 3:
      return 1; // 1x3 -> middle
    case 6:
      return 2; // 3x2 -> row 1, col 0 (upper-center area)
    case 9:
      return 4; // 3x3 -> center
    case 4:
      return 0; // 2x2 -> top-left (no true center)
    default:
      return 0;
  }
}

/**
 * Returns Sharp filter configurations for each tile in a Flores-themed grid.
 * The center tile always keeps the original unfiltered image.
 */
export function getFloresFilters(
  theme: FloresTheme,
  gridSize: GridSize,
): SharpFilterConfig[] {
  const base = THEME_BASES[theme];
  const cols = gridSize === 3 ? 3 : gridSize === 4 ? 2 : gridSize === 6 ? 2 : 3;
  const rows = gridSize / cols;
  const centerIndex = getCenterTileIndex(gridSize);

  const filters: SharpFilterConfig[] = [];

  for (let i = 0; i < gridSize; i++) {
    if (i === centerIndex) {
      filters.push({
        tileIndex: i,
        isOriginal: true,
      });
      continue;
    }

    const variation = getTileVariation(i, rows, cols);

    filters.push({
      tileIndex: i,
      hueRotation: base.hueRotation + variation.hueDelta,
      saturation: base.saturation * variation.saturationMul,
      brightness: base.brightness * variation.brightnessMul,
      tint: base.tint,
      blur: base.blur,
      isOriginal: false,
    });
  }

  return filters;
}

// ─── CSS equivalents for client-side preview ────────────────────────────────

const CSS_THEME_FILTERS: Record<FloresTheme, string> = {
  calido: 'sepia(0.3) saturate(1.3) brightness(1.05) hue-rotate(15deg)',
  fresco: 'saturate(1.1) hue-rotate(-20deg) brightness(1.0)',
  vintage: 'sepia(0.4) saturate(0.6) brightness(0.95) blur(0.5px)',
  pastel: 'saturate(0.5) brightness(1.15)',
};

/**
 * Returns CSS filter strings for client-side preview of Flores themes.
 * Center tile gets 'none', other tiles get the theme's CSS filter.
 */
export function getFloresCSSFilters(
  theme: FloresTheme,
  gridSize: GridSize,
): CSSFilterPreset[] {
  const cols = gridSize === 3 ? 3 : gridSize === 4 ? 2 : gridSize === 6 ? 2 : 3;
  const rows = gridSize / cols;
  const centerIndex = getCenterTileIndex(gridSize);
  const baseFilter = CSS_THEME_FILTERS[theme];

  const presets: CSSFilterPreset[] = [];

  for (let i = 0; i < gridSize; i++) {
    if (i === centerIndex) {
      presets.push({
        tileIndex: i,
        filter: 'none',
        isOriginal: true,
      });
    } else {
      // Add slight per-tile variation via hue-rotate offset
      const variation = getTileVariation(i, rows, cols);
      const hueOffset = variation.hueDelta;
      presets.push({
        tileIndex: i,
        filter: `${baseFilter} hue-rotate(${hueOffset}deg)`,
        isOriginal: false,
      });
    }
  }

  return presets;
}
