// XP theme behaviors: shortcuts, cheat sheet, Recycle Bin crash, egg tiles.
import { describe, it, expect, beforeEach, vi } from 'vitest';

function ctx() {
  const ac = new AbortController();
  return { ac, ctx: { signal: ac.signal, reducedMotion: true, reason: 'switch', onCleanup: () => {} } as any };
}

const key = (k: string, extra: KeyboardEventInit = {}) =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));

describe('XP shortcuts', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.className = '';
    document.body.innerHTML = `
      <div class="os-shell"><div class="menu-bar"><nav>
        <a class="menu-route" href="/projects/"><u>P</u>rojects</a>
      </nav></div><main id="main" tabindex="-1"><input id="f"></main></div>
      <div class="desktop-taskbar"><button class="start-btn">Start</button>
        <button class="theme-toggle">t</button><button data-theme-switch="normal">x</button></div>`;
  });

  it('? opens the cheat sheet, Esc closes it, and keys sleep in a field', async () => {
    const { installShortcuts } = await import('../src/themes/xp/shortcuts');
    const { ac, ctx: c } = ctx();
    installShortcuts(c);
    key('?', { shiftKey: true });
    const sheet = document.querySelector('[data-shortcuts-sheet]');
    expect(sheet).not.toBeNull();
    expect(sheet!.textContent).toContain('Go to Projects');
    expect(sheet!.textContent).not.toMatch(/ctrl\s*\+|alt\s*\+/i);
    key('Escape');
    expect(document.querySelector('[data-shortcuts-sheet]')).toBeNull();
    (document.getElementById('f') as HTMLInputElement).focus();
    key('?', { shiftKey: true });
    expect(document.querySelector('[data-shortcuts-sheet]')).toBeNull();
    ac.abort();
  });

  it('single keys run their action; modifiers and unmount turn them off', async () => {
    const { installShortcuts } = await import('../src/themes/xp/shortcuts');
    const { ac, ctx: c } = ctx();
    installShortcuts(c);
    const toggle = vi.fn();
    document.querySelector('.theme-toggle')!.addEventListener('click', toggle);
    key('t');
    expect(toggle).toHaveBeenCalledTimes(1);
    key('t', { ctrlKey: true });
    expect(toggle).toHaveBeenCalledTimes(1);
    const reboot = vi.fn();
    document.addEventListener('shell:reboot', reboot);
    key('r');
    expect(reboot).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.menu-route')!.getAttribute('aria-keyshortcuts')).toBe('P');
    const route = vi.fn((e: Event) => e.preventDefault());
    document.querySelector('.menu-route')!.addEventListener('click', route);
    key('p');
    expect(route).toHaveBeenCalledTimes(1);
    ac.abort();
    key('t');
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('the off switch silences every single key, hides the hints, and persists', async () => {
    localStorage.removeItem('krizdingus-xp-keys');
    const { installShortcuts } = await import('../src/themes/xp/shortcuts');
    const { ac, ctx: c } = ctx();
    installShortcuts(c);
    const toggle = vi.fn();
    document.querySelector('.theme-toggle')!.addEventListener('click', toggle);
    document.dispatchEvent(new CustomEvent('shell:keys-toggle'));
    expect(localStorage.getItem('krizdingus-xp-keys')).toBe('off');
    expect(document.documentElement.getAttribute('data-xp-keys')).toBe('off');
    expect(document.querySelector('.menu-route')!.hasAttribute('aria-keyshortcuts')).toBe(false);
    key('t');
    key('?', { shiftKey: true });
    expect(toggle).not.toHaveBeenCalled();
    expect(document.querySelector('[data-shortcuts-sheet]')).toBeNull();
    // The sheet (from the Start menu) carries the way back on.
    document.dispatchEvent(new CustomEvent('shell:shortcuts'));
    const btn = document.querySelector<HTMLButtonElement>('[data-shortcuts-sheet] [data-keys-toggle]')!;
    expect(btn.textContent).toBe('Turn keys on');
    btn.click();
    expect(localStorage.getItem('krizdingus-xp-keys')).toBeNull();
    expect(document.documentElement.hasAttribute('data-xp-keys')).toBe(false);
    expect(document.querySelector('.menu-route')!.getAttribute('aria-keyshortcuts')).toBe('P');
    key('Escape');
    key('t');
    expect(toggle).toHaveBeenCalledTimes(1);
    ac.abort();
  });
});

describe('XP shortcuts with the Krizscape window closed', () => {
  it('route keys and their cheat-sheet rows come from the nav data, not the window', async () => {
    vi.resetModules();
    document.body.innerHTML = '<main id="main" tabindex="-1"></main>';
    const { shortcutList } = await import('../src/themes/xp/shortcuts');
    const keys = shortcutList().map((s) => s.key);
    expect(keys).toEqual(expect.arrayContaining(['h', 'p', 'b', 'a']));
    expect(shortcutList().find((s) => s.key === 'p')!.label).toBe('Go to Projects');
  });
});

describe('Recycle Bin', () => {
  it('raises an in-page alertdialog that takes focus, inerts the page and closes on Esc', async () => {
    vi.resetModules();
    document.body.innerHTML = '<button id="bin">bin</button><main id="main" tabindex="-1">m</main>';
    const bin = document.getElementById('bin')!;
    bin.focus();
    const { openRecycleBin } = await import('../src/themes/xp/recycle');
    const dlg = openRecycleBin();
    expect(dlg.getAttribute('role')).toBe('alertdialog');
    expect(dlg.hasAttribute('data-fake-error')).toBe(true);
    expect(dlg.contains(document.activeElement)).toBe(true);
    expect(document.querySelector('main')!.inert).toBe(true);
    const details = Array.from(dlg.querySelectorAll('button')).find((b) => b.textContent === 'Details >>')!;
    expect(details.getAttribute('aria-expanded')).toBe('false');
    details.click();
    expect(details.getAttribute('aria-expanded')).toBe('true');
    expect(details.textContent).toBe('<< Details');
    expect(dlg.querySelector<HTMLElement>('#xp-recycle-details')!.hidden).toBe(false);
    details.click();
    expect(details.textContent).toBe('Details >>');
    expect(details.getAttribute('aria-expanded')).toBe('false');
    key('Escape');
    expect(document.querySelector('[data-fake-error]')).toBeNull();
    expect(document.querySelector('main')!.inert).toBe(false);
    expect(document.activeElement).toBe(bin);
  });
});

describe('egg tiles (XP dressing)', () => {
  it('mounts 8 working tiles into the slot: no Zyn Quest, no BBBS, no dead hotkeys', async () => {
    vi.resetModules();
    document.body.innerHTML = '<div class="kz-home"><div data-xp-slot="eggs"></div></div>';
    const { mount } = await import('../src/themes/xp/dressing/eggs.dressing');
    const nodes = mount({} as any) as HTMLElement[];
    expect(nodes).toHaveLength(1);
    const tiles = document.querySelectorAll('[data-xp-slot="eggs"] .kz-egg');
    expect(tiles).toHaveLength(8);
    const text = document.body.textContent!;
    expect(text).not.toMatch(/zyn|bbbs|retrospective|ctrl|alt\s*\+/i);
    expect(text).toContain('6 fake operating systems');
    tiles.forEach((t) => {
      const ok = t.hasAttribute('data-egg') || t.hasAttribute('data-menu-action') || t.getAttribute('href') === '/panic/';
      expect(ok).toBe(true);
    });
  });
});

describe('Krizscape window chrome', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useRealTimers();
    document.body.className = 'has-desktop';
    document.body.innerHTML = `
      <button data-shell-launch>icon</button>
      <div class="os-shell"><div class="title-bar">
        <button class="window-btn" data-window-action="minimize">_</button>
        <button class="window-btn" data-window-action="close">x</button>
      </div><main id="main" tabindex="-1"></main></div>
      <div class="desktop-taskbar"><button class="tb-window is-active" data-desktop-action="restore">K</button></div>`;
  });

  it('minimize hands focus to the taskbar button, close to the desktop icon', async () => {
    const { installOSChrome, wireShell } = await import('../src/themes/xp/os-chrome');
    const ac = new AbortController();
    const shell = document.querySelector<HTMLElement>('.os-shell')!;
    installOSChrome(ac.signal);
    wireShell(shell, ac.signal);
    const min = shell.querySelector<HTMLButtonElement>('[data-window-action="minimize"]')!;
    min.focus();
    min.click();
    expect(document.activeElement).toBe(document.querySelector('.tb-window'));
    document.dispatchEvent(new CustomEvent('shell:restore'));
    const close = shell.querySelector<HTMLButtonElement>('[data-window-action="close"]')!;
    close.focus();
    close.click();
    expect(document.querySelector('.os-shell')).toBeNull();
    expect(document.activeElement).toBe(document.querySelector('[data-shell-launch]'));
    ac.abort();
  });

  it('maximize clears a dragged box and Restore puts it back; a title-bar double-click does the same', async () => {
    const shell = document.querySelector<HTMLElement>('.os-shell')!;
    shell.querySelector('.title-bar')!.insertAdjacentHTML('beforeend',
      '<button class="window-btn" data-window-action="maximize" aria-label="Maximize" title="Maximize"><span class="win-glyph win-glyph-max"></span></button>');
    const { wireShell } = await import('../src/themes/xp/os-chrome');
    const { installWindows } = await import('../src/themes/xp/windows');
    const ac = new AbortController();
    installWindows(ac.signal);
    wireShell(shell, ac.signal);
    shell.style.position = 'fixed';
    shell.style.left = '-80px';
    shell.style.top = '56px';
    shell.style.width = '1200px';
    shell.querySelector('.title-bar')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(shell.classList.contains('is-maximized')).toBe(true);
    expect(shell.style.left).toBe('');
    expect(shell.style.width).toBe('');
    shell.querySelector('.title-bar')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(shell.classList.contains('is-maximized')).toBe(false);
    expect(shell.style.left).toBe('-80px');
    expect(shell.style.top).toBe('56px');
    expect(shell.style.width).toBe('1200px');
    // A double-click on the buttons themselves isn't a title-bar double-click.
    shell.querySelector<HTMLElement>('[data-window-action="maximize"]')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(shell.classList.contains('is-maximized')).toBe(false);
    ac.abort();
  });

  it('maximize turns the button into Restore, and back', async () => {
    const shell = document.querySelector<HTMLElement>('.os-shell')!;
    shell.querySelector('.title-bar')!.insertAdjacentHTML('beforeend',
      '<button class="window-btn" data-window-action="maximize" aria-label="Maximize" title="Maximize"><span class="win-glyph win-glyph-max"></span></button>');
    const { wireShell } = await import('../src/themes/xp/os-chrome');
    const ac = new AbortController();
    wireShell(shell, ac.signal);
    const max = shell.querySelector<HTMLButtonElement>('[data-window-action="maximize"]')!;
    max.click();
    expect(shell.classList.contains('is-maximized')).toBe(true);
    expect(max.getAttribute('aria-label')).toBe('Restore');
    expect(max.title).toBe('Restore');
    expect(max.querySelector('.win-glyph-restore')).not.toBeNull();
    expect(max.hasAttribute('aria-pressed')).toBe(false);
    max.click();
    expect(max.getAttribute('aria-label')).toBe('Maximize');
    expect(max.querySelector('.win-glyph-max')).not.toBeNull();
    ac.abort();
  });

  it('reboot powers off first: the window closes and the screen blacks out', async () => {
    vi.useFakeTimers();
    window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any;
    const boot = await import('../src/themes/xp/boot');
    const play = vi.spyOn(boot, 'playBoot').mockResolvedValue('done');
    const { installOSChrome } = await import('../src/themes/xp/os-chrome');
    const ac = new AbortController();
    installOSChrome(ac.signal);
    document.dispatchEvent(new CustomEvent('shell:reboot'));
    const shell = document.querySelector('.os-shell')!;
    expect(shell.classList.contains('is-closing')).toBe(true);
    document.dispatchEvent(new CustomEvent('shell:reboot')); // ignored mid power-off
    vi.advanceTimersByTime(300);
    expect(document.querySelector('.crt-blackout')).not.toBeNull();
    expect(play).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(play).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.crt-blackout')).toBeNull();
    expect(shell.classList.contains('is-closing')).toBe(false);
    ac.abort();
    vi.useRealTimers();
  });
});

describe('Screen effects switch', () => {
  it('Settings turns the scanlines and CRT glitches off and on, and remembers', async () => {
    vi.resetModules();
    localStorage.removeItem('krizdingus-xp-fx');
    window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any;
    (HTMLCanvasElement.prototype as any).getContext = () => null;
    document.body.innerHTML =
      '<button class="mi" role="menuitemcheckbox" data-menu-action="fx-toggle" aria-checked="true"><span class="chk">✓</span>Screen effects</button>';
    const { installScreenFx, FX_STORAGE } = await import('../src/themes/xp/screen-fx');
    const ac = new AbortController();
    installScreenFx(ac.signal);
    expect(document.querySelector('.crt-screen-fx')).not.toBeNull();
    expect(document.getElementById('scanlines-canvas')).not.toBeNull();
    document.dispatchEvent(new CustomEvent('shell:fx-toggle'));
    expect(localStorage.getItem(FX_STORAGE)).toBe('off');
    expect(document.querySelector('.crt-screen-fx')).toBeNull();
    expect(document.getElementById('scanlines-canvas')).toBeNull();
    const row = document.querySelector('[data-menu-action="fx-toggle"]')!;
    expect(row.getAttribute('aria-checked')).toBe('false');
    ac.abort();
    // Next page: still off.
    const ac2 = new AbortController();
    installScreenFx(ac2.signal);
    expect(document.querySelector('.crt-screen-fx')).toBeNull();
    document.dispatchEvent(new CustomEvent('shell:fx-toggle'));
    expect(localStorage.getItem(FX_STORAGE)).toBeNull();
    expect(document.querySelector('.crt-screen-fx')).not.toBeNull();
    expect(row.getAttribute('aria-checked')).toBe('true');
    ac2.abort();
    expect(document.querySelector('.crt-screen-fx')).toBeNull();
  });

  it('the glitches stop by themselves after a few bursts', async () => {
    vi.resetModules();
    vi.useFakeTimers();
    window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any;
    document.body.innerHTML = '';
    const { installCrtFx, CRT_FX_BURSTS } = await import('../src/themes/xp/desktop');
    const ac = new AbortController();
    installCrtFx(ac.signal);
    const fx = document.querySelector('.crt-screen-fx')!;
    let bursts = 0;
    for (let i = 0; i < 40; i++) {
      vi.advanceTimersByTime(1000);
      if (/fx-/.test(fx.className)) { bursts++; vi.advanceTimersByTime(1500); }
    }
    expect(bursts).toBe(CRT_FX_BURSTS);
    ac.abort();
    vi.useRealTimers();
  });
});
