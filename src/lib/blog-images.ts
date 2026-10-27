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

/** A post's gallery pictures, resolved for src/components/Gallery.astro.
 *  Copies and a 200px square thumb sit in an r/ beside each picture, cut by
 *  `npm run images -- blog`. Anything without them falls back to the file. */
// Widths are discovered on disk, not assumed: a 2x phone capture is 780 wide
// and would fall outside any fixed list.

export interface GalleryItem {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function blogGalleryPictures(items: GalleryItem[]) {
  return items.map((item) => {
    const dir = item.src.replace(/\/[^/]+$/, '');
    const base = item.src.replace(/^.*\//, '').replace(/\.[^.]+$/, '');
    const at = (w: number, ext: string) => `${dir}/r/${base}-${w}.${ext}`;
    const rdir = `public${dir}/r`;
    const found = fs.existsSync(rdir) ? fs.readdirSync(rdir) : [];
    const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.webp$`);
    const widths = found
      .map((f) => f.match(re)?.[1])
      .filter((w): w is string => Boolean(w))
      .map(Number)
      .filter((w) => fs.existsSync(`public${at(w, 'avif')}`))
      .sort((a, b) => a - b);
    const set = (ext: string) => widths.map((w) => `${at(w, ext)} ${w}w`).join(', ');
    const thumb = `${dir}/r/${base}-thumb.webp`;
    return {
      ...item,
      avif: set('avif'),
      webp: set('webp'),
      thumb: fs.existsSync(`public${thumb}`) ? thumb : item.src,
    };
  });
}
