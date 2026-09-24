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
- **Anatomy:** linked responsive primary media, optional second product image, editorial index, availability badge, title, price/compare-at price, and either single-variant quick add or an options link.
- **Fallback:** normal product links and DOM images remain canonical. Cards with a second image crossfade to it on hover when WebGL is unavailable; reduced motion keeps this state change effectively immediate.

### Header, navigation, and cart drawer — Sections + primitive behavior

- **Surfaces:** `sections/header.liquid`, `sections/cart-drawer.liquid`, and `assets/theme.js`.
- **Header:** centered merchant logo/wordmark, menu on the left, search/account/bag on the right, transparent homepage state, and blurred scrolled/non-home state.
- **Navigation:** native modal dialog; opening moves focus to Close, Escape/backdrop/Close dismiss it, `aria-expanded` is synchronized, and focus returns to the trigger.
- **Cart:** the normal `/cart` link remains the fallback. JavaScript progressively opens a modal drawer, refreshes it through the Section Rendering API, updates quantities through `/cart/change.js`, and updates the header count.

### Kinetic hero — Authored section + motion behavior

- **Surfaces:** `sections/kinetic-hero.liquid` and `assets/kinetic-hero.js`.
- **Media fallback:** merchant image blocks, then current product media, then theme-owned placeholder art; five layers are always present.
- **Interaction:** desktop pointer movement uses reusable `gsap.quickTo()` setters to carry the entire layered stack across the hero, with faster response at the front and restrained lag behind it; distance-based promotions stay at the pointer instead of jumping against its direction. Pointer leave returns the stack to its right-side resting composition. Coarse-pointer input advances on a non-interactive tap. Reduced motion retains a static readable stack.
- **Merchant controls:** up to seven desktop/mobile image pairs, copy, CTA, height, pointer threshold, and section colors.

### Editorial product grid — Section

- **Surface:** `sections/editorial-product-grid.liquid`.
- **Modes:** real product data from a manual product list, selected collection, or `collections.all`; or explicitly non-purchasable editorial placeholders.
- **Composition:** aligned or staggered three-card desktop layouts become dense two-column mobile layouts. The homepage uses one real-product release and two clearly pending editorial categories.

### WebGL product reveal — Motion behavior

- **Surface:** `assets/webgl-product-reveal.js` with one page-level canvas in `layout/theme.liquid`; the canvas is temporarily mounted inside the active media element.
- **Budget:** one context, one program/buffer, at most 12 media targets, two textures per target, 96 MiB total estimated texture storage, and DPR capped at 1.5 desktop and 1 mobile.
- **Runtime:** Product cards remain in normal document flow with no card-level fade, translation, fixed layer, or sticky layer. An `IntersectionObserver` queues a one-time block-glitch reveal when each media target enters the viewport; the canvas is an absolute child of the active media box, so it scrolls exactly with the card. Every fine-pointer entry and leave runs a fresh bidirectional block-glitch transition between the first and second product images. Rendering is request-driven only during a transition; the canvas is then cleared and returned to its page-level parking position while the corresponding canonical DOM image takes over.
- **Failure handling:** shader/program/texture/CORS failure leaves DOM media visible. Context loss restores the primary DOM media immediately. Section unload deletes textures, tweens, observer registrations, queued intros, and pointer listeners; context resources are disposed when no targets remain.

### Commerce templates — Sections

- **Collection:** `sections/collection.liquid` provides a sticky desktop filter/sort column, native GET filtering, two product columns, compact mobile controls, pagination, and empty state.
- **Product:** `sections/product.liquid` provides identity, bounded two-column media gallery, sticky purchase panel, option buttons, quantity controls, native payment button, accordions, and variant URL/state updates.
- **Recommendations:** `sections/product-recommendations.liquid` progressively loads related products through Shopify's recommendation endpoint.
- **Cart/footer:** `sections/cart.liquid` provides editable lines, order note, totals, and checkout; `sections/footer.liquid` provides navigation, newsletter, optional localization, payment methods, and the KOVA wordmark.

### Lifecycle contract

1. A section opts into decorative motion with `data-motion-scope`; hooks remain declarative and commerce-independent.
2. `AfterdarkMotion.init(root)` destroys any prior scope before creating a `gsap.matchMedia()` context.
3. `AfterdarkWebGL.init(root)` reuses the page context and ignores existing targets; `destroy(root)` deletes only resources owned by that root.
4. `prefers-reduced-motion` creates no reveal ScrollTriggers or WebGL textures and leaves the DOM hierarchy visible.
5. `shopify:section:load` initializes both layers; unload destroys both; select and load/font events refresh layout-dependent state.
6. Repeated section load is idempotent: the exercised homepage remained at three motion scopes, three WebGL targets, and nine ScrollTriggers after reloading the same section twice.

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
| Header and modal navigation | Section | `sections/header.liquid`, `assets/theme.js` | **Locally verified:** scroll state, focus entry/return, Escape cleanup, mobile/desktop layouts |
| Progressive cart drawer | Section / commerce component | `sections/cart-drawer.liquid`, `assets/theme.js` | **Locally verified:** empty state, Section Rendering refresh, open/close; available-item mutation pending |
| Kinetic image-stack hero | Section / motion behavior | `sections/kinetic-hero.liquid`, `assets/kinetic-hero.js` | **Locally verified:** deterministic first and repeated pointer entry, full-width pointer following, directional layer promotion, right-side rest, touch advance, fallback layers, reduced-motion static state |
| Editorial category grid | Section | `sections/editorial-product-grid.liquid` | **Locally verified:** three homepage instances in product mode: a hand-picked Drop 001 lead set, Outerwear, and Field Objects, with no repeated product; editorial-block mode remains available but unused |
| Single-context WebGL reveal | Motion behavior | `assets/webgl-product-reveal.js` | **Locally verified:** static document-flow cards, localized absolute canvas, queued viewport glitch reveal, three repeatable bidirectional hover cycles, request-driven rendering, DOM-image handoff, reduced-motion and context-loss fallbacks; textures prepared only within half a viewport of a card |
| Editorial product card | Commerce component | `snippets/product-card.liquid` | **Locally verified:** responsive primary/alternate media, current catalogue prices/availability, WebGL hover enhancement, and CSS fallback; one tab stop per card (media link hidden as a duplicate), sold-out state announced, configurable `h2`/`h3` title |
| Collection browsing | Section | `sections/collection.liquid` | **Locally verified:** current products, filter/sort controls, desktop/mobile layouts |
| Product purchase surface | Section | `sections/product.liquid`, `assets/theme.js` | **Locally verified:** real media/options, linked colour swatches, variant and quantity state, genuine sold-out state on the unproduced colourway, and a successful add-to-cart on single-variant, multi-variant, and bundle products after the single-variant matcher fix. Custom-data presentation (descriptor, positioning, drop code, specifications, fit, material, compatibility, edition, package, reference guide) renders on five representative PDPs; the Features list renders five entries on all 16 products after the catalogue data fix |
| Product recommendations | Section | `sections/product-recommendations.liquid` | **Locally verified (2026-09-24):** the section requests the curated `complementary` intent by default (merchant-selectable); a corrected bug had hardcoded `intent=related`, which served Shopify's generic `collection_fallback` picks on every product; tone setting added (dark on the product template) |
| Product field manual | Section / art-direction exception | `sections/product-field-manual.liquid` | **Locally verified:** positioning as a display statement, full description only when it adds to the positioning, numbered build notes, second product image as a figure or an enlarged detail crop for single-image products |
| Product edition record | Section / art-direction exception | `sections/product-edition.liquid` | **Locally verified:** edition quantity as the display figure (drop code when unnumbered), record list, release note, decorative CSS tick band (one gradient, `aria-hidden`) |
| Product compatibility | Section / art-direction exception | `sections/product-compatibility.liquid` | **Locally verified:** current object as an accent-outlined anchor tile, joined by `+` to up to three compatible products rendered with `snippets/product-card.liquid`; column count follows the data |
| Product FAQ | Section | `sections/product-faq.liquid` | **Locally verified:** merchant question blocks on native `<details>`, optional shipping/returns question that links store policies when they exist and otherwise uses the checkout-confirmation fallback |
| Product reviews | Section | `sections/product-reviews.liquid` | **Implemented; empty state verified:** reads only Shopify's standard `reviews.rating`/`reviews.rating_count` metafields and `@app` review blocks; no review app is installed, so every product currently shows the empty state |
| Corrupted-signal page transition | Motion behavior | `snippets/page-transition.liquid`, `assets/page-transition.css`, `assets/page-transition.js`, `layout/theme.liquid` | **Locally verified in Chromium 151 (2026-09-24):** cross-document view transition with SVG RGB-split/band-tear filters, pinned header, scanline sweep, card-to-PDP image morph, reversed tear on back navigation, single-name guard, bfcache cleanup, hover prefetch; off for reduced motion, in the Theme Editor, and by the Motion theme setting. **Unavailable in Firefox 154** (no cross-document view transitions; plain navigation) |
| Catalog custom-data model | Foundation (Shopify custom data) | Shopify metafield/metaobject definitions; recorded in `docs/case-study/README.md` | **Implemented:** 10 product metafield definitions, 3 reusable metaobject definitions, 24 entries, all `PUBLIC_READ` for storefront consumption |
| Drop 001 catalogue and collections | Templates / merchandising | Shopify products, collections, files | **Locally verified:** 16 published products, 62 variants, 7 published smart collections rendering 16/4/3/5/3/2/3 cards with no horizontal overflow |
| Cart page and global footer | Sections | `sections/cart.liquid`, `sections/footer.liquid` | **Locally verified:** empty cart, newsletter/localization rendering conditions, desktop/mobile layout |
| Figma variables, components, and code mappings | Design tooling | Figma library | **Unavailable** |

Shopify CLI Theme Check inspects the current theme without offenses. `node --check` passes for `assets/theme.js`, `assets/motion-core.js`, `assets/kinetic-hero.js`, and `assets/webgl-product-reveal.js`. The Skeleton `text` and `group` theme blocks remain baseline infrastructure and are not yet approved as final KOVA blocks.

## Figma synchronization plan — Unavailable now

No Figma/Codex integration is mounted in this environment. No Figma file, variable collection, component library, generated screen, or Code Connect mapping has been created. Code-side work should continue without blocking.

When official tooling becomes available:

1. Import or recreate primitive and semantic DTCG tokens as Figma variables; record aliases and any unsupported token types.
2. Establish collections/modes for foundations before building components; avoid a second independent naming scheme.
3. Recreate typography roles and motion annotations, including reduced-motion equivalents.
4. Build only meaningful primitives and commerce components with intentional properties and variants.
5. Add authored section examples separately from reusable components so art-direction exceptions remain visible.
6. Map important pairs such as Editorial Product Card ↔ `snippets/product-card.liquid` and Kinetic Hero ↔ `sections/kinetic-hero.liquid`; document legitimate abstraction mismatches.
7. Compare token names, component anatomy, states, responsive behavior, merchant controls, accessibility notes, and implementation status.
8. Mark each inventory item as Figma-only, code-only, synchronized, or intentionally divergent, with the date and tool used.
9. Capture evidence of the synchronization; do not backfill or imply artifacts that were not generated.
