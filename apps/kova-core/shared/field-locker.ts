// Field Locker data rules, shared by the account extensions and mirrored in the theme's
// LoadoutBuilder (assets/theme.js). Everything here is pure so it can be tested without Shopify.

// The loadout hand-off between the storefront builder and the Field Locker page:
//   ?loadout=relay-grid-loadout&platform=relay-sling-8:4969…&modules=gridlink-cell-01:4969…,lumen-tag-beacon:4969…
// Each pick is a product handle with an optional numeric variant id. The query string comes from a
// link anyone can craft, so decoding validates every part and returns null rather than guessing.
export type Pick = { handle: string; variant: string | null };
export type LoadoutPick = { loadout: string; platform: Pick; modules: Pick[] };

export const MAX_MODULES = 8;
export const MAX_SAVED = 12;

const HANDLE = /^[a-z0-9][a-z0-9-]{0,99}$/;
const VARIANT = /^\d{1,20}$/;

function decodePick(raw: string): Pick | null {
  const [handle, variant, ...rest] = raw.split(":");
  if (rest.length || !HANDLE.test(handle)) return null;
  if (variant !== undefined && !VARIANT.test(variant)) return null;
  return { handle, variant: variant ?? null };
}

const encodePick = (pick: Pick) => (pick.variant ? `${pick.handle}:${pick.variant}` : pick.handle);

export function decodeLoadoutParams(search: string): LoadoutPick | null {
  const params = new URLSearchParams(search);
  const loadout = params.get("loadout");
  const platform = decodePick(params.get("platform") ?? "");
  const rawModules = (params.get("modules") ?? "").split(",").filter(Boolean);
  if (!loadout || !HANDLE.test(loadout) || !platform) return null;
  if (!rawModules.length || rawModules.length > MAX_MODULES) return null;
  const modules = rawModules.map(decodePick);
  if (modules.some((pick) => !pick)) return null;
  return { loadout, platform, modules: modules as Pick[] };
}

export function encodeLoadoutParams({ loadout, platform, modules }: LoadoutPick): string {
  const params = new URLSearchParams({ loadout, platform: encodePick(platform), modules: modules.map(encodePick).join(",") });
  // Keep the separators readable in links; URLSearchParams would escape them.
  return params.toString().replace(/%3A/g, ":").replace(/%2C/g, ",");
}

// ─── Saved loadouts ($app:saved_loadouts, a JSON customer metafield) ──────────────────────────
export type SavedLoadout = LoadoutPick & { id: string; savedAt: string };

// Two saves of the same objects are the same loadout, whatever order the modules were picked in.
export function loadoutId({ platform, modules }: LoadoutPick): string {
  return [encodePick(platform), ...modules.map(encodePick).sort()].join("+");
}

// Reads the metafield value defensively: a customer can only write it through this extension, but
// an old or hand-edited value must not break the page.
export function parseSaved(value: string | null | undefined): SavedLoadout[] {
  if (!value) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const validPick = (pick: any) => typeof pick?.handle === "string" && HANDLE.test(pick.handle)
    && (pick.variant === null || (typeof pick.variant === "string" && VARIANT.test(pick.variant)));
  return parsed.flatMap((entry) => {
    if (typeof entry?.loadout !== "string" || !HANDLE.test(entry.loadout) || typeof entry.savedAt !== "string") return [];
    if (!validPick(entry.platform) || !Array.isArray(entry.modules) || !entry.modules.length) return [];
    if (entry.modules.length > MAX_MODULES || !entry.modules.every(validPick)) return [];
    const pick: LoadoutPick = {
      loadout: entry.loadout,
      platform: { handle: entry.platform.handle, variant: entry.platform.variant },
      modules: entry.modules.map((module: Pick) => ({ handle: module.handle, variant: module.variant })),
    };
    return [{ ...pick, id: loadoutId(pick), savedAt: entry.savedAt }];
  }).slice(0, MAX_SAVED);
}

// Newest first. Saving an existing loadout moves it to the top instead of duplicating it.
export function upsertSaved(list: SavedLoadout[], pick: LoadoutPick, savedAt: string): SavedLoadout[] {
  const id = loadoutId(pick);
  return [{ ...pick, id, savedAt }, ...list.filter((entry) => entry.id !== id)].slice(0, MAX_SAVED);
}

export function removeSaved(list: SavedLoadout[], id: string): SavedLoadout[] {
  return list.filter((entry) => entry.id !== id);
}

// ─── Orders (Customer Account API) ────────────────────────────────────────────────────────────
// A merged loadout is recorded on the order as its component lines, each keeping the builder's
// `_kova_loadout` and `_kova_slot` attributes (verified on the dev store, Phase 11 spike).
export type OrderLine = {
  title: string;
  productId: string | null;
  variantId: string | null;
  productType?: string | null;
  image?: { url: string; altText?: string | null } | null;
  customAttributes: { key: string; value: string | null }[];
};

export type Order = { id: string; name: string; processedAt: string; lineItems: { nodes: OrderLine[] } };

export type Equipment = {
  productId: string;
  title: string;
  image: OrderLine["image"];
  registeredAt: string;
  orderName: string;
};

export type PurchasedLoadout = {
  id: string;
  orderName: string;
  processedAt: string;
  platform: OrderLine;
  modules: OrderLine[];
};

const attribute = (line: OrderLine, key: string) =>
  line.customAttributes.find((entry) => entry.key === key)?.value ?? null;

// Every product the customer has bought, once, dated by the first order that contained it.
export function equipmentFromOrders(orders: Order[]): Equipment[] {
  const byProduct = new Map<string, Equipment>();
  const oldestFirst = [...orders].sort((a, b) => a.processedAt.localeCompare(b.processedAt));
  for (const order of oldestFirst) {
    for (const line of order.lineItems.nodes) {
      // Removed products lose their id; the hidden loadout parent is never a real object.
      if (!line.productId || line.productType === "Loadout" || byProduct.has(line.productId)) continue;
      byProduct.set(line.productId, {
        productId: line.productId,
        title: line.title,
        image: line.image ?? null,
        registeredAt: order.processedAt,
        orderName: order.name,
      });
    }
  }
  return [...byProduct.values()].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
}

// Loadouts rebuilt from order lines, newest order first. A group without a platform line is
// skipped: the rules never let one reach an order, so it would only come from a manual order.
export function purchasedLoadouts(orders: Order[]): PurchasedLoadout[] {
  const loadouts: PurchasedLoadout[] = [];
  const newestFirst = [...orders].sort((a, b) => b.processedAt.localeCompare(a.processedAt));
  for (const order of newestFirst) {
    const groups = new Map<string, OrderLine[]>();
    for (const line of order.lineItems.nodes) {
      const group = attribute(line, "_kova_loadout");
      if (!group) continue;
      groups.set(group, [...(groups.get(group) ?? []), line]);
    }
    for (const [group, lines] of groups) {
      const platform = lines.find((line) => attribute(line, "_kova_slot") === "platform");
      if (!platform) continue;
      loadouts.push({
        id: group,
        orderName: order.name,
        processedAt: order.processedAt,
        platform,
        modules: lines.filter((line) => line !== platform),
      });
    }
  }
  return loadouts;
}

// "gid://shopify/ProductVariant/123" → "123", the form the builder and cart use.
export const numericId = (gid: string | null) => gid?.split("/").pop() ?? null;
