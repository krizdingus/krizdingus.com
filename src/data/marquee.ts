// "KRIZ-WIRE": the ticker the XP theme puts on the home page
// (src/themes/xp/dressing/home.dressing.ts builds it at mount; normal mode
// never ships it). Real facts only, dated where they can go stale. Sources:
// the project pages (MakerWorld and GitHub figures as of 2026-10-20) and
// src/themes/xp/manifest.ts (the egg word). Only facts the
// home page doesn't already print: the newest post and build are in the Now
// Featuring rail and download counts in "Most downloaded", so none of those.

export interface MarqueeItem {
  tag: string;
  text: string;
  /** Internal link for the whole item. */
  href?: string;
  hot?: boolean;
}

export const marqueeItems: MarqueeItem[] = [
  {
    tag: 'STAT',
    text: "The poopin' stool has 2,134 likes on MakerWorld (count from Oct 20, 2026)",
    href: '/projects/printable-poopin-stool/',
    hot: true,
  },
  {
    tag: 'SHIP',
    text: 'Peekabu v1.0.0: Bambu print status on your Mac, camera feed included',
    href: '/projects/peekabu/',
  },
  {
    tag: 'SHIP',
    text: 'Claudometer v0.4.0: a desk gauge for Claude Code limits',
    href: '/projects/claudometer/',
  },
  {
    tag: 'FREE',
    text: '11 Game Boy cartridge labels, free to download and print',
    href: '/projects/gameboy-bootleg-cartridge-labels/',
  },
  {
    tag: 'TIP',
    text: 'Back on the normal site, type boot (not in a text box) to land here again',
  },
];
