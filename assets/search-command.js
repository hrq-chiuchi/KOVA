// Search command (D-037): a combobox over native predictive search. theme.js imports this module
// the first time the search dialog opens, so no search code runs on page load. Suggestions come
// from sections/predictive-search.liquid through the Section Rendering API; the form itself still
// submits to /search, so Enter with no suggestion chosen runs a full search.
class KovaSearch extends HTMLElement {
  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.input = this.querySelector('[data-search-input]');
    this.results = this.querySelector('[data-search-results]');
    this.status = this.querySelector('[data-search-status]');
    this.dialog = this.closest('dialog');
    if (!this.input || !this.results) return;

    this.input.addEventListener('input', () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.search(), 200);
    }, { signal });
    this.input.addEventListener('keydown', (event) => this.onKeydown(event), { signal });
    this.results.addEventListener('mousemove', (event) => {
      const option = event.target.closest('[role="option"]');
      if (option && option.getAttribute('aria-selected') !== 'true') this.setActive(option, { scroll: false });
    }, { signal });
    this.querySelector('[data-search-close]')?.addEventListener('click', () => this.dialog?.close(), { signal });
    this.dialog?.addEventListener('close', () => this.setActive(null), { signal });
    if (this.input.value.trim()) this.search();
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.request?.abort();
    clearTimeout(this.timer);
  }

  options() {
    return Array.from(this.results.querySelectorAll('[role="option"]'));
  }

  setActive(option, { scroll = true } = {}) {
    this.options().forEach((candidate) => candidate.setAttribute('aria-selected', String(candidate === option)));
    if (option) {
      this.input.setAttribute('aria-activedescendant', option.id);
      if (scroll) option.scrollIntoView({ block: 'nearest' });
    } else {
      this.input.removeAttribute('aria-activedescendant');
    }
  }

  onKeydown(event) {
    const options = this.options();
    const current = options.findIndex((option) => option.getAttribute('aria-selected') === 'true');
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (!options.length) return;
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = current === -1 ? (step === 1 ? 0 : options.length - 1) : (current + step + options.length) % options.length;
        this.setActive(options[next]);
        break;
      }
      case 'Home':
      case 'End':
        if (current === -1 || !options.length) return;
        event.preventDefault();
        this.setActive(event.key === 'Home' ? options[0] : options[options.length - 1]);
        break;
      case 'Enter':
        if (current === -1) return;
        event.preventDefault();
        options[current].click();
        break;
      case 'Escape':
        // A search input would clear itself first; Escape closes the command in one press instead.
        event.preventDefault();
        this.dialog?.close();
        break;
      default:
    }
  }

  async search() {
    const terms = this.input.value.trim();
    this.request?.abort();
    if (!terms) {
      this.results.replaceChildren();
      this.input.setAttribute('aria-expanded', 'false');
      this.setActive(null);
      this.status.textContent = '';
      return;
    }
    const request = new AbortController();
    this.request = request;
    const url = new URL(this.dataset.url, window.location.origin);
    url.searchParams.set('q', terms);
    url.searchParams.set('section_id', 'predictive-search');
    url.searchParams.set('resources[type]', 'product,article,collection,page');
    url.searchParams.set('resources[limit]', '4');
    url.searchParams.set('resources[limit_scope]', 'each');
    // Body and tags let Field Notes match on their text, not only their titles.
    url.searchParams.set('resources[options][fields]', 'title,product_type,variants.title,vendor,tag,body');
    this.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw new Error('Predictive search failed.');
      const fragment = new DOMParser().parseFromString(await response.text(), 'text/html');
      const markup = fragment.querySelector('[data-predictive-results]');
      if (!markup) throw new Error('Predictive search markup missing.');
      this.results.innerHTML = markup.innerHTML;
      this.input.setAttribute('aria-expanded', 'true');
      this.setActive(null);
      this.announce(Number(markup.dataset.count) || 0);
    } catch (error) {
      if (error.name === 'AbortError') return;
      // Suggestions are optional: Enter still submits the form to the full search page.
      this.results.replaceChildren();
      this.input.setAttribute('aria-expanded', 'false');
      this.status.textContent = '';
    } finally {
      if (this.request === request) this.removeAttribute('aria-busy');
    }
  }

  announce(count) {
    const template = count === 0 ? this.dataset.statusNone : count === 1 ? this.dataset.statusOne : this.dataset.statusOther;
    this.status.textContent = (template || '').replace('[count]', String(count));
  }
}

if (!customElements.get('kova-search')) customElements.define('kova-search', KovaSearch);
