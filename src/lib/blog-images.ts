// src/lib/blog-images.ts
// A post's hero_image and its responsive copies (AVIF + WebP at up to
// 480/800/1200/1600w, cut ahead of time by `npm run images -- blog` into
// public/images/blog/r/<base>-<w>.<ext>). Widths with no file on disk are
// left out, so a picture without copies falls back to its original JPEG.
import fs from 'node:fs';

export const BLOG_IMAGE_WIDTHS = [480, 800, 1200, 1600] as const;

export interface BlogPicture {
  /** The original JPEG, for <img src> and anything that can't pick. */
  src: string;
  avif: string;
  webp: string;
  /** The original's size, for width/height (aspect ratio) on <img>. */
  width: number;
  height: number;
}

export function blogVariantBase(src: string): string {
  const name = (src.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
  return `/images/blog/r/${name}`;
}

// JPEG dimensions straight from the SOF marker, so the build needs no
// image library.
function jpegSize(file: string): { width: number; height: number } | null {
  let buf: Buffer;
  try { buf = fs.readFileSync(file); } catch { return null; }
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

export function blogPicture(src: string | null | undefined): BlogPicture | null {
  if (!src) return null;
  const size = jpegSize(`public${src}`) ?? { width: 1600, height: 900 };
  const base = blogVariantBase(src);
  const widths = BLOG_IMAGE_WIDTHS.filter(
    (w) => fs.existsSync(`public${base}-${w}.avif`) && fs.existsSync(`public${base}-${w}.webp`),
  );
  const set = (ext: string) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  return { src, avif: set('avif'), webp: set('webp'), ...size };
}
