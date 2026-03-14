import type { GridSize } from '../grid-config';

// ─── Variant ID mapping ────────────────────────────────────────────────────
//
// Maps grid sizes to Shopify variant GIDs.
// Populate SHOPIFY_VARIANT_MAP env var as JSON when store is created:
//   {"3":"gid://shopify/ProductVariant/123","4":"gid://...","6":"gid://...","9":"gid://..."}

let variantMap: Record<string, string> | null = null;

function loadVariantMap(): Record<string, string> {
  if (variantMap) return variantMap;

  const raw = process.env.SHOPIFY_VARIANT_MAP;
  if (!raw) {
    console.warn(
      '[variant-map] SHOPIFY_VARIANT_MAP not configured. ' +
      'Set it as JSON mapping grid sizes to Shopify variant GIDs.',
    );
    return {};
  }

  try {
    variantMap = JSON.parse(raw);
    return variantMap!;
  } catch {
    console.error('[variant-map] Failed to parse SHOPIFY_VARIANT_MAP as JSON');
    return {};
  }
}

/**
 * Returns the Shopify variant GID for a given grid size.
 * Returns null if not configured.
 */
export function getVariantId(gridSize: GridSize): string | null {
  const map = loadVariantMap();
  return map[String(gridSize)] ?? null;
}

/**
 * Checks if the variant map is configured.
 */
export function isVariantMapConfigured(): boolean {
  return !!process.env.SHOPIFY_VARIANT_MAP;
}
