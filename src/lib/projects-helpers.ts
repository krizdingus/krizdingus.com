// src/lib/projects-helpers.ts
// Pure helpers shared by /projects/ and /projects/[slug]/. No astro:content
// import here, so tests can call them with plain objects.

interface ProjectEntryLike {
  slug?: string;
  id?: string;
  data: { category: string; tags: string[]; draft?: boolean };
}

interface OrderedLike {
  data: { display_order?: number; date_published: Date };
}

export function allCategories(projects: ProjectEntryLike[]): string[] {
  return Array.from(new Set(projects.map((p) => p.data.category))).sort();
}

export function allTags(projects: ProjectEntryLike[]): string[] {
  return tagCounts(projects).map(([t]) => t);
}

/** Tags with how many projects carry them, case-insensitively deduplicated
 *  (the first spelling wins), sorted by count then name. */
export function tagCounts(projects: ProjectEntryLike[]): Array<[string, number]> {
  const seen = new Map<string, { label: string; n: number }>();
  for (const p of projects) {
    const mine = new Set<string>();
    for (const t of p.data.tags) {
      const key = t.trim().toLowerCase();
      if (!key || mine.has(key)) continue;
      mine.add(key);
      const hit = seen.get(key);
      if (hit) hit.n++;
      else seen.set(key, { label: t.trim(), n: 1 });
    }
  }
  return Array.from(seen.values())
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label))
    .map((x) => [x.label, x.n]);
}

/** Newest first. A project can still be pinned with display_order (1-based,
 *  ascending, ahead of the rest); none are right now, so the list's order is
 *  the year column's order. The index and prev/next both use this. */
export function sortProjects<T extends OrderedLike>(projects: readonly T[]): T[] {
  return [...projects].sort((a, b) => {
    const ao = a.data.display_order;
    const bo = b.data.display_order;
    if (ao != null && bo != null) return ao - bo;
    if (ao != null) return -1;
    if (bo != null) return 1;
    return b.data.date_published.getTime() - a.data.date_published.getTime();
  });
}

export const slugFromId = (id: string): string => id.replace(/\.mdx?$/, '');

/** "MakerWorld" / "GitHub" / bare hostname for a project's main link. */
export function hostLabel(url: string): string {
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
  if (host === 'makerworld.com') return 'MakerWorld';
  if (host === 'github.com') return 'GitHub';
  return host;
}

export interface GalleryItem {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

/** Width/height for the hero, taken from the gallery entry with the same src. */
export function heroDims(hero: string, gallery: readonly GalleryItem[]): { width?: number; height?: number } {
  const hit = gallery.find((g) => g.src === hero);
  return hit ? { width: hit.width, height: hit.height } : {};
}

/** The naming part of an alt text, for a gallery thumbnail's label: the first
 *  sentence, cut at its last ": " when it has one ("Balloon Kid reproduction
 *  label: a girl drifting…" → "Balloon Kid reproduction label"). */
export function shortAlt(alt: string): string {
  const text = alt.trim();
  const end = text.search(/\.(\s|$)/);
  const first = end === -1 ? text : text.slice(0, end);
  const colon = first.lastIndexOf(': ');
  return (colon > 0 ? first.slice(0, colon) : first).trim();
}

/** GitHub stars only count as a stat at 5 or more. */
export const STARS_MIN = 5;
export function showStars(stars: number | undefined | null): stars is number {
  return typeof stars === 'number' && stars >= STARS_MIN;
}

/** Glyph for the CRT fallback tile when a project has no picture. */
export function crtGlyph(title: string, curated?: string): string {
  if (curated) return curated;
  const first = title.split(/\s+/)[0] ?? '>_';
  return first.slice(0, 4).toUpperCase();
}

/** Responsive copies of each project picture live next to its thumb.webp:
 *  /images/projects/<slug>/r/<name>-<w>.{avif,webp} plus <name>-thumb.webp
 *  (200px square, for the viewer's thumbnail strip). */
export const VARIANT_WIDTHS = [480, 800, 1200] as const;

export function variantBase(slug: string, src: string): string {
  const name = (src.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
  return `/images/projects/${slug}/r/${name}`;
}

/** Widths cut for a picture of a given width: the standard steps below it,
 *  plus its own width when it's 1200 or under. */
export function variantWidths(srcWidth: number): number[] {
  const ws: number[] = VARIANT_WIDTHS.filter((w) => w < srcWidth);
  if (srcWidth <= 1200 && !ws.includes(srcWidth)) ws.push(srcWidth);
  return ws;
}

export function srcsetFor(base: string, widths: readonly number[], ext: 'avif' | 'webp'): string {
  return widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
}
