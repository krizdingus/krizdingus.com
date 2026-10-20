// src/data/workshop.ts
// "Workshop status" panel on the home page (KzDir). Every row is derived from
// real data at build time: the newest commit in this repo (src/data/git.ts)
// and a day count from a real date. No "newest build" row: the Now Featuring
// rail already names the newest project, and one home per fact is enough.
// The commit row shows the short hash and the day, never the subject: commit
// subjects are written for the repo, not for visitors. Nothing here is
// live telemetry, and nothing claims to be. No fake "printing" or "on bench".
// The day count goes stale the day after a build, so KzDir recounts it in
// the browser from UPTIME_SINCE; without JS it says which day it was counted.

/** First MakerWorld upload (FDM-Friendly Game Boy Cartridge, released
 *  2024-09-02 on MakerWorld). */
export const UPTIME_SINCE = '2024-09-02';

export interface CommitInfo {
  hash: string;
  subject: string;
  /** Calendar date of the commit in its own timezone, YYYY-MM-DD. */
  day: string;
}

export interface WorkshopRow {
  status: 'ok' | 'warn';
  key: string;
  text: string;
  href?: string;
  /** Render `text` as code (the commit hash). */
  code?: boolean;
  /** Small trailing note: a date, a unit. */
  note?: string;
  /** Uptime only: the start day, so the page can recount it client-side. */
  since?: string;
  /** Uptime only: "counted <build day>", the no-JS fallback's date. */
  asOf?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2024-09-02" or a Date → "Sep 2, 2024", read as a calendar date (UTC). */
export function formatDay(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(`${d.slice(0, 10)}T00:00:00Z`) : d;
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

/** "Today" is the calendar day in US Eastern time, so the uptime and
 *  the commit row (which uses the commit's own -04:00/-05:00 date) agree. */
export const SITE_TZ = 'America/New_York';

/** `now` as a YYYY-MM-DD calendar day in `tz`. */
export function dayIn(now: Date, tz: string = SITE_TZ): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Whole days from `since` (a calendar date) to today in Miami. Never negative. */
export function uptimeDays(now: Date, since: string = UPTIME_SINCE): number {
  const start = Date.parse(`${since}T00:00:00Z`);
  const today = Date.parse(`${dayIn(now)}T00:00:00Z`);
  return Math.max(0, Math.floor((today - start) / 86_400_000));
}

export function workshopRows(input: {
  commit?: CommitInfo | null;
  now: Date;
}): WorkshopRow[] {
  const rows: WorkshopRow[] = [];
  if (input.commit) {
    rows.push({
      status: 'ok',
      key: 'Last commit',
      text: input.commit.hash,
      code: true,
      note: formatDay(input.commit.day),
    });
  }
  rows.push({
    status: 'ok',
    key: 'Uptime',
    text: `${uptimeDays(input.now).toLocaleString('en-US')} days`,
    note: `since the first MakerWorld upload, ${formatDay(UPTIME_SINCE)}`,
    since: UPTIME_SINCE,
    asOf: `counted ${formatDay(dayIn(input.now))}`,
  });
  return rows;
}
