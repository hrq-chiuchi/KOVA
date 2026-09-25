// SIGNAL tab (D-046). Loaded only by sections/signal-tab.liquid.
// The tab is a non-modal disclosure. It posts the same `customer` form as the footer and treats the
// signup as done only when Shopify confirms it; anything it cannot read falls back to a native post,
// which also covers Shopify's bot challenge.

const STORAGE_KEY = 'kova:signal-tab';
const DAY_MS = 24 * 60 * 60 * 1000;

function readState() {
  try {
    const state = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (state?.status === 'subscribed') return state;
    if (state?.status === 'dismissed' && Number(state.until) > Date.now()) return state;
  } catch (_) {
    // Unreadable storage means the tab is simply shown.
  }
  return null;
}

// Per-visit flags: the arrival plays on the first page of a visit, and the indicator stays lit until
// the tab is opened once.
function readVisit(flag) {
  try {
    return window.sessionStorage.getItem(`${STORAGE_KEY}:${flag}`) === 'true';
  } catch (_) {
    return false;
  }
}

function writeVisit(flag) {
  try {
    window.sessionStorage.setItem(`${STORAGE_KEY}:${flag}`, 'true');
  } catch (_) {
    // Without session storage the arrival may replay on the next page, which is harmless.
  }
}

function writeState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    // Storage can be unavailable (private mode, blocked). The tab then shows again next visit.
  }
}

class SignalTab extends HTMLElement {
  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.toggle = this.querySelector('[data-signal-toggle]');
    this.panel = this.querySelector('[data-signal-panel]');
    this.form = this.querySelector('form');
    this.input = this.querySelector('[data-signal-input]');
    this.submit = this.querySelector('[data-signal-submit]');
    this.status = this.querySelector('[data-signal-status]');
    if (!this.toggle || !this.panel || !this.form) return;

    // The Theme Editor always shows the tab so merchants can edit it.
    const designMode = Boolean(window.Shopify?.designMode);
    if (readState() && !designMode) return;
    this.hidden = false;
    if (readVisit('seen')) {
      this.setAttribute('data-seen', '');
    } else if (!readVisit('announced') && !designMode) {
      this.setAttribute('data-arrive', '');
      writeVisit('announced');
    }

    this.toggle.addEventListener('click', () => (this.isOpen ? this.close() : this.open()), { signal });
    this.querySelector('[data-signal-close]')?.addEventListener('click', () => this.close(true), { signal });
    this.querySelector('[data-signal-dismiss]')?.addEventListener('click', () => this.dismiss(), { signal });
    this.form.addEventListener('submit', (event) => this.onSubmit(event), { signal });
    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        event.stopPropagation();
        this.close(true);
      }
    }, { signal });

    if (designMode) {
      document.addEventListener('shopify:section:select', (event) => {
        if (event.detail?.sectionId === this.dataset.sectionId) this.open(false);
      }, { signal });
      document.addEventListener('shopify:section:deselect', (event) => {
        if (event.detail?.sectionId === this.dataset.sectionId) this.close();
      }, { signal });
    }
  }

  disconnectedCallback() {
    this.controller?.abort();
  }

  get isOpen() {
    return !this.panel.hidden;
  }

  open(moveFocus = true) {
    this.panel.hidden = false;
    this.setAttribute('data-seen', '');
    writeVisit('seen');
    this.toggle.setAttribute('aria-expanded', 'true');
    if (moveFocus) this.input?.focus();
  }

  close(returnFocus = false) {
    if (!this.isOpen) return;
    this.panel.hidden = true;
    this.toggle.setAttribute('aria-expanded', 'false');
    if (this.dataset.state === 'success') {
      this.hidden = true;
      return;
    }
    if (returnFocus) this.toggle.focus();
  }

  dismiss() {
    const days = Number(this.dataset.dismissDays) || 30;
    writeState({ status: 'dismissed', until: Date.now() + days * DAY_MS });
    this.hidden = true;
    document.getElementById('MainContent')?.focus({ preventScroll: true });
  }

  setState(state, message) {
    this.dataset.state = state;
    this.status.textContent = message;
  }

  async onSubmit(event) {
    if (!this.form.checkValidity()) return;
    event.preventDefault();
    this.submit.disabled = true;
    this.setState('loading', 'Sending…');
    let result;
    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: new FormData(this.form),
        headers: { Accept: 'text/html' },
      });
      result = await this.readResult(response);
    } catch (_) {
      result = { kind: 'unknown' };
    }
    this.submit.disabled = false;

    if (result.kind === 'success') {
      writeState({ status: 'subscribed' });
      this.setState('success', 'Transmission received. Watch your inbox for the next drop.');
      return;
    }
    if (result.kind === 'error') {
      this.setState('error', result.message);
      this.input.focus();
      return;
    }
    // A challenge page or an unreadable answer: let the browser post the form itself.
    this.setState('loading', 'Sending…');
    HTMLFormElement.prototype.submit.call(this.form);
  }

  // Shopify redirects a successful signup to `?customer_posted=true`. Errors come back as the page
  // with this form's error list. Anything else is unknown.
  async readResult(response) {
    const url = new URL(response.url, window.location.href);
    if (url.searchParams.get('customer_posted') === 'true') return { kind: 'success' };
    if (url.pathname.includes('/challenge') || !response.ok) return { kind: 'unknown' };
    const html = await response.text();
    const page = new DOMParser().parseFromString(html, 'text/html');
    const form = page.getElementById(this.form.id);
    const errors = form?.querySelector('.errors, [class*="errors"]');
    if (errors?.textContent.trim()) return { kind: 'error', message: errors.textContent.trim().replace(/\s+/g, ' ') };
    return { kind: 'unknown' };
  }
}

if (!customElements.get('signal-tab')) customElements.define('signal-tab', SignalTab);
