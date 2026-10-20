// src/data/footer-strip.ts
// The 2000s page footer the XP theme adds to the home page (built at mount by
// src/themes/xp/dressing/home.dressing.ts; normal mode never ships it).
// The counter and the webring are obvious jokes; the commit ping is real and
// is read from the page's workshop panel at mount.

export interface VisitorCounter {
  digits: string[];
  sub: string;
}

export interface WebringLink {
  label: string;
  /** Internal path, or RANDOM_HREF for "a random page on this site". */
  href: string;
}

export interface FooterPing {
  status: 'ok' | 'warn';
  key: string;
  value: string;
}

export const RANDOM_HREF = 'random';

export const visitorCounter: VisitorCounter = {
  digits: ['0', '0', '0', '0', '0', '1'],
  sub: 'you’re the first. again.',
};

export const webring = {
  label: 'KRIZ-RING',
  size: '1 site. this one.',
  // Every link stays on krizdingus.com: the ring is just this site.
  links: [
    { label: '« prev', href: '/about/' },
    { label: '[random]', href: RANDOM_HREF },
    { label: 'next »', href: '/projects/' },
  ] as WebringLink[],
};

/** Evergreen fuel joke (PHILOSOPHY.md: "drinking White Monsters"). */
export const fuelPing: FooterPing = { status: 'warn', key: 'fuel', value: 'White Monster' };
