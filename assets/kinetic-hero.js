(() => {
  class KineticHero extends HTMLElement {
    connectedCallback() {
      this.destroy();
      this.layers = Array.from(this.querySelectorAll('[data-kinetic-layer]'));
      this.stage = this.querySelector('[data-kinetic-stage]');
      if (!this.stage || this.layers.length < 2 || !window.gsap) return;

      this.controller = new AbortController();
      this.media = window.gsap.matchMedia();
      this.activeIndex = Math.max(0, this.layers.length - 2);
      this.lastPoint = null;
      this.currentPoint = null;
      this.zIndex = this.layers.length;
      this.settleTweens = [];

      this.media.add(
        {
          interactive: '(hover: hover) and (pointer: fine)',
          touch: '(hover: none), (pointer: coarse)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { interactive, touch, reduceMotion } = context.conditions;
          this.layout();
          if (reduceMotion) return;
          if (interactive) this.enablePointer();
          if (touch) this.enableTouch();
          return () => this.resetListeners();
        },
        this,
      );
    }

    disconnectedCallback() {
      this.destroy();
    }

    layout() {
      const { gsap } = window;
      this.layers.forEach((layer, index) => {
        const offset = index - ((this.layers.length - 1) / 2);
        gsap.set(layer, {
          xPercent: -50,
          yPercent: -50,
          x: offset * 12,
          y: offset * -8,
          rotation: offset * 1.6,
          zIndex: index + 1,
        });
      });
      this.zIndex = this.layers.length;
    }

    // Moving across the hero promotes the next layer and drops it at the pointer every `threshold`
    // pixels; the other layers stay where they were dropped, so the path leaves a spaced trail.
    // Layers are only placed by advance() and settle(): continuous pointer-following tweens would
    // pull the whole stack onto the pointer and close those gaps.
    enablePointer() {
      const { signal } = this.controller;
      this.addEventListener('pointerenter', (event) => this.onPointerEnter(event), { signal, passive: true });
      this.addEventListener('pointermove', (event) => this.updatePointer(event), { signal, passive: true });
      this.addEventListener('pointerleave', () => this.settle(), { signal });
    }

    enableTouch() {
      const { signal } = this.controller;
      this.addEventListener('pointerup', (event) => {
        if (!event.target.closest('a, button')) this.advance();
      }, { signal });
    }

    onPointerEnter(event) {
      this.settleTweens.forEach((tween) => tween.kill());
      this.settleTweens = [];
      this.updatePointer(event, false);
    }

    updatePointer(event, allowAdvance = true) {
      const rect = this.getBoundingClientRect();
      this.currentPoint = {
        x: event.clientX - rect.left - rect.width * 0.69,
        y: event.clientY - rect.top - rect.height * 0.5,
      };

      if (!allowAdvance || !this.lastPoint) {
        this.lastPoint = { x: event.clientX, y: event.clientY };
        return;
      }

      const distance = Math.hypot(event.clientX - this.lastPoint.x, event.clientY - this.lastPoint.y);
      if (distance >= (Number(this.dataset.threshold) || 56)) {
        this.advance();
        this.lastPoint = { x: event.clientX, y: event.clientY };
      }
    }

    advance() {
      const layer = this.layers[this.activeIndex];
      const offset = this.activeIndex - ((this.layers.length - 1) / 2);
      this.zIndex += 1;
      const position = this.currentPoint
        ? { x: this.currentPoint.x + offset * 12, y: this.currentPoint.y - offset * 8 }
        : {};
      window.gsap.set(layer, { ...position, zIndex: this.zIndex });
      window.gsap.fromTo(layer, { scale: 0.96 }, { scale: 1, duration: 0.38, ease: 'power3.out', overwrite: 'auto' });
      this.activeIndex = (this.activeIndex - 1 + this.layers.length) % this.layers.length;
    }

    settle() {
      this.lastPoint = null;
      this.currentPoint = null;
      this.settleTweens.forEach((tween) => tween.kill());
      this.settleTweens = this.layers.map((layer, index) => {
        const offset = index - ((this.layers.length - 1) / 2);
        return window.gsap.to(layer, {
          x: offset * 12,
          y: offset * -8,
          rotation: offset * 1.6,
          duration: 0.7,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      });
    }

    resetListeners() {
      this.controller?.abort();
      this.controller = new AbortController();
      this.lastPoint = null;
      this.settleTweens?.forEach((tween) => tween.kill());
      this.settleTweens = [];
      this.currentPoint = null;
    }

    destroy() {
      this.media?.revert();
      this.controller?.abort();
      this.media = null;
      this.controller = null;
      this.settleTweens?.forEach((tween) => tween.kill());
      this.settleTweens = [];
      if (this.layers && window.gsap) window.gsap.killTweensOf(this.layers);
    }
  }

  if (!customElements.get('kinetic-hero')) customElements.define('kinetic-hero', KineticHero);
})();
