// tests/apps.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('KrizApps', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="desktop-taskbar"><div class="taskbar-spacer"></div></div>
    `;
    sessionStorage.clear();
    window.KrizWM = {
      focus: vi.fn(),
      blur: vi.fn(),
      reconstrain: vi.fn(),
      taskbarHeight: () => 48,
    };
    vi.resetModules();
    delete (window as any).KrizApps;
  });

  it('install() exposes window.KrizApps with open/close/minimize/toggleMax/APPS', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    expect(window.KrizApps).toBeDefined();
    expect(typeof window.KrizApps.open).toBe('function');
    expect(typeof window.KrizApps.close).toBe('function');
    expect(typeof window.KrizApps.minimize).toBe('function');
    expect(typeof window.KrizApps.toggleMax).toBe('function');
  });

  it('open(key) injects a .app-window with iframe pointing at /apps/<slug>/embed/', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    window.KrizApps.open('mediakruzer');
    const win = document.querySelector<HTMLElement>('.app-window[data-app="mediakruzer"]');
    expect(win).not.toBeNull();
    expect(win!.classList.contains('kw-app--mk')).toBe(true);
    const iframe = win!.querySelector<HTMLIFrameElement>('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe!.src).toContain('/apps/mediakruzer/embed/');
  });

  it('open(key) gives the window title a heading role', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    const win = window.KrizApps.open('mediakruzer')!;
    const h = win.querySelector('.title-bar [role="heading"]');
    expect(h?.getAttribute('aria-level')).toBe('2');
    expect(h?.textContent).toContain('MEDIAKRUZER');
  });

  it('the skip link lands in the front app window while #main is minimized', async () => {
    document.body.insertAdjacentHTML('afterbegin',
      '<a class="skip-link" href="#main">Skip</a><div class="os-shell is-minimized"><main id="main" tabindex="-1"></main></div>');
    const { installApps } = await import('../src/themes/xp/apps');
    const ac = new AbortController();
    installApps(ac.signal);
    const win = window.KrizApps.open('mediakruzer', { focus: false })!;
    const link = document.querySelector<HTMLAnchorElement>('.skip-link')!;
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(win.contains(document.activeElement)).toBe(true);
    // With the shell on screen, the link keeps its normal jump.
    document.querySelector('.os-shell')!.classList.remove('is-minimized');
    const ev2 = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(ev2);
    expect(ev2.defaultPrevented).toBe(false);
    ac.abort();
  });

  it('open(key) inserts a taskbar entry', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    window.KrizApps.open('mediakruzer');
    const tile = document.querySelector('.desktop-taskbar .tb-window[data-tb-app="mediakruzer"]');
    expect(tile).not.toBeNull();
  });

  it('open(key) persists {open:true} in sessionStorage["krizdingus-open-apps"]', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    window.KrizApps.open('mediakruzer');
    const raw = sessionStorage.getItem('krizdingus-open-apps');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.mediakruzer?.open).toBe(true);
  });

  it('close(key) removes the window, the tile, and clears the session entry', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    window.KrizApps.open('mediakruzer');
    window.KrizApps.close('mediakruzer');
    expect(document.querySelector('.app-window[data-app="mediakruzer"]')).toBeNull();
    expect(document.querySelector('.desktop-taskbar .tb-window[data-tb-app="mediakruzer"]')).toBeNull();
    const raw = sessionStorage.getItem('krizdingus-open-apps');
    if (raw) {
      const parsed = JSON.parse(raw);
      expect(parsed.mediakruzer).toBeUndefined();
    }
  });

  it('minimize(key, true) toggles is-minimized and updates taskbar pressed state', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    window.KrizApps.open('mediakruzer');
    window.KrizApps.minimize('mediakruzer', true);
    const win = document.querySelector<HTMLElement>('.app-window[data-app="mediakruzer"]')!;
    const tile = document.querySelector<HTMLElement>('.desktop-taskbar .tb-window[data-tb-app="mediakruzer"]')!;
    expect(win.classList.contains('is-minimized')).toBe(true);
    expect(tile.getAttribute('aria-pressed')).toBe('false');
  });

  it('open(key) is idempotent on the second call (does not duplicate)', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    window.KrizApps.open('mediakruzer');
    window.KrizApps.open('mediakruzer');
    expect(document.querySelectorAll('.app-window[data-app="mediakruzer"]').length).toBe(1);
    expect(document.querySelectorAll('.tb-window[data-tb-app="mediakruzer"]').length).toBe(1);
  });

  it('Esc closes a focused app window, from its chrome or via the iframe message', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    const ac = new AbortController();
    installApps(ac.signal);
    window.KrizApps.open('mediakruzer');
    document.querySelector<HTMLButtonElement>('.app-window [data-act="max"]')!.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(document.querySelector('.app-window')).toBeNull();
    window.KrizApps.open('mediakruzer');
    const frame = document.querySelector<HTMLIFrameElement>('.app-window iframe')!;
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'krizapps:escape' }, origin: location.origin, source: frame.contentWindow }));
    expect(document.querySelector('.app-window')).toBeNull();
    ac.abort();
  });

  it('open(key) with unknown key is a no-op', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    window.KrizApps.open('nonexistent');
    expect(document.querySelector('.app-window[data-app="nonexistent"]')).toBeNull();
  });

  it('open(key) builds a labelled non-modal dialog, never role="application"', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    const win = window.KrizApps.open('mediakruzer')!;
    expect(win.getAttribute('role')).toBe('dialog');
    expect(win.getAttribute('aria-label')).toBe('MediaKruzer 7.0');
    expect(document.querySelector('[role="application"]')).toBeNull();
  });

  it('close(key) hands focus back to the control that opened it', async () => {
    document.body.insertAdjacentHTML('beforeend', '<button id="opener">open</button><main id="main" tabindex="-1"></main>');
    const { installApps } = await import('../src/themes/xp/apps');
    installApps();
    const opener = document.getElementById('opener')!;
    opener.focus();
    window.KrizApps.open('mediakruzer');
    expect(document.activeElement).not.toBe(opener);
    window.KrizApps.close('mediakruzer');
    expect(document.activeElement).toBe(opener);
  });

  it('installApps(signal) removes window.KrizApps when the theme unmounts', async () => {
    const { installApps } = await import('../src/themes/xp/apps');
    const ac = new AbortController();
    installApps(ac.signal);
    expect(window.KrizApps).toBeDefined();
    ac.abort();
    expect((window as any).KrizApps).toBeUndefined();
  });
});

describe('apps registry', () => {
  it('lists exactly the published (non-draft) apps in src/content/apps', async () => {
    const { APPS } = await import('../src/themes/xp/apps-registry');
    const files = import.meta.glob('../src/content/apps/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const published = Object.entries(files)
      .filter(([, raw]) => !/^draft:\s*true\s*$/m.test(raw))
      .map(([path]) => path.split('/').pop()!.replace(/\.md$/, ''))
      .sort();
    expect(Object.keys(APPS).sort()).toEqual(published);
    for (const [key, app] of Object.entries(APPS)) {
      const raw = files[`../src/content/apps/${key}.md`];
      expect(raw).toContain(`taskbar_label: ${app.taskbar_label}`);
      expect(raw).toContain(`title: ${app.title}`);
    }
  });
});
