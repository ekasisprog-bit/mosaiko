import { TILE_PRINT_SIZE } from '../../grid-config';
import type { GhibliCustomization } from '../../customization-types';
import type { PrintJob, TileOutput } from '../types';
import { cropAndResize, splitIntoTiles } from '../utils/tile-splitter';
import { renderMultiTextToBuffer } from '../utils/text-renderer';

const TILE = TILE_PRINT_SIZE;
const GHIBLI_BG = '#EDE8E0';
const GHIBLI_TEXT = '#2a2a2a';

/**
 * Ghibli processor — clean, museum-like cream panels.
 * Grid is always 6 (3 rows x 2 cols):
 *   - Top 4 tiles (rows 0-1): 2x2 photo split
 *   - Bottom-left (tile 4): cream panel with year + "STUDIO GHIBLI"
 *   - Bottom-right (tile 5): cream panel with japaneseText + customText + Mosaiko
 */
export async function processGhibli(job: PrintJob): Promise<TileOutput[]> {
  const customization = job.customization as GhibliCustomization;
  const { year, japaneseText, customText } = customization;

  // Step 1: Crop and split photo into 2x2 (top 4 tiles)
  const croppedBuffer = await cropAndResize(
    job.imageBuffer,
    job.cropArea,
    2 * TILE,
    2 * TILE,
  );

  const photoTiles = await splitIntoTiles(croppedBuffer, 2, 2);

  // Step 2: Generate bottom-left panel (year + "STUDIO GHIBLI")
  const bottomLeftBuffer = await renderGhibliLeftPanel(year);

  // Step 3: Generate bottom-right panel (japaneseText + customText + Mosaiko)
  const bottomRightBuffer = await renderGhibliRightPanel(japaneseText, customText);

  // Step 4: Assemble all tiles
  const tiles: TileOutput[] = [
    ...photoTiles.map((buffer, index) => ({
      index,
      buffer,
      filename: `${job.jobId}_ghibli_tile_${index}.png`,
    })),
    {
      index: 4,
      buffer: bottomLeftBuffer,
      filename: `${job.jobId}_ghibli_tile_4.png`,
    },
    {
      index: 5,
      buffer: bottomRightBuffer,
      filename: `${job.jobId}_ghibli_tile_5.png`,
    },
  ];

  return tiles;
}

/**
 * Renders the bottom-left Ghibli panel:
 * - Large year number (left-aligned, upper area)
 * - "STUDIO GHIBLI" text below (left-aligned)
 * Cream background with dark text — clean, minimal.
 */
async function renderGhibliLeftPanel(year: string): Promise<Buffer> {
  const marginLeft = 70;

  return renderMultiTextToBuffer(
    [
      // Year — large, serif, left-aligned
      {
        text: year,
        x: marginLeft,
        y: Math.round(TILE * 0.42),
        fontSize: 120,
        fontFamily: 'Georgia, serif',
        color: GHIBLI_TEXT,
        anchor: 'start',
      },
      // STUDIO GHIBLI — smaller, sans-serif, left-aligned below year
      {
        text: 'STUDIO GHIBLI',
        x: marginLeft,
        y: Math.round(TILE * 0.58),
        fontSize: 48,
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: GHIBLI_TEXT,
        anchor: 'start',
      },
    ],
    TILE,
    TILE,
    GHIBLI_BG,
  );
}

/**
 * Renders the bottom-right Ghibli panel:
 * - Japanese text at top (left-aligned)
 * - Custom text / movie title below (left-aligned)
 * - "Mosaiko" small text at bottom-right
 * Cream background with dark text — clean, minimal.
 */
async function renderGhibliRightPanel(
  japaneseText: string,
  customText: string,
): Promise<Buffer> {
  const marginLeft = 70;

  return renderMultiTextToBuffer(
    [
      // Japanese text — top, left-aligned
      {
        text: japaneseText,
        x: marginLeft,
        y: Math.round(TILE * 0.38),
        fontSize: 52,
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: GHIBLI_TEXT,
        anchor: 'start',
      },
      // Custom text / movie title — below, left-aligned
      {
        text: customText,
        x: marginLeft,
        y: Math.round(TILE * 0.54),
        fontSize: 46,
        fontFamily: 'Georgia, serif',
        color: GHIBLI_TEXT,
        anchor: 'start',
      },
      // Mosaiko — small, bottom-right corner
      {
        text: 'Mosaiko',
        x: TILE - 70,
        y: TILE - 60,
        fontSize: 28,
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: GHIBLI_TEXT,
        anchor: 'end',
      },
    ],
    TILE,
    TILE,
    GHIBLI_BG,
  );
}
