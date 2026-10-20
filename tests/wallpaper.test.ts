import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('wallpaper.ts', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-wallpaper');
    localStorage.clear();
    document.body.innerHTML = '';
    vi.resetModules();
  });

  it('initWallpaper applies stored wallpaper to <html>', async () => {
    localStorage.setItem('krizdingus-wallpaper', 'canyons');
    const { initWallpaper } = await import('../src/themes/xp/wallpaper');
    initWallpaper();
    expect(document.documentElement.getAttribute('data-wallpaper')).toBe('canyons');
  });

  it('initWallpaper defaults to "xp" when no stored value', async () => {
    const { initWallpaper } = await import('../src/themes/xp/wallpaper');
    initWallpaper();
    expect(document.documentElement.getAttribute('data-wallpaper')).toBe('xp');
  });

  it('applyWallpaper persists to localStorage and syncs check marks', async () => {
    document.body.innerHTML = `
      <div class="mi" data-menu-action="wallpaper" data-value="xp"><span class="chk">●</span></div>
      <div class="mi" data-menu-action="wallpaper" data-value="tulips"><span class="chk"></span></div>
    `;
    const { applyWallpaper } = await import('../src/themes/xp/wallpaper');
    applyWallpaper('tulips');
    expect(document.documentElement.getAttribute('data-wallpaper')).toBe('tulips');
    expect(localStorage.getItem('krizdingus-wallpaper')).toBe('tulips');
    const xpChk = document.querySelector<HTMLElement>('[data-value="xp"] .chk')!;
    const tulipsChk = document.querySelector<HTMLElement>('[data-value="tulips"] .chk')!;
    expect(xpChk.textContent).toBe('');
    expect(tulipsChk.textContent).toBe('●');
  });

  it('rejects unknown wallpaper key (falls back to xp)', async () => {
    const { applyWallpaper } = await import('../src/themes/xp/wallpaper');
    applyWallpaper('bogus' as never);
    expect(document.documentElement.getAttribute('data-wallpaper')).toBe('xp');
  });
});
