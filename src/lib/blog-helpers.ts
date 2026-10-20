// src/lib/blog-helpers.ts
interface BlogEntryLike {
  slug?: string;
  id?: string;
  data: { date_published: Date; tags: string[]; draft?: boolean };
  body?: string;
}

export function enumerateTags(posts: BlogEntryLike[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function postsByYear(posts: BlogEntryLike[]): Array<{ year: number; count: number }> {
  const counts = new Map<number, number>();
  for (const p of posts) {
    const y = p.data.date_published.getFullYear();
    counts.set(y, (counts.get(y) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year);
}

export function postsByTag<T extends BlogEntryLike>(posts: T[], tag: string): T[] {
  return posts.filter((p) => p.data.tags.includes(tag));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatPostDate(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const WPM = 220;

export function readingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WPM));
}

/** The one switch for the review markers on posts that carry `review: true`
 *  (the "Drafted <date>" label, noindex, and keeping the post out of the
 *  sitemap, rss.xml and dated metadata). Sign posts off one at a time: set
 *  the real date_published and remove `review`. Turning this off while a
 *  post is still flagged would publish its drafting day as the publish
 *  date, so tests/blog-helpers.test.ts fails if that happens. */
export const SHOW_REVIEW_MARKERS = true;

export function needsReview(data: { review?: boolean }): boolean {
  return SHOW_REVIEW_MARKERS && data.review === true;
}

/** The date line for a post. A post still marked for review carries a
 *  placeholder date_published (the day it was drafted), so it reads as
 *  "Drafted <date>" rather than a publish date. Signing a post off means
 *  setting date_published to the real day and removing `review`. */
export function postDateLabel(data: { date_published: Date; review?: boolean }): string {
  const day = formatPostDate(data.date_published);
  return needsReview(data) ? `Drafted ${day}` : day;
}

/** Content-collection id → URL slug ("foo.md" → "foo"). */
export function postSlug(id: string): string {
  return id.replace(/\.mdx?$/, '');
}

/** Make root-relative href/src attributes absolute, for feed readers. */
export function absolutizeLinks(html: string, site: string | URL): string {
  const base = String(site).replace(/\/+$/, '');
  return html.replace(/(\s(?:href|src))="\/(?!\/)/g, `$1="${base}/`);
}
