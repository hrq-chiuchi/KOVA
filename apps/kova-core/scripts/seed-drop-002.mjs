#!/usr/bin/env node
// Writes the approved Drop 002 catalogue and the loadout rules to the dev store.
// Safe to re-run: products, metaobjects and references are upserted by handle.
// Usage: node scripts/seed-drop-002.mjs
import { gql, check } from "./lib/store.mjs";

const LOCATION = "gid://shopify/Location/93985407235";
const PUBLICATIONS = ["gid://shopify/Publication/210965889283", "gid://shopify/Publication/210965954819"];

const lines = (...rows) => rows.join("\n");

const PRODUCTS = [
  {
    handle: "relay-sling-8",
    title: "Relay Sling 8",
    productType: "Sling Bag",
    category: "gid://shopify/TaxonomyCategory/aa-5-4-19",
    tags: ["Carry System", "Crossbody", "Drop 02", "Modular"],
    descriptor: "8L Single-Strap Relay Sling",
    positioning: "A compact sling built around a front Relay Grid panel, carrying one module set close to the body without a full pack.",
    features: ["Front Relay Grid panel, four webbing rows", "Left- or right-shoulder strap swap", "Quick-release stabilizer strap", "Padded rear device pocket up to 11 in", "Glove-friendly zipper pulls"],
    specs: lines("Capacity: 8 L", "Dimensions: 38 × 22 × 11 cm", "Device pocket: up to 11 in", "Strap range: 78–136 cm", "Load rating: 5 kg", "Interface: 25 mm Relay Grid"),
    packageInfo: lines("Package: 40 × 26 × 6 cm", "Packed weight: 0.78 kg", "Ships flat with recycled board insert."),
    material: "ms-carry-420d",
    edition: "ep-drop-002",
    price: "158.00", cost: "52.00", grams: 690,
    variants: [{ sku: "KVA-RELAYSL-DEFA", stock: 14 }],
    compatible: ["gridlink-pouch-array", "gridlink-cell-01", "sector-sleeve", "signal-carabiner-system", "lumen-tag-beacon"],
    complementary: ["gridlink-cell-01", "lumen-tag-beacon", "sector-05-field-flask"],
  },
  {
    handle: "gridlink-cell-01",
    title: "Gridlink Cell 01",
    productType: "Modular Pouch",
    category: "gid://shopify/TaxonomyCategory/aa-4-7",
    tags: ["Carry System", "Drop 02", "Field Objects", "Modular"],
    descriptor: "Single 1.5L Relay Module",
    positioning: "A single zip module for one set of small field objects, strapped to any Relay Grid surface or packed loose inside a KOVA platform.",
    features: ["Single 1.5 L zip chamber", "Relay Grid rear straps with snap closure", "Internal elastic loop row", "Grab loop and tether point", "Nests inside the Gridlink Pouch Array footprint"],
    specs: lines("Capacity: 1.5 L", "Dimensions: 18 × 12 × 7 cm", "Interface: 25 mm Relay Grid", "Weight: 110 g"),
    packageInfo: lines("Package: 20 × 14 × 3 cm", "Packed weight: 0.14 kg", "Ships flat in recycled kraft sleeve."),
    material: "ms-carry-420d",
    edition: "ep-drop-002",
    price: "48.00", cost: "15.00", grams: 110,
    variants: [{ sku: "KVA-GRIDCELL-DEFA", stock: 30 }],
    compatible: ["after-dark-utility-backpack", "lowlight-courier-14", "relay-modular-vest", "relay-sling-8"],
    complementary: ["gridlink-pouch-array", "lumen-tag-beacon", "signal-carabiner-system"],
  },
  {
    handle: "sector-sleeve",
    title: "Sector Sleeve",
    productType: "Bottle Holster",
    category: "gid://shopify/TaxonomyCategory/hg-11-3-4-1",
    tags: ["Drop 02", "Field Objects", "Hydration", "Modular"],
    descriptor: "Insulated Relay Flask Holster",
    positioning: "An insulated holster sized to the Sector 05 Field Flask, mounting the vessel on any Relay Grid surface for access without opening the pack.",
    features: ["Sized to the 950 ml Sector 05 profile", "5 mm closed-cell foam insulation", "Relay Grid rear straps", "Drawcord top with glove-friendly toggle", "Drain eyelet at the base"],
    specs: lines("Fits: Sector 05 Field Flask (950 ml), sold separately", "Dimensions: 27 × 12 × 10 cm", "Insulation: 5 mm closed-cell foam", "Interface: 25 mm Relay Grid", "Weight: 150 g"),
    packageInfo: lines("Package: 28 × 13 × 4 cm", "Packed weight: 0.19 kg", "Ships flat in recycled kraft sleeve."),
    edition: "ep-drop-002",
    price: "44.00", cost: "13.00", grams: 150,
    variants: [{ sku: "KVA-SECTSLV-DEFA", stock: 24 }],
    compatible: ["sector-05-field-flask", "after-dark-utility-backpack", "lowlight-courier-14", "relay-modular-vest", "relay-sling-8"],
    complementary: ["sector-05-field-flask", "gridlink-cell-01"],
  },
  {
    handle: "lumen-tag-beacon",
    title: "Lumen Tag Beacon",
    productType: "Marker Light",
    category: "gid://shopify/TaxonomyCategory/sg-4-2-3",
    tags: ["Drop 02", "Field Objects", "Hardware", "Signal"],
    descriptor: "Rechargeable Relay Marker Light",
    positioning: "A clip-on marker light that makes a pack, vest or key set visible in low light, mounted on Relay Grid webbing or the Signal Loop.",
    features: ["Steady, pulse and off-cycle signal modes", "USB-C rechargeable cell", "Relay Grid clip and Signal Loop keeper", "Glove-operable single button", "Sealed water-resistant housing"],
    specs: lines("Output: 20 lm maximum", "Run time: 6 h steady; 24 h pulse", "Charging: USB-C, 90 min", "Water resistance: IPX4", "Weight: 28 g", "Working use: marker light only, not a headlamp or certified safety beacon"),
    packageInfo: lines("Package: 12 × 7 × 3 cm", "Packed weight: 0.06 kg", "Charging cable not included."),
    edition: "ep-drop-002",
    price: "58.00", cost: "17.00", grams: 28,
    option: "Light",
    variants: [{ value: "White", sku: "KVA-LUMENTAG-WHIT", stock: 20 }, { value: "Red", sku: "KVA-LUMENTAG-RED", stock: 20 }],
    compatible: ["signal-carabiner-system", "after-dark-utility-backpack", "lowlight-courier-14", "relay-modular-vest", "relay-sling-8"],
    complementary: ["signal-carabiner-system", "gridlink-cell-01", "static-5-panel-cap"],
  },
  {
    handle: "afterimage-long-sleeve",
    title: "Afterimage Long Sleeve",
    productType: "Long Sleeve Tee",
    category: "gid://shopify/TaxonomyCategory/aa-1-13-8",
    tags: ["Apparel", "Drop 02", "Layering", "Unisex"],
    descriptor: "Technical Long-Sleeve Base Layer",
    positioning: "A close-fitting long-sleeve layer that manages moisture under a shell or vest and holds its shape through long nights of movement.",
    features: ["Mid-weight 190 gsm knit", "Raglan sleeves for pack-strap comfort", "Thumb loops", "Flatlock seams", "Reflective tonal back marker"],
    specs: lines("Fabric weight: 190 gsm", "Fit: close", "Body length: 70 cm (M)", "Chest circumference: 100 cm (M)", "Edition: 400 units"),
    packageInfo: lines("Package: 30 × 24 × 3 cm", "Packed weight: 0.26 kg", "Ships folded in recycled kraft sleeve."),
    material: "ms-knit-190",
    fit: "fp-base-close",
    edition: "ep-afterimage-400",
    price: "88.00", cost: "24.00", grams: 220,
    option: "Size",
    variants: [["S", 8], ["M", 12], ["L", 12], ["XL", 10], ["XXL", 6]].map(([value, stock]) => ({ value, stock, sku: `KVA-AFTERIMG-${value}` })),
    compatible: [],
    complementary: ["blacksite-shell-jacket", "relay-modular-vest", "night-shift-cargo-pant"],
  },
];

const PROFILES = [
  { type: "material_system", handle: "ms-knit-190", fields: {
    name: "Afterimage 190 Knit",
    composition: "190 gsm recycled polyester-elastane knit (88/12).",
    construction: "Raglan sleeves, flatlock seams, thumb-loop cuffs.",
    finish: "Matte black with a reflective tonal back print.",
    hardware: "None.",
    care: "Machine wash cold. Line dry. Do not iron the reflective print.",
  } },
  { type: "fit_profile", handle: "fp-base-close", fields: {
    name: "Close Base Layer",
    silhouette: "Close body with raglan sleeves; hem sits at the low hip.",
    layering_guidance: "Worn next to skin under the Dead Channel hoodie, the Relay vest or the Blacksite shell.",
    sizing_note: "Body length 70 cm and chest 100 cm on M. Take one size up for a relaxed fit.",
  } },
  { type: "edition_profile", handle: "ep-drop-002", fields: {
    name: "Drop 002 / Relay Grid",
    drop_code: "DROP 002",
    release_note: "The second KOVA release extends the Relay Grid with smaller modules and a sling platform. Drop 002 photography is in production.",
  } },
  { type: "edition_profile", handle: "ep-afterimage-400", fields: {
    name: "Afterimage 400",
    drop_code: "DROP 002",
    edition_quantity: "400",
    release_note: "A 400-unit base layer released alongside the Drop 002 Relay Grid objects. Photography is in production.",
  } },
];

// Existing Drop 001 products gain the new modules as compatible objects.
const COMPATIBLE_ADDITIONS = {
  "after-dark-utility-backpack": ["gridlink-cell-01", "sector-sleeve", "lumen-tag-beacon"],
  "lowlight-courier-14": ["gridlink-cell-01", "sector-sleeve", "lumen-tag-beacon"],
  "relay-modular-vest": ["gridlink-cell-01", "sector-sleeve", "lumen-tag-beacon"],
  "gridlink-pouch-array": ["relay-sling-8"],
  "sector-05-field-flask": ["sector-sleeve", "relay-sling-8"],
  "signal-carabiner-system": ["lumen-tag-beacon"],
};

const SLOTS = [
  { handle: "slot-organizer", key: "organizer", label: "Organizer", products: ["gridlink-pouch-array", "gridlink-cell-01"], max: 2 },
  { handle: "slot-hydration", key: "hydration", label: "Hydration", products: ["sector-05-field-flask", "sector-sleeve"], max: 1 },
  { handle: "slot-signal", key: "signal", label: "Signal", products: ["signal-carabiner-system", "lumen-tag-beacon"], max: 2 },
];

const LOADOUT = {
  handle: "relay-grid-loadout",
  name: "Relay Grid loadout",
  platforms: ["after-dark-utility-backpack", "lowlight-courier-14", "relay-modular-vest", "relay-sling-8"],
  minModules: 2,
  tierTwo: 10,
  tierThree: 15,
};

const ACCESS = { storefront: "PUBLIC_READ" };

function step(label) {
  console.log(`\n→ ${label}`);
}

function ensureDefinitions() {
  step("Metaobject definitions");
  const existing = gql(`{ metaobjectDefinitions(first: 20) { nodes { id type } } }`).metaobjectDefinitions.nodes;
  const byType = Object.fromEntries(existing.map((node) => [node.type, node.id]));
  const create = (definition) => {
    if (byType[definition.type]) return console.log(`  ${definition.type} exists`);
    const result = gql(`mutation ($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id type } userErrors { field message } }
    }`, { definition }, { mutate: true }).metaobjectDefinitionCreate;
    byType[definition.type] = check(result, definition.type).metaobjectDefinition.id;
    console.log(`  created ${definition.type}`);
  };
  create({
    type: "loadout_slot",
    name: "Loadout slot",
    description: "One module position in a loadout: which products may fill it and how many.",
    displayNameKey: "label",
    access: ACCESS,
    fieldDefinitions: [
      { key: "key", name: "Key", type: "single_line_text_field", required: true, description: "Stable id sent by the storefront as the _kova_slot line property." },
      { key: "label", name: "Label", type: "single_line_text_field", required: true },
      { key: "products", name: "Products", type: "list.product_reference" },
      { key: "required", name: "Required", type: "boolean" },
      { key: "max_items", name: "Maximum items", type: "number_integer" },
    ],
  });
  create({
    type: "loadout",
    name: "Loadout",
    description: "A platform product plus module slots, sold as one merged line at a tier price.",
    displayNameKey: "name",
    access: ACCESS,
    fieldDefinitions: [
      { key: "name", name: "Name", type: "single_line_text_field", required: true },
      { key: "platforms", name: "Platforms", type: "list.product_reference" },
      { key: "slots", name: "Slots", type: "list.metaobject_reference",
        validations: [{ name: "metaobject_definition_id", value: byType.loadout_slot }] },
      { key: "min_modules", name: "Minimum modules", type: "number_integer" },
      { key: "tier_two_percent", name: "Two-module discount (%)", type: "number_integer" },
      { key: "tier_three_percent", name: "Three-or-more-module discount (%)", type: "number_integer" },
    ],
  });
}

// Profile types are publishable, and a new entry defaults to DRAFT, which Liquid cannot read.
const PUBLISHABLE = new Set(["material_system", "fit_profile", "edition_profile"]);

function upsertMetaobject(type, handle, fields) {
  const metaobject = { fields: Object.entries(fields).map(([key, value]) => ({ key, value: String(value) })) };
  if (PUBLISHABLE.has(type)) metaobject.capabilities = { publishable: { status: "ACTIVE" } };
  const result = gql(`mutation ($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id handle } userErrors { field message } }
  }`, { handle: { type, handle }, metaobject }, { mutate: true }).metaobjectUpsert;
  return check(result, `${type}/${handle}`).metaobject.id;
}

function metaobjectIds() {
  const data = gql(`{
    ms: metaobjects(type: "material_system", first: 50) { nodes { id handle } }
    fp: metaobjects(type: "fit_profile", first: 50) { nodes { id handle } }
    ep: metaobjects(type: "edition_profile", first: 50) { nodes { id handle } }
  }`);
  return Object.fromEntries([...data.ms.nodes, ...data.fp.nodes, ...data.ep.nodes].map((node) => [node.handle, node.id]));
}

function productIds(handles) {
  const query = handles.map((handle) => `handle:${handle}`).join(" OR ");
  const nodes = gql(`query ($query: String!) { products(first: 50, query: $query) { nodes { id handle
    compat: metafield(namespace: "custom", key: "compatible_products") { value } } } }`, { query }).products.nodes;
  return Object.fromEntries(nodes.map((node) => [node.handle, node]));
}

function setProduct(product, refs) {
  const metafield = (key, type, value) => ({ namespace: "custom", key, type, value });
  const metafields = [
    metafield("functional_descriptor", "single_line_text_field", product.descriptor),
    metafield("positioning", "multi_line_text_field", product.positioning),
    metafield("feature_list", "list.single_line_text_field", JSON.stringify(product.features)),
    metafield("technical_specifications", "multi_line_text_field", product.specs),
    metafield("package_information", "multi_line_text_field", product.packageInfo),
    metafield("edition_profile", "metaobject_reference", refs[product.edition]),
  ];
  if (product.material) metafields.push(metafield("material_system", "metaobject_reference", refs[product.material]));
  if (product.fit) metafields.push(metafield("fit_profile", "metaobject_reference", refs[product.fit]));

  const optionName = product.option ?? "Title";
  const variants = product.variants.map((variant) => ({
    optionValues: [{ optionName, name: variant.value ?? "Default Title" }],
    price: product.price,
    sku: variant.sku,
    inventoryPolicy: "DENY",
    inventoryItem: { tracked: true, cost: product.cost, measurement: { weight: { value: product.grams, unit: "GRAMS" } } },
    inventoryQuantities: [{ locationId: LOCATION, name: "available", quantity: variant.stock }],
  }));

  const input = {
    handle: product.handle,
    title: product.title,
    vendor: "KOVA",
    status: "ACTIVE",
    productType: product.productType,
    category: product.category,
    tags: product.tags,
    descriptionHtml: `<p>${product.positioning}</p>`,
    seo: {
      title: `${product.title} | KOVA`,
      description: `${product.positioning} Explore specifications, fit, materials, and current availability from KOVA.`,
    },
    productOptions: [{ name: optionName, values: product.variants.map((variant) => ({ name: variant.value ?? "Default Title" })) }],
    variants,
    metafields,
  };
  const result = gql(`mutation ($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
    productSet(identifier: $identifier, input: $input, synchronous: true) { product { id handle } userErrors { field message } }
  }`, { identifier: { handle: product.handle }, input }, { mutate: true }).productSet;
  return check(result, product.handle).product.id;
}

function setParentProduct() {
  const input = {
    handle: "kova-loadout",
    title: "KOVA Loadout",
    vendor: "KOVA",
    status: "ACTIVE",
    productType: "Loadout",
    descriptionHtml: "<p>Merged cart line for a KOVA loadout. Created by the KOVA Core cart transform; not sold on its own.</p>",
    productOptions: [{ name: "Title", values: [{ name: "Default Title" }] }],
    variants: [{
      optionValues: [{ optionName: "Title", name: "Default Title" }],
      price: "0.00",
      sku: "KVA-LOADOUT",
      inventoryItem: { tracked: false },
    }],
  };
  const result = gql(`mutation ($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
    productSet(identifier: $identifier, input: $input, synchronous: true) { product { id variants(first: 1) { nodes { id } } } userErrors { field message } }
  }`, { identifier: { handle: "kova-loadout" }, input }, { mutate: true }).productSet;
  return check(result, "kova-loadout").product;
}

function publish(id) {
  const result = gql(`mutation ($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) { userErrors { field message } }
  }`, { id, input: PUBLICATIONS.map((publicationId) => ({ publicationId })) }, { mutate: true }).publishablePublish;
  check(result, `publish ${id}`);
}

function setMetafields(metafields) {
  for (let i = 0; i < metafields.length; i += 25) {
    const result = gql(`mutation ($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { metafields { id } userErrors { field message } }
    }`, { metafields: metafields.slice(i, i + 25) }, { mutate: true }).metafieldsSet;
    check(result, "metafieldsSet");
  }
}

ensureDefinitions();

step("Profiles");
for (const profile of PROFILES) {
  upsertMetaobject(profile.type, profile.handle, profile.fields);
  console.log(`  ${profile.type}/${profile.handle}`);
}
const refs = metaobjectIds();

step("Products");
for (const product of PRODUCTS) {
  const id = setProduct(product, refs);
  publish(id);
  console.log(`  ${product.handle} ${id}`);
}
const parent = setParentProduct();
console.log(`  kova-loadout ${parent.id} (unpublished) variant ${parent.variants.nodes[0].id}`);

step("References");
const allHandles = [...new Set([
  ...PRODUCTS.flatMap((product) => [product.handle, ...product.compatible, ...product.complementary]),
  ...Object.keys(COMPATIBLE_ADDITIONS),
])];
const products = productIds(allHandles);
const gid = (handle) => {
  if (!products[handle]) throw new Error(`Unknown product handle ${handle}`);
  return products[handle].id;
};
const referenceMetafields = [];
for (const product of PRODUCTS) {
  const owner = gid(product.handle);
  if (product.compatible.length) {
    referenceMetafields.push({ ownerId: owner, namespace: "custom", key: "compatible_products", type: "list.product_reference", value: JSON.stringify(product.compatible.map(gid)) });
  }
  referenceMetafields.push({ ownerId: owner, namespace: "shopify--discovery--product_recommendation", key: "complementary_products", type: "list.product_reference", value: JSON.stringify(product.complementary.map(gid)) });
}
for (const [handle, additions] of Object.entries(COMPATIBLE_ADDITIONS)) {
  const current = JSON.parse(products[handle].compat?.value ?? "[]");
  const merged = [...new Set([...current, ...additions.map(gid)])];
  referenceMetafields.push({ ownerId: gid(handle), namespace: "custom", key: "compatible_products", type: "list.product_reference", value: JSON.stringify(merged) });
}
setMetafields(referenceMetafields);
console.log(`  ${referenceMetafields.length} reference metafields set`);

step("Loadout rules");
const slotIds = SLOTS.map((slot) => {
  const id = upsertMetaobject("loadout_slot", slot.handle, {
    key: slot.key,
    label: slot.label,
    products: JSON.stringify(slot.products.map(gid)),
    required: "false",
    max_items: slot.max,
  });
  console.log(`  loadout_slot/${slot.handle}`);
  return id;
});
upsertMetaobject("loadout", LOADOUT.handle, {
  name: LOADOUT.name,
  platforms: JSON.stringify(LOADOUT.platforms.map(gid)),
  slots: JSON.stringify(slotIds),
  min_modules: LOADOUT.minModules,
  tier_two_percent: LOADOUT.tierTwo,
  tier_three_percent: LOADOUT.tierThree,
});
console.log(`  loadout/${LOADOUT.handle}`);
console.log("\nDone.");
