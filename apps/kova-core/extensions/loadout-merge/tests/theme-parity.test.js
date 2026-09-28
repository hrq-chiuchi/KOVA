// The theme's Loadout Builder decides with assets/loadout-verdict.js before the cart request; the
// cart transform and validation decide with `judgeGroup`. This runs both over every build a small
// catalogue allows, so a rule change on either side fails here instead of drifting silently.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { describe, expect, test } from "vitest";
import { judgeGroup } from "../../../shared/loadout-rules";

const asset = fileURLToPath(new URL("../../../../../assets/loadout-verdict.js", import.meta.url));
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(asset, "utf8"), sandbox);
const { judge } = sandbox.window.KovaLoadoutVerdict;

const P = (n) => `gid://shopify/Product/${n}`;

// The shape scripts/sync-rules.mjs compiles, as on the store in 2026-09.
const RELAY_GRID = {
  name: "Relay Grid loadout",
  platforms: [P(1), P(2)],
  slots: [
    { key: "organizer", products: [P(10), P(11)], required: false, max: 2 },
    { key: "hydration", products: [P(20), P(21)], required: false, max: 1 },
    { key: "signal", products: [P(30), P(31)], required: false, max: 2 },
  ],
  minModules: 2,
  tiers: [{ modules: 2, percent: 10 }, { modules: 3, percent: 15 }],
};

// Exercises the paths the store's loadout doesn't: a required slot, a minimum of three, a single tier.
const STRICT = {
  name: "Strict loadout",
  platforms: [P(1)],
  slots: [
    { key: "organizer", products: [P(10), P(11)], required: true, max: 1 },
    { key: "signal", products: [P(30), P(31)], required: false, max: 2 },
  ],
  minModules: 3,
  tiers: [{ modules: 3, percent: 20 }],
};

// Every claim the storefront could send: each product under each slot key, plus a foreign product.
const PRODUCTS = [P(10), P(11), P(20), P(21), P(30), P(31), P(99)];
const SLOTS = ["organizer", "hydration", "signal"];
const CLAIMS = PRODUCTS.flatMap((productId) => SLOTS.map((slot) => ({ slot, productId })));

function* subsets(items, size, start = 0, picked = []) {
  yield picked;
  if (picked.length === size) return;
  for (let index = start; index < items.length; index += 1) {
    yield* subsets(items, size, index + 1, [...picked, items[index]]);
  }
}

function functionVerdict(loadout, platformId, modules) {
  const member = (slot, productId) => ({ line: null, quantity: 1, slot, productId, title: productId });
  const verdict = judgeGroup(
    [member("platform", platformId), ...modules.map((module) => member(module.slot, module.productId))],
    { parentVariantId: "gid://shopify/ProductVariant/1", loadouts: [loadout] },
  );
  return { valid: verdict.valid, percent: verdict.valid ? verdict.percent : 0 };
}

describe.each([
  ["Relay Grid", RELAY_GRID],
  ["strict", STRICT],
])("builder verdict matches judgeGroup: %s loadout", (_, loadout) => {
  test("for every platform and every set of up to four module claims", () => {
    let valid = 0;
    let checked = 0;
    for (const platformId of [P(1), P(2), P(99)]) {
      for (const modules of subsets(CLAIMS, 4)) {
        const theme = judge(loadout, platformId, modules);
        const expected = functionVerdict(loadout, platformId, modules);
        const actual = { valid: theme.problem === null, percent: theme.percent };
        if (actual.valid !== expected.valid || actual.percent !== expected.percent) {
          expect({ platformId, modules, ...actual }).toEqual({ platformId, modules, ...expected });
        }
        if (expected.valid) valid += 1;
        checked += 1;
      }
    }
    // Guards against a vacuous pass: the table must contain both outcomes.
    expect(valid).toBeGreaterThan(0);
    expect(checked - valid).toBeGreaterThan(0);
  });
});

describe("builder problem order", () => {
  test("a required slot is reported before the minimum", () => {
    expect(judge(STRICT, P(1), [{ slot: "signal", productId: P(30) }]).problem).toEqual({ code: "required", slot: "organizer" });
  });

  test("the minimum reports how many modules are missing", () => {
    expect(judge(RELAY_GRID, P(1), [{ slot: "signal", productId: P(30) }]).problem).toEqual({ code: "minimum", missing: 1, minimum: 2 });
  });
});
