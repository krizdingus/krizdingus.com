// Page "set dressing" that only makes sense on the XP desktop (marquee,
// counters, LEDs, progress bars...). Normal-mode HTML never ships it: each
// piece adds a module here that builds its dressing at mount and removes it
// on cleanup. Modules are picked up by the glob, so no file needs editing to
// add one.
import type { ThemeContext } from '../../types';

export interface DressingModule {
  /** Build dressing into the current page. Return nodes to remove on unmount. */
  mount(ctx: ThemeContext): HTMLElement[] | void;
}

const modules = import.meta.glob<DressingModule>('./*.dressing.ts', { eager: true });

export function mountDressing(ctx: ThemeContext): HTMLElement[] {
  const added: HTMLElement[] = [];
  for (const mod of Object.values(modules)) {
    try {
      const nodes = mod.mount(ctx);
      if (nodes) added.push(...nodes);
    } catch (err) {
      console.warn('xp dressing failed', err);
    }
  }
  return added;
}
