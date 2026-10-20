import { describe, it, expect } from 'vitest';
import { visitorCounter, webring, fuelPing, RANDOM_HREF } from '../../src/data/footer-strip';

describe('visitorCounter', () => {
  it('is digits plus a caption (an obvious joke, not a stat)', () => {
    expect(visitorCounter.digits.length).toBeGreaterThan(0);
    for (const d of visitorCounter.digits) expect(d).toMatch(/^[0-9]$/);
    expect(visitorCounter.sub).toBeTruthy();
  });
});

describe('webring', () => {
  it("cycles the site's own pages: no # hrefs, no external links", () => {
    expect(webring.links.length).toBeGreaterThanOrEqual(2);
    for (const link of webring.links) {
      expect(link.href).not.toBe('#');
      if (link.href !== RANDOM_HREF) expect(link.href).toMatch(/^\/[a-z0-9/-]*$/);
    }
  });
  it('says it is one site', () => {
    expect(webring.size).toMatch(/^1 site/);
  });
});

describe('fuelPing', () => {
  it('is the White Monster joke, not coffee', () => {
    expect(fuelPing.value).toMatch(/White Monster/);
    expect(JSON.stringify(fuelPing)).not.toMatch(/coffee/i);
  });
});
