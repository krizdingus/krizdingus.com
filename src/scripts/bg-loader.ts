// src/scripts/bg-loader.ts
// Fetches the background pixels (bg-field.ts, its own small chunk) only once
// the page has loaded and the browser is idle, and only when the window
// leaves room beside the column for them in normal mode. Phones and narrow
// windows never download it; a window that grows later still gets it, and so
// does a visitor who leaves a theme for normal mode.

/** Each gutter needs this much room, px. */
const MIN_GUTTER = 160;

export function installBgField(): void {
  const R = document.documentElement;
  let asked = false;
  const check = () => {
    if (asked || R.hasAttribute('data-skin') || R.hasAttribute('data-skin-pending')) return;
    const site = document.querySelector<HTMLElement>('.site');
    if (!site || R.clientWidth - site.offsetWidth < 2 * MIN_GUTTER) return;
    asked = true;
    window.removeEventListener('resize', check);
    document.removeEventListener('skin:change', check);
    void import('./bg-field').then((m) => m.bgField(MIN_GUTTER));
  };
  const start = () => {
    const go = () => {
      window.addEventListener('resize', check, { passive: true });
      document.addEventListener('skin:change', check);
      check();
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 2000 });
    else window.setTimeout(go, 1);
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
