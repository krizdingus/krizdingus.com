// "Dingus Directory": the Yahoo-style portal block on the home page.
// Everything here is derived from the content collections at build time.
// index.astro maps collection entries to the plain records below, so this
// module stays free of astro:content and is unit-testable.
//
// Rules (home piece sheet):
// - heading counts and the header total come from the collections;
// - no HOT flags: the "Most downloaded" list beside the directory already
//   ranks the snapshot, and one home per fact keeps the page from repeating;
// - NEW = published within NEW_WINDOW_DAYS of the build, newest entry per
//   column only, so a burst of posts doesn't paint a column in flags;
// - "Most downloaded" is the snapshot ranking, labelled with its date.

export interface DirProject {
  slug: string;
  title: string;
  category: string;
  date: Date;
  downloads?: number;
  /** Date the field_report numbers were read. */
  captured?: Date;
  source?: string;
}

export interface DirPost {
  slug: string;
  title: string;
  date: Date;
  tags: string[];
}

export interface DirItem {
  label: string;
  href: string;
  /** Rendered as "(n)" after the label. */
  count?: number;
  flag?: 'new';
}

export interface DirColumn {
  heading: string;
  /** Only when the target page shows exactly this column's entries. The
   *  project groups have none: /projects/ can't filter by category, and a
   *  "Cartridge labels" link that lands on every project misleads. */
  href?: string;
  count: number;
  items: DirItem[];
}

export interface TopPick {
  label: string;
  href: string;
  downloads: number;
}

export interface Directory {
  columns: DirColumn[];
  projectCount: number;
  postCount: number;
  topPicks: TopPick[];
  /** Newest capture date among the ranked snapshot rows. */
  topPicksCaptured: Date | null;
  topPicksSource: string | null;
}

export const NEW_WINDOW_DAYS = 90;
export const TOP_PICK_COUNT = 5;

/** Short directory labels. Titles on the project pages run long. */
const SHORT_LABELS: Record<string, string> = {
  'magsafe-zyn-container': 'MagSafe Zyn container',
  'printable-poopin-stool': 'Poopin’ stool',
  'cassette-case-gameboy-games': 'Cassette case for GB carts',
  'gamepak-discreet-display-stand': 'Game Pak display stand',
  'zyn-container-easy-open-threaded': 'Threaded Zyn container',
  'fdm-friendly-gameboy-cartridge': 'FDM-friendly GB cartridge',
  'gameboy-bootleg-cartridge-labels': 'Romhack cartridge labels',
  'mouse-bite-labs-cartridge-labels': 'Mouse Bite Labs labels',
};

export function shortLabel(slug: string, title: string): string {
  if (SHORT_LABELS[slug]) return SHORT_LABELS[slug];
  // "Peekabu: a Mac Menu Bar Monitor…" → "Peekabu"
  return title.split(/:\s/)[0].trim();
}

const DAY = 86_400_000;

export function isNew(date: Date, now: Date, windowDays = NEW_WINDOW_DAYS): boolean {
  const age = now.getTime() - date.getTime();
  return age <= windowDays * DAY && age >= -windowDays * DAY;
}

const byDateDesc = <T extends { date: Date }>(a: T, b: T) => b.date.getTime() - a.date.getTime();

function projectColumn(
  heading: string,
  list: DirProject[],
  now: Date,
  sort: 'downloads' | 'date',
): DirColumn {
  const sorted = [...list].sort((a, b) =>
    sort === 'downloads' ? (b.downloads ?? -1) - (a.downloads ?? -1) || byDateDesc(a, b) : byDateDesc(a, b),
  );
  const newest = [...list].sort(byDateDesc)[0];
  return {
    heading,
    count: list.length,
    items: sorted.map((p) => {
      const item: DirItem = { label: shortLabel(p.slug, p.title), href: `/projects/${p.slug}/` };
      if (p === newest && isNew(p.date, now)) item.flag = 'new';
      return item;
    }),
  };
}

export function buildDirectory(projects: DirProject[], posts: DirPost[], now: Date): Directory {
  const ranked = projects
    .filter((p) => typeof p.downloads === 'number')
    .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));

  const prints = projects.filter((p) => p.category === '3d-print');
  const labels = projects.filter((p) => p.category === 'game-boy');
  const code = projects.filter((p) => !['3d-print', 'game-boy'].includes(p.category));

  // Blog column: tags with post counts, newest tag first.
  const tagMap = new Map<string, { count: number; latest: Date }>();
  for (const post of posts) {
    for (const t of post.tags) {
      const cur = tagMap.get(t);
      if (!cur) tagMap.set(t, { count: 1, latest: post.date });
      else {
        cur.count += 1;
        if (post.date > cur.latest) cur.latest = post.date;
      }
    }
  }
  const tags = [...tagMap.entries()].sort(
    (a, b) => b[1].count - a[1].count || b[1].latest.getTime() - a[1].latest.getTime() || a[0].localeCompare(b[0]),
  );

  const columns: DirColumn[] = [
    projectColumn('3D prints', prints, now, 'downloads'),
    projectColumn('Cartridge labels', labels, now, 'date'),
    projectColumn('Code & hardware', code, now, 'date'),
    {
      heading: 'Blog',
      href: '/blog/',
      count: posts.length,
      items: tags.map(([t, v]) => ({ label: `#${t}`, href: `/blog/tags/${t}/`, count: v.count })),
    },
  ].filter((c) => c.items.length > 0);

  const top = ranked.slice(0, TOP_PICK_COUNT);
  const captured = top
    .map((p) => p.captured)
    .filter((d): d is Date => d instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  return {
    columns,
    projectCount: projects.length,
    postCount: posts.length,
    topPicks: top.map((p) => ({
      label: shortLabel(p.slug, p.title),
      href: `/projects/${p.slug}/`,
      downloads: p.downloads ?? 0,
    })),
    topPicksCaptured: captured,
    topPicksSource: top[0]?.source ?? null,
  };
}
