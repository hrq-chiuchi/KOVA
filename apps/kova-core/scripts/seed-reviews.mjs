#!/usr/bin/env node
// Writes Shopify's standard review metafields (`reviews.rating`, `reviews.rating_count`) from the Review blocks
// in the theme's product template, so the rating summary and the product structured data match the listed
// reviews (D-062). A block with no product applies to every product. Products without reviews are cleared.
// Theme data, not app-owned; it lives here to share the store helper with the other seed scripts.
// Safe to re-run: values are recomputed and overwritten. Re-run after editing Review blocks.
// Usage: node scripts/seed-reviews.mjs [handle ...]
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gql, check } from "./lib/store.mjs";

const TEMPLATE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "templates", "product.json");

function step(label) {
  console.log(`\n→ ${label}`);
}

function reviewBlocks() {
  const source = readFileSync(TEMPLATE, "utf8").replace(/^\s*\/\*[\s\S]*?\*\//, "");
  const sections = Object.values(JSON.parse(source).sections).filter((section) => section.type === "product-reviews" && !section.disabled);
  return sections.flatMap((section) =>
    Object.values(section.blocks ?? {}).filter((block) => block.type === "sample_review" && !block.disabled).map((block) => block.settings),
  );
}

function ensureDefinitions() {
  step("Standard review definitions");
  for (const key of ["rating", "rating_count"]) {
    const result = gql(`mutation ($key: String!) {
      standardMetafieldDefinitionEnable(ownerType: PRODUCT, namespace: "reviews", key: $key) { createdDefinition { id } userErrors { code message } }
    }`, { key }, { mutate: true }).standardMetafieldDefinitionEnable;
    const errors = result.userErrors.filter((error) => error.code !== "TAKEN");
    check({ userErrors: errors }, `enable reviews.${key}`);
    console.log(`  reviews.${key} ready`);
  }
}

function products() {
  return gql(`{ products(first: 100) { nodes { id handle } } }`).products.nodes;
}

function setValues(nodes, only) {
  step("Review metafields");
  const blocks = reviewBlocks();
  const set = [];
  const remove = [];
  for (const { id: ownerId, handle } of nodes) {
    if (only.length && !only.includes(handle)) continue;
    const ratings = blocks.filter((block) => !block.product || block.product === handle).map((block) => Number(block.rating));
    if (!ratings.length) {
      remove.push({ ownerId, namespace: "reviews", key: "rating" }, { ownerId, namespace: "reviews", key: "rating_count" });
      continue;
    }
    const average = (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1);
    set.push(
      { ownerId, namespace: "reviews", key: "rating", type: "rating", value: JSON.stringify({ value: average, scale_min: "1.0", scale_max: "5.0" }) },
      { ownerId, namespace: "reviews", key: "rating_count", type: "number_integer", value: String(ratings.length) },
    );
    console.log(`  ${handle}: ${average} from ${ratings.length}`);
  }
  for (let i = 0; i < set.length; i += 25) {
    const result = gql(`mutation ($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { metafields { id } userErrors { field message } }
    }`, { metafields: set.slice(i, i + 25) }, { mutate: true }).metafieldsSet;
    check(result, "metafieldsSet");
  }
  for (let i = 0; i < remove.length; i += 25) {
    const result = gql(`mutation ($metafields: [MetafieldIdentifierInput!]!) {
      metafieldsDelete(metafields: $metafields) { userErrors { field message } }
    }`, { metafields: remove.slice(i, i + 25) }, { mutate: true }).metafieldsDelete;
    check(result, "metafieldsDelete");
  }
  console.log(`  ${set.length / 2} products rated, ${remove.length / 2} cleared`);
}

ensureDefinitions();
setValues(products(), process.argv.slice(2));
console.log("\nDone.");
