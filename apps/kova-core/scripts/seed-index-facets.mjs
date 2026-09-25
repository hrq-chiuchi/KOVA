#!/usr/bin/env node
// Writes the Equipment Index facets (TYPE, SYSTEM, ENVIRONMENT, STATUS) to the dev store:
// four choice-validated product metafield definitions and the approved value per product (D-035).
// Theme data, not app-owned; it lives here to share the store helper with the other seed scripts.
// Safe to re-run: definitions are created or updated, values are overwritten.
// Usage: node scripts/seed-index-facets.mjs
import { gql, check } from "./lib/store.mjs";

const DEFINITIONS = [
  { key: "index_type", name: "Index type", type: "single_line_text_field",
    description: "Equipment Index TYPE facet.", choices: ["Carry", "Apparel", "Hardware"] },
  { key: "systems", name: "Systems", type: "list.single_line_text_field",
    description: "Equipment Index SYSTEM facet.", choices: ["Modular", "Waterproof", "Packable", "Weather resistant"] },
  { key: "environments", name: "Environments", type: "list.single_line_text_field",
    description: "Equipment Index ENVIRONMENT facet.", choices: ["Transit", "Field", "Rain", "Cold"] },
  { key: "status", name: "Status", type: "list.single_line_text_field",
    description: "Equipment Index STATUS facet. Archive marks a retired object.", choices: ["Drop 001", "Drop 002", "Limited", "Archive"] },
];

// handle: [TYPE, SYSTEM, ENVIRONMENT, STATUS], as approved on 2026-09-25.
const VALUES = {
  "after-dark-utility-backpack": ["Carry", ["Modular", "Weather resistant"], ["Transit", "Field", "Rain"], ["Drop 001"]],
  "lowlight-courier-14": ["Carry", ["Modular"], ["Transit"], ["Drop 001"]],
  "driftline-hip-rig": ["Carry", [], ["Transit", "Field"], ["Drop 001"]],
  "relay-modular-vest": ["Carry", ["Modular"], ["Field"], ["Drop 001", "Limited"]],
  "gridlink-pouch-array": ["Carry", ["Modular"], ["Field"], ["Drop 001"]],
  "relay-sling-8": ["Carry", ["Modular"], ["Transit", "Field"], ["Drop 002"]],
  "gridlink-cell-01": ["Carry", ["Modular"], ["Field"], ["Drop 002"]],
  "sector-sleeve": ["Carry", ["Modular"], ["Field"], ["Drop 002"]],
  "blacksite-shell-jacket": ["Apparel", ["Waterproof"], ["Rain", "Cold"], ["Drop 001", "Limited"]],
  "ghostline-packable-poncho": ["Apparel", ["Waterproof", "Packable"], ["Rain"], ["Drop 001"]],
  "night-shift-cargo-pant": ["Apparel", [], ["Transit", "Field"], ["Drop 001", "Limited"]],
  "dead-channel-utility-hoodie": ["Apparel", [], ["Transit", "Cold"], ["Drop 001"]],
  "afterimage-long-sleeve": ["Apparel", [], ["Cold"], ["Drop 002"]],
  "veil-02-air-hood": ["Apparel", [], ["Cold"], ["Drop 001"]],
  "touchpoint-field-glove": ["Apparel", [], ["Field", "Cold"], ["Drop 001"]],
  "static-5-panel-cap": ["Apparel", ["Weather resistant"], ["Transit", "Rain"], ["Drop 001"]],
  "signal-carabiner-system": ["Hardware", [], ["Transit", "Field"], ["Drop 001"]],
  "sector-05-field-flask": ["Hardware", [], ["Field"], ["Drop 001"]],
  "nullfold-card-wallet": ["Hardware", [], ["Transit"], ["Drop 001"]],
  "lumen-tag-beacon": ["Hardware", ["Weather resistant"], ["Transit", "Field"], ["Drop 002"]],
  "night-transit-set-03": ["Hardware", [], ["Transit"], ["Drop 001"]],
};

function step(label) {
  console.log(`\n→ ${label}`);
}

function ensureDefinitions() {
  step("Metafield definitions");
  const existing = gql(`{ metafieldDefinitions(first: 50, ownerType: PRODUCT, namespace: "custom") { nodes { id key } } }`)
    .metafieldDefinitions.nodes;
  const byKey = Object.fromEntries(existing.map((node) => [node.key, node.id]));
  for (const { key, name, type, description, choices } of DEFINITIONS) {
    const validations = [{ name: "choices", value: JSON.stringify(choices) }];
    const shared = { namespace: "custom", key, ownerType: "PRODUCT", name, description, validations, access: { storefront: "PUBLIC_READ" } };
    if (byKey[key]) {
      const result = gql(`mutation ($definition: MetafieldDefinitionUpdateInput!) {
        metafieldDefinitionUpdate(definition: $definition) { updatedDefinition { id } userErrors { field message } }
      }`, { definition: shared }, { mutate: true }).metafieldDefinitionUpdate;
      check(result, `update custom.${key}`);
      console.log(`  updated custom.${key}`);
    } else {
      const result = gql(`mutation ($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) { createdDefinition { id } userErrors { field message } }
      }`, { definition: { ...shared, type } }, { mutate: true }).metafieldDefinitionCreate;
      check(result, `create custom.${key}`);
      console.log(`  created custom.${key}`);
    }
  }
}

function productIds() {
  const query = Object.keys(VALUES).map((handle) => `handle:${handle}`).join(" OR ");
  const nodes = gql(`query ($query: String!) { products(first: 50, query: $query) { nodes { id handle } } }`, { query }).products.nodes;
  const ids = Object.fromEntries(nodes.map((node) => [node.handle, node.id]));
  const missing = Object.keys(VALUES).filter((handle) => !ids[handle]);
  if (missing.length) throw new Error(`Products not found: ${missing.join(", ")}`);
  return ids;
}

// Empty lists are deleted rather than written, since a list metafield cannot hold an empty value.
function setValues(ids) {
  step("Facet values");
  const set = [];
  const remove = [];
  for (const [handle, [type, systems, environments, status]] of Object.entries(VALUES)) {
    const ownerId = ids[handle];
    set.push({ ownerId, namespace: "custom", key: "index_type", type: "single_line_text_field", value: type });
    for (const [key, list] of [["systems", systems], ["environments", environments], ["status", status]]) {
      if (list.length) set.push({ ownerId, namespace: "custom", key, type: "list.single_line_text_field", value: JSON.stringify(list) });
      else remove.push({ ownerId, namespace: "custom", key });
    }
  }
  for (let i = 0; i < set.length; i += 25) {
    const result = gql(`mutation ($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { metafields { id } userErrors { field message } }
    }`, { metafields: set.slice(i, i + 25) }, { mutate: true }).metafieldsSet;
    check(result, "metafieldsSet");
  }
  if (remove.length) {
    const result = gql(`mutation ($metafields: [MetafieldIdentifierInput!]!) {
      metafieldsDelete(metafields: $metafields) { userErrors { field message } }
    }`, { metafields: remove }, { mutate: true }).metafieldsDelete;
    check(result, "metafieldsDelete");
  }
  console.log(`  ${set.length} values set, ${remove.length} empty lists cleared`);
}

ensureDefinitions();
setValues(productIds());
console.log("\nDone.");
