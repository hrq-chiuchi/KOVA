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
| Sections | Authored, configurable experiences | Header, cinematic hero, featured collection, marquee, product spotlight | Own schema, section lifecycle, responsive composition, and cleanup. |
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

These contracts describe inspected Phase 1 source. Shopify Theme Check and relevant static desktop/mobile browser paths passed, including synthetic section lifecycle events; real catalogue/media and the actual Theme Editor UI remain pending.

### Editorial product card — Commerce component

- **Surface:** `snippets/product-card.liquid`
- **Purpose:** reusable product discovery inside the featured rail.
- **Anatomy:** linked responsive media or placeholder; editorial index; conditional sold-out badge; linked title; formatted price.
- **Data/accessibility:** Shopify image widths and `sizes`, lazy loading, image alt fallback to product title, escaped labels, and normal product links. Decorative indexing is hidden from assistive technology.
- **Motion boundary:** `data-reveal-card` is an enhancement hook only; product navigation and content do not depend on GSAP.

### Header and mobile navigation — Section + primitive behavior

- **Surface:** `sections/header.liquid` with the `afterdark-header` custom element in `assets/theme.js`.
- **Anatomy:** brand/home link, desktop primary navigation, optional search, account, cart count, mobile menu trigger, native modal dialog, close action, and mobile navigation.
- **Merchant controls:** brand mark, menu, search visibility, and customer-account menu.
- **Lifecycle/accessibility:** an `AbortController` owns listeners; disconnect aborts them and clears scroll lock. The dialog updates `aria-expanded`, moves focus to Close on open, restores prior focus on close, exposes current-page state, and closes from its backdrop.

### Cinematic hero — Authored section

- **Surface:** `sections/cinematic-hero.liquid`.
- **Anatomy:** backdrop, optional video or responsive desktop/mobile image, contrast overlay, eyebrow, line-wrapped heading, body, CTA, and decorative signal.
- **Merchant controls:** media, copy, CTA, content position, alignment, viewport height, colors, overlay strength, entrance toggle, and parallax intensity.
- **Responsive/art direction:** full-bleed media, controlled overlay, oversized fluid title, mobile image source, and stacked mobile footer. Heading reveal and desktop parallax remain decorative.

### Featured collection rail — Section + commerce composition

- **Surface:** `sections/featured-collection.liquid` with the `product-rail` custom element in `assets/theme.js`.
- **Anatomy:** eyebrow/heading, previous/next controls, focusable named track, product cards or Theme Editor placeholders, and optional collection CTA.
- **Merchant controls:** collection, copy, item limit, and section colors.
- **Interaction:** CSS overflow and scroll snap are canonical. Buttons scroll by one measured card and update disabled state on scroll/resize; mobile hides buttons while native horizontal scrolling remains available.

### Lifecycle contract

1. A section opts into decorative motion with `data-motion-scope`; hooks such as `data-reveal`, `data-reveal-card`, and `data-parallax` stay declarative.
2. `AfterdarkMotion.init(root)` destroys any prior record for that scope before creating a `gsap.matchMedia()` context; the scope map prevents orphaned duplicate contexts.
3. Desktop/mobile and `prefers-reduced-motion` conditions share one scoped setup. Reduced motion clears animation properties and returns before reveals or parallax are created.
4. `AfterdarkMotion.destroy(root)` reverts matching media contexts. `shopify:section:load` initializes, `shopify:section:unload` destroys, and `shopify:section:select` refreshes ScrollTrigger.
5. UI custom elements independently abort event listeners and disconnect observers in `disconnectedCallback`; commerce/navigation behavior does not depend on motion initialization.
6. Fonts and window load request a ScrollTrigger refresh. Static normal/reduced-motion paths and synthetic section unload/load/repeated-load events passed; the actual Shopify Theme Editor UI remains to be exercised.

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

Statuses below use local CLI/static-fixture evidence and do not imply a live-store test.

| System item | Classification | Code surface | Status |
| --- | --- | --- | --- |
| Skeleton theme shell, Liquid routing, JSON-template structure | Foundation | `layout/`, `templates/` | **Locally verified:** Theme Check reported no offenses |
| Responsive image and metadata helpers | Primitive | `snippets/image.liquid`, `snippets/meta-tags.liquid` | **Locally verified:** Theme Check reported no offenses; real media pending |
| DTCG canonical token hierarchy | Token | `design-system/tokens/*.tokens.json` | **Implemented; manual JSON/CSS synchronization remains** |
| Token custom properties | Token | `assets/tokens.css` | **Locally verified in static fixture** |
| Global visual/accessibility foundation | Foundation | `assets/theme.css` | **Locally verified in desktop/mobile and reduced-motion fixtures** |
| Runtime settings bridge and display/body fonts | Foundation | `snippets/css-variables.liquid`, `config/settings_schema.json` | **Locally verified:** Theme Check reported no offenses; live settings pending |
| Theme shell asset assembly and skip-link/main landmark | Foundation | `layout/theme.liquid` | **Locally verified:** Theme Check reported no offenses |
| Navigation and product-rail lifecycle | Primitive behavior | `assets/theme.js` | **Locally verified:** syntax, dialog, focus, body lock, rail controls, and synthetic section-event paths passed |
| Vendored GSAP 3.13 and ScrollTrigger | Motion dependency | `assets/gsap.min.js`, `assets/ScrollTrigger.min.js` | **Locally verified:** both loaded in the static fixture |
| Scoped motion lifecycle and reduced-motion branch | Motion behavior | `assets/motion-core.js` | **Locally verified:** normal/reduced paths and idempotent synthetic unload/load passed; actual Theme Editor UI pending |
| Editorial product card | Commerce component | `snippets/product-card.liquid` | **Locally verified with fixture cards; real Shopify products/media pending** |
| Global header and modal mobile navigation | Section | `sections/header.liquid` | **Locally verified in mobile fixture; live Shopify menu/account data pending** |
| Cinematic hero | Section | `sections/cinematic-hero.liquid` | **Locally verified at 1440×900 and 390×844 fixture viewports; real media pending** |
| Native horizontal featured collection rail | Section | `sections/featured-collection.liquid` | **Locally verified:** overflow, sizing, button advance, and control state passed in fixture |
| Hero + featured collection homepage composition | Template | `templates/index.json` | **Locally verified in static fixture; live Shopify rendering pending** |
| Broader product, collection, cart, search, editorial system | Components / sections / templates | To be decided within Shopify conventions | **Deferred beyond the named Phase 1 surfaces** |
| Figma variables, components, and code mappings | Design tooling | Figma library | **Unavailable** |

Shopify CLI Theme Check inspected 47 files and reported 0 offenses. `node --check` passed for `assets/theme.js` and `assets/motion-core.js`. The Skeleton `text` and `group` theme blocks remain baseline infrastructure and are not yet approved as final AFTERDARK SUPPLY blocks. Basic product, collection, cart, search, and footer presentation remains outside this Phase 1 implementation claim.

## Figma synchronization plan — Unavailable now

No Figma/Codex integration is mounted in this environment. No Figma file, variable collection, component library, generated screen, or Code Connect mapping has been created. Code-side work should continue without blocking.

When official tooling becomes available:

1. Import or recreate primitive and semantic DTCG tokens as Figma variables; record aliases and any unsupported token types.
2. Establish collections/modes for foundations before building components; avoid a second independent naming scheme.
3. Recreate typography roles and motion annotations, including reduced-motion equivalents.
4. Build only meaningful primitives and commerce components with intentional properties and variants.
5. Add authored section examples separately from reusable components so art-direction exceptions remain visible.
6. Map important pairs such as Editorial Product Card ↔ `snippets/product-card.liquid` and Cinematic Hero ↔ `sections/cinematic-hero.liquid`; document legitimate abstraction mismatches.
7. Compare token names, component anatomy, states, responsive behavior, merchant controls, accessibility notes, and implementation status.
8. Mark each inventory item as Figma-only, code-only, synchronized, or intentionally divergent, with the date and tool used.
9. Capture evidence of the synchronization; do not backfill or imply artifacts that were not generated.
