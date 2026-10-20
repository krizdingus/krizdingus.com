// src/themes/xp/shortcuts.ts — XP/OS mode's single-key shortcuts.
// Only while the theme is mounted, never with Ctrl/Alt/Cmd held, and never
// while a text field has focus, the boot is playing, or a dialog is open.
// `?` opens the cheat sheet. Normal mode never loads this file.
// They can be switched off (WCAG 2.1.4) from the cheat sheet or Settings in
// the Start menu; the choice persists in localStorage. Off means no single
// key does anything, `?` included, and the key hints hide
// (:root[data-xp-keys="off"]).
import type { ThemeContext } from '../types';
import { openDialog, isDialogOpen } from './dialog';
import { cycleWallpaper } from './wallpaper';
import { siteNav } from '../../data/site-nav';

export interface Shortcut {
  key: string;
  label: string;
  run: () => void;
}

const click = (sel: string) => (): void => document.querySelector<HTMLElement>(sel)?.click();

/** Route keys come from the site nav data (the same source as the menu bar's
 *  underlined letters), so they keep working while the Krizscape window is
 *  closed. With the window open, the key clicks its menu-bar link. */
function routeShortcuts(): Shortcut[] {
  return siteNav
    .filter((item) => item.accessKey)
    .map((item) => {
      const key = item.accessKey!.toLowerCase();
      return {
        key,
        label: `Go to ${item.label}`,
        run: () => {
          const link = document.querySelector<HTMLAnchorElement>(
            `.os-shell .menu-bar a.menu-route[href="${item.href}"]`,
          );
          if (link) link.click();
          else location.assign(item.href);
        },
      };
    });
}

/** Mark the menu bar's route links with their keys (screen readers). */
function labelMenuBar(): void {
  const keys = new Map(siteNav.map((i) => [i.href, i.accessKey]));
  document.querySelectorAll<HTMLAnchorElement>('.os-shell .menu-bar a.menu-route').forEach((a) => {
    const k = keys.get(a.getAttribute('href') ?? '');
    if (k) a.setAttribute('aria-keyshortcuts', k.toUpperCase());
  });
}

export function shortcutList(): Shortcut[] {
  return [
    ...routeShortcuts(),
    { key: 's', label: 'Open the Start menu', run: click('.start-btn') },
    { key: 'm', label: 'Open MediaKruzer', run: () => window.KrizApps?.open?.('mediakruzer') },
    { key: 't', label: 'Light or dark', run: click('.desktop-taskbar .theme-toggle') },
    { key: 'w', label: 'Next wallpaper', run: cycleWallpaper },
    { key: 'r', label: 'Reboot', run: () => document.dispatchEvent(new CustomEvent('shell:reboot')) },
    { key: 'x', label: 'Exit XP mode', run: click('.desktop-taskbar [data-theme-switch="normal"]') },
  ];
}

const KEYS_STORAGE = 'krizdingus-xp-keys';

export function shortcutsEnabled(): boolean {
  try {
    return localStorage.getItem(KEYS_STORAGE) !== 'off';
  } catch {
    return true;
  }
}

/** Reflect the setting: the html flag (CSS hides key hints), the Settings
 *  row's check, the cheat sheet's toggle button, and aria-keyshortcuts
 *  (parked in data-keyshortcuts while off, so nothing announces dead keys). */
function applyKeysSetting(on: boolean): void {
  if (on) document.documentElement.removeAttribute('data-xp-keys');
  else document.documentElement.setAttribute('data-xp-keys', 'off');
  document.querySelectorAll<HTMLElement>(on ? '[data-keyshortcuts]' : '[aria-keyshortcuts]').forEach((el) => {
    if (on) {
      el.setAttribute('aria-keyshortcuts', el.dataset.keyshortcuts!);
      el.removeAttribute('data-keyshortcuts');
    } else {
      el.dataset.keyshortcuts = el.getAttribute('aria-keyshortcuts')!;
      el.removeAttribute('aria-keyshortcuts');
    }
  });
  document.querySelectorAll<HTMLElement>('[data-menu-action="keys-toggle"]').forEach((row) => {
    row.setAttribute('aria-checked', String(on));
    const chk = row.querySelector('.chk');
    if (chk) chk.textContent = on ? '✓' : '';
  });
  document.querySelectorAll<HTMLElement>('[data-keys-toggle]').forEach((btn) => {
    btn.textContent = on ? 'Turn keys off' : 'Turn keys on';
  });
  document.querySelectorAll<HTMLElement>('[data-keys-state]').forEach((p) => {
    p.textContent = keysNote(on);
  });
}

export function setShortcutsEnabled(on: boolean): void {
  try {
    if (on) localStorage.removeItem(KEYS_STORAGE);
    else localStorage.setItem(KEYS_STORAGE, 'off');
  } catch { /* private mode: the switch still works for this page */ }
  keysOverride = on;
  applyKeysSetting(on);
}

// Session fallback when localStorage throws.
let keysOverride: boolean | null = null;
const keysOn = (): boolean => keysOverride ?? shortcutsEnabled();
/** Whether single keys work right now (the stored choice, or this page's). */
export const shortcutsActive = keysOn;

function keysNote(on: boolean): string {
  return on
    ? 'One key at a time. They sleep while you type in a field.'
    : 'Single-key shortcuts are off. The menus, icons and taskbar still do all of this.';
}

function isTyping(el: Element | null): boolean {
  if (!el) return false;
  if ((el as HTMLElement).isContentEditable) return true;
  return el.matches('input, textarea, select, [role="textbox"], [role="combobox"]');
}

export function openCheatSheet(signal?: AbortSignal): HTMLElement {
  const rows = shortcutList()
    .map((s) => `<tr><th scope="row"><kbd>${s.key.toUpperCase()}</kbd></th><td>${s.label}</td></tr>`)
    .join('');
  return openDialog({
    marker: 'shortcuts-sheet',
    className: 'xp-dialog--keys',
    title: 'Keyboard shortcuts',
    bodyHTML:
      '<table class="xp-keys"><tbody>' +
      '<tr><th scope="row"><kbd>?</kbd></th><td>This list</td></tr>' +
      rows +
      '<tr><th scope="row"><kbd>Esc</kbd></th><td>Close a menu, dialog or app window</td></tr>' +
      '</tbody></table>' +
      `<p class="xp-keys__note" data-keys-state>${keysNote(keysOn())}</p>`,
    buttons: [
      { label: 'OK', primary: true },
      {
        label: keysOn() ? 'Turn keys off' : 'Turn keys on',
        attrs: { 'data-keys-toggle': '' },
        onClick: () => {
          setShortcutsEnabled(!keysOn());
          return true;
        },
      },
    ],
  }, signal);
}

export function installShortcuts(ctx: ThemeContext): void {
  const { signal } = ctx;
  labelMenuBar();
  keysOverride = null;
  applyKeysSetting(keysOn());
  signal.addEventListener('abort', () => document.documentElement.removeAttribute('data-xp-keys'), { once: true });
  document.addEventListener('shell:shortcuts', () => openCheatSheet(signal), { signal });
  document.addEventListener('shell:keys-toggle', () => setShortcutsEnabled(!keysOn()), { signal });
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (!keysOn()) return;
    if (isTyping(document.activeElement)) return;
    if (isDialogOpen()) return;
    if (document.body.classList.contains('is-staging') || document.querySelector('[data-boot]')) return;
    if (e.key === '?') {
      e.preventDefault();
      openCheatSheet(signal);
      return;
    }
    if (e.shiftKey) return;
    const hit = shortcutList().find((s) => s.key === e.key.toLowerCase());
    if (!hit) return;
    e.preventDefault();
    hit.run();
  }, { signal });
}
