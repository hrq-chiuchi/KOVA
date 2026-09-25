import { describe, expect, test } from "vitest";
import {
  decodeLoadoutParams, encodeLoadoutParams, equipmentFromOrders, loadoutId, parseSaved,
  purchasedLoadouts, removeSaved, upsertSaved, MAX_SAVED, type Order,
} from "../../../shared/field-locker";

const SLING = { loadout: "relay-grid-loadout", platform: { handle: "relay-sling-8", variant: "49695350391043" },
  modules: [{ handle: "gridlink-cell-01", variant: null }, { handle: "lumen-tag-beacon", variant: "49695350849795" }] };

describe("loadout params", () => {
  test("round-trip with readable separators", () => {
    const search = encodeLoadoutParams(SLING);
    expect(search).toBe("loadout=relay-grid-loadout&platform=relay-sling-8:49695350391043&modules=gridlink-cell-01,lumen-tag-beacon:49695350849795");
    expect(decodeLoadoutParams(`?${search}`)).toEqual(SLING);
  });

  test.each([
    ["no params", ""],
    ["no modules", "loadout=relay-grid-loadout&platform=relay-sling-8"],
    ["bad handle", "loadout=relay-grid-loadout&platform=Relay_Sling&modules=gridlink-cell-01"],
    ["script in handle", "loadout=x&platform=a<script>&modules=b"],
    ["non-numeric variant", "loadout=x&platform=a:gid&modules=b"],
    ["extra colon", "loadout=x&platform=a:1:2&modules=b"],
    ["too many modules", `loadout=x&platform=a&modules=${Array(9).fill("m").join(",")}`],
  ])("rejects %s", (_, search) => {
    expect(decodeLoadoutParams(search)).toBeNull();
  });
});

describe("saved loadouts", () => {
  test("the same objects in another order are one loadout", () => {
    const reversed = { ...SLING, modules: [...SLING.modules].reverse() };
    expect(loadoutId(reversed)).toBe(loadoutId(SLING));
    const list = upsertSaved(upsertSaved([], SLING, "2026-09-24T10:00:00Z"), reversed, "2026-09-25T10:00:00Z");
    expect(list).toHaveLength(1);
    expect(list[0].savedAt).toBe("2026-09-25T10:00:00Z");
  });

  test("newest first, capped, removable", () => {
    let list = [] as ReturnType<typeof upsertSaved>;
    for (let index = 0; index < MAX_SAVED + 2; index += 1) {
      list = upsertSaved(list, { ...SLING, modules: [{ handle: `module-${index}`, variant: null }] }, `2026-09-${10 + index}`);
    }
    expect(list).toHaveLength(MAX_SAVED);
    expect(list[0].modules[0].handle).toBe(`module-${MAX_SAVED + 1}`);
    expect(removeSaved(list, list[0].id)).toHaveLength(MAX_SAVED - 1);
  });

  test("parse drops malformed entries and survives bad JSON", () => {
    const good = upsertSaved([], SLING, "2026-09-25T10:00:00Z")[0];
    const value = JSON.stringify([good, { loadout: "x" }, { ...good, platform: {} }, { ...good, modules: [] }, null]);
    expect(parseSaved(value)).toEqual([good]);
    expect(parseSaved("{not json")).toEqual([]);
    expect(parseSaved(JSON.stringify({ loadout: "x" }))).toEqual([]);
    expect(parseSaved(null)).toEqual([]);
  });
});

// Shapes as the Customer Account API returned them for the seeded orders (Phase 11 spike).
const attrs = (group: string, slot: string) => [{ key: "_kova_loadout", value: group }, { key: "_kova_slot", value: slot }];
const line = (title: string, id: number, customAttributes: Order["lineItems"]["nodes"][number]["customAttributes"] = []) => ({
  title, productId: `gid://shopify/Product/${id}`, variantId: `gid://shopify/ProductVariant/${id}0`, customAttributes,
});
const ORDERS: Order[] = [
  { id: "o3", name: "#1003", processedAt: "2026-09-25T02:58:56Z", lineItems: { nodes: [
    line("After Dark Utility Backpack", 1), line("Gridlink Pouch Array", 2)] } },
  { id: "o2", name: "#1002", processedAt: "2026-09-25T02:58:43Z", lineItems: { nodes: [
    line("Relay Sling 8", 3, attrs("g1", "platform")), line("Gridlink Cell 01", 4, attrs("g1", "organizer")),
    line("Sector Sleeve", 5, attrs("g1", "hydration")), line("Lumen Tag Beacon", 6, attrs("g1", "signal")),
    line("Gridlink Pouch Array", 2)] } },
  { id: "o1", name: "#1001", processedAt: "2026-09-25T02:50:00Z", lineItems: { nodes: [
    line("Dead Channel Utility Hoodie", 7), { ...line("Removed product", 8), productId: null },
    { ...line("KOVA Loadout", 9), productType: "Loadout" }] } },
];

describe("orders", () => {
  test("equipment lists each real product once, dated by its first order", () => {
    const equipment = equipmentFromOrders(ORDERS);
    expect(equipment.map((item) => item.title)).toEqual([
      "After Dark Utility Backpack", "Relay Sling 8", "Gridlink Cell 01", "Sector Sleeve", "Lumen Tag Beacon",
      "Gridlink Pouch Array", "Dead Channel Utility Hoodie",
    ]);
    expect(equipment.find((item) => item.title === "Gridlink Pouch Array")?.orderName).toBe("#1002");
  });

  test("purchased loadouts regroup component lines by their group attribute", () => {
    const [loadout, ...rest] = purchasedLoadouts(ORDERS);
    expect(rest).toHaveLength(0);
    expect(loadout.orderName).toBe("#1002");
    expect(loadout.platform.title).toBe("Relay Sling 8");
    expect(loadout.modules.map((module) => module.title)).toEqual(["Gridlink Cell 01", "Sector Sleeve", "Lumen Tag Beacon"]);
  });

  test("a group without a platform is skipped", () => {
    const orphan: Order = { id: "o4", name: "#1004", processedAt: "2026-09-26T00:00:00Z",
      lineItems: { nodes: [line("Gridlink Cell 01", 4, attrs("g2", "organizer"))] } };
    expect(purchasedLoadouts([orphan])).toEqual([]);
  });
});
