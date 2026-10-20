// src/themes/xp/screen-fx.ts — the XP desktop's screen effects: the scanline
// overlay (./scanlines.ts) and the CRT glitches (installCrtFx in
// ./desktop.ts). Never under prefers-reduced-motion. Start > Settings >
// "Screen effects" switches them off and on (WCAG 2.2.2); the choice persists
// in localStorage, like the single-key shortcuts switch (./shortcuts.ts).
import { installScanlines, stopScanlines } from './scanlines';
import { installCrtFx, stopCrtFx } from './desktop';

export const FX_STORAGE = 'krizdingus-xp-fx';

export function screenFxEnabled(): boolean {
  try {
    return localStorage.getItem(FX_STORAGE) !== 'off';
  } catch {
    return true;
  }
}

// Session fallback when localStorage throws.
let fxOverride: boolean | null = null;
const fxOn = (): boolean => fxOverride ?? screenFxEnabled();

const reduced = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The Settings row: checked while the effects run; disabled (and unchecked)
 *  while the system asks for reduced motion, since they never run then. */
function syncRow(): void {
  const off = reduced();
  document.querySelectorAll<HTMLElement>('[data-menu-action="fx-toggle"]').forEach((row) => {
    const on = !off && fxOn();
    row.setAttribute('aria-checked', String(on));
    const chk = row.querySelector('.chk');
    if (chk) chk.textContent = on ? '✓' : '';
    if (off) {
      row.setAttribute('aria-disabled', 'true');
      row.title = 'Off while your system asks for reduced motion';
    } else {
      row.removeAttribute('aria-disabled');
      row.removeAttribute('title');
    }
  });
}

function start(signal?: AbortSignal): void {
  if (reduced() || signal?.aborted) return;
  installScanlines(signal);
  installCrtFx(signal);
}

function stop(): void {
  stopScanlines();
  stopCrtFx();
}

export function setScreenFxEnabled(on: boolean, signal?: AbortSignal): void {
  try {
    if (on) localStorage.removeItem(FX_STORAGE);
    else localStorage.setItem(FX_STORAGE, 'off');
  } catch { /* private mode: the switch still works for this page */ }
  fxOverride = on;
  if (on) start(signal);
  else stop();
  syncRow();
}

export function installScreenFx(signal: AbortSignal): void {
  fxOverride = null;
  if (fxOn()) start(signal);
  syncRow();
  document.addEventListener('shell:fx-toggle', () => {
    if (reduced()) return;
    setScreenFxEnabled(!fxOn(), signal);
  }, { signal });
  window.matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener?.('change', () => syncRow(), { signal });
}
