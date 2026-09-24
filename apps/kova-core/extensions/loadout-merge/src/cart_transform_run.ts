import type {
  CartTransformRunInput,
  CartTransformRunResult,
  Operation,
} from "../generated/api";

// Compiled from the `loadout` and `loadout_slot` metaobjects by scripts/sync-rules.mjs.
export type LoadoutRules = {
  parentVariantId: string;
  loadouts: Loadout[];
};

type Loadout = {
  name: string;
  platforms: string[];
  slots: { key: string; products: string[]; required: boolean; max: number }[];
  minModules: number;
  tiers: { modules: number; percent: number }[];
};

type Line = CartTransformRunInput["cart"]["lines"][number];

type Member = {
  line: Line;
  slot: string;
  productId: string;
  title: string;
};

const NO_CHANGES: CartTransformRunResult = {
  operations: [],
};

export function cartTransformRun(input: CartTransformRunInput): CartTransformRunResult {
  const rules = input.cartTransform.rules?.jsonValue as LoadoutRules | undefined;
  if (!rules?.parentVariantId || !Array.isArray(rules.loadouts)) return NO_CHANGES;

  const groups = new Map<string, Member[]>();
  for (const line of input.cart.lines) {
    const group = line.group?.value;
    if (!group || line.merchandise.__typename !== "ProductVariant") continue;
    const members = groups.get(group) ?? [];
    members.push({
      line,
      slot: line.slot?.value ?? "",
      productId: line.merchandise.product.id,
      title: line.merchandise.product.title,
    });
    groups.set(group, members);
  }

  const operations: Operation[] = [];
  for (const members of groups.values()) {
    const merge = resolveGroup(members, rules);
    if (merge) operations.push({ linesMerge: merge });
  }
  return { operations };
}

// Returns a merge only when the group is exactly one platform plus valid modules. The line
// attributes are claims from the storefront, so every claim is re-checked against the rules.
function resolveGroup(members: Member[], rules: LoadoutRules) {
  const quantity = members[0].line.quantity;
  if (members.some((member) => member.line.quantity !== quantity)) return null;

  const platforms = members.filter((member) => member.slot === "platform");
  if (platforms.length !== 1) return null;
  const platform = platforms[0];
  const modules = members.filter((member) => member !== platform);

  const loadout = rules.loadouts.find((candidate) => candidate.platforms.includes(platform.productId));
  if (!loadout || modules.length < loadout.minModules) return null;

  const counts = new Map<string, number>();
  for (const module of modules) {
    const slot = loadout.slots.find((candidate) => candidate.key === module.slot);
    if (!slot || !slot.products.includes(module.productId)) return null;
    const count = (counts.get(slot.key) ?? 0) + 1;
    if (count > slot.max) return null;
    counts.set(slot.key, count);
  }
  if (loadout.slots.some((slot) => slot.required && !counts.has(slot.key))) return null;

  const percent = loadout.tiers
    .filter((tier) => modules.length >= tier.modules)
    .reduce((best, tier) => Math.max(best, tier.percent), 0);

  return {
    parentVariantId: rules.parentVariantId,
    title: `Loadout — ${platform.title}`,
    // Lets the theme tell a merged loadout from a native bundle without reading product data.
    attributes: [{ key: "_kova_loadout_platform", value: platform.title }],
    cartLines: members.map((member) => ({ cartLineId: member.line.id, quantity })),
    ...(percent > 0 ? { price: { percentageDecrease: { value: percent } } } : {}),
  };
}
