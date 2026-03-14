import { shopifyFetch } from '../client';
import {
  reshapeCollection,
  reshapeCollections,
  reshapeProducts,
  flattenConnection,
} from '../reshape';
import type {
  ShopifyCollection,
  ShopifyProduct,
  ShopifyConnection,
  Collection,
  Product,
} from '../types';

// ─── Fragments ──────────────────────────────────────────────────────────────

const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    updatedAt
    image {
      url
      altText
      width
      height
    }
    seo {
      title
      description
    }
  }
`;

const COLLECTION_PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment CollectionProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    createdAt
    updatedAt
    options {
      id
      name
      values
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 20) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

// ─── Queries ────────────────────────────────────────────────────────────────

const GET_COLLECTIONS_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  query GetCollections {
    collections(first: 100) {
      edges {
        node {
          ...CollectionFields
          products(first: 0) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

const GET_COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  ${COLLECTION_PRODUCT_FRAGMENT}
  query GetCollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      ...CollectionFields
      products(first: 100) {
        edges {
          node {
            ...CollectionProductFields
          }
        }
      }
    }
  }
`;

const GET_COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  ${COLLECTION_PRODUCT_FRAGMENT}
  query GetCollectionProducts($handle: String!, $first: Int = 100) {
    collectionByHandle(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            ...CollectionProductFields
          }
        }
      }
    }
  }
`;

// ─── Fetchers ───────────────────────────────────────────────────────────────

/**
 * Fetches all collections (without their products).
 */
export async function getCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<{
    collections: ShopifyConnection<ShopifyCollection>;
  }>({
    query: GET_COLLECTIONS_QUERY,
    options: {
      next: { revalidate: 300, tags: ['collections'] },
    },
  });

  return reshapeCollections(flattenConnection(data.collections));
}

/**
 * Fetches a single collection by handle, including its products.
 */
export async function getCollectionByHandle(
  handle: string
): Promise<Collection | null> {
  const data = await shopifyFetch<{
    collectionByHandle: ShopifyCollection | null;
  }>({
    query: GET_COLLECTION_BY_HANDLE_QUERY,
    variables: { handle },
    options: {
      next: {
        revalidate: 120,
        tags: ['collections', `collection-${handle}`],
      },
    },
  });

  if (!data.collectionByHandle) return null;
  return reshapeCollection(data.collectionByHandle);
}

/**
 * Fetches products within a collection by handle.
 * Use this when you only need the products, not the collection metadata.
 */
export async function getCollectionProducts(
  handle: string,
  first: number = 100
): Promise<Product[]> {
  const data = await shopifyFetch<{
    collectionByHandle: {
      products: ShopifyConnection<ShopifyProduct>;
    } | null;
  }>({
    query: GET_COLLECTION_PRODUCTS_QUERY,
    variables: { handle, first },
    options: {
      next: {
        revalidate: 120,
        tags: ['collections', `collection-${handle}`],
      },
    },
  });

  if (!data.collectionByHandle) return [];

  return reshapeProducts(flattenConnection(data.collectionByHandle.products));
}
