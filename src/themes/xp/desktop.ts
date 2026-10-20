// src/themes/xp/desktop.ts
// The XP theme's desktop: icons, taskbar (with tray and clock) and the Start
// menu. Injected on mount, removed on unmount; every listener rides the
// theme's AbortSignal.
import { openRecycleBin } from './recycle';

// Krizscape's own icon (title bar, desktop shortcut, Start menu): the site's
// earlier favicon art, kept with the theme so XP looks as it always has.
import FAVICON from './assets/krizscape-32.png?url';

function escapeAttr(s: string): string {
  return s.replace(/[<>&"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[ch]!));
}

function iconAnchor(href: string, aria: string, ico: string, label: string): string {
  return (
    '<a class="desktop-icon" href="' + href + '"' + (aria ? ' aria-label="' + escapeAttr(aria) + '"' : '') + '>' +
    ico +
    '<span class="label">' + label + '</span></a>'
  );
}

function iconButton(action: string, aria: string, ico: string, label: string, app?: string | null, extra = ''): string {
  return (
    '<button type="button" class="desktop-icon" ' + extra +
    'data-desktop-action="' + action + '"' + (app ? ' data-app="' + app + '"' : '') + ' ' +
    'aria-label="' + escapeAttr(aria) + '">' +
    ico +
    '<span class="label">' + label + '</span></button>'
  );
}


/** A Start-menu row. `hk` is the slot for a keyboard-shortcut hint; the
 *  shortcut scheme (os-behaviors) fills it. Leave it empty until a key works. */
function menuItem(attrs: string, body: string, hk = '', role = 'menuitem'): string {
  const keys = hk ? ' aria-keyshortcuts="' + hk + '"' : '';
  return '<button type="button" class="mi" role="' + role + '" tabindex="-1" ' + attrs + keys + '>' + body + (hk ? '<span class="hk" aria-hidden="true">' + hk + '</span>' : '') + '</button>';
}

/** A flyout row that opens a nested submenu (hover, click or ArrowRight). */
function subMenu(label: string, menuLabel: string, inner: string, extra = '', hk = ''): string {
  return (
    '<div class="mi-group" role="none">' +
      '<button type="button" class="mi has-sub" role="menuitem" tabindex="-1" aria-haspopup="true" aria-expanded="false">' + label +
        // Always a hint slot, so the ▸ arrow sits in its own column after it.
        '<span class="hk" aria-hidden="true">' + hk + '</span></button>' +
      '<div class="submenu" role="menu" aria-label="' + menuLabel + '" ' + extra + '>' + inner + '</div>' +
    '</div>'
  );
}

const SEP = '<div class="sep" role="separator"></div>';

function desktopLayerHTML(winTitle: string): string {
  const safeTitle = escapeAttr(winTitle || 'KRIZSCAPE.EXE');
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return (
    // A named region, so landmark navigation reaches the icons and taskbar.
    '<div class="desktop-layer" role="region" aria-label="Desktop">' +
      '<div class="desktop-icons" role="group" aria-label="Desktop shortcuts">' +
        iconButton('restore', 'Open Krizscape',
          '<span class="ico ico-app" aria-hidden="true"><img src="' + FAVICON + '" alt=""></span>',
          'Krizscape', null, 'data-shell-launch ') +
        iconAnchor('/projects/', 'Projects',
          '<span class="ico ico-folder" aria-hidden="true"><span class="ico-folder-tab"></span><span class="ico-folder-glyph">▣</span></span>',
          'Projects') +
        // A CRT for the web work. No aria-label: the visible "Web" is the name
        // (the "www" on the screen is aria-hidden, and a label would have to
        // repeat it).
        iconAnchor('/web/', '',
          '<span class="ico ico-crt" aria-hidden="true"><span class="ico-crt-screen">www</span><span class="ico-crt-base"></span></span>',
          'Web') +
        iconAnchor('/blog/', 'blog.dir (Blog)',
          '<span class="ico ico-doc" aria-hidden="true"><span class="ico-doc-corner"></span><span class="ico-doc-lines"></span></span>',
          'blog.dir') +
        // No aria-label: the visible "README.txt" is the name (the "i" glyph is
        // aria-hidden, and a label would have to repeat it).
        iconAnchor('/about/', '',
          '<span class="ico ico-readme" aria-hidden="true"><span class="ico-doc-corner"></span><span class="ico-readme-glyph">i</span></span>',
          'README.txt') +
        iconButton('open-app', 'shop-tape .M3U (MediaKruzer videos)',
          '<span class="ico ico-tape" aria-hidden="true"><span class="ico-tape-reel"></span><span class="ico-tape-reel right"></span></span>',
          'shop-tape <span class="lbl-sub">.M3U</span>', 'mediakruzer') +
        iconButton('recycle', 'Recycle Bin',
          '<span class="ico ico-trash" aria-hidden="true"><span class="ico-trash-lid"></span><span class="ico-trash-body"></span></span>',
          'Recycle Bin', null, 'data-recycle-bin ') +
      '</div>' +
      '<div class="desktop-taskbar" role="toolbar" aria-label="Taskbar">' +
        '<button class="start-btn" type="button" data-desktop-action="start" aria-haspopup="true" aria-expanded="false" aria-keyshortcuts="S">' +
          '<span class="start-mark">◆</span><span class="start-label"><u>S</u>tart</span>' +
        '</button>' +
        '<div class="taskbar-divider" aria-hidden="true"></div>' +
        '<button class="tb-window is-active" type="button" data-desktop-action="restore" aria-label="' + safeTitle + '">' +
          '<img src="' + FAVICON + '" alt="" aria-hidden="true">' +
          '<span>' + safeTitle + '</span>' +
        '</button>' +
        '<div class="taskbar-spacer" aria-hidden="true"></div>' +
        '<div class="taskbar-tray" role="group" aria-label="System tray">' +
          '<button type="button" class="tray-btn tray-exit" data-theme-switch="normal" aria-label="Exit XP mode" title="Exit XP mode">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 2h8v3H8V4H4v8h4v-1h2v3H2z"/><path fill="currentColor" d="M9 6V4l5 4-5 4v-2H6V6z"/></svg>' +
          '</button>' +
          '<button type="button" class="tray-btn theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode" aria-pressed="' + (dark ? 'true' : 'false') + '">' +
            '<svg class="sun" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>' +
            '<svg class="moon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>' +
          '</button>' +
          '<a class="tray-btn" href="https://www.instagram.com/krizdingus/" target="_blank" rel="noopener" aria-label="Instagram (opens in a new tab)"><svg role="img" viewBox="0 0 24 24" fill="currentColor"><title>Instagram</title><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>' +
          '<a class="tray-btn" href="https://github.com/krizdingus" target="_blank" rel="noopener" aria-label="GitHub (opens in a new tab)"><svg role="img" viewBox="0 0 24 24" fill="currentColor"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>' +
          '<span class="clock" id="taskbar-clock" aria-label="System clock">--:--</span>' +
        '</div>' +
      '</div>' +
      '<div class="start-menu" id="start-menu" role="menu" aria-label="Start" aria-hidden="true">' +
        '<div class="start-rail" aria-hidden="true">KRIZDINGUS<br>XP</div>' +
        '<div class="start-items">' +
          '<button class="start-item has-fly" type="button" tabindex="-1" data-fly="programs" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-controls="start-fly-programs">' +
            '<span class="si-ico">▣</span>' +
            '<span class="si-text"><b>Programs</b><small>What’s on the desktop</small></span>' +
            '<span class="si-arrow" aria-hidden="true">▸</span>' +
          '</button>' +
          '<div class="start-flyout" id="start-fly-programs" role="menu" aria-label="Programs" aria-hidden="true">' +
            menuItem('data-menu-action="restore-shell"', '<span class="pmi"><img class="pmi-ico" src="' + FAVICON + '" alt="" aria-hidden="true"><span>Krizscape</span></span>') +
            SEP +
            menuItem('data-menu-action="go-projects"', '<span class="pmi"><span class="pmi-ico pmi-folder" aria-hidden="true">▣</span><span>Projects</span></span>', 'P') +
            menuItem('data-menu-action="go-web"', '<span class="pmi"><span class="pmi-ico pmi-crt" aria-hidden="true">www</span><span>Web</span></span>', 'E') +
            menuItem('data-menu-action="go-blog"', '<span class="pmi"><span class="pmi-ico pmi-doc" aria-hidden="true">▤</span><span>blog.dir</span></span>', 'B') +
            menuItem('data-menu-action="go-about"', '<span class="pmi"><span class="pmi-ico pmi-readme" aria-hidden="true">i</span><span>README.txt</span></span>', 'A') +
            menuItem('data-menu-action="open-app" data-app="mediakruzer"', '<span class="pmi"><span class="pmi-ico pmi-tape" aria-hidden="true">▶</span><span>MediaKruzer 7.0</span></span>', 'M') +
            SEP +
            menuItem('data-menu-action="recycle"', '<span class="pmi"><span class="pmi-ico pmi-trash" aria-hidden="true"><span class="pmi-trash-can"></span></span><span>Recycle Bin</span></span>') +
          '</div>' +
          '<button class="start-item has-fly" type="button" tabindex="-1" data-fly="settings" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-controls="start-fly-settings">' +
            '<span class="si-ico">◐</span>' +
            '<span class="si-text"><b>Settings</b><small>Light or dark, wallpaper, boot</small></span>' +
            '<span class="si-arrow" aria-hidden="true">▸</span>' +
          '</button>' +
          '<div class="start-flyout" id="start-fly-settings" role="menu" aria-label="Settings" aria-hidden="true">' +
            menuItem('data-menu-action="theme-toggle"', '<span>Light or dark</span>', 'T') +
            subMenu('<span>Wallpaper</span>', 'Wallpaper',
              menuItem('data-menu-action="wallpaper" data-value="xp" aria-checked="true"', '<span class="chk" aria-hidden="true">●</span><span>Bliss Hill</span>', '', 'menuitemradio') +
              menuItem('data-menu-action="wallpaper" data-value="canyons" aria-checked="false"', '<span class="chk" aria-hidden="true"></span><span>Canyons</span>', '', 'menuitemradio') +
              menuItem('data-menu-action="wallpaper" data-value="tulips" aria-checked="false"', '<span class="chk" aria-hidden="true"></span><span>Tulips</span>', '', 'menuitemradio') +
              menuItem('data-menu-action="wallpaper" data-value="generic" aria-checked="false"', '<span class="chk" aria-hidden="true"></span><span>Mountains</span>', '', 'menuitemradio'), '', 'W') +
            subMenu('<span>Boot sequence</span>', 'Boot sequence', '', 'data-boot-theme-menu') +
            SEP +
            menuItem('data-menu-action="keys-toggle" aria-checked="true"', '<span class="pmi"><span class="chk" aria-hidden="true">✓</span><span>Use single-key shortcuts</span></span>', '', 'menuitemcheckbox') +
            menuItem('data-menu-action="fx-toggle" aria-checked="true"', '<span class="pmi"><span class="chk" aria-hidden="true">✓</span><span>Screen effects</span></span>', '', 'menuitemcheckbox') +
            menuItem('data-menu-action="shortcuts"', '<span>Keyboard shortcuts</span>', '?') +
          '</div>' +
          '<div class="start-sep" role="separator"></div>' +
          '<button class="start-item has-fly" type="button" tabindex="-1" data-fly="shutdown" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-controls="start-fly-shutdown">' +
            '<span class="si-ico">↻</span>' +
            '<span class="si-text"><b>Shut down…</b><small>Reboot or exit</small></span>' +
            '<span class="si-arrow" aria-hidden="true">▸</span>' +
          '</button>' +
          '<div class="start-flyout" id="start-fly-shutdown" role="menu" aria-label="Shut down" aria-hidden="true">' +
            menuItem('data-menu-action="reboot"', '<span>Reboot</span>', 'R') +
            menuItem('data-menu-action="close"', '<span>Close Krizscape</span>') +
            menuItem('data-menu-action="exit-skin" data-theme-switch="normal"', '<span>Exit XP mode</span>', 'X') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

/** Inject the desktop (idempotent). Returns the nodes it added, for unmount. */
export function ensureDesktopShell(winTitle = 'KRIZSCAPE.EXE'): HTMLElement[] {
  const existing = document.querySelector<HTMLElement>('.desktop-layer');
  if (existing) return [existing, document.querySelector<HTMLElement>('.start-menu-host') ?? document.getElementById('start-menu')!].filter(Boolean);

  // After the skip link, so "Skip to main content" stays the first tab stop.
  const skip = document.querySelector<HTMLElement>('body > .skip-link');
  if (skip) skip.insertAdjacentHTML('afterend', desktopLayerHTML(winTitle));
  else document.body.insertAdjacentHTML('afterbegin', desktopLayerHTML(winTitle));
  const layer = document.querySelector<HTMLElement>('.desktop-layer')!;

  // Lift #start-menu to <body> so its z-index escapes .desktop-layer's
  // stacking context. Its host is a plain, unstyled region landmark, so an
  // open menu still sits inside a landmark.
  const startMenu = document.getElementById('start-menu');
  if (startMenu && startMenu.parentElement === layer) {
    const host = document.createElement('div');
    host.className = 'start-menu-host';
    host.setAttribute('role', 'region');
    host.setAttribute('aria-label', 'Start menu');
    host.appendChild(startMenu);
    document.body.appendChild(host);
    return [layer, host];
  }
  return startMenu ? [layer, startMenu] : [layer];
}

function installClock(signal?: AbortSignal): void {
  const clock = document.getElementById('taskbar-clock');
  if (!clock) return;
  const tick = (): void => {
    // 12-hour with AM/PM, like the trays of the era.
    const d = new Date();
    const h = d.getHours();
    const mm = String(d.getMinutes()).padStart(2, '0');
    clock.textContent = `${h % 12 || 12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
  };
  tick();
  const id = setInterval(tick, 30_000);
  signal?.addEventListener('abort', () => clearInterval(id));
}

export function installDesktop(signal?: AbortSignal): void {
  const on = { signal };
  installClock(signal);

  // Desktop icons
  document.querySelectorAll<HTMLElement>('.desktop-icon[data-desktop-action]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const action = el.dataset.desktopAction;
      if (action === 'restore') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('shell:restore'));
      } else if (action === 'recycle') {
        e.preventDefault();
        openRecycleBin(signal);
      } else if (action === 'open-app') {
        e.preventDefault();
        const app = el.dataset.app;
        if (app) window.KrizApps?.open?.(app);
      }
    }, on);
  });

  // Start button + Start menu + flyouts + submenus. CSS expects .is-open on
  // .start-menu (display: grid), .start-flyout (display: block) and
  // .mi-group (shows its .submenu); aria attributes stay in sync.
  // Keyboard follows the APG menu pattern: Enter/Space/ArrowUp/ArrowDown on
  // Start opens the menu and focuses a row; ArrowUp/ArrowDown/Home/End move
  // within a level; ArrowRight/Enter opens a flyout or submenu; ArrowLeft and
  // Esc close one level and return focus to its trigger; Tab closes it all.
  const startBtn = document.querySelector<HTMLElement>('.start-btn');
  const startMenu = document.getElementById('start-menu');
  const flyToggles = startMenu ? Array.from(startMenu.querySelectorAll<HTMLButtonElement>('.start-item.has-fly')) : [];

  const flyoutFor = (t: HTMLElement): HTMLElement | null => document.getElementById('start-fly-' + (t.dataset.fly ?? ''));
  const toggleFor = (fly: HTMLElement): HTMLElement | null =>
    flyToggles.find((t) => flyoutFor(t) === fly) ?? null;

  function closeGroup(g: Element): void {
    g.classList.remove('is-open');
    g.querySelector(':scope > .mi.has-sub')?.setAttribute('aria-expanded', 'false');
  }

  function closeAllFlyouts(): void {
    flyToggles.forEach((t) => {
      t.setAttribute('aria-expanded', 'false');
      const fly = flyoutFor(t);
      if (fly) {
        fly.classList.remove('is-open');
        fly.setAttribute('aria-hidden', 'true');
        fly.querySelectorAll('.mi-group.is-open').forEach(closeGroup);
      }
    });
  }

  function setOpen(open: boolean): void {
    if (!startMenu || !startBtn) return;
    startMenu.classList.toggle('is-open', open);
    startMenu.setAttribute('aria-hidden', String(!open));
    startBtn.setAttribute('aria-expanded', String(open));
    if (!open) closeAllFlyouts();
  }

  function openFlyout(t: HTMLElement): HTMLElement | null {
    const fly = flyoutFor(t);
    if (!fly) return null;
    closeAllFlyouts();
    t.setAttribute('aria-expanded', 'true');
    fly.classList.add('is-open');
    fly.setAttribute('aria-hidden', 'false');
    return fly;
  }

  function openGroup(trigger: HTMLElement): HTMLElement | null {
    const g = trigger.closest('.mi-group');
    if (!g) return null;
    g.parentElement?.querySelectorAll(':scope > .mi-group.is-open').forEach((o) => { if (o !== g) closeGroup(o); });
    g.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    return g.querySelector<HTMLElement>(':scope > .submenu');
  }

  /** The focusable rows of one menu level (not those of nested menus). */
  function rowsOf(menu: Element): HTMLElement[] {
    if (menu === startMenu) return flyToggles;
    return Array.from(menu.querySelectorAll<HTMLElement>(':scope > .mi, :scope > .mi-group > .mi'));
  }

  function focusRow(menu: Element | null, which: 'first' | 'last' = 'first'): void {
    if (!menu) return;
    const rows = rowsOf(menu);
    (which === 'first' ? rows[0] : rows[rows.length - 1])?.focus();
  }

  /** Close the innermost open level around `row` and focus its trigger. */
  function closeLevel(row: HTMLElement): boolean {
    const menu = row.parentElement?.closest<HTMLElement>('[role="menu"]');
    if (!menu || menu === startMenu) return false;
    if (menu.classList.contains('submenu')) {
      const g = menu.closest('.mi-group');
      if (!g) return false;
      closeGroup(g);
      g.querySelector<HTMLElement>(':scope > .mi.has-sub')?.focus();
      return true;
    }
    const t = toggleFor(menu);
    closeAllFlyouts();
    t?.focus();
    return true;
  }

  if (startBtn && startMenu) {
    flyToggles.forEach((t) => {
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        const fly = flyoutFor(t);
        if (!fly) return;
        if (fly.classList.contains('is-open')) {
          // A mouse click on a row its hover already opened keeps it open.
          if (e.detail === 0) closeAllFlyouts();
        } else {
          openFlyout(t);
          if (e.detail === 0) focusRow(fly); // keyboard-activated
        }
      }, on);
    });

    startMenu.querySelectorAll<HTMLElement>('.mi.has-sub').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const g = trigger.closest('.mi-group');
        if (g?.classList.contains('is-open')) {
          if (e.detail === 0) closeGroup(g);
        } else {
          const sub = openGroup(trigger);
          if (e.detail === 0) focusRow(sub);
        }
      }, on);
    });

    // Hover opens a flyout or submenu after a short rest, as on the desktops
    // of the period; hovering a plain row closes its open siblings.
    let hoverTimer: ReturnType<typeof setTimeout> | undefined;
    startMenu.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const row = (e.target as Element | null)?.closest?.<HTMLElement>('.start-item.has-fly, .start-flyout .mi');
      if (!row) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (!startMenu.classList.contains('is-open') || !row.matches(':hover')) return;
        if (row.classList.contains('has-fly')) {
          if (row.getAttribute('aria-expanded') !== 'true') openFlyout(row);
          return;
        }
        if (row.classList.contains('has-sub')) {
          // openGroup also closes the other open submenus on its level.
          if (row.getAttribute('aria-expanded') !== 'true') openGroup(row);
        } else {
          row.parentElement?.querySelectorAll(':scope > .mi-group.is-open').forEach(closeGroup);
        }
      }, 150);
    }, on);
    signal?.addEventListener('abort', () => clearTimeout(hoverTimer), { once: true });

    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !startMenu.classList.contains('is-open');
      setOpen(open);
      if (open && (e as MouseEvent).detail === 0) focusRow(startMenu);
    }, on);

    startBtn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      setOpen(true);
      focusRow(startMenu, e.key === 'ArrowUp' ? 'last' : 'first');
    }, on);

    startMenu.addEventListener('keydown', (e) => {
      const row = (e.target as HTMLElement | null)?.closest?.<HTMLElement>('.start-item, .mi');
      if (!row) return;
      const menu = row.parentElement?.closest<HTMLElement>('[role="menu"]');
      if (!menu) return;
      const rows = rowsOf(menu);
      const i = rows.indexOf(row);
      const move = (n: number): void => { rows[(i + n + rows.length) % rows.length]?.focus(); };
      switch (e.key) {
        case 'ArrowDown': move(1); break;
        case 'ArrowUp': move(-1); break;
        case 'Home': rows[0]?.focus(); break;
        case 'End': rows[rows.length - 1]?.focus(); break;
        case 'ArrowRight':
          if (row.classList.contains('has-fly')) focusRow(openFlyout(row));
          else if (row.classList.contains('has-sub')) focusRow(openGroup(row));
          else return;
          break;
        case 'ArrowLeft':
          if (!closeLevel(row)) return;
          break;
        case 'Escape':
          if (!closeLevel(row)) { setOpen(false); startBtn.focus(); }
          e.stopPropagation();
          break;
        case 'Tab':
          // Leave the menu; focus continues from Start in tab order.
          setOpen(false);
          startBtn.focus();
          return;
        default:
          return;
      }
      e.preventDefault();
    }, on);

    document.addEventListener('click', (e) => {
      if (startMenu.classList.contains('is-open')
          && !startMenu.contains(e.target as Node)
          && !startBtn.contains(e.target as Node)) {
        setOpen(false);
      }
    }, on);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && startMenu.classList.contains('is-open')) {
        setOpen(false);
        startBtn.focus();
      }
    }, on);
  }

  // Start-menu items: route + meta actions. Close the menu on activation.
  // theme-toggle is handled by src/scripts/theme.ts and exit-skin by the
  // theme runtime ([data-theme-switch]); both are delegated document-wide.
  // Every activation (keyboard or mouse) hands focus back to Start, since the
  // row it came from is about to be hidden; actions that move focus on
  // (a dialog, the relaunch icon, a window) take it from there.
  // Delegated, so rows added later (Settings → Boot sequence, filled by
  // boot.ts) close the menu too.
  document.querySelector<HTMLElement>('#start-menu')?.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>('.mi[data-menu-action]');
    if (!el) return;
    const action = el.dataset.menuAction;
    setOpen(false);
    if (action !== 'exit-skin') startBtn?.focus({ preventScroll: true });
    switch (action) {
      case 'restore-shell': document.dispatchEvent(new CustomEvent('shell:restore')); break;
      case 'go-projects': location.href = '/projects/'; break;
      case 'go-web': location.href = '/web/'; break;
      case 'go-blog': location.href = '/blog/'; break;
      case 'go-about': location.href = '/about/'; break;
      case 'open-app':
        if (el.dataset.app) window.KrizApps?.open?.(el.dataset.app);
        break;
      case 'recycle': openRecycleBin(signal); break;
      case 'shortcuts': document.dispatchEvent(new CustomEvent('shell:shortcuts')); break;
      case 'keys-toggle': document.dispatchEvent(new CustomEvent('shell:keys-toggle')); break;
      case 'fx-toggle': document.dispatchEvent(new CustomEvent('shell:fx-toggle')); break;
      case 'reboot': document.dispatchEvent(new CustomEvent('shell:reboot')); break;
      case 'close': document.dispatchEvent(new CustomEvent('shell:close')); break;
    }
  }, on);

  // Taskbar tile for the Krizscape window: minimize / restore.
  const tb = document.querySelector<HTMLElement>('.desktop-taskbar .tb-window[data-desktop-action="restore"]');
  tb?.addEventListener('click', () => {
    const shell = document.querySelector<HTMLElement>('.os-shell');
    if (!shell || shell.classList.contains('is-minimized')) {
      document.dispatchEvent(new CustomEvent('shell:restore'));
    } else {
      document.dispatchEvent(new CustomEvent('shell:minimize'));
    }
  }, on);
}

// CRT screen FX — ambient glitches (bleed, flicker, roll), one every 4-11s,
// and only the first few on each page: the screen settles down after that.
// Suppressed under prefers-reduced-motion; Start > Settings > Screen effects
// turns them off (./screen-fx.ts owns that switch).
// -----------------------------------------------------------
const CRT_FX_KINDS = ['fx-bleed', 'fx-flicker', 'fx-roll'] as const;
const CRT_FX_WEIGHTS = [0.35, 0.40, 0.25];
/** Glitches per page before the screen goes quiet. */
export const CRT_FX_BURSTS = 4;

function pickCrtKind(): string {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < CRT_FX_KINDS.length; i++) {
    acc += CRT_FX_WEIGHTS[i];
    if (r < acc) return CRT_FX_KINDS[i];
  }
  return CRT_FX_KINDS[0];
}

let crtStop: (() => void) | null = null;
// Bursts already shown on this page; turning the effects back on doesn't
// restart the count.
let crtFired = 0;

/** Stop the CRT glitches and take the overlay off the screen. */
export function stopCrtFx(): void {
  crtStop?.();
}

export function installCrtFx(signal?: AbortSignal): void {
  if (crtStop) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fx = document.createElement('div');
  fx.className = 'crt-screen-fx';
  fx.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fx);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let safety: ReturnType<typeof setTimeout> | undefined;
  const stop = (): void => {
    clearTimeout(timer);
    clearTimeout(safety);
    fx.remove();
    crtStop = null;
  };
  crtStop = stop;
  signal?.addEventListener('abort', () => { stop(); crtFired = 0; }, { once: true });
  // Reduced motion switched on mid-session stops the FX for good.
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener?.('change', (e) => { if (e.matches) stop(); }, { signal });

  function schedule(): void {
    if (signal?.aborted || crtStop !== stop || crtFired >= CRT_FX_BURSTS) return;
    timer = setTimeout(fire, 4000 + Math.random() * 7000);
  }
  function fire(): void {
    crtFired++;
    const kind = pickCrtKind();
    fx.classList.add(kind);
    const onEnd = (): void => {
      clearTimeout(safety);
      fx.classList.remove(kind);
      fx.removeEventListener('animationend', onEnd);
      schedule();
    };
    fx.addEventListener('animationend', onEnd);
    // Safety: clear if animationend doesn't fire within ~1.4s
    safety = setTimeout(onEnd, 1400);
  }
  schedule();
}
