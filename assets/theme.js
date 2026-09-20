(() => {
  document.documentElement.classList.add('js');

  class AfterdarkHeader extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.trigger = this.querySelector('[data-menu-open]');
      this.dialog = this.querySelector('[data-menu-dialog]');
      this.closeButton = this.querySelector('[data-menu-close]');
      if (!this.trigger || !this.dialog) return;

      this.trigger.addEventListener('click', () => this.open(), { signal });
      this.closeButton?.addEventListener('click', () => this.close(), { signal });
      this.dialog.addEventListener('close', () => this.onClose(), { signal });
      this.dialog.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.close();
      }, { signal });
    }

    disconnectedCallback() {
      this.controller?.abort();
      document.body.classList.remove('menu-open');
    }

    open() {
      if (this.dialog.open) return;
      this.previouslyFocused = document.activeElement;
      this.dialog.showModal();
      this.trigger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      this.closeButton?.focus();
    }

    close() {
      this.dialog.close();
    }

    onClose() {
      this.trigger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      this.previouslyFocused?.focus();
    }
  }

  class ProductRail extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.resizeObserver?.disconnect();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.track = this.querySelector('[data-rail-track]');
      this.previous = this.querySelector('[data-rail-previous]');
      this.next = this.querySelector('[data-rail-next]');
      if (!this.track) return;

      this.previous?.addEventListener('click', () => this.move(-1), { signal });
      this.next?.addEventListener('click', () => this.move(1), { signal });
      this.track.addEventListener('scroll', () => this.updateControls(), { signal, passive: true });
      this.resizeObserver = new ResizeObserver(() => this.updateControls());
      this.resizeObserver.observe(this.track);
      this.updateControls();
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.resizeObserver?.disconnect();
    }

    move(direction) {
      const card = this.track.querySelector('[data-reveal-card]');
      const trackStyles = getComputedStyle(this.track);
      const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
      const width = card ? card.getBoundingClientRect().width + gap : this.track.clientWidth * 0.85;
      this.track.scrollBy({ left: direction * width, behavior: 'smooth' });
    }

    updateControls() {
      if (!this.track) return;
      const max = this.track.scrollWidth - this.track.clientWidth;
      if (this.previous) this.previous.disabled = this.track.scrollLeft <= 2;
      if (this.next) this.next.disabled = this.track.scrollLeft >= max - 2;
    }
  }

  if (!customElements.get('afterdark-header')) customElements.define('afterdark-header', AfterdarkHeader);
  if (!customElements.get('product-rail')) customElements.define('product-rail', ProductRail);

  function initialize(root = document) {
    window.AfterdarkMotion?.init(root);
  }

  function destroy(root) {
    window.AfterdarkMotion?.destroy(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initialize());
  } else {
    initialize();
  }

  document.addEventListener('shopify:section:load', (event) => initialize(event.target));
  document.addEventListener('shopify:section:unload', (event) => destroy(event.target));
  document.addEventListener('shopify:section:select', () => window.AfterdarkMotion?.refresh());
  window.addEventListener('load', () => window.AfterdarkMotion?.refresh(), { once: true });
  document.fonts?.ready.then(() => window.AfterdarkMotion?.refresh());
})();
