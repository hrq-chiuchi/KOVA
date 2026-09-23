(() => {
  document.documentElement.classList.add('js');

  async function addProduct(form) {
    const response = await fetch(`${form.action}.js`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.description || 'Unable to add this item.');
    document.dispatchEvent(new CustomEvent('afterdark:cart-updated', { detail: { open: true } }));
    return payload;
  }

  class AfterdarkHeader extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.trigger = this.querySelector('[data-menu-open]');
      this.dialog = this.querySelector('[data-menu-dialog]');
      this.closeButton = this.querySelector('[data-menu-close]');

      this.trigger?.addEventListener('click', () => this.openMenu(), { signal });
      this.closeButton?.addEventListener('click', () => this.closeMenu(), { signal });
      this.dialog?.addEventListener('close', () => this.onMenuClose(), { signal });
      this.dialog?.addEventListener('cancel', () => this.onMenuClose(), { signal });
      this.dialog?.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.closeMenu();
      }, { signal });
      this.querySelector('[data-cart-open]')?.addEventListener('click', (event) => {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('afterdark:cart-open'));
      }, { signal });
      document.addEventListener('afterdark:cart-updated', () => this.updateCartCount(), { signal });
      document.addEventListener('afterdark:cart-count', () => this.updateCartCount(), { signal });
      window.addEventListener('scroll', () => this.updateScrollState(), { signal, passive: true });
      this.updateScrollState();
    }

    disconnectedCallback() {
      this.controller?.abort();
      document.body.classList.remove('menu-open');
    }

    openMenu() {
      if (!this.dialog || this.dialog.open) return;
      this.previouslyFocused = document.activeElement;
      this.dialog.showModal();
      this.trigger?.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      this.closeButton?.focus();
    }

    closeMenu() {
      this.dialog?.close();
    }

    onMenuClose() {
      this.trigger?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      this.previouslyFocused?.focus();
    }

    updateScrollState() {
      this.toggleAttribute('data-scrolled', window.scrollY > 24);
    }

    async updateCartCount() {
      try {
        const response = await fetch(this.dataset.cartJsonUrl, { headers: { Accept: 'application/json' } });
        if (!response.ok) return;
        const cart = await response.json();
        this.querySelectorAll('[data-cart-count]').forEach((count) => {
          count.textContent = String(cart.item_count).padStart(2, '0');
          count.setAttribute('aria-label', `${cart.item_count} items`);
        });
      } catch (_) {
        // The normal cart link remains available when the request fails.
      }
    }
  }

  class CartDrawer extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.dialog = this.querySelector('[data-cart-dialog]');
      this.querySelector('[data-cart-close]')?.addEventListener('click', () => this.close(), { signal });
      this.dialog?.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.close();
      }, { signal });
      this.addEventListener('submit', (event) => this.onSubmit(event), { signal });
      document.addEventListener('afterdark:cart-open', () => this.open(), { signal });
      document.addEventListener('afterdark:cart-updated', (event) => this.refresh(Boolean(event.detail?.open)), { signal });
    }

    disconnectedCallback() {
      this.controller?.abort();
    }

    open() {
      if (!this.dialog?.open) this.dialog?.showModal();
    }

    close() {
      this.dialog?.close();
    }

    async onSubmit(event) {
      const form = event.target.closest('[data-cart-change]');
      if (!form) return;
      event.preventDefault();
      const data = new FormData(form);
      if (event.submitter?.name) data.set(event.submitter.name, event.submitter.value);
      event.submitter?.setAttribute('disabled', '');
      try {
        const response = await fetch(this.dataset.changeUrl, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
        if (!response.ok) throw new Error('Cart update failed.');
        document.dispatchEvent(new CustomEvent('afterdark:cart-count'));
        await this.refresh(true);
      } catch (_) {
        form.submit();
      }
    }

    async refresh(openAfter = false) {
      if (this.refreshing) return this.refreshing;
      this.refreshing = fetch(this.dataset.refreshUrl, { headers: { Accept: 'text/html' } })
        .then((response) => {
          if (!response.ok) throw new Error('Cart refresh failed.');
          return response.text();
        })
        .then((html) => {
          const documentFragment = new DOMParser().parseFromString(html, 'text/html');
          const replacement = documentFragment.querySelector('cart-drawer');
          if (!replacement) throw new Error('Cart drawer markup missing.');
          this.innerHTML = replacement.innerHTML;
          this.connectedCallback();
          if (openAfter) this.open();
          return this;
        })
        .catch(() => {
          if (openAfter) window.location.assign('/cart');
        })
        .finally(() => {
          this.refreshing = null;
        });
      return this.refreshing;
    }
  }


  class ProductPurchase extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.form = this.querySelector('[data-product-purchase-form]');
      this.status = this.querySelector('[data-product-status]');
      this.price = this.querySelector('[data-product-price]');
      this.variantInput = this.querySelector('[data-variant-id]');
      this.addButton = this.querySelector('[data-add-button]');
      this.quantity = this.querySelector('[data-quantity-input]');
      try {
        this.variants = JSON.parse(this.querySelector('[data-variant-json]')?.textContent || '[]');
      } catch (_) {
        this.variants = [];
      }
      this.addEventListener('change', (event) => {
        if (event.target.matches('[data-option-value]')) this.updateVariant();
      }, { signal });
      this.querySelector('[data-quantity-minus]')?.addEventListener('click', () => this.changeQuantity(-1), { signal });
      this.querySelector('[data-quantity-plus]')?.addEventListener('click', () => this.changeQuantity(1), { signal });
      this.form?.addEventListener('submit', (event) => this.onSubmit(event), { signal });
      this.updateVariant();
    }

    disconnectedCallback() {
      this.controller?.abort();
    }

    selectedOptions() {
      return Array.from(this.querySelectorAll('[data-option-value]:checked'))
        .sort((a, b) => Number(a.dataset.optionPosition) - Number(b.dataset.optionPosition))
        .map((input) => input.value);
    }

    updateVariant() {
      if (!this.variants.length) return;
      // Products with only a default variant render no option inputs, so there is nothing to match against.
      const hasOptionInputs = this.querySelector('[data-option-value]') !== null;
      const selected = this.selectedOptions();
      const variant = hasOptionInputs
        ? this.variants.find((candidate) => candidate.options.every((option, index) => option === selected[index]))
        : this.variants[0];
      if (!variant) {
        this.variantInput.value = '';
        this.addButton.disabled = true;
        this.addButton.textContent = 'Unavailable';
        return;
      }
      this.variantInput.value = variant.id;
      this.price.textContent = variant.price;
      this.addButton.disabled = !variant.available;
      this.addButton.textContent = variant.available ? 'Add to bag' : 'Sold out';
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
      if (variant.featured_media_id) {
        this.querySelector(`[data-media-id="${variant.featured_media_id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    changeQuantity(delta) {
      if (!this.quantity) return;
      this.quantity.value = Math.max(1, Number(this.quantity.value || 1) + delta);
    }

    async onSubmit(event) {
      event.preventDefault();
      this.addButton.disabled = true;
      this.status.textContent = 'Adding to bag…';
      try {
        await addProduct(this.form);
        this.status.textContent = 'Added to bag.';
      } catch (error) {
        this.status.textContent = error.message;
      } finally {
        this.addButton.disabled = false;
      }
    }
  }

  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      if (this.dataset.loaded === 'true' || !this.dataset.productId) return;
      this.load();
    }

    async load() {
      const url = new URL(this.dataset.url, window.location.origin);
      url.searchParams.set('section_id', this.dataset.sectionId);
      url.searchParams.set('product_id', this.dataset.productId);
      url.searchParams.set('limit', this.dataset.limit || '4');
      url.searchParams.set('intent', 'related');
      try {
        const response = await fetch(url);
        if (!response.ok) return;
        const html = await response.text();
        const fragment = new DOMParser().parseFromString(html, 'text/html');
        const results = fragment.querySelector('[data-recommendations-results]');
        if (!results?.innerHTML.trim()) return;
        this.querySelector('[data-recommendations-results]').innerHTML = results.innerHTML;
        this.dataset.loaded = 'true';
        window.AfterdarkMotion?.init(this);
        window.AfterdarkWebGL?.init(this);
      } catch (_) {
        // Recommendations are optional; the product remains fully usable.
      }
    }
  }

  if (!customElements.get('afterdark-header')) customElements.define('afterdark-header', AfterdarkHeader);
  if (!customElements.get('cart-drawer')) customElements.define('cart-drawer', CartDrawer);
  if (!customElements.get('product-purchase')) customElements.define('product-purchase', ProductPurchase);
  if (!customElements.get('product-recommendations')) customElements.define('product-recommendations', ProductRecommendations);

  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-product-form]');
    if (!form) return;
    event.preventDefault();
    const submitter = event.submitter;
    submitter?.setAttribute('disabled', '');
    try {
      await addProduct(form);
    } catch (_) {
      form.submit();
    } finally {
      submitter?.removeAttribute('disabled');
    }
  });

  function initialize(root = document) {
    window.AfterdarkMotion?.init(root);
    window.AfterdarkWebGL?.init(root);
  }

  function destroy(root) {
    window.AfterdarkMotion?.destroy(root);
    window.AfterdarkWebGL?.destroy(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initialize());
  } else {
    initialize();
  }

  document.addEventListener('shopify:section:load', (event) => initialize(event.target));
  document.addEventListener('shopify:section:unload', (event) => destroy(event.target));
  document.addEventListener('shopify:section:select', () => {
    window.AfterdarkMotion?.refresh();
    window.AfterdarkWebGL?.refresh();
  });
  window.addEventListener('load', () => {
    window.AfterdarkMotion?.refresh();
    window.AfterdarkWebGL?.refresh();
  }, { once: true });
  document.fonts?.ready.then(() => {
    window.AfterdarkMotion?.refresh();
    window.AfterdarkWebGL?.refresh();
  });
})();
