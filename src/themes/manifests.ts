// src/themes/manifests.ts
// Every theme's manifest, discovered from src/themes/<id>/manifest.ts.
// Safe to import anywhere (BaseLayout frontmatter, the head kicker, the
// runtime): it pulls in data only, never theme code.
import type { ThemeManifest } from './types';

/** Manifests from an eager `<id>/manifest.ts` glob, in folder order.
 *  Exported so the contract test can run it over a fixture folder. */
export function collectManifests(found: Record<string, { default: ThemeManifest }>): ThemeManifest[] {
  return Object.keys(found)
    .sort()
    .map((path) => found[path].default);
}

export const themeManifests: ThemeManifest[] = collectManifests(
  import.meta.glob<{ default: ThemeManifest }>('./*/manifest.ts', { eager: true }),
);

/** localStorage key for the chosen theme. Absent = normal mode. */
export const SKIN_STORAGE_KEY = 'krizdingus-skin';

/** localStorage key for a theme's single-key shortcuts setting. 'off' turns
 *  the theme's keys off and its typed egg word in normal mode with them. */
export function keysStorageKey(id: string): string {
  return `krizdingus-${id}-keys`;
}

/** The theme the app routes (/apps/*) open in, if any. */
export function appRoutesTheme(manifests: ThemeManifest[] = themeManifests): ThemeManifest | undefined {
  return manifests.find((m) => m.appRoutes);
}

/** Normal-mode CSS that keeps each theme's own page markup hidden unless
 *  that theme is mounted: `data-skin-only="<id>"` plus the manifest's `owns`
 *  selectors. `data-skin-fallback="<id>"` is the reverse (shown until that
 *  theme mounts: the /apps/* lock notice). Generated from the manifests and inlined in <head>, so a new
 *  theme needs no edit to any stylesheet. */
export function skinOnlyCss(manifests: ThemeManifest[] = themeManifests): string {
  const rules = manifests.map((m) => {
    const id = JSON.stringify(m.id);
    const sel = [`[data-skin-only~=${id}]`, ...(m.owns ?? [])].join(',');
    return `:root:not([data-skin=${id}]) :is(${sel}){display:none!important}` +
      `:root[data-skin=${id}] [data-skin-fallback~=${id}]{display:none!important}`;
  });
  // Normal mode also hides marks for ids no theme claims.
  return ':root:not([data-skin]) [data-skin-only]{display:none!important}' + rules.join('');
}
