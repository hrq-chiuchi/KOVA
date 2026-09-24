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
2. ~~The actual Shopify Theme Editor UI loading, unloading, selecting, and reordering sections, including duplicate-listener and duplicate-ScrollTrigger checks.~~ Captured 2026-09-23 (Phase 4 Theme Editor log).
3. No-JavaScript commerce/navigation behavior and live keyboard traversal beyond the fixture dialog path.
4. Screenshots of meaningful iterations, including a mobile crop/composition and one controlled grid break.
5. Concrete bugs involving section lifecycle, focus/state continuity, responsive media, or commerce boundaries.
6. Baseline and post-change performance/accessibility results with date, environment, page, data conditions, and tool version.
7. Figma variable/component mappings only if official tooling is actually used.

## Metrics

**Current status: local lab baseline only (2026-09-23).** Lighthouse 12.8.2, default mobile emulation (simulated throttling), headless Chromium, run against the Shopify CLI `theme dev` proxy at `127.0.0.1:9292` on the development store. The proxy serves over HTTP and relays storefront assets, so these values are not production field data, and single runs vary by roughly ±1.5 s LCP.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home, before fixes | 57 | 100 | 57 | 92 | 5.4 s | 0.001 | 750 ms | 6,660 KiB |
| Home, after fixes | 56 | 100 | 57 | 92 | 6.8 s | 0.001 | 640 ms | 5,361 KiB |
| Cargo pant PDP, before fixes | 48 | 94 | 75 | 100 | 8.0 s | 0 | 660 ms | 6,180 KiB |
| Cargo pant PDP, after fixes | 49–51 | 100 | — | — | 5.8–7.2 s | 0 | 650–700 ms | 5,417 KiB |
| Drop 001 collection, before fixes | 63 | 98 | 57 | 100 | 3.4 s | 0 | 1,300 ms | 7,014 KiB |
| Drop 001 collection, after fixes | 70 | 100 | 75 | 100 | 3.4 s | 0 | 720 ms | 5,417 KiB |

Best-practices failures are proxy artefacts (`is-on-https`), Shopify platform scripts (third-party cookies, an `origin_trials` CORS error, shop.app framing), and a `shopify-account` console warning that the store has no `customer-account-main-menu` menu, so the component falls back to default items. INP, field Core Web Vitals, animation FPS, conversion, and usability remain unmeasured.

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

**2026-09-23 — Bug found and fixed (catalogue data):** `custom.feature_list` is double-encoded on 15 of 16 products. Each list holds one entry whose text is a JSON array string (for example `["Twelve indexed storage zones", …]`) rather than five entries, so the Features panel prints the raw array. Only `Night Transit Set 03`, written through the Admin API, holds a proper five-entry list. The likely cause is the Phase 3 CSV import encoding the list value a second time. The theme renders the list natively and intentionally does not decode strings, because that would hide the data defect; The 15 values were rewritten as proper lists with one `metafieldsSet` call through Shopify CLI `store execute` (Admin API, `read_products,write_products` scopes, user-authorised), built from the live values rather than retyped. It returned no user errors, and a storefront Liquid read afterwards reported five entries on all 16 products.

**2026-09-23 — Verification against the live development preview:**

- Theme Check: 48 files, no offenses. No `Liquid error` on the homepage or on the Night Shift Cargo Pant, Sector 05 Field Flask, Night Transit Set 03, Nullfold Card Wallet, and Static-5 Panel Cap PDPs.
- Cargo pant: descriptor `Articulated Modular Cargo Trouser`, index `KVA-D001-NS / 240 units`, fit `Relaxed Straight`, material `Field Ripstop 220`, edition `Night Shift 240`, five specification rows, two compatible products with prices, apparel size-guide PDF link, and two swatch chips.
- The flask and wallet render no fit panel; the bundle has no material profile and correctly falls back to the section's care copy.
- Homepage grids render Night Shift Cargo Pant / After Dark Utility Backpack / Dead Channel Utility Hoodie, Relay Modular Vest / Blacksite Shell Jacket / Ghostline Packable Poncho, and Night Transit Set 03 / Nullfold Card Wallet / Sector 05 Field Flask, with no placeholder cards.
- Headless Chromium screenshots of the cargo pant PDP at 1440px and 390px showed the new identity content, swatches, collapsed panels, and guide link without horizontal overflow.

Observed at the time: several product descriptions repeated the positioning sentence and contained their own materials and care paragraphs, which overlapped the metaobject-driven panels (resolved below under D-015).

**2026-09-23 — Accessibility, keyboard, and performance pass:**

- Keyboard traversal was scripted over the Chrome DevTools Protocol on the cargo pant PDP (1440px and 390px), the homepage, the Drop 001 collection, and the cart, at up to 90 Tab stops each. After the fixes below, every visible stop showed a focus indicator, and no page overflowed horizontally. Enter on the Features summary opened the panel and exposed five list items. With all panels open, the accessibility tree listed 10 definition terms. Size and colour radios expose their value text (`XS`…`XXL`, `BLACK`, `ASH GRAY`), swatch chips are `aria-hidden`, and the guide link is named "KOVA apparel size guide PDF (opens in a new tab)". No screen reader was run; this is an accessibility-tree check.
- Fixed: the product-card media link duplicated the title link and failed Lighthouse's label-in-name audit. It is now `tabindex="-1"` and `aria-hidden`, and the sold-out state is announced beside the price. Collection-page cards take an `h2` title to keep heading order. The unbranded Buy it now button (white on `#1990c6`, contrast 3.59:1) now uses theme tokens. Shopify's injected hCaptcha badge suppressed the focus ring on its Privacy and Terms links, so a scoped rule restores it.
- Fixed (performance): a V8 CPU profile of the PDP under 4× throttling attributed about 812 ms of self time to `loadTexture` in `assets/webgl-product-reveal.js`, which decoded and uploaded textures for every card at startup and forced offscreen lazy images to download. Cards now wait in a pending set until they come within half a viewport. After the change, `loadTexture` fell out of the top profile entries, and page transfer dropped by about 1.2–1.6 MB. Lighthouse's `bootup-time` attributes about 7 s to `ScrollTrigger.min.js`, but the CPU profile does not show that cost, so it was treated as an attribution artefact rather than a defect.
- Fixed (LCP): the PDP's primary image, which is the LCP element, was `loading="lazy"`. It now loads eagerly with `fetchpriority="high"`. The homepage LCP is a kinetic-hero layer. All seven layers already load eagerly, and the top layer depends on script state, so the hero was left unchanged. Choosing a single high-priority layer is a follow-up.
- Not verified, and why: checkout completion would create a real order unless a test payment gateway is configured on the store, so it was not attempted. The Theme Editor was verified afterwards; see the next entry.

**2026-09-23 — Catalogue copy trimmed (D-015):** Descriptions were backed up, then 15 were rewritten through `productUpdate` to keep only their opening paragraph. The removed "Materials and construction" and "Care" sections were covered by each product's material profile, and "Field note" was identical boilerplate on every product. `Night Transit Set 03` was left unchanged: it has no material profile, and its "What is included" and "Why these three" sections are unique. The update returned no user errors. PDPs render the shortened description without Liquid errors, and the cargo pant PDP's Lighthouse accessibility score moved from 98 to 100 because the description's orphaned `h3` headings are gone.

**2026-09-23 — Actual Theme Editor verification:** The user signed in to the Shopify admin in a visible Chromium window. That window was then driven over the Chrome DevTools Protocol against development theme `164481368323`, served by `shopify theme dev` from this repository at commit `57bf022`. A probe inside the preview frame recorded `shopify:section:*` events, page errors, ScrollTrigger count, motion scopes, and WebGL targets. Listener counts were read through `DOMDebugger.getEventListeners`. No change was saved: the edit session was discarded, and afterwards the dev theme's homepage rendered its original four sections in the original order.

| Action in the editor | Observed |
| --- | --- |
| Load homepage | `Shopify.designMode` true; 4 sections, 3 ScrollTriggers, 3 motion scopes, 9 WebGL targets (0 prepared while offscreen), 7 hero layers, no hidden cards |
| Select the Night Uniform grid | `section:select`; preview scrolled to it; 6 targets prepared as they neared the viewport; no errors |
| Edit the eyebrow text | Text patched in place without a section reload |
| Toggle Tone three times (three reloads) | `unload` → `load` → `select` each time; ScrollTrigger, motion-scope, target, and card counts identical after every cycle; heading lines revealed, 3 cards re-prepared |
| Drag Field Objects above Night Uniform | `section:reorder`; DOM order updated; all 9 targets prepared; a synthetic hover on a moved card mounted the canvas, animated, and parked it back on `body` in both directions |
| Hide and show the kinetic hero | `unload`, then `load`; 7 layers restored; `window`/`document` listener counts identical before and after; the hero element holds exactly one `pointerenter`/`pointermove`/`pointerleave` listener; a synthetic pointer sweep moved and re-stacked the layers, which settled back to rest |
| Add an Editorial product grid | `section:load` with preset defaults, catalogue fallback products, a new motion scope, and one new ScrollTrigger |
| Product template, Night Shift Cargo Pant | 8 panels, 5 features, 2 swatches, 4 recommendation cards; `Ash Gray` → `SOLD OUT` disabled, `Black` → `ADD TO BAG` enabled |
| Hide and show Product recommendations | Re-fetched 4 cards, all WebGL-prepared, no errors |

Findings:

- No theme listener, ScrollTrigger, or WebGL target accumulated across reloads, reorders, or hide/show cycles.
- After a section re-render, `document` gained one `shopify:section:load`/`unload`/`reorder` listener and one `scroll` listener. Tracing them to source showed they come from Shopify's `storefront-modules` bundle, not the theme; the theme's own handlers stayed at exactly one each. This is platform behaviour in design mode and was left alone.
- Mouse input could not be delivered into the preview frame, because the editor's selection overlay received it. Hover was therefore exercised with synthetic pointer events, which do not set the CSS `:hover` state that picks the resting image after a card hover. Real-cursor hover was verified outside the editor in Phase 2.

## Phase 5 product storytelling log

**2026-09-23 — Implementation (D-016):** The PDP is split into a buying fold and a storytelling sequence. The first fold keeps identity, media, options, purchase, and quick-reference panels for Specifications, Fit, Material, and Delivery, plus a "Read the field manual" jump link. Positioning, description, features, compatibility, and edition content moved out of the accordions into five template sections, alternating tone in this order: field manual (light), edition record (dark), works with (light), FAQ (dark), reviews (light), then recommendations (now dark). Each section is `enabled_on` the product template, has a preset for the Theme Editor, uses the shared motion-core reveal attributes, and renders nothing when a product lacks its data. FAQ answers were written only from facts the catalogue already records: drop codes, the unproduced colourway, compatibility, and fit/spec locations. The drop-code answer was narrowed to "numbered editions" after a check showed that `Relay Modular Vest` sits in Limited Editions without a suffix. The store has no shipping or refund policy pages, so the shipping question uses the existing checkout-confirmation wording. The shared product card now stacks its action under the title below 30rem, fixing a pre-existing overlap in two-up grids at 390px.

**2026-09-23 — Verification against the development preview:**

- Theme Check: 53 files, no offenses. No `Liquid error` on the Night Shift Cargo Pant, Sector 05 Field Flask, Night Transit Set 03, Blacksite Shell Jacket, and Nullfold Card Wallet PDPs. Each rendered the seven template sections in order.
- Data coverage checked through the storefront Liquid console: every product has an edition profile and at least one compatible product. Three editions are numbered: Blacksite 180, Night Shift 240, and Dead Channel 300. Thirteen products have a single image and receive the detail-crop figure. The bundle's description differs from its positioning and renders in full.
- Full-page headless Chromium captures at 1440px and 390px, with reduced motion and with motion enabled, showed no horizontal overflow; with motion enabled, the scroll reveals completed.
- Keyboard traversal (CDP, 140 Tab stops) at 1440px and 390px: 138 stops, all with a visible focus indicator, in reading order through the first-fold panels, compatibility cards, FAQ questions, and recommendations.
- Lighthouse 12.8.2 (local dev proxy, mobile emulation): accessibility 100 on the cargo pant and flask PDPs; performance 47 and 49, LCP 6.9 s and 6.4 s, CLS 0.

Not verified: behaviour in the actual Theme Editor for the new sections, a populated reviews state (no review app is installed), and production performance.

**2026-09-24 — Bug found and fixed (recommendations intent):** While testing page transitions, every PDP's Related equipment rail showed the same four products, with `pr_prod_strat=collection_fallback` in their URLs. `assets/theme.js` hardcoded `intent=related`, which has no order history to work from, so the curated complementary sets recorded in Phase 3 were never requested by the theme; only direct endpoint calls had exercised them. The intent is now a section setting that defaults to `complementary`. Afterwards the backpack PDP rendered Gridlink Pouch Array, Sector 05 Field Flask, and Signal Carabiner System, and the carabiner PDP rendered Nullfold Card Wallet and Night Transit Set 03, each tagged `pr_prod_strat=pinned`.

## Phase 6 page transition log

**2026-09-24 — Implementation (D-017):** Same-origin navigations use the browser's cross-document View Transitions API, opted in with `@view-transition { navigation: auto; }` inside `prefers-reduced-motion: no-preference`, and not emitted in design mode or when the new Motion › page transitions setting is off. The outgoing snapshot tears for 180 ms and the incoming one resolves over about 330 ms, overlapping by roughly 50 ms. Keyframes are held with `step-end`, alternating clip-path bands, horizontal shears, and two inline SVG filters that displace the image along a fixed band map and offset red against cyan. A hidden fixed element supplies a transition group that carries an acid scanline in `difference` blend. The header is named and held still. On `pageswap`, the clicked product card's media is named `kova-product-media`, and on `pagereveal` the PDP's primary media takes the same name, so the image morphs intact while the page around it corrupts. Back/forward navigations add a `back` type that mirrors the tear direction. Named elements are cleared after the transition and on bfcache restore. An in-flight WebGL hover is handed back to the DOM image before capture. The script is inlined (2.9 KB) because `pagereveal` fires before deferred scripts run. `rel=expect` holds the first frame until `#MainContent` parses, and a moderate-eagerness Speculation Rules prefetch covers every same-origin link except cart, checkout, and account routes.

**2026-09-24 — Verification (headless Chromium 151 over CDP, local dev proxy):**

- Card → PDP: `pagereveal` delivered a transition, `ready` and `finished` resolved, and the PDP primary media was named. Screencast frames at 0.2× playback showed the RGB-split tear, scanline sweep, intact image morph from card to gallery, and a static header.
- Back navigation: `types` was `["back"]` and the transition finished. A plain footer link also transitioned. Reduced motion: `pagereveal` received no transition.
- Duplicate guard: on the Signal Carabiner System PDP, Static-5 Panel Cap appears in both Works with and Related equipment. Clicking the recommendation named only that card (tagged `recs`), and the transition completed.
- Cost: headless Chromium defaults to SwiftShader software rendering, so frame timing was re-measured with `--enable-gpu --use-angle=vulkan` on the development machine's AMD Radeon (Renoir) integrated GPU. Three runs each: with filters, 7–8 animation frames, max gap 133–183 ms, 517–600 ms total; without filters, 12–19 frames, max gap 117–133 ms, 517–550 ms total. The filters roughly halve delivered frames without lengthening the transition; the effect is intentionally stepped at about 75 ms per frame. The first filter version generated `feTurbulence` noise per frame, and it was replaced by a 1px band image (`feImage`) and fewer filtered keyframes.
- Firefox 154 (headless, WebDriver BiDi): `document.startViewTransition` exists, but `PageRevealEvent` and `CSSViewTransitionRule` do not, so Firefox falls back to ordinary navigation.

Not verified: Safari (supports cross-document view transitions from 18.2, but SVG filters on transition pseudo-elements were not tested), real-device frame timing on discrete or mobile GPUs, the Theme Editor exclusion in the actual editor, and the specific WebGL hover-handoff path in isolation.

## Phase 7 homepage brand-world log

**2026-09-24 — Implementation:** The homepage moved from four sections to ten: release hero (collection mode) → release record → Current Transmission (staggered) → campaign signal frame → manifesto → Night Transit loadout → Night Uniform (feature) → field-test signal frame → Hard Goods (strip) → Field Notes, closing on the footer's end-transmission copy. See D-018 to D-020.

**Bugs found and fixed during verification:**

- Reduced motion's `clearProps: 'all'` wiped the inline `--x/--y` positions of signal-frame annotations. The reveal hook now sits on an inner element.
- `motion-core.js` revealed cards with `autoAlpha`, whose `visibility: hidden` removed links inside unrevealed cards from the tab order. Cards now animate opacity only.
- Pre-existing: `webgl-product-reveal.js` `parkCanvas()` called `appendChild(undefined)` on section unload under reduced motion, where no canvas is ever acquired. It is now guarded.
- The manifesto's signal-red line measured 2.94:1 on the light tone. On that tone the accent is now a bar under ink text.
- Five inline placeholder SVGs added 320 KB to the HTML and pushed LCP from 6.8 s to 7.2–9.2 s. They were replaced with CSS-only pending states, and the front hero layer gained `fetchpriority="high"`.

**Verification (local `theme dev` proxy, Chromium 151 via Playwright):**

- Theme Check: 59 files, no offenses. `node --check` passes for the touched JS.
- All ten sections render with no `Liquid error` at 1440px and 390px, with zero horizontal overflow and one `h1`.
- Derived values match the store: 16 products (the bundle counts as one), 16/16 in stock, Black / Ash Gray, Active; loadout combined variant weight 518 g (1.14 lb), $169.00 vs $188.00; field-test features and five specifications from Blacksite Shell Jacket.
- Synthetic `shopify:section:unload`/`load` of all eight non-hero sections, twice: 9 motion scopes and 14 ScrollTriggers before and after (0 under reduced motion), with no page errors after the WebGL fix. The actual Theme Editor UI was not exercised for the new sections.
- Keyboard: 47 tab stops from the hero to the footer at 1440px. Every link in the annotations, loadout components and product cards is reachable with a visible focus outline, and focused links scroll into view and reveal.

**Lighthouse (12.8.2, default mobile emulation, same proxy caveats as the Metrics table):**

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Previous 4-section template with the new hero code (incl. `fetchpriority`), same day | 57–60 | 100 | 57 | 92 | 6.8 s | — | 500–580 ms | 5,337 KiB |
| New home, before fixes | 50–53 | 96 | 75 | 92 | 8.6–9.2 s | 0.001 | 430–540 ms | 5,345 KiB |
| New home, after fixes (3 runs) | 58–59 | 100 | 57–75 | 92 | 6.6–6.8 s | 0.001 | 480–500 ms | 5,007–5,041 KiB |

The LCP element is the front hero layer in every run. Best-practices variance comes from the proxy and platform artefacts described under Metrics.

**2026-09-24 — Synchronized glitch reveal:** In the Hard Goods strip, the four WebGL intros ran one after another (about 0.86 s each), because the single shared canvas was mounted inside one card at a time. Intros are now batched per card container on the same canvas and context, using per-card viewports and an 80 ms stagger. Measured in Chromium with SwiftShader WebGL: all four Hard Goods cards start at the same frame and finish at +852, +928, +1016 and +1093 ms. In the staggered Current Transmission grid, the third card joins the running batch as it scrolls in instead of waiting. After a batch, hover transitions still mount in the hovered card and the canvas returns to `body`. Section reloads stay at 9 motion scopes and 14 ScrollTriggers with no errors.

**2026-09-24 — Field Notes published:** With user approval, the `Field Notes` blog (`field-notes`) and four articles by "KOVA" were created through `shopify store execute`, after `shopify store auth` requested `read_content,write_content`. The copy was checked against each product's storefront positioning, features and description, and it claims no test or event. The homepage section, `/blogs/field-notes`, and the article pages return 200 with no Liquid errors, one `h1`, and no horizontal overflow at 1440px and 390px. Published dates show 23.09.26 because the store's time zone is behind the UTC publish time.

**Open:** campaign photography (Deferred; frames show pending), Loadout Builder (Planned), and verifying the hero mode toggle and the new sections in the actual Theme Editor UI.


## Phase 8 composition log

The brief called this phase "Phase 7: merchant-composable art direction". It is numbered 8 here because Phase 7 above is the homepage brand world.

**2026-09-24 — Store capability check (read-only):** `shopify store info` and an Admin GraphQL `shop` query report store `kova-ne5bx2j5` as a **development store** on **"Shopify Plus App Development"** (`partnerDevelopment: true`, `shopifyPlus: true`) with **new customer accounts**. Shopify's documentation restricts custom apps that contain Functions to Plus stores, so the later Loadout phases can use a custom app on this store.

**2026-09-24 — Implementation (D-022, D-023):**

- **Snippets:** `display-heading` and `record-list` replace markup repeated in fourteen sections.
- **Blocks and section:** eight KOVA theme blocks, one private row block, and an Editorial composition section with three nested presets.
- **Toggles:** the collection section gains a "Show collection title and description" setting, and the page section, previously bare Skeleton markup, is rebuilt with a "Show page title" setting.
- **Templates:** `collection.story.json` and `page.system.json` compose real data through dynamic sources.
- **Removed:** the Skeleton text/group blocks and custom section.

**Findings during implementation:**

- The development theme refused the first `collection.story.json` upload. Shopify rejects Liquid in a setting "without valid dynamic sources". Bisecting showed the heading's `textarea` setting was the cause.
- `inline_richtext` was tried next and rejected: its default may not contain `<br>`.
- The heading now uses `richtext`, one paragraph per line. A dynamic value must be stored as `<p>{{ closest.collection.title }}</p>`, because top-level richtext nodes must be `p`, lists, or headings.
- A throwaway `product.blocktest` template exercised every block path the two real templates do not use. It was viewed on the backpack PDP and deleted afterwards without being committed. It found:
  - **Image block:** a filter chain inside `image_tag`'s `style:` argument printed an empty `style="object-position: "` when the image had no focal point. The style is now assigned first and emitted only when a focal point exists.
  - **Overlay:** without an image, the text stack became `:first-child` and inherited the backdrop styles. The backdrop now requires a first Image block, and otherwise the children stack.
  - **Record:** its `textarea` lines rejected every metafield dynamic source, so the block's "connect a metafield" claim was false. Switched to `richtext`: `<p>{{ product.metafields.custom.technical_specifications.value }}</p>` uploads and renders the backpack's five specification rows. The `closest.product.metafields…` form is still rejected.
  - **Entities:** a heading of `Tools &amp; gear` would have rendered a visible `&amp;` through `escape`. Rich-text callers now pass `entities: true` (`escape_once`); the fourteen existing callers keep `escape`.
  - **Also exercised:** overlay with a real product image and drift, all three button styles, the wide-second split, `closest.product` in the product block, and a heading with an apostrophe.

  At 390, 768, 1440, and 1920px there was zero overflow and one H1. Desktop kept one persistent drift ScrollTrigger, with none on phones or under reduced motion. Screenshots were reviewed at 390 and 1440px.
- The system page copy was checked against the catalogue with a read-only Admin query. Carry Systems holds the Lowlight Courier 14, After Dark Utility Backpack, Gridlink Pouch Array, and Driftline Hip Rig. Only that collection's description, plus the Night Transit Set's, names Relay Grid, and all 16 KOVA products list compatible products. The draft had implied that the Relay Modular Vest is part of the grid and that every object works with every other. It now names the three carry platforms, each of which lists the Gridlink Pouch Array.
- The rebuilt page section renders the Contact and Your Privacy Choices pages with their title as the only H1 and their content intact.
- Shopify's documentation states that `closest.<type>` is available only as a setting value. Blocks therefore take explicit resource settings, which templates set to `{{ closest.* }}`.

**Verification (local `theme dev` proxy, development theme `164481368323`, Chromium 151 headless):**

- **Theme Check:** 71 files, no offenses. The Shopify AI Toolkit validator could not run (missing `@shopify/theme-check-common`), so Theme Check is the only static check.
- **Refactor regression:** normalized `<main>` HTML (scripts and styles removed, whitespace collapsed) of the homepage, three PDPs, Drop 001, and the blog is byte-identical before and after the snippet refactor. Home, a PDP, and Drop 001 are identical again after the section toggles were added, since they default to on. A repeated fetch without changes was identical, and the baseline was re-fetched after the development theme's sync log confirmed the revert.
- **`/collections/drop-001?view=story`:** one H1, "Drop 001 / Field Test", read from the collection title. Eyebrow "Collection / 16 objects" from the live count; lead text from the description. No collection has an image, so the image block renders nothing.
- **`/pages/contact?view=system`:** previewed on the existing Contact page, so the H1 reads "Contact". Eyebrow "KOVA / 16 objects in Drop 001"; three real product cards with price, compare-at, and Options/Add actions.
- **Layout:** both pages at 390, 768, 1440, and 1920px had zero horizontal overflow, one H1, and no page errors. Screenshots were reviewed at 390 and 1440px.
- **Motion:** 2 ScrollTriggers on load with motion; 0 under reduced motion, with heading lines untransformed.
- **Keyboard:** Tab traversal reached every link and control in `main` in reading order, each with a visible outline.
- **Lighthouse** (12.8.2, mobile emulation, same proxy caveats as the Metrics table):

  | Page | Accessibility | Performance | LCP | CLS |
  | --- | --- | --- | --- | --- |
  | Drop 001, story template | 100 | 74 | 3.4 s | 0 |
  | System page template | 100 | 67 | 3.9 s | 0 |
  | Home | 100 | 61 | 7.2 s | 0.001 |
  | Cargo pant PDP | 100 | 44 | 7.1 s | 0 |

  The PDP score is below the earlier 47–51 range, although its HTML is byte-identical to before this phase. That points to run variance on the proxy, not a regression. It is recorded as measured.

**Not verified yet:**

- The actual Theme Editor UI: adding presets, adding, removing, reordering, and nesting blocks, connecting dynamic sources in the picker, and listener or ScrollTrigger counts across block edits.
- Safari.
- The optional `edition_profile` metaobject template (not started).

**Awaiting approval:**

- Creating "The KOVA system" page with the drafted copy.
- Assigning `collection.story` to a collection.
