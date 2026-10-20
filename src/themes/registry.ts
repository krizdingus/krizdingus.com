// src/themes/registry.ts
// Pairs each manifest with a lazy loader for its theme module. A theme is a
// folder: src/themes/<id>/manifest.ts + src/themes/<id>/<id>.theme.ts. Both
// globs pick a new folder up on their own, so theme #2 needs no edits here.
//
// The loader glob is lazy: Vite emits each <id>.theme.ts as its own chunk
// (named "<id>.theme.<hash>.js") that is only fetched when that theme mounts.
import { themeManifests } from './manifests';
import type { ThemeEntry, ThemeManifest, ThemeModule } from './types';

type Loaders = Record<string, () => Promise<ThemeModule>>;

/** Pair manifests with `<id>/<id>.theme.ts` loaders from a glob. Exported so
 *  the contract test can run the same discovery over a fixture folder. */
export function pairThemes(manifests: ThemeManifest[], loaders: Loaders): ThemeEntry[] {
  return manifests.flatMap((manifest) => {
    const suffix = `/${manifest.id}/${manifest.id}.theme.ts`;
    const key = Object.keys(loaders).find((k) => k.endsWith(suffix));
    if (!key) {
      console.warn(`[themes] "${manifest.id}" has a manifest but no ${manifest.id}.theme.ts`);
      return [];
    }
    return [{ manifest, load: loaders[key] }];
  });
}

export const themeEntries: ThemeEntry[] = pairThemes(
  themeManifests,
  import.meta.glob<ThemeModule>('./*/*.theme.ts'),
);
