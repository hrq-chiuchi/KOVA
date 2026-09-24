#!/usr/bin/env node
// Compiles the `loadout` and `loadout_slot` metaobjects into the JSON the KOVA Core functions
// read, activates the cart transform and validation if they are missing, and writes the rules to
// both. Functions cannot query metaobjects, so re-run this after editing a loadout in the admin.
// Requires KOVA Core to be installed on the store (`shopify app dev`).
// Usage: node scripts/sync-rules.mjs [--dry-run]
import { gql, check } from "./lib/store.mjs";

const NAMESPACE = "kova";
const KEY = "loadout_rules";
const dryRun = process.argv.includes("--dry-run");

const fieldValue = (node, key) => node.fields.find((field) => field.key === key)?.value ?? null;
const list = (value) => (value ? JSON.parse(value) : []);
const integer = (value, fallback) => (value == null ? fallback : Number.parseInt(value, 10));

function compileRules() {
  const data = gql(`{
    loadouts: metaobjects(type: "loadout", first: 20) { nodes { handle fields { key value } } }
    slots: metaobjects(type: "loadout_slot", first: 50) { nodes { id fields { key value } } }
    parent: productByIdentifier(identifier: { handle: "kova-loadout" }) { variants(first: 1) { nodes { id } } }
  }`);
  const parentVariantId = data.parent?.variants.nodes[0]?.id;
  if (!parentVariantId) throw new Error("The kova-loadout parent product is missing; run seed-drop-002.mjs first.");

  const slots = new Map(data.slots.nodes.map((node) => [node.id, {
    key: fieldValue(node, "key"),
    products: list(fieldValue(node, "products")),
    required: fieldValue(node, "required") === "true",
    max: integer(fieldValue(node, "max_items"), 1),
  }]));

  const loadouts = data.loadouts.nodes.map((node) => ({
    name: fieldValue(node, "name"),
    platforms: list(fieldValue(node, "platforms")),
    slots: list(fieldValue(node, "slots")).map((id) => slots.get(id)).filter(Boolean),
    minModules: integer(fieldValue(node, "min_modules"), 2),
    tiers: [
      { modules: 2, percent: integer(fieldValue(node, "tier_two_percent"), 0) },
      { modules: 3, percent: integer(fieldValue(node, "tier_three_percent"), 0) },
    ].filter((tier) => tier.percent > 0),
  }));
  return { parentVariantId, loadouts };
}

function ensureOwners() {
  const data = gql(`{
    cartTransforms(first: 10) { nodes { id functionId } }
    validations(first: 25) { nodes { id enabled shopifyFunction { id apiType } } }
    shopifyFunctions(first: 25) { nodes { id title apiType app { title } } }
  }`, {}, { app: true });
  const ours = data.shopifyFunctions.nodes.filter((fn) => fn.app?.title === "KOVA Core");
  const mergeFn = ours.find((fn) => fn.apiType === "cart_transform");
  const guardFn = ours.find((fn) => fn.apiType === "cart_checkout_validation");
  if (!mergeFn || !guardFn) throw new Error("KOVA Core functions are not available; is `shopify app dev` running?");

  let transform = data.cartTransforms.nodes.find((node) => node.functionId === mergeFn.id);
  if (!transform) {
    const result = gql(`mutation { cartTransformCreate(functionHandle: "loadout-merge", blockOnFailure: false) {
      cartTransform { id } userErrors { field message } } }`, {}, { app: true, mutate: true }).cartTransformCreate;
    transform = check(result, "cartTransformCreate").cartTransform;
    console.log(`  activated cart transform ${transform.id}`);
  }

  let validation = data.validations.nodes.find((node) => node.shopifyFunction?.id === guardFn.id);
  if (!validation) {
    const result = gql(`mutation { validationCreate(validation: { functionHandle: "loadout-guard", enable: true, blockOnFailure: true }) {
      validation { id } userErrors { field message } } }`, {}, { app: true, mutate: true }).validationCreate;
    validation = check(result, "validationCreate").validation;
    console.log(`  activated validation ${validation.id}`);
  }
  return [transform.id, validation.id];
}

const rules = compileRules();
console.log(JSON.stringify(rules, null, 2));
if (dryRun) process.exit(0);

const owners = ensureOwners();
const result = gql(`mutation ($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) { metafields { id } userErrors { field message } }
}`, {
  metafields: owners.map((ownerId) => ({ ownerId, namespace: NAMESPACE, key: KEY, type: "json", value: JSON.stringify(rules) })),
}, { app: true, mutate: true }).metafieldsSet;
check(result, "metafieldsSet");
console.log(`\nRules written to ${owners.join(", ")}`);
