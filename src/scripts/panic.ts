// /panic: the fake blue screen. A percentage counter climbs in uneven
// chunks (the way the real ones do) and restarts to the home page at 100%.
// Any key restarts sooner; a button stops the countdown (WCAG 2.2.1: a
// time limit the visitor can turn off). No flashing anywhere: the only
// motion is a 1 Hz cursor blink, and reduced motion drops even that.

/** Percent shown at each tick. Repeats are the stalls. */
export const STEPS: readonly number[] = [
  0, 4, 9, 9, 17, 23, 23, 23, 31, 44, 48, 48, 57, 66, 71, 71, 85, 93, 99, 99, 100,
];
/** Milliseconds between ticks: 20 ticks ≈ 17 s from 0% to the restart. */
export const STEP_MS = 850;

/** Replaces the auto-restart line once the countdown is stopped. */
export const STOPPED_LINE = 'It won’t restart on its own anymore.';

/** Theme storage the restart touches (see src/themes/README.md). */
const SKIN_KEY = 'krizdingus-skin';
const XP_BOOTED_KEY = 'krizdingus-xp-booted';

const IGNORED_KEYS = new Set([
  'Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn', 'FnLock',
  'NumLock', 'ScrollLock', 'OS', 'Hyper', 'Super', 'ContextMenu', 'Dead', 'Unidentified',
]);

interface KeyLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
}

/**
 * Does this keypress restart? "Any key" means any key a person would press
 * to get out: not Tab (keyboard users need it to reach the controls), not a
 * lone modifier, not a browser shortcut, and not Enter/Space on a focused
 * control (those activate the control instead).
 */
export function isRestartKey(e: KeyLike, target: EventTarget | null = null): boolean {
  if (e.repeat) return false;
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  if (IGNORED_KEYS.has(e.key)) return false;
  const el = target as Element | null;
  if (el && typeof el.closest === 'function' && el.closest('a, button, input, select, textarea, [contenteditable]')) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') return false;
  }
  return true;
}

/** The text-mode bar: `width` cells, filled to `pct`. */
export function barText(pct: number, width = 20): string {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export interface PanicHandle {
  restart(): void;
  stop(): void;
  readonly stopped: boolean;
  readonly percent: number;
}

/**
 * Wire up the page. `go` is the navigation (swappable in tests).
 * Returns a handle for tests; the page ignores it.
 */
export function initPanic(
  root: ParentNode = document,
  go: (url: string) => void = (url) => location.assign(url),
): PanicHandle | null {
  const count = root.querySelector<HTMLElement>('[data-panic-count]');
  if (!count) return null;
  const bar = root.querySelector<HTMLElement>('[data-panic-bar]');
  const stopBtn = root.querySelector<HTMLButtonElement>('[data-panic-stop]');
  const status = root.querySelector<HTMLElement>('[data-panic-status]');
  const home = root.querySelector<HTMLAnchorElement>('[data-panic-home]');
  const autoLine = root.querySelector<HTMLElement>('[data-panic-auto]');
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let i = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let leaving = false;

  const render = () => {
    const pct = STEPS[i];
    count.textContent = String(pct);
    if (bar) bar.textContent = barText(pct);
  };

  const restart = () => {
    if (leaving) return;
    leaving = true;
    if (timer) clearTimeout(timer);
    // A restart is a restart: in XP mode, the home page plays the boot again.
    try {
      if (localStorage.getItem(SKIN_KEY) === 'xp') localStorage.removeItem(XP_BOOTED_KEY);
    } catch { /* storage blocked: the theme just skips the boot */ }
    document.documentElement.classList.add('is-restarting');
    if (reduced) go('/');
    else setTimeout(() => go('/'), 280);
  };

  const tick = () => {
    if (stopped || leaving) return;
    if (i >= STEPS.length - 1) {
      restart();
      return;
    }
    i += 1;
    render();
    timer = setTimeout(tick, STEP_MS);
  };

  const stop = () => {
    if (stopped || leaving) return;
    stopped = true;
    if (timer) clearTimeout(timer);
    if (status) status.textContent = `Stopped at ${STEPS[i]}%.`;
    // The "it restarts on its own" promise is no longer true.
    if (autoLine) autoLine.textContent = STOPPED_LINE;
    if (stopBtn) stopBtn.disabled = true;
    home?.focus(); // the disabled button can't keep focus
    document.documentElement.classList.add('is-stopped');
  };

  render();
  timer = setTimeout(tick, STEP_MS);

  document.addEventListener('keydown', (e) => {
    if (!isRestartKey(e, e.target)) return;
    e.preventDefault();
    restart();
  });
  stopBtn?.addEventListener('click', stop);
  home?.addEventListener('click', (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    restart();
  });

  return {
    restart,
    stop,
    get stopped() { return stopped; },
    get percent() { return STEPS[i]; },
  };
}
