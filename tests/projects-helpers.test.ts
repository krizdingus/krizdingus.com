import { describe, it, expect } from 'vitest';
import { tagCounts, sortProjects, releasedOn, hostLabel, heroDims, showStars, crtGlyph, variantBase, variantWidths, srcsetFor, shortAlt } from '../src/lib/projects-helpers';
import { relatedProjects } from '../src/lib/related-projects';

const p = (tags: string[], category = '3d-print') => ({ data: { category, tags } });
const d = (iso: string, display_order?: number) => ({ data: { date_published: new Date(iso), display_order } });

describe('projects-helpers', () => {
  it('tagCounts dedupes case-insensitively and sorts by count, then name', () => {
    expect(tagCounts([p(['3D Print', 'PETG']), p(['3d print', 'ABS']), p(['ABS', 'ABS'])])).toEqual([
      ['3D Print', 2], ['ABS', 2], ['PETG', 1],
    ]);
  });

  it('sortProjects: display_order first, then newest', () => {
    const a = d('2024-01-01', 2), b = d('2025-01-01'), c = d('2023-01-01', 1), e = d('2026-01-01');
    expect(sortProjects([a, b, c, e])).toEqual([c, a, e, b]);
  });

  it('releasedOn prefers the release day over the page date, and sortProjects orders by it', () => {
    const late = { data: { date_published: new Date('2026-10-18'), released: new Date('2024-09-04') } };
    const mid = d('2025-05-01');
    expect(releasedOn(late.data)).toEqual(new Date('2024-09-04'));
    expect(releasedOn(mid.data)).toEqual(new Date('2025-05-01'));
    expect(sortProjects([late, mid])).toEqual([mid, late]);
  });

  it('hostLabel names the two hosts and falls back to the hostname', () => {
    expect(hostLabel('https://makerworld.com/en/models/1')).toBe('MakerWorld');
    expect(hostLabel('https://github.com/krizdingus/x')).toBe('GitHub');
    expect(hostLabel('https://www.example.org/a')).toBe('example.org');
    expect(hostLabel('not a url')).toBe('');
  });

  it('heroDims reads width/height from the matching gallery item', () => {
    const g = [{ src: '/a.webp', alt: '', width: 10, height: 20 }];
    expect(heroDims('/a.webp', g)).toEqual({ width: 10, height: 20 });
    expect(heroDims('/b.webp', g)).toEqual({});
  });

  it('showStars hides GitHub stars below 5', () => {
    expect(showStars(undefined)).toBe(false);
    expect(showStars(4)).toBe(false);
    expect(showStars(5)).toBe(true);
  });

  it('crtGlyph prefers the curated glyph', () => {
    expect(crtGlyph('linkbruh: a bot', 'DSC')).toBe('DSC');
    expect(crtGlyph('leaksmith: PDFs')).toBe('LEAK');
  });

  it('relatedProjects scores category + shared tags and skips the seed', () => {
    const seed = { slug: 's', data: { title: 's', category: 'bot', tags: ['Discord'] } };
    const x = { slug: 'x', data: { title: 'x', category: 'bot', tags: ['Discord'] } };
    const y = { slug: 'y', data: { title: 'y', category: 'software', tags: [] } };
    expect(relatedProjects([seed, x, y], seed, 2)).toEqual([x]);
  });

  it('variant paths and widths for responsive project pictures', () => {
    expect(variantBase('magsafe', '/images/magsafe-zyn.jpg')).toBe('/images/projects/magsafe/r/magsafe-zyn');
    expect(variantWidths(1200)).toEqual([480, 800, 1200]);
    expect(variantWidths(1400)).toEqual([480, 800, 1200]);
    expect(variantWidths(600)).toEqual([480, 600]);
    expect(variantWidths(400)).toEqual([400]);
    expect(srcsetFor('/r/x', [480, 800], 'webp')).toBe('/r/x-480.webp 480w, /r/x-800.webp 800w');
  });

  it('shortAlt: first sentence, cut at its last ": "', () => {
    expect(shortAlt('Balloon Kid reproduction label: a girl drifting on red balloons past a bear.')).toBe('Balloon Kid reproduction label');
    expect(shortAlt('Pokémon Trading Card Game 2: The Invasion of Team GR! reproduction label: a Poké Ball.')).toBe('Pokémon Trading Card Game 2: The Invasion of Team GR! reproduction label');
    expect(shortAlt('The editor with example.pal open: swatches. Overlay text: nope.')).toBe('The editor with example.pal open');
    expect(shortAlt('The same bucket-hat mouse label, titled Game Boy Multicart MBC3.')).toBe('The same bucket-hat mouse label, titled Game Boy Multicart MBC3');
  });
});
