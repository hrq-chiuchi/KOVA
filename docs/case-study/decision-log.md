# Decision log

D-001 through D-008 were accepted in Phase 0 (2026-09-20). Phase 1 source realizes D-001 through D-006 and passed the recorded Shopify Theme Check, JavaScript syntax checks, static desktop/mobile browser fixtures, and synthetic section lifecycle events. D-007 remains an originality constraint. D-008 remains **Unavailable** because Figma/Codex tooling is not mounted. D-009 and D-010 were accepted in Phase 2 (2026-09-21). D-011 through D-014 were accepted and realized in the Phase 3 catalogue build (2026-09-21) and are verified against the live store; D-010 is superseded (2026-09-23): all three homepage category grids now read real Drop 001 collections. D-015 was accepted in Phase 4 and D-016 in Phase 5 (2026-09-23); D-017 in Phase 6 (2026-09-24); D-018 to D-021 in Phase 7; D-022 and D-023 in Phase 8 (2026-09-24).

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


## D-018 — Restructure the homepage as a brand world, built mostly from existing systems

**Context:** The homepage ran hero → three near-identical product grids → footer. It looked finished but read as a catalogue. An external scope proposal suggested twelve beats alternating commerce, atmosphere, story and evidence, built on four brand systems: Drops, Loadouts, Field Manuals and Field Notes. Taken literally it would add twelve bespoke sections, two of which repeat the same facts, and it contained invented data (a release date equal to the day it was written, a "Black / Graphite / Signal" colour system).

**Options considered:** build all twelve beats as proposed; add only visual interludes; consolidate the beats onto existing patterns and derive every fact from the store.

**Decision:** Consolidate. The "Drop Transmission" and "Drop Record" beats become one release-record section. The campaign interlude and field test share one annotated full-bleed section. Night Uniform and Hard Goods become two new layouts of the existing editorial grid rather than new sections. The end transmission is footer copy. That leaves five new sections. Every fact is derived from the store: product count, stock, colourways, combined variant weight, bundle price, and field-test copy from `custom.feature_list` and specifications. Atmosphere lines are editorial text in a clearly labelled setting. Image-led sections without campaign photography render a CSS-only pending state, following D-010.

**Reasoning:** Each fact keeps one home (the D-016 rule). Reusing the grid and the frame keeps the system small while the page rhythm changes. Deriving data means the page cannot drift from the catalogue.

**Tradeoff / reconsideration:** The pending frames make the page visibly unfinished until photography exists. Shopify's placeholder illustrations were tried first and dropped: five of them inlined 320 KB of SVG into a 437 KB document and delayed the hero LCP. Replace pending frames as soon as approved campaign imagery exists. Promote the signal frame's annotation model only if a third use appears.

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

**Tradeoff / reconsideration:** Collections now mix photographed and pending cards, which weakens the grid until photography arrives. Replace the frames product by product as images are added; no code change is needed.

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
