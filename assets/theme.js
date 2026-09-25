(() => {
  document.documentElement.classList.add('js');

  // A refusal from Shopify (sold out, quantity limit). Network failures stay plain errors, so callers
  // can fall back to a native form post only when the request itself could not be made.
  class CartError extends Error {}

  // Posts to /cart/add.js. `body` is FormData from a product form, or an object such as
  // `{ items: [...] }`, which is sent as JSON so several lines are added in one atomic request.
  // `opener` is the control that asked, so the bag can hand focus back to it when it closes.
  async function addToCart(url, body, opener = null) {
    const isForm = body instanceof FormData;
    const response = await fetch(`${url}.js`, {
      method: 'POST',
      headers: isForm ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: isForm ? body : JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new CartError(payload.description || 'Unable to add this item.');
    document.dispatchEvent(new CustomEvent('afterdark:cart-updated', { detail: { open: true, added: payload, opener } }));
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
      // The bag link opens the cart drawer dialog; without JavaScript it goes to /cart. The drawer
      // keeps aria-expanded in sync while it is open.
      const cartTrigger = this.querySelector('[data-cart-open]');
      cartTrigger?.setAttribute('aria-haspopup', 'dialog');
      cartTrigger?.setAttribute('aria-expanded', String(Boolean(document.querySelector('[data-cart-dialog][open]'))));
      cartTrigger?.addEventListener('click', (event) => {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('afterdark:cart-open'));
      }, { signal });
      document.addEventListener('afterdark:cart-open', () => this.closePanel(), { signal });
      document.addEventListener('afterdark:cart-updated', () => this.updateCartCount(), { signal });
      document.addEventListener('afterdark:cart-count', () => this.updateCartCount(), { signal });
      window.addEventListener('scroll', () => this.updateScrollState(), { signal, passive: true });
      this.updateScrollState();

      // The search link opens the search command dialog; without JavaScript it goes to /search.
      this.searchTrigger = this.querySelector('[data-search-open]');
      this.searchDialog = this.querySelector('[data-search-dialog]');
      if (this.searchTrigger && this.searchDialog) {
        this.searchTrigger.setAttribute('role', 'button');
        this.searchTrigger.setAttribute('aria-haspopup', 'dialog');
        this.searchTrigger.setAttribute('aria-expanded', 'false');
        this.searchTrigger.addEventListener('click', (event) => {
          event.preventDefault();
          this.openSearch();
        }, { signal });
        this.searchTrigger.addEventListener('keydown', (event) => {
          if (event.key === ' ') {
            event.preventDefault();
            this.openSearch();
          }
        }, { signal });
        this.searchDialog.addEventListener('click', (event) => {
          if (event.target === this.searchDialog) this.searchDialog.close();
        }, { signal });
        this.searchDialog.addEventListener('close', () => {
          this.searchTrigger.setAttribute('aria-expanded', 'false');
          this.searchReturnFocus?.focus();
        }, { signal });
        document.addEventListener('keydown', (event) => {
          if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
          const target = event.target;
          if (target.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
          if (document.querySelector('dialog[open]')) return;
          event.preventDefault();
          this.openSearch();
        }, { signal });
      }

      this.setupMegaNav(signal);
    }

    // Desktop disclosure panels. One panel is open at a time. Mouse hover opens after a short delay;
    // touch and pen rely on the toggle, so a tap never opens a panel by accident.
    setupMegaNav(signal) {
      this.megaNav = this.querySelector('[data-mega-nav]');
      this.openToggle = null;
      if (!this.megaNav) return;
      const toggles = this.megaNav.querySelectorAll('[data-mega-toggle]');
      if (!toggles.length) return;

      toggles.forEach((toggle) => {
        toggle.hidden = false;
        toggle.addEventListener('click', () => {
          if (this.openToggle === toggle) this.closePanel();
          else this.openPanel(toggle);
        }, { signal });
      });

      this.megaNav.querySelectorAll('[data-mega-item]').forEach((item) => {
        const toggle = item.querySelector('[data-mega-toggle]');
        item.addEventListener('pointerenter', (event) => {
          if (event.pointerType !== 'mouse') return;
          this.scheduleHover(() => (toggle ? this.openPanel(toggle) : this.closePanel()));
        }, { signal });
        item.addEventListener('pointerleave', (event) => {
          if (event.pointerType !== 'mouse') return;
          this.scheduleHover(() => this.closePanel());
        }, { signal });
      });

      // Focus leaving the nav closes the panel. A null relatedTarget (a click on the panel's
      // background, or Safari's button focus) is not treated as leaving.
      this.megaNav.addEventListener('focusout', (event) => {
        if (event.relatedTarget && !this.megaNav.contains(event.relatedTarget)) this.closePanel();
      }, { signal });
      document.addEventListener('pointerdown', (event) => {
        if (this.openToggle && !this.megaNav.contains(event.target)) this.closePanel();
      }, { signal });
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !this.openToggle) return;
        const toggle = this.openToggle;
        const hadFocus = this.megaNav.contains(document.activeElement);
        this.closePanel();
        if (hadFocus) toggle.focus();
      }, { signal });

      // Theme Editor: selecting a menu feature block shows the panel it sits in.
      document.addEventListener('shopify:block:select', (event) => {
        const panel = event.target.closest?.('[data-mega-panel]');
        const toggle = panel && this.megaNav.querySelector(`[aria-controls="${panel.id}"]`);
        if (toggle) this.openPanel(toggle);
      }, { signal });
      document.addEventListener('shopify:block:deselect', () => this.closePanel(), { signal });
    }

    scheduleHover(action) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = setTimeout(action, 150);
    }

    openPanel(toggle) {
      if (this.openToggle === toggle) return;
      this.closePanel();
      const panel = document.getElementById(toggle.getAttribute('aria-controls'));
      if (!panel) return;
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      this.openToggle = toggle;
      this.setAttribute('data-panel-open', '');
    }

    closePanel() {
      clearTimeout(this.hoverTimer);
      const toggle = this.openToggle;
      if (!toggle) return;
      const panel = document.getElementById(toggle.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      this.openToggle = null;
      this.removeAttribute('data-panel-open');
    }

    async openSearch() {
      const dialog = this.searchDialog;
      if (!dialog || dialog.open) return;
      this.closePanel();
      this.searchReturnFocus = document.activeElement;
      dialog.showModal();
      this.searchTrigger.setAttribute('aria-expanded', 'true');
      const input = dialog.querySelector('[data-search-input]');
      input?.focus();
      input?.select();
      if (customElements.get('kova-search')) return;
      try {
        await import(dialog.dataset.moduleUrl);
      } catch (_) {
        window.location.assign(this.searchTrigger.href);
      }
    }

    disconnectedCallback() {
      this.controller?.abort();
      clearTimeout(this.hoverTimer);
      document.body.classList.remove('menu-open');
    }

    openMenu() {
      if (!this.dialog || this.dialog.open) return;
      this.closePanel();
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

  // Only the `data-cart-region` parts are replaced on refresh. The live region and header stay, so
  // announcements are heard and focus can be put back on the same line after a change.
  class CartDrawer extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.dialog = this.querySelector('[data-cart-dialog]');
      this.live = this.querySelector('[data-cart-live]');
      this.heading = this.querySelector('#CartDrawerTitle');
      this.querySelector('[data-cart-close]')?.addEventListener('click', () => this.close(), { signal });
      this.dialog?.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.close();
      }, { signal });
      this.dialog?.addEventListener('close', () => {
        this.setExpanded(false);
        this.announce('');
        this.returnFocus();
      }, { signal });
      this.addEventListener('submit', (event) => this.onSubmit(event), { signal });
      document.addEventListener('afterdark:cart-open', (event) => this.open(event.detail?.opener), { signal });
      document.addEventListener('afterdark:cart-updated', (event) => this.refresh(Boolean(event.detail?.open), event.detail), { signal });
      document.addEventListener('afterdark:cart-error', (event) => this.showError(event.detail?.message, event.detail?.opener), { signal });
    }

    disconnectedCallback() {
      this.controller?.abort();
    }

    open(opener = null) {
      if (!this.dialog?.open) {
        const active = document.activeElement;
        this.opener = opener || (active && active !== document.body ? active : null);
        this.dialog?.showModal();
      }
      this.setExpanded(true);
    }

    // Focus goes back to whatever opened the bag, or to the bag link when that control is gone.
    returnFocus() {
      const target = this.opener?.isConnected && !this.opener.disabled ? this.opener : document.querySelector('[data-cart-open]');
      this.opener = null;
      target?.focus();
    }

    close() {
      this.dialog?.close();
    }

    setExpanded(expanded) {
      document.querySelectorAll('[data-cart-open]').forEach((trigger) => trigger.setAttribute('aria-expanded', String(expanded)));
    }

    announce(message, tone = 'status') {
      if (!this.live) return;
      this.live.dataset.tone = tone;
      this.live.textContent = message;
    }

    showError(message, opener = null) {
      this.open(opener);
      this.announce(message || 'That item could not be added.', 'error');
    }

    async onSubmit(event) {
      const form = event.target.closest('[data-cart-change]');
      if (!form) return;
      event.preventDefault();
      const data = new FormData(form);
      if (event.submitter?.name) data.set(event.submitter.name, event.submitter.value);
      // Read focus before disabling the button, which would otherwise drop it to the page.
      const focus = this.focusState();
      event.submitter?.setAttribute('disabled', '');
      try {
        const response = await fetch(this.dataset.changeUrl, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
        const payload = await response.json().catch(() => ({}));
        document.dispatchEvent(new CustomEvent('afterdark:cart-count'));
        if (!response.ok) {
          // Shopify may have applied part of the change, so re-read the bag before explaining.
          await this.refresh(true, { focus });
          this.announce(payload.description || 'The bag could not be updated.', 'error');
          return;
        }
        await this.refresh(true, { message: 'Bag updated.', focus });
      } catch (_) {
        // The native post drops the submitter, so carry Remove's quantity of 0 over to the field.
        const quantity = form.querySelector('input[name="quantity"]');
        if (event.submitter?.name === 'quantity' && quantity) quantity.value = event.submitter.value;
        form.submit();
      }
    }

    // Remembers which line control had focus, so it can be restored in the new markup.
    focusState() {
      const active = document.activeElement;
      if (!active || !this.contains(active)) return null;
      const line = active.closest('[data-line-key]');
      if (!line) return { inside: true };
      const lines = Array.from(this.querySelectorAll('[data-line-key]'));
      return { key: line.dataset.lineKey, control: active.dataset.lineControl, index: lines.indexOf(line) };
    }

    restoreFocus(state, addedKey) {
      const lines = Array.from(this.querySelectorAll('[data-line-key]'));
      const byKey = (key) => lines.find((line) => line.dataset.lineKey === key);
      let target = null;
      if (addedKey && byKey(addedKey)) {
        target = byKey(addedKey).querySelector('[data-line-title]');
      } else if (state?.key) {
        const line = byKey(state.key);
        if (line) {
          target = line.querySelector(`[data-line-control="${state.control}"]`) || line.querySelector('[data-line-title]');
        } else {
          // The line was removed: move to the line that took its place, or the one before it.
          const next = lines[Math.min(state.index, lines.length - 1)];
          target = next?.querySelector('[data-line-title]');
        }
      }
      if (!target && state) target = this.heading;
      target?.focus();
    }

    async refresh(openAfter = false, detail = {}) {
      if (this.refreshing) return this.refreshing;
      const wasOpen = Boolean(this.dialog?.open);
      const focus = detail?.focus || this.focusState();
      const wasUnlocked = this.querySelector('[data-field-supply]')?.dataset.unlocked === 'true';
      this.refreshing = fetch(this.dataset.refreshUrl, { headers: { Accept: 'text/html' } })
        .then((response) => {
          if (!response.ok) throw new Error('Cart refresh failed.');
          return response.text();
        })
        .then((html) => {
          const fragment = new DOMParser().parseFromString(html, 'text/html');
          const regions = this.querySelectorAll('[data-cart-region]');
          if (!regions.length || !fragment.querySelector('cart-drawer [data-cart-region]')) throw new Error('Cart drawer markup missing.');
          regions.forEach((region) => {
            const replacement = fragment.querySelector(`cart-drawer [data-cart-region="${region.dataset.cartRegion}"]`);
            if (replacement) region.innerHTML = replacement.innerHTML;
          });
          if (openAfter) this.open(detail?.opener);
          const added = detail?.added;
          const addedKey = wasOpen && added?.key ? added.key : null;
          const messages = [];
          if (detail?.message) messages.push(detail.message);
          if (addedKey) messages.push(`Added ${added.product_title || 'item'} to bag.`);
          const supply = this.querySelector('[data-field-supply]');
          if (!wasUnlocked && supply?.dataset.unlocked === 'true') messages.push('Complimentary standard shipping unlocked.');
          if (messages.length) this.announce(messages.join(' '));
          if (wasOpen) this.restoreFocus(focus, addedKey);
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

  // Lifecycle labels written on variant change. The states come from snippets/product-status.liquid
  // through the variant JSON; Archive is product-level and stays in the identity column.
  const VARIANT_STATUS_LABELS = { 'sold-out': 'Sold out', 'low-supply': 'Low supply' };

  // The product form owns the selected variant. The purchase dock (D-042) and every other mirror are
  // written here, and the dock's button submits this same form through its `form` attribute.
  class ProductPurchase extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.form = this.querySelector('[data-product-purchase-form]');
      this.status = this.querySelector('[data-product-status]');
      this.variantInput = this.querySelector('[data-variant-id]');
      this.variantStatus = this.querySelector('[data-variant-status]');
      this.quantity = this.querySelector('[data-quantity-input]');
      this.dock = this.dataset.dockId ? document.getElementById(this.dataset.dockId) : null;
      this.addButtons = this.mirrors('[data-add-button]');
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
      this.setupDock();
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.dockObserver?.disconnect();
      this.dockObserver = null;
      document.documentElement.style.removeProperty('--ad-dock-offset');
    }

    // Elements inside the form column and the dock that reflect the selected variant.
    mirrors(selector) {
      return [this, this.dock].filter(Boolean).flatMap((root) => Array.from(root.querySelectorAll(selector)));
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
      this.variant = variant || null;
      this.variantInput.value = variant ? variant.id : '';
      this.render();
      if (!variant) return;
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
      if (variant.featured_media_id) {
        this.querySelector(`[data-media-id="${variant.featured_media_id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Writes the selected variant into the form and every mirror of it.
    render() {
      const variant = this.variant;
      if (variant) {
        this.mirrors('[data-product-price]').forEach((price) => { price.textContent = variant.price; });
      }
      this.mirrors('[data-product-compare]').forEach((compare) => {
        compare.textContent = variant?.compare_at_price || '';
        compare.hidden = !variant?.compare_at_price;
      });
      this.mirrors('[data-variant-label]').forEach((label) => { label.textContent = variant ? variant.title : selectedLabel(this); });
      const label = !variant ? 'Unavailable' : variant.available ? 'Add to bag' : 'Sold out';
      this.addButtons.forEach((button) => {
        button.disabled = !variant?.available;
        button.textContent = label;
      });
      if (this.variantStatus) {
        const key = variant ? variant.status : 'sold-out';
        const text = variant ? VARIANT_STATUS_LABELS[key] : 'Unavailable';
        this.variantStatus.replaceChildren();
        if (text) {
          const badge = document.createElement('span');
          badge.className = `status-badge status-badge--${key}`;
          badge.textContent = text;
          this.variantStatus.append(badge);
        }
      }
    }

    changeQuantity(delta) {
      if (!this.quantity) return;
      this.quantity.value = Math.max(1, Number(this.quantity.value || 1) + delta);
    }

    async onSubmit(event) {
      event.preventDefault();
      this.addButtons.forEach((button) => { button.disabled = true; });
      this.status.textContent = 'Adding to bag…';
      try {
        await addToCart(this.form.action, new FormData(this.form), event.submitter);
        this.status.textContent = 'Added to bag.';
      } catch (error) {
        this.status.textContent = error.message;
      } finally {
        this.render();
      }
    }

    // Shows the dock once the whole form is above the viewport, and hides it again over the footer.
    setupDock() {
      if (!this.dock || !this.form || !('IntersectionObserver' in window)) return;
      this.dock.hidden = false;
      const builder = document.querySelector('loadout-builder');
      const builderSection = builder?.closest('.shopify-section');
      const loadoutLink = this.dock.querySelector('[data-dock-loadout]');
      if (loadoutLink && builderSection?.id) {
        loadoutLink.href = `#${builderSection.id}`;
        loadoutLink.hidden = false;
      }
      const footer = document.querySelector('.site-footer');
      let formAbove = false;
      let footerVisible = false;
      this.dockObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target === this.form) formAbove = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
          if (entry.target === footer) footerVisible = entry.isIntersecting;
        });
        const visible = formAbove && !footerVisible;
        this.dock.toggleAttribute('data-visible', visible);
        if (visible) {
          document.documentElement.style.setProperty('--ad-dock-offset', `${this.dock.offsetHeight}px`);
        } else {
          document.documentElement.style.removeProperty('--ad-dock-offset');
        }
      });
      this.dockObserver.observe(this.form);
      if (footer) this.dockObserver.observe(footer);
    }
  }

  function selectedLabel(root) {
    return Array.from(root.querySelectorAll('[data-option-value]:checked')).map((input) => input.value).join(' / ');
  }

  // Builds a KOVA loadout and adds it as one group. Every line carries the same `_kova_loadout` id
  // and its `_kova_slot`; the KOVA Core cart transform merges a valid group into one priced line
  // and the validation refuses an invalid one. These checks mirror `judgeGroup` in
  // apps/kova-core/shared/loadout-rules.ts so customers see problems before the request.
  class LoadoutBuilder extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.form = this.querySelector('[data-loadout-form]');
      this.hint = this.querySelector('[data-hint]');
      this.status = this.querySelector('[data-status]');
      this.addButton = this.querySelector('[data-add-button]');
      this.estimate = this.querySelector('[data-summary-estimate]');
      this.saveLink = this.querySelector('[data-save-link]');
      if (this.saveLink) this.saveLink.dataset.baseUrl ||= this.saveLink.href;
      try {
        this.rules = JSON.parse(this.querySelector('[data-loadout-rules]')?.textContent || '{}');
      } catch (_) {
        this.rules = {};
      }
      try {
        this.money = new Intl.NumberFormat(this.dataset.locale || undefined, { style: 'currency', currency: this.dataset.currency });
      } catch (_) {
        this.money = null;
      }
      if (!this.form) return;
      this.form.addEventListener('change', (event) => this.onChange(event), { signal });
      this.form.addEventListener('submit', (event) => this.onSubmit(event), { signal });
      this.applyLoadoutParams();
      this.querySelectorAll('[data-slot-fieldset]').forEach((fieldset) => this.enforceMax(fieldset));
      this.update();
    }

    disconnectedCallback() {
      this.controller?.abort();
    }

    // Liquid cannot read the query string, so links preselect here: ?platform=relay-sling-8 alone,
    // or a whole build from the Field Locker (?platform=handle:variant&modules=handle:variant,…).
    // The format and its limits mirror decodeLoadoutParams in apps/kova-core/shared/field-locker.ts;
    // anything that does not parse is ignored, and the cart functions stay authoritative.
    applyLoadoutParams() {
      const params = new URL(window.location.href).searchParams;
      const pick = (raw) => {
        const match = /^([a-z0-9][a-z0-9-]{0,99})(?::(\d{1,20}))?$/.exec(raw || '');
        return match ? { handle: match[1], variant: match[2] || null } : null;
      };
      const choose = (input, variant) => {
        if (!input || input.disabled || input.checked) return;
        const fieldset = input.closest('[data-slot-fieldset]');
        if (fieldset && input.type === 'checkbox'
          && fieldset.querySelectorAll('[data-loadout-choice]:checked').length >= (Number(fieldset.dataset.max) || 1)) return;
        input.checked = true;
        const select = input.closest('.loadout-option')?.querySelector('[data-variant-select]');
        const option = variant && select ? Array.from(select.options).find((entry) => entry.value === variant) : null;
        if (option && !option.disabled) select.value = variant;
      };
      const choices = Array.from(this.querySelectorAll('[data-loadout-choice]'));
      const platform = pick(params.get('platform'));
      if (platform && !this.hasAttribute('data-locked')) {
        choose(choices.find((input) => input.dataset.slot === 'platform' && input.dataset.handle === platform.handle), platform.variant);
      }
      const modules = (params.get('modules') || '').split(',').filter(Boolean);
      if (modules.length > 8) return;
      modules.map(pick).filter(Boolean).forEach((module) => {
        choose(choices.find((input) => input.dataset.slot !== 'platform' && input.dataset.handle === module.handle), module.variant);
      });
    }

    // Points "Save to Field Locker" at the current build, or hides it while the build is invalid.
    updateSaveLink({ platform, modules }, problem) {
      if (!this.saveLink) return;
      this.saveLink.hidden = Boolean(problem);
      if (problem) return;
      const encode = (input) => `${input.dataset.handle}:${this.variantOf(input).id}`;
      const url = new URL(this.saveLink.dataset.baseUrl);
      url.search = `loadout=${this.dataset.loadoutHandle}&platform=${encode(platform)}&modules=${modules.map(encode).join(',')}`;
      this.saveLink.href = url.toString();
    }

    state() {
      const chosen = Array.from(this.querySelectorAll('[data-loadout-choice]:checked'));
      const platform = chosen.find((input) => input.dataset.slot === 'platform') || null;
      return { platform, modules: chosen.filter((input) => input !== platform) };
    }

    variantOf(input) {
      const select = input.closest('.loadout-option')?.querySelector('[data-variant-select]');
      const option = select?.selectedOptions[0];
      return {
        id: Number(option?.value || input.dataset.variantId),
        price: Number(option?.dataset.price || input.dataset.price) || 0,
        title: option ? option.textContent.trim() : '',
      };
    }

    problem({ platform, modules }) {
      const platformFieldset = this.querySelector('[data-platform-fieldset]');
      if (!platform) return { message: 'Choose a platform.', target: platformFieldset };
      if (platform.disabled) return { message: `${platform.dataset.title} is sold out.`, target: platformFieldset };
      for (const fieldset of this.querySelectorAll('[data-slot-fieldset][data-required]')) {
        if (!fieldset.querySelector('[data-loadout-choice]:checked')) {
          return { message: `Choose a ${fieldset.dataset.slotLabel.toLowerCase()} module.`, target: fieldset };
        }
      }
      const minimum = Number(this.rules.minModules) || 0;
      if (modules.length < minimum) {
        const missing = minimum - modules.length;
        return {
          message: `Choose ${missing} more module${missing === 1 ? '' : 's'}. A loadout needs at least ${minimum}.`,
          target: this.querySelector('[data-slot-fieldset]'),
        };
      }
      return null;
    }

    percentFor(count) {
      return (this.rules.tiers || [])
        .filter((tier) => count >= tier.modules)
        .reduce((best, tier) => Math.max(best, tier.percent), 0);
    }

    formatMoney(cents) {
      return this.money ? this.money.format(cents / 100) : (cents / 100).toFixed(2);
    }

    // A multi-item slot caps at its maximum: once full, the unchosen products are disabled, which
    // also keeps each product to one line per loadout (D-024).
    enforceMax(fieldset, changed) {
      const maximum = Number(fieldset.dataset.max) || 1;
      if (maximum < 2) return;
      const boxes = Array.from(fieldset.querySelectorAll('[data-loadout-choice]'));
      const full = boxes.filter((box) => box.checked).length >= maximum;
      boxes.forEach((box) => {
        if (!box.checked) box.disabled = full || box.hasAttribute('data-sold-out');
      });
      if (full && changed?.checked) this.status.textContent = `${fieldset.dataset.slotLabel} is full: up to ${maximum}.`;
    }

    onChange(event) {
      this.status.textContent = '';
      const fieldset = event.target.closest('[data-slot-fieldset]');
      if (fieldset && event.target.matches('[data-loadout-choice]')) this.enforceMax(fieldset, event.target);
      this.update();
    }

    update() {
      const state = this.state();
      const lines = [state.platform, ...state.modules].filter(Boolean);
      this.querySelector('[data-summary-list]')?.replaceChildren(...lines.map((input) => {
        const variant = this.variantOf(input);
        const item = document.createElement('li');
        const name = document.createElement('span');
        const role = document.createElement('span');
        name.textContent = variant.title ? `${input.dataset.title} / ${variant.title}` : input.dataset.title;
        role.textContent = input.dataset.slot === 'platform'
          ? 'Platform'
          : input.closest('[data-slot-fieldset]')?.dataset.slotLabel || '';
        item.append(name, role);
        return item;
      }));

      const separate = lines.reduce((sum, input) => sum + this.variantOf(input).price, 0);
      const problem = this.problem(state);
      const percent = problem ? 0 : this.percentFor(state.modules.length);
      this.querySelector('[data-summary-count]').textContent = String(state.modules.length);
      this.querySelector('[data-summary-separate]').textContent = lines.length ? this.formatMoney(separate) : '—';
      this.querySelector('[data-summary-percent]').textContent = percent ? `−${percent}%` : '—';
      const estimate = problem ? '—' : this.formatMoney(Math.round((separate * (100 - percent)) / 100));
      if (this.estimate && this.estimate.textContent !== estimate) {
        this.estimate.textContent = estimate;
        this.estimate.setAttribute('data-changed', '');
        requestAnimationFrame(() => requestAnimationFrame(() => this.estimate.removeAttribute('data-changed')));
      }
      this.hint.textContent = problem ? problem.message : '';
      this.updateSaveLink(state, problem);
    }

    async onSubmit(event) {
      event.preventDefault();
      if (this.busy) return;
      const state = this.state();
      const problem = this.problem(state);
      if (problem) {
        this.status.textContent = problem.message;
        problem.target?.focus();
        return;
      }

      // Unique per build, so two loadouts in one cart never share a group.
      const group = window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      const items = [state.platform, ...state.modules].map((input) => ({
        id: this.variantOf(input).id,
        quantity: 1,
        properties: { _kova_loadout: group, _kova_slot: input.dataset.slot },
      }));

      this.busy = true;
      this.addButton.disabled = true;
      this.status.textContent = 'Adding loadout to bag…';
      try {
        await addToCart(this.dataset.cartAddUrl, { items });
        this.status.textContent = 'Loadout added to bag.';
        this.resetModules(state.platform);
      } catch (error) {
        this.status.textContent = error.message;
      } finally {
        this.busy = false;
        this.addButton.disabled = false;
      }
    }

    // After a successful add the platform stays chosen and the modules clear, so a second build
    // starts clean.
    resetModules(platform) {
      this.form.reset();
      if (platform) platform.checked = true;
      this.querySelectorAll('[data-slot-fieldset]').forEach((fieldset) => this.enforceMax(fieldset));
      this.update();
    }
  }

  // Applies Equipment Index filters in place (D-036). The form still submits by GET without
  // JavaScript; here each change fetches the same URL with `section_id`, swaps every
  // `[data-filters-swap]` region from the response and pushes the URL, so reload, Back and
  // Forward all land on the same filtered state. Below 48rem the form moves into a dialog.
  class IndexFilters extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.dialog = this.querySelector('[data-filters-dialog]');
      this.home = this.querySelector('[data-filters-home]');
      this.panel = this.querySelector('[data-filters-panel]');

      this.addEventListener('change', (event) => {
        if (!event.target.closest('[data-filters-form]')) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.apply(), 250);
      }, { signal });
      this.addEventListener('submit', (event) => {
        if (!event.target.matches('[data-filters-form]')) return;
        event.preventDefault();
        this.apply();
      }, { signal });
      this.addEventListener('click', (event) => {
        const link = event.target.closest('[data-filters-link]');
        if (link) {
          event.preventDefault();
          this.load(link.href, { focus: '[data-filters-count]' });
          return;
        }
        if (event.target.closest('[data-filters-open]')) this.openDialog();
        if (event.target.closest('[data-filters-close]')) this.dialog?.close();
      }, { signal });
      this.dialog?.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.dialog.close();
      }, { signal });
      this.dialog?.addEventListener('close', () => this.onDialogClose(), { signal });
      window.addEventListener('popstate', (event) => {
        if (event.state?.indexFilters) this.load(window.location.href, { push: false });
      }, { signal });
      window.history.replaceState({ ...window.history.state, indexFilters: true }, '');
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.request?.abort();
      clearTimeout(this.timer);
    }

    openDialog() {
      if (!this.dialog || this.dialog.open) return;
      this.opener = document.activeElement;
      this.dialog.append(this.panel);
      this.dialog.showModal();
      this.querySelector('[data-filters-close]')?.focus();
    }

    onDialogClose() {
      this.home?.append(this.panel);
      this.opener?.focus();
    }

    apply() {
      const form = this.querySelector('[data-filters-form]');
      if (!form) return;
      const params = new URLSearchParams();
      for (const [name, value] of new FormData(form)) {
        if (value !== '') params.append(name, value);
      }
      const url = new URL(form.action, window.location.origin);
      url.search = params.toString();
      this.load(url.toString(), { focus: document.activeElement?.id ? `#${CSS.escape(document.activeElement.id)}` : null });
    }

    async load(href, { push = true, focus = null } = {}) {
      this.request?.abort();
      const request = new AbortController();
      this.request = request;
      const url = new URL(href, window.location.origin);
      const fetchUrl = new URL(url);
      fetchUrl.searchParams.set('section_id', this.dataset.sectionId);
      this.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(fetchUrl, { signal: request.signal });
        if (!response.ok) throw new Error('Filter request failed.');
        const next = new DOMParser().parseFromString(await response.text(), 'text/html').querySelector('index-filters');
        if (!next) throw new Error('Filter markup missing.');
        const results = this.querySelector('[data-filters-swap="results"]');
        if (results) {
          window.AfterdarkMotion?.destroy(results);
          window.AfterdarkWebGL?.destroy(results);
        }
        this.querySelectorAll('[data-filters-swap]').forEach((region) => {
          const replacement = next.querySelector(`[data-filters-swap="${region.dataset.filtersSwap}"]`);
          if (replacement) region.innerHTML = replacement.innerHTML;
        });
        const count = this.querySelector('[data-filters-count]');
        const nextCount = next.querySelector('[data-filters-count]')?.textContent;
        if (count && nextCount) count.textContent = nextCount;
        if (push) window.history.pushState({ indexFilters: true }, '', url);
        if (results) {
          window.AfterdarkMotion?.init(results);
          window.AfterdarkWebGL?.init(results);
        }
        const target = focus && this.querySelector(focus);
        if (target) {
          if (!target.matches('input, select, button, a')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      } catch (error) {
        if (error.name !== 'AbortError') window.location.assign(url);
      } finally {
        if (this.request === request) this.removeAttribute('aria-busy');
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
      url.searchParams.set('intent', this.dataset.intent || 'complementary');
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
  if (!customElements.get('loadout-builder')) customElements.define('loadout-builder', LoadoutBuilder);
  if (!customElements.get('index-filters')) customElements.define('index-filters', IndexFilters);
  if (!customElements.get('product-recommendations')) customElements.define('product-recommendations', ProductRecommendations);

  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-product-form]');
    if (!form) return;
    event.preventDefault();
    const submitter = event.submitter;
    submitter?.setAttribute('disabled', '');
    try {
      await addToCart(form.action, new FormData(form), submitter);
    } catch (error) {
      // A refusal is shown in the bag; only a failed request falls back to the native post.
      if (error instanceof CartError) {
        document.dispatchEvent(new CustomEvent('afterdark:cart-error', { detail: { message: error.message, opener: submitter } }));
      } else {
        form.submit();
      }
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
