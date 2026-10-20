// src/scripts/theme.ts — light/dark color scheme (independent of the UI theme).
// The head kicker applies the stored value before paint; this keeps every
// toggle working, including ones a UI theme injects later (the XP taskbar
// tray, the Start menu row), through one delegated click handler.
// Nothing stored means Auto: the page follows the device, live. A toggle
// press stores the opposite of what's showing; the display menu in the
// normal header can also pick Auto again (it clears the stored value).
import { COLOR_STORAGE_KEY as STORAGE_KEY, THEME_COLORS } from '../themes/kicker';

type Theme = 'light' | 'dark';
type Scheme = Theme | 'auto';

const TOGGLES = '.theme-toggle, [data-menu-action="theme-toggle"]';

function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function syncToggles(theme: Theme): void {
  document.querySelectorAll<HTMLElement>('.theme-toggle').forEach((btn) => {
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  });
  const scheme: Scheme = getStoredTheme() ?? 'auto';
  document.querySelectorAll<HTMLElement>('[data-scheme]').forEach((opt) => {
    opt.setAttribute('aria-pressed', opt.dataset.scheme === scheme ? 'true' : 'false');
  });
}

/** Every theme-color meta (one per prefers-color-scheme value) follows the
 *  chosen scheme, so the browser chrome matches the page, not the OS. */
function syncThemeColor(theme: Theme): void {
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', THEME_COLORS[theme]);
  });
}

function applyTheme(theme: Theme, persist: boolean): void {
  document.documentElement.setAttribute('data-theme', theme);
  syncThemeColor(theme);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage disabled — non-fatal */
    }
  }
  syncToggles(theme);
}

/** Pick a scheme from the display menu: Auto forgets the stored choice. */
function applyScheme(scheme: Scheme): void {
  if (scheme !== 'auto') return applyTheme(scheme, true);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage disabled — non-fatal */
  }
  applyTheme(getSystemTheme(), false);
}

/** The display menu (normal header): a disclosure under the small arrow
 *  next to the light/dark key. Escape or a click outside closes it. */
function setMenu(open: boolean, focusOpener = false): void {
  const opener = document.querySelector<HTMLElement>('[data-display-open]');
  const menu = opener && document.getElementById(opener.getAttribute('aria-controls') ?? '');
  if (!opener || !menu) return;
  opener.setAttribute('aria-expanded', open ? 'true' : 'false');
  menu.hidden = !open;
  if (!open && focusOpener) opener.focus();
}

function menuOpen(): boolean {
  return document.querySelector('[data-display-open]')?.getAttribute('aria-expanded') === 'true';
}

// One delegated listener per document, even if the module is evaluated twice.
const FLAG = '__krizColorScheme';

export function initTheme(): void {
  const stored = getStoredTheme();
  applyTheme(stored ?? getSystemTheme(), false);
  const doc = document as Document & { [FLAG]?: boolean };
  if (doc[FLAG]) return;
  doc[FLAG] = true;

  document.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    if (target?.closest?.('[data-display-open]')) return setMenu(!menuOpen());
    const opt = target?.closest?.<HTMLElement>('[data-scheme]');
    if (opt) {
      applyScheme(opt.dataset.scheme as Scheme);
      return setMenu(false, true);
    }
    if (target?.closest?.('[data-display-close]')) return setMenu(false, true);
    // A theme switch in the menu: the theme runtime takes the click from here.
    if (target?.closest?.('[data-display] [data-theme-switch]:not([aria-disabled="true"])')) setMenu(false);
    if (menuOpen() && !target?.closest?.('[data-display]')) setMenu(false);
    const t = target?.closest?.(TOGGLES);
    if (!t) return;
    const current = (document.documentElement.getAttribute('data-theme') as Theme) || getSystemTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark', true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen()) setMenu(false, true);
  });
  document.addEventListener('focusin', (e) => {
    if (menuOpen() && !(e.target as Element | null)?.closest?.('[data-display]')) setMenu(false);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (getStoredTheme()) return;
    applyTheme(e.matches ? 'dark' : 'light', false);
  });
}
