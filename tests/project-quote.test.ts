// Project review quotes: the `quote` front matter field and the files that
// use it. A quote links to the project's own listing and is credited to a
// handle.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { projectsSchema } from '../src/content.config';

const base = {
  title: 'x',
  summary: 'x',
  category: '3d-print',
  hero_image: '',
  external_url: 'https://makerworld.com/en/models/1-x',
  external_label: 'View on MakerWorld',
  date_published: new Date('2025-04-06'),
};

describe('quote field', () => {
  it('is optional', () => {
    expect(projectsSchema.safeParse(base).success).toBe(true);
  });
  it('takes text, a handle and a URL', () => {
    const r = projectsSchema.safeParse({ ...base, quote: { text: 'fits great', by: '@someone', url: 'https://makerworld.com/en/models/1-x' } });
    expect(r.success).toBe(true);
  });
  it('needs the handle to start with @', () => {
    expect(projectsSchema.safeParse({ ...base, quote: { text: 'x', by: 'someone', url: 'https://makerworld.com/' } }).success).toBe(false);
  });
  it('rejects fields it does not know', () => {
    expect(projectsSchema.safeParse({ ...base, quote: { text: 'x', by: '@a', url: 'https://makerworld.com/', stars: 5 } }).success).toBe(false);
  });
});

describe('project files', () => {
  const dir = path.resolve(__dirname, '../src/content/projects');
  const fm = (f: string) => fs.readFileSync(path.join(dir, f), 'utf8').split(/^---$/m)[1] ?? '';
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const head = fm(f);
    const q = /^quote:\n\s+text: "(.*)"\n\s+by: "(.*)"\n\s+url: "(.*)"$/m.exec(head);
    if (!q) continue;
    it(`${f}: the quote links to the project's own listing`, () => {
      expect(q[3]).toBe(/^external_url: "(.*)"$/m.exec(head)?.[1]);
      expect(q[1]).not.toMatch(/—/);
    });
  }
});
