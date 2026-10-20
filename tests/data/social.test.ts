import { describe, it, expect } from 'vitest';
import { socialLinks, allSocialLinks } from '../../src/data/social';

describe('socialLinks', () => {
  it('renders all 4 confirmed entries', () => {
    expect(socialLinks.length).toBe(4);
  });

  it('all entries have HTTPS URLs', () => {
    for (const link of socialLinks) {
      expect(link.url).toMatch(/^https:\/\//);
    }
  });

  it('all entries have a non-empty svgPath', () => {
    for (const link of socialLinks) {
      expect(link.svgPath).toBeTruthy();
      // SVG path data starts with a command character (M/m/L/l/etc).
      expect(link.svgPath).toMatch(/^[Mm]/);
    }
  });

  it('contains each confirmed label exactly once', () => {
    const labels = socialLinks.map((s) => s.label).sort();
    expect(labels).toEqual(['GitHub', 'Instagram', 'MakerWorld', 'Threads']);
  });

  it('never links the dead kwilliams.me domain', () => {
    for (const link of allSocialLinks) {
      expect(link.url).not.toMatch(/kwilliams\.me/);
    }
  });

  it('renders Threads (confirmed by Kris as @krizdingus)', () => {
    const threads = socialLinks.find((s) => s.label === 'Threads');
    expect(threads?.url).toBe('https://www.threads.com/@krizdingus');
  });
});
