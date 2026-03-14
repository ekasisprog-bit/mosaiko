import type { PrintJob, ProcessorResult, TileOutput } from './types';
import { processMosaicos } from './processors/mosaicos';
import { processSpotify } from './processors/spotify';
import { processFlores } from './processors/flores';
import { processSaveTheDate } from './processors/save-the-date';
import { processArte } from './processors/arte';
import { processGhibli } from './processors/ghibli';
import { processPolaroid } from './processors/polaroid';

// Re-export types for consumers
export type { PrintJob, ProcessorResult, TileOutput } from './types';
export type {
  TextRenderOptions,
  SharpFilterConfig,
  CSSFilterPreset,
} from './types';

// Re-export utilities
export { cropAndResize, splitIntoTiles } from './utils/tile-splitter';
export { renderTextToBuffer, renderMultiTextToBuffer } from './utils/text-renderer';
export { getFloresFilters, getFloresCSSFilters } from './utils/filter-presets';

/**
 * Main print pipeline orchestrator.
 * Routes a PrintJob to the correct processor based on the
 * categoryType discriminant in the customization config.
 *
 * @param job - The print job containing image buffer, customization, and crop area
 * @returns ProcessorResult with all generated 827x827 tiles
 */
export async function processPrintJob(
  job: PrintJob,
): Promise<ProcessorResult> {
  const { customization, jobId } = job;

  let tiles: TileOutput[];

  switch (customization.categoryType) {
    case 'mosaicos':
      tiles = await processMosaicos(job);
      break;
    case 'spotify':
      tiles = await processSpotify(job);
      break;
    case 'flores':
      tiles = await processFlores(job);
      break;
    case 'save-the-date':
      tiles = await processSaveTheDate(job);
      break;
    case 'arte':
      tiles = await processArte(job);
      break;
    case 'ghibli':
      tiles = await processGhibli(job);
      break;
    case 'polaroid':
      tiles = await processPolaroid(job);
      break;
    default: {
      // Exhaustive check — TypeScript will error if a categoryType is missed
      const _exhaustive: never = customization;
      throw new Error(
        `Unknown category type: ${(_exhaustive as { categoryType: string }).categoryType}`,
      );
    }
  }

  return {
    tiles,
    tileCount: tiles.length,
    categoryType: customization.categoryType,
    jobId,
  };
}
