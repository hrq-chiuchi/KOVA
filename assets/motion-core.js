(() => {
  const scopes = new Map();
  let registered = false;

  function dependenciesAvailable() {
    return Boolean(window.gsap && window.ScrollTrigger);
  }

  function destroyScope(scope) {
    const record = scopes.get(scope);
    if (!record) return;
    record.media.revert();
    scopes.delete(scope);
    scope.removeAttribute('data-motion-ready');
  }

  function initScope(scope) {
    destroyScope(scope);
    if (!dependenciesAvailable()) return;

    if (!registered) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      registered = true;
    }

    const { gsap } = window;
    const media = gsap.matchMedia();
    scope.setAttribute('data-motion-ready', '');

    media.add(
      {
        desktop: '(min-width: 768px)',
        mobile: '(max-width: 767px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { desktop, reduceMotion } = context.conditions;
        const hero = scope.querySelector('[data-reveal="hero"]');
        const sectionReveals = Array.from(scope.querySelectorAll('[data-reveal="section"]'));
        const cards = Array.from(scope.querySelectorAll('[data-reveal-card]'));
        const parallaxTargets = Array.from(scope.querySelectorAll('[data-parallax]'));

        if (reduceMotion) {
          gsap.set(scope.querySelectorAll('[data-reveal-line], [data-reveal-item], [data-reveal-card], [data-parallax]'), {
            clearProps: 'all',
          });
          return;
        }

        if (hero) {
          const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
          const eyebrow = hero.querySelector('[data-reveal-item="eyebrow"]');
          const lines = hero.querySelectorAll('[data-reveal-line]');
          const details = hero.querySelectorAll('[data-reveal-item="detail"]');

          if (eyebrow) timeline.from(eyebrow, { autoAlpha: 0, y: 16, duration: 0.6 });
          if (lines.length) {
            timeline.from(lines, { yPercent: 112, duration: 1.05, stagger: 0.09 }, eyebrow ? '<0.08' : 0);
          }
          if (details.length) {
            timeline.from(details, { autoAlpha: 0, y: 20, duration: 0.7, stagger: 0.08 }, '-=0.52');
          }
        }

        sectionReveals.forEach((element) => {
          const lines = element.querySelectorAll('[data-reveal-line]');
          if (!lines.length) return;
          gsap.from(lines, {
            yPercent: 110,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 82%',
              once: true,
            },
          });
        });

        if (cards.length) {
          gsap.from(cards, {
            autoAlpha: 0,
            y: desktop ? 48 : 24,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cards[0].parentElement,
              start: 'top 82%',
              once: true,
            },
          });
        }

        if (desktop) {
          parallaxTargets.forEach((target) => {
            const amount = Math.max(0, Math.min(24, Number(target.dataset.motionSpeed) || 10));
            gsap.fromTo(
              target,
              { yPercent: -amount },
              {
                yPercent: amount,
                ease: 'none',
                scrollTrigger: {
                  trigger: target.closest('[data-motion-scope]') || target,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.8,
                },
              },
            );
          });
        }
      },
      scope,
    );

    scopes.set(scope, { media });
  }

  function motionScopesWithin(root) {
    const found = [];
    if (root instanceof Element && root.matches('[data-motion-scope]')) found.push(root);
    root.querySelectorAll?.('[data-motion-scope]').forEach((scope) => found.push(scope));
    return found;
  }

  function init(root = document) {
    motionScopesWithin(root).forEach(initScope);
  }

  function destroy(root = document) {
    for (const scope of Array.from(scopes.keys())) {
      if (scope === root || root === document || root.contains?.(scope)) destroyScope(scope);
    }
  }

  function refresh() {
    if (dependenciesAvailable()) window.ScrollTrigger.refresh();
  }

  window.AfterdarkMotion = { init, destroy, refresh };
})();
