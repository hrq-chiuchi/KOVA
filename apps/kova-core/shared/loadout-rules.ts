// The one definition of a valid loadout, shared by the loadout-merge cart transform and the
// loadout-guard validation. Shopify runs validation against the cart before the transform merges
// it, so the guard cannot look for merged lines: it has to reach the same verdict independently.

// Compiled from the `loadout` and `loadout_slot` metaobjects by scripts/sync-rules.mjs.
export type LoadoutRules = {
  parentVariantId: string;
  loadouts: Loadout[];
};

export type Loadout = {
  name: string;
  platforms: string[];
  slots: { key: string; products: string[]; required: boolean; max: number }[];
  minModules: number;
  tiers: { modules: number; percent: number }[];
};

export type Member<Line> = {
  line: Line;
  quantity: number;
  slot: string;
  productId: string;
  title: string;
};

export type Verdict<Line> =
  | { valid: true; platform: Member<Line>; modules: Member<Line>[]; percent: number }
  | { valid: false; platformTitle: string | null };

// Groups cart lines by their `_kova_loadout` attribute. Lines without one are not loadout lines.
export function groupMembers<Line>(members: (Member<Line> & { group: string | null })[]) {
  const groups = new Map<string, Member<Line>[]>();
  for (const member of members) {
    if (!member.group) continue;
    const group = groups.get(member.group) ?? [];
    group.push(member);
    groups.set(member.group, group);
  }
  return groups;
}

// A group is valid when it is exactly one platform plus modules that each belong to the slot they
// claim, within slot maxima, meeting the minimum, at one shared quantity. The line attributes are
// claims from the storefront, so every claim is checked against the rules.
export function judgeGroup<Line>(members: Member<Line>[], rules: LoadoutRules | null | undefined): Verdict<Line> {
  const platforms = members.filter((member) => member.slot === "platform");
  const platformTitle = platforms.length === 1 ? platforms[0].title : null;
  const invalid: Verdict<Line> = { valid: false, platformTitle };
  if (!rules?.parentVariantId || !Array.isArray(rules.loadouts) || platforms.length !== 1) return invalid;

  const quantity = members[0].quantity;
  if (members.some((member) => member.quantity !== quantity)) return invalid;

  const platform = platforms[0];
  const modules = members.filter((member) => member !== platform);
  const loadout = rules.loadouts.find((candidate) => candidate.platforms.includes(platform.productId));
  if (!loadout || modules.length < loadout.minModules) return invalid;

  const counts = new Map<string, number>();
  for (const module of modules) {
    const slot = loadout.slots.find((candidate) => candidate.key === module.slot);
    if (!slot || !slot.products.includes(module.productId)) return invalid;
    const count = (counts.get(slot.key) ?? 0) + 1;
    if (count > slot.max) return invalid;
    counts.set(slot.key, count);
  }
  if (loadout.slots.some((slot) => slot.required && !counts.has(slot.key))) return invalid;

  const percent = loadout.tiers
    .filter((tier) => modules.length >= tier.modules)
    .reduce((best, tier) => Math.max(best, tier.percent), 0);
  return { valid: true, platform, modules, percent };
}
