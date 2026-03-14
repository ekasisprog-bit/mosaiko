import type {
  ShopifyProduct,
  ShopifyCollection,
  ShopifyCart,
  ShopifyConnection,
  Product,
  Collection,
  Cart,
} from './types';

// ─── Connection flattener ───────────────────────────────────────────────────

/**
 * Flattens a Shopify edges/nodes connection into a plain array.
 */
export function flattenConnection<T>(connection: ShopifyConnection<T>): T[] {
  return connection.edges.map((edge) => edge.node);
}

// ─── Product reshaping ──────────────────────────────────────────────────────

/**
 * Converts a raw Shopify product (with edges/nodes) into a flat Product type.
 */
export function reshapeProduct(product: ShopifyProduct): Product {
  return {
    ...product,
    images: flattenConnection(product.images),
    variants: flattenConnection(product.variants),
  };
}

/**
 * Converts an array of raw Shopify products into flat Product types.
 * Filters out products without a handle (draft/unpublished).
 */
export function reshapeProducts(products: ShopifyProduct[]): Product[] {
  return products
    .filter((product) => product.handle)
    .map(reshapeProduct);
}

// ─── Collection reshaping ───────────────────────────────────────────────────

/**
 * Converts a raw Shopify collection into a flat Collection type.
 */
export function reshapeCollection(collection: ShopifyCollection): Collection {
  return {
    ...collection,
    products: reshapeProducts(flattenConnection(collection.products)),
  };
}

/**
 * Converts an array of raw Shopify collections into flat Collection types.
 */
export function reshapeCollections(
  collections: ShopifyCollection[]
): Collection[] {
  return collections
    .filter((collection) => collection.handle)
    .map(reshapeCollection);
}

// ─── Cart reshaping ─────────────────────────────────────────────────────────

/**
 * Converts a raw Shopify cart into a flat Cart type.
 */
export function reshapeCart(cart: ShopifyCart): Cart {
  return {
    ...cart,
    lines: flattenConnection(cart.lines),
  };
}
