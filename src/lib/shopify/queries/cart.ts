import { shopifyFetch } from '../client';
import { reshapeCart } from '../reshape';
import type { ShopifyCart, Cart } from '../types';

// ─── Fragments ──────────────────────────────────────────────────────────────

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    attributes {
      key
      value
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            amountPerQuantity {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              product {
                id
                handle
                title
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Queries ────────────────────────────────────────────────────────────────

const GET_CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

// ─── Fetchers ───────────────────────────────────────────────────────────────

/**
 * Fetches a cart by its ID. Returns null if the cart does not exist
 * (e.g., expired or invalid ID).
 */
export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{
    cart: ShopifyCart | null;
  }>({
    query: GET_CART_QUERY,
    variables: { cartId },
    options: {
      cache: 'no-store',
    },
  });

  if (!data.cart) return null;
  return reshapeCart(data.cart);
}
