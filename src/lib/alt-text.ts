// src/lib/alt-text.ts — keep alt text short without losing the description.
//
// Alt text over ALT_MAX characters is split: the image keeps the opening
// (up to the last colon, sentence end, comma or space that fits), and the
// rest becomes a visually hidden description the image points to with
// aria-describedby. Screen readers still read every word, and the alt stays
// a short name for the picture.
export const ALT_MAX = 100;

export interface SplitAlt {
  alt: string;
  /** The remainder, or '' when the alt already fits. */
  desc: string;
}

export function splitAlt(text: string, max = ALT_MAX): SplitAlt {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return { alt: t, desc: '' };
  const head = t.slice(0, max + 1);
  for (const sep of [': ', '. ', ', ', ' ']) {
    const i = head.lastIndexOf(sep);
    if (i < 12 || (sep === '. ' ? i + 1 : i) > max) continue;
    const alt = sep === '. ' ? t.slice(0, i + 1) : t.slice(0, i);
    const rest = t.slice(i + sep.length).trim();
    return { alt: alt.trim(), desc: rest.charAt(0).toUpperCase() + rest.slice(1) };
  }
  return { alt: t.slice(0, max), desc: t.slice(max).trim() };
}
