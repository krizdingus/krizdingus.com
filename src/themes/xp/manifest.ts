// src/themes/xp/manifest.ts — theme #1. Pure data; inlined into every page head.
import type { ThemeManifest } from '../types';

const manifest: ThemeManifest = {
  id: 'xp',
  name: 'XP mode',
  description: 'The same site as a fake old-PC desktop: windows, a taskbar, a Start menu and a boot screen.',
  // Desktop only: a wide viewport and a mouse or trackpad. Never phones.
  availability: '(min-width: 1024px) and (pointer: fine)',
  needs: 'a desktop browser window at least 1024 pixels wide, a mouse or trackpad, and JavaScript',
  // The desktop replaces normal mode's whole look, so pro.css steps aside.
  base: 'none',
  egg: 'boot',
  label: 'XP mode',
  appRoutes: true,
  // A 16px pixel CRT for the header key: bezel, blue screen, a green glint, a stand.
  glyph:
    '<svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" focusable="false">' +
    '<path fill="#1a1c1c" d="M1 1h14v11H1zM6 12h4v1H6zM3 13h10v2H3z"/>' +
    '<path fill="#2a2862" d="M3 3h10v7H3z"/>' +
    '<path fill="#b6e6b0" d="M4 4h3v1H4z"/></svg>',
  // The swap is a CRT power-off of the old page and a power-on of the new
  // one. One bright frame each way, stepped, well under 3 flashes a second.
  transition: {
    old: [
      { transform: 'none', filter: 'none', opacity: 1, offset: 0 },
      { transform: 'scale(1, 0.012)', filter: 'brightness(2.4)', opacity: 1, offset: 0.55 },
      { transform: 'scale(0.02, 0.006)', filter: 'brightness(1.2)', opacity: 0, offset: 1 },
    ],
    new: [
      { transform: 'scale(0.02, 0.006)', filter: 'brightness(2)', opacity: 0, offset: 0 },
      { transform: 'scale(1, 0.012)', filter: 'brightness(2)', opacity: 1, offset: 0.3 },
      { transform: 'none', filter: 'none', opacity: 1, offset: 1 },
    ],
    oldTiming: { duration: 240, easing: 'steps(6, end)', fill: 'both' },
    newTiming: { duration: 320, delay: 140, easing: 'steps(8, end)', fill: 'both' },
  },
};

export default manifest;
