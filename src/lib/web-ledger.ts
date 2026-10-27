// src/lib/web-ledger.ts
// Helpers for /web/: which group a ledger record sits in, the group labels
// (data, so the page prose never has to name or count them), the words for
// what's known about a site, the month a Wayback capture was taken (read off
// its URL), and the case studies, which join a post to the ledger record it
// was written about. Pure functions, so they're unit-tested.

export type WebRelationship = 'agency' | 'freelance' | 'in-house';
export type WebSiteState = 'redone' | 'gone' | 'launching' | 'unknown';

export interface LedgerFields {
  client: string;
  relationship?: WebRelationship;
  agency?: string | null;
  site_state?: WebSiteState;
  wayback_url?: string | null;
  live_url?: string | null;
}

export interface MonthLabel {
  short: string;
  long: string;
  iso: string;
}

export interface LedgerGroup<T> {
  key: string;
  label: string;
  /** When the work there ended, shown after the label ("until Sep 2020"). */
  until?: MonthLabel;
  items: T[];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** A month from its year and number (1-12), or null if out of range. */
export function monthLabel(year: string, month: number): MonthLabel | null {
  if (!/^\d{4}$/.test(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  const long = MONTHS[month - 1];
  return { short: `${long.slice(0, 3)} ${year}`, long: `${long} ${year}`, iso: `${year}-${String(month).padStart(2, '0')}` };
}

// Groups in the order they're shown: how the work happened. Work at Roar
// Media ended in September 2020, which the label carries.
const GROUPS: { key: string; label: string; until?: [string, number]; match: (d: LedgerFields) => boolean }[] = [
  { key: 'roar-media', label: 'Roar Media', until: ['2020', 9], match: (d) => d.relationship === 'agency' && d.agency === 'Roar Media' },
  { key: 'new-star-media', label: 'New Star Media', match: (d) => d.relationship === 'agency' && d.agency === 'New Star Media' },
  { key: 'freelance', label: 'Freelance', match: (d) => d.relationship === 'freelance' },
  { key: 'in-house', label: 'In-house', match: (d) => d.relationship === 'in-house' },
];

const byName = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' });

/** Split records into the page's groups, A to Z inside each. Empty groups
 *  are dropped. A record that fits no group throws, so the build fails
 *  instead of quietly hiding a name. */
export function groupLedger<T>(entries: T[], fields: (e: T) => LedgerFields): LedgerGroup<T>[] {
  const out: LedgerGroup<T>[] = GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    ...(g.until ? { until: monthLabel(...g.until)! } : {}),
    items: [] as T[],
  }));
  for (const e of entries) {
    const d = fields(e);
    const i = GROUPS.findIndex((g) => g.match(d));
    if (i < 0) throw new Error(`web ledger: "${d.client}" has no group (relationship/agency missing?)`);
    out[i].items.push(e);
  }
  for (const g of out) g.items.sort((a, b) => byName(fields(a).client, fields(b).client));
  return out.filter((g) => g.items.length > 0);
}

/** What the ledger says about a site. Unknown says nothing, and a live site
 *  has no word either: it shows as a link (live_url) instead. */
export function stateLabel(state: WebSiteState | undefined): string | null {
  switch (state) {
    case 'redone': return 'redone by others';
    case 'gone': return 'gone';
    case 'launching': return 'not out yet';
    default: return null;
  }
}

/** The capture month of a Wayback URL (web.archive.org/web/YYYYMMDDhhmmss/…),
 *  or null if the URL has no timestamp. */
export function waybackMonth(url: string | null | undefined): MonthLabel | null {
  const m = url?.match(/^https:\/\/web\.archive\.org\/web\/(\d{4})(\d{2})\d{8}\//);
  return m ? monthLabel(m[1], Number(m[2])) : null;
}

/** A post that says, in its frontmatter, which ledger record it was written
 *  about (`case_study_for`). */
export interface CaseStudySource {
  slug: string;
  title: string;
  summary: string;
  date: Date;
  /** The id of the ledger record ("prospera-real-estate-collective"). */
  clientId: string;
}

/** A ledger record, as the page reads it out of the collection. */
export interface LedgerRecord {
  id: string;
  client: string;
  live_url?: string | null;
}

export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  date: Date;
  /** The client's name, off the ledger: the post never spells it a second time. */
  client: string;
  /** The live site, off the ledger, so the link lives in exactly one place. */
  live_url: string | null;
}

/** How many write-ups the page shows. The rest stay on the blog. */
export const CASE_STUDY_MAX = 5;

/** The case studies, newest first and capped. The client's name and live link
 *  are read off the ledger rather than repeated in the post, so a site going
 *  live is one edit. A post pointing at a record that isn't in the ledger
 *  throws, so the build fails instead of quietly dropping the write-up. */
export function caseStudies(
  posts: CaseStudySource[],
  ledger: LedgerRecord[],
  max: number = CASE_STUDY_MAX,
): CaseStudy[] {
  const byId = new Map(ledger.map((r) => [r.id, r]));
  const out = posts.map((p) => {
    const record = byId.get(p.clientId);
    if (!record) {
      throw new Error(`case study "${p.slug}": no web ledger record "${p.clientId}"`);
    }
    return {
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      date: p.date,
      client: record.client,
      live_url: record.live_url ?? null,
    };
  });
  out.sort((a, b) => b.date.getTime() - a.date.getTime());
  return out.slice(0, Math.max(0, max));
}
