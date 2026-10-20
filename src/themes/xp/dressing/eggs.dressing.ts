// src/themes/xp/dressing/eggs.dressing.ts — the home page's egg tiles. XP
// only: built at mount into [data-xp-slot="eggs"] (or after the home
// directory if a page has no slot), removed on unmount. What each tile does
// lives in ../eggs.ts, os-chrome.ts (reboot) and src/scripts/theme.ts (flip).
import type { ThemeContext } from '../../types';
import { BOOT_ORDER } from '../boot';
import { shortcutsActive } from '../shortcuts';

interface Tile {
  tone: 'mag' | 'pur' | 'grn';
  /** A character, or '' for a CSS-drawn glyph (kz-egg__glyph--<name>). */
  glyph: string;
  glyphClass?: string;
  title: string;
  /** Trusted markup. */
  sub: string;
  /** The single-key shortcut that does the same thing (shortcuts.ts). */
  key?: string;
  /** Attributes that make it work; an href makes it a link. */
  attrs: Record<string, string>;
}

export const EGG_TILES: Tile[] = [
  { tone: 'pur', glyph: '▶', title: 'MediaKruzer 7.0', sub: 'the shop tape, in a window', key: 'M', attrs: { 'data-egg': 'mediakruzer' } },
  { tone: 'mag', glyph: '!', title: 'Trigger panic', sub: 'a blue screen, on purpose', attrs: { href: '/panic/' } },
  { tone: 'grn', glyph: '☀', title: 'Light or dark', sub: 'flip the colors', key: 'T', attrs: { 'data-menu-action': 'theme-toggle' } },
  { tone: 'pur', glyph: '▦', title: 'Cycle wallpaper', sub: '4 wallpapers', key: 'W', attrs: { 'data-egg': 'wallpaper' } },
  { tone: 'mag', glyph: '⏻', title: 'Boot sequence', sub: `<span data-egg-status>${BOOT_ORDER.length} fake operating systems</span>`, attrs: { 'data-egg': 'boot-theme' } },
  { tone: 'grn', glyph: '↻', title: 'Reboot', sub: 'the whole boot, again', key: 'R', attrs: { 'data-menu-action': 'reboot' } },
  { tone: 'pur', glyph: '', glyphClass: 'bin', title: 'Recycle Bin', sub: 'go on, open it', attrs: { 'data-egg': 'recycle' } },
  { tone: 'mag', glyph: '?', title: 'Shortcuts', sub: 'every key that works', key: '?', attrs: { 'data-egg': 'shortcuts' } },
];

function tile(t: Tile): HTMLElement {
  const isLink = 'href' in t.attrs;
  const el = document.createElement(isLink ? 'a' : 'button');
  if (!isLink) (el as HTMLButtonElement).type = 'button';
  el.className = `kz-egg kz-egg--${t.tone}`;
  for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v);
  el.innerHTML =
    `<span class="kz-egg__glyph${t.glyphClass ? ` kz-egg__glyph--${t.glyphClass}` : ''}" aria-hidden="true">${t.glyph}</span>` +
    `<span class="kz-egg__title">${t.title}</span>` +
    `<span class="kz-egg__sub">${t.sub}</span>` +
    (t.key ? `<kbd class="kz-egg__key" title="Shortcut: ${t.key}">${t.key}</kbd>` : '');
  // With the keys switched off, park the hint where shortcuts.ts restores it.
  if (t.key) el.setAttribute(shortcutsActive() ? 'aria-keyshortcuts' : 'data-keyshortcuts', t.key === '?' ? 'Shift+?' : t.key);
  return el;
}

export function buildEggs(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'kz-eggs';
  section.setAttribute('aria-labelledby', 'kz-eggs-h');
  section.innerHTML =
    '<header class="kz-sec-head">' +
      '<span class="kz-sec-head__bracket" aria-hidden="true">[*]</span>' +
      '<h2 class="kz-sec-head__title" id="kz-eggs-h">Easter Eggs &amp; Mini-Apps</h2>' +
      '<span class="kz-sec-head__rule" aria-hidden="true"></span>' +
      '<span class="kz-sec-head__meta">XP mode only</span>' +
    '</header>' +
    '<div class="kz-eggs__grid"></div>';
  section.querySelector('.kz-eggs__grid')!.append(...EGG_TILES.map(tile));
  return section;
}

export function mount(_ctx: ThemeContext): HTMLElement[] {
  const slot = document.querySelector('[data-xp-slot="eggs"]');
  const fallback = slot ? null : document.querySelector('.kz-home .kz-dir-row');
  if (!slot && !fallback) return [];
  const eggs = buildEggs();
  if (slot) slot.append(eggs);
  else fallback!.after(eggs);
  return [eggs];
}
