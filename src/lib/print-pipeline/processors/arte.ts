import { TILE_PRINT_SIZE } from '../../grid-config';
import type { ArteCustomization } from '../../customization-types';
import type { PrintJob, TileOutput } from '../types';
import { cropAndResize, splitIntoTiles } from '../utils/tile-splitter';
import { renderMultiTextToBuffer } from '../utils/text-renderer';

const TILE = TILE_PRINT_SIZE;

/**
 * Arte processor.
 * Grid is always 9 (3x3):
 *   - Tiles 0-7: photo split into 3x3 grid minus bottom-right
 *   - Tile 8 (bottom-right): black info tile with title, artist, year
 *
 * The photo is split as a full 3x3, but tile 8 is replaced with the info panel.
 */
export async function processArte(job: PrintJob): Promise<TileOutput[]> {
  const customization = job.customization as ArteCustomization;
  const { title, artist, year } = customization;

  // Step 1: Crop image and split into 3x3 (we only use first 8 tiles)
  const croppedBuffer = await cropAndResize(
    job.imageBuffer,
    job.cropArea,
    3 * TILE,
    3 * TILE,
  );

  const allTiles = await splitIntoTiles(croppedBuffer, 3, 3);

  // Step 2: Generate the info tile (tile 8, bottom-right)
  const infoTileBuffer = await renderInfoTile(title, artist, year);

  // Step 3: Assemble — first 8 photo tiles + info tile
  const tiles: TileOutput[] = [];

  for (let i = 0; i < 8; i++) {
    tiles.push({
      index: i,
      buffer: allTiles[i],
      filename: `${job.jobId}_arte_tile_${i}.png`,
    });
  }

  tiles.push({
    index: 8,
    buffer: infoTileBuffer,
    filename: `${job.jobId}_arte_tile_8.png`,
  });

  return tiles;
}

/**
 * Renders the black info tile with title, artist name, and year.
 * Museum/gallery label aesthetic.
 */
async function renderInfoTile(
  title: string,
  artist: string,
  year: string,
): Promise<Buffer> {
  const centerX = TILE / 2;

  return renderMultiTextToBuffer(
    [
      {
        text: title,
        x: centerX,
        y: TILE / 2 - 80,
        fontSize: 52,
        fontFamily: 'serif',
        color: '#FFFFFF',
        anchor: 'middle',
      },
      {
        text: artist,
        x: centerX,
        y: TILE / 2 + 20,
        fontSize: 38,
        fontFamily: 'sans-serif',
        color: '#CCCCCC',
        anchor: 'middle',
      },
      {
        text: year,
        x: centerX,
        y: TILE / 2 + 100,
        fontSize: 32,
        fontFamily: 'sans-serif',
        color: '#999999',
        anchor: 'middle',
      },
    ],
    TILE,
    TILE,
    '#000000',
  );
}
