/*
 * Signal Acquisition entry (Motion behavior, D-056): the state machine behind the first-entry overlay.
 * The inline boot in snippets/entry-signal.liquid decides whether the sequence plays, sets
 * html[data-entry] before first paint, and owns finish() and the hard failsafe. This file only
 * advances the state; every visual lives in assets/entry-signal.css, keyed to that attribute.
 *
 *   acquiring → locked → revealing → finish          (hero ready)
 *   acquiring → exit → finish                        (readiness timeout, skip, reduced motion)
 *   any state → finish                               (tab hidden, page hidden, error)
 *
 * Each change is announced as `afterdark:entry`. The kinetic hero has no intro of its own, so the tear
 * is its intro; anything added later that must not play unseen under the veil should wait for a state
 * other than `acquiring` or `locked` (the boot's finish announces `complete`).
 */
(() => {
  const entry = window.AfterdarkEntry;
  const root = document.documentElement;
  if (!entry || !root.hasAttribute('data-entry')) return;
  entry.running = true;

  // From the first frame: long enough to read the mark, title and metadata once they have resolved.
  // With the lock and reveal, a cached load reaches the hero in about 2.2s.
  const MIN_ACQUIRE = 1200;
  // SIGNAL LOCKED holds long enough to read before the tear.
  const LOCK_HOLD = 600;
  // Readiness cap. The boot's failsafe (4.5s from the first frame) sits above this plus the lock and reveal.
  const MAX_WAIT = 3000;
  const REDUCED_MIN = 900;
  const REDUCED_MAX = 1000;

  // Lock and reveal timing come from the duration tokens, so they stay part of the design system.
  const tokenDuration = (name, fallback) => {
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    const ms = value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
    return Number.isFinite(ms) ? ms : fallback;
  };
  const FAST = tokenDuration('--ad-duration-fast', 180);
  // Mirrors --entry-reveal in entry-signal.css.
  const REVEAL = tokenDuration('--ad-duration-base', 420);

  const controller = new AbortController();
  const timers = new Set();
  let settled = false;

  const wait = (ms) => new Promise((resolve) => {
    const id = setTimeout(() => {
      timers.delete(id);
      resolve();
    }, Math.max(0, ms));
    timers.add(id);
  });
  const until = (time) => wait(time - performance.now());

  function setState(state) {
    root.setAttribute('data-entry', state);
    document.dispatchEvent(new CustomEvent('afterdark:entry', { detail: { state } }));
  }

  function stop() {
    settled = true;
    controller.abort();
    timers.forEach(clearTimeout);
    timers.clear();
  }

  // Leave early: a short fade, or none at all when the page is going away.
  function release(fade = FAST) {
    if (settled) return;
    stop();
    if (!fade) {
      entry.finish();
      return;
    }
    setState('exit');
    setTimeout(entry.finish, fade);
  }

  // Ready means the hero's primary image is decoded and the fonts in use have loaded. A failed image
  // counts as ready: there is nothing more to wait for, and the hero has its own fallback frame.
  function heroReady() {
    const anchor = document.querySelector('[data-entry-anchor]');
    const image = anchor?.matches('img') ? anchor : anchor?.querySelector('img');
    const tasks = [document.fonts?.ready];
    if (image) {
      tasks.push(
        new Promise((resolve) => {
          if (image.complete) return resolve();
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        })
          .then(() => (image.naturalWidth ? image.decode() : null))
          .catch(() => null),
      );
    }
    return Promise.all(tasks);
  }

  async function run() {
    // Deferred scripts can run before the first frame; the boot moves `start` to that frame.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const deadline = entry.start + (entry.reduced ? REDUCED_MAX : MAX_WAIT);
    const outcome = await Promise.race([
      heroReady().then(() => 'ready'),
      until(deadline).then(() => 'timeout'),
    ]);
    if (settled) return;

    if (entry.reduced) {
      await until(entry.start + REDUCED_MIN);
      release();
      return;
    }
    if (outcome === 'timeout') {
      release();
      return;
    }

    await until(entry.start + MIN_ACQUIRE);
    setState('locked');
    await wait(LOCK_HOLD);
    setState('revealing');
    await wait(REVEAL);
    stop();
    entry.finish();
  }

  const { signal } = controller;
  // Intent skips only while acquiring; the lock and tear finish within about a second.
  const skip = () => {
    if (root.getAttribute('data-entry') === 'acquiring') release();
  };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((type) => {
    window.addEventListener(type, skip, { signal, capture: true, passive: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) release(0);
  }, { signal });
  window.addEventListener('pagehide', () => release(0), { signal });
  // The boot's failsafe may finish first; nothing may bring the overlay back after that.
  document.addEventListener('afterdark:entry', (event) => {
    if (event.detail?.state === 'complete') stop();
  }, { signal });

  run().catch(() => release(0));
})();
