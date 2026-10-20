// tests/desktop.test.ts — XP theme desktop (src/themes/xp/desktop.ts)
import { describe, it, expect, beforeEach } from 'vitest';

describe('xp desktop', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('ensureDesktopShell injects the desktop, taskbar and Start menu', async () => {
    const { ensureDesktopShell } = await import('../src/themes/xp/desktop');
    ensureDesktopShell();
    expect(document.querySelector('.desktop-layer')).not.toBeNull();
    expect(document.querySelector('.desktop-icons')).not.toBeNull();
    expect(document.querySelector('.desktop-taskbar')).not.toBeNull();
    expect(document.querySelector('.start-btn')).not.toBeNull();
    expect(document.querySelector('#start-menu')).not.toBeNull();
  });

  it('is idempotent and returns the nodes it owns', async () => {
    const { ensureDesktopShell } = await import('../src/themes/xp/desktop');
    const a = ensureDesktopShell();
    const b = ensureDesktopShell();
    expect(document.querySelectorAll('.desktop-layer').length).toBe(1);
    expect(b).toEqual(a);
    a.forEach((n) => n.remove());
    expect(document.body.children.length).toBe(0);
  });

  it('lifts #start-menu out of .desktop-layer to <body> for z-index reasons', async () => {
    const { ensureDesktopShell } = await import('../src/themes/xp/desktop');
    ensureDesktopShell();
    const host = document.getElementById('start-menu')!.parentElement!;
    expect(host.parentElement).toBe(document.body);
    expect(host.getAttribute('role')).toBe('region');
  });

  it('injects 7 desktop icons (Web included) and a relaunch handle', async () => {
    const { ensureDesktopShell } = await import('../src/themes/xp/desktop');
    ensureDesktopShell();
    expect(document.querySelectorAll('.desktop-icon').length).toBe(7);
    expect(document.querySelector('.desktop-icon[href="/web/"]')).not.toBeNull();
    expect(document.querySelector('#start-fly-programs [data-menu-action="go-web"]')).not.toBeNull();
    expect(document.querySelector('[data-shell-launch]')).not.toBeNull();
  });

  it('offers a visible way back to normal mode and no dead hotkey hints', async () => {
    const { ensureDesktopShell } = await import('../src/themes/xp/desktop');
    ensureDesktopShell();
    expect(document.querySelector('.taskbar-tray [data-theme-switch="normal"]')).not.toBeNull();
    expect(document.body.innerHTML).not.toMatch(/Ctrl\+[TNP]|Alt\+F4/);
  });

  it('installDesktop listeners stop when the signal aborts', async () => {
    const { ensureDesktopShell, installDesktop } = await import('../src/themes/xp/desktop');
    ensureDesktopShell();
    const ac = new AbortController();
    installDesktop(ac.signal);
    const btn = document.querySelector<HTMLButtonElement>('.start-btn')!;
    btn.click();
    expect(document.getElementById('start-menu')!.classList.contains('is-open')).toBe(true);
    btn.click();
    ac.abort();
    btn.click();
    expect(document.getElementById('start-menu')!.classList.contains('is-open')).toBe(false);
  });
  it('Start menu rows are real buttons with menu roles', async () => {
    const { ensureDesktopShell } = await import('../src/themes/xp/desktop');
    ensureDesktopShell();
    const rows = document.querySelectorAll('#start-menu .mi');
    expect(rows.length).toBeGreaterThan(10);
    rows.forEach((r) => {
      expect(r.tagName).toBe('BUTTON');
      expect(['menuitem', 'menuitemradio', 'menuitemcheckbox']).toContain(r.getAttribute('role'));
    });
  });

  it('Start menu works from the keyboard: open, arrows, flyout, submenu, Esc', async () => {
    const { ensureDesktopShell, installDesktop } = await import('../src/themes/xp/desktop');
    ensureDesktopShell();
    const ac = new AbortController();
    installDesktop(ac.signal);
    const key = (el: Element, k: string) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    const start = document.querySelector<HTMLButtonElement>('.start-btn')!;
    start.focus();
    key(start, 'ArrowDown');
    expect(start.getAttribute('aria-expanded')).toBe('true');
    const programs = document.querySelector('[data-fly="programs"]')!;
    expect(document.activeElement).toBe(programs);
    key(programs, 'ArrowDown');
    const settings = document.querySelector('[data-fly="settings"]')!;
    expect(document.activeElement).toBe(settings);
    key(settings, 'ArrowRight');
    expect(settings.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.getAttribute('data-menu-action')).toBe('theme-toggle');
    key(document.activeElement!, 'ArrowDown');
    const wall = document.activeElement as HTMLElement;
    expect(wall.classList.contains('has-sub')).toBe(true);
    key(wall, 'ArrowRight');
    expect(wall.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.getAttribute('data-menu-action')).toBe('wallpaper');
    key(document.activeElement!, 'Escape');
    expect(document.activeElement).toBe(wall);
    expect(wall.getAttribute('aria-expanded')).toBe('false');
    key(wall, 'ArrowLeft');
    expect(document.activeElement).toBe(settings);
    expect(settings.getAttribute('aria-expanded')).toBe('false');
    key(settings, 'Escape');
    expect(document.activeElement).toBe(start);
    expect(document.getElementById('start-menu')!.classList.contains('is-open')).toBe(false);
    ac.abort();
  });

  it('keeps the skip link as the first tab stop', async () => {
    document.body.innerHTML = '<a class="skip-link" href="#main">Skip</a><main id="main"></main>';
    const { ensureDesktopShell } = await import('../src/themes/xp/desktop');
    ensureDesktopShell();
    expect(document.body.firstElementChild?.classList.contains('skip-link')).toBe(true);
    expect(document.body.children[1]?.classList.contains('desktop-layer')).toBe(true);
  });
});
