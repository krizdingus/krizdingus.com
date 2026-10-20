// src/themes/xp/os-chrome.ts
// The Krizscape window's behaviour: minimize, maximize, close (detach) and
// relaunch from the desktop, plus reboot. Driven by shell:* events on
// document so desktop icons, the taskbar and the Start menu share one path.
import { playBoot, BOOTED_KEY } from './boot';
import { syncMaxButton } from './windows';

let shellRef: HTMLElement | null = null;
let tileRef: HTMLElement | null = null;
let shellHome: Comment | null = null;
let tileHome: Comment | null = null;

function getShell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.os-shell');
}

function getTaskbarTile(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.desktop-taskbar .tb-window[data-desktop-action="restore"]');
}

function minimize(): void {
  const shell = getShell();
  if (!shell) return;
  const hadFocus = shell.contains(document.activeElement);
  shell.classList.add('is-minimized');
  shell.setAttribute('aria-hidden', 'true');
  window.KrizWM?.blur?.(shell);
  const tile = getTaskbarTile();
  if (tile) {
    tile.classList.remove('is-active');
    tile.setAttribute('aria-pressed', 'false');
  }
  // Focus can't stay inside a hidden window: hand it to the taskbar button
  // that brings the window back.
  if (hadFocus) tile?.focus({ preventScroll: true });
}

function restore(): void {
  const shell = getShell();
  if (!shell) {
    launchShell();
    return;
  }
  shell.classList.remove('is-minimized');
  shell.removeAttribute('aria-hidden');
  const tile = getTaskbarTile();
  if (tile) {
    tile.classList.add('is-active');
    tile.setAttribute('aria-pressed', 'true');
  }
  window.KrizWM?.focus?.(shell);
}

/** Close = take the window off the screen, keeping the node (and its page
 *  state) so relaunch brings back exactly what was there. */
function closeShell(): void {
  const shell = getShell();
  if (!shell) return;
  const hadFocus = shell.contains(document.activeElement);
  shellRef = shell;
  window.KrizWM?.blur?.(shell);
  shellHome = document.createComment('krizscape');
  shell.before(shellHome);
  shell.remove();
  const tile = getTaskbarTile();
  if (tile) {
    tileRef = tile;
    tileHome = document.createComment('krizscape-tile');
    tile.before(tileHome);
    tile.remove();
  }
  // The desktop icon that relaunches the window takes focus when it goes.
  if (hadFocus) document.querySelector<HTMLElement>('[data-shell-launch]')?.focus({ preventScroll: true });
}

function launchShell(): void {
  if (!shellRef || !shellHome) return;
  shellHome.replaceWith(shellRef);
  if (tileRef && tileHome) tileHome.replaceWith(tileRef);
  const shell = shellRef;
  shellRef = tileRef = null;
  shellHome = tileHome = null;
  shell.classList.remove('is-minimized');
  shell.removeAttribute('aria-hidden');
  window.KrizWM?.focus?.(shell);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shell.classList.add('is-relaunching');
    setTimeout(() => shell.classList.remove('is-relaunching'), 400);
  }
}

/** Unmount: if the window was closed, put it back so the theme can restore the page. */
export function reattachShell(): void {
  if (shellRef && shellHome) launchShell();
}

// The mount's signal. A reboot's power-off delay dies with it, so exiting
// XP mode mid-reboot can never start the boot over normal mode.
let chromeSignal: AbortSignal | undefined;

const CLOSE_MS = 220; // .os-shell.is-closing (windowClose)
const BLACKOUT_MS = 400; // .crt-blackout scan collapse + phosphor dot

/** Reboot: power-off (the window zooms shut, then the screen goes black with
 *  a CRT scan-line collapse), then the boot, splash and reveal. Reduced
 *  motion goes straight to playBoot, which skips the cinematic itself. */
function reboot(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const signal = chromeSignal;
  if (signal?.aborted) return;
  // Already powering off: one reboot at a time.
  if (getShell()?.classList.contains('is-closing')) return;
  restore();
  if (reduced) {
    void playBoot();
    return;
  }
  const shell = getShell();
  shell?.classList.add('is-closing');
  let blackout: HTMLElement | null = null;
  const timers: number[] = [];
  const cleanup = (): void => {
    timers.forEach((t) => clearTimeout(t));
    shell?.classList.remove('is-closing');
    blackout?.remove();
    blackout = null;
    signal?.removeEventListener('abort', cleanup);
  };
  signal?.addEventListener('abort', cleanup, { once: true });
  timers.push(window.setTimeout(() => {
    blackout = document.createElement('div');
    blackout.className = 'crt-blackout';
    blackout.setAttribute('aria-hidden', 'true');
    document.body.appendChild(blackout);
    timers.push(window.setTimeout(() => blackout?.classList.add('is-dotting'), 240));
  }, CLOSE_MS));
  timers.push(window.setTimeout(() => {
    const live = !signal?.aborted && document.body.classList.contains('has-desktop');
    // playBoot puts its overlay up synchronously (and hides the window
    // behind body.is-staging), so the black frame can go right after.
    if (live) void playBoot();
    cleanup();
  }, CLOSE_MS + BLACKOUT_MS));
}

// A dragged window carries its box as inline px (windows.ts), which would
// beat the .is-maximized rules. Maximize parks those values and Restore puts
// them back, so the window returns to where it was dragged.
const SHELL_BOX = ['position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'margin'] as const;
const parkedBox = new WeakMap<HTMLElement, Record<string, string>>();

function toggleShellMax(shell: HTMLElement, btn: HTMLButtonElement): void {
  const goingMax = !shell.classList.contains('is-maximized');
  if (goingMax) {
    const box: Record<string, string> = {};
    SHELL_BOX.forEach((p) => {
      const v = shell.style.getPropertyValue(p);
      if (v) box[p] = v;
      shell.style.removeProperty(p);
    });
    parkedBox.set(shell, box);
  } else {
    const box = parkedBox.get(shell);
    parkedBox.delete(shell);
    if (box) Object.entries(box).forEach(([p, v]) => shell.style.setProperty(p, v));
  }
  shell.classList.toggle('is-maximized', goingMax);
  syncMaxButton(btn, goingMax);
  window.KrizWM?.focus?.(shell);
}

export function wireShell(shell: HTMLElement, signal?: AbortSignal): void {
  const on = { signal };
  shell.querySelectorAll<HTMLButtonElement>('.title-bar .window-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-window-action');
      if (action === 'minimize') minimize();
      else if (action === 'maximize') toggleShellMax(shell, btn);
      else if (action === 'close') closeShell();
    }, on);
  });
}

export function installOSChrome(signal?: AbortSignal): void {
  const on = { signal };
  chromeSignal = signal;
  document.addEventListener('shell:minimize', minimize, on);
  document.addEventListener('shell:restore', restore, on);
  document.addEventListener('shell:close', closeShell, on);
  document.addEventListener('shell:reboot', reboot, on);
  // In-page reboot eggs (home's KzEggs) use the same data-menu-action as the
  // Start menu row; the Start menu dispatches its own event.
  document.addEventListener('click', (e) => {
    const t = (e.target as Element | null)?.closest?.('[data-menu-action="reboot"]');
    if (t && !t.closest('#start-menu')) reboot();
  }, on);
  // "Reboot home" links (the 404 page): the next page boots from scratch.
  document.addEventListener('click', (e) => {
    if (!(e.target as Element | null)?.closest?.('[data-reboot-home]')) return;
    try {
      localStorage.removeItem(BOOTED_KEY);
    } catch {
      /* storage disabled — the link still goes home */
    }
  }, on);
  // Keyboard shortcuts live in ./shortcuts.ts.
}

// Exposed for tests
export const __internals = { minimize, restore, closeShell, launchShell, reboot };
