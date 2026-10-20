// @vitest-environment node
// The share cards in public/images/og/ are committed images drawn by
// scripts/og-cards.mjs, which the build doesn't run. scripts/og/drawn.json
// records what the last run drew; this fails when a post or project title,
// a section card or a listed photo has changed since (run `npm run og`).
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
// @ts-expect-error plain .mjs module without types
import { cardJobs, DRAWN_FILE } from '../scripts/og/jobs.mjs';

const ROOT = path.resolve(__dirname, '..');

describe('share cards', () => {
  const jobs = cardJobs(ROOT) as Array<Record<string, unknown> & { out: string }>;
  const drawn = JSON.parse(fs.readFileSync(path.join(ROOT, DRAWN_FILE), 'utf8')) as typeof jobs;

  it('match the current titles, pages and photos (else run `npm run og`)', () => {
    const byOut = new Map(drawn.map((j) => [j.out, j]));
    for (const j of jobs) {
      // JSON drops undefined fields, so compare the round-tripped job.
      expect(byOut.get(j.out), `images/og/${j.out}`).toEqual(JSON.parse(JSON.stringify(j)));
    }
    expect(drawn.map((j) => j.out).sort()).toEqual(jobs.map((j) => j.out).sort());
  });

  it('exist on disk, one per card', () => {
    for (const j of jobs) expect(fs.existsSync(path.join(ROOT, 'public/images/og', j.out)), j.out).toBe(true);
  });
});
