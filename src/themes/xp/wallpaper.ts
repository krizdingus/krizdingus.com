// src/themes/xp/wallpaper.ts — desktop wallpaper choice (XP theme).
const STORAGE_KEY = 'krizdingus-wallpaper';

export const WALLPAPERS = ['xp', 'canyons', 'tulips', 'generic'] as const;
export type Wallpaper = (typeof WALLPAPERS)[number];
const DEFAULT: Wallpaper = 'xp';

function isWallpaper(v: string | null): v is Wallpaper {
  return v !== null && (WALLPAPERS as readonly string[]).includes(v);
}

function getStored(): Wallpaper | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isWallpaper(v) ? v : null;
  } catch {
    return null;
  }
}

function syncCheckmarks(active: Wallpaper): void {
  document.querySelectorAll<HTMLElement>('[data-menu-action="wallpaper"]').forEach((el) => {
    const chk = el.querySelector<HTMLElement>('.chk');
    if (el.hasAttribute('aria-checked')) el.setAttribute('aria-checked', String(el.dataset.value === active));
    if (!chk) return;
    chk.textContent = el.dataset.value === active ? '●' : '';
  });
}

export function applyWallpaper(value: Wallpaper): void {
  if (!isWallpaper(value)) {
    applyWallpaper(DEFAULT);
    return;
  }
  document.documentElement.setAttribute('data-wallpaper', value);
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* storage disabled — non-fatal */
  }
  syncCheckmarks(value);
}

export function cycleWallpaper(): void {
  const current = (document.documentElement.getAttribute('data-wallpaper') as Wallpaper | null) ?? DEFAULT;
  const idx = WALLPAPERS.indexOf(current);
  const next = WALLPAPERS[(idx + 1) % WALLPAPERS.length];
  applyWallpaper(next);
}

export function initWallpaper(signal?: AbortSignal): void {
  applyWallpaper(getStored() ?? DEFAULT);

  document.querySelectorAll<HTMLElement>('[data-menu-action="wallpaper"]').forEach((el) => {
    el.addEventListener(
      'click',
      () => {
        const v = el.dataset.value;
        if (isWallpaper(v ?? null)) applyWallpaper(v as Wallpaper);
      },
      { signal },
    );
  });
}
