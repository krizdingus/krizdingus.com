// Top-level site navigation. Normal mode's header nav (SiteNav.astro) shows
// every item but Home, since the wordmark is the home link; XP's menu bar
// (src/themes/xp/shell.ts) shows all of them. Access keys drive the
// <u>letter</u> mnemonic in XP's menu bar only.

export interface SiteNavItem {
  href: string;
  label: string;
  /** Single character, rendered as the <u>L</u> mnemonic in XP's menu bar. */
  accessKey?: string;
}

export const siteNav: SiteNavItem[] = [
  { href: '/',          label: 'Home',     accessKey: 'H' },
  { href: '/projects/', label: 'Projects', accessKey: 'P' },
  // W is XP's wallpaper key, so Web takes its second letter: W<u>e</u>b.
  { href: '/web/',      label: 'Web',      accessKey: 'E' },
  { href: '/blog/',     label: 'Blog',     accessKey: 'B' },
  { href: '/about/',    label: 'About',    accessKey: 'A' },
];

export interface HeaderNavLink {
  href: string;
  label: string;
  /** 'page' on the item's own page, 'true' on its detail pages. */
  current?: 'page' | 'true';
}

/** Normal mode's header nav for `currentPath`: every item but Home (the
 *  wordmark links home). A section's index stays current on its detail
 *  pages (/projects/x/ → Projects). */
export function headerNav(currentPath: string): HeaderNavLink[] {
  return siteNav
    .filter((item) => item.href !== '/')
    .map(({ href, label }) => {
      const current = currentPath === href ? 'page' : currentPath.startsWith(href) ? 'true' : undefined;
      return current ? { href, label, current } : { href, label };
    });
}
