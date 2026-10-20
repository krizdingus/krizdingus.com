// src/themes/xp/windows.ts
// Window manager: focus + constrained drag for .os-shell and floating .app-window.
// The .os-shell's baseline CSS pins both
// `top` and `bottom`, so dragging must convert it to a fully-fixed box (width
// and height pinned in px, right/bottom/margin nulled) before moving, otherwise
// the window shrinks vertically as you drag down. The drag itself clamps the
// window's bottom edge to the top of the taskbar so it bumps cleanly.

const Z_BASE = 30;
const TASKBAR_H_DESKTOP = 48;
const TASKBAR_H_MOBILE = 44;
const MIN_HANDLE_VISIBLE = 60; // keep at least this much title-bar grabbable

interface DragState {
  el: HTMLElement;
  handle: HTMLElement;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
}

let installed = false;
let topZ = Z_BASE;
let dragState: DragState | null = null;

function managedWindows(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.app-window, .os-shell'));
}

function taskbarHeight(): number {
  // Embed and non-desktop pages have no taskbar.
  if (!document.body.classList.contains('has-desktop')) return 0;
  // Measure the real bar (40px on desktop today) so a maximized window
  // butts against it; the constants are only a fallback when it can't be
  // measured (not laid out yet, or a DOM without layout).
  const bar = document.querySelector<HTMLElement>('.desktop-taskbar');
  const h = bar ? Math.round(bar.getBoundingClientRect().height) : 0;
  if (h > 0) return h;
  return window.innerWidth <= 900 ? TASKBAR_H_MOBILE : TASKBAR_H_DESKTOP;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// Constrain (x,y) so the window stays within the viewport. The taskbar is a
// hard floor — the window's BOTTOM edge stops at the top of the taskbar.
function constrainPosition(el: HTMLElement, x: number, y: number): { x: number; y: number } {
  const tb = taskbarHeight();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = el.getBoundingClientRect();
  const w = r.width;
  const h = r.height;
  const minX = -(w - MIN_HANDLE_VISIBLE);
  const maxX = vw - MIN_HANDLE_VISIBLE;
  const minY = 0;
  let maxY = vh - tb - h;
  if (maxY < minY) maxY = minY;
  return { x: clamp(x, minX, maxX), y: clamp(y, minY, maxY) };
}

function reconstrain(el: HTMLElement): void {
  if (!el) return;
  if (el.classList.contains('is-maximized')) return;
  if (el.classList.contains('is-minimized')) return;
  const cs = window.getComputedStyle(el);
  if (cs.position !== 'fixed' && cs.position !== 'absolute') return;
  const left = parseFloat(el.style.left);
  const top = parseFloat(el.style.top);
  if (isNaN(left) || isNaN(top)) return;
  const p = constrainPosition(el, left, top);
  el.style.left = `${p.x}px`;
  el.style.top = `${p.y}px`;
}

function focus(el: HTMLElement): void {
  if (!el) return;
  // Promote above the highest existing window. Some .app-window variants
  // ship with a higher baseline z-index (e.g. 35) in CSS, so just bumping
  // topZ isn't enough — scan first.
  let highest = topZ;
  managedWindows().forEach((w) => {
    const z = parseInt(window.getComputedStyle(w).zIndex, 10);
    if (!isNaN(z) && z > highest) highest = z;
  });
  topZ = highest + 1;
  el.style.zIndex = String(topZ);
  el.classList.add('is-focused');
  managedWindows().forEach((w) => {
    if (w !== el) w.classList.remove('is-focused');
  });
}

/** A window leaves the front (minimize, close): like XP, the topmost window
 *  still on screen becomes the active one, so a title bar and a taskbar tile
 *  always show which window has the desktop. Keyboard focus is not moved. */
function blur(el: HTMLElement): void {
  el.classList.remove('is-focused');
  let next: HTMLElement | null = null;
  let nextZ = -Infinity;
  managedWindows().forEach((w) => {
    if (w === el || !w.isConnected || w.classList.contains('is-minimized')) return;
    const cs = window.getComputedStyle(w);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const z = parseInt(cs.zIndex, 10);
    const zz = isNaN(z) ? 0 : z;
    if (zz > nextZ) { next = w; nextZ = zz; }
  });
  if (next) focus(next);
}

/** The window a taskbar button stands for: an app tile names its app, the
 *  Krizscape tile ([data-desktop-action="restore"]) stands for .os-shell. */
function windowForTile(btn: HTMLElement): HTMLElement | null {
  const app = btn.dataset.tbApp;
  if (app) return document.querySelector<HTMLElement>(`.app-window[data-app="${app}"]`);
  if (btn.dataset.desktopAction === 'restore') return document.querySelector<HTMLElement>('.os-shell');
  return null;
}

/** Press the taskbar tile of the front window (is-focused and on screen);
 *  every other tile stays raised. */
function syncTaskbarFocus(): void {
  document.querySelectorAll<HTMLElement>('.desktop-taskbar .tb-window').forEach((btn) => {
    const win = windowForTile(btn);
    const front = !!win && win.isConnected
      && win.classList.contains('is-focused')
      && !win.classList.contains('is-minimized');
    if (btn.classList.contains('is-focused') !== front) btn.classList.toggle('is-focused', front);
  });
}

function shouldIgnoreDrag(e: PointerEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return true;
  return !!target.closest(
    '.window-controls, .app-windowctrls, .window-btn, .app-wbtn, button, a, input, select, textarea, [contenteditable]',
  );
}

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0) return;
  const target = e.target as HTMLElement | null;
  if (!target) return;
  const handle = target.closest<HTMLElement>('.title-bar, .app-titlebar');
  if (!handle) return;
  const el = handle.parentElement?.closest<HTMLElement>('.os-shell, .app-window')
    ?? handle.closest<HTMLElement>('.os-shell, .app-window');
  if (!el) return;
  if (el.classList.contains('is-maximized')) return;
  if (el.classList.contains('is-minimized')) return;
  if (shouldIgnoreDrag(e)) return;

  const r = el.getBoundingClientRect();

  // Convert to a fully-fixed box at its current position. Without pinning
  // width AND height, the .os-shell's baseline CSS (which sets top + bottom
  // + width + margin:0 auto) re-asserts as soon as we null right/bottom and
  // the window shrinks. Same trap on .app-window.kw-app.
  el.style.position = 'fixed';
  el.style.left = `${r.left}px`;
  el.style.top = `${r.top}px`;
  el.style.right = 'auto';
  el.style.bottom = 'auto';
  el.style.margin = '0';
  el.style.width = `${r.width}px`;
  el.style.height = `${r.height}px`;

  dragState = {
    el,
    handle,
    startClientX: e.clientX,
    startClientY: e.clientY,
    originX: r.left,
    originY: r.top,
  };
  handle.classList.add('is-dragging');
  focus(el);
  try {
    handle.setPointerCapture(e.pointerId);
  } catch {
    /* happy-dom / unsupported envs — non-fatal */
  }
  e.preventDefault();
}

function onPointerMove(e: PointerEvent): void {
  if (!dragState) return;
  const dx = e.clientX - dragState.startClientX;
  const dy = e.clientY - dragState.startClientY;
  const p = constrainPosition(dragState.el, dragState.originX + dx, dragState.originY + dy);
  dragState.el.style.left = `${p.x}px`;
  dragState.el.style.top = `${p.y}px`;
}

function onPointerUp(_e: PointerEvent): void {
  if (!dragState) return;
  const { el, handle } = dragState;
  dragState = null;
  handle.classList.remove('is-dragging');
  reconstrain(el);
  try {
    el.dispatchEvent(new CustomEvent('kw:dragend'));
  } catch {
    /* non-fatal */
  }
}

declare global {
  interface Window {
    KrizWM: {
      focus: (el: HTMLElement) => void;
      blur: (el: HTMLElement) => void;
      reconstrain: (el: HTMLElement) => void;
      constrainPosition: (el: HTMLElement, x: number, y: number) => { x: number; y: number };
      taskbarHeight: () => number;
    };
  }
}

/** The title bar's Maximize button turns into Restore (two overlapping
 *  windows, and the label to match) while its window fills the screen, and
 *  back again. `name` is the window's name for the accessible label. */
export function syncMaxButton(btn: Element | null | undefined, maximized: boolean, name = ''): void {
  if (!btn) return;
  const verb = maximized ? 'Restore' : 'Maximize';
  btn.setAttribute('aria-label', name ? `${verb} ${name}` : verb);
  btn.setAttribute('title', verb);
  const glyph = btn.querySelector('.win-glyph');
  glyph?.classList.toggle('win-glyph-max', !maximized);
  glyph?.classList.toggle('win-glyph-restore', maximized);
}

export function installWindows(signal?: AbortSignal): void {
  if (installed) return;
  installed = true;
  signal?.addEventListener('abort', () => {
    installed = false;
    dragState = null;
  });

  document.addEventListener('pointerdown', onPointerDown, { signal });
  document.addEventListener('pointermove', onPointerMove, { signal });
  document.addEventListener('pointerup', onPointerUp, { signal });
  document.addEventListener('pointercancel', onPointerUp, { signal });

  // Click anywhere inside a window to focus it. Capture phase so menus/inputs
  // don't swallow the event before focus runs.
  document.addEventListener(
    'mousedown',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const win = target.closest<HTMLElement>('.os-shell, .app-window');
      if (win) focus(win);
    },
    { capture: true, signal },
  );

  // Double-click a title bar to maximize or restore, like the period's
  // window managers. It presses the window's own Maximize/Restore button, so
  // the button's label and glyph stay in step with the window.
  document.addEventListener('dblclick', (e) => {
    const target = e.target as HTMLElement | null;
    const handle = target?.closest<HTMLElement>('.title-bar, .app-titlebar');
    if (!handle || target!.closest('.window-controls, .app-windowctrls, button, a, input, select, textarea')) return;
    const el = handle.closest<HTMLElement>('.os-shell, .app-window');
    if (!el || el.classList.contains('is-minimized')) return;
    handle.querySelector<HTMLButtonElement>('[data-window-action="maximize"], [data-act="max"]')?.click();
  }, { signal });

  window.addEventListener('resize', () => {
    managedWindows().forEach(reconstrain);
  }, { signal });

  // Focus, minimize, restore and close all show up as class or child-list
  // changes on the windows, whichever module makes them (apps.ts,
  // os-chrome.ts, this file): watch those and keep the taskbar in step.
  let queued = false;
  const observer = new MutationObserver((records) => {
    const relevant = records.some((r) => r.type === 'childList'
      || (r.target as Element).matches?.('.os-shell, .app-window'));
    if (!relevant || queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; syncTaskbarFocus(); });
  });
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  signal?.addEventListener('abort', () => observer.disconnect(), { once: true });
  syncTaskbarFocus();

  window.KrizWM = { focus, blur, reconstrain, constrainPosition, taskbarHeight };
  // No globals outlive the theme: unmount aborts the signal.
  signal?.addEventListener('abort', () => {
    Reflect.deleteProperty(window, 'KrizWM');
  }, { once: true });
}
