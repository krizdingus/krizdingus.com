// tests/themes.test.ts — theme framework (src/themes/) and the XP theme's mount/unmount.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ThemeEntry, ThemeModule } from '../src/themes/types';

let available = true;

function mockMatchMedia(): void {
  vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
    // Live, like a real MediaQueryList.
    get matches() {
      return q.includes('reduced-motion') || q.includes('prefers-color-scheme') ? false : available;
    },
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList);
}

function fakeTheme(id = 'demo'): { entry: ThemeEntry; mod: ThemeModule; calls: string[] } {
  const calls: string[] = [];
  const mod: ThemeModule = {
    mount(ctx) {
      calls.push(`mount:${ctx.reason}`);
      const n = document.createElement('div');
      n.className = 'demo-chrome';
      document.body.appendChild(n);
      ctx.onCleanup(() => n.remove());
      document.addEventListener('demo', () => calls.push('event'), { signal: ctx.signal });
    },
    unmount() {
      calls.push('unmount');
    },
  };
  return {
    entry: { manifest: { id, name: 'Demo', description: 'd', availability: '(min-width: 1px)', egg: 'boot' }, load: async () => mod },
    mod,
    calls,
  };
}

beforeEach(() => {
  available = true;
  localStorage.clear();
  document.documentElement.removeAttribute('data-skin');
  document.documentElement.removeAttribute('data-skin-pending');
  document.documentElement.removeAttribute('data-theme-lock');
  document.body.innerHTML = '<button data-theme-switch="demo" hidden>in</button>';
  vi.restoreAllMocks();
  mockMatchMedia();
});

describe('theme runtime', () => {
  it('shows a switch only where the theme is available', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry } = fakeTheme();
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    expect(document.querySelector<HTMLElement>('[data-theme-switch="demo"]')!.hidden).toBe(false);
    available = false;
    rt.syncControls();
    expect(document.querySelector<HTMLElement>('[data-theme-switch="demo"]')!.hidden).toBe(true);
    rt.destroy();
  });

  it('switch mounts, persists, sets data-skin; normal unmounts and cleans up', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry, calls } = fakeTheme();
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    await rt.switchTo('demo', { animate: false });
    expect(rt.active()).toBe('demo');
    expect(document.documentElement.getAttribute('data-skin')).toBe('demo');
    expect(localStorage.getItem('krizdingus-skin')).toBe('demo');
    expect(document.querySelector('.demo-chrome')).not.toBeNull();

    await rt.switchTo(null, { animate: false });
    expect(rt.active()).toBeNull();
    expect(document.documentElement.hasAttribute('data-skin')).toBe(false);
    expect(localStorage.getItem('krizdingus-skin')).toBeNull();
    expect(document.querySelector('.demo-chrome')).toBeNull();
    document.dispatchEvent(new Event('demo'));
    expect(calls).toEqual(['mount:switch', 'unmount']); // listener aborted with the signal
    rt.destroy();
  });

  it('clicking a [data-theme-switch] control switches', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry } = fakeTheme();
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    document.querySelector<HTMLButtonElement>('[data-theme-switch="demo"]')!.click();
    await rt.switchTo('demo'); // queued after the click's switch
    expect(rt.active()).toBe('demo');
    rt.destroy();
  });

  it('restores the theme the head kicker marked as pending, without persisting', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry, calls } = fakeTheme();
    document.documentElement.setAttribute('data-skin-pending', 'demo');
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    expect(rt.active()).toBe('demo');
    expect(calls).toEqual(['mount:restore']);
    expect(document.documentElement.hasAttribute('data-skin-pending')).toBe(false);
    expect(localStorage.getItem('krizdingus-skin')).toBeNull();
    rt.destroy();
  });

  it('refuses an unavailable theme', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry } = fakeTheme();
    available = false;
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    await rt.switchTo('demo', { animate: false });
    expect(rt.active()).toBeNull();
    rt.destroy();
  });

  it('typing the egg word in normal mode switches; typing in a field does not', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry } = fakeTheme();
    document.body.insertAdjacentHTML('beforeend', '<input id="f">');
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    const f = document.getElementById('f')!;
    for (const k of 'boot') f.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    await rt.switchTo(rt.active(), { persist: false });
    expect(rt.active()).toBeNull();
    for (const k of 'boot') document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    await rt.switchTo('demo', { persist: false });
    expect(rt.active()).toBe('demo');
    expect(localStorage.getItem('krizdingus-skin')).toBe('demo');
    rt.destroy();
  });
});

describe('head kicker', () => {
  it('marks a stored, available theme pending and applies the color scheme', async () => {
    const { buildKicker } = await import('../src/themes/kicker');
    const src = buildKicker([{ id: 'xp', name: 'XP', description: '', availability: '(min-width: 1024px)' }], 'krizdingus-skin');
    localStorage.setItem('krizdingus-skin', 'xp');
    localStorage.setItem('krizdingus-theme', 'dark');
    new Function(src)();
    expect(document.documentElement.getAttribute('data-skin-pending')).toBe('xp');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('leaves normal mode alone when the theme is unavailable or unknown', async () => {
    const { buildKicker } = await import('../src/themes/kicker');
    const src = buildKicker([{ id: 'xp', name: 'XP', description: '', availability: 'x' }], 'krizdingus-skin');
    available = false;
    localStorage.setItem('krizdingus-skin', 'xp');
    new Function(src)();
    expect(document.documentElement.hasAttribute('data-skin-pending')).toBe(false);
    available = true;
    localStorage.setItem('krizdingus-skin', 'nope');
    new Function(src)();
    expect(document.documentElement.hasAttribute('data-skin-pending')).toBe(false);
  });

  it('a route lock wins over the stored choice', async () => {
    const { buildKicker } = await import('../src/themes/kicker');
    const src = buildKicker([{ id: 'xp', name: 'XP', description: '', availability: 'x' }], 'krizdingus-skin');
    document.documentElement.setAttribute('data-theme-lock', 'xp');
    new Function(src)();
    expect(document.documentElement.getAttribute('data-skin-pending')).toBe('xp');
  });
});

describe('manifests + registry', () => {
  it('discovers the XP theme with a desktop-only availability query', async () => {
    const { themeManifests } = await import('../src/themes/manifests');
    const xp = themeManifests.find((m) => m.id === 'xp');
    expect(xp).toBeDefined();
    expect(xp!.availability).toContain('min-width: 1024px');
    expect(xp!.availability).toContain('pointer: fine');
    const { themeEntries } = await import('../src/themes/registry');
    expect(themeEntries.map((e) => e.manifest.id)).toContain('xp');
  });
});

describe('XP theme mount/unmount', () => {
  const PAGE = `
    <a href="#main" class="skip-link">Skip</a>
    <div class="site" data-site>
      <header class="pro-header"><nav data-site-nav><a href="/" data-key="H">Home</a><a href="/projects/" data-key="P" aria-current="page">Projects</a></nav></header>
      <main id="main" class="site-main"><h1>Hi</h1></main>
      <footer class="pro-footer">foot</footer>
    </div>`;

  it('wraps <main> in the OS window, then restores the exact page', async () => {
    localStorage.setItem('krizdingus-xp-booted', '1');
    document.body.innerHTML = PAGE;
    document.body.dataset.shellTitle = 'TEST.EXE';
    const before = document.body.innerHTML;
    const main = document.getElementById('main')!;
    const xp = await import('../src/themes/xp/xp.theme');
    const ac = new AbortController();
    const ctx = {
      manifest: { id: 'xp', name: 'XP', description: '', availability: '' },
      reason: 'switch' as const,
      reducedMotion: true,
      signal: ac.signal,
      onCleanup: () => {},
      exit: () => {},
    };
    xp.mount(ctx);
    expect(document.querySelector('.os-shell #main')).toBe(main);
    expect(main.classList.contains('window-content')).toBe(true);
    expect(document.querySelector('[data-site]')).toBeNull();
    expect(document.querySelector('.desktop-layer')).not.toBeNull();
    expect(document.querySelector('.menu-bar a[aria-current="page"] u')!.textContent).toBe('P');
    expect(document.querySelector('[data-os-shell-title]')!.textContent).toBe('TEST.EXE');
    expect(document.body.classList.contains('has-desktop')).toBe(true);
    expect(document.querySelector('.boot-overlay')).toBeNull(); // already booted

    ac.abort();
    xp.unmount(ctx);
    expect(document.body.innerHTML).toBe(before);
    expect(document.getElementById('main')).toBe(main);
    expect(document.body.classList.contains('has-desktop')).toBe(false);
  });
});

describe('theme #2 is a drop-in (manifest-driven chrome)', () => {
  const xpM = { id: 'xp', name: 'XP/OS mode', description: '', availability: 'x', label: 'XP mode', appRoutes: true, owns: ['.kz-eggs'] };
  const aeroM = { id: 'aero', name: 'Aero mode', description: '', availability: 'x' };

  it('picks the app-routes theme by flag, not by position', async () => {
    const { appRoutesTheme } = await import('../src/themes/manifests');
    // 'aero' sorts before 'xp' and must not take over /apps/*.
    expect(appRoutesTheme([aeroM, xpM])?.id).toBe('xp');
    expect(appRoutesTheme([aeroM])).toBeUndefined();
  });

  it('hides each theme\'s own markup unless that theme is mounted', async () => {
    const { skinOnlyCss } = await import('../src/themes/manifests');
    const css = skinOnlyCss([aeroM, xpM]);
    expect(css).toContain(':root:not([data-skin]) [data-skin-only]');
    expect(css).toContain(':root:not([data-skin="xp"]) :is([data-skin-only~="xp"],.kz-eggs)');
    expect(css).toContain(':root:not([data-skin="aero"]) :is([data-skin-only~="aero"])');
  });

  it('a real folder (tests/fixtures/themes/stub/) is discovered and mounts with no other edits', async () => {
    const { collectManifests } = await import('../src/themes/manifests');
    const { pairThemes } = await import('../src/themes/registry');
    // The same two globs src/themes/ uses, pointed at the fixture tree.
    const manifests = collectManifests(
      import.meta.glob<{ default: import('../src/themes/types').ThemeManifest }>('./fixtures/themes/*/manifest.ts', { eager: true }),
    );
    const entries = pairThemes(manifests, import.meta.glob<ThemeModule>('./fixtures/themes/*/*.theme.ts'));
    expect(entries.map((e) => e.manifest.id)).toEqual(['stub']);
    document.body.innerHTML = '<button data-theme-switch="stub" hidden>Stub</button>';
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const rt = createThemeRuntime({ entries });
    await rt.init();
    expect(document.querySelector<HTMLButtonElement>('[data-theme-switch="stub"]')!.hidden).toBe(false);
    await rt.switchTo('stub', { animate: false });
    expect(document.documentElement.getAttribute('data-skin')).toBe('stub');
    expect(document.querySelector('.stub-chrome')).not.toBeNull();
    await rt.switchTo(null, { animate: false });
    expect(document.querySelector('.stub-chrome')).toBeNull();
    rt.destroy();
  });

  it('xp → stub → normal leaves no XP nodes, listeners or globals behind', async () => {
    localStorage.setItem('krizdingus-xp-booted', '1');
    document.body.innerHTML = `
      <div class="site" data-site>
        <header class="pro-header"><nav data-site-nav><a href="/">Home</a></nav>
          <button data-theme-switch="xp">XP mode</button><button data-theme-switch="stub">Stub</button></header>
        <main id="main" class="site-main" tabindex="-1"><h1>Hi</h1><button data-egg="wallpaper">egg</button></main>
        <footer class="pro-footer">foot</footer>
      </div>`;
    const before = document.body.innerHTML;
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const stub = fakeTheme('stub');
    const xpEntry: ThemeEntry = {
      manifest: { ...xpM, availability: '(min-width: 1px)' },
      // jsdom never fires <link> load events, so skip the stylesheet.
      load: async () => ({ ...(await import('../src/themes/xp/xp.theme')).default, styles: [] }),
    };
    const rt = createThemeRuntime({ entries: [stub.entry, xpEntry] });
    await rt.init();
    await rt.switchTo('xp', { animate: false });
    expect(document.querySelector('.os-shell')).not.toBeNull();
    expect(window.KrizApps).toBeDefined();
    await rt.switchTo('stub', { animate: false });
    expect(document.querySelector('.os-shell, .desktop-layer')).toBeNull();
    expect(window.KrizApps).toBeUndefined();
    expect(window.KrizWM).toBeUndefined();
    expect(document.querySelector('.demo-chrome')).not.toBeNull();
    await rt.switchTo(null, { animate: false });
    expect(document.body.innerHTML).toBe(before);

    // The egg button's click handler went with the XP theme.
    const wp = document.documentElement.getAttribute('data-wallpaper');
    document.querySelector<HTMLButtonElement>('[data-egg]')!.click();
    expect(document.documentElement.getAttribute('data-wallpaper')).toBe(wp);

    // And a remount brings window.KrizApps back.
    await rt.switchTo('xp', { animate: false });
    expect(window.KrizApps).toBeDefined();
    await rt.switchTo(null, { animate: false });
    rt.destroy();
  });
});

describe('focus across a swap', () => {
  it('moves focus off a detached switch: to #main going in, to the switch coming out', async () => {
    document.body.innerHTML = `
      <header id="h"><button data-theme-switch="demo">in</button></header>
      <main id="main" tabindex="-1">m</main>`;
    // jsdom has no layout: treat every connected element as rendered.
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
      return (this.isConnected ? [{}] : []) as unknown as DOMRectList;
    });
    const header = document.getElementById('h')!;
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const out = document.createElement('button');
    out.dataset.themeSwitch = 'normal';
    const mod: ThemeModule = {
      mount: () => {
        header.remove();
        document.body.append(out);
      },
      unmount: () => {
        out.remove();
        document.body.prepend(header);
      },
    };
    const rt = createThemeRuntime({
      entries: [{ manifest: { id: 'demo', name: 'D', description: '', availability: 'x' }, load: async () => mod }],
    });
    await rt.init();
    const sw = document.querySelector<HTMLButtonElement>('[data-theme-switch="demo"]')!;
    sw.focus();
    await rt.switchTo('demo', { animate: false });
    expect(document.activeElement?.id).toBe('main');
    out.focus(); // the theme's own exit control, which unmount removes
    await rt.switchTo(null, { animate: false });
    expect(document.activeElement).toBe(sw);
    rt.destroy();
  });

  it('a skipped view transition is not an error, and the queue waits for it', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry } = fakeTheme();
    const order: string[] = [];
    let finish!: () => void;
    (document as unknown as { startViewTransition: unknown }).startViewTransition = (cb: () => Promise<void>) => {
      const updateCallbackDone = cb();
      const ready = Promise.reject(new DOMException('Transition was skipped', 'AbortError'));
      const finished = new Promise<void>((r) => (finish = () => { order.push('finished'); r(); }));
      return { updateCallbackDone, ready, finished };
    };
    const errors = vi.spyOn(console, 'error');
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    const first = rt.switchTo('demo');
    const second = rt.switchTo(null).then(() => order.push('second'));
    await new Promise((r) => setTimeout(r, 0));
    // No `transition` in the manifest: the browser's own crossfade.
    expect(document.documentElement.getAttribute('data-skin-swap')).toBe('fade');
    expect(document.documentElement.getAttribute('data-skin-swap-dir')).toBe('in');
    finish();
    await first;
    await new Promise((r) => setTimeout(r, 0));
    finish();
    await second;
    expect(order).toEqual(['finished', 'finished', 'second']);
    expect(document.documentElement.hasAttribute('data-skin-swap')).toBe(false);
    expect(errors).not.toHaveBeenCalled();
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
    rt.destroy();
  });
});

describe('round-4 framework contract', () => {
  it("base: 'none' sets <html data-skin-base> while mounted; the default keeps normal styles on", async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const bare = fakeTheme('bare');
    bare.entry.manifest.base = 'none';
    const layered = fakeTheme('layered');
    const rt = createThemeRuntime({ entries: [bare.entry, layered.entry] });
    await rt.init();
    await rt.switchTo('bare', { animate: false });
    expect(document.documentElement.getAttribute('data-skin-base')).toBe('none');
    await rt.switchTo('layered', { animate: false });
    expect(document.documentElement.hasAttribute('data-skin-base')).toBe(false);
    await rt.switchTo(null, { animate: false });
    expect(document.documentElement.hasAttribute('data-skin-base')).toBe(false);
    rt.destroy();
  });

  it('follows a theme switch made in another tab (storage event)', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry } = fakeTheme();
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    localStorage.setItem('krizdingus-skin', 'demo');
    window.dispatchEvent(new StorageEvent('storage', { key: 'krizdingus-skin', newValue: 'demo' }));
    await rt.switchTo('demo', { persist: false }); // queued behind the storage switch
    expect(rt.active()).toBe('demo');
    localStorage.removeItem('krizdingus-skin');
    window.dispatchEvent(new StorageEvent('storage', { key: 'krizdingus-skin', newValue: null }));
    await new Promise((r) => setTimeout(r, 0));
    await rt.switchTo(null, { persist: false });
    expect(rt.active()).toBeNull();
    rt.destroy();
  });

  it('the lock notice ([data-skin-fallback]) hides once its theme mounts', async () => {
    const { skinOnlyCss } = await import('../src/themes/manifests');
    const css = skinOnlyCss([{ id: 'xp', name: 'XP', description: '', availability: 'x' }]);
    expect(css).toContain(':root[data-skin="xp"] [data-skin-fallback~="xp"]{display:none!important}');
  });

  it('XP declares base none and plain-words needs for the lock notice', async () => {
    const xp = (await import('../src/themes/xp/manifest')).default;
    expect(xp.base).toBe('none');
    expect(xp.needs).toMatch(/1024/);
  });
});

describe('round-6 drop-in contract', () => {
  function fakeVT(): { calls: number } {
    const box = { calls: 0 };
    (document as unknown as { startViewTransition: unknown }).startViewTransition = (cb: () => Promise<void>) => {
      box.calls++;
      const updateCallbackDone = cb();
      return { updateCallbackDone, ready: updateCallbackDone, finished: updateCallbackDone };
    };
    return box;
  }
  const dropVT = (): void => {
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  };

  it('a failed theme chunk is never stored as the choice', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const rt = createThemeRuntime({
      entries: [{ manifest: { id: 'demo', name: 'D', description: '', availability: 'x' }, load: () => Promise.reject(new Error('blocked')) }],
    });
    await rt.init();
    await rt.switchTo('demo', { animate: false });
    expect(rt.active()).toBeNull();
    expect(localStorage.getItem('krizdingus-skin')).toBeNull();
    rt.destroy();
  });

  it("drives the snapshots with the theme's own keyframes, both ways", async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry } = fakeTheme();
    entry.manifest.transition = { old: [{ opacity: 1 }, { opacity: 0 }], new: [{ opacity: 0 }, { opacity: 1 }], oldTiming: { duration: 10 } };
    const vt = fakeVT();
    const animate = vi.fn();
    (document.documentElement as unknown as { animate: unknown }).animate = animate;
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    const swaps: Array<string | null> = [];
    const seen = new MutationObserver(() => swaps.push(document.documentElement.getAttribute('data-skin-swap')));
    seen.observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin-swap'] });
    await rt.switchTo('demo');
    await rt.switchTo(null);
    await new Promise((r) => setTimeout(r, 0));
    seen.disconnect();
    expect(vt.calls).toBe(2);
    expect(swaps).toContain('custom');
    const pseudo = animate.mock.calls.map((c) => (c[1] as KeyframeAnimationOptions).pseudoElement);
    expect(pseudo).toEqual([
      '::view-transition-old(root)', '::view-transition-new(root)',
      '::view-transition-old(root)', '::view-transition-new(root)',
    ]);
    expect((animate.mock.calls[0][1] as KeyframeAnimationOptions).duration).toBe(10);
    delete (document.documentElement as unknown as { animate?: unknown }).animate;
    dropVT();
    rt.destroy();
  });

  it("transition: 'none' swaps instantly, with no View Transition", async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { entry } = fakeTheme();
    entry.manifest.transition = 'none';
    const vt = fakeVT();
    const rt = createThemeRuntime({ entries: [entry] });
    await rt.init();
    await rt.switchTo('demo');
    expect(rt.active()).toBe('demo');
    expect(vt.calls).toBe(0);
    dropVT();
    rt.destroy();
  });

  it('XP brings its own switch glyph and CRT transition; shared CSS names no theme', async () => {
    const xp = (await import('../src/themes/xp/manifest')).default;
    expect(xp.glyph).toMatch(/^<svg[\s\S]*<\/svg>$/);
    expect(typeof xp.transition).toBe('object');
    const fs = await import('node:fs');
    const runtimeCss = fs.readFileSync('src/themes/runtime.css', 'utf8');
    expect(runtimeCss).not.toMatch(/@keyframes skin-crt/);
    expect(fs.readFileSync('src/styles/pro.css', 'utf8')).not.toMatch(/skin-switch__glyph::(before|after)/);
  });
});
