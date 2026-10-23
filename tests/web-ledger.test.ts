import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { groupLedger, monthLabel, stateLabel, waybackMonth, type LedgerFields } from '../src/lib/web-ledger';
import { webSchema } from '../src/content.config';

const rec = (client: string, more: Partial<LedgerFields> = {}): LedgerFields => ({ client, ...more });
const id = (x: LedgerFields) => x;

describe('web-ledger helpers', () => {
  it('groups by how the work happened, in page order, A to Z inside', () => {
    const groups = groupLedger([
      rec('St. Thomas University', { relationship: 'in-house' }),
      rec('Prospera', { relationship: 'freelance' }),
      rec('zeta', { relationship: 'agency', agency: 'Roar Media' }),
      rec('Kozyak', { relationship: 'agency', agency: 'New Star Media' }),
      rec('Alpha', { relationship: 'agency', agency: 'Roar Media' }),
    ], id);
    expect(groups.map((g) => g.key)).toEqual(['roar-media', 'new-star-media', 'freelance', 'in-house']);
    expect(groups[0].items.map((r) => r.client)).toEqual(['Alpha', 'zeta']);
    expect(groups.map((g) => g.label)).toEqual(['Roar Media', 'New Star Media', 'Freelance', 'In-house']);
  });

  it('dates only the Roar Media group: the work there ended in September 2020', () => {
    const groups = groupLedger([
      rec('a', { relationship: 'agency', agency: 'Roar Media' }),
      rec('b', { relationship: 'agency', agency: 'New Star Media' }),
      rec('c', { relationship: 'freelance' }),
      rec('d', { relationship: 'in-house' }),
    ], id);
    expect(groups[0].until).toEqual({ short: 'Sep 2020', long: 'September 2020', iso: '2020-09' });
    for (const g of groups.slice(1)) expect(g.until, g.key).toBeUndefined();
  });

  it('drops empty groups and refuses a record with no group', () => {
    expect(groupLedger([rec('x', { relationship: 'freelance' })], id).map((g) => g.key)).toEqual(['freelance']);
    expect(() => groupLedger([rec('Nobody')], id)).toThrow(/Nobody/);
  });

  it('says nothing for an unknown or live site', () => {
    expect(stateLabel('unknown')).toBeNull();
    expect(stateLabel(undefined)).toBeNull();
    expect(stateLabel('redone')).toBe('redone by others');
    expect(stateLabel('gone')).toBe('gone');
    expect(stateLabel('launching')).toBe('not out yet');
  });

  it('reads the capture month off a Wayback URL', () => {
    expect(waybackMonth('https://web.archive.org/web/20250406090012/https://bbbsmiami.org/'))
      .toEqual({ short: 'Apr 2025', long: 'April 2025', iso: '2025-04' });
    expect(waybackMonth('https://web.archive.org/web/20250225180817/https://corporate.shipmoney.com/')!.short).toBe('Feb 2025');
    expect(waybackMonth('https://bbbsmiami.org/')).toBeNull();
    expect(waybackMonth(null)).toBeNull();
    expect(waybackMonth('https://web.archive.org/web/20251399000000/https://x.com/')).toBeNull();
    expect(monthLabel('2020', 0)).toBeNull();
    expect(monthLabel('2020', 12)!.short).toBe('Dec 2020');
  });
});

// The real entries, read straight off disk (flat `key: "value"` frontmatter).
const DIR = path.resolve(__dirname, '../src/content/web');
function frontmatter(file: string): Record<string, string> {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  const block = src.match(/^---\n([\s\S]*?)\n---/)![1];
  return Object.fromEntries(
    block.split('\n').map((line) => {
      const m = line.match(/^(\w+):\s*"(.*)"$/);
      if (!m) throw new Error(`${file}: unexpected frontmatter line ${line}`);
      return [m[1], m[2]];
    }),
  );
}
const entries = fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => ({ file: f, data: frontmatter(f) }));

describe('web ledger content', () => {
  // No counts or name lists here: adding a name to the ledger shouldn't
  // mean editing a test. The schema is strict, so a year, role, tech,
  // summary or note on an entry fails this too.
  it('every entry is valid', () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      const r = webSchema.safeParse(e.data);
      expect(r.success, `${e.file}: ${r.success ? '' : r.error.message}`).toBe(true);
    }
  });

  it('every entry lands in a group, and no group is empty', () => {
    const groups = groupLedger(entries, (e) => e.data as unknown as LedgerFields);
    expect(groups.reduce((n, g) => n + g.items.length, 0)).toBe(entries.length);
    for (const g of groups) expect(g.items.length, g.key).toBeGreaterThan(0);
  });

  it('only sites with a known state carry one', () => {
    const states = Object.fromEntries(entries.filter((e) => e.data.site_state).map((e) => [e.file, e.data.site_state]));
    expect(states).toEqual({
      'big-brothers-big-sisters-miami.md': 'redone',
      'shipmoney.md': 'redone',
      'ivfmd.md': 'redone',
      'level-three-venue.md': 'gone',
      'sia-scotch-whisky.md': 'gone',
      'prospera-real-estate-collective.md': 'launching',
    });
  });

  it('links only the chosen live sites, with no archive or state beside them', () => {
    const live = Object.fromEntries(entries.filter((e) => e.data.live_url).map((e) => [e.file, e.data.live_url]));
    expect(live).toEqual({
      'heise-suarez-melville.md': 'https://www.heisesuarezmelville.com/',
      'kozyak-tropin-throckmorton.md': 'https://kttlaw.com/',
      'stu-moot-court.md': 'https://stumootcourt.org/',
      'journal-of-multidisciplinary-research.md': 'https://www.jmrpublication.org/',
    });
    for (const f of Object.keys(live)) {
      const d = entries.find((e) => e.file === f)!.data;
      expect(d.wayback_url, f).toBeUndefined();
      expect(d.site_state, f).toBeUndefined();
    }
  });

  it('has the 5 Wayback captures, with the chosen months', () => {
    const wb = Object.fromEntries(entries.filter((e) => e.data.wayback_url).map((e) => [e.file, waybackMonth(e.data.wayback_url)!.iso]));
    expect(wb).toEqual({
      'roar-media.md': '2020-09',
      'ivfmd.md': '2023-12',
      'level-three-venue.md': expect.stringMatching(/^2025-0[1-4]$/),
      'shipmoney.md': expect.stringMatching(/^2025-0[1-4]$/),
      'sia-scotch-whisky.md': expect.stringMatching(/^2025-0[1-4]$/),
    });
    // BBBS gets no archive link (the archive doesn't load).
    expect(entries.find((e) => e.file === 'big-brothers-big-sisters-miami.md')!.data.wayback_url).toBeUndefined();
  });
});

// the /web/ prose never depends on the ledger. The page's
// template (everything after its frontmatter) may not name an entry or a
// group, or carry a number, so editing the data never means editing copy.
describe('web page copy stands on its own', () => {
  const page = fs.readFileSync(path.resolve(__dirname, '../src/pages/web/index.astro'), 'utf8');
  const template = page.split(/^---$/m).slice(2).join('---');

  // The whole page is checked, frontmatter data included, so moving a string
  // out of the template doesn't move it out of reach. The one approved
  // exception is the results block's heading meta, matched exactly.
  const ALLOWED = "const RESULTS_WHERE = 'At St. Thomas University';";

  it('names no entry and no group, except the results heading', () => {
    expect(page).toContain(ALLOWED);
    const strings = page
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/^import .*$/gm, '')
      .replace(ALLOWED, '')
      .toLowerCase();
    const names = [...entries.map((e) => e.data.client), 'Roar Media', 'New Star Media', 'Freelance', 'In-house'];
    for (const n of names) expect(strings, n).not.toContain(n.toLowerCase());
  });

  it('carries no counts or years', () => {
    // Copy and copy-bearing attributes (title, description, sub) stay in;
    // styling hooks and template expressions come out.
    const text = template
      .replace(/\b(heroStyle|style|class|id|aria-labelledby)="[^"]*"/g, ' ')
      .replace(/\{[^}]*\}/g, ' ')
      .replace(/<\/?[a-z][\w-]*/gi, ' ');
    expect(text).not.toMatch(/\d/);
  });
});

// The results block is the page's one place for figures and an
// organization's name. Its wording is fixed, and the page as a whole stays
// clear of the things that never go on /web/.
describe('web page results and limits', () => {
  const page = fs.readFileSync(path.resolve(__dirname, '../src/pages/web/index.astro'), 'utf8');
  const results = page.match(/const RESULTS[^=]*=\s*\[([\s\S]*?)\n\];/)![1];

  it('keeps the approved wording for each figure', () => {
    for (const phrase of [
      'over $5 million and still counting',
      'during a service outage',
      'more than 50% faster',
      'in one place',
    ]) expect(results, phrase).toContain(`'${phrase}'`);
  });

  it('never mentions what stays off /web/', () => {
    for (const re of [
      /breach/i, /security incident/i, /FirstUSA/i, /Boomtime/i, /\bAI\b/, /r[ée]sum[ée]/i,
      /LinkedIn/i, /years of experience/i, /day job/i, /Director/i, /Miami\b(?!-Dade)/, /—/, /40%/,
    ]) {
      const visible = page.replace(/title="[^"]*— Krizdingus"/, '').replace(/shellTitle="[^"]*"/, '').replace(/\/\/.*$/gm, '');
      expect(visible, String(re)).not.toMatch(re);
    }
  });
});
