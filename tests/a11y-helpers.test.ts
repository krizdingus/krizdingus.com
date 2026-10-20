import { describe, it, expect } from 'vitest';
import { splitAlt, ALT_MAX } from '../src/lib/alt-text';
import { splitSelectors } from '../src/build/postcss-scheme-fallback.mjs';

describe('splitAlt', () => {
  it('keeps short alt text whole', () => {
    expect(splitAlt('A cat on a desk.')).toEqual({ alt: 'A cat on a desk.', desc: '' });
  });
  it('splits long alt text at the last colon that fits, losing no words', () => {
    const t = 'Two 3D-printed cassette-style cases: an open blue one holding a Pokémon Blue cartridge, and a closed red one with a Pokémon Red cover label.';
    const r = splitAlt(t);
    expect(r.alt).toBe('Two 3D-printed cassette-style cases');
    expect(r.desc).toBe('An open blue one holding a Pokémon Blue cartridge, and a closed red one with a Pokémon Red cover label.');
  });
  it('falls back to a comma, and always fits', () => {
    const t = 'A gray and white 3D-printed squat stool with a honeycomb-cut top, standing around the base of a toilet on a marble floor, and then some more words.';
    const r = splitAlt(t);
    expect(r.alt.length).toBeLessThanOrEqual(ALT_MAX);
    expect(r.alt).toBe('A gray and white 3D-printed squat stool with a honeycomb-cut top');
  });
});

describe('scheme fallback selectors', () => {
  it('copies dark rules for a page without data-theme', () => {
    expect(splitSelectors(['[data-theme="dark"] .x'])).toEqual({
      original: ['[data-theme="dark"] .x'],
      dark: [':where(:root):not([data-theme]) .x'],
      light: [],
    });
  });
  it('turns light-only rules into [data-theme="light"] plus a no-attribute copy', () => {
    expect(splitSelectors([':root:not([data-skin-base=none]):not([data-theme="dark"]) .y'])).toEqual({
      original: [':root:not([data-skin-base=none])[data-theme="light"] .y'],
      dark: [],
      light: [':root:not([data-skin-base=none]):where(:root):not([data-theme]) .y'],
    });
  });
  it('leaves other selectors alone', () => {
    expect(splitSelectors([':root:not([data-theme]) .pro-theme', '.z'])).toEqual({
      original: [':root:not([data-theme]) .pro-theme', '.z'],
      dark: [],
      light: [],
    });
  });
});
