# KOVA Core

The Shopify app behind KOVA loadouts and the Field Locker. It is extension-only: there is no app server and no backend, and no storefront code holds a token. Decisions are recorded in `docs/case-study/decision-log.md` (D-024 to D-032).

## Surfaces

| Extension | Target | Purpose |
| --- | --- | --- |
| `loadout-merge` | `cart.transform.run` | Merges a valid loadout group (`_kova_loadout`, `_kova_slot`) into one "Loadout — {platform}" line at the tier price |
| `loadout-guard` | `cart.validations.generate.run` | Refuses invalid groups and a directly added loadout parent |
| `field-locker` | `customer-account.page.render` | The Field Locker page: orders, saved and purchased loadouts, equipment, documents |
| `field-locker-order` | `customer-account.order-status.block.render` | A block on the order page showing that order's loadouts and documents |

Shared code lives in `shared/`:
- `loadout-rules.ts`: `judgeGroup`, used by both functions.
- `field-locker.ts`: the loadout link format, saved-loadout rules, and equipment and loadout grouping from orders.
- `account-data.js`: the Customer Account API and Storefront API queries.

The theme mirrors `judgeGroup` and the link format in `assets/theme.js`.

## Data

- **Loadout rules:** the `loadout` and `loadout_slot` metaobjects, compiled onto both functions by `scripts/sync-rules.mjs`. Run it after any rule edit in the admin.
- **Saved loadouts:** `$app:saved_loadouts`, a JSON customer metafield declared in `shopify.app.toml`. Only the Field Locker page writes it, at most 12 entries.
- **Scopes:**
  - `read_products`, `write_cart_transforms`, `write_validations`
  - `write_customers`, needed to declare the metafield
  - `customer_read_customers`, `customer_read_orders`, `customer_write_customers`
  - Protected customer data is declared in the Dev Dashboard. The extensions read no name, email, address or phone field.

## Scripts

The scripts run Admin GraphQL through the Shopify CLI (`scripts/lib/store.mjs`) and never read a token.

- `node scripts/seed-drop-002.mjs`: the Drop 002 catalogue and the loadout metaobjects.
- `node scripts/sync-rules.mjs [--dry-run]`: compiles the rules onto the functions.
- `FIELD_LOCKER_EMAIL=… node scripts/seed-field-locker.mjs`: a test customer with three paid orders, one of them a loadout.
- `node scripts/brand-accounts.mjs [--dry-run]`: copies the theme's token values into the store's checkout and accounts branding, after saving a git-ignored backup (D-033). It needs the store CLI's `write_checkout_and_accounts_configurations` scope.

## Development

```shell
npm install
shopify app dev          # previews all four extensions on the dev store
shopify app deploy       # creates a new app version (ask before releasing)
cd extensions/field-locker && npx vitest run      # link format, saved list, order grouping
cd extensions/loadout-merge && npx vitest run     # transform fixtures (same for loadout-guard)
```
