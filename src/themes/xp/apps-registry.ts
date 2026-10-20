// src/themes/xp/apps-registry.ts — the XP desktop's mini-apps.
// Plain data inside the theme chunk, so normal mode never downloads it (it
// used to be inlined into every page as window.__KRIZAPPS_REGISTRY). Only
// published apps belong here: a draft in src/content/apps/ stays out, and
// tests/apps.test.ts checks this list against the non-draft entries there.
export interface AppRegistryEntry {
  title: string;
  taskbar_label: string;
  slug: string;
  chrome: 'mk' | 'gk';
  width: number;
  height: number;
  icon_html: string;
  title_icon_html: string;
  desktop_icon_html: string;
}

export const APPS: Record<string, AppRegistryEntry> = {
  mediakruzer: {
    title: 'MEDIAKRUZER 7.0',
    taskbar_label: 'MediaKruzer 7.0',
    slug: 'mediakruzer',
    chrome: 'mk',
    // Same width as the Krizscape window (1200px max), so the two line up;
    // at 1120 the right edge landed on a wallpaper cloud's tip at 1440.
    width: 1200,
    height: 780,
    icon_html: '<span class="app-task-ico app-task-ico--mk" aria-hidden="true"><span></span><span></span></span>',
    title_icon_html: '<span class="exe-icon kw-exe kw-exe--mk" aria-hidden="true"></span>',
    desktop_icon_html:
      '<span class="ico ico-tape" aria-hidden="true"><span class="ico-tape-reel"></span><span class="ico-tape-reel right"></span></span>',
  },
};

export function getApp(key: string): AppRegistryEntry | undefined {
  return Object.prototype.hasOwnProperty.call(APPS, key) ? APPS[key] : undefined;
}

export function allApps(): AppRegistryEntry[] {
  return Object.values(APPS);
}

export function appKeys(): string[] {
  return Object.keys(APPS);
}
