// src/lib/related-posts.ts
interface PostLike {
  slug?: string;
  id?: string;
  data: { title: string; tags: string[] };
}

export function relatedPosts<T extends PostLike>(all: readonly T[], seed: T, limit: number): T[] {
  const seedTags = new Set(seed.data.tags);
  return all
    .filter((p) => p !== seed)
    .map((p) => ({
      post: p,
      overlap: p.data.tags.filter((t) => seedTags.has(t)).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((x) => x.post);
}
