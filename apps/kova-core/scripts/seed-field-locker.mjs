#!/usr/bin/env node
// Seeds one test customer with paid orders, so the Field Locker account extension has real order
// state to read while checkout is unavailable on the password-protected dev store.
// Safe to re-run: the customer is looked up by email and each order by its seed tag.
// Usage: FIELD_LOCKER_EMAIL=you+locker@example.com node scripts/seed-field-locker.mjs
import { randomUUID } from "node:crypto";
import { gql, check } from "./lib/store.mjs";

const EMAIL = process.env.FIELD_LOCKER_EMAIL;
if (!EMAIL) throw new Error("Set FIELD_LOCKER_EMAIL to the address that will sign in to the test account.");

const CUSTOMER_TAG = "field-locker-seed";

// Draft orders run the KOVA Core cart transform, so the loadout order's lines, carrying the
// builder's `_kova_loadout` / `_kova_slot` attributes, merge into one "KOVA Loadout" line at the
// tier price, as a storefront checkout would.
const ORDERS = [
  {
    tag: "field-locker-seed-a",
    lines: [
      { handle: "dead-channel-utility-hoodie", variant: "M / Black" },
      { handle: "afterimage-long-sleeve", variant: "M" },
    ],
  },
  {
    tag: "field-locker-seed-b",
    loadout: true,
    lines: [
      { handle: "relay-sling-8", slot: "platform" },
      { handle: "gridlink-cell-01", slot: "organizer" },
      { handle: "sector-sleeve", slot: "hydration" },
      { handle: "lumen-tag-beacon", variant: "Red", slot: "signal" },
    ],
  },
  {
    tag: "field-locker-seed-c",
    lines: [
      { handle: "after-dark-utility-backpack", variant: "Standard / Black" },
      { handle: "gridlink-pouch-array" },
    ],
  },
];

function step(label) {
  console.log(`\n▸ ${label}`);
}

function upsertCustomer() {
  const found = gql(`query ($query: String!) { customers(first: 1, query: $query) { nodes { id } } }`,
    { query: `email:${EMAIL}` }).customers.nodes[0];
  if (found) return found.id;
  const payload = gql(`mutation ($input: CustomerInput!) { customerCreate(input: $input) {
      customer { id } userErrors { field message } } }`,
  { input: { email: EMAIL, firstName: "Field", lastName: "Tester", tags: [CUSTOMER_TAG] } }, { mutate: true });
  return check(payload.customerCreate, "customerCreate").customer.id;
}

function variantIds(handles) {
  const query = handles.map((handle) => `handle:${handle}`).join(" OR ");
  const nodes = gql(`query ($query: String!) { products(first: 50, query: $query) { nodes { handle
    variants(first: 20) { nodes { id title } } } } }`, { query }).products.nodes;
  return Object.fromEntries(nodes.map((node) => [node.handle, node.variants.nodes]));
}

function orderExists(tag) {
  return gql(`query ($query: String!) { orders(first: 1, query: $query) { nodes { id name } } }`,
    { query: `tag:${tag}` }).orders.nodes[0];
}

// A run that failed between create and complete leaves an open draft; remove it before retrying.
function deleteOpenDrafts(tag) {
  const drafts = gql(`query ($query: String!) { draftOrders(first: 10, query: $query) { nodes { id } } }`,
    { query: `tag:${tag} AND status:open` }).draftOrders.nodes;
  for (const draft of drafts) {
    check(gql(`mutation ($input: DraftOrderDeleteInput!) { draftOrderDelete(input: $input) {
        deletedId userErrors { field message } } }`, { input: { id: draft.id } }, { mutate: true }).draftOrderDelete,
    "draftOrderDelete");
  }
}

function createOrder(order, customerId, variants) {
  const group = order.loadout ? randomUUID() : null;
  const lineItems = order.lines.map((line) => {
    const options = variants[line.handle];
    if (!options) throw new Error(`No product ${line.handle}`);
    const variant = line.variant ? options.find((option) => option.title === line.variant) : options[0];
    if (!variant) throw new Error(`No variant "${line.variant}" on ${line.handle}`);
    return {
      variantId: variant.id,
      quantity: 1,
      ...(group && {
        customAttributes: [{ key: "_kova_loadout", value: group }, { key: "_kova_slot", value: line.slot }],
      }),
    };
  });
  const draft = check(gql(`mutation ($input: DraftOrderInput!) { draftOrderCreate(input: $input) {
      draftOrder { id } userErrors { field message } } }`,
  { input: { purchasingEntity: { customerId }, lineItems, tags: [CUSTOMER_TAG, order.tag] } },
  { mutate: true }).draftOrderCreate, "draftOrderCreate").draftOrder;
  const completed = check(gql(`mutation ($id: ID!) { draftOrderComplete(id: $id) {
      draftOrder { order { id name } } userErrors { field message } } }`,
  { id: draft.id }, { mutate: true }).draftOrderComplete, "draftOrderComplete");
  return completed.draftOrder.order;
}

step("Customer");
const customerId = upsertCustomer();
console.log(`  ${EMAIL} → ${customerId}`);

step("Orders");
const variants = variantIds([...new Set(ORDERS.flatMap((order) => order.lines.map((line) => line.handle)))]);
for (const order of ORDERS) {
  const existing = orderExists(order.tag);
  if (existing) {
    console.log(`  ${order.tag}: exists as ${existing.name}`);
    continue;
  }
  deleteOpenDrafts(order.tag);
  const created = createOrder(order, customerId, variants);
  console.log(`  ${order.tag}: created ${created.name}`);
}
