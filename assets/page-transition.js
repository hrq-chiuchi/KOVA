/*
 * Corrupted-signal page transition: navigation typing and shared product media.
 * Loaded synchronously in <head> because `pagereveal` fires before deferred scripts run.
 * Everything here is enhancement: without cross-document view transitions, nothing runs.
 */
(() => {
  if (!('PageRevealEvent' in window) && !('PageSwapEvent' in window)) return;

  const MEDIA_NAME = 'kova-product-media';
  let lastCard = null;

  const productHandle = (url) => {
    try {
      const match = new URL(url, location.href).pathname.match(/\/products\/([^/]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (_) {
      return null;
    }
  };

  // A duplicated view-transition-name aborts the transition, so only one element may carry it.
  const clearNames = () => {
    document.querySelectorAll('[data-transition-named]').forEach((element) => {
      element.style.viewTransitionName = '';
      element.removeAttribute('data-transition-named');
    });
  };

  const nameElement = (element) => {
    clearNames();
    element.style.viewTransitionName = MEDIA_NAME;
    element.setAttribute('data-transition-named', '');
  };

  // Remember which card was actually used, since recommendations and compatibility can repeat a product.
  document.addEventListener('click', (event) => {
    lastCard = event.target.closest?.('.product-card') || null;
  }, { capture: true });

  window.addEventListener('pageswap', (event) => {
    const transition = event.viewTransition;
    if (!transition) return;
    const handle = productHandle(event.activation?.entry?.url);
    if (!handle) return;

    const matches = (media) => productHandle(media.href) === handle;
    let media = lastCard?.querySelector('.product-card__media');
    if (!media || !matches(media)) {
      media = Array.from(document.querySelectorAll('.product-card__media')).find(matches);
    }
    if (!media) return;

    // Hand an in-flight WebGL hover back to the DOM image so the snapshot is not a half-drawn shader frame.
    if (media.classList.contains('is-webgl-animating')) window.AfterdarkWebGL?.destroy(media);
    nameElement(media);
  });

  window.addEventListener('pagereveal', (event) => {
    const transition = event.viewTransition;
    if (!transition) return;
    const activation = window.navigation?.activation;

    if (activation?.navigationType === 'traverse') transition.types.add('back');

    const here = productHandle(location.href);
    if (here && productHandle(activation?.from?.url) !== here) {
      const primary = document.querySelector('.product-page__media--primary');
      if (primary) nameElement(primary);
    }

    transition.finished.finally(clearNames);
  });

  // Pages restored from the back/forward cache keep their inline names and paused effects.
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    clearNames();
    window.AfterdarkWebGL?.init(document);
  });
})();
