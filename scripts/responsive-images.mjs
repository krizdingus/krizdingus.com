#!/usr/bin/env node
// Makes the responsive copies of the site's pictures, AVIF and WebP at a
// few fixed widths (never wider than the original):
//
//   projects  every picture a project names in its front matter (hero and
//             gallery), at 480, 800 and 1200 px, plus a 200px square thumb
//             for the gallery strip. Output:
//             public/images/projects/<slug>/r/<base>-<w>.<ext>, <base>-thumb.webp
//   blog      each post's hero_image, at 480, 800, 1200 and 1600 px, with
//             a credit line in the metadata (scripts/image-credit.mjs).
//             Output: public/images/blog/r/<base>-<w>.<ext>
//             plus each post's gallery pictures, at 480/800/1200 with a
//             200px square thumb, into <the picture's folder>/r/
//
//   npm run images               (both)
//   npm run images -- blog       (just one: blog or projects)
//
// Re-run it after adding or replacing a picture and commit the new files.
// Re-running it over pictures that already have copies can re-encode them
// slightly differently (a newer sharp), so name the collection you changed.
// The build doesn't run it.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { withCredit } from './image-credit.mjs';

const root = process.cwd();
const only = process.argv[2];
if (only && !['projects', 'blog'].includes(only)) {
  console.error(`unknown collection "${only}" (expected projects or blog)`);
  process.exit(1);
}

function frontMatter(file) {
  return fs.readFileSync(file, 'utf8').split(/^---$/m)[1] ?? '';
}

// `crisp` is for pictures that are mostly fine text and flat UI, like
// screenshots: the photo-tuned defaults smear small type badly enough that
// people read it as a rendering fault. Higher quality, no chroma subsampling.
/** A copy that already exists and is no older than its source is left alone.
 *  Without this, adding one width re-encodes every picture on the site, and a
 *  newer sharp writes slightly different bytes, so a one-width change arrives
 *  as a diff touching hundreds of files. Delete a copy to force it back. */
function upToDate(file, srcTime) {
  try { return fs.statSync(file).mtimeMs >= srcTime; } catch { return false; }
}

async function variants(input, out, base, widths, { credit = false, crisp = false } = {}) {
  fs.mkdirSync(out, { recursive: true });
  const meta = await sharp(input).metadata();
  const ws = widths.filter((w) => w < meta.width);
  if (meta.width <= widths[widths.length - 1] && !ws.includes(meta.width)) ws.push(meta.width);
  const srcTime = fs.statSync(input).mtimeMs;
  const made = [];
  for (const w of ws) {
    const webp = path.join(out, `${base}-${w}.webp`);
    const avif = path.join(out, `${base}-${w}.avif`);
    if (upToDate(webp, srcTime) && upToDate(avif, srcTime)) continue;
    const img = () => {
      const p = sharp(input).resize({ width: w, withoutEnlargement: true });
      return credit ? withCredit(p) : p;
    };
    await img().webp(crisp ? { quality: 93, effort: 6, smartSubsample: false } : { quality: 76, effort: 6 })
      .toFile(webp);
    await img().avif(crisp ? { quality: 80, effort: 6, chromaSubsampling: '4:4:4' } : { quality: 52, effort: 6 })
      .toFile(avif);
    made.push(w);
  }
  return { width: meta.width, ws, made };
}

if (!only || only === 'projects') {
  const dir = path.join(root, 'src/content/projects');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const slug = f.replace(/\.md$/, '');
    const fm = frontMatter(path.join(dir, f));
    const srcs = new Set([...fm.matchAll(/^\s*-\s*src:\s*"([^"]+)"/gm)].map((m) => m[1]));
    const hero = fm.match(/^hero_image:\s*"([^"]*)"/m)?.[1];
    if (hero) srcs.add(hero);
    for (const src of srcs) {
      const input = path.join(root, 'public', src);
      if (!fs.existsSync(input)) { console.warn('missing', input); continue; }
      const base = path.basename(src).replace(/\.[^.]+$/, '');
      const out = path.join(root, 'public/images/projects', slug, 'r');
      const { width, made } = await variants(input, out, base, [480, 800, 1200]);
      const thumb = path.join(out, `${base}-thumb.webp`);
      if (!upToDate(thumb, fs.statSync(input).mtimeMs)) {
        await sharp(input).resize({ width: 200, height: 200, fit: 'cover' }).webp({ quality: 72, effort: 6 })
          .toFile(thumb);
      }
      if (made.length) console.log(slug, base, width, 'cut', made.join(','));
    }
  }
}

if (!only || only === 'blog') {
  const dir = path.join(root, 'src/content/blog');
  for (const f of fs.readdirSync(dir).filter((x) => /\.mdx?$/.test(x))) {
    const hero = frontMatter(path.join(dir, f)).match(/^hero_image:\s*"([^"]*)"/m)?.[1];
    if (!hero) continue;
    const input = path.join(root, 'public', hero);
    if (!fs.existsSync(input)) { console.warn('missing', input); continue; }
    const base = path.basename(hero).replace(/\.[^.]+$/, '');
    const { width, made } = await variants(input, path.join(root, 'public/images/blog/r'), base, [480, 800, 1200, 1600], { credit: true });
    if (made.length) console.log('blog', base, width, 'cut', made.join(','));
  }
  // Gallery pictures, where a post has them. They are screenshots and other
  // people's work, so no credit line. Copies land next to the picture, in a
  // sibling r/, plus a 200px square thumb for the strip.
  for (const f of fs.readdirSync(dir).filter((x) => /\.mdx?$/.test(x))) {
    const gal = frontMatter(path.join(dir, f)).match(/^gallery:\n([\s\S]*?)(?=^[A-Za-z_]|\Z)/m)?.[1] ?? '';
    for (const [, src] of gal.matchAll(/src:\s*"([^"]+)"/g)) {
      const input = path.join(root, 'public', src);
      if (!fs.existsSync(input)) { console.warn('missing', input); continue; }
      const out = path.join(root, 'public', path.dirname(src), 'r');
      const base = path.basename(src).replace(/\.[^.]+$/, '');
      const { width, made } = await variants(input, out, base, [480, 800, 1200], { crisp: true });
      const thumb = path.join(out, `${base}-thumb.webp`);
      if (!upToDate(thumb, fs.statSync(input).mtimeMs)) {
        await sharp(input).resize(200, 200, { fit: 'cover', position: 'top' })
          .webp({ quality: 90, effort: 6 }).toFile(thumb);
      }
      if (made.length) console.log('blog gallery', base, width, 'cut', made.join(','));
    }
  }
}
