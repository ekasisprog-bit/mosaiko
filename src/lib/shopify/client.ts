import type { ShopifyResponse } from './types';

// ─── Configuration ──────────────────────────────────────────────────────────

const SHOPIFY_API_VERSION = '2024-01';

function getStoreDomain(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!domain) {
    throw new Error(
      '[Shopify] Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable'
    );
  }
  return domain;
}

function getStorefrontToken(): string {
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  if (!token) {
    throw new Error(
      '[Shopify] Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN environment variable'
    );
  }
  return token;
}

function getAdminToken(): string {
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;
  if (!token) {
    throw new Error(
      '[Shopify] Missing SHOPIFY_ADMIN_API_TOKEN environment variable. ' +
        'This token is server-only and must not be exposed to the client.'
    );
  }
  return token;
}

// ─── Fetch options extending Next.js cache controls ─────────────────────────

export interface ShopifyFetchOptions {
  /** Next.js fetch cache mode */
  cache?: RequestCache;
  /** Next.js ISR / on-demand revalidation */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

// ─── Storefront API fetch ───────────────────────────────────────────────────

/**
 * Executes a GraphQL query against the Shopify Storefront API.
 * Safe to call from both server and client components (uses public token).
 */
export async function shopifyFetch<T>({
  query,
  variables,
  options = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
  options?: ShopifyFetchOptions;
}): Promise<T> {
  const domain = getStoreDomain();
  const endpoint = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': getStorefrontToken(),
    },
    body: JSON.stringify({ query, variables }),
    cache: options.cache,
    ...(options.next ? { next: options.next } : {}),
  } as RequestInit);

  if (!response.ok) {
    throw new Error(
      `[Shopify Storefront] HTTP ${response.status}: ${response.statusText}`
    );
  }

  const json: ShopifyResponse<T> = await response.json();

  if (json.errors?.length) {
    const messages = json.errors.map((e) => e.message).join('\n');
    throw new Error(`[Shopify Storefront] GraphQL errors:\n${messages}`);
  }

  return json.data;
}

// ─── Admin API fetch ────────────────────────────────────────────────────────

/**
 * Executes a GraphQL query against the Shopify Admin API.
 * Server-only — must only be called from API routes, server actions, or
 * server components. Never expose the admin token to the client.
 */
export async function shopifyAdminFetch<T>({
  query,
  variables,
  options = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
  options?: ShopifyFetchOptions;
}): Promise<T> {
  const domain = getStoreDomain();
  const endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': getAdminToken(),
    },
    body: JSON.stringify({ query, variables }),
    cache: options.cache,
    ...(options.next ? { next: options.next } : {}),
  } as RequestInit);

  if (!response.ok) {
    throw new Error(
      `[Shopify Admin] HTTP ${response.status}: ${response.statusText}`
    );
  }

  const json: ShopifyResponse<T> = await response.json();

  if (json.errors?.length) {
    const messages = json.errors.map((e) => e.message).join('\n');
    throw new Error(`[Shopify Admin] GraphQL errors:\n${messages}`);
  }

  return json.data;
}
