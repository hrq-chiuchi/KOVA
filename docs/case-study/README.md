# AFTERDARK SUPPLY case-study record

## Evidence policy

This is a working evidence record, not a retrospective success story. Claims distinguish source inspection, project setup records, reference-derived principles, static-fixture verification, and Shopify CLI development-preview verification. Phase 2 was exercised against the store's three current products on the local development theme. The actual Theme Editor UI, an available-variant add-to-cart transaction, production deployment, Lighthouse, Core Web Vitals, usability, conversion, animation-frame-rate, Figma-artifact, and live-store outcome remain unverified.

## Context and challenge

AFTERDARK SUPPLY is intended to test whether a premium, experimental, art-directed ecommerce experience can remain a native Shopify Online Store 2.0 theme. The core challenge is not motion in isolation; it is preserving merchant editing, understandable commerce, keyboard and reduced-motion access, responsive behavior, and maintainable Liquid while creating a distinctive editorial experience.

Constraints established by the brief:

- Shopify Liquid, JSON templates, native commerce infrastructure, and Theme Editor compatibility remain canonical.
- Vanilla JavaScript is preferred; the storefront is neither React nor headless.
- Art direction may challenge conventional grids but cannot hide product identity, price, options, cart state, or checkout.
- GSAP/ScrollTrigger may enhance presentation but cannot own commerce behavior.
- Original output is required; Nightkidz is a reference for quality and principles, never a source to reproduce.

## Phase 0 baseline and provenance

### Pre-bootstrap finding

**Project setup record:** the target project repository was initially empty; there was no theme implementation to audit or preserve. This matters because no existing product decisions, analytics, customer behavior, or visual system can be attributed to AFTERDARK SUPPLY at baseline.

### Bootstrap

**Verified in the inspected checkout:** Shopify's official Skeleton Theme was used as the bootstrap. Evidence includes the repository README identifying “Shopify Skeleton Theme,” the standard theme directories, JSON templates, Liquid layouts/sections/snippets, minimal settings, and the default `hello-world` homepage template entry.

This bootstrap is deliberately an infrastructure decision rather than a design inheritance. At the Phase 0 inspection point, the repository contained functional-looking scaffold code but no verified AFTERDARK SUPPLY design, component system, motion layer, Figma library, or measured storefront outcome.

## Retained and replaced layers

| Layer | Phase 0 evidence | Direction | Reasoning |
| --- | --- | --- | --- |
| Theme directory structure and OS 2.0 JSON templates | Present in Skeleton | **Retain** | Native Shopify architecture and Theme Editor composition are useful infrastructure. |
| Liquid layouts, `content_for_header`, section groups, routes, forms, and schema conventions | Present in Skeleton | **Retain/evolve** | Rewriting working platform integration would add risk without improving art direction. |
| Responsive image and metadata helpers | Present as snippets | **Evaluate and retain where sound** | These are low-level Shopify concerns, not brand expression. |
| Font/settings CSS-variable bridge and full-width section grid | Present in the baseline | **Migrate/evolve** | Useful mechanics can feed the custom foundation, but current names and values are not the final token system. |
| Skeleton colors, typography, spacing, radii, and generic presentation | Minimal defaults present | **Replace** | The scaffold must not dictate the custom visual language. |
| Baseline header and basic product/collection/cart/search presentation | Minimal section markup present | **Replace at the component layer while preserving sound mechanics** | Major storefront patterns need intentional anatomy, states, merchant controls, responsive behavior, and accessibility. |
| `hello-world` homepage composition | Referenced by the baseline `templates/index.json` | **Replace** | It is demonstration content rather than the planned authored homepage. |
| Motion architecture | No project motion layer observed at Phase 0 | **Create** | The brief requires coherent, lifecycle-safe progressive enhancement rather than scattered calls. |
| Canonical design tokens | No AFTERDARK token source observed at Phase 0 | **Create** | A DTCG hierarchy is needed to connect foundations, implementation, future Figma variables, and evidence. |

“Retain” does not mean “unchanged forever,” and “replace” does not mean discarding Shopify behavior. The boundary is platform infrastructure versus custom user experience.

## Reference research: principles, not implementation

Nightkidz and other art-directed fashion/streetwear experiences establish an ambition level. Only transferable principles enter this project:

- **Signal-like motion:** animation communicates entry, transition, focus, or state rather than adding continuous spectacle.
- **High-contrast, full-bleed media:** imagery establishes atmosphere and hierarchy; crop and focal point remain deliberate across breakpoints.
- **Oversized typography:** display type can become a compositional object while commerce and body copy remain legible.
- **Modular product storytelling:** product discovery is assembled from reusable content/commerce units within authored sequences.
- **State continuity:** hover, navigation, section transition, and commerce feedback should feel related rather than like separate effects.

Explicit exclusions are the reference brand, assets, typefaces, source code, exact layouts, exact animation timings, and one-for-one interaction patterns. No claim is made that the reference's implementation was inspected or reproduced.

## Phase 1 system architecture — Implemented and locally verified

```text
Design principles
  → canonical DTCG primitive + semantic + typography + motion + component tokens
  → committed CSS custom properties and global foundations
  → Liquid primitives + commerce components
  → authored sections
  → homepage JSON composition

Native Shopify behavior
  + independent GSAP/ScrollTrigger decorative layer
  + Theme Editor lifecycle initialization/cleanup
  + reduced-motion branch
```

The following named Phase 1 surfaces were inspected in source:

- canonical `design-system/tokens/{primitive,semantic,typography,motion,component}.tokens.json` and corresponding `assets/tokens.css`;
- global `assets/theme.css`, `assets/theme.js`, and `assets/motion-core.js`;
- vendored GSAP 3.13 and ScrollTrigger assets;
- `snippets/product-card.liquid`;
- `sections/header.liquid`, `sections/cinematic-hero.liquid`, and `sections/featured-collection.liquid`;
- the hero/featured composition in `templates/index.json`;
- updated asset assembly, main landmark/skip link, settings bridge, and display/font/color settings in the theme shell.

The architecture keeps native scrolling, links, and Shopify commerce as the durable layer. The featured rail uses CSS overflow/scroll snap and enhances it with measured previous/next controls. The header uses a native modal dialog managed by a custom element. Motion scopes use a map plus `gsap.matchMedia()`; initialization first destroys an existing scope, unload reverts the media context, section load initializes, and section select refreshes ScrollTrigger. Static browser fixtures verified the normal and reduced-motion branches, dialog path, rail controls, and synthetic section lifecycle. The actual Shopify Theme Editor UI and real commerce data were not exercised.

## Phase 0 development evidence

| Evidence | Observation | Case-study value |
| --- | --- | --- |
| Official Skeleton README | Describes a minimal Shopify theme and standard architecture. | Establishes why Skeleton is a bootstrap rather than a visual starting point. |
| `layout/theme.liquid` | Provides Shopify head content, CSS loading, header/footer groups, and layout output. | Demonstrates retained native shell responsibilities. |
| `templates/index.json` | Baseline homepage contains only a `hello-world` section. | Shows the absence of an inherited art-directed homepage. |
| `assets/critical.css` | Contains a reset, base theme variables, and a useful full-width/content-grid utility. | Identifies low-level mechanics worth evaluating separately from styling. |
| `snippets/css-variables.liquid` and settings schema | Expose one font, page dimensions, two colors, and input radius. | Shows why a richer canonical token hierarchy is needed while preserving merchant-runtime overrides where appropriate. |
| Baseline header, product, and collection sections | Provide minimal links, product data/forms, and listing markup. | Supports the retain-mechanics/replace-experience boundary. |
| Mounted tool inventory | No Figma/Codex design-system integration is available. | Justifies continuing code-side and maintaining a future sync checklist without fabricated Figma output. |

## Phase 1 development and verification log

**2026-09-20 — Implementation:** The minimal Skeleton homepage was replaced in source by a cinematic hero and featured collection rail. A DTCG token hierarchy and committed CSS counterpart, global visual/accessibility foundation, body/display font settings, modal mobile navigation, editorial product card, and native horizontal product rail were added. GSAP 3.13 and ScrollTrigger were vendored as a decorative layer; motion is scoped with desktop/mobile/reduced-motion conditions. `theme.js` connects DOM readiness, Shopify section load/unload/select events, font readiness, and window load to initialization, teardown, or refresh. Header listeners use `AbortController`; the rail disconnects its `ResizeObserver`.

Evidence captured from source:

- `layout/theme.liquid` loads tokens, foundations, GSAP, ScrollTrigger, motion, and theme scripts and adds a skip link plus `main` landmark.
- `snippets/product-card.liquid` keeps media/title/price navigation independent of motion and provides responsive image candidates, lazy loading, alt fallback, a sold-out state, and decorative indexing.
- `sections/cinematic-hero.liquid` supports video or responsive desktop/mobile imagery, content/alignment/height/color/overlay controls, and optional motion hooks.
- `sections/featured-collection.liquid` exposes a focusable named native-scroll track, button controls, collection CTA, merchant controls, and placeholders when no collection is selected.
- `sections/header.liquid` exposes primary/mobile navigation, search/account/cart affordances, current-page state, and a dialog trigger with expanded/control relationships.
- `assets/theme.css` includes focus-visible styling, minimum control sizing, reduced-motion overrides, and responsive foundation rules.
- `assets/motion-core.js` owns per-scope GSAP contexts and cleanup; commerce markup and navigation do not require it to render.

**2026-09-20 — Local verification:**

- Shopify CLI Theme Check inspected 47 files and reported 0 offenses.
- `node --check` passed for `assets/theme.js` and `assets/motion-core.js`.
- A 1440×900 static browser fixture rendered a 900px-high hero, two initialized motion scopes, four rail cards, horizontal rail overflow, loaded GSAP and ScrollTrigger, and 0px document horizontal overflow.
- A 390×844 static fixture rendered 319.8px rail columns and 0px document horizontal overflow.
- The initial mobile fixture exposed a clipped hero heading. After the fluid type scale was corrected, the title's right edge was 374px inside the 390px hero, and its `scrollWidth` equaled its `clientWidth` at 358px.
- The mobile menu opened as a native dialog, set `aria-expanded=\"true\"`, locked the body, and focused Close. Escape closed it, cleared the body lock, and restored focus to the menu trigger.
- The accessibility-tree snapshot exposed a labeled dialog, Close button, labeled navigation, and links.
- Reduced-motion emulation matched, created zero ScrollTriggers, left the heading visible, and computed the reveal transform as `none`.
- The product-rail constructor/control path loaded. A button click moved `scrollLeft` from 0 to 576 and enabled Previous.
- Synthetic bubbling Theme Editor events verified scoped teardown and idempotent reinitialization: initial ready state had one ScrollTrigger; `shopify:section:unload` removed ready state and reduced the count to zero; `shopify:section:load` restored ready state and one trigger; repeating load left the count at exactly one.

These results came from a controlled static browser fixture, which was removed after the checks, not a live Shopify storefront. They verify the exercised layout, interaction, accessibility-tree, dependency-loading, reduced-motion, and synthetic lifecycle paths only; they are not performance or usability measurements.

## Phase 2 development and verification log

**2026-09-20 — Implementation:** The Phase 1 homepage sections were cleanly replaced by a kinetic image-stack hero and three editorial category grids. The first category consumes the current catalogue; the other two are visibly non-purchasable placeholders until the next content handoff. One shared WebGL canvas gives eligible product media a queued viewport glitch reveal and repeatable first-to-second-image hover transitions while product cards remain in normal document flow. The global shell gained a centered KOVA header, modal navigation, progressively refreshed cart drawer, collection filters/sorting, a three-part product purchase layout, related-product endpoint, full cart, newsletter/localization-aware footer, and a viewport declaration.

Meaningful implementation boundaries:

- `assets/kinetic-hero.js` uses `gsap.quickTo()` to carry the full stack across the hero with depth-based lag, explicitly establishes percentage centering, primes follower tweens, synchronizes them immediately on every pointer entry, keeps distance-based promotions at the current pointer, restores the authored right-side rest state on leave, supports touch advance, cleans up scoped listeners, and supplies a static reduced-motion branch.
- `assets/webgl-product-reveal.js` owns one WebGL context/program/buffer, caps targets and total texture memory, queues one-time `IntersectionObserver` intros, temporarily mounts the canvas as an absolute child of the active media element, runs a fresh bidirectional texture transition on every pointer entry and leave, renders only active transitions on demand, handles context loss, and returns presentation to canonical DOM images after every animation.
- `assets/theme.js` keeps navigation, cart, product option/quantity state, recommendations, and Shopify section events separate from decorative motion.
- `templates/index.json` composes one real-product category and two explicitly pending editorial categories; merchant media can replace every fallback without changing code.
- The obsolete cinematic hero, featured rail, and product-rail runtime were removed after the homepage caller migrated.

**2026-09-20 — Shopify CLI development-preview verification:**

- Shopify CLI synchronized the changed theme to development theme `164481368323`.
- The homepage rendered five hero layers, three editorial sections, three real product cards, three WebGL-ready targets, and no horizontal overflow.
- Desktop pointer checks moved all five hero layers from the authored right-side rest to both far-left and far-right coordinates; a promoted front layer remained inside the local stack instead of moving against the pointer. Pointer leave returned every layer to the right-side composition. A 390×844 emulation matched the mobile breakpoint, rendered two 173px product columns, kept the 359px hero title within its 359px box, and had no horizontal overflow. Touch input advanced the hero stack.
- Navigation opened with focus on Close. Escape closed the dialog, cleared body lock and `aria-expanded`, and restored trigger focus.
- Reduced-motion emulation created zero ScrollTriggers and zero WebGL-ready targets while leaving the hero visible.
- WebGL context loss removed all ready classes and left DOM product images visible.
- Synthetic section unload removed all three prepared product targets and restored primary DOM images. Two repeated load events returned exactly three prepared targets, confirming idempotent initialization with the new observers and pointer listeners.
- The WebGL intro showed block pixelation, horizontal signal displacement, and color-channel separation before handing presentation back to opaque primary DOM images. Fine-pointer hover transitioned to each product's second image, held that DOM image after completion, reversed to the primary image on leave, and retained `transform: none` on the product cards.
- The collection rendered the three real products, native filter/sort controls, two desktop columns, two mobile columns, and no overflow.
- A real product rendered seven media items and two option groups. Changing Color updated the hidden variant ID and URL; quantity increment changed from 1 to 2. All tested variants were sold out, so successful add-to-cart was unavailable.

- Product recommendations requested successfully but the current catalogue returned no related products.
- The empty cart page and drawer rendered. Section Rendering refresh replaced drawer contents and reopened the dialog.
- `node --check` passed for the four authored JavaScript files. Shopify Theme Check passed after the implementation fixes recorded in source.

**2026-09-21 — Product-media interaction refinement:** The prior smooth wipe was replaced with an original block-glitch shader inspired by signal degradation rather than a copied interaction. Live development-preview checks exercised active and completed intro states, both directions of the first/second-image hover transition, the CSS hover fallback under reduced-motion emulation, repeated Theme Editor lifecycle events, and forced WebGL context loss. Three product cards loaded two responsive DOM images each; reduced motion created no prepared WebGL targets, while context loss removed all prepared/animating classes and restored primary-image opacity.

**2026-09-21 — Static product-media correction:** The viewport-fixed compositor and intersection-triggered intro were removed. The shared canvas is now hidden at page level, mounted inside the active media box only for fine-pointer hover, and parked again after the DOM-image handoff. Live development-preview measurements confirmed `position: static` and `transform: none` on the product card, `position: relative` on its media, and `position: absolute` on the active canvas. During an 80px scroll while the shader was active, media and canvas each moved exactly −80px; after completion the canvas returned to `body` with `display: none`. Hover settled on DOM opacities `[0, 1]`, and pointer leave restored `[1, 0]`.

**2026-09-21 — Interaction replay correction:** The hero follower tweens now receive an explicit centered baseline and are synchronized to the entry coordinate before ordinary lag begins. Replaying the same pointer path after a fresh load and after leave/return produced identical entry coordinates and a maximum final-coordinate delta of `0`. The localized WebGL compositor regained a one-time queued viewport intro without restoring any card translation or fixed positioning: during an active reveal, an 80px page scroll moved both media and canvas by exactly −80px. Three complete pointer entry/leave cycles each mounted the canvas, ran the shader, settled on DOM opacities `[0, 1]`, reversed through the shader, and restored `[1, 0]`.

### Known unknowns and risks

- Add-to-cart and cart-line creation are now verified against the real catalogue for a single-variant product, a multi-variant product, and the native bundle (see the Phase 3 log). Checkout completion and payment are still unverified.
- Synthetic section lifecycle events are verified; the actual Shopify Theme Editor UI has not been exercised.
- The homepage hero and the two editorial category placeholders still use temporary theme-owned art. The product catalogue, collections, and product data are now real, so those sections can be repointed at Drop 001 collections in the next phase.
- WebGL context loss and reduced motion are verified; performance on low-end physical devices and production media weights is not measured.
- Token CSS is committed beside canonical JSON, but no automated generator or synchronization check exists.
- Figma correspondence cannot be tested until supported tooling and an actual Figma target exist.

## Evidence to capture next

Capture only after the event occurs:

1. A live Shopify preview with real products, responsive media, navigation/account settings, and representative merchant copy.
2. The actual Shopify Theme Editor UI loading, unloading, selecting, and reordering sections, including duplicate-listener and duplicate-ScrollTrigger checks.
3. No-JavaScript commerce/navigation behavior and live keyboard traversal beyond the fixture dialog path.
4. Screenshots of meaningful iterations, including a mobile crop/composition and one controlled grid break.
5. Concrete bugs involving section lifecycle, focus/state continuity, responsive media, or commerce boundaries.
6. Baseline and post-change performance/accessibility results with date, environment, page, data conditions, and tool version.
7. Figma variable/component mappings only if official tooling is actually used.

## Metrics

**Current status: not measured.** There are no recorded Lighthouse, LCP, CLS, INP, JavaScript-size, image-weight, animation-FPS, accessibility-audit, conversion, or usability values. Future measurements must include enough context to be reproducible; absent data must remain absent rather than inferred.

## Catalog architecture — Implemented and verified against the live store

The first KOVA catalogue is a 15-product image-backed release plus one Shopify-native bundle: 16 products and 62 variants, all active and published to Online Store and Shop. Naming, product data, and Shopify features are intentionally distributed so the catalogue can support materially different product-detail stories instead of one overloaded schema.

| Family | Product | Functional descriptor | Positioning | Intended Shopify demonstrations |
| --- | --- | --- | --- | --- |
| Carry | After Dark Utility Backpack | 30L modular field pack | A weather-resistant load system built for overnight movement, modular carry, and urban field use. | Color and harness variants, three-image media set, capacity/dimension specs, modular compatibility, reference guide |
| Carry | Lowlight Courier 14 | 14L shoulder transit bag | A low-profile messenger built to keep daily hardware indexed, compressed, and close at hand. | Color variants, compartment specifications, laptop compatibility, cross-sell accessories |
| Carry | Driftline Hip Rig | 4L convertible waist pack | A compact carry module that shifts between waist and cross-body use without breaking stride. | Strap-length variants, carry-mode features, related carry products |
| Carry | Gridlink Pouch Array | Three-piece modular organizer set | A nested pouch system for separating tools, cables, and small field objects inside any KOVA load platform. | Product set, modular compatibility, component list, compare-at set pricing |
| Outerwear | Blacksite Shell Jacket | Three-layer storm field shell | A protective outer layer cut for hard weather, concealed storage, and low-light movement. | Size/color variants, swatches, fit/material/care content, limited edition |
| Outerwear | Relay Modular Vest | Adjustable load-bearing vest | A wearable storage layer balancing modular attachment, ventilation, and an engineered silhouette. | Size/color variants, fit profile, load compatibility, construction details |
| Outerwear | Ghostline Packable Poncho | Packable storm cover | A fast-deploy shell that covers the wearer and a small pack while collapsing into its own field sack. | Dual-size option, packed dimensions, care and weather specifications |
| Apparel | Night Shift Cargo Pant | Articulated modular cargo trouser | A relaxed technical trouser designed for kneeling, carrying, and long movement after dark. | Six sizes, two colors, swatches, three-image media set, size/fit guide |
| Apparel | Dead Channel Utility Hoodie | Heavyweight hardware hoodie | A dense oversized layer combining fleece comfort with indexed storage and removable field details. | Size/color variants, material story, care, selective compare-at pricing |
| Headwear | Static-5 Panel Cap | Water-resistant signal cap | A low-profile five-panel built to shed light weather and hold a visible marker in dark conditions. | Color swatches, one-size fit data, accessory cross-sell |
| Headwear | Veil-02 Air Hood | Ventilated extended balaclava | A close field layer that manages coverage and airflow without interrupting peripheral vision. | Two fit sizes, thermal/ventilation specifications, compatibility notes |
| Handwear | Touchpoint Field Glove | Articulated utility glove | A reinforced full-finger glove tuned for grip, dexterity, and repeated hardware contact. | Four sizes, hand-measurement fit guidance, care and material specifications |
| Objects | Signal Carabiner System | Gated key and tether assembly | A compact retention system for keys, tags, and light-duty equipment that needs to stay indexed. | Finish variants, safety disclaimer, compatibility and accessory cross-sell |
| Objects | Sector 05 Field Flask | 950 ml carry vessel | A squared hydration vessel with a glove-friendly cap and external retention strap. | Capacity/weight dimensions, care, material and shipping data |
| Objects | Nullfold Card Wallet | Six-slot technical card case | A slim stitched carry object for cards, folded currency, and one tethered essential. | Construction detail, dimensions, complementary key system |
| Objects | Night Transit Set 03 | Three-object after-dark carry set | A coordinated hard-goods loadout combining hydration, retention, and slim essential storage. | Shopify-native fixed bundle of Sector 05 Field Flask, Signal Carabiner System, and Nullfold Card Wallet |

`Gridlink Pouch Array` is the customer-facing fixed set represented by the supplied `general-use` image. `Night Transit Set 03` is a genuine Shopify-native component bundle: `productBundleCreate` was available on this store, the bundle product carries `requiresComponents: true`, and its single variant resolves three component variants while transacting as one cart line.

### Lean custom-data model

Native product fields remain authoritative for title, description, vendor, category, product type, tags, options, variants, media, SKU, inventory, price, compare-at price, weight, status, and SEO. Custom data is limited to information Shopify does not model structurally:

| Definition | Type | Use |
| --- | --- | --- |
| `custom.functional_descriptor` | Single-line text | Short subtitle directly below the product name |
| `custom.positioning` | Multi-line text | One-sentence product role |
| `custom.feature_list` | List of single-line text | Scannable product-specific feature set |
| `custom.technical_specifications` | Multi-line text | Compact label/value specification block; avoids one metafield per measurement |
| `custom.material_system` | Metaobject reference | Reusable material, construction, finish, hardware, and care profile |
| `custom.fit_profile` | Metaobject reference | Reusable silhouette, layering, and sizing guidance for wearable products |
| `custom.edition_profile` | Metaobject reference | Reusable drop code, edition quantity, and release note |
| `custom.package_information` | Multi-line text | Packed dimensions, package weight, and packaging notes |
| `custom.compatible_products` | List of product references | Explicit modular compatibility, distinct from recommendation merchandising |
| `custom.reference_guide` | File reference | Downloadable sizing or loadout documentation where it adds utility |

Three reusable metaobject types keep shared copy centralized:

- `Material system`: display name, composition, construction, finish, hardware, and care.
- `Fit profile`: display name, silhouette, layering guidance, and sizing note.
- `Edition profile`: display name, drop code, edition quantity, and release note.

Complementary products use Shopify's Search & Discovery metafield (`shopify--discovery--product_recommendation.complementary_products`), so the native `/recommendations/products.json?intent=complementary` endpoint serves the curated cross-sell without a duplicate custom field. Related products stay algorithmic: Shopify returns an empty `intent=related` set on a catalogue with no order history, which is platform behaviour rather than missing data. Color is a product option linked to the standard `shopify.color-pattern` metafield, so option values render real swatches (`Black #0B0B0C`, `Ash Gray #6E7176`). The supplied imagery depicts one dark colourway only: `Ash Gray` therefore carries no variant media and zero inventory instead of being assigned misleading photography.

### Catalog implementation record

| Surface | Implemented state |
| --- | --- |
| Products | 16 active, published to Online Store and Shop; 15 built from the supplied imagery plus the native bundle |
| Variants | 62 with unique `KVA-` SKUs, per-variant weights, cost per item, and tracked inventory at `Shop location` |
| Options | `Size`, `Color`, `Harness`, `Strap`, `Finish`; 7 products expose linked colour swatches |
| Variant media | Assigned on the produced black colourway for all 8 optioned colour/finish products |
| Inventory | 356 units; deliberate zero stock on the unproduced `Ash Gray` colourway, so sold-out states are real |
| Compare-at pricing | Only where a set or drop genuinely prices below its parts: Gridlink Pouch Array, Dead Channel Utility Hoodie, Night Transit Set 03 |
| Categories | Shopify Standard Product Taxonomy on all 16 products |
| Custom data | 10 product metafield definitions, 3 reusable metaobject definitions, 24 metaobject entries |
| Reference guides | 3 generated PDFs in Files, attached to 15 products via `custom.reference_guide` |
| Collections | 7 published smart collections driven by the tag taxonomy |
| Recommendations | Curated complementary sets on all 16 products |

## Phase 3 catalog development and verification log

**2026-09-21 — Implementation:** The 19 supplied product images were uploaded to Shopify Files. Ten product metafield definitions, three reusable metaobject definitions, and 24 metaobject entries were created, then the catalogue was imported and completed. Three legacy demonstration products inherited from the store (workwear shorts and two graphic tees) were archived, so the catalogue contains only KOVA objects.

Access path: the product CSV import, metafield definitions, and metaobject definitions were created through the Shopify admin UI. Because the admin's own GraphQL endpoint accepts only hashed persisted operations, the remaining structural work — metaobject entries, profile references, compatibility and complementary references, inventory, colour swatch links, file uploads, collections, and the native bundle — was written through a legacy custom app token against Admin GraphQL `2025-07`. The token is session-scoped and is not stored in the repository.

Corrections made during implementation:

- The first CSV pass silently dropped seven products because `Option2 LinkedTo` pointed at `product.metafields.shopify.color-pattern` before that definition existed on the store. The colour products were re-imported without the linkage, and swatches were attached afterwards through `productOptionUpdate`.
- Shopify's CSV preview reported an invalid product category for the hydration vessel; category IDs were replaced with full taxonomy breadcrumbs and all 16 products now resolve a category.
- Two inventory CSV attempts failed on header validation (`Option1 Value`, then `On hand`); inventory was set through `inventorySetQuantities` instead, which also made the per-size distribution explicit.
- The metaobject definition form requires a complete field row before saving, which left a stray `temporary` field on `material_system`. It was deleted through `metaobjectDefinitionUpdate`.
- The `custom.edition_profile` definition was lost to a relay timeout during the UI pass and was recreated through `metafieldDefinitionCreate`.
- API-created collections are unpublished by default. All seven returned 404 on the storefront until `publishablePublish` was applied.

**2026-09-21 — Bug found and fixed:** `assets/theme.js` disabled add-to-cart on every single-variant product. `updateVariant()` matched option inputs to build a variant, but a product with only a default variant renders no option inputs, so the match failed and the button fell through to the `Unavailable` branch. The previous catalogue hid this because every product was multi-variant and sold out. Reproduced on Sector 05 Field Flask, Nullfold Card Wallet, and Gridlink Pouch Array (`disabled: true`, label `UNAVAILABLE`) while the multi-variant Static-5 Panel Cap was unaffected. The matcher now falls back to the sole variant when no option inputs exist; all four single-variant PDPs render `ADD TO BAG` and `disabled: false`, and `node --check` passes.

**2026-09-21 — Verification against the live development preview and Admin API:**

- Admin API audit of all 16 products: every product active and published, category set, SEO title and description present, and the five core content metafields populated. 62 variants carry SKU, weight, and cost per item.
- Custom data coverage: material system on 15 products, fit profile on the 8 wearables, edition profile on all 16, compatible products on 15, reference guide on 15, curated complementary products on 16.
- Inventory: 356 units across the catalogue. Every `Ash Gray` variant is deliberately zero.
- Colour swatches: all 7 colour products report `linkedMetafield shopify.color-pattern` with `#0B0B0C` and `#6E7176`, and option values render as `Black` and `Ash Gray` rather than raw CSV values.
- Night Shift Cargo Pant PDP rendered three media items, a six-value Size group, a two-value Color group, `$238.00`, and an enabled add-to-cart control.
- **First successful commerce transaction in this project:** `POST /cart/add.js` with the in-stock `XS / Black` cargo variant returned 200 and produced cart line `Night Shift Cargo Pant - XS / Black x1` totalling `23800`. Selecting `Ash Gray` on the cap PDP correctly disabled the button with `SOLD OUT`. The test cart was cleared to `item_count: 0`.
- The native bundle transacted as a single line: adding Night Transit Set 03 produced one cart line at `16900` against a `$188.00` compare-at price, and the cart was cleared afterwards.
- Complementary recommendations resolved through the storefront endpoint: the backpack returned Gridlink Pouch Array, Sector 05 Field Flask, and Signal Carabiner System; the cargo pant returned Signal Carabiner System, Nullfold Card Wallet, and Touchpoint Field Glove; the flask returned Signal Carabiner System and Night Transit Set 03. `intent=related` returned an empty set, as expected without order history.
- Collection pages rendered after publication with 16, 4, 3, 5, 3, 2, and 3 product cards for Drop 001, Carry Systems, Limited Editions, Field Objects, Outerwear, Apparel, and Worn Accessories, with zero horizontal overflow on each.
- All ten `custom` metafield definitions and the three KOVA metaobject definitions report `PUBLIC_READ` storefront access, so the next PDP phase can read them from Liquid and the Storefront API.

Not verified at the time: PDP rendering of the new metafield and metaobject content (realized in Phase 4 below). Checkout completion, the Theme Editor UI, and performance remain unmeasured.

## Phase 4 product storytelling and homepage log

**2026-09-23 — Implementation:** `sections/product.liquid` now consumes the custom-data layer. The identity column shows `functional_descriptor`, `positioning`, and the edition drop code and quantity in place of the synthetic object index. The purchase column adds disclosure panels for features, a label/value specification list parsed from `technical_specifications`, the fit profile, the material system (falling back to the section's care copy when no profile exists), compatible products as plain title/price links, and the edition release note. Package information joins delivery and returns, and `reference_guide` renders as a PDF link. Linked colour options render a decorative swatch chip beside the readable value text; `assets/theme.js` reads only input values, so variant matching is unchanged. The homepage's two placeholder grids were switched to the real Outerwear and Field Objects collections, the lead grid was pinned to three products that neither collection repeats, and the unused Skeleton `hello-world` section was removed.

**2026-09-23 — Bug found (catalogue data, not yet fixed):** `custom.feature_list` is double-encoded on 15 of 16 products. Each list holds one entry whose text is a JSON array string (for example `["Twelve indexed storage zones", …]`) rather than five entries, so the Features panel prints the raw array. Only `Night Transit Set 03`, written through the Admin API, holds a proper five-entry list. The likely cause is the Phase 3 CSV import encoding the list value a second time. The theme renders the list natively and intentionally does not decode strings, because that would hide the data defect; the fix is a `metafieldsSet` rewrite of the 15 values.

**2026-09-23 — Verification against the live development preview:**

- Theme Check: 48 files, no offenses. No `Liquid error` on the homepage or on the Night Shift Cargo Pant, Sector 05 Field Flask, Night Transit Set 03, Nullfold Card Wallet, and Static-5 Panel Cap PDPs.
- Cargo pant: descriptor `Articulated Modular Cargo Trouser`, index `KVA-D001-NS / 240 units`, fit `Relaxed Straight`, material `Field Ripstop 220`, edition `Night Shift 240`, five specification rows, two compatible products with prices, apparel size-guide PDF link, and two swatch chips.
- The flask and wallet render no fit panel; the bundle has no material profile and correctly falls back to the section's care copy.
- Homepage grids render Night Shift Cargo Pant / After Dark Utility Backpack / Dead Channel Utility Hoodie, Relay Modular Vest / Blacksite Shell Jacket / Ghostline Packable Poncho, and Night Transit Set 03 / Nullfold Card Wallet / Sector 05 Field Flask, with no placeholder cards.
- Headless Chromium screenshots of the cargo pant PDP at 1440px and 390px showed the new identity content, swatches, collapsed panels, and guide link without horizontal overflow.

Observed, not changed: several product descriptions repeat the positioning sentence and contain their own materials and care paragraphs, which now overlap the metaobject-driven panels. That is catalogue copy, to be trimmed in a content pass. Not verified: keyboard traversal of the new panels, screen-reader output, Theme Editor behaviour, and performance.
