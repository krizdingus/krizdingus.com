#!/usr/bin/env node
// Draws the share images (Open Graph / Twitter, 1200x630 JPEG) into
// public/images/og/:
//   og/<page>.jpg            the section pages (src/data/og-cards.json "pages")
//   og/blog/<slug>.jpg       one per blog post
//   og/projects/<slug>.jpg   one per project: its own photo where
//                            og-cards.json lists one, otherwise a title card
//
//   npm run og        (or: node scripts/og-cards.mjs)
//
// Re-run it after changing a post or project title, a listed photo, or the
// page list, and commit the images (and scripts/og/drawn.json, the record
// of what they show). The build doesn't run it; tests/og-cards.test.ts
// fails when a card no longer matches its title.
//
// Title cards wear normal mode's look: warm paper or plum night, the
// section's hue, the Cart wordmark (read from src/components/Wordmark.astro)
// and the title in Saira. All text is drawn as outlines from the site's own
// woff2 files by scripts/og/glyphs.py (Python 3 + fontTools + brotli), so no
// system font is involved. sharp rasterizes and encodes.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { cardJobs, DRAWN_FILE } from './og/jobs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/images/og');
const W = 1200;
const H = 630;
const PAD = 64;

// ---- palette (src/styles/colors_and_type.css, "Two moods") ----
const PAPER = {
  bg: '#fbf5e8', ink: '#22202c', text2: '#3a3746', rule: '#22202c', onFill: '#22202c',
  hues: {
    berry: { ink: '#b5105f', fill: '#ff4fae' },
    teal: { ink: '#00666c', fill: '#2ec4b6' },
    grape: { ink: '#5a3aa0', fill: '#a68cf4', tint: '#efe4ec' },
    kiwi: { ink: '#2d6512', fill: '#6cc24a' },
    dandy: { ink: '#7a5200', fill: '#ffe34f' },
  },
};
const PLUM = {
  bg: '#191225', ink: '#f0eaf7', text2: '#d0c6de', rule: '#9a8cb3', onFill: '#191225',
  hues: {
    berry: { ink: '#ff7bb0', fill: '#ff7bb0', tint: '#36162f' },
    teal: { ink: '#4fe0d2', fill: '#4fe0d2', tint: '#12303a' },
    grape: { ink: '#c4a3ff', fill: '#c4a3ff', tint: '#2c2047' },
    kiwi: { ink: '#a6df5f', fill: '#a6df5f', tint: '#1f3120' },
    dandy: { ink: '#ffd447', fill: '#ffd447', tint: '#2f2140' },
  },
};
// The header's five-colour strip, in the site's order.
const STRIP = ['#ff4fae', '#a68cf4', '#2ec4b6', '#6cc24a', '#ffe34f'];

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v * t + y[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
}
function theme(mood, hue) {
  const m = mood === 'plum' ? PLUM : PAPER;
  const h = m.hues[hue];
  if (!h) throw new Error(`unknown hue "${hue}"`);
  return { ...m, hue: h.ink, fill: h.fill, tint: h.tint ?? mix(h.fill, m.bg, 0.2) };
}

// ---- the wordmark, straight from the component ----
const wordmarkSrc = fs.readFileSync(path.join(ROOT, 'src/components/Wordmark.astro'), 'utf8');
const wordmarkInner = wordmarkSrc.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)[1];
function wordmark(x, y, scale, t) {
  const inner = wordmarkInner
    .replaceAll('style="fill:currentColor"', `fill="${t.ink}"`)
    .replace(/style="fill:var\(--hue-fill[^"]*"/g, `fill="${t.fill}"`)
    .replace(/style="fill:var\(--on-fill[^"]*"/g, `fill="${t.onFill}"`);
  return `<g transform="translate(${x} ${y}) scale(${scale})">${inner}</g>`;
}

// ---- text as outlines ----
const SAIRA = { font: 'saira', axes: { wght: 650, wdth: 108 } };
const MONO = { font: 'mono', axes: { wght: 500 } };
const FIGTREE = { font: 'figtree', axes: { wght: 500 } };
function setText(reqs) {
  const r = spawnSync('python3', [path.join(ROOT, 'scripts/og/glyphs.py')], {
    input: JSON.stringify(reqs),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`glyphs.py failed:\n${r.stderr || r.error}`);
  return JSON.parse(r.stdout);
}

// ---- pieces ----
const BAND_Y = 132; // the hero band starts under the header row

function halftone(x0, y0, w, h, colour, opacity) {
  // Dots that shrink away from the top-right corner, like the page heroes.
  const step = 16;
  const maxD = Math.hypot(w, h);
  let out = '';
  for (let y = y0 + step / 2; y < y0 + h; y += step) {
    for (let x = x0 + step / 2; x < x0 + w; x += step) {
      const d = Math.hypot(x0 + w - x, y - y0) / maxD;
      const r = 3.2 * (1 - d * 1.15);
      if (r > 0.7) out += `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}"/>`;
    }
  }
  return `<g fill="${colour}" fill-opacity="${opacity}">${out}</g>`;
}

function chrome(t, urlText) {
  // Strip, header row (wordmark + address), the band with its hue rule.
  const strip = STRIP.map((c, i) => `<rect x="${i * 240}" y="0" width="240" height="10" fill="${c}"/>`).join('');
  return `
    <rect width="${W}" height="${H}" fill="${t.bg}"/>
    ${strip}
    ${wordmark(PAD, 44, 2.5, t)}
    <g transform="translate(${W - PAD - urlText.width} 86)" fill="${t.text2}"><path d="${urlText.d}"/></g>
    <rect x="0" y="${BAND_Y - 3}" width="${W}" height="3" fill="${t.rule}"/>
    <rect x="0" y="${BAND_Y}" width="${W}" height="${H - BAND_Y}" fill="${t.tint}"/>
    <rect x="0" y="${BAND_Y}" width="${W}" height="8" fill="${t.fill}"/>
    ${halftone(W - 300, BAND_Y + 8, 300, 300, t.fill, t.bg === PLUM.bg ? 0.55 : 0.9)}`;
}

function textBlock(x, top, t, crumb, title, sub) {
  // Crumb, title lines, sub lines, stacked from `top`; returns svg + height.
  let y = top + crumb.cap;
  let svg = `<g transform="translate(${x} ${y})" fill="${t.text2}"><path d="${crumb.d}"/></g>`;
  y += 26;
  const lh = Math.round(title.size * 1.08);
  title.lines.forEach((l, i) => {
    const by = y + title.cap + i * lh;
    svg += `<g transform="translate(${x} ${by})" fill="${t.hue}"><path d="${l.d}"/></g>`;
  });
  y += title.cap + (title.lines.length - 1) * lh;
  if (sub) {
    y += Math.round(title.size * 0.3) + 18;
    const slh = Math.round(sub.size * 1.35);
    sub.lines.forEach((l, i) => {
      const by = y + sub.cap + i * slh;
      svg += `<g transform="translate(${x} ${by})" fill="${t.text2}"><path d="${l.d}"/></g>`;
    });
    y += sub.cap + (sub.lines.length - 1) * slh;
  }
  return { svg, height: y - top };
}

function blockHeight(crumb, title, sub) {
  let h = crumb.cap + 26 + title.cap + (title.lines.length - 1) * Math.round(title.size * 1.08);
  if (sub) h += Math.round(title.size * 0.3) + 18 + sub.cap + (sub.lines.length - 1) * Math.round(sub.size * 1.35);
  return h;
}

// ---- cards ----
// The card list (and what each one draws) comes from scripts/og/jobs.mjs,
// which tests/og-cards.test.ts also reads to catch a card left stale.
const jobs = cardJobs(ROOT);

// Frame sizes for 'framed' cards: the photo whole, as large as fits.
async function frameFor(src) {
  const meta = await sharp(path.join(ROOT, 'public', src)).metadata();
  const maxW = 460;
  const maxH = H - BAND_Y - 8 - 2 * 44;
  const s = Math.min(maxW / meta.width, maxH / meta.height);
  return { w: Math.round(meta.width * s), h: Math.round(meta.height * s) };
}

const frames = {};
for (const j of jobs) if (j.kind === 'framed') frames[j.out] = await frameFor(j.src);

// One batch of text requests for every card.
const reqs = [];
const ask = (r) => reqs.push(r) - 1;
for (const j of jobs) {
  const textW = j.kind === 'framed' ? W - 2 * PAD - frames[j.out].w - 56 : W - 2 * PAD - 150;
  j.t = {
    url: ask({ ...MONO, text: j.url, size: 22, max_width: 600 }),
    crumb: ask({ ...MONO, text: j.crumb, size: 22, min_size: 16, max_width: textW }),
  };
  if (j.kind !== 'photo') {
    // Short section titles run big; long project and post titles step down
    // until they fit three lines.
    const big = j.out.includes('/') ? (j.kind === 'framed' ? 84 : 100) : 132;
    j.t.title = ask({ ...SAIRA, text: j.title, size: big, min_size: 44, max_width: textW, max_lines: 3 });
    if (j.sub) j.t.sub = ask({ ...FIGTREE, text: j.sub, size: 32, min_size: 26, max_width: textW, max_lines: 2 });
  }
}
const set = setText(reqs);

fs.mkdirSync(path.join(OUT, 'blog'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'projects'), { recursive: true });

const wanted = new Set(jobs.map((j) => j.out));
for (const dir of ['', 'blog', 'projects']) {
  for (const f of fs.readdirSync(path.join(OUT, dir))) {
    const rel = dir ? `${dir}/${f}` : f;
    if (f.endsWith('.jpg') && !wanted.has(rel)) fs.rmSync(path.join(OUT, rel));
  }
}

for (const j of jobs) {
  const t = theme(j.mood, j.hue);
  const T = (k) => (j.t[k] != null ? set[j.t[k]] : null);
  const urlText = T('url').lines[0];
  let svg;
  const composites = [];

  if (j.kind === 'photo') {
    // The photo fills the card; the wordmark sits on a paper tag, bottom left.
    const tagW = 144 * 2 + 40;
    const tagH = 26 * 2 + 36;
    const tx = PAD - 24;
    const ty = H - PAD - tagH + 16;
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      ${STRIP.map((c, i) => `<rect x="${i * 240}" y="0" width="240" height="10" fill="${c}"/>`).join('')}
      <rect x="${tx + 8}" y="${ty + 8}" width="${tagW}" height="${tagH}" fill="${t.fill}"/>
      <rect x="${tx}" y="${ty}" width="${tagW}" height="${tagH}" fill="${t.bg}" stroke="${t.rule}" stroke-width="3"/>
      ${wordmark(tx + 20, ty + 18, 2, t)}
    </svg>`;
    // position: a sharp gravity ("centre"), or a number from 0 (keep the
    // top) to 1 (keep the bottom) for how far down the crop sits.
    const src = sharp(path.join(ROOT, 'public', j.src));
    let photo;
    if (typeof j.position === 'number') {
      const m = await src.metadata();
      const s = Math.max(W / m.width, H / m.height);
      const rw = Math.round(m.width * s);
      const rh = Math.round(m.height * s);
      photo = await src.resize(rw, rh).extract({
        left: Math.round((rw - W) / 2),
        top: Math.round((rh - H) * j.position),
        width: W,
        height: H,
      }).toBuffer();
    } else {
      photo = await src.resize(W, H, { fit: 'cover', position: j.position ?? 'centre' }).toBuffer();
    }
    const base = sharp(photo);
    // Busy pictures step the quality down until the card fits the 200 KB
    // budget (tests/seo-dist.test.ts); most land at 82.
    const flat = await base.composite([{ input: Buffer.from(svg) }]).png().toBuffer();
    let buf;
    for (let q = 82; q >= 70; q -= 2) {
      buf = await sharp(flat).jpeg({ quality: q, mozjpeg: true }).toBuffer();
      if (buf.length < 196 * 1024) break;
    }
    fs.writeFileSync(path.join(OUT, j.out), buf);
    continue;
  }

  const crumb = T('crumb').lines[0];
  const crumbM = { ...T('crumb'), d: crumb.d };
  const title = T('title');
  const sub = T('sub');
  const bandTop = BAND_Y + 8;
  const bandH = H - bandTop;
  const h = blockHeight(crumbM, title, sub);
  const top = Math.round(bandTop + (bandH - h) / 2 - 6);
  const block = textBlock(PAD, top, t, crumbM, title, sub);
  let framed = '';
  if (j.kind === 'framed') {
    const f = frames[j.out];
    const fx = W - PAD - f.w;
    const fy = Math.round(bandTop + (bandH - f.h) / 2);
    framed = `<rect x="${fx + 10}" y="${fy + 10}" width="${f.w}" height="${f.h}" fill="${t.fill}"/>
      <rect x="${fx - 3}" y="${fy - 3}" width="${f.w + 6}" height="${f.h + 6}" fill="${t.rule}"/>`;
    const img = await sharp(path.join(ROOT, 'public', j.src)).resize(f.w, f.h, { fit: 'cover' }).toBuffer();
    composites.push({ input: img, left: fx, top: fy });
  }
  svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${chrome(t, urlText)}
    ${framed}
    ${block.svg}
  </svg>`;
  const buf = await sharp(Buffer.from(svg))
    .composite(composites)
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, j.out), buf);
}

// Record what was drawn, so a later title or photo change without a re-run
// fails the test instead of shipping a stale card.
fs.writeFileSync(path.join(ROOT, DRAWN_FILE), JSON.stringify(jobs.map(({ t, ...j }) => j), null, 1) + '\n');

for (const j of jobs) {
  const kb = Math.round(fs.statSync(path.join(OUT, j.out)).size / 1024);
  console.log(`${String(kb).padStart(4)} KB  images/og/${j.out}`);
}
