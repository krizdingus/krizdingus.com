#!/usr/bin/env node
// Makes the responsive copies of the site's pictures, AVIF and WebP at a
// few fixed widths (never wider than the original):
//
//   projects  every picture a project names in its front matter (hero and
//             gallery), at 480, 800 and 1200 px, plus a 200px square thumb
//             for the gallery strip. Output:
//             public/images/projects/<slug>/r/<base>-<w>.<ext>, <base>-thumb.webp
//   blog      each post's hero_image, at 480, 800, 1200 and 1600 px. Output:
//             public/images/blog/r/<base>-<w>.<ext>
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

const root = process.cwd();
const only = process.argv[2];
if (only && !['projects', 'blog'].includes(only)) {
  console.error(`unknown collection "${only}" (expected projects or blog)`);
  process.exit(1);
}

function frontMatter(file) {
  return fs.readFileSync(file, 'utf8').split(/^---$/m)[1] ?? '';
}

async function variants(input, out, base, widths) {
  fs.mkdirSync(out, { recursive: true });
  const meta = await sharp(input).metadata();
  const ws = widths.filter((w) => w < meta.width);
  if (meta.width <= widths[widths.length - 1] && !ws.includes(meta.width)) ws.push(meta.width);
  for (const w of ws) {
    const img = () => sharp(input).resize({ width: w, withoutEnlargement: true });
    await img().webp({ quality: 76, effort: 6 }).toFile(path.join(out, `${base}-${w}.webp`));
    await img().avif({ quality: 52, effort: 6 }).toFile(path.join(out, `${base}-${w}.avif`));
  }
  return { width: meta.width, ws };
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
      const { width, ws } = await variants(input, out, base, [480, 800, 1200]);
      await sharp(input).resize({ width: 200, height: 200, fit: 'cover' }).webp({ quality: 72, effort: 6 })
        .toFile(path.join(out, `${base}-thumb.webp`));
      console.log(slug, base, width, ws.join(','));
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
    const { width, ws } = await variants(input, path.join(root, 'public/images/blog/r'), base, [480, 800, 1200, 1600]);
    console.log('blog', base, width, ws.join(','));
  }
}
