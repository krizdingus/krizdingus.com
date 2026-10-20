import { describe, it, expect } from 'vitest';
import { buildDirectory, isNew, shortLabel, type DirProject, type DirPost } from '../../src/data/directory';

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const now = d('2026-10-18');
const projects: DirProject[] = [
  { slug: 'stool', title: 'Printable Poopin’ Stool', category: '3d-print', date: d('2025-04-06'), downloads: 6414, captured: d('2026-09-08'), source: 'MakerWorld' },
  { slug: 'magsafe', title: 'Mini MagSafe Zyn Container', category: '3d-print', date: d('2024-10-19'), downloads: 985, captured: d('2026-09-08'), source: 'MakerWorld' },
  { slug: 'case', title: 'Cassette Case', category: '3d-print', date: d('2024-09-13'), downloads: 506, captured: d('2026-09-08'), source: 'MakerWorld' },
  { slug: 'labels', title: 'Cartridge Labels', category: 'game-boy', date: d('2024-05-03') },
  { slug: 'peekabu', title: 'Peekabu: a Mac Menu Bar Monitor', category: 'software', date: d('2026-05-03') },
  { slug: 'fresh', title: 'Fresh Bot: a thing', category: 'bot', date: d('2026-10-01') },
];
const posts: DirPost[] = [
  { slug: 'a', title: 'A', date: d('2026-10-10'), tags: ['meta', 'code'] },
  { slug: 'b', title: 'B', date: d('2026-10-11'), tags: ['meta'] },
];

describe('buildDirectory', () => {
  const dir = buildDirectory(projects, posts, now);

  it('derives every count from the inputs', () => {
    expect(dir.projectCount).toBe(6);
    expect(dir.postCount).toBe(2);
    const counts = Object.fromEntries(dir.columns.map((c) => [c.heading, c.count]));
    expect(counts).toEqual({ '3D prints': 3, 'Cartridge labels': 1, 'Code & hardware': 2, Blog: 2 });
    expect(dir.columns.reduce((t, c) => t + (c.heading === 'Blog' ? 0 : c.count), 0)).toBe(projects.length);
  });

  it('flags no HOT items: the Most downloaded list carries the ranking', () => {
    const flags = dir.columns.flatMap((c) => c.items).map((i) => i.flag).filter(Boolean);
    expect(flags).not.toContain('hot');
  });

  it('flags NEW only for the newest entry in a column, within 90 days', () => {
    const fresh = dir.columns.flatMap((c) => c.items).filter((i) => i.flag === 'new').map((i) => i.href);
    expect(fresh).toEqual(['/projects/fresh/']);
  });

  it('lists blog tags with post counts, most used first', () => {
    const blog = dir.columns.find((c) => c.heading === 'Blog')!;
    expect(blog.items[0]).toMatchObject({ label: '#meta', href: '/blog/tags/meta/', count: 2 });
  });

  it('ranks top picks by snapshot downloads with the capture date', () => {
    expect(dir.topPicks.map((p) => p.downloads)).toEqual([6414, 985, 506]);
    expect(dir.topPicksCaptured?.toISOString().slice(0, 10)).toBe('2026-09-08');
    expect(dir.topPicksSource).toBe('MakerWorld');
  });

  it('only links internal, data-driven paths (no # hrefs)', () => {
    for (const item of dir.columns.flatMap((c) => c.items)) {
      expect(item.href).toMatch(/^\/(projects|blog)\//);
    }
  });

  it('links a column head only where the target lists exactly that column', () => {
    const heads = Object.fromEntries(dir.columns.map((c) => [c.heading, c.href]));
    // /projects/ has no category filter, so the project groups stay plain headings.
    expect(heads).toEqual({ '3D prints': undefined, 'Cartridge labels': undefined, 'Code & hardware': undefined, Blog: '/blog/' });
  });

  it('drops empty columns', () => {
    const only = buildDirectory([projects[0]], [], now);
    expect(only.columns.map((c) => c.heading)).toEqual(['3D prints']);
  });
});

describe('helpers', () => {
  it('shortLabel uses the curated map, else the title before a colon', () => {
    expect(shortLabel('peekabu', 'Peekabu: a Mac Menu Bar Monitor')).toBe('Peekabu');
    expect(shortLabel('printable-poopin-stool', 'x')).toBe('Poopin’ stool');
  });
  it('isNew uses a 90-day window', () => {
    expect(isNew(d('2026-07-21'), now)).toBe(true);
    expect(isNew(d('2026-07-19'), now)).toBe(false);
  });
});
