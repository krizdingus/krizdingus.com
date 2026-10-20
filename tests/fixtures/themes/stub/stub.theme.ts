// tests/fixtures/themes/stub/stub.theme.ts — mounts one node, cleans it up.
import type { ThemeContext, ThemeModule } from '../../../../src/themes/types';

export const styles: string[] = [];

export function mount(ctx: ThemeContext): void {
  const n = document.createElement('div');
  n.className = 'stub-chrome';
  document.body.appendChild(n);
  ctx.onCleanup(() => n.remove());
}

export function unmount(): void {}

const theme: ThemeModule = { styles, mount, unmount };
export default theme;
