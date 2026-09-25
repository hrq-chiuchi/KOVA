// Data access for the Field Locker extensions. Customer and order state comes from the Customer Account
// API; product documents, handles and loadout names come from the Storefront API, so the page
// shows the same public data the theme does. Neither call needs an app backend.
import { parseSaved, numericId } from './field-locker';

const ACCOUNT_API = 'shopify://customer-account/api/2026-07/graphql.json';

// No name, email or address fields: the locker never needs them (protected customer data).
const ACCOUNT_QUERY = `query FieldLocker {
  customer {
    id
    savedLoadouts: metafield(namespace: "$app", key: "saved_loadouts") { value }
    orders(first: 50, sortKey: PROCESSED_AT, reverse: true) {
      nodes {
        id
        name
        processedAt
        lineItems(first: 50) {
          nodes { title productId variantId productType image { url altText } customAttributes { key value } }
        }
      }
    }
  }
}`;

const ORDER_QUERY = `query FieldLockerOrder($id: ID!) {
  order(id: $id) {
    id
    name
    processedAt
    lineItems(first: 50) {
      nodes { title productId variantId productType image { url altText } customAttributes { key value } }
    }
  }
}`;

const SAVE_MUTATION = `mutation SaveLoadouts($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) { userErrors { field message } }
}`;

const STOREFRONT_QUERY = `query FieldLockerProducts($ids: [ID!]!, $handles: String!, $withHandles: Boolean!) {
  shop { primaryDomain { url } }
  owned: nodes(ids: $ids) {
    ... on Product {
      id
      handle
      title
      featuredImage { url altText }
      guide: metafield(namespace: "custom", key: "reference_guide") {
        reference { ... on GenericFile { url alt } }
      }
      material: metafield(namespace: "custom", key: "material_system") {
        reference { ... on Metaobject { name: field(key: "name") { value } care: field(key: "care") { value } } }
      }
    }
  }
  named: products(first: 50, query: $handles) @include(if: $withHandles) {
    nodes { id handle title featuredImage { url altText } }
  }
  loadouts: metaobjects(type: "loadout", first: 20) {
    nodes { handle name: field(key: "name") { value } platforms: field(key: "platforms") { value } }
  }
}`;

async function accountApi(query, variables = {}) {
  const response = await fetch(ACCOUNT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (json.errors?.length) throw new Error(json.errors.map((error) => error.message).join('; '));
  return json.data;
}

export async function loadAccount() {
  const { customer } = await accountApi(ACCOUNT_QUERY);
  return {
    customerId: customer.id,
    orders: customer.orders.nodes,
    saved: parseSaved(customer.savedLoadouts?.value),
  };
}

export async function loadOrder(id) {
  const { order } = await accountApi(ORDER_QUERY, { id });
  return order;
}

// Product records keyed by id and by handle, the shop URL, and each loadout's name and platforms.
// `query` is the calling extension's `shopify.query` (Storefront API), passed in because the global
// is typed per target.
export async function loadCatalogue(query, productIds, handles) {
  const { data, errors } = /** @type {{ data: any, errors?: { message: string }[] }} */ (await query(STOREFRONT_QUERY, {
    variables: {
      ids: productIds,
      handles: handles.map((handle) => `handle:${handle}`).join(' OR '),
      withHandles: handles.length > 0,
    },
  }));
  if (errors?.length) throw new Error(errors.map((error) => error.message).join('; '));
  const products = new Map();
  for (const product of [...(data.owned ?? []), ...(data.named?.nodes ?? [])]) {
    if (!product?.id) continue;
    const record = { ...products.get(product.id), ...product };
    products.set(product.id, record);
    products.set(product.handle, record);
  }
  const loadouts = (data.loadouts?.nodes ?? []).map((node) => ({
    handle: node.handle,
    name: node.name?.value ?? node.handle,
    platforms: JSON.parse(node.platforms?.value ?? '[]'),
  }));
  return { products, loadouts, shopUrl: data.shop.primaryDomain.url.replace(/\/$/, '') };
}

export async function writeSaved(customerId, list) {
  const value = list.map(({ loadout, platform, modules, savedAt }) => ({ loadout, platform, modules, savedAt }));
  const data = await accountApi(SAVE_MUTATION, {
    metafields: [{ ownerId: customerId, namespace: '$app', key: 'saved_loadouts', type: 'json', value: JSON.stringify(value) }],
  });
  const errors = data.metafieldsSet.userErrors;
  if (errors.length) throw new Error(errors.map((error) => error.message).join('; '));
}

export const orderHref = (orderId) => `shopify:customer-account/orders/${numericId(orderId)}`;
