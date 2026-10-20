import { describe, it, expect } from 'vitest';
import { relatedPosts } from '../src/lib/related-posts';

const posts = [
  { slug: 'a', data: { title: 'A', tags: ['x', 'y'] } },
  { slug: 'b', data: { title: 'B', tags: ['y', 'z'] } },
  { slug: 'c', data: { title: 'C', tags: ['w'] } },
  { slug: 'd', data: { title: 'D', tags: ['x', 'z'] } },
] as const;

describe('relatedPosts', () => {
  it('returns up to N posts sorted by tag overlap with the seed', () => {
    const seed = posts[0];  // tags x, y
    const related = relatedPosts(posts, seed, 2);
    expect(related.map(r => r.slug)).toEqual(['b', 'd']);  // b overlaps y; d overlaps x
  });

  it('excludes the seed post', () => {
    const seed = posts[0];
    const related = relatedPosts(posts, seed, 4);
    expect(related.map(r => r.slug)).not.toContain('a');
  });

  it('returns empty array when no overlaps', () => {
    const isolatedPosts = [posts[0], { slug: 'iso', data: { title: 'I', tags: ['q'] } }];
    const related = relatedPosts(isolatedPosts, isolatedPosts[0], 2);
    expect(related).toEqual([]);
  });
});
