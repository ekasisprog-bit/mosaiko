import { shopifyAdminFetch } from '../client';

// ─── Update order metafield ─────────────────────────────────────────────────

const UPDATE_METAFIELD_MUTATION = /* GraphQL */ `
  mutation UpdateOrderMetafield($input: MetafieldInput!) {
    metafieldSet(metafield: $input) {
      metafield {
        id
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function updateOrderMetafield(
  orderId: string,
  namespace: string,
  key: string,
  value: string,
): Promise<void> {
  const data = await shopifyAdminFetch<{
    metafieldSet: {
      userErrors: { field: string[]; message: string }[];
    };
  }>({
    query: UPDATE_METAFIELD_MUTATION,
    variables: {
      input: {
        ownerId: orderId,
        namespace,
        key,
        value,
        type: 'single_line_text_field',
      },
    },
    options: { cache: 'no-store' },
  });

  const errors = data.metafieldSet.userErrors;
  if (errors.length > 0) {
    throw new Error(
      `[Shopify] Failed to update metafield: ${errors.map((e) => e.message).join(', ')}`,
    );
  }
}

// ─── Create fulfillment ──────────────────────────────────────────────────────

const CREATE_FULFILLMENT_MUTATION = /* GraphQL */ `
  mutation CreateFulfillment($fulfillment: FulfillmentInput!) {
    fulfillmentCreate(fulfillment: $fulfillment) {
      fulfillment {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createFulfillment(
  orderId: string,
  trackingNumber: string,
  trackingCompany?: string,
): Promise<void> {
  const data = await shopifyAdminFetch<{
    fulfillmentCreate: {
      userErrors: { field: string[]; message: string }[];
    };
  }>({
    query: CREATE_FULFILLMENT_MUTATION,
    variables: {
      fulfillment: {
        orderId,
        trackingInfo: {
          number: trackingNumber,
          company: trackingCompany || 'Otro',
        },
        notifyCustomer: true,
      },
    },
    options: { cache: 'no-store' },
  });

  const errors = data.fulfillmentCreate.userErrors;
  if (errors.length > 0) {
    throw new Error(
      `[Shopify] Failed to create fulfillment: ${errors.map((e) => e.message).join(', ')}`,
    );
  }
}
