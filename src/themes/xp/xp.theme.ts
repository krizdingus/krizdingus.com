// src/themes/xp/xp.theme.ts — theme #1, XP/OS mode.
// Loaded lazily by the theme runtime, only when this theme mounts. Turns the
// normal page into the Krizscape desktop: the page's <main> moves into an OS
// window, and a desktop, taskbar and Start menu go around it. The first time a
// browser enters XP mode the boot cinematic plays (never under reduced motion).
import type { ThemeContext, ThemeModule } from '../types';
import cssHref from './xp.theme.css?url';
import { buildShell, SHELL_TITLE, type ShellHandle } from './shell';
import { ensureDesktopShell, installDesktop } from './desktop';
import { installOSChrome, wireShell, reattachShell } from './os-chrome';
import { installWindows } from './windows';
import { initWallpaper } from './wallpaper';
import { initBootThemePicker, playBoot, hasBooted, cancelBoot } from './boot';
import { installScreenFx } from './screen-fx';
import { installShortcuts } from './shortcuts';
import { installApps } from './apps';
import { getApp } from './apps-registry';
import { installEggs } from './eggs';
import { mountDressing } from './dressing';

let handle: ShellHandle | null = null;
let added: HTMLElement[] = [];

const BODY_CLASSES = ['has-desktop', 'is-staging', 'is-revealing'];
// Leave <body> exactly as found: no empty class="" after unmount.
let bodyHadClass = false;

export const styles = [cssHref];

export function mount(ctx: ThemeContext): void {
  const { signal } = ctx;
  window.scrollTo(0, 0);

  handle = buildShell();
  if (!handle) throw new Error('xp: page has no [data-site] / #main to wrap');
  bodyHadClass = document.body.hasAttribute('class');
  document.body.classList.add('has-desktop');
  added = ensureDesktopShell(document.body.dataset.shellTitle || SHELL_TITLE);

  installWindows(signal);
  installDesktop(signal);
  initWallpaper(signal);
  installOSChrome(signal);
  wireShell(handle.shell, signal);
  // Raise the Krizscape window before installApps brings back the previous
  // page's app windows, so a remembered player opens on top of it.
  window.KrizWM?.focus?.(handle.shell);
  initBootThemePicker(signal);
  installShortcuts(ctx);
  installApps(signal);
  installEggs(signal);
  added.push(...mountDressing(ctx));
  autolaunchApp();

  // Scanlines and CRT glitches: never under reduced motion, and switchable
  // from Start > Settings.
  installScreenFx(signal);

  // A locked page (/apps/<slug>/, a direct link to an app) opens straight to
  // the app and leaves the first-time boot for a real entry through the toggle.
  const lockedRoute = document.documentElement.hasAttribute('data-theme-lock');
  if (!hasBooted() && !ctx.reducedMotion && !lockedRoute) {
    // Plays over the mounted desktop; mount returns right away so a view
    // transition can hand over to the boot screen.
    void playBoot();
  }
}

/** An /apps/<slug>/ page asks for its app with [data-app-autolaunch]: the
 *  desktop shows with the app open and the Krizscape window tucked into the
 *  taskbar. */
function autolaunchApp(): void {
  const key = document.querySelector<HTMLElement>('[data-app-autolaunch]')?.dataset.appAutolaunch;
  if (!key || !getApp(key) || !window.KrizApps) return;
  // Tuck the Krizscape window away first, so the app opens centered on an
  // empty desktop rather than cascaded off a window that's about to go.
  document.dispatchEvent(new CustomEvent('shell:minimize'));
  const win = window.KrizApps.open(key, { focus: false });
  if (!win) return;
  // The page's own h1 is in the window that just went to the taskbar, so the
  // app window's title is the page heading here.
  win.querySelector('[data-app-heading]')?.setAttribute('aria-level', '1');
}

export function unmount(_ctx: ThemeContext): void {
  cancelBoot();
  reattachShell();
  // Floating app windows belong to the desktop.
  document.querySelectorAll('.app-window').forEach((w) => w.remove());
  added.forEach((n) => n.remove());
  added = [];
  handle?.restore();
  handle = null;
  document.body.classList.remove(...BODY_CLASSES);
  if (!bodyHadClass && !document.body.classList.length) document.body.removeAttribute('class');
  document.documentElement.removeAttribute('data-wallpaper');
}

const theme: ThemeModule = { styles, mount, unmount };
export default theme;
