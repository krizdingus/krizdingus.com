import { describe, it, expect } from 'vitest';
import { projectsSchema, webSchema, blogSchema, aboutSchema } from '../src/content.config';

describe('projects schema', () => {
  it('accepts a valid project', () => {
    const result = projectsSchema.safeParse({
      title: 'Mini MagSafe Zyn Container',
      slug: 'magsafe-zyn-container',
      summary: 'A magnetic pouch dock so I never lose a Zyn mid-panic-coding session.',
      category: '3d-print',
      tags: ['MagSafe', 'Hardware'],
      hero_image: '/assets/images/magsafe-zyn-container-3d-print.jpg',
      gallery: [],
      external_url: 'https://makerworld.com/en/models/715832',
      external_label: 'View on MakerWorld',
      date_published: new Date('2024-03-19'),
      featured: true,
      status: 'live',
      draft: false,
    });
    expect(result.success).toBe(true);
  });

  it('accepts an optional field_report snapshot and links', () => {
    const result = projectsSchema.safeParse({
      title: 'x',
      summary: 'x',
      category: '3d-print',
      hero_image: '',
      external_url: 'https://makerworld.com/en/models/1',
      external_label: 'View on MakerWorld',
      date_published: new Date('2025-04-06'),
      links: [{ label: 'GitHub', url: 'https://github.com/krizdingus/x' }],
      field_report: { source: 'MakerWorld', captured: '2026-09-08', rating: 4.9, rating_count: 92, likes: 1684, downloads: 6414, comments: 207 },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.field_report?.captured).toBeInstanceOf(Date);
      expect(result.data.links).toHaveLength(1);
    }
  });

  it('rejects a field_report rating above 5', () => {
    const result = projectsSchema.safeParse({
      title: 'x', summary: 'x', category: '3d-print', hero_image: '',
      external_url: 'https://x.com', external_label: 'x', date_published: new Date(),
      field_report: { source: 'MakerWorld', captured: '2026-09-08', rating: 6 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid category', () => {
    const result = projectsSchema.safeParse({
      title: 'Bad',
      slug: 'bad',
      summary: 'x',
      category: 'banana',
      tags: [],
      hero_image: '/x.jpg',
      gallery: [],
      external_url: 'https://x.com',
      external_label: 'x',
      date_published: new Date(),
      featured: false,
      status: 'live',
      draft: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a project missing required title', () => {
    const result = projectsSchema.safeParse({
      slug: 'x',
      summary: 'x',
      category: '3d-print',
      hero_image: '/x.jpg',
      external_url: 'https://x.com',
      external_label: 'x',
      date_published: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed external_url', () => {
    const result = projectsSchema.safeParse({
      title: 'x',
      summary: 'x',
      category: '3d-print',
      hero_image: '/x.jpg',
      external_url: 'not-a-url',
      external_label: 'x',
      date_published: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it('applies array and boolean defaults when omitted', () => {
    const result = projectsSchema.safeParse({
      title: 'x',
      summary: 'x',
      category: '3d-print',
      hero_image: '/x.jpg',
      external_url: 'https://x.com',
      external_label: 'x',
      date_published: new Date(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.gallery).toEqual([]);
      expect(result.data.featured).toBe(false);
      expect(result.data.status).toBe('live');
      expect(result.data.draft).toBe(false);
    }
  });
});

describe('web schema', () => {
  it('accepts a names-only entry', () => {
    const result = webSchema.safeParse({ client: 'Roar Media' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.draft).toBe(false);
  });

  it('refuses fields the ledger never shows (years, roles, tech, summaries, notes)', () => {
    for (const extra of [{ year: 2014 }, { role: 'x' }, { tech: ['x'] }, { summary: 'x' }, { note: 'x' }, { status: 'confirmed' }, { has_retrospective: true }]) {
      expect(webSchema.safeParse({ client: 'x', ...extra }).success, Object.keys(extra)[0]).toBe(false);
    }
  });

  it('defaults site_state to unknown and leaves relationship unset', () => {
    const result = webSchema.safeParse({ client: 'x' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.site_state).toBe('unknown');
      expect(result.data.relationship).toBeUndefined();
      expect(result.data.agency).toBeUndefined();
    }
  });

  it('accepts agency, freelance and in-house entries', () => {
    expect(webSchema.safeParse({ client: 'x', relationship: 'agency', agency: 'Roar Media' }).success).toBe(true);
    expect(webSchema.safeParse({ client: 'x', relationship: 'agency', agency: 'New Star Media', live_url: 'https://example.com/' }).success).toBe(true);
    expect(webSchema.safeParse({ client: 'x', relationship: 'freelance', site_state: 'launching' }).success).toBe(true);
    expect(webSchema.safeParse({ client: 'x', relationship: 'in-house' }).success).toBe(true);
  });

  it('ties agency to relationship both ways', () => {
    expect(webSchema.safeParse({ client: 'x', relationship: 'agency' }).success).toBe(false);
    expect(webSchema.safeParse({ client: 'x', relationship: 'freelance', agency: 'Roar Media' }).success).toBe(false);
    expect(webSchema.safeParse({ client: 'x', agency: 'Roar Media' }).success).toBe(false);
  });

  it('rejects an unknown agency, relationship or site_state', () => {
    expect(webSchema.safeParse({ client: 'x', relationship: 'agency', agency: 'Some Shop' }).success).toBe(false);
    expect(webSchema.safeParse({ client: 'x', relationship: 'contract' }).success).toBe(false);
    expect(webSchema.safeParse({ client: 'x', site_state: 'maybe' }).success).toBe(false);
    expect(webSchema.safeParse({ client: 'x', site_state: 'live' }).success).toBe(false);
  });

  it('only takes a timestamped Wayback URL as wayback_url', () => {
    expect(webSchema.safeParse({ client: 'x', wayback_url: 'https://web.archive.org/web/20200922154613/https://roarmedia.com/' }).success).toBe(true);
    expect(webSchema.safeParse({ client: 'x', wayback_url: 'https://roarmedia.com/' }).success).toBe(false);
  });

  it("won't pair a live_url with a redone, gone or unreleased site", () => {
    expect(webSchema.safeParse({ client: 'x', live_url: 'https://example.com' }).success).toBe(true);
    for (const site_state of ['redone', 'gone', 'launching']) {
      expect(webSchema.safeParse({ client: 'x', site_state, live_url: 'https://example.com' }).success, site_state).toBe(false);
    }
  });

  it('rejects a missing client name', () => {
    const result = webSchema.safeParse({ relationship: 'freelance' });
    expect(result.success).toBe(false);
  });
});

describe('blog schema', () => {
  it('accepts a valid post', () => {
    const result = blogSchema.safeParse({
      title: 'Hello, World',
      slug: 'hello-world',
      summary: 'First post.',
      hero_image: null,
      date_published: new Date(),
      date_updated: null,
      tags: ['meta'],
      draft: false,
    });
    expect(result.success).toBe(true);
  });

  it('coerces a date string to a Date', () => {
    const result = blogSchema.safeParse({
      title: 'x',
      summary: 'x',
      date_published: '2024-03-19',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date_published).toBeInstanceOf(Date);
    }
  });
});

describe('about schema', () => {
  it('accepts a valid about doc', () => {
    const result = aboutSchema.safeParse({
      portrait: '/assets/images/portrait.jpg',
      social: [{ label: 'GitHub', url: 'https://github.com/krizdingus' }],
    });
    expect(result.success).toBe(true);
  });
});
