# Decision log

D-001 through D-008 were accepted in Phase 0 (2026-09-20). Phase 1 source realizes D-001 through D-006 and passed the recorded Shopify Theme Check, JavaScript syntax checks, static desktop/mobile browser fixtures, and synthetic section lifecycle events. D-007 remains an originality constraint. D-008 remains **Unavailable** because Figma/Codex tooling is not mounted. D-009 and D-010 were accepted in Phase 2 (2026-09-21). D-011 through D-014 were accepted and realized in the Phase 3 catalogue build (2026-09-21) and are verified against the live store; D-010 is superseded (2026-09-23): all three homepage category grids now read real Drop 001 collections. D-015 was accepted in Phase 4 and D-016 in Phase 5 (2026-09-23); D-017 in Phase 6 (2026-09-24); D-018 to D-021 in Phase 7; D-022 and D-023 in Phase 8 (2026-09-24). D-039 to D-047 were accepted in Phase 14 (commerce and merchandising, 2026-09-25): D-039 to D-043 in PR A, D-044 to D-047 in PR B.

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

**Revision (2026-09-26):** the header is no longer pinned. Since the announcement bar (D-045), the header's offset depends on scroll, so a pinned header jumped to its new position and sat still while the bar corrupted above it. At the user's request, the header and bar now tear out and resolve in with the page.


## D-018 — Restructure the homepage as a brand world, built mostly from existing systems

**Context:** The homepage ran hero → three near-identical product grids → footer. It looked finished but read as a catalogue. An external scope proposal suggested twelve beats alternating commerce, atmosphere, story and evidence, built on four brand systems: Drops, Loadouts, Field Manuals and Field Notes. Taken literally it would add twelve bespoke sections, two of which repeat the same facts, and it contained invented data (a release date equal to the day it was written, a "Black / Graphite / Signal" colour system).

**Options considered:** build all twelve beats as proposed; add only visual interludes; consolidate the beats onto existing patterns and derive every fact from the store.

**Decision:** Consolidate. The "Drop Transmission" and "Drop Record" beats become one release-record section. The campaign interlude and field test share one annotated full-bleed section. Night Uniform and Hard Goods become two new layouts of the existing editorial grid rather than new sections. The end transmission is footer copy. That leaves five new sections. Every fact is derived from the store: product count, stock, colourways, combined variant weight, bundle price, and field-test copy from `custom.feature_list` and specifications. Atmosphere lines are editorial text in a clearly labelled setting. Image-led sections without campaign photography render a CSS-only pending state, following D-010.

**Reasoning:** Each fact keeps one home (the D-016 rule). Reusing the grid and the frame keeps the system small while the page rhythm changes. Deriving data means the page cannot drift from the catalogue.

**Tradeoff / reconsideration:** The pending frames make the page visibly unfinished until photography exists. Shopify's placeholder illustrations were tried first and dropped: five of them inlined 320 KB of SVG into a 437 KB document and delayed the hero LCP. Replace pending frames as soon as approved campaign imagery exists (done in D-048). Promote the signal frame's annotation model only if a third use appears.

## D-019 — Let the hero follow a collection without losing the authored hero

**Context:** The user wanted to keep the current statement hero and also be able to point the hero at a release.

**Options considered:** replace the hero with a release hero; add a second hero section; add a content-source setting to the existing hero.

**Decision:** Add `content_source` (`custom` | `collection`). Custom is unchanged. Collection mode draws the image stack from the collection, and each blank text setting falls back to the collection's title, product count, description or URL. A quiet secondary link can point to the release record.

**Reasoning:** One section keeps one motion lifecycle, and merchants switch modes without rebuilding the section.

**Tradeoff / reconsideration:** Authored copy overrides collection copy field by field, so a merchant must clear a field to see the fallback. Reconsider with an explicit per-field toggle if that confuses merchants.

## D-020 — Field Notes are real blog articles or nothing

**Context:** A journal index makes a fictional brand feel active, but sample entries would be invented content presented as published writing.

**Options considered:** ship sample entries; defer the section; build a blog-backed section with an honest empty state, and publish articles only after copy approval.

**Decision:** `sections/field-notes.liquid` reads only a Shopify blog. With no blog or no articles it says "No field notes published yet". Articles are drafted as brand and design notes, never as claims that tests or events happened, and are published only after user approval.

**Reasoning:** This follows the reviews rule in D-016: the theme never ships authored stand-in content.

**Tradeoff / reconsideration:** The homepage shows an empty journal until articles are approved and published. Four articles were approved and published on 2026-09-24.

## D-021 — Batch WebGL intros on the single shared context

**Context:** D-009 bounds the reveal to one WebGL context and canvas, which was mounted inside one card per intro. A row of four cards therefore glitched one after another, over more than three seconds, which reads as lag rather than a signal.

**Options considered:** one canvas per card (breaks the context budget); a fixed full-viewport overlay (drifts against native scroll between frames); mounting the same canvas over the cards' shared container and drawing each card into its own viewport.

**Decision:** Batch intros that arrive together in the same container. The canvas mounts absolutely inside the container, so it scrolls with the cards, and each card draws with `gl.viewport`/`gl.scissor` at its measured offset with an 80 ms stagger. Hover keeps the single-card mount.

**Reasoning:** The context, program and texture budgets are unchanged, native scrolling is untouched, and the whole row reads as one moment with slight desynchronisation.

**Tradeoff / reconsideration:** A batch canvas covers the whole container, so its pixel area is larger than one card for the length of the intro. Reconsider if a container grows very tall (for example a long collection grid revealing in one batch) and frame pacing suffers on low-end GPUs.

## D-022 — Compose art direction from snippets, opinionated theme blocks, and one section

**Context:** Merchants could reuse KOVA's look only by copying whole sections. Fourteen sections repeated the same reveal-line heading markup, and two duplicated the specification parser. The only theme blocks were Skeleton's generic `text` and `group`. The brief suggested a four-family block tree (layout, media, content, interaction), but warned against building a generic page builder.

**Options considered:**
- Convert every section-local block (pillars, frames, annotations, stories) into global theme blocks. This means a data migration in `index.json` and `product.json`, and it flattens compositions that only work in one place.
- Build a free-form builder with offsets, masks, and animation modes.
- Extract snippet primitives for the real duplication, add a small set of opinionated blocks, and add one section that hosts them.

**Decision:**
- Add two snippets, eight public blocks, one private row block, and `sections/composition.liquid` with three nested presets.
- Keep the signature sections as art-direction exceptions. They adopt the snippets without schema changes, so no template data changes.
- Limit motion to heading reveal and image drift. Marquee, glitch, and video are **Deferred**: marquee and glitch have no second use yet, and video needs a pause control and a reduced-motion rule that it never autoplays.
- Resources reach blocks through explicit settings set to `{{ closest.* }}`.
- The heading and the record lines use `richtext` paragraphs as lines, because `textarea` rejects dynamic sources and `inline_richtext` rejects line breaks.
- The collection and page sections gain toggles for their own title, so a composition can hold the single H1 without repeating facts.

**Reasoning:** The duplication was in markup, not in merchant content, so it belongs in snippets. The blocks cover what a merchant actually rearranges: arrangement, type, copy, action, image, facts, and a product card. Keeping the exceptions intact preserves the compositions that give the site its character.

**Tradeoff / reconsideration:**
- A merchant cannot place a heading line in italic or accent a middle line; formatting is stripped by design.
- The overlay arrangement always uses the first child as backdrop, which a merchant must learn from the setting's info text.
- Promote a section-local block to a theme block only when a second section needs it.
- Revisit the heading setting type if Shopify adds dynamic-source support to `textarea`.

## D-023 — Remove the Skeleton text/group blocks and custom section

**Context:** `blocks/text.liquid`, `blocks/group.liquid`, and `sections/custom-section.liquid` came from Skeleton, were referenced by no template, section group, or settings data, and duplicated the new blocks with untokenized styles (pixel padding, `overflow: hidden` on groups).

**Options considered:** keep them as a fallback; restyle them; remove them.

**Decision:** Remove all three after a repository-wide reference check. The `kova-*` blocks and the Editorial composition section replace them.

**Reasoning:** Two parallel block vocabularies would confuse merchants in the block picker and invite untokenized content.

**Tradeoff / reconsideration:** Any theme copy on the store that still uses them would lose those blocks. None of the checked-in templates did. Unused locale keys for them remain in `locales/`.

## D-024 — Model loadouts as metaobjects and let the cart transform own their price

**Context:** Phase 9 introduces loadouts: one carry platform plus modules from named slots, sold together at a tier price. Most of the catalogue should stay ordinary products. The storefront cannot be trusted to price or validate a kit, because line properties are set by the browser.

**Options considered:**
- Hardcode loadouts in theme settings.
- Store slot membership as product metafields on each module.
- Model loadouts and slots as metaobjects, compile them into function configuration, and enforce them in Shopify Functions.
- Price loadouts with a Discount Function, the Cart Transform, or both.

**Decision:**
- Two merchant-owned metaobject types, `loadout` and `loadout_slot`, both with storefront read access, are the only source of rules. One entry, "Relay Grid loadout", covers four platforms and three slots.
- Participation is opt-in: 10 of the 21 KOVA products (four platforms and six slot candidates) take part; every other product, including the native bundle, never does.
- `scripts/sync-rules.mjs` compiles the entries to JSON on the cart transform and the validation, because functions cannot read metaobjects.
- The `loadout-merge` cart transform merges a valid group into one "KOVA Loadout" line with `percentageDecrease` (10% for two modules, 15% for three or more). There is no Discount Function, so price has one owner.
- The `loadout-guard` validation applies the same shared rules (`apps/kova-core/shared/loadout-rules.ts`) and blocks a rejected group, and it blocks the parent product when it is added on its own at $0.

**Reasoning:** Metaobjects give merchants an admin UI for the rules and give the Phase 10 builder a Liquid-readable source. Judging groups in one shared module means the two functions cannot disagree. A single price owner avoids stacking a transform price change with a discount.

**Tradeoff / reconsideration:**
- Every rule edit needs a sync run until an App Home screen replaces the script.
- Two of the same module in one loadout cannot be expressed, because the cart combines identical lines and the rules require one quantity across the group. The Phase 10 builder must offer distinct products per slot.
- Setting a merged line's quantity to 2 doubles each component and the price correctly, but Shopify reports the parent as quantity 1 holding two of each object. Revisit when the builder handles quantity.
- Add a Discount Function only if loadout pricing must combine with other discounts in ways a transform price cannot.

## D-025 — Sell products without photography behind an explicit pending frame

**Context:** The user asked for new products that fit loadouts, with photography to follow. D-013 forbids borrowing another product's imagery, and Shopify's generic placeholder SVG reads as a broken store.

**Options considered:** keep the new products unlisted or as drafts until photographed; publish them with the generic placeholder; publish them with a KOVA-styled "Photography pending" frame.

**Decision:** The five Drop 002 products are active and purchasable. `snippets/media-pending.liquid` replaces the generic placeholder on product cards, product pages, and cart lines: a token-styled frame labelled "Photography pending", with the title on the product page. Cards without an image skip the WebGL reveal.

**Reasoning:** The loadout rules need real, buyable products to be tested end to end, and an explicit pending state keeps D-013's honesty rule: nothing claims to depict an object it does not.

**Tradeoff / reconsideration:** Collections now mix photographed and pending cards, which weakens the grid until photography arrives. Replace the frames product by product as images are added; no code change is needed. Done 2026-09-26: all five Drop 002 products have photography, and no listed product uses the frame. It stays as the fallback for future products.

## D-026 — Keep KOVA Core in the theme repository and run it in development only

**Context:** Functions need a Shopify app. Plus stores can run custom-app Functions, and this store qualifies. The project rule is never to deploy functions without the user.

**Options considered:** a separate app repository; an app in `apps/` beside the theme; a hosted app with a backend.

**Decision:**
- `apps/kova-core/` holds the app. It was created with `shopify app init` (no template UI) and has two TypeScript functions.
- There is no backend, and there is no App Home yet. The template showed that App Home can run without a hosted server, so it stays available for later.
- `apps/**` is excluded from `.shopifyignore` and Theme Check.
- Functions are TypeScript, not Rust: the system Rust toolchain on the development machine has no `wasm32-wasip1` standard library.
- The app runs through `shopify app dev` only. It has not been deployed or released. *(Superseded by D-028: version `kova-core-1.0.0` was deployed and released on 2026-09-24.)*
- Live testing showed that Shopify ignores a `linesMerge` whose parent product is not on the Online Store channel. The "KOVA Loadout" parent is therefore published there only, hidden from search and the sitemap with `seo.hidden`, untagged so no collection lists it, and blocked by the guard when added directly.

**Reasoning:** One repository keeps the rules, the theme that renders them, and the documentation in the same review. A development-only app keeps the enforcement testable without releasing anything.

**Tradeoff / reconsideration:**
- The functions stop running when `shopify app dev` stops. Before Phase 10 ships, the user decides whether to deploy a version.
- The parent product's page is reachable by direct URL. Its $0 price cannot be bought, but the page should get a redirect or template if it becomes a problem.
- Switch to Rust if instruction counts approach the limit. The largest fixture uses about 0.85M of 11M.

## D-027 — Build loadouts in one section that adds a single atomic group

**Context:** Phase 10 needs a storefront surface for the loadouts modelled in D-024. The functions judge line properties the browser sets, so the builder can guide a customer but cannot be trusted to enforce anything. D-024 left two questions open: how to keep each product to one line per loadout, and how the builder presents quantity.

**Options considered:**
- A theme block that merchants compose, or one section used on both a page and the product page.
- Adding lines one at a time, or in one `/cart/add.js` request with `items`.
- A quantity stepper on the builder, or quantity only on the merged cart line.

**Decision:**
- One section, `sections/loadout-builder.liquid`, enabled on page and product templates, with each choice rendered by `snippets/loadout-option.liquid`.
  - On a page it uses the loadout chosen in its settings and starts with a platform step; `?platform=<handle>` preselects one.
  - On a product page it finds the loadout whose platforms include the product and locks the platform to it. For any other product it renders nothing.
- The builder adds the platform and modules in one JSON `/cart/add.js` request. Every line carries a fresh `_kova_loadout` id (`crypto.randomUUID`) and its `_kova_slot`, so the request succeeds or fails as a whole, and two loadouts never share a group.
- Client checks mirror `judgeGroup` in `apps/kova-core/shared/loadout-rules.ts`: platform, required slots, slot maximum, minimum modules and tier. The functions stay authoritative, and the summary labels its price "Estimate only".
- Multi-item slots are checkboxes that disable the unchosen products once the slot is full; single-item slots are radios, with a "No … module" option when optional. A product therefore appears at most once per loadout, which answers D-024's duplicate-module limit.
- The builder always adds quantity 1. A second identical loadout is either a second build (a new group) or the quantity control on the merged cart line, which D-024 verified doubles components and price.
- Without JavaScript the form is hidden and a list of links to each object is shown, saying that the loadout price applies only when built here.
- The loadout teaser gains an optional page setting that links to the builder page.

**Reasoning:** Loadouts depend on metaobject rules, not on a merchant's arrangement of parts, so a block would add editor surface without adding composition. One atomic request avoids a half-added loadout that the guard would then refuse. Mirroring the shared rules lets customers see a problem before the request, without creating a second authority.

**Tradeoff / reconsideration:**
- The client mirror is a second copy of the rules logic in JavaScript. If `judgeGroup` changes, `assets/theme.js` must change with it; the fixtures do not cover the mirror.
- The product page only finds the first loadout that lists the product as a platform. Revisit if a platform belongs to more than one loadout.
- Copy in the section (rules line, hints, fallback) is English-only, like the rest of the theme's section copy.

## D-028 — Deploy and release KOVA Core 1.0.0

**Context:** D-026 ran KOVA Core through `shopify app dev` only, so loadout rules stopped whenever that process stopped. Phase 10 puts a loadout builder on the storefront, which is misleading if the functions are not running. The user asked for the deploy and release on 2026-09-24.

**Options considered:** keep development-only; create a version with `--no-release`; deploy and release.

**Decision:** `shopify app deploy --allow-updates` created and released version `kova-core-1.0.0` of KOVA Core, containing the `loadout-merge` cart transform and the `loadout-guard` validation. There is still no backend and no App Home.

**Reasoning:** The builder only works while the functions run. After the release, `CartTransform/135725315` and `Validation/138477827` still referenced the same function IDs, so no re-activation was needed.

**Tradeoff / reconsideration:**
- Rule edits still need `scripts/sync-rules.mjs`. A code change to either function now needs a new deploy to reach the store.
- `app dev` still overrides the released functions while it runs, so a later dev session can test changes without a release.

## D-029 — Drop hero layers along the pointer path instead of carrying the stack

**Context:** The kinetic hero moved the whole stack after the pointer with per-layer `gsap.quickTo()` followers, and promoted a layer every `threshold` pixels. On the first hover after load, the stack travelled with the pointer as one tight block. After the pointer left and came back, the cards instead fanned out along its path with visible gaps. The user identified the fanned trail as the intended behaviour.

**Cause (measured in headless Chromium, 1440px):** `settle()` tweens x and y with `overwrite: 'auto'`, which permanently kills the followers' x and y. From the second hover on, only `advance()` placed layers, so each promoted card stayed where it was dropped. On the first hover the live followers pulled every card back onto the pointer. Before the fix, the layers spread about 150px on the first hover and 300 to 490px on later ones.

**Options considered:** revive the followers after every leave, which makes the tight block consistent; remove the followers and let `advance()` alone place layers.

**Decision:** Remove the followers. Moving the pointer promotes the next layer every `threshold` pixels and drops it at the pointer, from the first hover on. `settle()` still restores the resting composition on leave. The touch and reduced-motion paths are unchanged.

**Reasoning:** The trail is the behaviour the user asked for, and it already existed after the first leave; the followers only suppressed it. Removing them also drops the 14 follower tweens (x and y for each of seven layers).

**Tradeoff / reconsideration:** Between promotions the top card no longer tracks the pointer, so small movements under the threshold do nothing. Lower the section's pointer threshold if the hero feels unresponsive.

## D-030 — Build the Field Locker on customer account extensions and keep orders native

**Context:** The KOVA Core brief asks for a customer area branded FIELD LOCKER, with orders, loadouts, equipment, documents and saved items. It rules out "a fake customer dashboard if the real account-extension surface can provide the experience". The store uses new customer accounts: the header renders `<shopify-account>`, and the theme has no `customers/*` templates.

**Options considered:**
- Theme pages that rebuild an account area from Liquid's `customer` object.
- A customer account full-page extension in KOVA Core, with a block on Shopify's native order page.

**Decision:**
- `extensions/field-locker` renders on `customer-account.page.render`. It has four sections: Orders, Loadouts, Equipment and Documents.
- **Orders** lists the latest three orders and links to Shopify's own order pages; it does not rebuild them.
- `extensions/field-locker-order` renders on `customer-account.order-status.block.render` and adds the order's loadout and documents to the native page. A full-page target cannot share an extension with other targets, so there are two extensions.
- **Equipment** is every product the customer has ordered, dated by the first order that contained it. The hidden "KOVA Loadout" parent is excluded.
- Manual registration of gear bought elsewhere is **Deferred**. Saved items (a wishlist) are **Deferred**.
- Customer data comes from the Customer Account API with the `customer_read_customers`, `customer_read_orders` and `customer_write_customers` scopes. Product data comes from the Storefront API (`api_access`). The extensions read no name, email, address or phone field.

**Reasoning:** Only the account surface has real customer and order state, and it already carries sign-in, the order pages and their "Buy again" flow. The spike showed that a merged loadout is recorded on the order as its component lines, each with its `_kova_loadout` and `_kova_slot` attributes. So Equipment lists real objects, and purchased loadouts can be regrouped without any extra data.

**Tradeoff / reconsideration:**
- The extensions use Polaris web components and the store's checkout and accounts branding, not the theme's tokens. This is a surface boundary, not a second token source.
- The extension strings are English only. Dates are formatted in the buyer's locale, so a pt-BR browser shows mixed-language text.

## D-031 — Save loadouts to an app-owned customer metafield, handed over by a deep link

**Context:** Saved loadouts must reach the customer from the storefront builder. The theme cannot write customer metafields, and KOVA Core has no backend.

**Options considered:**
- An app proxy (`/apps/kova/locker`) backed by a hosted server.
- Saving only loadouts that were purchased.
- A link from the builder to the Field Locker page that carries the build in its query, where the extension writes the metafield with the Customer Account API.

**Decision:**
- `$app:saved_loadouts` is a JSON customer metafield declared in `shopify.app.toml`, with `customer_account` read/write and admin read. It holds at most 12 entries, newest first. Saving the same objects again moves the entry to the top instead of adding a duplicate.
- The builder shows "Save to Field Locker" when its `field_locker_url` setting is set, customer accounts are enabled, and the build is valid. The link carries `loadout`, `platform` and `modules` as `handle:variant` picks.
- The page shows a confirm banner, then writes with `metafieldsSet` and clears the query. Declaring the definition also needs the Admin `write_customers` scope.
- `apps/kova-core/shared/field-locker.ts` owns the format. The extension decodes strictly: any invalid part rejects the whole link. The theme preselect is lenient: it ignores invalid parts and stops at each slot's maximum, because the cart functions still judge what is added.
- "Rebuild in the loadout builder" links back to `/pages/build-a-loadout` in the same format, so every add still goes through the builder and the functions.

**Reasoning:** The spike showed the query reaches the page through `navigation.currentEntry.url`. The hand-off therefore needs no server, no secret and no token in storefront JavaScript. The customer confirms every save on a page Shopify has authenticated.

**Tradeoff / reconsideration:**
- The page URL is set by hand in the section setting, and it changes between the development preview and the released extension.
- The builder's preselect is a second copy of the format in JavaScript, like the `judgeGroup` mirror (D-027).
- Saved loadouts store handles and variant ids. A renamed handle or a deleted variant is shown by handle and cannot be rebuilt until it is saved again.

## D-032 — Show only the documents KOVA has

**Context:** The brief lists field manuals, care guides, product PDFs and warranty material. The catalogue has `custom.reference_guide` PDFs on 15 Drop 001 products and care text on `material_system` profiles. No warranty content exists anywhere.

**Decision:**
- Documents lists each owned product's reference guide, or "Reference guide pending" when there is none (the five Drop 002 products).
- Care text appears under its material's name.
- Warranty is **Unavailable** and is not rendered.

**Reasoning:** AGENTS.md forbids invented artifacts. A pending line tells the truth, and it resolves without code changes once a guide is attached to the product.

**Tradeoff / reconsideration:** Adding warranty terms needs real terms from the owner and a new metafield or metaobject.

## D-033 — Brand checkout and customer accounts from the theme tokens

**Context:** The Field Locker rendered in Shopify's default light account style. Account extensions cannot load theme CSS, fonts or tokens (D-030), so their look comes only from the store's checkout and accounts branding. On 2026-09-25 the user approved applying KOVA branding to accounts, sign-in and checkout together.

**Decision:**
- `apps/kova-core/scripts/brand-accounts.mjs` writes the published checkout and accounts configuration through `checkoutAndAccountsConfigurationUpdate` (Admin API 2026-07).
- **Colours:** `#080808` background, `#191919` sections, `#f4f3ed` text, a `#343434` border (the opaque stand-in for `--ad-color-border-subtle`), the `#dfff00` accent and primary buttons, and `#ff4f2e` for critical.
- **Type:** Work Sans. Headings and buttons are bold, uppercase and loosely tracked.
- **Shape:** square corners and hairline borders on sections, controls, buttons and thumbnails.
- The same values go to the shared components and to each surface: customer accounts, checkout (including the order summary) and sign-in.
- Before writing, the script saves the current branding to `scripts/.branding-backup-<id>.json`, which is git-ignored because it is store state.
- The store CLI needs `read_` and `write_checkout_and_accounts_configurations` for this, granted by the user. KOVA Core's own scopes are unchanged.

**Reasoning:** Branding is the only supported way to restyle Shopify's account and checkout surfaces. Copying token values keeps one source of truth (`design-system/tokens`), and the script's comments name the token behind each value.

**Tradeoff / reconsideration:**
- The values are a hand copy of the tokens. A token change needs a script re-run.
- The branding API refuses `0` for its global radius tokens, so square corners are set per component.
- "Continue with Shop" keeps Shopify's purple.
- Checkout inherits the dark look. It was not seen, because the password-protected storefront blocks the route to checkout.

## D-034 — Release KOVA Core 1.1.0 and 1.1.1

**Context:** Phase 11 was verified through `shopify app dev`. On 2026-09-25 the user asked for the release and the commit.

**Decision:**
- **Releases:**
  - `shopify app deploy --allow-updates` released `kova-core-1.1.0`, with both extensions and the customer scopes. The store had already granted the scopes.
  - `kova-core-1.1.1` followed with a fix: Storefront `products(query: "handle:…")` is a fuzzy search, so product lookups now keep only exact handle matches and merge records instead of replacing them.
- **The Field Locker page must be added from the checkout and accounts editor's Apps panel** (grid icon → KOVA Core → Field Locker → ⊕). The account menu link and the page switcher do not activate it.
  - Before it was added, the host's `MarketConfiguration.activatedExtensions` did not list `field-locker`, and the page showed "There's a problem loading this page".
  - A menu item made before activation pointed at a stale id (`01a0d688-…`). After activation, the menu and the page use `…/account/pages/01a0d72a-61ed-77b8-88ed-ec877b8e2118`, which is not the TOML `uid`.
- **The order block was placed** through `…/editor/profiles/<id>?page=order-status`.
- **The saved-loadouts definition had to be created by hand.** `$app:saved_loadouts` existed only while `app dev` ran and vanished with `app dev clean`. Neither release created it from `shopify.app.toml`, and the CLI removes `include_config_on_deploy` when it rewrites the file.
  - The definition was created with `metafieldDefinitionCreate` through `shopify app execute`, as KOVA Core (`app--427925766145`, customer account read/write, merchant read), matching the TOML declaration.
- **The builder's `field_locker_url`** points at the activated page.

**Result (production, no `app dev`, a new browser signed in with an emailed code):**
- From the builder, "Save to Field Locker" survives sign-in and shows the banner. Save writes the metafield, the entry survives a reload, and Remove deletes it.
- Documents shows 3 PDFs, 6 care notes and 5 pending guides.
- The order block on #1002 renders, and its "Open your Field Locker" link opens the page.
- There is no overflow at 390px, and no page errors were logged.

**Tradeoff / reconsideration:**
- The metafield definition now exists outside a release. If a later deploy starts managing declarative definitions, check that it adopts this one rather than failing.
- A new store needs the same editor step and the same definition. Neither is automated.

## D-035 — Index facets as choice-validated metafields

**Context:** Phase 13 turns the `all` collection into an Equipment Index faceted by TYPE, SYSTEM, ENVIRONMENT, COLOUR and STATUS. The store's product types are all one-offs, SYSTEM existed only partly as tags, ENVIRONMENT did not exist, and STATUS lived in drop tags.

**Decision:**
- Four product metafield definitions: `custom.index_type` (single text), and `custom.systems`, `custom.environments` and `custom.status` (text lists).
  - Each has a `choices` validation, so merchants pick from a fixed list in the admin.
  - Each is `PUBLIC_READ`, so Liquid and Search & Discovery can read it.
- COLOUR reuses the existing `Color` option, which is already linked to `shopify.color-pattern`, so it gets swatches with no new data.
- The user approved the value for each of the 21 products on 2026-09-25. `apps/kova-core/scripts/seed-index-facets.mjs` writes them and is safe to re-run.
- Tags are unchanged, because the smart collections depend on them.
- The filters are configured by hand in Search & Discovery. Shopify has no API for filter configuration.

**Reasoning:**
- Metafields are native, editable in the admin, typed, and filterable through Search & Discovery without an app.
- Tags would mix navigation data with facet data and give no validation.

**Tradeoff / reconsideration:**
- The filter order and labels live in the Search & Discovery app, outside the repository.
- A new facet value needs the definition's choice list updated first.
- The seed script lives in `apps/kova-core/scripts` only to share its store helper. It is theme data, not app-owned data.

## D-036 — Filtering by progressive section swaps

**Context:** The collection page reloaded on every filter change, had no active-filter chips or live result count, and its filters sat inline above the grid on mobile.

**Decision:**
- `snippets/index-filters.liquid` renders sort, the native filters (swatches when a filter's `presentation` is `swatch`), active chips built from `url_to_remove`, and a result count with `role="status"`.
  - It is shared by the collection, Equipment Index and search pages.
- Without JavaScript the form submits by GET, as before.
- With JavaScript, the `index-filters` element does the following:
  - On change (debounced 250ms), it fetches the same URL with `section_id` and swaps every `[data-filters-swap]` region.
  - It pushes the URL, and a `popstate` handler fetches again, so reload, Back and Forward all land on the same state.
  - It aborts stale requests.
  - It puts focus back on the control that changed. Control ids are built from the parameter name and value, so they survive the swap.
  - It re-initialises motion and WebGL only in the results region.
- Below 48rem, a "Filter / N" button moves the same panel into a native `<dialog>`. Only the panel's contents are swapped, so an open dialog stays open.
- The rows/grid switch on the Equipment Index uses two alternate templates (`collection.index`, `collection.index-grid`). Liquid cannot read the query string, so the switch links are rebuilt from the active filter objects, and a hidden `view` input keeps the view through filtering.

**Tradeoff / reconsideration:**
- Every change is a server round trip, which is the same cost as the previous page reload but without the reload.
- Pagination links still reload the page.
- The mastheads are now separate motion scopes, so a swap does not replay their reveal.

## D-037 — Search command on native predictive search

**Context:** Search was Skeleton's unstyled page, reached through a plain header link that was hidden below 34rem. The theme had no predictive search.

**Decision:**
- **Opening:** the header link opens a native `<dialog>`, and so does the `/` key when focus is not in a field.
  - The link gets `role="button"` and `aria-haspopup="dialog"` from JavaScript.
  - Without JavaScript it stays a link to `/search`.
  - It is now visible at every width.
- **Keyboard and focus:** the input is a combobox (`aria-controls`, `aria-expanded`, `aria-activedescendant`) over a grouped listbox.
  - The arrow keys, Home and End move through the options, Enter opens one, and Escape closes the dialog in one press and returns focus.
  - Each option is a link with `role="option"`, so a pointer click navigates natively.
- **Loading:** `assets/search-command.js` is imported the first time the dialog opens, so no search code runs on page load.
- **Results:** `sections/predictive-search.liquid` is fetched through the Section Rendering API.
  - Suggestions are grouped as Equipment, Field Notes, Collections and Pages, and the list ends with "Search all results".
  - Matching also reads article bodies and tags (`resources[options][fields]` with `tag` and `body` added), so Field Notes match on their text.
- **Announcements:** a polite status announces the number of suggestions.
- **Motion:** the dialog opens with an opacity and clip reveal, and with no animation under reduced motion.
- **Scope:** reference-guide PDFs are files and not searchable natively. The spec's "field manuals" are served by Field Notes articles, and each product result links to its product page, where its guide lives.

**Tradeoff / reconsideration:**
- Matching on body text brings in products whose descriptions mention a term. Only four results show per type.
- `role="option"` on links drops their link semantics inside the combobox, the usual tradeoff for this pattern.

## D-038 — Archive as a status value and badge

**Context:** The user wanted retired objects to stay findable in the index. No product is retired yet.

**Decision:**
- `Archive` is a choice of `custom.status`.
- Wherever the value is present, a shared `.status-badge--archive` label appears on the index row, the product card (taking the badge position ahead of "Sold out") and the product page identity column.
- On an index row, the name and price are muted.
- No product has the value. The user assigns it from the admin.

**Verification:** on 2026-09-25 the value was set temporarily on Nullfold Card Wallet. The row, the grid card and the product page each showed the badge, then the value was removed.

**Tradeoff / reconsideration:**
- Archived products stay purchasable while they have stock. Archive is a label, not an inventory state.

## D-039 — Recommend in the bag from the Works with field

**Context:** Phase 14 adds cart guidance ("Complete the system"). The catalogue already has two relationship sources: the curated `custom.compatible_products` list behind the product page's Works with section (set on 20 of 21 products), and Search & Discovery complementary products (D-014).

**Options considered:** Shopify's `related` recommendations endpoint; the S&D complementary list; `custom.compatible_products`; a new cart-only relationship field.

**Decision:**
- `snippets/cart-upsell.liquid` reads `custom.compatible_products` for every bag line, server-side, in the drawer render. There are no extra requests.
- A merged loadout or a native bundle is read through its components, because the line's own product is the hidden parent.
- It excludes objects already in the bag (components included), sold-out and Archive objects (through `product-status`), and the `kova-loadout` parent. It shows at most two.
- Only when nothing survives does it fall back to the first object's S&D complementary list, under the same filters. There is no algorithmic source and no new field.
- Each row states its reason ("Works with Relay Sling 8") and uses the shared `snippets/quick-add.liquid`:
  - a single-variant product gets Add;
  - a product with one option (for example a finish or light colour) gets a select of the available values, then Add;
  - anything else links to its product page ("Options") instead of pretending it can be configured in the bag.
- The product card renders the same quick-add snippet, without the select.

**Reasoning:** The curated field is the one the product page already presents as compatibility, so the bag and the product page cannot disagree. Most compatible objects are multi-variant, but many have a single option, so the select keeps the add in the bag without guessing a variant.

**Tradeoff / reconsideration:**
- Order follows the bag lines and each product's list order. There is no ranking.
- `related` stays out until the store has order history (D-014).
- Archive objects are never recommended, even with stock. D-038 keeps them purchasable on their own pages.

## D-040 — One resolver owns an object's lifecycle state

**Context:** Archive and Sold out were decided inline in three places (product card, index row, product page). Phase 14 adds Low supply, and more surfaces (predictive search, cart recommendations) need the same answer.

**Decision:**
- `snippets/product-status.liquid` resolves Archive > Sold out > Low supply > Active. It renders a badge, a card overlay, plain text, a screen-reader sentence, or just the key, which a caller can `capture`.
- **Low supply is real inventory only:** a variant tracked by Shopify, with the `deny` policy, holding at most `settings.low_supply_threshold` units (default 5, 0 turns it off). At product level, every available variant must be tracked that way and their combined stock must be within the threshold. It never shows a count.
- The product page resolves per variant. The variant JSON carries each variant's key, so the badge follows the selection.
- Release tags (Drop 001, Drop 002, Limited) are not lifecycle states. They stay as plain text on index rows.
- **Coming is Deferred:** `custom.status` has no such choice, and adding one is a store definition change.

**Reasoning:** One resolver means the index, cards, search, the product page and the bag cannot drift. Scarcity is only claimed where Shopify would actually stop selling.

**Tradeoff / reconsideration:**
- An index row now shows one lifecycle badge (Archive wins over Sold out), matching the card.
- Product-level Low supply is rare in this catalogue (the lowest total is 7 units), so it mostly appears per variant on product pages. Revisit the threshold with real sales data.
- Predictive search shows the state as text only.

## D-041 — Mirror the free-shipping rate in a theme setting

**Context:** The store's US Domestic zone has Standard at $8, and at $0 once the order total reaches $70. CA and International use the Collective carrier and have no free rate. Liquid cannot read shipping rates.

**Options considered:** a hardcoded amount; a shop metafield; a KOVA Core app setting that reads delivery profiles; a theme setting.

**Decision:**
- The Commerce settings hold `free_shipping_threshold` (70, store currency), `free_shipping_countries` (US) and an on/off switch. The setting's help text says it must match the rate condition.
- `snippets/field-supply.liquid` compares `cart.total_price`, which already includes discounts and the loadout transform, with the threshold. The theme never sums lines.
- It renders nothing for an empty bag, a country outside the list, or a cart in another currency.
- The sentence carries the information ("Add $22.00 to unlock complimentary standard shipping"); the bar is decorative. The drawer announces the crossing once, not every update.
- It appears in the drawer footer and on the cart page.

**Reasoning:** A theme setting is merchant-editable today with no app surface. Reading delivery profiles through KOVA Core would remove the duplication, but it needs an app proxy or a synced shop metafield. That is **Planned**, not built.

**Tradeoff / reconsideration:**
- The setting can drift from the admin rate. Changing the rate means changing the setting.
- **Markets:** the store has one US market and one currency. A Markets-aware threshold is **Deferred**.
- The rate condition is on Shopify's order total. The transform price is already in `cart.total_price`, so a discounted loadout should be measured the same way. This has not been checked at checkout.

## D-042 — Mirror the purchase form in a dock instead of duplicating it

**Context:** Product pages continue into long storytelling sections, so the form leaves the viewport. A second form would be a second source of variant truth.

**Decision:**
- The dock (`#PurchaseDock-<section>`) holds the title, the selected variant, price and compare-at price, and an Add to bag button with `form="ProductForm-<section>"`. The button submits the one real form through the normal submit handler.
- `ProductPurchase.render()` is the single writer. It updates every price, compare-at, variant label, button and variant status in the form column and the dock. This also fixed three bugs: the compare-at price never updated, a finished add re-enabled a sold-out button, and an unavailable combination kept stale state.
- The dock appears only once the whole form is above the viewport, and hides over the footer. Two IntersectionObserver targets, no scroll handler.
- It never moves focus. Status still goes to the form's own live region.
- When a Loadout Builder renders on the page, the dock shows a "Build a loadout" link to it. The button stays Add to bag; there is no separate loadout action.
- Motion is transform and opacity only, and none under reduced motion. Without JavaScript the dock stays hidden and the form is the only path.
- The dock sits outside the sticky purchase column. `position: sticky` creates a stacking context, and inside it the later sections painted over the dock.

**Tradeoff / reconsideration:**
- On mobile the dock covers the bottom of the viewport while visible. It publishes its height as `--ad-dock-offset` for other fixed UI.
- The dock has no quantity control. It adds the quantity set in the form.

## D-043 — Keep recently viewed as handles in the browser

**Context:** Visitors move between many product pages. Returning to an object should not need an account.

**Decision:**
- `assets/recent-signals.js` is loaded only by `sections/recent-signals.liquid`, which sits after the recommendations on the product template.
- The browser stores at most 8 product handles in `localStorage` (`kova:recent-signals`), most recent first. Nothing else is stored.
- A product is recorded after 3 seconds on a visible page, not on a passing visit. The current product is never shown.
- Each card is rendered by Shopify through `/products/<handle>?section_id=recent-signal-card`, using the normal product card, so price, status and quick add match everywhere. Up to four requests run in parallel.
- A removed product answers 200 with an empty product, so the card section marks it explicitly and the handle is pruned. Malformed entries are dropped on the next write.
- Without JavaScript, storage or history, the section stays hidden.

**Tradeoff / reconsideration:** one request per card. A single search query could replace them, but it was not confirmed that storefront search can match an exact list of handles, so it was not used. The history is per browser and is not synced to customer accounts (**Deferred**).

## D-044 — Build the menu on Shopify's nested menu with disclosures

**Context:** The header nav was flat (three top-level links) and no menu was assigned. The catalogue needs a way into five categories, the drop, the index, loadouts and Field Notes.

**Options considered:** hardcoded panels in the section; a menu built from section blocks; the store's nested menu with an ARIA `menu` widget; the nested menu with plain disclosures.

**Decision:**
- The nested Shopify menu (`main-menu`, up to three levels) is the only source of links. The section adds only an optional Menu feature block per panel, placed by position.
- Top-level items stay real links; items with children get a separate disclosure button and a full-width panel. The mobile dialog uses native `<details>`.
- Links, lists and buttons only; no `role="menu"`, because these are site links, not application commands.
- A `#` top-level URL is treated as a label.
- No links to index facet URLs until the Phase 13 facet check is done, and no Archive link while no product is archived.

**Reasoning:** Merchants edit navigation where Shopify expects it. The panels are optional enhancement, so the header still works without JavaScript and with any menu shape.

**Tradeoff / reconsideration:** The header can't read menus through the API with the current store auth, so the menu is a manual store step. Only three top-level items fit the desktop bar. Hover opens are mouse-only and delayed, which is slower for mouse users than an instant open.

## D-045 — Show one announcement, never a ticker

**Context:** Drop news and the shipping incentive need a surface above the header. Rotating bars and marquees move without being asked and fail WCAG 2.2.2 unless they can be paused.

**Decision:**
- `sections/announcement-bar.liquid` shows the first enabled message only. Merchants reorder blocks to change it.
- The Shipping type writes its own sentence from the Field Supply threshold and uses the same eligibility snippet as the bag (`snippets/free-shipping-eligible.liquid`), so the bar and the bag cannot disagree.
- The bar stays in the page flow. The fixed header is translated down by the visible part of the bar, a transform driven by the existing scroll state and a ResizeObserver.

**Reasoning:** One message at a time has no motion to pause and says one thing clearly. Deriving the amount avoids a second copy of the threshold.

**Tradeoff / reconsideration:** Only one message is visible, so merchants choose. In the Theme Editor, a message that isn't first can't be previewed without reordering.

## D-046 — Newsletter signup as a quiet tab, confirmed only by Shopify

**Context:** Newsletter capture lived only in the footer. Popups that open on a timer interrupt the storefront and trap focus.

**Decision:**
- A vertical tab on the viewport's left edge opens a non-modal panel. It never opens by itself, hides while any dialog is open, and sits above the purchase dock.
- **Revised with the user (2026-09-25):** the first version was a small pill in the bottom-left corner, which was easy to miss. The user asked for a tab rotated against the left edge that gives the impression a new message just arrived, noticeable without being distracting. It is now an acid, square, vertical tab. On the first page of a visit it slides in and its indicator pings three times, then stays lit until opened. The motion never loops and is removed under reduced motion.
- **Phones (also with the user):** the 44px tab covered too much content at 390px. Below 48rem it is a 24px notch (the WCAG 2.2 target minimum), and the form opens as a full-width bottom sheet above the dock, which gives the email field room while the keyboard is up. Moving the signup into the mobile menu was rejected because it loses the arrival. A bottom bar was rejected because the dock owns that edge.
- It posts the same `customer` form as the footer (tags `newsletter,signal-tab`) with fetch. Success is only Shopify's `customer_posted=true` redirect. An error list returned for this form is shown. A bot challenge, a non-OK answer or anything unreadable falls back to a native post, so a person can pass the challenge.
- Dismissal hides it for 30 days and a signup hides it for good, in `localStorage`. Failing storage shows it.
- The footer form stays the no-JavaScript path. The tab is hidden without JavaScript.
- The script is a module loaded by the section, like Recent signals, rather than imported on first open. It holds the disclosure logic as well as the submit, so it has to run on load.

**Tradeoff / reconsideration:** Shopify challenged headless Chromium on 2026-09-25 (HTTP 403 "Verifying your connection"), so the fetch path's success was not observed. How Shopify answers a duplicate email is still unknown. Real visitors who get challenged see Shopify's challenge page after the fallback.

## D-047 — Loadout incentives stay with the cart transform

**Context:** Loadout discounts (10% for two modules, 15% for three or more) are enforced by the KOVA Core `loadout-merge` cart transform, with tiers from the `loadout` metaobject (D-024). Prompts like "add one more for 15%" would need the theme to know the tiers.

**Decision:**
- The theme shows only what the cart reports: the merged line's "Loadout pricing −N%" (`data-loadout-percent`), computed from the line's price before discount allocations and its components' prices.
- The theme doesn't calculate or promise loadout prices. There are no "add one more" prompts and no client-side tier table.
- New tiers (three, four or full-system) need a metaobject field change, `sync-rules.mjs` and a function rebuild. "Add one more component" prompts are **Deferred** until then.

**Reasoning:** One price owner. A theme-side tier table would drift from the function and could show prices the checkout won't honour.

**Tradeoff / reconsideration:** The incentive is only visible after a loadout is in the bag. **Not verified:** the transform didn't merge loadout groups on 2026-09-25, so the line hasn't rendered live.

## D-048 — Campaign photography from the field record, uploaded to Shopify Files

**Context:** D-018 left five homepage image slots in their pending state until approved campaign imagery existed: three release-record frames and both signal frames. The user supplied a 12-shot campaign set (`BRAND/ASSETS/kova-afterdark-field-record/`) and four shots each for seven products (`BRAND/ASSETS/products/<handle>/`). `BRAND/` is gitignored.

**Options considered:** check the PNGs into `assets/` and reference them with `asset_url`; upload them to Shopify Files and reference them from image settings.

**Decision:**
- Upload to Shopify Files with unique, prefixed filenames (`kova-field-record-NN-*`, `<handle>-NN-*`) and written alt text, then reference them as `shopify://shop_images/…`. They stay merchant-editable, get Shopify's responsive CDN transforms, and keep 2–3 MB PNGs out of the theme (and out of `assets/`, where untracked images have broken `theme dev`).
- Homepage: release-record frames use 4:5 portrait shots (Transit: overhead crew; Weather: portrait through a fence; Carry: backpack buckle detail). The campaign frame uses the architectural formation (shell, pack and cargo pant visible on one figure) with the collective as its phone crop. The field test uses the movement shot, with the hooded technical portrait as its phone crop.
- Annotation coordinates were re-placed on the garments for the new images, because signal-frame annotations are fixed percentages over a `cover` crop.
- Products: the 02–04 lifestyle and detail shots are appended to the seven matching products. Existing media and featured images are unchanged, because the new 01 stills are near-identical to the current ones.
- Collections (drop-001, outerwear, apparel, carry-systems, worn-accessories, field-objects, limited-editions) get images from the same set. Field Notes article images were tried and removed at the user's request: the journal reads better as a text-only index.
- On desktop, each annotation sits on a translucent dark plate (`background-primary` at 72% with a 6px backdrop blur), and the note text rises from 72% to 86% opacity. Real photography put the text over bright concrete and sky, where it wasn't legible.

**Reasoning:** Each image is used once on the homepage, and no frame repeats the product card in the section next to it. Store-hosted files keep the theme light and editable.

**Tradeoff / reconsideration:** The landscape originals are 1536 px wide, so the full-bleed frames upscale on screens wider than that. Replace them if higher-resolution exports exist. The field test's Hood marker sits on a lowered hood; a shot with the hood up in landscape would fit that annotation better. **Not verified:** the parallax state with motion enabled, and the crops in the Theme Editor.

## D-049 — Recent signals as a compact strip

**Context:** On the product page, Related equipment and Recent signals sat back to back with the same display heading and the same four-column editorial card grid. The user saw them as two near-identical sections and asked for Recent signals to be smaller.

**Decision:** Recent signals keeps its data contract (D-043) but renders as a history strip. It has a hairline top rule, a small label-sized heading beside the list, and rows of 4rem thumbnail, title and price that link to the product. The quick-add action and editorial card are dropped there. Its thumbnails hide the "Photography pending" label, which doesn't fit at 4rem; the frame corners remain.

**Reasoning:** Related equipment is a buying surface. Recent signals is navigation back to something already seen, so it doesn't need the full card or a second add path. The different scale and layout make the two sections read as distinct.

**Tradeoff / reconsideration:** Recently viewed products can no longer be added from the strip, and status only shows when it isn't Active. Restore quick add if data shows people use it from this strip.

## D-050 — Homepage layout fixes and a shared link row

**Context:** The user reviewed the homepage with real photography and flagged three issues. The loadout teaser left a large empty area above its copy. In the feature grid the lead card and the stacked cards didn't end on the same line. The full-width "Shop …" rows had no hover response.

**Decision:**
- **Loadout teaser:** the columns are centred instead of bottom-aligned, and on desktop the image is capped at the viewport height minus the header and some padding. Phones keep the 4:5 frame.
- **Feature grid:** the lead card spans as many rows as there are stacked cards (`:has()` on the card count) instead of always three. With three products it had spanned an empty third row.
- **Link row (new Primitive):** the three sections used identical "Shop …" row CSS, so it becomes `.link-row` in `assets/theme.css`. On hover or `:focus-visible` the label steps in, the arrow lifts toward its heading and takes the section accent, and a 3px accent rule scales in from the left. It uses transform only, with base-duration tokens. Inverse tones use the text colour because the acid accent disappears on the light background. Reduced motion removes the movement but keeps the colour and the rule.

**Reasoning:** One primitive replaces three copies, so the interaction stays consistent. Keyboard focus gets the same feedback as hover.

**Tradeoff / reconsideration:** Browsers without `:has()` fall back to the three-row span. The capped loadout image crops wider on short screens.

## D-051 — Labelled sample reviews until real reviews exist

**Context:** The review section only reads Shopify's standard `reviews` metafields and review-app blocks, and no review app is installed. Every product showed "No field reports yet". The user asked for placeholder reviews on the main products.

**Decision:** Add a **Sample review** block to `sections/product-reviews.liquid` with optional product targeting, a 1–5 rating, title, text and byline. Sixteen samples cover eight main products. Bylines use a role instead of a person's name.
- **Revised with the user (2026-09-26):** the first version showed a visible "Sample field reports" notice and "/ Sample" bylines. KOVA is a portfolio piece whose visitors know the store is fictional, and the user wants it to read like a live store, so the notice was removed. The block keeps its "Sample review" name in the Theme Editor.
- Samples still never feed the rating summary, the `reviews` metafields or structured data, so search engines don't index them as ratings. They disappear once a product has real ratings or a review-app block is added.

**Tradeoff / reconsideration:** Unlabelled reviews are only acceptable while the store stays a portfolio piece. Before the store takes real orders, delete the blocks or restore the notice.

## D-052 — Collection views, edition sizes, PDP order and panel entrances

**Context:** A second review pass by the user.

**Decision:**
- **Current Transmission** uses the aligned layout, so the three cards are top-aligned.
- **Loadout teaser:** the image stretches to the row and the copy panel carries vertical padding, so the image runs slightly taller than the centred copy. This replaces D-050's viewport cap. Phones keep a 4:5 image.
- **Index view for every collection:** the default collection page gets an Index / Grid switch linking to `?view=index`. The Equipment Index section keeps its authored heading only on collections assigned an index template; other collections keep their own title, and their Grid link returns to the default template. The query builder moved to `snippets/index-query.liquid` and the switch to `.index-views` in `theme.css`.
- **Edition size:** product cards show a "Limited run / N units" tag on the image (with a visually hidden sentence in the card text), and Index rows show it under status. The number comes from `edition_profile.edition_quantity`, so only products with a real edition size show it.
- **PDP order:** main, field manual, edition record, loadout builder (now dark), FAQ, works with, reviews, related equipment, recent signals.
- **Entrance animations:** the menu panel slides in from its edge, and its links rise in sequence; the bag drawer slides in from the right. Backdrops fade. Bag items aren't staggered, because the drawer re-renders them on every cart change. There's no motion under reduced motion.

**Tradeoff / reconsideration:** The edition record, loadout builder and FAQ now run as three dark sections in a row. The Search & Discovery metafield filters still don't reach the storefront (see Phase 13 backlog); the theme renders every filter Shopify returns, so the fix is in the app's filter configuration.

## D-053 — Legal pages as native Shopify policies in a theme frame

**Context:** The user asked for legal pages. Only Shopify's generated privacy policy existed, and it rendered unstyled, with its title hidden under the fixed header. Nothing in the footer linked to it.

**Options considered:** write the policies as Online Store pages with a custom template, or use Shopify's store policies (Settings → Policies) and style them.

**Decision:**
- Use Shopify's store policies: refund, shipping, terms of service and contact information, next to the existing privacy policy. Checkout, order emails and the FAQ's policy question already link to these objects, so there's one source for each document.
- Policies have no theme template, so `layout/theme.liquid` wraps `content_for_layout` in `snippets/legal-page.liquid` when `request.page_type == 'policy'`. The frame adds a "KOVA / Legal" masthead, a numbered index of every published policy (`shop.policies`, current page marked with `aria-current`), and document typography for Shopify's `.shopify-policy__*` markup.
- The footer lists every published policy next to the copyright line.
- The texts match the store's configuration: USD, US-only shipping, free standard shipping from $70 (the Field Supply threshold), numbered limited runs that aren't restocked, and loadout pricing.

**Tradeoff / reconsideration:** KOVA is a portfolio store, so the business details are illustrative. The governing law (New York) and the shipping rates ($8 standard, $22 express, $14 for non-contiguous US) were chosen for the demo. Match the rates to Settings → Shipping and delivery, and have the texts reviewed before the store takes real orders.

## D-054 — SIGNAL in the corner, a menu-style bag entrance, quieter filter scrolling

**Context:** A third review pass by the user.

**Decision:**
- **SIGNAL tab (revises D-046):** it's now a horizontal tab flush with the viewport's bottom-left corner (bottom 0, left 0), with its panel opening above it. The first-visit arrival rises from the bottom edge. Phones get a 24px-high "Msg" strip in the same corner and keep the bottom sheet. The vertical edge tab had started to read as clutter over the filter column and page content.
- **Bag entrance (revises D-052):** it now mirrors the menu. The panel slides in, then the header, cart lines and footer rise in sequence. The stagger only runs while `data-entering` is set; `CartDrawer.open()` sets it and clears it after one second, so lines re-rendered after a cart change don't replay it. The dialog clips its overflow, which removes the horizontal scrollbar the slide-in used to cause.
- **Filter column:** the sticky filter column's scrollbar is thin and transparent until the pointer or focus is inside it.
- **Phone filter bar:** the Filter button is vertically centred with the object count and has a sliders icon.
- **Announcement bar:** the header offset now uses the bar's fractional height. `offsetHeight` rounded 59.3px down to 59px on phones, so the header covered the bar's bottom border.

**Tradeoff / reconsideration:** A thin transparent scrollbar still reserves its gutter, so hiding it doesn't shift the layout. The corner tab can overlap the first filter rows on short screens until the user scrolls.

## D-055 — The footer wordmark spans the content column

**Context:** The footer wordmark was sized in viewport units, capped at 25rem, so it covered only 50–70% of the column. On phones the user asked for it to take the full width. **Revised (2026-09-26):** only on phones; desktop keeps the original viewport-based size.

**Decision:** A new `fit-text` custom element (Primitive, `assets/theme.js`) wraps the wordmark. Its `media` attribute limits the fitting to a media query, here `(max-width: 47.99rem)`, and it clears its inline size when the query stops matching. It sets its parent's font size so the text matches the parent's content width. It refits on width changes and on every web-font load, because `document.fonts.ready` can resolve before the display face is requested. The CSS size stays as the no-JavaScript fallback. Trailing padding of 0.085em restores the last letter's advance, which the negative tracking removes. The existing crop (line-height 0.62 with overflow hidden) is unchanged.

**Evidence:** In headless Chromium, the text matches the column width at 390px (358/358). At 1440 and 1920px the original CSS size applies (331.2px and 400px). Resizing across the breakpoint switches in both directions.

**Tradeoff / reconsideration:** There's a one-frame size change once the font loads. Use `fit-text` only for single-line display text.


## D-056 — Branded Entry Sequence / Signal Acquisition

**Context:** Internal navigation had a developed motion language (the corrupted-signal page transition, D-017), but a first visit landed straight on the storefront with no branded equivalent. The builder handoff asked for a short "signal acquisition" entry that reveals the real homepage hero instead of adding a separate loading screen.

**Decision:**
- **Architecture (Motion behavior):** `snippets/entry-signal.liquid` renders an inline boot in `<head>` and a `hidden`, `aria-hidden` overlay as the first child of `<body>`, above the header group. It sits in the layout rather than the hero section because the section's `isolation: isolate` would keep a fixed layer below the header. The boot decides whether the sequence plays, sets `html[data-entry]` before first paint, and owns `finish()` plus a failsafe that fires 4.5s after the first frame. `assets/entry-signal.js` (deferred) runs the state machine, and `assets/entry-signal.css` (inlined, so it doesn't add a render-blocking request) holds every visual, keyed to that attribute.
- **States:** `acquiring → locked → revealing → complete`. A readiness timeout, a skip or reduced motion goes through `exit`, a short fade. A hidden tab, `pagehide` or an error finishes at once. Every path ends in the boot's `finish()`, which removes the attribute and announces `afterdark:entry` with state `complete`. The controller stops on that event, so a failsafe that fires first can't be followed by a late `locked` that brings the veil back.
- **The loader is a veil over the hero, not a replacement:** the hero renders normally underneath. Fragments are transparent bands in the veil that show the real hero, with its media displaced behind them. At lock the title swaps to SIGNAL LOCKED with one RGB split, the status turns to the accent, and the line fills. It holds for 600ms. The reveal then tears the veil away in stepped bands, with an accent sweep, while the real hero media resolves through the page transition's RGB filter. No second copy of any image is loaded.
- **Hero contract:** `sections/kinetic-hero.liquid` marks its stage `data-entry-media` (the layer the entry corrupts) and the `fetchpriority="high"` layer `data-entry-anchor` (the image it waits for), so the entry code never targets `.kinetic-hero__*` classes.
- **Readiness:** the sequence locks once the anchor image is loaded and `decode()`d and `document.fonts.ready` has resolved, but no sooner than 1.2s after the first frame, so the resolved title and metadata can be read. A failed image counts as ready. It never waits for `window.load`, below-the-fold media or third-party scripts. After 3s it fades out regardless.
- **Session and scope:** `sessionStorage['kova:entry-seen']` is written on the first page of any template, but the sequence only plays on the homepage. That is this entry's answer to the handoff's "evaluate": the reveal needs the kinetic hero, and a PDP deep link followed by a click home doesn't replay it. It also doesn't play on reloads, back/forward loads, URLs with a hash, tabs opened in the background, the Theme Editor (Liquid `request.design_mode`), or when session storage can't be written, so it can never replay on every visit.
- **Skip:** pointerdown, keydown, wheel or touchstart while acquiring fades straight to the hero. The overlay takes the click, so a link underneath isn't activated blind. There's no visible skip button. Focus is never moved or trapped, and the skip link (z-index 1000) stays above the overlay (900).
- **Reduced motion:** a quiet "KOVA / Drop 001 · Afterdark supply" card, with no scanning, fragments or filters, held about 0.9s and then given the same fast fade. It stays shorter than the full sequence.
- **Signal filters:** the SVG filters moved from `page-transition.liquid` to `snippets/signal-filters.liquid`, which is rendered once near the top of `<body>` whenever the page transition or the entry can run. Duplicate IDs are impossible, and no `filter: url()` points at a missing filter. The entry uses only `#kova-corrupt-c`. The band-tear filters (-a, -b) over the full-viewport hero stage produced 250–475ms long animation frames during the reveal in headless Chromium, and they disappeared without them. The veil's stepped bands carry the tear instead.
- **SIGNAL tab:** its first-visit arrival (D-054) is paused while `html[data-entry]` is set, so it rises after the entry instead of under the veil.
- **Hero intro finding:** the kinetic hero has never been a `[data-motion-scope]`, so motion-core's `data-reveal="hero"` timeline doesn't run on the homepage. The tear is effectively the hero's intro, so there are no competing timelines. If the hero later gets an intro, it must wait for an `afterdark:entry` state other than `acquiring` or `locked`, or it will play unseen under the veil.
- **Settings (Motion group):** "Signal Acquisition entry" (on by default), "Entry channel and drop number" (`001`) and "Entry source" (`Afterdark`). Timing stays in code and in the duration tokens: the lock's glitch and every fade are `--ad-duration-fast`, and the reveal is `--ad-duration-base`. The 1.2s minimum and 600ms lock hold are named constants in `assets/entry-signal.js`.

**Evidence (headless Chromium 151 against `shopify theme dev`, 2026-09-26):**
- **LCP** stays on the hero image in every run. Medians over 5–7 runs: 864ms before the change, then 768ms with the entry suppressed and 792ms with it playing at 1440×900. At 390×844 they were 716ms before, then 612ms suppressed and 684ms playing. Separate runs of the same page differ by 50–100ms on the dev proxy, and the direction flips between runs. The veil covers the hero without hiding it, and Chromium's LCP doesn't account for occlusion.
- **CLS** was the same with the entry playing or suppressed: 0.013 at most on desktop (from the existing page) and 0.0006 or less on mobile.
- **Duration**, from the first frame to the finished hero (sampled per animation frame, so it includes one frame before paint): 719–749ms on a warm HTTP cache and about 835ms on a cold context through the dev proxy. The acquiring state lasts 210–245ms on a warm cache. Reduced motion took about 480ms. A first version (300ms minimum, 420ms reveal) took 0.91–0.92s warm; it was cut to meet the handoff's 400–700ms cached target.
- **Revised with the user (2026-09-27):** at about 0.7s the user was "barely able to read anything", so readability now wins over the handoff's cached-load target. The chrome resolves over the first 1s, the lock holds 600ms, and the reveal takes 420ms. Measured from first frame to hero on a warm cache: 2.23–2.28s. Images delayed 2.8s: done about 3.7s after the first frame, under the 4.5s failsafe. Reduced motion: about 1.1s. A click, key, wheel or touch still skips straight to the hero while acquiring.
- **Failure paths:** hero images aborted gave a normal sequence (error counts as ready). Images delayed 6s faded out at the 3s cap. With the controller blocked, the boot released at `DOMContentLoaded` (about 0.8s). With the boot's failsafe forced to fire at 1s while images were delayed 2s, the page went from `acquiring` straight to released and never returned to a later state. With JavaScript disabled there was no overlay and the hero was visible. A reload, a hash URL, a PDP deep link followed by a click home, and back navigation all ran no sequence. A click during acquiring skipped it without following the CTA underneath. A Tab press during acquiring skipped it and focused the skip link. Reduced motion gave the card, then the fade. During acquiring, the SIGNAL tab's `signal-tab-arrive` animation reported `paused`; afterwards it reported `running`. Every run ended with the overlay gone, the heading visible and the flag set. The page transition still fires from home to a PDP and back.
- **Firefox 154** (headless, driven over WebDriver BiDi): the full sequence ran `acquiring → locked → revealing → released` in about 0.8s with no page errors, and the flag was set. A screenshot shows the acquiring state, fragment bands and RGB filter included, rendering as in Chromium. Reduced motion couldn't be emulated through that driver.

**Not verified:** Safari (unavailable here), reduced motion in Firefox, a real GPU, a screen reader pass, high zoom, the actual Theme Editor UI (the bypass relies on `request.design_mode`), and a production Lighthouse or field Core Web Vitals.

**Tradeoff / reconsideration:** Perceived first content is held back by about a second on one page view per session, even though the browser's paint metrics aren't. If field data shows first-visit bounces rising, turn off the setting. Headless Chromium uses software rendering, so the filter cost above may be lower on real GPUs; that's a reason to re-test before restoring the band-tear filters, not evidence that they are safe. A future transmission (T002 / RAIN SYSTEM and so on) should only need new copy and CSS keyed to the same states; the controller and hero contract stay as they are.

## D-057 — The product gallery shows an odd number of images

**Context:** The product gallery spans the first image across both columns and pairs the rest. With the four-image photography sets (a still plus three lifestyle or detail shots), the last image sat alone on its row with an empty cell beside it. Meanwhile the field manual figure repeated the gallery's second image.

**Decision (Template / art direction):** `sections/product.liquid` renders `product.media` with a limit that drops an even set's last image, so the gallery always shows an odd count (1, 3, 5 …) and every row is full. `sections/product-field-manual.liquid` shows that left-over image as its figure, numbered by its position in the set (Fig. 04 of four). Odd sets keep the previous rule (second image, or a cropped detail for a single image). The dropped image is still product media: cards, variant media and search use it as before. Merchants control which image moves by the media order in the admin.

**Evidence (headless Chromium against `shopify theme dev`, 2026-09-27):** Sector Sleeve (4 images) rendered 3 in the gallery and image 04 as Fig. 04; a 6-image product rendered 5 and Fig. 06; the 3-image bundle and a 1-image product were unchanged.

**Tradeoff / reconsideration:** An even set's last image is no longer in the gallery. Put the image that works best as a large editorial figure (a detail shot) last. A product with only two images shows one in the gallery.

## D-058 — Deferred by design

**Context:** Several backlog items were marked **Deferred** across phases (hardware generations, Markets-aware labels and thresholds, more loadout tiers, tier prompts, the Coming state, synced recently viewed, equipment registration, a wishlist, translated extension strings, and the delivery-profile shipping threshold). Listed one by one, they read like unfinished work.

**Decision:** Treat them as deliberately out of scope and list them together in the case study's "Deferred by design" section, each with the reason it waits and the signal that would bring it back. None of them unlocks a core flow: navigation, discovery, product pages, loadouts, the bag and checkout all work without them.

**Reasoning:** Each would add a small improvement for a large cost. Most need new data models, app work, cross-device state or Markets configuration, and each would need its own verification pass. That time is better spent on verifying what exists (Safari, the Theme Editor, checkout rendering, production performance).

**Tradeoff / reconsideration:** Revisit an item when its trigger appears, for example a second market, a real V2 product or order data about loadout sizes, rather than on a schedule.

