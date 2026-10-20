// @vitest-environment node
// Checks the built site (dist/) for search and share metadata: titles,
// descriptions, canonicals, robots, Open Graph and Twitter tags, the share
// images, JSON-LD validity, the sitemap and the _redirects targets. Skipped
// when there is no build (run `npm run build` first).
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIST = path.resolve(__dirname, '..', 'dist');
const SITE = 'https://krizdingus.com';
const hasDist = fs.existsSync(path.join(DIST, 'index.html'));

function htmlFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function metaAll(html: string, attr: 'name' | 'property', key: string): string[] {
  const out: string[] = [];
  const re = /<meta\s+([^>]*?)\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const a = m[1];
    const k = a.match(new RegExp(`${attr}="([^"]*)"`));
    const c = a.match(/content="([^"]*)"/);
    if (k && k[1] === key && c) out.push(decode(c[1]));
  }
  return out;
}
const meta = (html: string, attr: 'name' | 'property', key: string) => metaAll(html, attr, key)[0];

interface Page {
  file: string;
  route: string;
  html: string;
  noindex: boolean;
}

const pages: Page[] = hasDist
  ? htmlFiles(DIST).map((file) => {
      const rel = path.relative(DIST, file).split(path.sep).join('/');
      const route = rel === 'index.html' ? '/' : rel.endsWith('/index.html') ? `/${rel.slice(0, -'index.html'.length)}` : `/${rel}`;
      const html = fs.readFileSync(file, 'utf8');
      return { file, route, html, noindex: /<meta name="robots" content="[^"]*noindex/.test(html) };
    })
  : [];
// Pages drawn by BaseLayout carry the share tags; /panic/ and the app
// embeds are standalone, noindex pages without them.
const shared = pages.filter((p) => /property="og:title"/.test(p.html));
const indexable = pages.filter((p) => !p.noindex);
const feedHasItems = hasDist && /<item>/.test(fs.readFileSync(path.join(DIST, 'rss.xml'), 'utf8'));
// Frontmatter dates are calendar days and go out as such (no UTC midnight).
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function jsonLd(html: string): unknown[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
}

type Node = Record<string, any>;
function nodes(html: string): Node[] {
  return jsonLd(html).flatMap((doc: any) => {
    expect(doc['@context']).toBe('https://schema.org');
    return (doc['@graph'] ?? [doc]) as Node[];
  });
}

const isAbs = (u: unknown) => typeof u === 'string' && u.startsWith(`${SITE}/`);
const REQUIRED: Record<string, string[]> = {
  WebSite: ['name', 'url'],
  ProfilePage: ['mainEntity', 'url'],
  BlogPosting: ['headline', 'description', 'author', 'image', 'mainEntityOfPage', 'url'],
  CreativeWork: ['name', 'description', 'author', 'image', 'url'],
  SoftwareSourceCode: ['name', 'description', 'author', 'image', 'url', 'codeRepository'],
  BreadcrumbList: ['itemListElement'],
};

describe.skipIf(!hasDist)('built site: search and share metadata', () => {
  it('found pages', () => {
    expect(pages.length).toBeGreaterThan(20);
    expect(shared.length).toBeGreaterThan(20);
  });

  it('every page sets lang="en", a title and a description', () => {
    for (const p of pages) {
      expect(p.html, p.route).toMatch(/<html lang="en"/);
      expect(p.html, p.route).toMatch(/<title>[^<]+<\/title>/);
      if (!/\/embed\/$/.test(p.route)) expect(meta(p.html, 'name', 'description'), p.route).toBeTruthy();
    }
  });

  it('indexable pages have unique titles under 62 characters and descriptions of about 120-160', () => {
    const titles = new Map<string, string>();
    for (const p of indexable) {
      const title = decode(p.html.match(/<title>([^<]+)<\/title>/)![1]);
      expect(titles.has(title), `${p.route} repeats "${title}"`).toBe(false);
      titles.set(title, p.route);
      expect(title.length, `${p.route} title "${title}"`).toBeLessThanOrEqual(62);
      const d = meta(p.html, 'name', 'description')!;
      expect(d.length, `${p.route} description (${d.length})`).toBeGreaterThanOrEqual(110);
      expect(d.length, `${p.route} description (${d.length})`).toBeLessThanOrEqual(165);
    }
  });

  it('canonical is absolute, on the apex, with a trailing slash, and matches the route', () => {
    for (const p of indexable) {
      const m = p.html.match(/<link rel="canonical" href="([^"]+)"/);
      expect(m, p.route).toBeTruthy();
      expect(m![1]).toBe(`${SITE}${p.route}`);
      expect(m![1]).toMatch(/\/$/);
      expect(meta(p.html, 'property', 'og:url'), p.route).toBe(m![1]);
    }
  });

  it('noindex pages carry no canonical or og:url', () => {
    for (const p of pages.filter((x) => x.noindex)) {
      expect(p.html, p.route).not.toMatch(/rel="canonical"/);
      expect(meta(p.html, 'property', 'og:url'), p.route).toBeUndefined();
    }
  });

  it('the 404, /panic/, app routes and embeds are noindex', () => {
    const must = pages.filter((p) => p.route === '/404.html' || p.route === '/panic/' || p.route.startsWith('/apps/'));
    expect(must.length).toBeGreaterThanOrEqual(3);
    for (const p of must) expect(p.noindex, p.route).toBe(true);
  });

  it('Open Graph and Twitter tags are complete, and every share image exists at 1200x630', async () => {
    const seen = new Set<string>();
    for (const p of shared) {
      for (const k of ['og:title', 'og:description', 'og:type', 'og:site_name', 'og:image', 'og:image:alt', 'og:locale']) {
        expect(meta(p.html, 'property', k), `${p.route} ${k}`).toBeTruthy();
      }
      expect(meta(p.html, 'property', 'og:image:width')).toBe('1200');
      expect(meta(p.html, 'property', 'og:image:height')).toBe('630');
      expect(meta(p.html, 'name', 'twitter:card')).toBe('summary_large_image');
      for (const k of ['twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
        expect(meta(p.html, 'name', k), `${p.route} ${k}`).toBeTruthy();
      }
      // The feed is advertised only once it has an item.
      const feedLink = /<link rel="alternate" type="application\/rss\+xml"[^>]* href="\/rss\.xml"/.test(p.html);
      expect(feedLink, `${p.route} rss alternate`).toBe(feedHasItems);
      const img = meta(p.html, 'property', 'og:image')!;
      expect(img, p.route).toMatch(/^https:\/\/krizdingus\.com\/images\/og\/.+\.jpg$/);
      seen.add(img);
    }
    for (const img of seen) {
      const file = path.join(DIST, new URL(img).pathname);
      expect(fs.existsSync(file), img).toBe(true);
      const m = await sharp(file).metadata();
      expect([m.width, m.height], img).toEqual([1200, 630]);
      expect(fs.statSync(file).size, img).toBeLessThan(200 * 1024);
    }
  });

  it('og:type follows the page: article for posts, profile for /about/', () => {
    for (const p of shared) {
      const type = meta(p.html, 'property', 'og:type');
      if (/^\/blog\/(?!tags\/)[^/]+\/$/.test(p.route)) {
        expect(type, p.route).toBe('article');
        // Signed-off posts carry their date; drafts claim none.
        if (!p.noindex) expect(meta(p.html, 'property', 'article:published_time'), p.route).toMatch(DAY);
        else expect(meta(p.html, 'property', 'article:published_time'), p.route).toBeUndefined();
      } else if (p.route === '/about/') expect(type).toBe('profile');
      else expect(type, p.route).toBe('website');
    }
  });

  it('every JSON-LD block parses and has the properties its type needs', () => {
    for (const p of pages) {
      for (const n of nodes(p.html)) {
        const type = n['@type'] as string;
        expect(REQUIRED[type], `${p.route}: unexpected @type ${type}`).toBeTruthy();
        for (const k of REQUIRED[type]) expect(n[k], `${p.route} ${type}.${k}`).toBeTruthy();
        if ('url' in n) expect(isAbs(n.url), `${p.route} ${type}.url`).toBe(true);
        if ('image' in n) expect(isAbs(n.image), `${p.route} ${type}.image`).toBe(true);
        if (n.author) expect(n.author.name, `${p.route} author`).toBe('Kris Williams');
        if (type === 'BlogPosting') {
          // Only a signed-off post claims dates; a draft is noindex and claims none.
          if (p.noindex) expect(n.datePublished, p.route).toBeUndefined();
          else {
            expect(n.datePublished, p.route).toMatch(DAY);
            expect(n.dateModified, p.route).toMatch(DAY);
          }
        }
        if (type === 'ProfilePage') {
          const person = n.mainEntity;
          expect(person['@type']).toBe('Person');
          expect(person.name).toBe('Kris Williams');
          expect(person.url).toBe(`${SITE}/`);
          expect(person.sameAs).toContain('https://www.threads.com/@krizdingus');
          expect(JSON.stringify(person)).not.toMatch(/@[a-z0-9.-]+\.(com|edu)|telephone|address/i);
        }
        if (type === 'BreadcrumbList') {
          n.itemListElement.forEach((li: any, i: number) => {
            expect(li.position).toBe(i + 1);
            expect(li.name).toBeTruthy();
            expect(isAbs(li.item), `${p.route} crumb ${li.item}`).toBe(true);
          });
          expect(n.itemListElement.at(-1).item, p.route).toBe(`${SITE}${p.route}`);
        }
      }
    }
  });

  it('the home page has a WebSite node, /about/ a ProfilePage, and nested pages a BreadcrumbList', () => {
    const types = (route: string) => nodes(pages.find((p) => p.route === route)!.html).map((n) => n['@type']);
    expect(types('/')).toContain('WebSite');
    expect(types('/about/')).toContain('ProfilePage');
    for (const p of indexable.filter((x) => x.route.split('/').filter(Boolean).length >= 2)) {
      expect(nodes(p.html).map((n) => n['@type']), p.route).toContain('BreadcrumbList');
    }
  });

  it('the sitemap lists every indexable page and nothing noindex', () => {
    const xml = fs.readdirSync(DIST)
      .filter((f) => /^sitemap-\d+\.xml$/.test(f))
      .map((f) => fs.readFileSync(path.join(DIST, f), 'utf8'))
      .join('');
    const urls = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
    for (const p of indexable.filter((x) => x.route !== '/404.html')) expect(urls.has(`${SITE}${p.route}`), p.route).toBe(true);
    for (const p of pages.filter((x) => x.noindex)) expect(urls.has(`${SITE}${p.route}`), p.route).toBe(false);
  });

  it('robots.txt allows everything and points at the sitemap index', () => {
    const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
    expect(robots).not.toMatch(/^Disallow:\s*\S/m);
    expect(robots).toMatch(/^Sitemap: https:\/\/krizdingus\.com\/sitemap-index\.xml$/m);
    expect(fs.existsSync(path.join(DIST, 'sitemap-index.xml'))).toBe(true);
  });

  it('every _redirects target exists (or is external), and no rule shadows a real file', () => {
    const rules = fs.readFileSync(path.join(DIST, '_redirects'), 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => l.split(/\s+/));
    expect(rules.length).toBeGreaterThan(10);
    for (const [from, to, status] of rules) {
      expect(['301', '302', '308'], from).toContain(status);
      if (!to.includes(':splat')) {
        if (!/^https?:\/\//.test(to)) {
          const p = to.endsWith('/') ? `${to}index.html` : to;
          expect(fs.existsSync(path.join(DIST, p)), `${from} -> ${to}`).toBe(true);
        }
      }
      const plain = from.replace(/\*$/, '');
      const file = path.join(DIST, plain.endsWith('/') ? `${plain}index.html` : plain);
      expect(fs.existsSync(file) && fs.statSync(file).isFile(), `${from} shadows a real file`).toBe(false);
    }
  });
});
