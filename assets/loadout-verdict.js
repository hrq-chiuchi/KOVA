// The Loadout Builder's copy of the loadout rules. The KOVA Core functions decide with `judgeGroup` in
// apps/kova-core/shared/loadout-rules.ts; this file must reach the same verdict and percent for every
// build, which apps/kova-core/extensions/loadout-merge/tests/theme-parity.test.js checks exhaustively.
// It stays DOM-free so that test can run it as-is. The builder only ever sends quantity 1, so the
// shared-quantity rule has no counterpart here.
(function (root) {
  // `loadout` is one entry of the compiled rules; `modules` are `{ slot, productId }` claims.
  // Returns `{ problem, percent }`; problems come in the order the builder reports them.
  function judge(loadout, platformId, modules) {
    if (!loadout || !platformId) return { problem: { code: 'platform' }, percent: 0 };
    if (!(loadout.platforms || []).includes(platformId)) return { problem: { code: 'platform' }, percent: 0 };

    const slots = loadout.slots || [];
    const counts = new Map();
    for (const module of modules) {
      const slot = slots.find((candidate) => candidate.key === module.slot);
      if (!slot || !slot.products.includes(module.productId)) return { problem: { code: 'slot', slot: module.slot }, percent: 0 };
      const count = (counts.get(slot.key) || 0) + 1;
      if (count > slot.max) return { problem: { code: 'max', slot: slot.key }, percent: 0 };
      counts.set(slot.key, count);
    }

    const missing = slots.find((slot) => slot.required && !counts.has(slot.key));
    if (missing) return { problem: { code: 'required', slot: missing.key }, percent: 0 };

    const minimum = Number(loadout.minModules) || 0;
    if (modules.length < minimum) return { problem: { code: 'minimum', missing: minimum - modules.length, minimum }, percent: 0 };

    const percent = (loadout.tiers || [])
      .filter((tier) => modules.length >= tier.modules)
      .reduce((best, tier) => Math.max(best, tier.percent), 0);
    return { problem: null, percent };
  }

  root.KovaLoadoutVerdict = { judge };
})(typeof window === 'undefined' ? globalThis : window);
