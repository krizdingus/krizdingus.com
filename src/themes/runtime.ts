// src/themes/runtime.ts
// The theme framework. Ships with normal mode (it is small and loads no theme
// code by itself). It:
//   - restores a pending theme marked by the head kicker (kicker.ts),
//   - wires every [data-theme-switch="<id>|normal"] control on the page,
//   - offers a theme's switches only where its availability query matches
//     (greyed out with the reason on a too-narrow desktop window),
//   - lazy-loads the theme module and its stylesheets, then mounts it,
//   - swaps with a View Transition (none under prefers-reduced-motion),
//   - unmounts and falls back to normal when availability stops matching,
//   - persists the visitor's choice in localStorage (other tabs follow it),
//   - listens for each theme's typed easter-egg word in normal mode
//     (typed in one go; off while that theme's single keys are off).
// Contract: src/themes/README.md. Types: src/themes/types.ts.
import { SKIN_STORAGE_KEY, keysStorageKey } from './manifests';
import type { MountReason, ThemeContext, ThemeEntry, ThemeModule, ThemeTransition } from './types';

export const NORMAL = 'normal';

interface ViewTransitionLike {
  updateCallbackDone: Promise<void>;
  ready?: Promise<void>;
  finished?: Promise<void>;
}

interface Active {
  entry: ThemeEntry;
  mod: ThemeModule;
  ctx: ThemeContext;
  controller: AbortController;
  cleanups: Array<() => void>;
  links: HTMLLinkElement[];
}

export interface ThemeRuntime {
  /** Switch to a theme id, or null for normal mode. */
  switchTo(id: string | null, opts?: { persist?: boolean; animate?: boolean; reason?: MountReason }): Promise<void>;
  /** The mounted theme id, or null in normal mode. */
  active(): string | null;
  /** Is the theme offered on this device right now? */
  isAvailable(id: string): boolean;
  /** Re-sync the [data-theme-switch] controls (call after injecting new ones). */
  syncControls(): void;
  /** Restore the pending theme and wire controls. Call once per page. */
  init(): Promise<void>;
  /** Remove every listener the runtime added (tests). */
  destroy(): void;
}

export interface RuntimeOptions {
  entries: ThemeEntry[];
  storageKey?: string;
  doc?: Document;
}

const FIELD = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
/** The egg word has to be typed without a pause longer than this. */
const EGG_GAP_MS = 1000;
/** See hintable() below. */
const HINT_QUERY = '(pointer: fine)';

/** The visitor turned a theme's single-key shortcuts off (its egg goes with them). */
function keysOff(id: string): boolean {
  try {
    return localStorage.getItem(keysStorageKey(id)) === 'off';
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function createThemeRuntime(opts: RuntimeOptions): ThemeRuntime {
  const doc = opts.doc ?? document;
  const root = doc.documentElement;
  const key = opts.storageKey ?? SKIN_STORAGE_KEY;
  const entries = opts.entries;
  const listeners = new AbortController();
  let active: Active | null = null;
  // Switches run one at a time, in order.
  let queue: Promise<void> = Promise.resolve();

  const find = (id: string | null): ThemeEntry | undefined =>
    id ? entries.find((e) => e.manifest.id === id) : undefined;

  const mql = new Map<string, MediaQueryList>();
  function query(entry: ThemeEntry): MediaQueryList | null {
    let q = mql.get(entry.manifest.id);
    if (!q) {
      try {
        q = window.matchMedia(entry.manifest.availability);
      } catch {
        return null;
      }
      mql.set(entry.manifest.id, q);
    }
    return q;
  }

  function isAvailable(id: string): boolean {
    const entry = find(id);
    return !!entry && !!query(entry)?.matches;
  }

  function stored(): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function persist(id: string | null): void {
    try {
      if (id) localStorage.setItem(key, id);
      else localStorage.removeItem(key);
    } catch {
      /* storage disabled: the choice lasts for this page only */
    }
  }

  /** What this page should show if it can: a route lock wins over the stored choice. */
  function wanted(): string | null {
    return root.getAttribute('data-theme-lock') || stored();
  }

  /** Where an unavailable theme's switch stays on screen, greyed out, with
   *  the manifest's `needs` as its description: a desktop window that is
   *  too narrow or zoomed in. Elsewhere (touch screens) it is hidden. */
  function hintable(): boolean {
    try {
      return window.matchMedia(HINT_QUERY).matches;
    } catch {
      return false;
    }
  }

  // A greyed-out switch's own title, put back once the theme is available.
  const titles = new WeakMap<HTMLElement, string | null>();

  function syncControls(): void {
    const hint = hintable();
    doc.querySelectorAll<HTMLElement>('[data-theme-switch]').forEach((el) => {
      const id = el.dataset.themeSwitch ?? '';
      if (id === NORMAL) return;
      const entry = find(id);
      const on = isAvailable(id);
      if (on || !hint || !entry?.manifest.needs) {
        el.hidden = !on;
        if (el.hasAttribute('aria-disabled')) {
          el.removeAttribute('aria-disabled');
          const title = titles.get(el);
          if (title) el.setAttribute('title', title);
          else el.removeAttribute('title');
        }
        return;
      }
      if (!titles.has(el)) titles.set(el, el.getAttribute('title'));
      el.hidden = false;
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('title', `${entry.manifest.name} needs ${entry.manifest.needs}.`);
    });
  }

  function loadStyles(urls: string[] = []): Promise<HTMLLinkElement[]> {
    return Promise.all(
      urls.map(
        (href) =>
          new Promise<HTMLLinkElement>((resolve) => {
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            // Fetched and parsed now, applied only at mount time.
            link.media = 'not all';
            link.setAttribute('data-skin-asset', '');
            const done = (): void => resolve(link);
            link.addEventListener('load', done, { once: true });
            link.addEventListener('error', done, { once: true });
            doc.head.appendChild(link);
          }),
      ),
    );
  }

  async function unmountActive(): Promise<void> {
    if (!active) return;
    const current = active;
    active = null;
    current.controller.abort();
    try {
      await current.mod.unmount(current.ctx);
    } catch (err) {
      console.error('[themes] unmount failed', err);
    }
    while (current.cleanups.length) {
      try {
        current.cleanups.pop()!();
      } catch (err) {
        console.error('[themes] cleanup failed', err);
      }
    }
    current.links.forEach((l) => l.remove());
    root.removeAttribute('data-skin');
    root.removeAttribute('data-skin-base');
  }

  async function mount(entry: ThemeEntry, mod: ThemeModule, links: HTMLLinkElement[], reason: MountReason): Promise<void> {
    const controller = new AbortController();
    const cleanups: Array<() => void> = [];
    const ctx: ThemeContext = {
      manifest: entry.manifest,
      reason,
      reducedMotion: prefersReducedMotion(),
      signal: controller.signal,
      onCleanup: (fn) => cleanups.push(fn),
      exit: () => void api.switchTo(null, { persist: true }),
    };
    active = { entry, mod, ctx, controller, cleanups, links };
    links.forEach((l) => (l.media = 'all'));
    root.setAttribute('data-skin', entry.manifest.id);
    if (entry.manifest.base === 'none') root.setAttribute('data-skin-base', 'none');
    try {
      await mod.mount(ctx);
    } catch (err) {
      console.error(`[themes] mount of "${entry.manifest.id}" failed`, err);
      await unmountActive();
    }
  }

  async function run(id: string | null, persistChoice: boolean, animate: boolean, reason: MountReason): Promise<void> {
    const entry = find(id);
    const target = entry && isAvailable(entry.manifest.id) ? entry : undefined;
    // Leaving for normal mode is stored right away. A theme is stored only
    // once its code and styles have arrived (below), so a blocked or failed
    // chunk never leaves a sticky choice that every later page waits on.
    if (persistChoice && !target) persist(null);
    if ((active?.entry.manifest.id ?? null) === (target?.manifest.id ?? null)) {
      if (persistChoice && target) persist(target.manifest.id);
      return;
    }

    // Fetch everything before touching the page, so the swap itself is instant.
    let mod: ThemeModule | null = null;
    let links: HTMLLinkElement[] = [];
    if (target) {
      try {
        mod = await target.load();
        links = await loadStyles(mod.styles);
      } catch (err) {
        console.error(`[themes] could not load "${target.manifest.id}"`, err);
        links.forEach((l) => l.remove());
        return;
      }
      if (persistChoice) persist(target.manifest.id);
    }

    const leavingEntry = active?.entry;
    const leaving = leavingEntry?.manifest.id ?? null;
    // The entering theme's transition on the way in, the leaving one's on the way out.
    const fx = (target ?? leavingEntry)?.manifest.transition;
    // Only manage focus the visitor actually had (not on a page-load restore).
    const hadFocus = !!doc.activeElement && doc.activeElement !== doc.body;
    const swap = async (): Promise<void> => {
      await unmountActive();
      if (target && mod) await mount(target, mod, links, reason);
      syncControls();
      if (hadFocus) restoreFocus(leaving);
      doc.dispatchEvent(new CustomEvent('skin:change', { detail: { id: active?.entry.manifest.id ?? null } }));
    };

    const vt = (doc as Document & { startViewTransition?: (cb: () => Promise<void>) => ViewTransitionLike })
      .startViewTransition;
    if (animate && vt && fx !== 'none' && !prefersReducedMotion()) {
      // 'fade': the browser's own crossfade. 'custom': runtime.css switches
      // that off and the theme's keyframes drive the two snapshots.
      root.setAttribute('data-skin-swap', fx ? 'custom' : 'fade');
      root.setAttribute('data-skin-swap-dir', target ? 'in' : 'out');
      let t: ViewTransitionLike | null = null;
      try {
        t = vt.call(doc, swap);
        // A skipped transition rejects `ready`; that is not an error here.
        if (fx) t.ready?.then(() => playTransition(fx)).catch(() => {});
        else t.ready?.catch(() => {});
        await t.updateCallbackDone;
      } catch {
        if ((active?.entry.manifest.id ?? null) !== (target?.manifest.id ?? null)) await swap();
      }
      // Hold the queue until the animation ends, so a quick second switch
      // never cuts this one off mid-flight.
      try {
        await t?.finished;
      } catch {
        /* the update callback failed; swap() already logged it */
      }
      root.removeAttribute('data-skin-swap');
      root.removeAttribute('data-skin-swap-dir');
    } else {
      await swap();
    }
  }

  /** Drive the View Transition snapshots with a theme's keyframes. */
  function playTransition(fx: ThemeTransition): void {
    if (typeof root.animate !== 'function') return;
    root.animate(fx.old, { duration: 240, fill: 'both', ...fx.oldTiming, pseudoElement: '::view-transition-old(root)' });
    root.animate(fx.new, { duration: 320, fill: 'both', ...fx.newTiming, pseudoElement: '::view-transition-new(root)' });
  }

  /** Keep keyboard focus on the page across a swap. A control that a theme
   *  detaches or removes (the switch that was just pressed) drops focus to
   *  <body>; this puts it somewhere useful instead. */
  function restoreFocus(leaving: string | null): void {
    const el = doc.activeElement as HTMLElement | null;
    if (el && el !== doc.body && el.isConnected && el.getClientRects().length) return;
    // Entering a theme: the page content. Leaving one: its switch in the
    // normal-mode header, or the closed display menu that holds it, so the
    // visitor can find the way back in.
    const shown = (n: HTMLElement): boolean => !n.hidden && n.getClientRects().length > 0;
    const sw = !active && leaving
      ? Array.from(doc.querySelectorAll<HTMLElement>(`[data-theme-switch="${leaving}"], [data-display-open]`))
          .find(shown)
      : undefined;
    const next = sw ?? doc.getElementById('main');
    next?.focus({ preventScroll: true });
  }

  const api: ThemeRuntime = {
    switchTo(id, o = {}) {
      const { persist: p = true, animate = true, reason = 'switch' } = o;
      queue = queue.then(() => run(id, p, animate, reason)).catch((err) => console.error('[themes]', err));
      return queue;
    },
    active: () => active?.entry.manifest.id ?? null,
    isAvailable,
    syncControls,
    async init() {
      const signal = listeners.signal;

      // Every switch control, now and later (themes inject their own exits).
      doc.addEventListener(
        'click',
        (e) => {
          const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-theme-switch]');
          if (!el) return;
          e.preventDefault();
          if (el.getAttribute('aria-disabled') === 'true') return;
          const id = el.dataset.themeSwitch ?? '';
          void api.switchTo(id === NORMAL ? null : id, { persist: true });
        },
        { signal },
      );

      // Availability changes: hide/show switches, fall back or restore.
      for (const entry of entries) {
        const q = query(entry);
        q?.addEventListener?.(
          'change',
          () => {
            syncControls();
            const id = entry.manifest.id;
            if (!q.matches && api.active() === id) {
              void api.switchTo(null, { persist: false, animate: false });
            } else if (q.matches && !api.active() && wanted() === id) {
              void api.switchTo(id, { persist: false, animate: false, reason: 'restore' });
            }
          },
          { signal },
        );
      }

      // Easter egg: type a theme's word anywhere (outside form fields) in normal
      // mode, in one go: a pause longer than EGG_GAP_MS starts the word over.
      // A theme's egg is off while its single-key shortcuts are turned off.
      const eggs = entries.filter((e) => e.manifest.egg);
      if (eggs.length) {
        let typed = '';
        let last = 0;
        doc.addEventListener(
          'keydown',
          (e) => {
            if (api.active() || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
            const t = e.target as Element | null;
            if (t?.closest?.(FIELD)) return;
            const now = Date.now();
            if (now - last > EGG_GAP_MS) typed = '';
            last = now;
            typed = (typed + e.key.toLowerCase()).slice(-24);
            for (const entry of eggs) {
              if (keysOff(entry.manifest.id)) continue;
              if (typed.endsWith(entry.manifest.egg!) && isAvailable(entry.manifest.id)) {
                typed = '';
                void api.switchTo(entry.manifest.id, { persist: true });
              }
            }
          },
          { signal },
        );
      }

      // Another tab switched themes: follow it (a route lock still wins).
      window.addEventListener(
        'storage',
        (e) => {
          if (e.key !== key && e.key !== null) return;
          if (root.getAttribute('data-theme-lock')) return;
          const want = stored();
          const next = want && isAvailable(want) ? want : null;
          if (next !== api.active()) void api.switchTo(next, { persist: false, animate: false, reason: 'restore' });
        },
        { signal },
      );

      syncControls();

      const pending = root.getAttribute('data-skin-pending');
      if (pending) {
        try {
          await api.switchTo(pending, { persist: false, animate: false, reason: 'restore' });
        } finally {
          root.removeAttribute('data-skin-pending');
        }
      }
    },
    destroy() {
      listeners.abort();
    },
  };

  return api;
}

declare global {
  interface Window {
    /** The page's theme runtime (for eggs and other theme-aware scripts). */
    krizThemes?: ThemeRuntime;
  }
}

/** Boot the framework for this page with the real theme registry. */
export async function initThemes(entries: ThemeEntry[]): Promise<ThemeRuntime> {
  const rt = createThemeRuntime({ entries });
  window.krizThemes = rt;
  await rt.init();
  return rt;
}
