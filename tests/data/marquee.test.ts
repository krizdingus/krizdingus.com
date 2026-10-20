import { describe, it, expect } from 'vitest';
import { marqueeItems } from '../../src/data/marquee';

describe('marqueeItems', () => {
  it('has enough items for a loop, each with a tag and text', () => {
    expect(marqueeItems.length).toBeGreaterThanOrEqual(3);
    for (const item of marqueeItems) {
      expect(item.tag).toBeTruthy();
      expect(item.text).toBeTruthy();
    }
  });

  it('links only to internal pages', () => {
    for (const item of marqueeItems) {
      if (item.href) expect(item.href).toMatch(/^\/[a-z0-9/-]*$/);
    }
  });

  it('carries none of the known-bad strings or dead hotkeys', () => {
    const all = marqueeItems.map((i) => i.text).join(' ');
    expect(all).not.toMatch(/Zyn Quest|40\+|Ctrl\s*\+|Alt\s*\+|stool v[23]/i);
  });

  it('dates the MakerWorld stat it quotes', () => {
    const stat = marqueeItems.find((i) => i.tag === 'STAT');
    expect(stat?.text).toMatch(/MakerWorld/);
    expect(stat?.text).toMatch(/2026/);
  });

  it('skips download counts, which the Most downloaded list already prints', () => {
    expect(marqueeItems.map((i) => i.text).join(' ')).not.toMatch(/downloads/i);
  });
});
