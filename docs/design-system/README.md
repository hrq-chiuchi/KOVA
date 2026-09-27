# AFTERDARK SUPPLY design system

## Status and purpose

**Phase 1 is implemented and locally verified within the scope described below.** Shopify CLI validation, JavaScript syntax checks, and desktop/mobile static-browser fixtures passed, including synthetic Theme Editor lifecycle events. The fixture is not a live Shopify storefront: the actual Theme Editor UI and real catalogue/media data remain unverified.

Status vocabulary:

- **Locally verified:** exercised by the recorded CLI check or static-browser fixture; synthetic events do not imply actual Theme Editor UI verification.
- **Implemented (live verification pending):** present and locally checked where possible, but still requires a live Shopify path.
- **Implemented (Skeleton baseline):** inherited scaffold infrastructure; not necessarily approved as final UI.
- **Planned:** agreed target or file surface not yet present.
- **Deferred:** intentionally outside the current phase.
- **Unavailable:** cannot be produced with the mounted tooling.

The system connects design principles to tokens, Liquid primitives, merchant-composable blocks, authored sections, templates, motion behavior, accessibility rules, and case-study evidence. Its goal is a small systemized core that supports controlled art direction rather than a generic component catalogue.

## Taxonomy and ownership

| Layer | Responsibility | Placement / examples | Promotion rule |
| --- | --- | --- | --- |
| Foundations | Visual and behavioral rules | Color semantics, typography roles, spacing, grid, containers, breakpoints, borders, image treatment, responsive and motion principles | Must apply across multiple surfaces. |
| Tokens | Named reusable decisions | Primitive, semantic, typography, motion, and justified component tokens | Prefer semantic intent over raw value or page-specific naming. |
| Primitives | Low-level implementation building blocks | Button, link, icon, badge, media frame, heading treatment, price, field, quantity control | Use a snippet when it is implementation reuse rather than merchant content. |
| Commerce components | Reusable product and transaction patterns | Product card/form, variant picker, price block, cart line, search result, media gallery | Commerce behavior must work independently of decorative motion. |
| Theme blocks | Merchant-composable content | Heading, text, CTA, media, editorial image, product reference | Create only when merchants should add, remove, or reorder it. |
| Sections | Authored, configurable experiences | Header, kinetic hero, editorial product grid, product recommendations | Own schema, section lifecycle, responsive composition, and cleanup. |
| Templates | Page-level composition | Home, collection, product, cart, search, editorial pages | Compose sections; do not absorb their internal behavior. |
| Motion behaviors | Reusable progressive enhancement | Reveal, parallax, hover, media and scroll-linked cues | Declarative hooks; lifecycle-safe; reduced-motion equivalent required. |
| Art-direction exceptions | Deliberate local deviations | Grid break, unique crop, overlap, typographic lockup | Keep local and document why the system should not absorb it. |

## Foundations

### Visual language — Locally verified in the Phase 1 fixture

- Dark-first, high-contrast surfaces with a restrained accent role; semantic contrast and state roles take precedence over campaign-specific color names.
- Oversized display typography may act as composition. Body copy retains controlled line length, clear hierarchy, and responsive scaling.
- A stable content grid and spacing rhythm support navigation and commerce. Full-bleed media, asymmetric balance, negative space, and intentional overlap may break that grid locally.
- Media should support Shopify responsive image delivery, explicit aspect behavior, meaningful focal points, and separate mobile crops when one crop cannot preserve the subject.
- Borders, radii, elevation, and interaction states should be sparse and intentional rather than inherited from a generic storefront kit.

Concrete values live in the canonical token files. Their CSS counterparts are present in `assets/tokens.css`; source-to-output synchronization has not yet been automated or validated.

### Responsive behavior — Locally verified for the named Phase 1 fixture

Responsive adaptation is compositional, not a scaled desktop canvas. Preserve content order and commerce actions first; then adjust type scale, crop, layering, and motion intensity. Art-directed overlap must not cause clipped controls or horizontal page overflow. Mobile alternatives may simplify layering and use a different crop without changing product meaning.

## Token strategy — Implemented; manual synchronization remains

Canonical sources:

```text
design-system/tokens/
├── primitive.tokens.json
├── semantic.tokens.json
├── typography.tokens.json
├── motion.tokens.json
└── component.tokens.json
```

All files use the Design Tokens Community Group shape with `$type`, `$value`, and `$description`. Primitive tokens hold raw scales. Semantic tokens alias primitives by intent (`color.text.primary`, not `homepage-white`). Typography and motion files hold their respective reusable decisions. Component tokens are allowed only where a stable shared contract cannot be expressed cleanly through semantic tokens; they are not a destination for every CSS value.

Current flow:

```text
DTCG JSON (canonical) → committed assets/tokens.css → assets/theme.css and section/component styles
```

No token build tool is present. The committed CSS output identifies the JSON files as canonical; future changes must keep both synchronized until a lightweight generator is justified. Merchant settings override supported runtime custom properties for fonts, background, foreground, and accent without becoming a second canonical token catalogue.

## Motion and accessibility rules — Locally verified in the static fixture

Motion reads like a signal: directional, brief, hierarchy-led, and tied to a state or narrative beat. Vendored GSAP 3.13 and ScrollTrigger provide the decorative layer while native scrolling remains canonical. `assets/motion-core.js` owns scoped registration, initialization, `gsap.matchMedia()` branches, refresh, and cleanup; `assets/theme.js` owns Theme Editor event wiring and independent UI custom elements.

Required invariants:

1. Content, links, product discovery, variant selection, add-to-cart, cart, and checkout remain usable when JavaScript or animation is absent.
2. Each section initializes once, destroys its observers/listeners/ScrollTriggers on unload, and can reinitialize after a Theme Editor render.
3. Favor transforms and opacity; avoid animation that repeatedly reads and writes layout or creates needless triggers.
4. `prefers-reduced-motion` removes scrub dependencies, large parallax, loops, and exaggerated reveals. It preserves content, reading order, state changes, and focus movement.
5. Keyboard access, visible focus, semantic controls, useful alternative text, labeled forms, legible product identity/price, and accessible status feedback are release requirements, not polish.
6. ARIA supplements native semantics only when necessary. Motion cannot be the only way a state is communicated.

## Component and section contracts

These contracts describe the current Round 2 source. They were first exercised through the Shopify CLI development theme with the store's three original products. Add-to-cart with an available variant was verified in Phase 3, and the actual Theme Editor UI was exercised on 2026-09-23 (see the case study). Production performance remains unmeasured.

### Editorial product card — Commerce component

- **Surface:** `snippets/product-card.liquid`.
- **Anatomy:** linked responsive primary media, optional second product image, editorial index, lifecycle badge from `snippets/product-status.liquid` (Phase 14), title, price/compare-at price, and the shared `snippets/quick-add.liquid` action (single-variant add or an options link).
- **Fallback:** normal product links and DOM images remain canonical. Cards with a second image crossfade to it on hover when WebGL is unavailable; reduced motion keeps this state change effectively immediate.

### Header, navigation, and cart drawer — Sections + primitive behavior

- **Surfaces:** `sections/header.liquid`, `sections/cart-drawer.liquid`, and `assets/theme.js`.
- **Header:** centered merchant logo/wordmark, menu on the left, search/account/bag on the right, transparent homepage state, and blurred scrolled/non-home state.
- **Navigation:** native modal dialog; opening moves focus to Close, Escape/backdrop/Close dismiss it, `aria-expanded` is synchronized, and focus returns to the trigger.
- **Commerce mega menu (Phase 14):** see its own contract below.
- **Search:** the Search link opens the search command (Phase 13, see below) and stays a `/search` link without JavaScript.
- **Cart:** the normal `/cart` link remains the fallback. JavaScript progressively opens a modal drawer, refreshes it through the Section Rendering API, updates quantities through `/cart/change.js`, and updates the header count. Since Phase 14 the drawer swaps only its `data-cart-region` parts (see Bag below).

### Kinetic hero — Authored section + motion behavior

- **Surfaces:** `sections/kinetic-hero.liquid` and `assets/kinetic-hero.js`.
- **Media fallback:** merchant image blocks, then current product media, then theme-owned placeholder art; five layers are always present.
- **Interaction:** every `threshold` pixels of desktop pointer movement promotes the next layer and drops it at the pointer. The other layers stay where they were dropped, so the path leaves a spaced trail of cards; nothing follows the pointer continuously (D-029). Pointer leave returns the stack to its right-side resting composition. Coarse-pointer input advances on a non-interactive tap. Reduced motion retains a static readable stack.
- **Merchant controls:** up to seven desktop/mobile image pairs, copy, CTA, optional quiet secondary link, height, pointer threshold, and section colors.
- **Content source:** `custom` (default) keeps the authored copy with product media from all products. `collection` draws the stack from a selected collection, and each blank eyebrow, heading, body or CTA link falls back to that collection's title, product count, description or URL. The homepage uses collection mode on Drop 001 with the authored heading kept.
- **LCP:** the last layer paints on top of the stack and is the LCP image, so it alone carries `fetchpriority="high"`.
- **Entry contract (D-056):** the stage carries `data-entry-media` and the `fetchpriority="high"` layer carries `data-entry-anchor`. The Signal Acquisition entry corrupts the former and waits for the latter's decode. The hero is not a `[data-motion-scope]`, so it has no intro timeline; the entry's tear is its intro.

### Editorial product grid — Section

- **Surface:** `sections/editorial-product-grid.liquid`.
- **Modes:** real product data from a manual product list, selected collection, or `collections.all`; or explicitly non-purchasable editorial placeholders.
- **Composition:** four layouts. `aligned` and `staggered` three-card desktop grids become dense two-column mobile grids. `feature` gives the first product a large display-titled card with the rest stacked beside it, and collapses to one full-width lead plus two-up on mobile. `strip` is a numbered horizontal object index on native scroll-snap with square media, exposed as a focusable named region. The homepage uses staggered (Current Transmission), feature (Night Uniform), and strip (Hard Goods), so three product moments no longer share one pattern.

### Homepage brand-world sections — Sections

The homepage alternates commerce, atmosphere, story and evidence rather than repeating product grids (D-018). Each section below is merchant-addable through a preset and uses only `--ad-*` tokens plus the per-section `accent` setting.

- **Release record** (`sections/release-record.liquid`): one home for the release's facts. Product count, in-stock count, colourways (from options named `Color`/`Colour`) and status are derived from the selected collection; only the release code, optional date and copy are authored. Optional frame blocks form a native horizontal scroll-snap strip with a CSS-only "Frame pending" state. Default anchor `#field-record`.
- **Signal frame** (`sections/signal-frame.liquid`, art-direction exception): full-bleed image with atmosphere lines, heading, CTA and up to six annotations at merchant-set coordinates, which collapse to a numbered list under the image below 48rem. An annotation linked to a product can read that product's `custom.feature_list` entry instead of typed copy. With a featured product it also shows the descriptor and up to five specifications, and its CTA defaults to the product's `#field-manual`. Used twice: campaign interlude and field test. Blank images render a CSS-only pending frame.
- **Manifesto** (`sections/manifesto.liquid`, art-direction exception): viewport-scale heading, off-grid supporting copy, numbered pillar blocks. On the light tone the accent becomes a bar under ink text, because signal red fails 3:1 on the inverse background.
- **Loadout teaser** (`sections/loadout-teaser.liquid`, commerce section): a real bundle product plus a merchant-listed component list (Liquid cannot read bundle components). Object count comes from the list; combined variant (shipping) weight is summed from each component and shown only when every component has one; bundle price shows its real compare-at.
- **Field notes** (`sections/field-notes.liquid`): numbered editorial index of a Shopify blog with date, first tag, optional excerpt and image. With no blog or no articles it shows "No field notes published yet" instead of sample entries.
- **Footer:** "End transmission" copy through settings only; the existing newsletter and wordmark carry the close.

### WebGL product reveal — Motion behavior

- **Surface:** `assets/webgl-product-reveal.js` with one page-level canvas in `layout/theme.liquid`; the canvas is temporarily mounted inside the active media element.
- **Budget:** one context, one program/buffer, at most 12 media targets, two textures per target, 96 MiB total estimated texture storage, and DPR capped at 1.5 desktop and 1 mobile.
- **Runtime:** Product cards remain in normal document flow with no card-level fade, translation, fixed layer, or sticky layer. An `IntersectionObserver` queues a one-time block-glitch reveal when each media target enters the viewport. Targets that arrive within 60 ms of each other in the same card container reveal as one batch: the single canvas mounts over the container (`.is-webgl-host`) and draws each card into its own viewport/scissor rectangle with an 80 ms stagger, so a row of four starts together and finishes within about 1.1 s. A card that enters while its container's batch is running joins it. Hover transitions still mount the canvas inside the single card, and a hover ends any running batch instantly. Every fine-pointer entry and leave runs a fresh bidirectional block-glitch transition between the first and second product images. Rendering is request-driven only during a transition; the canvas is then cleared and returned to its page-level parking position while the corresponding canonical DOM image takes over.
- **Failure handling:** shader/program/texture/CORS failure leaves DOM media visible. Context loss restores the primary DOM media immediately. Section unload deletes textures, tweens, observer registrations, queued intros, and pointer listeners; context resources are disposed when no targets remain.

### Commerce templates — Sections

- **Collection:** `sections/collection.liquid` provides a sticky desktop filter/sort column, native GET filtering, two product columns, compact mobile controls, pagination, and empty state.
- **Product:** `sections/product.liquid` provides identity, bounded two-column media gallery, sticky purchase panel, option buttons, quantity controls, native payment button, accordions, and variant URL/state updates.
- **Recommendations:** `sections/product-recommendations.liquid` progressively loads related products through Shopify's recommendation endpoint.
- **Cart/footer:** `sections/cart.liquid` provides editable lines, order note, totals, and checkout; `sections/footer.liquid` provides navigation, newsletter, optional localization, payment methods, and the KOVA wordmark.

### Pending photography — Primitive (Phase 9)

- **Surface:** `snippets/media-pending.liquid`.
- **Contract:** the only stand-in for a product without imagery. Full size on the product page (label plus title, which is `aria-hidden` because the H1 already names the product); compact on cards and cart lines (label only). It never borrows another product's photography (D-013, D-025). Cards without an image carry no `data-webgl-reveal`.

### Loadout line — Commerce component (Phase 9)

- **Surfaces:** `sections/cart.liquid`, `sections/cart-drawer.liquid`, `snippets/cart-line-components.liquid`; rules and pricing in `apps/kova-core/` (D-024, D-026).
- **Contract:** a line carrying `_kova_loadout_platform` is a merged loadout. It shows the transform's title ("Loadout — {platform}"), links to and uses the image of its platform component, lists every component, and exposes one quantity and one Remove control for the whole loadout. Lines with components but no loadout property (native bundles) list their components the same way. Properties starting with `_` are never printed. Shopify's cart line `error_message` is shown when present.

### Loadout builder — Commerce section (Phase 10)

- **Surfaces:** `sections/loadout-builder.liquid`, `snippets/loadout-option.liquid`, `LoadoutBuilder` in `assets/theme.js`; `templates/page.loadout.json` and `templates/product.json` (D-027).
- **Contract:** one platform step and one step per `loadout_slot`. Radios are used for single-item slots, with a "No … module" option when the slot is optional; checkboxes for multi-item slots, where the unchosen products are disabled once the slot is full. Sold-out products and variants cannot be chosen. The summary lists the choices, the separate total, the tier and an estimate labelled as such. The add sends one atomic `/cart/add.js` `{ items }` request with a fresh `_kova_loadout` id and each line's `_kova_slot`, always at quantity 1. On a product page the platform is locked, and the section renders nothing for non-platforms. Without JavaScript a list of product links replaces the form. The functions in `apps/kova-core/` remain the only authority. A link such as `?platform=handle:variant&modules=…` preselects a build (Phase 11). With `field_locker_url` set, a valid build shows "Save to Field Locker", which hands the build to the Field Locker page (D-031).

### Field Locker — App surface: customer account extensions (Phase 11)

- **Surfaces:** `apps/kova-core/extensions/field-locker` (`customer-account.page.render`), `apps/kova-core/extensions/field-locker-order` (`customer-account.order-status.block.render`), `apps/kova-core/shared/field-locker.ts`, `apps/kova-core/shared/account-data.js` (D-030 to D-032).
- **Contract:** the page has four sections: Orders (the latest three, linking to native order pages), Loadouts (saved, then purchased), Equipment and Documents. Every loadout has a "Rebuild in the loadout builder" link. A valid `?loadout&platform&modules` query shows a confirm banner before anything is written. The order block lists the order's loadouts and documents and renders nothing while loading or on failure. Neither extension reads a name, email, address or phone field.
- **Boundary:** the extensions use Polaris web components styled by the store's checkout and accounts branding. `apps/kova-core/scripts/brand-accounts.mjs` copies the theme's token values into that branding (D-033), so `design-system/tokens` stays the only source. A token change needs the script re-run.

### Index filters — Primitive + motion-free behavior (Phase 13)

- **Surfaces:** `snippets/index-filters.liquid`, `IndexFilters` in `assets/theme.js` (D-036).
- **Contract:**
  - Input is a `collection` or `search` object, the form URL and the filtered count.
  - Renders sort, one `details` + `fieldset` per native filter (colour chips when `filter.presentation == 'swatch'`, a struck-through chip when a value has no swatch), active chips from `url_to_remove` with "Clear all", and a `role="status"` count.
  - Control ids come from the parameter name and value.
  - Render it inside an `index-filters` element whose `[data-filters-swap]` regions share names with the response.
- **Fallback:** without JavaScript the form submits by GET, and "Apply view" is visible. With JavaScript, changes swap in place and push history, and below 48rem the panel moves into a native dialog.

### Equipment Index — Section + templates (Phase 13)

- **Surfaces:** `sections/equipment-index.liquid`, `snippets/index-row.liquid`, `templates/collection.index.json`, `templates/collection.index-grid.json`.
- **Contract:**
  - The masthead shows "KOVA / N objects" (the unfiltered count) above a display heading.
  - Rows show number, a 4:5 thumbnail (a small pending frame when there is no photography), name, TYPE, SYSTEM tags, STATUS (Archive as a badge), and price. The name link covers the row, and the thumbnail is decorative. On narrow screens the number sits on the thumbnail's corner.
  - The grid uses the editorial product card.
  - The view is a template choice (`?view=index-grid`), so it switches without JavaScript. The switch links carry the active filters.
  - Settings: view, masthead, eyebrow, heading.
- **Data:** the `custom.index_type`, `custom.systems`, `custom.environments` and `custom.status` metafields (D-035). The Search & Discovery filter set is configured in the admin.

### Search command — Header behavior (Phase 13)

- **Surfaces:** the dialog in `sections/header.liquid`, `assets/search-command.js` (`kova-search`), `sections/predictive-search.liquid` (D-037).
- **Contract:**
  - The header link and the `/` key open a modal dialog with a combobox input and a grouped listbox: Equipment, Field Notes, Collections and Pages, then "Search all results".
  - The arrow keys, Home and End move `aria-activedescendant`. Enter opens the active option or, with none active, submits to `/search`. Escape closes the dialog and returns focus.
  - A polite status gives the suggestion count.
  - The module loads on first open.
- **Fallback:** without JavaScript the header link goes to `/search`. If the module fails to load, the link navigates there. Under reduced motion the dialog opens with no animation.

### Search results — Section (Phase 13)

- **Surfaces:** `sections/search.liquid`, the `search.*` keys in `locales/en.default.json`.
- **Contract:**
  - The masthead shows the query and the result count, with a GET search form.
  - Shared index filters are shown when `search.filters` is not empty.
  - Products render as editorial cards, and articles and pages as Field Note rows.
  - An empty state and a no-query state both link to the Equipment Index.
  - Product filters narrow results to products, which is native behavior.

### Product status — Primitive (Phase 14)

- **Surface:** `snippets/product-status.liquid`, `.status-badge` modifiers in `assets/theme.css`, `.product-card__badge--*` in the card.
- **Contract:**
  - The only place that resolves Archive > Sold out > Low supply > Active (D-040). Formats: `badge`, `card`, `text`, `sr`, `key`.
  - Low supply requires Shopify-tracked inventory with the `deny` policy, at or below `settings.low_supply_threshold`. It never shows a number.
  - Release tags (Drop 001, Drop 002, Limited) stay out of it. Coming is reserved (**Deferred**).
- **Consumers:** product card, index row, predictive search (text), product page (per variant through the variant JSON), bag recommendations (to exclude Archive and Sold out).

### Quick add — Primitive (Phase 14)

- **Surface:** `snippets/quick-add.liquid`, submitted by the global `[data-product-form]` handler in `assets/theme.js`.
- **Contract:** sold out renders nothing; one variant renders Add; one option with `choose_option` renders a select of available values and Add; anything else links to the product page. Refusals appear in the bag; only a failed request falls back to the native post.

### Bag — Commerce component (Phase 14)

- **Surfaces:** `sections/cart-drawer.liquid`, `snippets/cart-line.liquid` (shared with the cart page), `CartDrawer` in `assets/theme.js`.
- **Contract:**
  - The heading, Close and the live region (`[data-cart-live]`) persist; only `[data-cart-region]` parts are replaced on refresh.
  - Focus is restored to the same line control, the neighbouring line after a removal, the new line after a recommendation is added, and the opener when the bag closes.
  - Announcements are selective: bag updated, item added from inside the bag, the free-shipping threshold crossed, and refusals. Only refusals are visible.
  - Merged loadout lines report "Loadout pricing −N%" from the cart's own prices; the theme never estimates a discount.

### Field Supply — Commerce component (Phase 14)

- **Surface:** `snippets/field-supply.liquid`; settings in the Commerce group of `config/settings_schema.json`.
- **Contract:** reads `cart.total_price` against `free_shipping_threshold`, which mirrors the store's shipping rate (D-041). Hidden for an empty bag, an ineligible country or a foreign currency. The sentence carries the state; the bar is `aria-hidden`.

### Complete the system — Commerce component (Phase 14)

- **Surfaces:** `snippets/cart-upsell.liquid`, `snippets/cart-upsell-row.liquid`.
- **Contract:** at most two objects from `custom.compatible_products` of the bag lines (components for loadouts and bundles), excluding anything in the bag, sold out, Archive or the loadout parent; S&D complementary products only as a fallback (D-039). Each row states its reason.

### Purchase dock — Commerce component (Phase 14)

- **Surface:** `#PurchaseDock-<section>` in `sections/product.liquid`, written by `ProductPurchase`.
- **Contract:** a mirror, not a form: its button submits the product form through `form=`. It appears when the form is above the viewport and hides over the footer; it never takes focus; transform/opacity only, none under reduced motion (D-042).
- **Bottom-edge rule:** while visible, the dock publishes `--ad-dock-offset` on the root. Any other fixed bottom UI must sit above that offset, and hide while a modal dialog is open.

### Recent signals — Section (Phase 14)

- **Surfaces:** `sections/recent-signals.liquid`, `sections/recent-signal-card.liquid` (rendered only through the Section Rendering API), `assets/recent-signals.js`.
- **Contract:** handles only, capped at 8, recorded after a 3-second visible dwell, current product excluded, removed and malformed handles pruned. Hidden without JavaScript or history (D-043).
- **Layout (D-049):** a compact history strip, not an editorial grid: hairline top rule, small label heading beside the list, and rows of 4rem thumbnail, title and price with no quick add. Four across on desktop, two below 62rem, one below 30rem.

### Commerce mega menu — Section contract (Phase 14)

- **Surfaces:** `sections/header.liquid` (desktop nav, mobile dialog, `featured` block) and `AfterdarkHeader` in `assets/theme.js`.
- **Source:** the nested Shopify menu assigned in the header (`main-menu`), up to three levels. The first three top-level items fit the desktop bar; the mobile dialog lists all of them.
- **Desktop:** top-level items stay links. An item with children also gets a disclosure button (`aria-expanded`, `aria-controls`) that JavaScript reveals, opening a full-width panel below the header. One panel at a time. Mouse hover opens after 150 ms; touch and pen use the button only. Escape (focus back to the button), a click outside, focus leaving the nav, and opening the menu, search or bag all close it. No ARIA menu roles.
- **Levels:** a second-level link with children becomes a heading with a list; without children it is a large numbered link.
- **Placeholder URLs:** a top-level item whose URL is `#` renders as a label, not a link, and the mobile group omits its "View all" entry. With JavaScript the label has a pointer cursor like the links, and clicking it opens its panel (it never closes it, because hover may already have opened it); the toggle stays the keyboard control.
- **Mobile:** native `<details>` groups inside the menu dialog, opening the active group; the parent link is the group's first entry ("View all").
- **Menu feature block:** image, eyebrow, title and link, placed in a panel chosen by position (1–3), never by matching a title. Selecting it in the Theme Editor opens its panel.
- **Without JavaScript:** toggles and panels stay hidden; the top-level links remain.
- **Motion:** the panel reveal runs only without reduced motion.

### Announcement bar — Section (Phase 14)

- **Surface:** `sections/announcement-bar.liquid`, first in the header group; `snippets/free-shipping-eligible.liquid`.
- **Contract:** shows the first enabled `message` block only; no rotation (D-045). Types Drop, Shipping, Editorial, Product and System set the default label. Shipping writes its own sentence from `free_shipping_threshold` and is skipped where Field Supply's eligibility fails. No qualifying block means no markup.
- **Header offset:** the bar is in the page flow. The fixed header is translated down by the part of the bar still on screen (`--ad-header-shift`, measured with a ResizeObserver), so it never covers it. Without JavaScript the header sits below the bar and scrolls with the page.

### SIGNAL tab — Commerce component (Phase 14)

- **Surfaces:** `sections/signal-tab.liquid` (footer group) and `assets/signal-tab.js`, a module loaded by the section.
- **Contract:** a vertical tab flush with the viewport's left edge (acid background, square, reading bottom to top) that opens a non-modal panel beside it; it never opens by itself (D-046).
- **Phones (below 48rem):** the tab shrinks to a 24 × 72px notch showing a short label ("Msg", its own setting) and the dot (the full label stays as its accessible name). The panel opens as a full-width bottom sheet directly above `--ad-dock-offset`, and the notch hides while it is open. The global button `min-block-size` is reset there, because in vertical writing mode it sets the width.
- **Art-direction exception, "incoming signal":** on the first page of a visit (`sessionStorage`), the tab slides in from the edge after 1.2 s and its indicator pings three times. The indicator stays solid until the tab is opened, then becomes an outline for the rest of the visit. The motion is finite (no loop, so no pause control is needed under WCAG 2.2.2) and removed under reduced motion. Opening focuses the email field; Escape and Close return focus to the button. Hidden while any dialog is open (`body:has(dialog[open])`).
- **Form:** the same `customer` form as the footer, tagged `newsletter,signal-tab`, with a visible label and consent line. Success only on Shopify's `customer_posted=true` redirect; an error list in the returned form is shown and announced; a challenge, non-OK answer or unreadable response falls back to a native post.
- **Storage:** `kova:signal-tab` holds `dismissed` (30 days) or `subscribed` (permanent). Unreadable storage shows the tab. The Theme Editor always shows it.
- **Without JavaScript:** the tab is hidden; the footer form is the path.
- **Layering:** sits above `--ad-dock-offset` through a transform (see the bottom-edge rule).

### Composition model — Theme blocks + section (Phase 8)

**Implemented; verified in the development preview and in the actual Theme Editor UI (2026-09-24).** Safari is **Unavailable** (no macOS or iOS device).

KOVA's reusable art direction has three layers. None of them is a generic page builder.

1. **Snippet primitives** hold implementation reuse and carry no merchant settings.
   - `snippets/display-heading.liquid` renders one reveal line per text line and takes `tag`, `id`, `class`, passthrough `attributes`, and `entities` for rich-text input (`escape_once` instead of `escape`). Fourteen existing sections, the rebuilt page section, and the heading block use it. The field-manual statement stays inline because its source is a multi-line metafield that must remain one line.
   - `snippets/record-list.liquid` renders `Label: value` text as a `<dl>`, with `limit` and `keep_unlabelled`. The PDP specification panel, the signal frame, and the Record block use it.
2. **KOVA theme blocks** (`blocks/kova-*.liquid`) are what merchants compose. Every block renders nothing when its content is blank, and none of them adds JavaScript.

   | Block | Role | Merchant settings |
   | --- | --- | --- |
   | `kova-layout` | Arrangement of child blocks | Stack, three splits, three columns, or overlay on the first block; Tight / Standard / Open spacing; vertical alignment |
   | `kova-eyebrow` | Label | Text, plus an optional collection whose live product count is appended |
   | `kova-heading` | Display heading | Rich text, one paragraph per line with formatting stripped; H1/H2/H3; Title / Display / Statement size; accent last line; reveal on scroll |
   | `kova-text` | Body copy | Rich text; Reading / Narrow width; Body / Lead size; quieter colour |
   | `kova-cta` | One action | Label, link, and Outline / Accent / Underlined style |
   | `kova-media` | Image | Image, phone crop, fallback alt text, shape, caption, drift on scroll. The native focal point sets `object-position` |
   | `kova-record` + private `_kova-record-row` | Label/value facts | Rich-text `Label: value` lines and/or row blocks. On a product template the lines can come from `product.metafields.custom.technical_specifications.value` (verified); `closest.product.metafields…` was rejected on upload |
   | `kova-product` | Commerce | Product and title level; renders `snippets/product-card.liquid` unchanged |

3. **`sections/composition.liquid`** ("Editorial composition") owns tone, accent, width, spacing, and the motion scope, and accepts `@theme` blocks. It has three presets with nested blocks: Split story, Full-bleed statement, and System record.

Rules:

- Arrangement never reorders children with CSS. Reading and focus order are editor order, and the overlay's backdrop is always the first child.
- Only the heading block (reveal lines) and the image block (drift) have motion. Both use the existing `motion-core` hooks, so reduced motion and section lifecycle behave as in every other section. A per-block "Entrance" setting was left out: the card reveal groups every `data-reveal-card` in a scope under one trigger, which would not match what a merchant expects from a per-block setting.
- Every Layout is an inline-size container (`container-type: inline-size`). Heading sizes are capped by their column (`min(token, 14cqi)` for Title, `16cqi` for Display, `10cqi` for Statement), so a long single word such as "BACKPACK" never breaks mid-word in a narrow split column. Wide columns keep the token size.
- The Record block collapses the blank lines that rich-text paragraphs leave between rows, so its "Maximum lines" counts rows.
- Colour is tokens plus the section accent. On the light tone the accented heading line becomes a bar under ink text, the manifesto's contrast rule (D-018).
- `closest.*` is only valid as a setting value, not as a Liquid expression. Blocks that need a resource therefore expose a resource setting (the eyebrow's "Count products in", the product block's "Product"), and templates set it to `{{ closest.collection }}` or `{{ closest.product }}`.
- Dynamic sources are rejected on `textarea` settings, including a template-resource metafield, and `inline_richtext` rejects `<br>`. The heading and record lines therefore use `richtext`, and a dynamic value is stored wrapped, as in `<p>{{ closest.collection.title }}</p>`. Both blocks turn paragraphs and `<br>` into lines, strip the markup, and escape with `escape_once` so rich-text entities such as `&amp;` are not double-encoded.
- An overlay treats a first **Image** block as its backdrop (`:has(> .kova-media:first-child)`). Without an image, which is the case outside the editor when the image is blank, the children fall back to a padded stack instead of taking on backdrop styles.
- The signature sections (hero, manifesto, signal frame, release record, editorial grid, and the PDP story sections) stay art-direction exceptions. They use the snippets and keep their section-local blocks, so no template data moved (D-022).

Data-backed compositions:

- **`templates/collection.story.json`:** a composition masthead whose H1, lead text, image, and object count come from the collection. The collection section's new "Show collection title and description" setting is off, so each fact appears once. The template is not assigned to any collection yet.
- **`templates/page.system.json`:** an H1 from the page title, a system record, and a three-column product row; the page section's new "Show page title" setting is off. The page is not created yet: the copy is drafted from catalogue facts and awaits approval (D-020 rule).

### Lifecycle contract

1. A section opts into decorative motion with `data-motion-scope`; hooks remain declarative and commerce-independent.
2. `AfterdarkMotion.init(root)` destroys any prior scope before creating a `gsap.matchMedia()` context.
3. `AfterdarkWebGL.init(root)` reuses the page context and ignores existing targets; `destroy(root)` deletes only resources owned by that root.
4. `prefers-reduced-motion` creates no reveal ScrollTriggers or WebGL textures and leaves the DOM hierarchy visible.
5. `shopify:section:load` initializes both layers; unload destroys both; select and load/font events refresh layout-dependent state.
6. Repeated section load is idempotent: the exercised homepage remained at three motion scopes, three WebGL targets, and nine ScrollTriggers after reloading the same section twice. After the 2026-09-24 homepage restructure, synthetic unload/load of all eight non-hero sections twice kept 9 motion scopes and 14 ScrollTriggers (0 under reduced motion) with no page errors.
7. Card reveals animate opacity only. `autoAlpha` set `visibility: hidden` on unrevealed cards, which removed links inside them from the tab order.
8. A motion hook must not share an element with inline positioning styles: reduced motion runs `clearProps: 'all'`, which removes the element's whole `style` attribute.

## Controlled art direction

The reusable core owns type roles, color meaning, spacing rhythm, commerce states, interaction states, responsive principles, and accessibility. Sections may deliberately use full-bleed imagery, extreme type scale, unexpected crops, overlap, or grid breaks when they reinforce product storytelling.

An exception is acceptable only when:

- it is confined to the authored composition;
- its intent can be explained;
- it does not obscure product identity, price, options, add-to-cart, cart state, or checkout path;
- content remains coherent on small screens and in reduced motion;
- it is not generalized until repeated use proves a shared abstraction.

Nightkidz is a quality reference, not a template. The transferable principles are cinematic hierarchy, signal-like motion, high-contrast full-bleed media, oversized typography, modular product storytelling, and continuity between interaction states. Branding, assets, typefaces, source, exact layouts, and exact interactions are excluded.

## Inventory

Statuses below use Shopify CLI Theme Check and the live local Shopify CLI development preview. The homepage sections and the product template were also exercised in the actual Theme Editor UI on 2026-09-23. None of this implies production performance.

| System item | Classification | Code surface | Status |
| --- | --- | --- | --- |
| Skeleton theme shell, Liquid routing, JSON-template structure | Foundation | `layout/`, `templates/` | **Locally verified:** Theme Check reported no offenses |
| Responsive image and metadata helpers | Primitive | `snippets/image.liquid`, `snippets/meta-tags.liquid` | **Implemented:** exercised with the store's current product media |
| DTCG canonical token hierarchy | Token | `design-system/tokens/*.tokens.json` | **Implemented; manual JSON/CSS synchronization remains** |
| Token custom properties | Token | `assets/tokens.css` | **Implemented** |
| Global visual/accessibility foundation | Foundation | `assets/theme.css` | **Locally verified:** desktop, 390×844 mobile, and reduced-motion paths |
| Header and modal navigation | Section | `sections/header.liquid`, `assets/theme.js` | **Locally verified:** scroll state, focus entry/return, Escape cleanup, mobile/desktop layouts. **Locally verified (2026-09-25):** menu and bag entrance animations (panel slide, staggered menu links, backdrop fade), removed under reduced motion (D-052) |
| Progressive cart drawer | Section / commerce component | `sections/cart-drawer.liquid`, `assets/theme.js` | **Locally verified:** empty state, Section Rendering refresh, open/close; quantity, removal and stock-limit mutations verified in Phase 14 |
| Kinetic image-stack hero | Section / motion behavior | `sections/kinetic-hero.liquid`, `assets/kinetic-hero.js` | **Locally verified:** deterministic first and repeated pointer entry, spaced trail from the first hover after load (2026-09-24, D-029), directional layer promotion, right-side rest, touch advance, fallback layers, reduced-motion static state |
| Editorial category grid | Section | `sections/editorial-product-grid.liquid` | **Locally verified (2026-09-24):** three homepage instances in product mode using the staggered, feature, and strip layouts at 1440px and 390px; editorial-block mode remains available but unused. **Locally verified (2026-09-25):** the feature layout's lead card spans only as many rows as there are stacked cards, so both columns end on one line (D-050) |
| Hero collection mode | Section setting | `sections/kinetic-hero.liquid` | **Locally verified (2026-09-24):** Drop 001 images, CTA to the collection, authored heading kept; custom mode rendered in the preview. Toggling inside the actual Theme Editor UI has not been exercised |
| Release record | Section | `sections/release-record.liquid` | **Locally verified (2026-09-24):** 16 products (the bundle counts as one), 16/16 in stock, Black / Ash Gray, Active, three pending frames. **Locally verified (2026-09-25):** all three frames carry campaign photography (D-048) |
| Signal frame | Section / art-direction exception | `sections/signal-frame.liquid` | **Locally verified (2026-09-24):** two homepage instances, positioned annotations on desktop and list fallback on mobile, field-test annotations and specifications read from Blacksite Shell Jacket data. **Implemented (2026-09-25):** campaign photography on both frames with separate phone crops, annotations re-placed on the garments and set on a translucent dark plate for legibility (D-048); checked at 1280, 1440 and 1920 wide and 390 phone with reduced motion |
| Manifesto | Section / art-direction exception | `sections/manifesto.liquid` | **Locally verified (2026-09-24):** light tone, three pillars, accent bar passes the Lighthouse contrast audit |
| Loadout teaser | Commerce section | `sections/loadout-teaser.liquid` | **Locally verified (2026-09-24):** Night Transit Set 03, three linked components, combined variant weight 518 g (shown as 1.14 lb in the store unit), $169.00 vs $188.00 compare-at. Optional "Build your own" link to the builder page (Phase 10). **Locally verified (2026-09-25):** copy is centred against the image, and the image is capped to the viewport on desktop (D-050) |
| Field notes | Section / snippet | `sections/field-notes.liquid`, `snippets/field-note-row.liquid` | **Locally verified (2026-09-24):** four published articles in the `field-notes` blog render as numbered rows; the empty state was verified before publication. The row snippet is shared with the blog listing |
| Blog and article pages | Sections | `sections/blog.liquid`, `sections/article.liquid` | **Locally verified (2026-09-24):** blog listing reuses the Field Notes row; article page has an editorial header, a reading-width body, and a back link; comments markup retained but untested (comments are off on the blog) |
| Single-context WebGL reveal | Motion behavior | `assets/webgl-product-reveal.js` | **Locally verified:** static document-flow cards, localized absolute canvas, queued viewport glitch reveal, three repeatable bidirectional hover cycles, request-driven rendering, DOM-image handoff, reduced-motion and context-loss fallbacks; textures prepared only within half a viewport of a card |
| Index views | Primitive | `assets/theme.css` (`.index-views`), `snippets/index-query.liquid` | **Locally verified (2026-09-25):** the Index / Grid switch shared by the Equipment Index and every collection page. Each view is a real URL that keeps the current sort and filters (D-052) |
| Legal page frame | Template-level snippet | `snippets/legal-page.liquid`, `layout/theme.liquid`, footer policy links | **Locally verified (2026-09-26):** the privacy policy renders in the frame at 1440 and 390px, with the masthead clear of the fixed header and the policy index linked. The other policies render once they're published (D-053) |
| Fit text | Primitive | `assets/theme.js` (`fit-text`), used by the footer wordmark | **Locally verified (2026-09-26):** sizes single-line display text to its container's content width, optionally only within a `media` query; refits on resize and on font load; CSS size stays as the fallback. The footer wordmark fits on phones only (D-055) |
| Link row | Primitive | `assets/theme.css` (`.link-row`), used by the editorial grid, release record and field notes | **Locally verified (2026-09-25):** one shared full-width "Shop …" row. On hover or focus the label steps in, the arrow lifts and takes the section accent, and an accent rule draws along the bottom. Inverse tones use the text colour. Under reduced motion there's no movement, only the colour and the rule (D-050) |
| Editorial product card | Commerce component | `snippets/product-card.liquid` | **Locally verified:** responsive primary/alternate media, current catalogue prices/availability, WebGL hover enhancement, and CSS fallback; one tab stop per card (media link hidden as a duplicate), sold-out state announced, configurable `h2`/`h3` title |
| Collection browsing | Section | `sections/collection.liquid` | **Locally verified:** current products, filter/sort controls, desktop/mobile layouts. Uses the shared index filters since Phase 13 |
| Index filters | Primitive + behavior | `snippets/index-filters.liquid`, `assets/theme.js` | **Locally verified (2026-09-25):** in-place swaps with focus kept, chips, live count, Back/Forward, mobile dialog at 390px, GET fallback without JavaScript, flat request count after simulated section reloads. The Colour filter is live with swatches (labelled "Cor" for now); selecting a swatch has not been exercised |
| Equipment Index | Section / templates | `sections/equipment-index.liquid`, `snippets/index-row.liquid`, `templates/collection.index*.json` | **Locally verified (2026-09-25):** 21 rows with thumbnails (16 photographed, 5 pending frames) at 390/768/1440/1920px with no overflow, grid view keeps filters, Lighthouse accessibility 100. The TYPE/SYSTEM/ENVIRONMENT/STATUS filters are configured in Search & Discovery but **not yet rendered on the storefront** (still processing on 2026-09-25); verification is in the Phase 13 backlog. **Still not rendered (2026-09-25):** the products carry the values and the definitions have storefront access, but Shopify returns only availability, price and Color, so the cause is on the Search & Discovery side. **Locally verified (2026-09-25):** every collection now has the Index/Grid switch (`?view=index`), keeping its own title, and rows show the edition size (D-052) |
| Index facet data | Foundation (Shopify custom data) | 4 product metafield definitions; `apps/kova-core/scripts/seed-index-facets.mjs` | **Implemented (2026-09-25):** choice-validated, `PUBLIC_READ`, approved values on 21 products (D-035) |
| Status badge (Archive, Sold out, Low supply) | Primitive | `.status-badge` in `assets/theme.css` | **Locally verified (2026-09-25):** Archive shown on the row, the card and the product page during a temporary check; no product is archived (D-038). Low supply added in Phase 14 |
| Product status resolver | Primitive | `snippets/product-status.liquid` | **Locally verified (2026-09-25):** Low supply on a 2-unit variant, Sold out on Ash Gray, no badge on stocked variants; one resolver on cards, rows, predictive search, the product page and bag recommendations (D-040). The rewritten Archive path was **not re-checked live** |
| Quick add | Primitive | `snippets/quick-add.liquid`, `assets/theme.js` | **Locally verified (2026-09-25):** single-variant add, single-option select offering only available values, Options link for multi-option products (D-039) |
| Bag regions, focus and announcements | Commerce component | `sections/cart-drawer.liquid`, `snippets/cart-line.liquid`, `assets/theme.js` | **Locally verified (2026-09-25):** focus kept after Update, moved after Remove and after a recommendation add, returned to the opener on Escape; selective announcements; stock-limit refusal shown after re-reading the bag; axe-core clean with the drawer open. Loadout pricing line **not verified** (the cart transform did not merge on 2026-09-25) |
| Field Supply | Commerce component | `snippets/field-supply.liquid`, Commerce settings | **Locally verified (2026-09-25):** below ($22 remaining, 68%), crossing announced once, unlocked, cart page, no-JS cart page. Non-US gate **not verified** (single US market) (D-041) |
| Complete the system | Commerce component | `snippets/cart-upsell.liquid`, `snippets/cart-upsell-row.liquid` | **Locally verified (2026-09-25):** curated Works with picks with reasons, re-filtered after adds, in-bag objects, bundle components and sold-out values excluded, S&D fallback on Afterimage Long Sleeve (D-039) |
| Purchase dock | Commerce component | `sections/product.liquid`, `assets/theme.js` | **Locally verified (2026-09-25):** show/hide by observer, footer hide, state mirrored across variants, add from the dock, 375px single row, reduced motion, hidden without JavaScript, axe-core clean, one observer after simulated section reloads (D-042). Theme Editor UI **not verified** |
| Recent signals | Section | `sections/recent-signals.liquid`, `sections/recent-signal-card.liquid`, `assets/recent-signals.js` | **Locally verified (2026-09-25):** first visit hidden, dwell recording, current product excluded, most recent first, removed and malformed handles pruned (D-043). **Locally verified (2026-09-25):** compact strip at 1440 and 390 (D-049). Theme Editor UI **not verified** |
| Commerce mega menu | Section contract + header behavior | `sections/header.liquid`, `assets/theme.js` | **Locally verified (2026-09-25)** against the store's nested `main-menu`: hover intent (closed at 80 ms, open after 150 ms), keyboard open/Tab into panel/Escape with focus return, outside click, Tab out, `/` search closes it, touch opens only through the toggle, `#` parent renders as a label, mobile `<details>` groups at 390px, no JS keeps plain links, axe-core clean with a panel open, one set of listeners after three simulated header reloads (D-044). The Menu feature block and the Theme Editor UI **not verified**. Panel and tab reveals are removed under emulated reduced motion |
| Announcement bar | Section | `sections/announcement-bar.liquid`, `snippets/free-shipping-eligible.liquid` | **Locally verified (2026-09-25):** first enabled message shown, header offset at 1440px and 390px (two-line bar), header back at the top after scrolling, no-JS header below the bar, axe-core clean (D-045). The Shipping message, zero blocks and the non-US skip **not verified** |
| SIGNAL tab | Commerce component | `sections/signal-tab.liquid`, `assets/signal-tab.js` | **Locally verified (2026-09-25):** left-edge vertical tab with a once-per-visit arrival and three pings (none under reduced motion, not replayed on the next page, indicator marked read after opening), 24px phone notch and bottom sheet at 390px, full tab kept at 768px, open with focus in the field, Escape with focus return, hidden while the bag is open, native validation on a bad email, 30-day dismissal persisted across reload, above the purchase dock, axe-core clean, one set of listeners after simulated reloads (D-046). **A successful signup is not verified:** headless Chromium receives Shopify's bot challenge (HTTP 403), which correctly triggers the native fallback |
| Search command | Header behavior | `sections/header.liquid`, `assets/search-command.js`, `sections/predictive-search.liquid` | **Locally verified (2026-09-25):** the `/` key, lazy module, grouped suggestions, keyboard-only open of a product, Escape with focus return, announcements, 390px layout, reduced motion |
| Search results | Section | `sections/search.liquid` | **Locally verified (2026-09-25):** grouped results, product filters, empty and no-query states, Lighthouse accessibility 100 |
| Product purchase surface | Section | `sections/product.liquid`, `assets/theme.js` | **Locally verified:** real media/options, linked colour swatches, variant and quantity state, genuine sold-out state on the unproduced colourway, and a successful add-to-cart on single-variant, multi-variant, and bundle products after the single-variant matcher fix. Custom-data presentation (descriptor, positioning, drop code, specifications, fit, material, compatibility, edition, package, reference guide) renders on five representative PDPs; the Features list renders five entries on all 16 products after the catalogue data fix |
| Product recommendations | Section | `sections/product-recommendations.liquid` | **Locally verified (2026-09-24):** the section requests the curated `complementary` intent by default (merchant-selectable); a corrected bug had hardcoded `intent=related`, which served Shopify's generic `collection_fallback` picks on every product; tone setting added (dark on the product template) |
| Product field manual | Section / art-direction exception | `sections/product-field-manual.liquid` | **Locally verified:** positioning as a display statement, full description only when it adds to the positioning, numbered build notes, second product image as a figure or an enlarged detail crop for single-image products |
| Product edition record | Section / art-direction exception | `sections/product-edition.liquid` | **Locally verified:** edition quantity as the display figure (drop code when unnumbered), record list, release note, decorative CSS tick band (one gradient, `aria-hidden`) |
| Product compatibility | Section / art-direction exception | `sections/product-compatibility.liquid` | **Locally verified:** current object as an accent-outlined anchor tile, joined by `+` to up to three compatible products rendered with `snippets/product-card.liquid`; column count follows the data |
| Product FAQ | Section | `sections/product-faq.liquid` | **Locally verified:** merchant question blocks on native `<details>`, optional shipping/returns question that links store policies when they exist and otherwise uses the checkout-confirmation fallback |
| Product reviews | Section | `sections/product-reviews.liquid` | **Implemented; empty state verified:** reads only Shopify's standard `reviews.rating`/`reviews.rating_count` metafields and `@app` review blocks; no review app is installed. **Implemented (2026-09-25):** Sample review blocks (16, on 8 products; portfolio content, unlabelled at the user's request) show until real ratings or a review app exist; they never feed the rating summary or structured data (D-051) |
| Corrupted-signal page transition | Motion behavior | `snippets/page-transition.liquid`, `snippets/signal-filters.liquid`, `assets/page-transition.css`, `assets/page-transition.js`, `layout/theme.liquid` | **Locally verified in Chromium 151 (2026-09-24):** cross-document view transition with SVG RGB-split/band-tear filters, scanline sweep, card-to-PDP image morph, reversed tear on back navigation, single-name guard, bfcache cleanup, hover prefetch; off for reduced motion, in the Theme Editor, and by the Motion theme setting. **Unavailable in Firefox 154** (no cross-document view transitions; plain navigation). **Changed 2026-09-26:** the header and announcement bar corrupt with the page instead of staying pinned (D-017 revision); checked headless in Chromium from the top and from a scrolled page | **Changed 2026-09-26:** the SVG filters moved to `snippets/signal-filters.liquid`, shared with the entry sequence and rendered once near the top of `<body>`; the transition was re-checked headless from home to a PDP and back (D-056)
| Signal Acquisition entry | Motion behavior | `snippets/entry-signal.liquid`, `assets/entry-signal.js`, `assets/entry-signal.css`, `layout/theme.liquid` | **Locally verified in headless Chromium 151 (2026-09-26, D-056):** first homepage view per session; a veil over the rendered hero with fragment bands, a lock beat and a band tear into the hero; readiness from the anchor image's decode and fonts, a 3s cap, a boot failsafe 4.5s after the first frame, release at DOMContentLoaded if the controller fails, skip on intent, reduced-motion card (about 1.1s); LCP element unchanged and CLS unchanged; about 2.25s from first frame to hero on a warm cache (slowed for readability on 2026-09-27). Off in the Theme Editor, on reload, back/forward, hash URLs and repeat pages. Full sequence also completes in Firefox 154. **Not verified:** Safari, reduced motion in Firefox, screen reader, real Theme Editor UI |
| Catalog custom-data model | Foundation (Shopify custom data) | Shopify metafield/metaobject definitions; recorded in `docs/case-study/README.md` | **Implemented:** 10 product metafield definitions and 3 reusable profile metaobject definitions, all `PUBLIC_READ`; 24 profile entries from Phase 3 plus 4 from Drop 002 (Phase 9) |
| Drop 001 catalogue and collections | Templates / merchandising | Shopify products, collections, files | **Locally verified:** 16 published products, 62 variants, 7 published smart collections rendering 16/4/3/5/3/2/3 cards with no horizontal overflow |
| Cart page and global footer | Sections | `sections/cart.liquid`, `sections/footer.liquid` | **Locally verified:** empty cart, newsletter/localization rendering conditions, desktop/mobile layout |
| Display heading and record list primitives | Primitive | `snippets/display-heading.liquid`, `snippets/record-list.liquid` | **Locally verified (2026-09-24):** normalized `<main>` HTML of home, three PDPs, Drop 001, and the blog is byte-identical before and after the refactor |
| KOVA theme blocks | Theme blocks | `blocks/kova-*.liquid`, `blocks/_kova-record-row.liquid` | **Verified in the actual Theme Editor (2026-09-24):** block picker, nested add, remove, and reorder; dynamic sources connected through the picker; editor pending states. Also rendered through two templates at 390/768/1440/1920px |
| Editorial composition | Section | `sections/composition.liquid` | **Verified in the actual Theme Editor (2026-09-24):** all three presets added; setting changes and hide/show re-render with flat listener counts |
| Collection story template | Template | `templates/collection.story.json` | **Locally verified (2026-09-24)** via `?view=story` on Drop 001: collection title as the only H1, live count 16, description; Lighthouse accessibility 100. **Planned:** assignment to a collection |
| KOVA system page template | Template | `templates/page.system.json` | **Locally verified (2026-09-24)** via `?view=system` on an existing page; Lighthouse accessibility 100. **Planned:** page creation after copy approval |
| Pending photography frame | Primitive | `snippets/media-pending.liquid` | **Locally verified (2026-09-24):** Drop 002 product pages, cards and cart lines at 390/1440px with no overflow; WebGL reveal skipped on cards without images; Lighthouse accessibility 100 on two pending PDPs and a mixed collection. Since 2026-09-26 no listed product uses it; it remains the fallback for unphotographed products |
| Loadout and bundle cart lines | Commerce component | `sections/cart.liquid`, `sections/cart-drawer.liquid`, `snippets/cart-line-components.liquid` | **Locally verified (2026-09-24):** merged loadout lines on the cart page and drawer (platform image and link, all components, no `_` properties), keyboard order, no overflow at 390/1440px after fixing a pre-existing 6px mobile overflow. Checkout rendering **not verified** (password-protected dev storefront) |
| Loadout rules | Foundation (Shopify custom data) | `loadout`, `loadout_slot` metaobjects; `apps/kova-core/scripts/sync-rules.mjs` | **Implemented (2026-09-24):** one loadout (four platforms), three slots, 10%/15% tiers; compiled to the cart transform and validation |
| KOVA Core loadout functions | App / Shopify Functions | `apps/kova-core/extensions/loadout-merge`, `loadout-guard`, `shared/loadout-rules.ts` | **Verified on the dev store through `shopify app dev` (2026-09-24):** 12 transform and 14 validation fixtures pass; live merges at the tier price, tampered, oversized and direct-parent carts refused, native bundle unaffected. **Deployed and released** as `kova-core-1.0.0` (2026-09-24, D-028); live merges and refusals re-verified with no `app dev` running |
| Drop 002 catalogue | Templates / merchandising | Shopify products, metaobjects, the `all` smart collection | **Implemented (2026-09-24):** five active products (21 KOVA products in total), photography **Implemented (2026-09-26)**: four images each; `/collections/all` served by a smart collection that excludes the loadout parent |
| Loadout builder | Commerce section | `sections/loadout-builder.liquid`, `snippets/loadout-option.liquid`, `assets/theme.js` | **Locally verified (2026-09-24):** builder page and platform product pages at 390/1440px with no overflow, live adds merged at the tier price and matching the estimate, invalid groups refused, no-JS fallback. Theme Editor UI, Lighthouse and checkout **not verified**. On the product page it now sits after the Edition record on a dark tone (D-052) |
| Field Locker page | App surface (customer account extension) | `apps/kova-core/extensions/field-locker`, `shared/field-locker.ts`, `shared/account-data.js` | **Verified through `shopify app dev` (2026-09-25):** seeded orders, a purchased loadout regrouped from order lines, equipment, 8 equipment rows, 3 guide PDFs (one fetched: 200 `application/pdf`), 5 pending guides and 7 care notes; save and remove through the `$app:saved_loadouts` metafield; a signed-out save link survives sign-in and shows the confirm banner; no overflow at 390px. **Verified in production (2026-09-25)** in `kova-core-1.1.1` (D-034): the builder save link survives sign-in, then save, reload and remove; documents and the order-block link work |
| Field Locker order block | App surface (customer account extension) | `apps/kova-core/extensions/field-locker-order` | **Verified through `shopify app dev` (2026-09-25)** on order #1002: loadout composition, four pending guides, link to the Field Locker. **Verified in production (2026-09-25)** after release and placement in the editor |
| Builder Field Locker hand-off | Commerce section setting | `sections/loadout-builder.liquid`, `LoadoutBuilder` in `assets/theme.js` | **Locally verified (2026-09-25):** preselect from a Field Locker link at 390/1440px (variant kept, estimate $387.60), save link hidden for invalid builds, malformed parts ignored, platform lock kept on product pages; the save link decodes unchanged in the shared module. `field_locker_url` points at the activated page; verified end to end in production (D-034) |
| Checkout and accounts branding | Foundation (Shopify branding) | `apps/kova-core/scripts/brand-accounts.mjs` | **Applied (2026-09-25):** token colours, Work Sans, uppercase tracked headings, square hairline components on accounts, sign-in and checkout; Field Locker, order page and sign-in screenshots at 1280/390px. Checkout rendering **not verified** (password-protected storefront) |
| Figma variables, components, and code mappings | Design tooling | Figma library | **Unavailable** |

Shopify CLI Theme Check inspects the current theme without offenses. `node --check` passes for `assets/theme.js`, `assets/search-command.js`, `assets/recent-signals.js`, `assets/motion-core.js`, `assets/kinetic-hero.js`, `assets/entry-signal.js`, and `assets/webgl-product-reveal.js`. The Skeleton `text` and `group` theme blocks and `custom-section` were removed in Phase 8 (D-023); the KOVA blocks replace them.

## Figma synchronization plan — Unavailable now

No Figma/Codex integration is mounted in this environment. No Figma file, variable collection, component library, generated screen, or Code Connect mapping has been created. Code-side work should continue without blocking.

When official tooling becomes available:

1. Import or recreate primitive and semantic DTCG tokens as Figma variables; record aliases and any unsupported token types.
2. Establish collections/modes for foundations before building components; avoid a second independent naming scheme.
3. Recreate typography roles and motion annotations, including reduced-motion equivalents.
4. Build only meaningful primitives and commerce components with intentional properties and variants.
5. Add authored section examples separately from reusable components so art-direction exceptions remain visible.
6. Map important pairs such as Editorial Product Card ↔ `snippets/product-card.liquid`, Kinetic Hero ↔ `sections/kinetic-hero.liquid`, Index Row ↔ `snippets/index-row.liquid`, and Search Command ↔ the header dialog plus `sections/predictive-search.liquid` (states: empty, results, active option, no match); document legitimate abstraction mismatches.
7. Compare token names, component anatomy, states, responsive behavior, merchant controls, accessibility notes, and implementation status.
8. Mark each inventory item as Figma-only, code-only, synchronized, or intentionally divergent, with the date and tool used.
9. Capture evidence of the synchronization; do not backfill or imply artifacts that were not generated.
