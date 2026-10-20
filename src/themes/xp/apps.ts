// src/themes/xp/apps.ts — floating mini-app windows on the XP desktop.
// KrizApps.open(key) builds a window whose body is an iframe of
// /apps/<slug>/embed/, adds a taskbar button, and remembers it in
// sessionStorage so the window comes back on the next page.
import { getApp, type AppRegistryEntry } from './apps-registry';
import { syncMaxButton } from './windows';

const SS_OPEN = 'krizdingus-open-apps';
/** A new window sits this far right of the Krizscape window (a Win9x cascade). */
const CASCADE_X = 24;
/** Narrower than this and the window is centered instead of cascaded: the
 *  player's two-column layout needs a frame wider than 880px (MediaKruzer.astro). */
const MIN_CASCADE_W = 900;

interface AppSessionEntry {
  open: boolean;
  min: boolean;
  x?: number;
  y?: number;
}

export interface OpenOptions {
  /** Move keyboard focus into the window (default true). Restores after a
   *  page load pass false, so arriving on a page never steals focus. */
  focus?: boolean;
}

declare global {
  interface Window {
    KrizApps: {
      open: (key: string, opts?: OpenOptions) => HTMLElement | null;
      close: (key: string) => void;
      minimize: (key: string, on?: boolean) => void;
      toggleMax: (key: string) => void;
    };
  }
}

function readState(): Record<string, AppSessionEntry> {
  try {
    const s = sessionStorage.getItem(SS_OPEN);
    return s ? (JSON.parse(s) as Record<string, AppSessionEntry>) : {};
  } catch {
    return {};
  }
}

function writeState(s: Record<string, AppSessionEntry>): void {
  try {
    sessionStorage.setItem(SS_OPEN, JSON.stringify(s));
  } catch {
    /* storage disabled — non-fatal */
  }
}

function patchState(key: string, patch: Partial<AppSessionEntry>): void {
  const s = readState();
  s[key] = Object.assign({ open: false, min: false }, s[key] ?? {}, patch);
  writeState(s);
}

function clearAppState(key: string): void {
  const s = readState();
  delete s[key];
  writeState(s);
}

function existingWindow(key: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`.app-window[data-app="${key}"]`);
}

function taskbarEl(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.desktop-taskbar');
}

// Where focus goes back to when a window closes or minimizes.
const openers = new Map<string, HTMLElement>();

function focusBack(key: string): void {
  const from = openers.get(key);
  openers.delete(key);
  const target = from && from.isConnected && !from.closest('[inert], .is-minimized')
    ? from
    : document.getElementById('main');
  target?.focus({ preventScroll: true });
}

function buildWindow(key: string, app: AppRegistryEntry): HTMLElement {
  // A non-modal dialog: it floats over the page, and the page stays usable.
  const win = document.createElement('section');
  win.className = `app-window kw-app kw-app--${app.chrome}`;
  win.setAttribute('data-app', key);
  win.setAttribute('data-app-window', key);
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', app.taskbar_label);
  win.tabIndex = -1;

  const bar = document.createElement('div');
  bar.className = 'title-bar';
  bar.innerHTML = `
    <div class="title-label">
      ${app.title_icon_html}
      <span role="heading" aria-level="2" data-app-heading>${app.title}</span>
    </div>
    <div class="window-controls">
      <button type="button" class="window-btn" data-act="min" aria-label="Minimize ${app.taskbar_label}" title="Minimize"><span class="win-glyph win-glyph-min" aria-hidden="true"></span></button>
      <button type="button" class="window-btn" data-act="max" aria-label="Maximize ${app.taskbar_label}" title="Maximize"><span class="win-glyph win-glyph-max" aria-hidden="true"></span></button>
      <button type="button" class="window-btn window-btn-close" data-act="close" aria-label="Close ${app.taskbar_label}" title="Close"><span class="win-glyph win-glyph-close" aria-hidden="true"></span></button>
    </div>
  `;
  win.appendChild(bar);

  const body = document.createElement('div');
  body.className = 'app-body app-body--iframe';
  const ifr = document.createElement('iframe');
  ifr.src = `/apps/${app.slug}/embed/`;
  ifr.title = `${app.taskbar_label} player`;
  ifr.setAttribute('loading', 'eager');
  ifr.allow = 'autoplay; fullscreen; encrypted-media';
  body.appendChild(ifr);
  win.appendChild(body);

  // Position
  const saved = readState()[key] ?? ({} as AppSessionEntry);
  const vw = window.innerWidth, vh = window.innerHeight;
  const tbH = window.KrizWM?.taskbarHeight?.() ?? 48;
  // Cascade off the Krizscape window when it's on screen: one title bar down
  // and CASCADE_X across, so its title bar (and its minimize/maximize/close
  // buttons) and a strip of its left edge show, the way a window behind
  // looks. With no room for that, the window is centered.
  const shell = document.querySelector<HTMLElement>('.os-shell:not(.is-minimized)');
  const shellRect = shell?.getBoundingClientRect();
  const shellBar = shell?.querySelector<HTMLElement>(':scope > .title-bar')?.getBoundingClientRect();
  const barTop = shellBar && shellBar.bottom > 0 ? Math.round(shellBar.bottom) : 12;
  const minTop = vh - tbH - 12 - barTop >= 480 ? Math.max(12, barTop) : 12;
  const cascadeX = shellRect && shellRect.width > 0 && minTop === barTop
    ? Math.max(12, Math.round(shellRect.left) + CASCADE_X)
    : null;
  const cascade = cascadeX !== null && vw - 12 - cascadeX >= MIN_CASCADE_W;
  const ww = cascade ? Math.min(app.width, vw - 12 - cascadeX!) : Math.min(app.width, vw - 24);
  const hh = Math.min(app.height, vh - tbH - 12 - minTop);
  const px = typeof saved.x === 'number' ? saved.x
    : cascade ? cascadeX! : Math.max(12, Math.round((vw - ww) / 2));
  const py = typeof saved.y === 'number' ? saved.y
    : cascade ? minTop : Math.max(minTop, Math.round((vh - tbH - hh) / 2));
  win.style.position = 'fixed';
  win.style.width = `${ww}px`;
  win.style.height = `${hh}px`;
  win.style.left = `${px}px`;
  win.style.top = `${py}px`;

  bar.querySelector<HTMLButtonElement>('[data-act="min"]')?.addEventListener('click', () => minimize(key, true));
  bar.querySelector<HTMLButtonElement>('[data-act="max"]')?.addEventListener('click', () => toggleMax(key));
  bar.querySelector<HTMLButtonElement>('[data-act="close"]')?.addEventListener('click', () => close(key));

  // Persist position after drag
  win.addEventListener('kw:dragend', () => {
    const left = parseFloat(win.style.left);
    const top = parseFloat(win.style.top);
    if (!isNaN(left) && !isNaN(top)) patchState(key, { x: left, y: top });
  });

  document.body.appendChild(win);
  window.KrizWM?.reconstrain?.(win);
  window.KrizWM?.focus?.(win);

  return win;
}

function ensureTaskbarEntry(key: string, app: AppRegistryEntry): void {
  const tb = taskbarEl();
  if (!tb) return;
  if (tb.querySelector(`.tb-window[data-tb-app="${key}"]`)) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tb-window kw-tb is-active';
  btn.setAttribute('data-tb-app', key);
  btn.setAttribute('aria-label', app.taskbar_label);
  btn.setAttribute('aria-pressed', 'true');
  btn.innerHTML = `${app.icon_html}<span>${app.taskbar_label}</span>`;
  btn.addEventListener('click', () => {
    const win = existingWindow(key);
    if (!win) {
      open(key);
      return;
    }
    if (win.classList.contains('is-minimized')) {
      minimize(key, false);
    } else if (win.classList.contains('is-focused')) {
      minimize(key, true);
    } else {
      window.KrizWM?.focus?.(win);
    }
  });

  const spacer = tb.querySelector('.taskbar-spacer');
  if (spacer) tb.insertBefore(btn, spacer);
  else tb.appendChild(btn);
}

function removeTaskbarEntry(key: string): void {
  document.querySelector(`.desktop-taskbar .tb-window[data-tb-app="${key}"]`)?.remove();
}

function syncTaskbarEntry(key: string): void {
  const btn = document.querySelector<HTMLElement>(`.desktop-taskbar .tb-window[data-tb-app="${key}"]`);
  const win = existingWindow(key);
  if (!btn || !win) return;
  const minimized = win.classList.contains('is-minimized');
  btn.classList.toggle('is-active', !minimized);
  btn.setAttribute('aria-pressed', String(!minimized));
}

/** The highest app window that's on screen (not minimized), if any. */
function frontAppWindow(): HTMLElement | null {
  let front: HTMLElement | null = null;
  let frontZ = -Infinity;
  document.querySelectorAll<HTMLElement>('.app-window').forEach((w) => {
    if (w.classList.contains('is-minimized')) return;
    const z = parseInt(window.getComputedStyle(w).zIndex, 10);
    const zz = isNaN(z) ? 0 : z;
    if (zz >= frontZ) { front = w; frontZ = zz; }
  });
  return front;
}

function focusInto(win: HTMLElement): void {
  // The player lives in the iframe; focusing the frame puts the keyboard there.
  const target = win.querySelector<HTMLElement>('iframe') ?? win;
  target.focus({ preventScroll: true });
}

function open(key: string, opts: OpenOptions = {}): HTMLElement | null {
  const app = getApp(key);
  if (!app) return null;
  const wantFocus = opts.focus !== false;
  const active = document.activeElement as HTMLElement | null;
  const existing = existingWindow(key);
  if (existing) {
    if (existing.classList.contains('is-minimized')) minimize(key, false);
    window.KrizWM?.focus?.(existing);
    if (wantFocus) focusInto(existing);
    return existing;
  }
  if (wantFocus && active && active !== document.body) openers.set(key, active);
  const win = buildWindow(key, app);
  ensureTaskbarEntry(key, app);
  patchState(key, { open: true, min: false });
  if (wantFocus) focusInto(win);
  return win;
}

function close(key: string): void {
  const win = existingWindow(key);
  const hadFocus = !!win && win.contains(document.activeElement);
  if (win) window.KrizWM?.blur?.(win);
  win?.remove();
  removeTaskbarEntry(key);
  clearAppState(key);
  if (hadFocus || openers.has(key)) focusBack(key);
}

function minimize(key: string, on?: boolean): void {
  const win = existingWindow(key);
  if (!win) return;
  const want = typeof on === 'boolean' ? on : !win.classList.contains('is-minimized');
  const hadFocus = win.contains(document.activeElement);
  win.classList.toggle('is-minimized', want);
  win.inert = want;
  if (want) win.setAttribute('aria-hidden', 'true');
  else win.removeAttribute('aria-hidden');
  patchState(key, { min: want });
  syncTaskbarEntry(key);
  if (want) {
    window.KrizWM?.blur?.(win);
    if (hadFocus) document.querySelector<HTMLElement>(`.desktop-taskbar .tb-window[data-tb-app="${key}"]`)?.focus();
  } else {
    window.KrizWM?.focus?.(win);
  }
}

function toggleMax(key: string): void {
  const win = existingWindow(key);
  if (!win) return;
  const goingMax = !win.classList.contains('is-maximized');
  win.classList.toggle('is-maximized', goingMax);
  win.classList.remove('is-minimized');
  syncMaxButton(win.querySelector('.title-bar [data-act="max"]'), goingMax, getApp(key)?.taskbar_label ?? '');
  if (goingMax) {
    win.dataset.preX = win.style.left;
    win.dataset.preY = win.style.top;
    win.dataset.preW = win.style.width;
    win.dataset.preH = win.style.height;
    const tbH = window.KrizWM?.taskbarHeight?.() ?? 48;
    win.style.left = '0';
    win.style.top = '0';
    win.style.width = '100vw';
    win.style.height = `calc(100vh - ${tbH}px)`;
  } else {
    if (win.dataset.preX) win.style.left = win.dataset.preX;
    if (win.dataset.preY) win.style.top = win.dataset.preY;
    if (win.dataset.preW) win.style.width = win.dataset.preW;
    if (win.dataset.preH) win.style.height = win.dataset.preH;
  }
  window.KrizWM?.focus?.(win);
  syncTaskbarEntry(key);
}

/** Bring back the windows that were open on the previous page. */
function restoreOpenApps(): void {
  if (!document.body.classList.contains('has-desktop')) return;
  const s = readState();
  Object.keys(s).forEach((key) => {
    const entry = s[key];
    if (!entry?.open || !getApp(key)) return;
    const win = open(key, { focus: false });
    if (!win) return;
    if (entry.min) minimize(key, true);
    else window.KrizWM?.focus?.(win);
  });
}

/** Install window.KrizApps for one mount of the XP theme. Unmount removes
 *  the windows (xp.theme.ts) and takes the global off window. */
export function installApps(signal?: AbortSignal): void {
  window.KrizApps = { open, close, minimize, toggleMax };
  // Any [data-app-open="<key>"] button opens that app (the /apps/* page).
  document.addEventListener('click', (e) => {
    const t = (e.target as Element | null)?.closest?.<HTMLElement>('[data-app-open]');
    if (t?.dataset.appOpen) open(t.dataset.appOpen);
  }, { signal });
  // Esc closes the app window that has focus: from its title bar here, or
  // from inside its iframe, which posts 'krizapps:escape' (embed.astro).
  const escClose = (win: HTMLElement | null | undefined): void => {
    const key = win?.dataset.app;
    if (key && !win.classList.contains('is-minimized')) close(key);
  };
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || (e.data as { type?: string } | null)?.type !== 'krizapps:escape') return;
    const frame = Array.from(document.querySelectorAll<HTMLIFrameElement>('.app-window iframe'))
      .find((f) => f.contentWindow === e.source);
    escClose(frame?.closest<HTMLElement>('.app-window'));
  }, { signal });
  // "Skip to main content" while the Krizscape window (and #main in it) is
  // minimized or closed: an /apps/<slug>/ page opens that way. The front app
  // window is the content on screen, so the skip lands in it instead of
  // falling through to <body>.
  document.addEventListener('click', (e) => {
    if (!(e.target as Element | null)?.closest?.('a.skip-link')) return;
    const main = document.getElementById('main');
    if (main?.isConnected && !main.closest('.is-minimized')) return;
    const win = frontAppWindow();
    if (!win) return;
    e.preventDefault();
    window.KrizWM?.focus?.(win);
    focusInto(win);
  }, { signal });
  document.addEventListener('shell:reboot', () => {
    document.querySelectorAll<HTMLIFrameElement>('.app-window iframe').forEach((f) => {
      f.contentWindow?.postMessage({ type: 'krizapps:pause' }, location.origin);
    });
  }, { signal });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const win = (document.activeElement as Element | null)?.closest?.<HTMLElement>('.app-window');
    if (!win) return;
    e.preventDefault();
    escClose(win);
  }, { signal });
  signal?.addEventListener('abort', () => {
    openers.clear();
    Reflect.deleteProperty(window, 'KrizApps');
  });
  restoreOpenApps();
}

export const __internals = { readState };
