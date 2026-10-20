// src/themes/xp/boot.ts
// The boot cinematic: BIOS lines → XP splash → desktop reveal. Plays the
// first time a browser enters XP mode (and on Reboot). Skip (Esc, click, or
// the skip button) ends all three stages at once.
import { animateTyping, animateDots, animateAsciiProgress } from './anim-utils';

type Line =
  | { kind: 'typing'; text: string; cssType: string }
  | { kind: 'dots'; text: string; cssType: string; duration: number }
  | { kind: 'progress'; text: string; cssType: string; duration: number }
  | { kind: 'plain'; text: string; cssType: string; duration: number };

export interface BootTheme {
  label: string;
  lines: Line[];
}

function pl(
  text: string,
  cssType: string,
  delay: number,
  flags?: { typing?: boolean; dots?: boolean; progress?: boolean }
): Line {
  if (flags?.typing) return { kind: 'typing', text, cssType };
  if (flags?.dots) return { kind: 'dots', text, cssType, duration: delay };
  if (flags?.progress) return { kind: 'progress', text, cssType, duration: delay };
  return { kind: 'plain', text, cssType, duration: delay };
}

const STORAGE_KEY = 'krizdingus-boot-theme';
/** Set once the boot has played (or been skipped) in this browser. */
export const BOOTED_KEY = 'krizdingus-xp-booted';

// The six boot sequences from the old site's scripts.js, restored with two
// real-world lines fixed: the printer is an X1C (was P1S) and the site doesn't
// use Anime.js (that line is gone). Every line is parody of a boot screen.
export const BOOT_THEMES = {
  'chrono-terminal': {
    label: 'Chrono Terminal',
    lines: [
      pl('KRIZDINGUS.EXE v∞.01', 'system', 400),
      pl('Loading Temporal Shell', 'system', 300),
      pl('POST: Memory scan... 1994 located', 'success', 200),
      pl('POST: Ego containment... STABLE', 'success', 150),
      pl('Launching TimeCore bootloader', 'loading', 400, { dots: true }),
      pl('Verifying VHS integrity', 'loading', 500, { dots: true }),
      pl('Authenticating through save battery', 'loading', 500, { dots: true }),
      pl('Mount /mnt/nostalgia... OK', 'success', 250),
      pl('Mount /mnt/zyn... OK', 'success', 250),
      pl('Synchronizing flavor crystals', 'loading', 500, { dots: true }),
      pl('Engaging minor chaos engine', 'loading', 700, { progress: true }),
      pl('Username: krizdingus', 'system', 800, { typing: true }),
      pl('Password: ********', 'system', 600, { typing: true }),
      pl('Login accepted, for reasons unclear', 'success', 300),
      pl('Loading preferences from garage wall', 'loading', 500, { progress: true }),
      pl('Initializing craft-core OS', 'loading', 400, { dots: true }),
      pl('Importing workshop humidity profile', 'loading', 300, { dots: true }),
      pl('Spray glue: NEUTRALIZED', 'success', 200),
      pl('You may proceed with ritual tinkering', 'system', 400),
      pl('Checking Crystal Pepsi reserves', 'loading', 500, { dots: true }),
    ],
  },
  'bambuos': {
    label: 'BambuOS',
    lines: [
      pl('KRIZFABRICATOR v9.5', 'system', 400),
      pl('Booting: BambuOS (fan firmware updated again)', 'system', 300),
      pl('Spooling MakerWorld API', 'loading', 500, { dots: true }),
      pl('AMS1: UNKNOWN FILAMENT, HOPE ANYWAY', 'warning', 600, { progress: true }),
      pl('X1C Bed Adhesion: IMAGINED', 'success', 200),
      pl('Nozzle temp: OBEDIENT, CONCERNING', 'success', 200),
      pl('Wi-Fi handshake: POLITE', 'success', 200),
      pl('Evaluating ambient gremlin factor', 'loading', 400, { dots: true }),
      pl('Gremlin detected: APPROACHING TOOLHEAD', 'warning', 200),
      pl('Workshop scent: BURNT PLA + DETERMINATION', 'success', 250),
      pl('Filament left: JUST ENOUGH TO RISK IT', 'warning', 250),
      pl('Username: @krizdingus', 'system', 700, { typing: true }),
      pl('Password: ********', 'system', 600, { typing: true }),
      pl('Authorized for light mayhem', 'success', 300),
      pl('Loading: STLs, ideas, mild resentment', 'loading', 600, { progress: true }),
      pl('Resin envy: CONTAINED', 'success', 400),
      pl('Hotend: LOUD AND READY', 'success', 300),
      pl('Ready to commit crimes against tolerances', 'system', 400),
      pl('Nearby resin printer: SMUG', 'success', 400),
    ],
  },
  'terminal-crimewave': {
    label: 'Terminal Crimewave',
    lines: [
      pl('K-SHELL v39', 'system', 400),
      pl('Loading: Dev stack + miscellaneous regret', 'system', 300),
      pl('make coffee: BUILD SUCCESSFUL', 'success', 200),
      pl('npm install: questionable plugin accepted', 'loading', 700, { progress: true }),
      pl("git status: It's fine. You're fine.", 'success', 300),
      pl('Slack: MUTED FOR HEALTH', 'success', 300),
      pl('Launching VS Code extensions: 17 detected', 'loading', 400, { dots: true }),
      pl('Autocompletion: OFFENDED', 'warning', 500, { dots: true }),
      pl('Running test suite... SOMEHOW GREEN', 'success', 300),
      pl('API handshake: GENTLE', 'success', 400),
      pl('Username: krizdev', 'system', 700, { typing: true }),
      pl('Password: ********', 'system', 600, { typing: true }),
      pl('Welcome, Code Creature', 'success', 300),
      pl('Linting... mostly decorative', 'loading', 600, { progress: true }),
      pl('Sass variables emotionally loaded', 'success', 400),
      pl('Emmet mode: RITUAL BEGUN', 'success', 300),
      pl('Dev environment stabilized under duress', 'system', 400),
    ],
  },
  'bootleg-hero': {
    label: 'Bootleg Hero Mode',
    lines: [
      pl('KRIZGAME SYSTEM vX.199X', 'system', 400),
      pl('ZELDOS.EXE is not licensed by anyone', 'system', 300),
      pl('Blow into cartridge to continue', 'loading', 800, { progress: true }),
      pl('Bootleg detected: AUTHENTIC', 'success', 300),
      pl('Scan: Hair physics exceeding engine limits', 'warning', 600, { dots: true }),
      pl('Power level: YES', 'success', 200),
      pl('Save battery: LEAKING HISTORY', 'warning', 200),
      pl('Scope Creep has appeared!', 'error', 300),
      pl('Cheat code enabled: UNLIMITED CRAFTING MATERIALS', 'success', 250),
      pl('Debug Mode: VISIBLE TO ENEMIES', 'warning', 250),
      pl('High Score: UNVERIFIED, BUT LEGENDARY', 'success', 200),
      pl('You are now playing as: Spider-Man (wrong franchise)', 'system', 400),
      pl('Traffic density: HIGH', 'warning', 300),
      pl('Inventory: Hookshot, vape, unpaid invoice', 'success', 250),
      pl('Game state: AUTO-SAVED AGAINST YOUR WILL', 'success', 200),
      pl('Start button detected: DO NOT PRESS', 'warning', 300),
      pl('Engaging Hero Mode: GOOD LUCK I GUESS', 'system', 400),
    ],
  },
  'multimedios-98': {
    label: "MultimediOS '98",
    lines: [
      pl('KRIZDINGUS MULTIMEDIOS v2.66', 'system', 400),
      pl('Detecting 56K modem... SCREAMING', 'system', 300),
      pl('POST: CD tray... EJECTING FOR NO REASON', 'warning', 200),
      pl('POST: ZIP drive... WHY', 'warning', 150),
      pl('Boot sector secured with AOL 1000 Hour Trial', 'loading', 400, { dots: true }),
      pl('Launching Clippy containment shell', 'loading', 500, { dots: true }),
      pl("Authenticating through Encarta '95", 'loading', 500, { dots: true }),
      pl('Mount /mnt/gundam_wing_fanvids... OK', 'success', 250),
      pl('Mount /mnt/milkdrop_presets... OK', 'success', 250),
      pl('Synchronizing Winamp skins', 'loading', 500, { dots: true }),
      pl('Launching GeoCities compatibility layer', 'loading', 700, { progress: true }),
      pl('Username: krizdude_2000', 'system', 800, { typing: true }),
      pl('Password: ******** (rhymes with butt)', 'system', 600, { typing: true }),
      pl('Login successful. Your buddy list is empty.', 'success', 300),
      pl('Initializing ICQ ghost process', 'loading', 500, { progress: true }),
      pl('Fetching Yahoo! news from 2001...', 'loading', 400, { dots: true }),
      pl('George W. Bush codec missing, defaulting to GIF', 'warning', 300, { dots: true }),
      pl('SPYWARE.EXE: sleeping but alert', 'success', 200),
      pl('System warmed up. Ready to burn 1 song per CD.', 'system', 400),
    ],
  },
  'lan-party': {
    label: 'LAN Party',
    lines: [
      pl('KRIZNET v1.6c (TeamSpeak Compatible)', 'system', 400),
      pl('Detecting CRT glow... GREENISH', 'system', 300),
      pl('POST: Surge protector... STICKY BUT FUNCTIONAL', 'warning', 200),
      pl("POST: Ethernet handshake... BRO'D", 'success', 150),
      pl('Spooling up dial-up fallback modem', 'loading', 400, { dots: true }),
      pl('Launching HL1.exe with questionable flags', 'loading', 500, { dots: true }),
      pl('Pinging host... 999ms, PERFECT', 'success', 500),
      pl('Mount /mnt/shared: SUSPICIOUSLY OPEN', 'success', 250),
      pl('Mount /mnt/porn: DENIED BY MOM', 'error', 250),
      pl('Synchronizing Energy Drink Logs', 'loading', 500, { dots: true }),
      pl('No-CD Crack detected: LEGENDARY', 'success', 700, { progress: true }),
      pl('Username: ][_KrizZz_][', 'system', 800, { typing: true }),
      pl('Password: ******** (written on desk)', 'system', 600, { typing: true }),
      pl("Connected to lobby: 'clan-killzone420'", 'success', 300),
      pl('Winamp playlist: 92 tracks, no skips (allegedly)', 'loading', 500, { progress: true }),
      pl('USB fan: WHIRRING VIOLENTLY', 'success', 400),
      pl('Voice chat: DEAFENING BREATHING', 'warning', 300),
      pl('All systems go. Somebody ordered pizza, right?', 'success', 200),
      pl('Press any key to drop into Dust2', 'system', 400),
    ],
  },
} as const satisfies Record<string, BootTheme>;

export type BootThemeKey = keyof typeof BOOT_THEMES;

const FINALE_BASE = 'Loading Krizdingus.exe';
const FINALE_DOTS_DURATION = 1200;
const FINALE_SUCCESS_TEXT = 'Krizdingus.exe loaded successfully';

function isBootThemeKey(v: string | null): v is BootThemeKey {
  return v !== null && v in BOOT_THEMES;
}

/** The visitor's pick in Settings → Boot sequence. Nothing stored means
 *  'random': a different theme each boot, until they pick one. 'none' skips
 *  the BIOS lines and goes straight to the splash. */
export type BootChoice = BootThemeKey | 'random' | 'none';
export const BOOT_ORDER = Object.keys(BOOT_THEMES) as BootThemeKey[];

export function getBootChoice(): BootChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'none' || isBootThemeKey(v)) return v;
  } catch {
    /* storage disabled */
  }
  return 'random';
}

// The theme the last boot played, so "next theme" moves on from what you saw.
let lastPlayed: BootThemeKey | null = null;

function pickRandom(): BootThemeKey {
  const pool = BOOT_ORDER.filter((k) => k !== lastPlayed);
  return pool[Math.floor(Math.random() * pool.length)] ?? BOOT_ORDER[0];
}

/** Which theme a boot plays now (null: no BIOS lines). */
export function resolveBootTheme(choice: BootChoice = getBootChoice()): BootThemeKey | null {
  if (choice === 'none') return null;
  if (choice === 'random') return pickRandom();
  return choice;
}

/** The theme after the current one, in menu order (the boot-theme egg). */
export function nextBootTheme(): BootThemeKey {
  const choice = getBootChoice();
  const from = isBootThemeKey(choice) ? choice : lastPlayed;
  const i = from ? BOOT_ORDER.indexOf(from) : -1;
  return BOOT_ORDER[(i + 1) % BOOT_ORDER.length];
}

export function hasBooted(): boolean {
  try {
    return localStorage.getItem(BOOTED_KEY) === '1';
  } catch {
    return false;
  }
}

function markBooted(): void {
  try {
    localStorage.setItem(BOOTED_KEY, '1');
  } catch {
    /* storage disabled — the boot will play again next time */
  }
}

function syncBootCheckmarks(active: BootChoice): void {
  document.querySelectorAll<HTMLElement>('[data-menu-action="boot-theme"]').forEach((el) => {
    const chk = el.querySelector<HTMLElement>('.chk');
    if (el.hasAttribute('aria-checked')) el.setAttribute('aria-checked', String(el.dataset.value === active));
    if (!chk) return;
    chk.textContent = el.dataset.value === active ? '●' : '';
  });
}

export function setBootChoice(choice: BootChoice): void {
  if (choice !== 'random' && choice !== 'none' && !isBootThemeKey(choice)) return;
  try {
    if (choice === 'random') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage disabled — non-fatal */
  }
  syncBootCheckmarks(choice);
}

function playLine(target: HTMLElement, line: Line): Promise<void> {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = `boot-line ${line.cssType}`;
    target.appendChild(el);
    target.scrollTop = target.scrollHeight;

    if (line.kind === 'typing') {
      animateTyping(el, line.text, () => setTimeout(resolve, 200));
    } else if (line.kind === 'dots') {
      animateDots(el, line.text, line.duration, () => setTimeout(resolve, 200));
    } else if (line.kind === 'progress') {
      el.innerHTML = line.text + ' <span class="ascii-progress"></span>';
      target.scrollTop = target.scrollHeight;
      const progressSpan = el.querySelector<HTMLElement>('.ascii-progress')!;
      const fillDuration = Math.max(200, line.duration - 100);
      animateAsciiProgress(progressSpan, fillDuration);
      setTimeout(resolve, line.duration);
    } else {
      el.textContent = line.text;
      target.scrollTop = target.scrollHeight;
      setTimeout(resolve, line.duration);
    }
  });
}

function playFinale(target: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'boot-line loading';
    el.textContent = FINALE_BASE;
    target.appendChild(el);
    target.scrollTop = target.scrollHeight;
    animateDots(el, FINALE_BASE, FINALE_DOTS_DURATION, () => {
      setTimeout(() => {
        el.className = 'boot-line success';
        el.textContent = FINALE_SUCCESS_TEXT;
        target.scrollTop = target.scrollHeight;
        setTimeout(resolve, 800);
      }, 200);
    });
  });
}

function showInstant(target: HTMLElement, theme: BootTheme): void {
  for (const line of theme.lines) {
    const el = document.createElement('div');
    el.className = `boot-line ${line.cssType}`;
    el.textContent =
      line.kind === 'progress'
        ? line.text + ' [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%'
        : line.text;
    target.appendChild(el);
  }
  const fin = document.createElement('div');
  fin.className = 'boot-line success';
  fin.textContent = FINALE_SUCCESS_TEXT;
  target.appendChild(fin);
  target.scrollTop = target.scrollHeight;
}

// Status messages for the WinXP parody splash. Picked at random each boot.
const XP_STATUSES = [
  'Loading your personal settings…',
  'Applying your personal settings…',
  'Composing the desktop…',
];

function bootOverlay(): HTMLElement {
  const el = document.createElement('div');
  el.id = 'boot-overlay';
  el.className = 'boot-overlay';
  el.setAttribute('data-boot', '');
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'XP mode is booting');
  el.innerHTML =
    '<div class="boot-frame">' +
      '<div class="boot-brand">' +
        '<span class="boot-brand-mark" aria-hidden="true">▣</span>' +
        '<span class="boot-brand-text">KRIZDINGUS BIOS — v2.1</span>' +
      '</div>' +
      '<div class="boot-lines" id="boot-lines" aria-hidden="true"></div>' +
    '</div>' +
    // The hint sits on the overlay, not the frame, so it pins to the screen's
    // bottom edge on the frame's column instead of floating under min-height.
    '<div class="boot-hint">' +
      '<button type="button" class="boot-skip" data-boot-skip><u>Esc</u> to skip</button>' +
      '<span aria-hidden="true"> · </span>' +
      '<button type="button" class="boot-skip" data-theme-switch="normal">back to the normal site</button>' +
      '<span aria-hidden="true"> · POST hash 0xDEADBEEF</span>' +
    '</div>';
  return el;
}

function xpSplash(): HTMLElement {
  const el = document.createElement('div');
  el.id = 'xp-splash';
  el.className = 'xp-splash';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="xp-splash__main">' +
      '<div class="xp-splash__brand">' +
        '<div class="xp-splash__flag" aria-hidden="true">' +
          '<span class="xp-splash__pane xp-splash__pane--1"></span>' +
          '<span class="xp-splash__pane xp-splash__pane--2"></span>' +
          '<span class="xp-splash__pane xp-splash__pane--3"></span>' +
          '<span class="xp-splash__pane xp-splash__pane--4"></span>' +
        '</div>' +
        '<div class="xp-splash__lockup">' +
          '<p class="xp-splash__title">KRIZDINGUS<span class="xp-splash__xp">XP</span></p>' +
          '<p class="xp-splash__edition">Personal Edition · Service Pack <em>Stale</em></p>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="xp-splash__bottom">' +
      '<p class="xp-splash__status" id="xp-splash-status"></p>' +
      '<div class="xp-splash__bar">' +
        '<span class="xp-splash__block"></span>' +
        '<span class="xp-splash__block"></span>' +
        '<span class="xp-splash__block"></span>' +
      '</div>' +
      '<p class="xp-splash__copy">' +
        '<span>© <b>MacroHard</b>®</span>' +
      '</p>' +
    '</div>' +
    '<div class="xp-splash__scan" aria-hidden="true"></div>';
  return el;
}

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

let running: { cancel: () => void } | null = null;

/** Cancel a boot in progress (unmount calls this). */
export function cancelBoot(): void {
  running?.cancel();
}

/**
 * Play the boot cinematic over the already-mounted desktop.
 * Resolves 'done' after the reveal starts, or 'skipped' as soon as the
 * visitor skips. Either way the overlay and splash are gone afterwards.
 */
export function playBoot(opts: { theme?: BootThemeKey | null } = {}): Promise<'done' | 'skipped'> {
  cancelBoot();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const overlay = bootOverlay();
  const lines = overlay.querySelector<HTMLElement>('#boot-lines')!;
  const splash = xpSplash();
  const prevFocus = document.activeElement as HTMLElement | null;

  const themeKey = opts.theme === undefined ? resolveBootTheme() : opts.theme;
  if (themeKey) lastPlayed = themeKey;
  const theme: BootTheme | null = themeKey ? BOOT_THEMES[themeKey] : null;
  overlay.dataset.osName = theme?.label ?? 'none';
  overlay.dataset.state = 'running';

  body.classList.remove('is-revealing');
  body.classList.add('is-staging');
  // First in the DOM so its controls come before the (hidden) desktop's.
  body.prepend(overlay);
  // aria-modal is a promise: while a cover is up, nothing behind it can take
  // focus or be read. Everything else in <body> goes inert until the reveal.
  const inerted: HTMLElement[] = [];
  for (const el of Array.from(body.children) as HTMLElement[]) {
    if (el === overlay || el.inert) continue;
    el.inert = true;
    inerted.push(el);
  }
  const release = (): void => {
    while (inerted.length) inerted.pop()!.inert = false;
  };
  overlay.querySelector<HTMLButtonElement>('[data-boot-skip]')?.focus({ preventScroll: true });

  return new Promise((resolve) => {
    // boot lines → XP splash → reveal → done. Esc or a click skips whatever
    // phase is playing, and everything after it.
    let phase: 'boot' | 'splash' | 'reveal' | 'done' = 'boot';
    let revealTimer = 0;
    const keys = new AbortController();

    function focusBack(): void {
      // Hand focus back: to whatever had it, or (when that control left with
      // normal mode's header) to the page content inside the window. Runs
      // after is-staging is gone, so the target is visible and focusable.
      const back = prevFocus && prevFocus !== document.body && document.contains(prevFocus)
        ? prevFocus
        : document.getElementById('main');
      back?.focus({ preventScroll: true });
    }

    /** End the sequence now. `focus` is false when unmount cancels it. */
    function end(focus: boolean): void {
      if (phase === 'done') return;
      const wasCovered = phase !== 'reveal';
      phase = 'done';
      keys.abort();
      clearTimeout(revealTimer);
      overlay.remove();
      splash.remove();
      release();
      running = null;
      markBooted();
      body.classList.remove('is-staging', 'is-revealing');
      if (focus && wasCovered) focusBack();
      resolve('skipped');
    }

    running = { cancel: () => end(false) };
    // On document, not the overlay: the overlay leaves when the splash comes
    // up, and the reveal has no cover at all.
    document.addEventListener('click', (e) => {
      // The exit button is handled by the theme runtime; anything else skips.
      if ((e.target as Element | null)?.closest?.('[data-theme-switch]')) return;
      end(true);
    }, { signal: keys.signal, capture: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        end(true);
      } else if (e.key === 'Tab' && overlay.isConnected) {
        // Keep Tab cycling between the overlay's own buttons.
        const btns = Array.from(overlay.querySelectorAll<HTMLElement>('button'));
        if (!btns.length) return;
        const i = btns.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey ? (i <= 0 ? btns.length - 1 : i - 1) : (i + 1) % btns.length;
        e.preventDefault();
        btns[next].focus({ preventScroll: true });
      }
    }, { signal: keys.signal, capture: true });

    void (async () => {
      if (!theme) {
        // Boot sequence → None: no BIOS lines, straight to the splash.
      } else if (reduced) {
        showInstant(lines, theme);
        await wait(600);
      } else {
        for (const line of theme.lines) {
          if (phase === 'done') return;
          await playLine(lines, line);
        }
        if (phase === 'done') return;
        await playFinale(lines);
      }
      if (phase === 'done') return;
      markBooted();
      overlay.dataset.state = 'complete';

      // Boot → XP splash. Show the splash first, then drop the overlay, so no
      // frame paints with neither cover up.
      phase = 'splash';
      const status = splash.querySelector<HTMLElement>('#xp-splash-status');
      if (status) status.textContent = XP_STATUSES[Math.floor(Math.random() * XP_STATUSES.length)];
      body.appendChild(splash);
      void splash.offsetWidth;
      splash.classList.add('is-on');
      overlay.remove();
      await wait(reduced ? 320 : 2200);
      if (phase === 'done') return;
      splash.classList.add('is-fading');
      await wait(reduced ? 0 : 460);
      if (phase === 'done') return;

      // Reveal: icons pop in, taskbar slides up, the window launches.
      splash.remove();
      overlay.remove();
      release();
      body.classList.remove('is-staging');
      focusBack();
      if (reduced) {
        phase = 'done';
        keys.abort();
        running = null;
        resolve('done');
        return;
      }
      phase = 'reveal';
      void body.offsetWidth;
      body.classList.add('is-revealing');
      resolve('done');
      revealTimer = window.setTimeout(() => {
        if (phase !== 'reveal') return;
        phase = 'done';
        keys.abort();
        running = null;
        body.classList.remove('is-revealing');
      }, 2400);
    })();
  });
}

/** Fill the Settings → Boot sequence submenu from BOOT_THEMES and wire it. */
export function initBootThemePicker(signal?: AbortSignal): void {
  const menu = document.querySelector<HTMLElement>('[data-boot-theme-menu]');
  if (menu && !menu.childElementCount) {
    const rows: [BootChoice, string][] = [
      ['random', 'Random'],
      ...BOOT_ORDER.map((k): [BootChoice, string] => [k, BOOT_THEMES[k].label]),
      ['none', 'None'],
    ];
    for (const [key, text] of rows) {
      const mi = document.createElement('button');
      mi.type = 'button';
      mi.className = 'mi';
      mi.tabIndex = -1;
      mi.setAttribute('role', 'menuitemradio');
      mi.setAttribute('aria-checked', 'false');
      mi.dataset.menuAction = 'boot-theme';
      mi.dataset.value = key;
      const chk = document.createElement('span');
      chk.className = 'chk';
      chk.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = text;
      mi.append(chk, label);
      menu.appendChild(mi);
    }
  }
  document.querySelectorAll<HTMLElement>('[data-menu-action="boot-theme"]').forEach((el) => {
    el.addEventListener('click', () => {
      setBootChoice((el.dataset.value ?? 'random') as BootChoice);
    }, { signal });
  });
  syncBootCheckmarks(getBootChoice());
}
