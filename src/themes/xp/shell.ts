// src/themes/xp/shell.ts
// Wraps the page's own <main> in the Krizscape window (title bar + menu bar)
// and takes normal mode's header and footer off the page. Nothing is cloned
// or re-rendered: <main> is moved, so page scripts, focus targets and form
// state survive the swap in both directions. restore() undoes all of it.

import { siteNav } from '../../data/site-nav';

// Krizscape's own icon (title bar, desktop shortcut, Start menu): the site's
// earlier favicon art, kept with the theme so XP looks as it always has.
import FAVICON from './assets/krizscape-32.png?url';

export interface ShellHandle {
  shell: HTMLElement;
  restore(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, attrs: Record<string, string> = {}): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function windowButton(action: string, label: string, glyph: string, extra: Record<string, string> = {}): HTMLButtonElement {
  const b = el('button', 'window-btn' + (action === 'close' ? ' window-btn-close' : ''), {
    type: 'button',
    'data-window-action': action,
    'aria-label': label,
    title: label,
    ...extra,
  });
  b.appendChild(el('span', `win-glyph win-glyph-${glyph}`, { 'aria-hidden': 'true' }));
  return b;
}

function titleBar(title: string): HTMLElement {
  // The window's title bar stands in for normal mode's site header (which
  // the shell takes off the page), so it is the page's banner landmark.
  const bar = el('div', 'title-bar', { role: 'banner' });
  const label = el('div', 'title-label');
  label.appendChild(el('img', 'exe-icon', { src: FAVICON, alt: '', 'aria-hidden': 'true' }));
  const text = el('span', undefined, { 'data-os-shell-title': '' });
  text.textContent = title;
  label.appendChild(text);
  const controls = el('div', 'window-controls');
  controls.append(
    windowButton('minimize', 'Minimize', 'min'),
    windowButton('maximize', 'Maximize', 'max'),
    windowButton('close', 'Close', 'close', { 'data-shell-close': '' }),
  );
  bar.append(label, controls);
  return bar;
}

/** The menu bar's route links, built from the shared nav data
 *  (src/data/site-nav.ts), Home included: normal mode's nav leaves Home out
 *  because its wordmark is the home link. Which item is current comes from
 *  normal mode's header links (the nav, and the wordmark for "/"). The
 *  item's key letter is underlined as its mnemonic. */
function menuBar(header: HTMLElement | null): HTMLElement {
  const bar = el('div', 'menu-bar');
  const nav = el('nav', 'primary', { 'aria-label': 'Main navigation' });
  for (const item of siteNav) {
    const a = el('a', 'menu-route', { href: item.href });
    const current = header?.querySelector(`a[href="${item.href}"][aria-current]`)?.getAttribute('aria-current');
    if (current) a.setAttribute('aria-current', current);
    const label = item.label;
    const key = item.accessKey ?? '';
    const i = key ? label.toUpperCase().indexOf(key.toUpperCase()) : -1;
    if (i >= 0) {
      const u = document.createElement('u');
      u.textContent = label[i];
      a.append(label.slice(0, i), u, label.slice(i + 1));
    } else {
      a.textContent = label;
    }
    nav.appendChild(a);
  }
  bar.appendChild(nav);
  return bar;
}

/** The Krizscape window's title when the page sets none (BaseLayout's
 *  `shellTitle` prop → <body data-shell-title>). */
export const SHELL_TITLE = 'KRIZSCAPE — krizdingus.com';

export function buildShell(): ShellHandle | null {
  const site = document.querySelector<HTMLElement>('[data-site]');
  const main = document.getElementById('main');
  if (!site || !main) return null;

  const title = document.body.dataset.shellTitle || SHELL_TITLE;
  const shell = el('div', 'os-shell is-focused', { 'data-xp-shell': '' });
  shell.append(titleBar(title), menuBar(site.querySelector<HTMLElement>('[data-site-nav]')?.closest('header') ?? null));

  // Move <main> into the window, leaving a marker to come home to.
  const mainHome = document.createComment('main');
  main.before(mainHome);
  main.classList.add('window-content');
  shell.appendChild(main);
  // The window scrolls on its own, so a page with nothing focusable in it
  // still needs a keyboard stop to scroll from.
  const mainTab = main.getAttribute('tabindex');
  if (!main.querySelector('a[href], button, input, select, textarea, [tabindex="0"]')) main.setAttribute('tabindex', '0');

  // Swap the normal-mode chrome (header, footer) for the window.
  const siteHome = document.createComment('site');
  site.before(siteHome);
  site.remove();
  siteHome.after(shell);

  return {
    shell,
    restore() {
      main.classList.remove('window-content');
      if (mainTab === null) main.removeAttribute('tabindex');
      else main.setAttribute('tabindex', mainTab);
      mainHome.replaceWith(main);
      siteHome.replaceWith(site);
      shell.remove();
    },
  };
}
