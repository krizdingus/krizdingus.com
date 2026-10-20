import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { HOME_IMAGE_WIDTHS, homeImage, variantPath } from '../../src/data/home-images';

const pub = (p: string) => join(process.cwd(), 'public', p);

describe('home image variants', () => {
  it('every listed original and variant exists in public/', () => {
    for (const [orig, widths] of Object.entries(HOME_IMAGE_WIDTHS)) {
      expect(existsSync(pub(orig)), orig).toBe(true);
      for (const w of widths) expect(existsSync(pub(variantPath(orig, w))), `${orig} @${w}`).toBe(true);
    }
  });
  it('builds src + srcset, and falls back to the original when unlisted', () => {
    const hero = homeImage('/images/magsafe-zyn-container-3d-print.jpg', 800);
    expect(hero.src).toBe('/images/home/magsafe-zyn-container-3d-print-800.webp');
    expect(hero.srcset).toContain('-480.webp 480w');
    expect(hero.srcset).toContain('-1200.webp 1200w');
    expect(homeImage('/images/krizdingus-portrait.jpg', 64).src).toBe('/images/home/krizdingus-portrait-128.webp');
    expect(homeImage('/images/not-listed.jpg')).toEqual({ src: '/images/not-listed.jpg' });
  });
});
