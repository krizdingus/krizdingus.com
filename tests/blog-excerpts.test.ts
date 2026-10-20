// The theme-system post quotes src/themes/ verbatim. If the framework code
// changes under it, this fails until the post is updated to match.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '..');
const POST = join(root, 'src/content/blog/a-theme-is-a-folder.md');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe('a-theme-is-a-folder.md excerpts', () => {
  const sources = walk(join(root, 'src/themes')).map((f) => readFileSync(f, 'utf8'));
  const blocks = [...readFileSync(POST, 'utf8').matchAll(/```\w*\n([\s\S]*?)```/g)].map((m) => m[1]);

  it('has code excerpts', () => {
    expect(blocks.length).toBeGreaterThan(0);
  });

  it.each(blocks.map((b, i) => [i + 1, b] as const))('excerpt %i appears verbatim in src/themes/', (_i, block) => {
    expect(sources.some((src) => src.includes(block))).toBe(true);
  });
});
