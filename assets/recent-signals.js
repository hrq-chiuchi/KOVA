// Recent signals (D-043). Loaded only by sections/recent-signals.liquid.
// The browser keeps product handles and nothing else. Cards come from Shopify through the
// `recent-signal-card` section, so status, price and quick add match every other product card.

const STORAGE_KEY = 'kova:recent-signals';
const CAPACITY = 8;
const DWELL_MS = 3000;
const HANDLE = /^[a-z0-9][a-z0-9-]*$/;

function readHandles() {
  try {
    const list = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(list) ? list.filter((handle) => typeof handle === 'string' && HANDLE.test(handle)) : [];
  } catch (_) {
    return [];
  }
}

function writeHandles(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, CAPACITY)));
  } catch (_) {
    // Storage can be unavailable (private mode, blocked). Recent signals is optional.
  }
}

class RecentSignals extends HTMLElement {
  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const current = this.dataset.handle;
    this.load(readHandles().filter((handle) => handle !== current), this.controller.signal);
    // A product counts as inspected after a few seconds on screen, not on a passing visit.
    if (current && HANDLE.test(current)) {
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        if (document.visibilityState !== 'visible') return;
        writeHandles([current, ...readHandles().filter((handle) => handle !== current)]);
      }, DWELL_MS);
    }
  }

  disconnectedCallback() {
    this.controller?.abort();
    window.clearTimeout(this.timer);
  }

  cardUrl(handle) {
    const root = this.dataset.root || '/';
    const url = new URL(`${root.endsWith('/') ? root : `${root}/`}products/${handle}`, window.location.origin);
    url.searchParams.set('section_id', 'recent-signal-card');
    return url;
  }

  async load(handles, signal) {
    const shown = handles.slice(0, Number(this.dataset.limit) || 4);
    if (!shown.length) return;
    const results = await Promise.all(shown.map(async (handle) => {
      try {
        const response = await fetch(this.cardUrl(handle), { signal });
        if (response.status === 404) return { handle, gone: true };
        if (!response.ok) return { handle };
        const fragment = new DOMParser().parseFromString(await response.text(), 'text/html');
        if (fragment.querySelector('[data-recent-missing]')) return { handle, gone: true };
        return { handle, card: fragment.querySelector('[data-recent-card]') };
      } catch (_) {
        return { handle };
      }
    }));
    if (signal.aborted) return;

    // Objects removed from the store drop out of the history; readHandles also drops malformed entries.
    const gone = results.filter((result) => result.gone).map((result) => result.handle);
    writeHandles(readHandles().filter((handle) => !gone.includes(handle)));

    const cards = results.filter((result) => result.card).map((result) => result.card);
    if (!cards.length) return;
    const grid = this.querySelector('[data-recent-results]');
    grid.replaceChildren(...cards.map((card) => document.importNode(card, true)));
    this.hidden = false;
    window.AfterdarkMotion?.init(this);
    window.AfterdarkWebGL?.init(this);
  }
}

if (!customElements.get('recent-signals')) customElements.define('recent-signals', RecentSignals);
