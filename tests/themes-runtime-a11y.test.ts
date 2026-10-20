// tests/themes-runtime-a11y.test.ts — the runtime's two WCAG fixes:
// the typed egg word (2.1.4: typed in one go, off with the theme's keys) and
// the switch on a too-narrow desktop window (greyed out with its reason, not gone).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ThemeEntry, ThemeModule } from '../src/themes/types';

let available = true;
let finePointer = true;

function mockMatchMedia(): void {
  vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
    get matches() {
      if (q.includes('reduced-motion') || q.includes('prefers-color-scheme')) return false;
      if (q === '(pointer: fine)') return finePointer;
      return available;
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

function theme(): ThemeEntry {
  const mod: ThemeModule = { mount() {}, unmount() {} };
  return {
    manifest: {
      id: 'demo',
      name: 'Demo mode',
      description: 'A demo.',
      availability: '(min-width: 1024px)',
      needs: 'a wide window',
      egg: 'boot',
    },
    load: async () => mod,
  };
}

const type = (word: string): void => {
  for (const k of word) document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
};

beforeEach(() => {
  available = true;
  finePointer = true;
  localStorage.clear();
  document.documentElement.removeAttribute('data-skin');
  document.body.innerHTML = '<button data-theme-switch="demo" hidden title="A demo.">in</button>';
  vi.restoreAllMocks();
  mockMatchMedia();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('typed egg word', () => {
  it('starts over after a pause longer than a second', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const rt = createThemeRuntime({ entries: [theme()] });
    await rt.init();
    type('b');
    vi.setSystemTime(Date.now() + 5000);
    type('oo');
    vi.setSystemTime(Date.now() + 3000);
    type('t');
    await rt.switchTo(rt.active(), { persist: false });
    expect(rt.active()).toBeNull();
    expect(localStorage.getItem('krizdingus-skin')).toBeNull();
    type('boot');
    await rt.switchTo('demo', { persist: false });
    expect(rt.active()).toBe('demo');
    rt.destroy();
  });

  it('is off while the theme’s single-key shortcuts are off', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    const { keysStorageKey } = await import('../src/themes/manifests');
    expect(keysStorageKey('xp')).toBe('krizdingus-xp-keys');
    localStorage.setItem(keysStorageKey('demo'), 'off');
    const rt = createThemeRuntime({ entries: [theme()] });
    await rt.init();
    type('boot');
    await rt.switchTo(rt.active(), { persist: false });
    expect(rt.active()).toBeNull();
    expect(localStorage.getItem('krizdingus-skin')).toBeNull();
    rt.destroy();
  });
});

describe('switch where the theme is unavailable', () => {
  const sw = (): HTMLButtonElement => document.querySelector<HTMLButtonElement>('[data-theme-switch="demo"]')!;

  it('stays visible, aria-disabled, with the reason, on a fine-pointer window; click does nothing', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    available = false;
    const rt = createThemeRuntime({ entries: [theme()] });
    await rt.init();
    expect(sw().hidden).toBe(false);
    expect(sw().getAttribute('aria-disabled')).toBe('true');
    expect(sw().title).toBe('Demo mode needs a wide window.');
    localStorage.setItem('krizdingus-skin', 'demo');
    sw().click();
    await rt.switchTo(rt.active(), { persist: false });
    expect(rt.active()).toBeNull();
    expect(localStorage.getItem('krizdingus-skin')).toBe('demo'); // the stored choice is left alone

    available = true;
    rt.syncControls();
    expect(sw().hasAttribute('aria-disabled')).toBe(false);
    expect(sw().title).toBe('A demo.');
    rt.destroy();
  });

  it('is hidden on a touch screen', async () => {
    const { createThemeRuntime } = await import('../src/themes/runtime');
    available = false;
    finePointer = false;
    const rt = createThemeRuntime({ entries: [theme()] });
    await rt.init();
    expect(sw().hidden).toBe(true);
    expect(sw().hasAttribute('aria-disabled')).toBe(false);
    rt.destroy();
  });
});
