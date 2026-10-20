import { describe, it, expect } from 'vitest';
import { workshopRows, uptimeDays, formatDay, UPTIME_SINCE } from '../../src/data/workshop';
import { parseGitLog } from '../../src/data/git';

const now = new Date('2026-10-18T12:00:00Z');

describe('uptimeDays', () => {
  it('counts whole days from the first MakerWorld upload', () => {
    expect(UPTIME_SINCE).toBe('2024-09-02');
    expect(uptimeDays(now)).toBe(776);
    expect(uptimeDays(new Date('2024-09-02T23:00:00Z'))).toBe(0);
  });
  it('counts by the Miami calendar day, not UTC', () => {
    // 01:30 UTC on Oct 19 is still Oct 18 in Miami.
    expect(uptimeDays(new Date('2026-10-19T01:30:00Z'))).toBe(776);
    expect(uptimeDays(new Date('2026-10-19T04:30:00Z'))).toBe(777);
  });
  it('never goes negative', () => {
    expect(uptimeDays(new Date('2020-01-01T00:00:00Z'))).toBe(0);
  });
});

describe('workshopRows', () => {
  it('is built only from what it is given, no invented rows', () => {
    const rows = workshopRows({
      now,
      commit: { hash: 'abc1234', day: '2026-10-18', subject: 'theme framework' },
    });
    expect(rows.map((r) => r.key)).toEqual(['Last commit', 'Uptime']);
    expect(rows[1]).toMatchObject({ text: '776 days', since: '2024-09-02', asOf: 'counted Oct 18, 2026' });
    const all = JSON.stringify(rows);
    expect(all).not.toMatch(/printing|on bench|soldering|ETA/i);
  });
  it('shows the commit as its short hash and day, never the subject', () => {
    const real = 'xp manifest: drop transitional owns list (no theme-only markup ships in normal HTML)';
    const [row] = workshopRows({ now, commit: { hash: 'a02bb2b', day: '2026-10-19', subject: real } });
    expect(row).toMatchObject({ key: 'Last commit', text: 'a02bb2b', code: true, note: 'Oct 19, 2026' });
    expect(JSON.stringify(row)).not.toMatch(/manifest|owns/);
  });
  it('has no newest-build row (the Now Featuring rail names it)', () => {
    expect(workshopRows({ now }).map((r) => r.key)).toEqual(['Uptime']);
  });
});

describe('helpers', () => {
  it('formatDay reads calendar dates without a timezone shift', () => {
    expect(formatDay('2024-09-02')).toBe('Sep 2, 2024');
    expect(formatDay('2026-10-18T22:01:17-04:00')).toBe('Oct 18, 2026');
  });
  it('parseGitLog reads hash, day and subject', () => {
    expect(parseGitLog('9f3a722\t2026-10-18T22:01:17-04:00\tfix the thing\n')).toEqual({
      hash: '9f3a722', day: '2026-10-18', subject: 'fix the thing',
    });
    expect(parseGitLog('garbage')).toBeNull();
  });
});
