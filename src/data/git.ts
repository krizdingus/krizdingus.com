// src/data/git.ts
// Build-time only (Node): the newest commit in this repo, for the home page's
// workshop panel. Never import this from browser code or a theme chunk.
import { execFileSync } from 'node:child_process';
import type { CommitInfo } from './workshop';

export function parseGitLog(line: string): CommitInfo | null {
  const [hash, iso, ...rest] = line.trim().split('\t');
  const subject = rest.join('\t').trim();
  if (!hash || !/^\d{4}-\d{2}-\d{2}/.test(iso ?? '') || !subject) return null;
  return { hash, day: iso.slice(0, 10), subject };
}

let cached: CommitInfo | null | undefined;

/** null when git or the repo isn't there (an export without history). */
export function latestCommit(): CommitInfo | null {
  if (cached !== undefined) return cached;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%h%x09%cI%x09%s'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    });
    cached = parseGitLog(out);
  } catch {
    cached = null;
  }
  return cached;
}
