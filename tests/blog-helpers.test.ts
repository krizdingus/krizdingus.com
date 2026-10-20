import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  enumerateTags, postsByYear, postsByTag, formatPostDate, readingMinutes,
  needsReview, postSlug, absolutizeLinks, SHOW_REVIEW_MARKERS, postDateLabel,
} from '../src/lib/blog-helpers';

interface Post {
  slug: string;
  data: { title: string; date_published: Date; tags: string[]; draft?: boolean };
  body: string;
}

const posts: Post[] = [
  { slug: 'a', data: { title: 'A', date_published: new Date('2025-06-01'), tags: ['x', 'y'] }, body: 'one two three' },
  { slug: 'b', data: { title: 'B', date_published: new Date('2024-12-15'), tags: ['y', 'z'] }, body: 'four five' },
  { slug: 'c', data: { title: 'C', date_published: new Date('2025-01-20'), tags: ['z'], draft: true }, body: '' },
];

describe('blog-helpers', () => {
  it('enumerateTags returns unique tags sorted by count desc, then alpha', () => {
    expect(enumerateTags(posts.filter(p => !p.data.draft))).toEqual([
      { tag: 'y', count: 2 },
      { tag: 'x', count: 1 },
      { tag: 'z', count: 1 },
    ]);
  });

  it('postsByYear groups by year, desc', () => {
    const result = postsByYear(posts.filter(p => !p.data.draft));
    expect(result.map(r => r.year)).toEqual([2025, 2024]);
    expect(result[0].count).toBe(1);
    expect(result[1].count).toBe(1);
  });

  it('postsByTag filters by tag', () => {
    expect(postsByTag(posts.filter(p => !p.data.draft), 'y').map(p => p.slug)).toEqual(['a', 'b']);
  });

  it('formatPostDate returns "Mon DD, YYYY"', () => {
    expect(formatPostDate(new Date('2025-06-01T12:00:00Z'))).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });

  it('readingMinutes computes from word count', () => {
    expect(readingMinutes('one '.repeat(440))).toBe(2);   // 440 words / 220 wpm
    expect(readingMinutes('one two three')).toBe(1);       // floor minimum 1
  });
});

describe('blog-helpers: review markers, slugs, feed links', () => {
  it('needsReview follows the review flag (and the global switch)', () => {
    expect(needsReview({ review: true })).toBe(SHOW_REVIEW_MARKERS);
    expect(needsReview({ review: false })).toBe(false);
    expect(needsReview({})).toBe(false);
  });

  it('the switch only goes off once no post still carries review: true', () => {
    // A flagged post still holds its drafting day as date_published; with the
    // markers off it would be indexed and claim that day as its publish date.
    const dir = path.resolve(__dirname, '../src/content/blog');
    const flagged = fs.readdirSync(dir)
      .filter((f) => /\.mdx?$/.test(f))
      .filter((f) => /^review:\s*true\s*$/m.test(fs.readFileSync(path.join(dir, f), 'utf8').split(/^---$/m)[1] ?? ''));
    if (!SHOW_REVIEW_MARKERS) expect(flagged, 'sign these off one by one (real date_published, drop review)').toEqual([]);
  });

  it('postSlug strips .md / .mdx', () => {
    expect(postSlug('a-theme-is-a-folder.md')).toBe('a-theme-is-a-folder');
    expect(postSlug('x.mdx')).toBe('x');
    expect(postSlug('plain')).toBe('plain');
  });

  it('absolutizeLinks rewrites root-relative href/src only', () => {
    const html = '<a href="/projects/x/">x</a> <img src="/i.png"> <a href="https://e.com/">e</a> <a href="//cdn/x">c</a> <a href="#f">f</a>';
    expect(absolutizeLinks(html, 'https://krizdingus.com/')).toBe(
      '<a href="https://krizdingus.com/projects/x/">x</a> <img src="https://krizdingus.com/i.png"> <a href="https://e.com/">e</a> <a href="//cdn/x">c</a> <a href="#f">f</a>',
    );
  });
});

describe('blog-helpers: postDateLabel', () => {
  const d = new Date('2026-10-19');
  it('a signed-off post shows its publish date', () => {
    expect(postDateLabel({ date_published: d })).toBe('Oct 19, 2026');
    expect(postDateLabel({ date_published: d, review: false })).toBe('Oct 19, 2026');
  });
  it('a review draft reads as drafted, not published', () => {
    expect(postDateLabel({ date_published: d, review: true })).toBe(
      SHOW_REVIEW_MARKERS ? 'Drafted Oct 19, 2026' : 'Oct 19, 2026',
    );
  });
});
