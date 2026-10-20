// XP-only set dressing for /projects/ and the project pages.
// Normal mode ships plain fact sheets and a plain list; under XP the fact
// sheets get Win9x title bars (from data-xp-title) and each list row shows its
// .EXE filename (from data-exe). Everything here is removed on unmount.
import type { ThemeContext } from '../../types';

const CSS = `
.xpd-proj-bar {
  display: flex; align-items: center; gap: 6px;
  margin: -14px -16px 12px;
  padding: 4px 8px;
  font-family: var(--font-pixel); font-size: 10px; letter-spacing: 0.05em;
  color: #fff;
  background: #494786;
  border-bottom: 2px solid var(--border-strong);
}
/* Flat, like every other panel bar in the XP skin; #494786 in both light and
   dark keeps white title text above 4.5:1. */
:root[data-skin="xp"] .facts[data-xp-title] > .xpd-proj-bar { background: #494786; }
.xpd-proj-bar::before { content: '▣'; font-family: var(--font-mono); color: var(--accent-pixel); }
.xpd-proj-bar + .facts__h { border-bottom: 0; padding-bottom: 0; }
.xpd-proj-exe {
  display: inline-block;
  margin-bottom: 6px;
  padding: 2px 6px;
  font-family: var(--font-pixel); font-size: 9px; letter-spacing: 0.06em;
  color: #fff; background: var(--accent-secondary);
}
`;

export function mount(_ctx: ThemeContext): HTMLElement[] {
  const facts = document.querySelectorAll<HTMLElement>('.facts[data-xp-title]');
  const rows = document.querySelectorAll<HTMLElement>('.proj-row[data-exe]');
  if (facts.length === 0 && rows.length === 0) return [];

  const added: HTMLElement[] = [];
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  added.push(style);

  facts.forEach((f) => {
    const bar = document.createElement('div');
    bar.className = 'xpd-proj-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.textContent = f.dataset.xpTitle ?? '';
    f.prepend(bar);
    added.push(bar);
  });

  rows.forEach((row) => {
    const text = row.querySelector('.proj-row__text');
    if (!text) return;
    const exe = document.createElement('span');
    exe.className = 'xpd-proj-exe';
    exe.setAttribute('aria-hidden', 'true');
    exe.textContent = row.dataset.exe ?? '';
    text.prepend(exe);
    added.push(exe);
  });

  return added;
}
