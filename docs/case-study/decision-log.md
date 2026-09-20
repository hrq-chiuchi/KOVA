# Decision log

All entries were accepted in Phase 0 (2026-09-20). Phase 1 source realizes D-001 through D-006 and passed the recorded Shopify Theme Check, JavaScript syntax checks, static desktop/mobile browser fixtures, and synthetic section lifecycle events. The actual Shopify Theme Editor UI and live catalogue/media remain pending. D-007 remains an originality constraint. D-008 remains **Unavailable** because Figma/Codex tooling is not mounted.

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
