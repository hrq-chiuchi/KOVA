# Decision log

D-001 through D-008 were accepted in Phase 0 (2026-09-20). Phase 1 source realizes D-001 through D-006 and passed the recorded Shopify Theme Check, JavaScript syntax checks, static desktop/mobile browser fixtures, and synthetic section lifecycle events. D-007 remains an originality constraint. D-008 remains **Unavailable** because Figma/Codex tooling is not mounted. D-009 and D-010 were accepted in Phase 2 (2026-09-21). D-011 through D-014 were accepted and realized in the Phase 3 catalogue build (2026-09-21) and are verified against the live store; D-010 is superseded (2026-09-23): all three homepage category grids now read real Drop 001 collections. D-015 was accepted in Phase 4 and D-016 in Phase 5 (2026-09-23); D-017 in Phase 6 (2026-09-24).

## D-001 — Use Skeleton as infrastructure, not visual inheritance

**Context:** The project setup record says the target repository began empty. The inspected bootstrap is Shopify's official Skeleton Theme, with useful platform structure and deliberately minimal presentation.

**Options considered:** Build Shopify infrastructure from scratch; heavily reskin Skeleton UI; retain sound Shopify mechanics and build a custom system above them.

**Decision:** Retain/evolve native shell, Liquid, JSON-template, section-group, schema, route/form, localization, and responsive-media mechanics where sound. Replace Skeleton's visual system and major UI architecture rather than allowing scaffold UI to define the product.

**Reasoning:** This preserves tested platform conventions without mistaking minimal defaults for the AFTERDARK SUPPLY experience.

**Tradeoff / reconsideration:** Existing helpers still require review in context. Replace a helper when it blocks the token model, accessibility, performance, or authored composition—not merely because it came from Skeleton.

## D-002 — Use an explicit system taxonomy

**Context:** Calling every Liquid file a component obscures who controls it and whether it is reusable, merchant-composable, or intentionally unique.

**Options considered:** File-type-only classification; one generic component layer; a responsibility-based taxonomy.

**Decision:** Classify work as Foundation, Token, Primitive, Commerce component, Theme block, Section, Template, Motion behavior, or Art-direction exception.

**Reasoning:** The taxonomy clarifies reuse and merchant ownership while protecting deliberate art direction from premature generalization.

**Tradeoff / reconsideration:** Classification adds a small documentation cost. Reclassify when repeated evidence changes ownership—for example, when a local pattern proves useful as a merchant block.

## D-003 — Make DTCG token files canonical

**Context:** Skeleton exposes a small runtime variable set, but the custom system needs traceable reusable decisions and a future Figma bridge.

**Options considered:** Hand-authored CSS variables only; proprietary JSON; DTCG token JSON with a lightweight CSS output path.

**Decision:** Plan canonical `primitive`, `semantic`, `typography`, `motion`, and justified `component` token files using `$type`, `$value`, and `$description`, with `assets/tokens.css` as the planned code output.

**Reasoning:** A standard shape provides intent, aliasing, and future tool interoperability without inventing a parallel schema.

**Tradeoff / reconsideration:** A generator is not automatically required. Select one only if it makes the canonical-to-CSS path simpler and reliable; otherwise use the lightest documented transform.

## D-004 — Keep native scrolling

**Context:** The brief permits Lenis only when it materially improves the experience and warns against novelty, Theme Editor conflicts, anchor issues, and reduced-motion problems.

**Options considered:** Native scrolling; Lenis; a custom requestAnimationFrame scrolling engine.

**Decision:** Use native scrolling. GSAP/ScrollTrigger may layer decorative scroll-linked behavior without replacing the browser's scroll model.

**Reasoning:** Native behavior minimizes lifecycle and accessibility risk while still supporting the required visual direction.

**Tradeoff / reconsideration:** Some smoothing effects are unavailable. Reconsider only with a demonstrated interaction requirement, a measured benefit, and verified anchor, mobile, Theme Editor, and reduced-motion behavior.

## D-005 — Separate decorative motion from commerce

**Context:** Experimental motion must not make product discovery or purchase dependent on an animation library.

**Options considered:** Embed GSAP within each section and component; centralize all behavior in one monolith; isolate a small motion lifecycle layer from native commerce modules.

**Decision:** Plan `assets/motion-core.js` to coordinate GSAP/ScrollTrigger registration and section lifecycle. Core links, forms, product actions, cart, and checkout remain functional without it.

**Reasoning:** This supports progressive enhancement, limits duplicate triggers/listeners, and makes failure modes less harmful.

**Tradeoff / reconsideration:** Section authors must honor a lifecycle contract. Introduce additional motion modules only when a repeated behavior justifies them.

## D-006 — Treat Theme Editor and reduced motion as architecture

**Context:** Shopify can dynamically load, unload, and rerender sections; users may request reduced motion.

**Options considered:** Initialize only on page load and patch failures later; disable all enhancement in the editor; define initialization, cleanup, and reduced-motion behavior from the start.

**Decision:** Every interactive section must initialize idempotently, clean up observers/listeners/ScrollTriggers, and reinitialize after editor rendering. Reduced motion removes large parallax, loops, scrub dependencies, and exaggerated reveals while preserving hierarchy and state.

**Reasoning:** Both conditions change the runtime model and cannot be safely added as late polish.

**Tradeoff / reconsideration:** Lifecycle code increases implementation discipline. The invariant itself should not be relaxed; only its internal API may evolve.

## D-007 — Extract principles from Nightkidz, never implementation

**Context:** Nightkidz establishes the requested level of art direction and interaction quality, while originality is mandatory.

**Options considered:** Reproduce recognizable layouts/effects; avoid the reference entirely; translate high-level principles into a distinct system.

**Decision:** Carry forward signal-like motion, high-contrast full-bleed imagery, oversized typography, modular product storytelling, and state continuity. Exclude branding, assets, typefaces, source, exact compositions, timing, and one-for-one interactions.

**Reasoning:** Principles provide a quality bar without collapsing the project into imitation.

**Tradeoff / reconsideration:** Similar genre cues can still drift toward resemblance. Review authored sections for distinct composition and brand logic before treating them as evidence.

## D-008 — Defer Figma synchronization without blocking code

**Context:** No Figma/Codex design-system integration is mounted in the current environment.

**Options considered:** Block development; simulate or claim Figma output; continue with code-side canonical tokens and a future sync plan.

**Decision:** Mark Figma artifacts **Unavailable**, continue the code-side system, and maintain the checklist in `docs/design-system/README.md`.

**Reasoning:** This keeps progress honest and preserves a clear later path without fabricated evidence.

**Tradeoff / reconsideration:** Code and future design assets may diverge until synchronized. Reconsider immediately when official tooling and a target Figma file become available; record the exact sync method and mismatches.

## D-009 — Use one bounded WebGL reveal context

**Context:** Round 2 requires a technically expressive product-image treatment without making discovery depend on GPU support or allocating one context per card. A viewport-fixed compositor made static product media appear attached to scrolling, while removing the compositor's viewport entry entirely discarded the requested reveal. The catalogue also provides useful second product images for hover inspection.

**Options considered:** one canvas/context per card; a Three.js scene manager; one shared raw-WebGL canvas localized to the active media element; a viewport-fixed compositor; CSS-only crossfade; copying a reference site's exact pixel-blur treatment.

**Decision:** Use one page-level raw-WebGL canvas with one program and buffer. Up to 12 eligible targets own primary and optional secondary textures within a shared 96 MiB budget. An `IntersectionObserver` queues one-time glitch reveals, but never changes product-card opacity, transform, or document positioning. Fine-pointer entry and leave each start a fresh bidirectional transition when a secondary image exists. Every transition temporarily mounts the canvas as an absolute child of the active media box. Frames are requested only during the transition; the canvas is cleared and parked after completion. DOM media remains canonical and takes over after completion, on reduced motion, texture failure, shader failure, context loss, or teardown.

**Reasoning:** The effect needs one textured quad and a small fragment shader. Raw WebGL avoids a framework payload; localizing the shared canvas to the active card preserves normal document scrolling without multiplying contexts. Serializing viewport intros preserves the single-context budget.

**Tradeoff / reconsideration:** A shared localized canvas permits one active GPU transition at a time; hover takes priority and queued viewport reveals resume afterward. Reconsider per-card contexts only if simultaneous transitions become an explicit requirement, or Three.js if later art direction requires scene graphs, cameras, model assets, post-processing chains, or shared 3D materials.

## D-010 — Keep placeholder categories non-purchasable

**Status:** Superseded 2026-09-23. The Drop 001 catalogue supplied real Outerwear and Field Objects collections, so both placeholder grids now run in product mode. Editorial-block mode remains in the section schema for future pre-release stories.

**Context:** Only three temporary products exist, but the Round 2 homepage needs three intentional category stories.

**Options considered:** duplicate products across categories; invent purchasable products; leave sections empty; render branded editorial placeholders.

**Decision:** The first category reads the real catalogue. The next two use explicit editorial mode with theme-owned placeholder art and “pending/in development” copy, no product links, prices, quick-add controls, or fabricated inventory.

**Reasoning:** This preserves a complete composition without creating false commerce state. Merchant image blocks and product/collection settings provide the clean replacement path for the next content handoff.

**Tradeoff / reconsideration:** Placeholder art limits final crop and shader tuning. Replace it as soon as approved category media and product data are available.

## D-011 — Distribute Shopify depth instead of flattening the catalogue

**Context:** The KOVA handoff contains 15 image-backed product concepts across apparel, carry, accessories, and utility objects. The portfolio needs rich PDP possibilities, but giving every product the same maximal field set would create redundant merchant work and undifferentiated pages.

**Options considered:** one universal long-form product schema; a separate metafield for every possible measurement; native Shopify fields plus a small shared custom-data layer with selective product population.

**Decision:** Keep Shopify's native product, variant, inventory, media, category, pricing, and SEO fields authoritative. Add ten product metafields for descriptor, positioning, features, compact specifications, reusable material/fit/edition profiles, package information, compatible products, and an optional reference file. Model shared material, fit, and edition records as metaobjects. Populate only the fields that improve a product's actual story. Use Search & Discovery for recommendation merchandising and Shopify Bundles only when its native component-bundle capability is available.

**Reasoning:** This gives apparel, carry systems, and hard goods different PDP data without creating dozens of product-specific fields or encoding structured commerce facts in theme settings.

**Tradeoff / reconsideration:** A compact multi-line specification field is less queryable than one metafield per measurement. Promote a measurement to its own typed metafield only when collection filtering, automation, or repeated cross-product use proves the need.

## D-012 — Write structural catalog data through the Admin GraphQL API

**Context:** The catalogue needed 24 metaobject entries, ~70 metafield values, colour swatch links, file uploads, seven collections and a native bundle. The Shopify admin UI was usable but slow and fragile under automation: stale DOM nodes between observations, controls inside shadow roots, and relay RPC timeouts that lost one metafield definition outright. The admin's own GraphQL endpoint accepts only hashed persisted operations, so session cookies alone cannot drive arbitrary mutations.

**Options considered:** continue clicking through the admin for every field; create an app in the Dev Dashboard and install it; enable legacy custom app development on the store and use an Admin API token.

**Decision:** With explicit user approval, legacy custom app development was enabled and a `KOVA Catalog Ops` custom app was installed with product, inventory, file, metaobject, publication and location scopes. Structural data is written through Admin GraphQL `2025-07`. The token lives only in the session that used it and is never committed; no credential appears in the repository.

**Reasoning:** Deterministic, inspectable mutations with real user errors beat hundreds of UI interactions, and the same queries double as the verification evidence for this phase.

**Tradeoff / reconsideration:** Shopify marks the custom-app store flag as irreversible, and the installed app remains an access surface. As of 2026-09-23 the app is intentionally retained because more products will be added in later phases. Uninstall it when catalogue work is finished; if ongoing programmatic access becomes permanent, move to a Dev Dashboard app with a narrower scope set.

## D-013 — Ship one produced colourway and keep the second honest

**Context:** The brief asks for colour variants and swatches, but the supplied imagery shows a single dark colourway for every object. Assigning that photography to a second colour would misrepresent the product, which the project rules prohibit.

**Options considered:** ship black only and drop colour variants; invent recoloured imagery; ship a second colourway with no media and no stock.

**Decision:** Seven products carry a `Color` option linked to the standard `shopify.color-pattern` metafield, giving real swatches for `Black` (`#0B0B0C`) and `Ash Gray` (`#6E7176`). Black variants hold inventory and variant-specific media. `Ash Gray` variants hold zero inventory and no media, so the storefront shows a genuine sold-out state.

**Reasoning:** This demonstrates linked swatches, variant media and sold-out handling on real data without fabricating product photography.

**Tradeoff / reconsideration:** Half of the colour variants are unbuyable, so conversion-shaped demos are limited. Load stock and variant media for `Ash Gray` as soon as approved imagery exists.

## D-014 — Use native Shopify primitives for sets, cross-sell and documents

**Context:** Sets, cross-sell and downloadable documents can each be faked with custom metafields, which would look complete while bypassing the platform behaviour the portfolio is meant to demonstrate.

**Options considered:** model everything as custom metafields; use a third-party bundles or upsell app; use the native primitives where the store supports them.

**Decision:** `Night Transit Set 03` is a real component bundle created with `productBundleCreate`, so inventory derives from its components and it checks out as one line. Cross-sell uses Shopify's Search & Discovery metafield so `/recommendations/products.json?intent=complementary` serves it. Reference guides are real PDFs in Shopify Files attached through `custom.reference_guide`. `Gridlink Pouch Array` stays a single fixed-price product because it is one manufactured set, not three purchasable objects.

**Reasoning:** Native primitives keep merchant editing, inventory maths and the recommendation endpoints intact, and they prove the capability rather than imitating it.

**Tradeoff / reconsideration:** `intent=related` stays empty until the store has order history, and bundle pricing must be maintained against component prices. Revisit if a component price changes or if the set needs customer-selectable options.

## D-015 — Let structured data own material and care copy

**Context:** Phase 4 renders material, care, and edition data from metaobjects. Fifteen product descriptions repeated the same material and care text, plus an identical "Field note" paragraph, so the PDP showed the information twice. Descriptions also feed the Shop app and Google Shopping, which do not render theme panels.

**Options considered:** hide the repeated description sections in the theme only; trim the store copy; leave the duplication.

**Decision:** With user approval (2026-09-23), trim the store copy. Keep each description's opening paragraph and any product-specific sections. Remove material and care sections only where a material profile exists, and remove the boilerplate field note everywhere.

**Reasoning:** One source per fact avoids drift between the description and the metaobject, and it keeps the PDP free of repetition and orphaned headings.

**Tradeoff / reconsideration:** Channels that show only the description (Shop app, Google Shopping) lose material and care detail. Reconsider if channel conversion depends on that copy; the fix would then be a channel-specific description feed, not re-duplicating the storefront copy. The originals were backed up before the change.

## D-016 — Split the PDP into a buying fold and storytelling sections

**Context:** After Phase 4, almost all product content lived in accordions next to the purchase controls. For a portfolio PDP, that hid the strongest material: edition runs, compatibility, and build notes. The user asked for real sections below the fold, including an FAQ and customer reviews.

**Options considered:** keep everything in accordions; move everything into long-form sections; keep quick-reference accordions in the buying fold and give narrative content its own sections.

**Decision:** Keep Specifications, Fit, Material, and Delivery as accordions beside the buy button. Move positioning, description, and features into a field-manual section; edition data into an edition-record section; and compatibility into a works-with section. Add an FAQ section built from merchant blocks and a reviews section. Reviews render only from Shopify's standard `reviews` metafields and `@app` blocks: no authored, sample, or placeholder reviews ship with the theme, and the section shows an honest empty state until a review app provides data.

**Reasoning:** Quick facts stay next to the decision point, while the storytelling sections can use art-directed type, figures, and data-led layouts. Each content item keeps one home, so nothing repeats across the page.

**Tradeoff / reconsideration:** The page is longer, and a merchant who removes the field-manual section also removes the description from the PDP; the main section's jump link can be turned off for that case. Reconsider the reviews rule only if the store installs a review provider whose data does not use the standard metafields.

## D-017 — Use native cross-document view transitions for a corrupted-signal page change

**Context:** The portfolio needs a distinctive page transition that still feels seamless. The theme is a multi-page Shopify storefront, and the project rules require native navigation, working commerce without decorative scripts, Theme Editor safety, and a first-class reduced-motion mode.

**Options considered:** a fetch-and-swap single-page layer (Barba, Swup); an outgoing WebGL glitch that delays navigation; the browser's cross-document View Transitions API with CSS and SVG filters.

**Decision:** Use cross-document view transitions. Every navigation stays a real page load; supporting browsers animate the old and new snapshots with a stepped "corrupted" treatment (SVG RGB split and band tearing, clip-path bands, shear, scanline). Pin the header, morph the clicked product image into the PDP, and reverse direction on back navigation. Gate it behind reduced motion, design mode, and a Motion theme setting.

**Reasoning:** A swap layer would bypass Shopify's per-page scripts, analytics, and section lifecycle. A pre-navigation WebGL glitch adds latency to every click and cannot survive the document change. View transitions keep native navigation, degrade to an ordinary page load, and run on snapshots, so no page code has to cooperate beyond naming shared elements.

**Tradeoff / reconsideration:** Browsers without cross-document support, including Firefox 154, get no transition. Full-viewport SVG filters roughly halve delivered animation frames on an integrated GPU; drop to the transform/clip-only variant if real-device testing shows dropped steps. Reconsider if Firefox ships cross-document view transitions or if the stepped effect reads as jank rather than intent.

