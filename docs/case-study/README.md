# AFTERDARK SUPPLY case-study record

## Evidence policy

This is a working evidence record, not a retrospective success story. Claims distinguish source inspection, project setup records, reference-derived principles, local CLI/static-browser verification, and future live-Shopify work. Phase 1 passed the checks recorded below, including synthetic Theme Editor lifecycle events; the actual Theme Editor UI and real catalogue/media remain unverified. No Lighthouse, Core Web Vitals, usability, conversion, animation-frame-rate, Figma-artifact, or live-store outcome claim is made.

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

### Known unknowns and risks

- Real catalogue content, imagery, brand assets, settings combinations, and merchant workflows remain unverified.
- Synthetic section unload/load/repeated-load behavior is verified; the actual Shopify Theme Editor UI has not been exercised.
- The corrected mobile heading fit the tested fixture; different merchant copy, fonts, and media can still expose composition issues.
- Vendored animation code and production media may affect page cost; no performance baseline exists.
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
