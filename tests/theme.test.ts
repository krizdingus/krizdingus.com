import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('theme.ts', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    document.body.innerHTML = '<button class="tray-btn theme-toggle" aria-label="Toggle theme"></button>';
    vi.resetModules();
  });

  it('initTheme applies stored theme to <html>', async () => {
    localStorage.setItem('krizdingus-theme', 'dark');
    const { initTheme } = await import('../src/scripts/theme');
    initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('initTheme falls back to system preference when no stored value', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((q) => ({
      matches: q.includes('dark'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const { initTheme } = await import('../src/scripts/theme');
    initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('clicking .theme-toggle flips data-theme and persists', async () => {
    localStorage.setItem('krizdingus-theme', 'light');
    const { initTheme } = await import('../src/scripts/theme');
    initTheme();
    const btn = document.querySelector<HTMLButtonElement>('.theme-toggle')!;
    btn.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('krizdingus-theme')).toBe('dark');
  });
});

describe('display menu: Auto, Light, Dark', () => {
  const MENU = `
    <div data-display>
      <button class="theme-toggle"></button>
      <button data-display-open aria-expanded="false" aria-controls="display-menu"></button>
      <div id="display-menu" hidden>
        <button data-scheme="auto" aria-pressed="false"></button>
        <button data-scheme="light" aria-pressed="false"></button>
        <button data-scheme="dark" aria-pressed="false"></button>
        <button data-display-close aria-pressed="true"></button>
      </div>
    </div>
    <a href="#" id="outside">outside</a>`;

  function mockSystem(dark: boolean) {
    vi.spyOn(window, 'matchMedia').mockImplementation((q) => ({
      matches: dark && q.includes('dark'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
  }
  const pressed = () =>
    [...document.querySelectorAll<HTMLElement>('[data-scheme]')]
      .filter((b) => b.getAttribute('aria-pressed') === 'true')
      .map((b) => b.dataset.scheme);
  const q = (s: string) => document.querySelector<HTMLElement>(s)!;

  beforeEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    document.body.innerHTML = MENU;
    vi.resetModules();
  });

  it('with nothing stored, Auto is the pick and the page follows the device', async () => {
    mockSystem(true);
    const { initTheme } = await import('../src/scripts/theme');
    initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(pressed()).toEqual(['auto']);
  });

  it('the arrow opens and closes the menu; Escape closes it and returns focus', async () => {
    mockSystem(false);
    const { initTheme } = await import('../src/scripts/theme');
    initTheme();
    const opener = q('[data-display-open]');
    opener.click();
    expect(opener.getAttribute('aria-expanded')).toBe('true');
    expect(q('#display-menu').hidden).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(q('#display-menu').hidden).toBe(true);
    expect(document.activeElement).toBe(opener);
    opener.click();
    q('#outside').click();
    expect(q('#display-menu').hidden).toBe(true);
  });

  it('Dark stores the choice; Auto forgets it and goes back to the device', async () => {
    mockSystem(false);
    const { initTheme } = await import('../src/scripts/theme');
    initTheme();
    q('[data-display-open]').click();
    q('[data-scheme="dark"]').click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('krizdingus-theme')).toBe('dark');
    expect(pressed()).toEqual(['dark']);
    expect(q('#display-menu').hidden).toBe(true);
    q('[data-scheme="auto"]').click();
    expect(localStorage.getItem('krizdingus-theme')).toBeNull();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(pressed()).toEqual(['auto']);
  });

  it('the quick toggle still flips and stores, and the menu shows the new pick', async () => {
    mockSystem(false);
    const { initTheme } = await import('../src/scripts/theme');
    initTheme();
    q('.theme-toggle').click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(pressed()).toEqual(['dark']);
  });
});
