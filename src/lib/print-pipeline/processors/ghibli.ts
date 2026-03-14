import { TILE_PRINT_SIZE } from '../../grid-config';
import type { GhibliCustomization } from '../../customization-types';
import type { PrintJob, TileOutput } from '../types';
import { cropAndResize, splitIntoTiles } from '../utils/tile-splitter';
import { renderMultiTextToBuffer } from '../utils/text-renderer';

const TILE = TILE_PRINT_SIZE;
const GHIBLI_DARK = '#1a1a2e';
const GHIBLI_ACCENT = '#e94560';
const GHIBLI_CREAM = '#f5e6d3';
const GHIBLI_GOLD = '#d4a373';

/**
 * Ghibli processor — film-poster aesthetic.
 * Grid is always 6 (3 rows x 2 cols):
 *   - Top 4 tiles (rows 0-1): 2x2 photo split
 *   - Bottom-left (tile 4): dark panel with year + Japanese text
 *   - Bottom-right (tile 5): dark panel with custom text
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

  // Step 2: Generate bottom-left panel (year + Japanese text)
  const bottomLeftBuffer = await renderGhibliLeftPanel(year, japaneseText);

  // Step 3: Generate bottom-right panel (custom text)
  const bottomRightBuffer = await renderGhibliRightPanel(customText);

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
 * - Large year number
 * - Japanese text below
 * - Decorative line separator
 * Film-poster dark aesthetic with warm accents
 */
async function renderGhibliLeftPanel(
  year: string,
  japaneseText: string,
): Promise<Buffer> {
  const centerX = TILE / 2;

  // Decorative elements: horizontal line, subtle border
  const lineY = TILE / 2 + 10;

  return renderMultiTextToBuffer(
    [
      // Year — large, bold
      {
        text: year,
        x: centerX,
        y: TILE / 2 - 60,
        fontSize: 96,
        fontFamily: 'serif',
        color: GHIBLI_CREAM,
        anchor: 'middle',
      },
      // Decorative dash
      {
        text: '\u2014\u2014\u2014',
        x: centerX,
        y: lineY,
        fontSize: 36,
        fontFamily: 'serif',
        color: GHIBLI_ACCENT,
        anchor: 'middle',
      },
      // Japanese text
      {
        text: japaneseText,
        x: centerX,
        y: TILE / 2 + 100,
        fontSize: 48,
        fontFamily: 'sans-serif',
        color: GHIBLI_GOLD,
        anchor: 'middle',
      },
    ],
    TILE,
    TILE,
    GHIBLI_DARK,
  );
}

/**
 * Renders the bottom-right Ghibli panel:
 * - Custom text (typically the film/title name)
 * - Decorative elements
 * Film-poster aesthetic
 */
async function renderGhibliRightPanel(customText: string): Promise<Buffer> {
  const centerX = TILE / 2;

  return renderMultiTextToBuffer(
    [
      // Decorative top element
      {
        text: '\u2605',
        x: centerX,
        y: TILE / 2 - 120,
        fontSize: 40,
        fontFamily: 'sans-serif',
        color: GHIBLI_ACCENT,
        anchor: 'middle',
      },
      // Main custom text
      {
        text: customText,
        x: centerX,
        y: TILE / 2,
        fontSize: 44,
        fontFamily: 'serif',
        color: GHIBLI_CREAM,
        anchor: 'middle',
      },
      // Decorative bottom element
      {
        text: '\u2014\u2014\u2014',
        x: centerX,
        y: TILE / 2 + 80,
        fontSize: 36,
        fontFamily: 'serif',
        color: GHIBLI_ACCENT,
        anchor: 'middle',
      },
    ],
    TILE,
    TILE,
    GHIBLI_DARK,
  );
}
