#!/usr/bin/env node
// Applies KOVA branding to the published checkout and accounts configuration, so the Field Locker,
// the native account pages, sign-in and checkout read as KOVA (D-033). Values come from the theme's
// tokens (design-system/tokens/*.tokens.json → assets/tokens.css); Shopify branding cannot read them,
// so they are copied here by hand and must follow token changes.
// Usage: node scripts/brand-accounts.mjs [--dry-run]
// Before writing, it saves the current branding to scripts/.branding-backup-<id>.json.
import { writeFileSync } from "node:fs";
import { gql, check } from "./lib/store.mjs";

const DRY_RUN = process.argv.includes("--dry-run");

// assets/tokens.css
const TOKENS = {
  background: "#080808", // --ad-color-background-primary (neutral-1000)
  elevated: "#191919", // --ad-color-background-elevated (neutral-850)
  text: "#f4f3ed", // --ad-color-text-primary (neutral-0)
  border: "#343434", // neutral-700, the opaque stand-in for --ad-color-border-subtle
  accent: "#dfff00", // --ad-color-action-primary (acid-500)
  critical: "#ff4f2e", // --ad-color-action-critical (signal-500)
};

// Work Sans, the theme's font (settings_data type_* fonts), from Shopify's font library.
const FONT = { shopifyFontGroup: { baseFontHandle: "work_sans_n4", boldFontHandle: "work_sans_n7", loadingStrategy: "SWAP" } };

const base = { background: TOKENS.background, text: TOKENS.text, border: TOKENS.border, icon: TOKENS.text, accent: TOKENS.accent, decorative: TOKENS.accent };
const elevated = { ...base, background: TOKENS.elevated };
const colors = {
  base,
  control: { ...elevated, selected: { ...elevated, border: TOKENS.accent } },
  primaryButton: {
    background: TOKENS.accent, text: TOKENS.background, border: TOKENS.accent, icon: TOKENS.background,
    hover: { background: TOKENS.text, text: TOKENS.background, border: TOKENS.text, icon: TOKENS.background },
  },
  secondaryButton: {
    background: TOKENS.background, text: TOKENS.text, border: TOKENS.text, icon: TOKENS.text,
    hover: { background: TOKENS.text, text: TOKENS.background, border: TOKENS.text, icon: TOKENS.background },
  },
};
// Hairline, square sections, like the theme's bordered panels.
const section = { colors: { base: elevated }, cornerRadius: "NONE", border: "FULL", borderStyle: "BASE", borderWidth: "BASE", padding: "LARGE_100" };
// KOVA labels and headings are uppercase and tracked.
const label = (size) => ({ typography: { font: "PRIMARY", weight: "BOLD", letterCase: "UPPER", kerning: "LOOSE", size } });
const button = { cornerRadius: "NONE", border: "FULL", typography: { weight: "BOLD", letterCase: "UPPER", kerning: "LOOSE", size: "SMALL" } };
const bar = { colors: { base }, padding: "BASE" };

const BRANDING = {
  designTokens: {
    // The radius tokens refuse 0, so square corners are set per component with "NONE".
    typography: { primary: FONT, secondary: FONT },
  },
  components: {
    shared: { cornerRadius: "NONE", colors: { accent: TOKENS.accent, decorative: TOKENS.accent, critical: TOKENS.critical } },
    headingLevel1: label("EXTRA_LARGE"),
    headingLevel2: label("MEDIUM"),
    headingLevel3: label("BASE"),
    primaryButton: button,
    secondaryButton: button,
    control: { cornerRadius: "NONE", border: "FULL" },
    checkbox: { cornerRadius: "NONE" },
    merchandiseThumbnail: { cornerRadius: "NONE", border: "FULL" },
    main: { colors, section },
    header: bar,
    footer: bar,
  },
  surfaces: {
    customerAccounts: { components: { main: { colors, section }, header: bar, footer: { colors: { base }, padding: "BASE" } } },
    checkout: {
      components: {
        main: { colors, section },
        orderSummary: { colors: { ...colors, base: elevated }, section },
        header: bar,
        footer: bar,
      },
    },
    signIn: { components: { main: { colors, section } } },
  },
};

const configs = gql(`{ checkoutAndAccountsConfigurations(first: 10) { nodes { id name isPublished } } }`)
  .checkoutAndAccountsConfigurations.nodes;
const published = configs.find((config) => config.isPublished);
if (!published) throw new Error(`No published configuration among ${JSON.stringify(configs)}`);
console.log(`Published configuration: ${published.name} (${published.id})`);

if (DRY_RUN) {
  console.log(JSON.stringify(BRANDING, null, 2));
  process.exit(0);
}

// Builds a selection of every branding field from the schema, so the backup is complete.
function selection(typeName, depth = 0) {
  const type = gql(`query ($name: String!) { __type(name: $name) { fields { name type { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } } }`, { name: typeName }).__type;
  const fields = [];
  for (const field of type.fields ?? []) {
    let ref = field.type;
    while (ref.ofType) ref = ref.ofType;
    if (ref.kind === "OBJECT" && depth < 8) fields.push(`${field.name} { ${selection(ref.name, depth + 1)} }`);
    else if (ref.kind === "SCALAR" || ref.kind === "ENUM") fields.push(field.name);
  }
  return fields.join(" ") || "__typename";
}

const current = gql(`query ($id: ID!) { checkoutAndAccountsConfiguration(id: $id) { id name branding { ${selection("CheckoutAndAccountsConfigurationBranding")} } } }`, { id: published.id });
const backup = `scripts/.branding-backup-${published.id.split("/").pop()}.json`;
writeFileSync(new URL(`../${backup}`, import.meta.url), JSON.stringify(current, null, 2));
console.log(`Saved current configuration to apps/kova-core/${backup}`);

const payload = gql(`mutation ($id: ID!, $configuration: CheckoutAndAccountsConfigurationInput!) {
  checkoutAndAccountsConfigurationUpdate(id: $id, configuration: $configuration) {
    userErrors { field message code }
  }
}`, { id: published.id, configuration: { branding: BRANDING } }, { mutate: true });
check(payload.checkoutAndAccountsConfigurationUpdate, "checkoutAndAccountsConfigurationUpdate");
console.log("Branding applied.");
