import { describe, it, expect } from 'vitest';
import { estimateReadingMinutes } from '../src/lib/reading-time';

describe('estimateReadingMinutes', () => {
  it('returns at least 1 minute for very short text', () => {
    expect(estimateReadingMinutes('Hello.')).toBeGreaterThanOrEqual(1);
  });
  it('scales with word count (~200 wpm)', () => {
    const text = Array.from({ length: 600 }, () => 'word').join(' ');
    const minutes = estimateReadingMinutes(text);
    expect(minutes).toBeGreaterThanOrEqual(2);
    expect(minutes).toBeLessThanOrEqual(4);
  });
});
