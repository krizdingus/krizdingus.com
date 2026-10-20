import { describe, it, expect } from 'vitest';
import { BOOT_THEMES, type BootThemeKey } from '../src/themes/xp/boot';

describe('BOOT_THEMES', () => {
  // The six originals from the old site's scripts.js.
  const keys: BootThemeKey[] = [
    'chrono-terminal',
    'bambuos',
    'terminal-crimewave',
    'bootleg-hero',
    'multimedios-98',
    'lan-party',
  ];

  it.each(keys)('theme %s has required fields', (key) => {
    const theme = BOOT_THEMES[key];
    expect(theme).toBeDefined();
    expect(typeof theme.label).toBe('string');
    expect(theme.label.length).toBeGreaterThan(0);
    expect(Array.isArray(theme.lines)).toBe(true);
    expect(theme.lines.length).toBeGreaterThan(5);
  });

  it('exposes exactly the 6 original theme keys', () => {
    expect(Object.keys(BOOT_THEMES).sort()).toEqual([...keys].sort());
  });

  it('every line has a kind, text, and cssType', () => {
    for (const theme of Object.values(BOOT_THEMES)) {
      for (const line of theme.lines) {
        expect(['typing', 'dots', 'progress', 'plain']).toContain(line.kind);
        expect(typeof line.text).toBe('string');
        expect(typeof line.cssType).toBe('string');
      }
    }
  });
});

describe('playBoot focus containment', () => {
  it('makes the page behind the overlay inert, wraps Tab, and releases it on skip', async () => {
    const { playBoot } = await import('../src/themes/xp/boot');
    document.body.innerHTML = '<a class="skip" href="#main">skip</a><div data-site><main id="main" tabindex="-1">x</main></div>';
    const site = document.querySelector<HTMLElement>('[data-site]')!;
    const done = playBoot({ theme: 'multimedios-98' });
    const overlay = document.querySelector<HTMLElement>('[data-boot]')!;
    expect(overlay.getAttribute('aria-modal')).toBe('true');
    expect(site.inert).toBe(true);
    expect(document.querySelector<HTMLElement>('.skip')!.inert).toBe(true);
    const btns = overlay.querySelectorAll<HTMLElement>('button');
    expect(document.activeElement).toBe(btns[0]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(btns[1]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(btns[0]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(btns[1]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(await done).toBe('skipped');
    expect(site.inert).toBe(false);
    expect(document.querySelector('[data-boot]')).toBeNull();
  });
});

describe('boot theme choice', () => {
  it('is random until picked, then sticky; None plays no BIOS lines; the egg steps through all six', async () => {
    localStorage.clear();
    const { getBootChoice, setBootChoice, resolveBootTheme, nextBootTheme, BOOT_ORDER } = await import('../src/themes/xp/boot');
    expect(getBootChoice()).toBe('random');
    expect(BOOT_ORDER).toContain(resolveBootTheme());
    setBootChoice('lan-party');
    expect(getBootChoice()).toBe('lan-party');
    expect(resolveBootTheme()).toBe('lan-party');
    setBootChoice('none');
    expect(resolveBootTheme()).toBeNull();
    setBootChoice('random');
    expect(localStorage.getItem('krizdingus-boot-theme')).toBeNull();
    setBootChoice('chrono-terminal');
    const seen = new Set<string>();
    for (let i = 0; i < 6; i++) {
      const n = nextBootTheme();
      seen.add(n);
      setBootChoice(n);
    }
    expect(seen.size).toBe(6);
  });

  it('no boot line names gear that is not in use', async () => {
    const { BOOT_THEMES } = await import('../src/themes/xp/boot');
    const all = Object.values(BOOT_THEMES).flatMap((t) => t.lines.map((l) => l.text)).join('\n');
    expect(all).not.toMatch(/\bP1S\b/);
    expect(all).not.toMatch(/anime\.js/i);
    expect(all).toMatch(/X1C/);
  });
});
