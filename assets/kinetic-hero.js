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

    enablePointer() {
      const { gsap } = window;
      const { signal } = this.controller;
      this.followers = this.layers.map((layer, index) => {
        const offset = index - ((this.layers.length - 1) / 2);
        const lag = this.layers.length - 1 - index;
        return {
          layer,
          offset,
          x: gsap.quickTo(layer, 'x', { duration: 0.18 + lag * 0.055, ease: 'power3.out' }),
          y: gsap.quickTo(layer, 'y', { duration: 0.18 + lag * 0.055, ease: 'power3.out' }),
        };
      });

      this.followers.forEach((follow) => {
        follow.x(follow.offset * 12);
        follow.x.tween.progress(1);
        follow.y(follow.offset * -8);
        follow.y.tween.progress(1);
      });
      this.addEventListener('pointerenter', (event) => this.onPointerEnter(event), { signal, passive: true });
      this.addEventListener('pointermove', (event) => this.onPointerMove(event), { signal, passive: true });
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
      this.updatePointer(event, false, true);
    }

    updatePointer(event, allowAdvance = true, immediate = false) {
      const rect = this.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width * 0.69;
      const y = event.clientY - rect.top - rect.height * 0.5;
      this.currentPoint = { x, y };
      this.followers.forEach((follow) => {
        const layerX = x + follow.offset * 12;
        const layerY = y - follow.offset * 8;
        if (immediate) {
          follow.x(layerX);
          follow.x.tween.progress(1);
          follow.y(layerY);
          follow.y.tween.progress(1);
        } else {
          follow.x(layerX);
          follow.y(layerY);
        }
      });

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

    onPointerMove(event) {
      this.updatePointer(event);
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
      this.followers = null;
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
