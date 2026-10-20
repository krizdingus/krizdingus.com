// src/lib/related-projects.ts
interface ProjectLike {
  slug?: string;
  id?: string;
  data: { title: string; category: string; tags: string[] };
}

export function relatedProjects<T extends ProjectLike>(all: readonly T[], seed: T, limit: number): T[] {
  return all
    .filter((p) => p !== seed)
    .map((p) => {
      const sameCategory = p.data.category === seed.data.category ? 2 : 0;
      const tagOverlap = p.data.tags.filter((t) => seed.data.tags.includes(t)).length;
      return { post: p, score: sameCategory + tagOverlap };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}
