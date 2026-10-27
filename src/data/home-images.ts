// src/data/home-images.ts
// Smaller copies of the photos the home page shows, so a phone doesn't
// pull a 1200px JPEG for a 360px card or a 960px portrait for a 64px
// avatar. They're WebP files in public/images/home/, named
// <basename>-<width>.webp, and nothing in the repo or the build makes
// them: each was cut by hand with sharp (the 480, 800 and 1200 copies and
// the 128px avatar in one pass, the 640 copy later on its own). The exact
// settings weren't recorded. The 480 and 800 copies match a plain
// resize-to-width at WebP quality 72; the 640 doesn't match that exactly.
// A new copy can be cut the same way, e.g.:
//   node -e "require('sharp')('public/images/x.jpg')
//     .resize({ width: 640 }).webp({ quality: 72 })
//     .toFile('public/images/home/x-640.webp')"
// Then add its width to the list below. The 128 copies are square, for
// the rail's 64px avatars: the portrait cut with fit: 'cover', the MagSafe
// photo cut around the can (extract 510px square from 330,165) so its
// baked-in title stays out. An image with no
// entry here falls back to its original file, so a new featured project
// still renders, just heavier.

export interface ResponsiveImage {
  src: string;
  srcset?: string;
}

/** Original path → widths that exist in public/images/home/. */
export const HOME_IMAGE_WIDTHS: Record<string, number[]> = {
  '/images/magsafe-zyn-container-3d-print.jpg': [128, 480, 640, 800, 1200],
  '/images/krizdingus-portrait.jpg': [128],
  // The featured project's rail avatar, cut square the same way.
  '/images/projects/cassette-case-gameboy-games/open-and-closed.webp': [128],
};

export function variantPath(original: string, width: number): string {
  const base = original.split('/').pop()!.replace(/\.[a-z0-9]+$/i, '');
  return `/images/home/${base}-${width}.webp`;
}

/** src + srcset for an image shown at up to `maxWidth` CSS px. */
export function homeImage(original: string, maxWidth = Infinity): ResponsiveImage {
  const widths = HOME_IMAGE_WIDTHS[original];
  if (!widths?.length) return { src: original };
  // The fallback src is the smallest variant that still covers maxWidth.
  const fallback = widths.find((w) => w >= maxWidth) ?? widths[widths.length - 1];
  return {
    src: variantPath(original, fallback),
    srcset: widths.map((w) => `${variantPath(original, w)} ${w}w`).join(', '),
  };
}
