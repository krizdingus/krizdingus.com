// src/themes/xp/eggs.ts — what the egg tiles do (see dressing/eggs.dressing.ts
// for the tiles themselves). One delegated listener on the theme's signal, so
// unmount removes it and tiles injected later work too.
import { cycleWallpaper } from './wallpaper';
import { BOOT_THEMES, nextBootTheme, setBootChoice, playBoot } from './boot';
import { openRecycleBin } from './recycle';
import { openCheatSheet } from './shortcuts';

/** Theme flip and reboot ride the shared [data-menu-action] handlers
 *  (theme.ts and os-chrome.ts); these are the egg-only actions. */
export function runEgg(egg: string, el: HTMLElement, signal?: AbortSignal): boolean {
  switch (egg) {
    case 'wallpaper':
      cycleWallpaper();
      return true;
    case 'boot-theme': {
      const next = nextBootTheme();
      setBootChoice(next);
      const sub = el.querySelector<HTMLElement>('[data-egg-status]');
      if (sub) sub.textContent = `now: ${BOOT_THEMES[next].label}`;
      void playBoot({ theme: next });
      return true;
    }
    case 'mediakruzer':
      window.KrizApps?.open?.('mediakruzer');
      return true;
    case 'recycle':
      openRecycleBin(signal);
      return true;
    case 'shortcuts':
      openCheatSheet(signal);
      return true;
  }
  return false;
}

export function installEggs(signal: AbortSignal): void {
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-egg]');
    if (!el) return;
    if (runEgg(el.dataset.egg ?? '', el, signal)) e.preventDefault();
  }, { signal });
}
