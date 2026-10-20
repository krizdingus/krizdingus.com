// External links open in a new tab, with rel="noopener" (no nofollow, no
// noreferrer) and a screen-reader hint. The unit tests cover the shared
// helper and the Markdown plugin; the last block reads the built HTML in
// dist/ when a build exists, so every template and content page is covered.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { isExternal, externalLinksHast, NEW_TAB_HINT } from '../src/build/external-links.mjs';

describe('isExternal', () => {
  it('treats other hosts as external', () => {
    expect(isExternal('https://github.com/krizdingus')).toBe(true);
    expect(isExternal('http://example.com')).toBe(true);
    expect(isExternal('//cdn.example.com/x')).toBe(true);
  });
  it('treats the site, relative links and mailto as internal', () => {
    expect(isExternal('https://krizdingus.com/projects/')).toBe(false);
    expect(isExternal('https://www.krizdingus.com/')).toBe(false);
    expect(isExternal('/about/')).toBe(false);
    expect(isExternal('#main')).toBe(false);
    expect(isExternal('mailto:someone@example.com')).toBe(false);
    expect(isExternal(undefined)).toBe(false);
  });
});

describe('external-links hast plugin', () => {
  const run = (href: string, text = 'x') => {
    const node: any = { type: 'element', tagName: 'a', properties: { href }, children: [{ type: 'text', value: text }] };
    const ctx: any = {
      setProperty: (n: any, k: string, v: unknown) => { n.properties[k] = v; },
      appendChild: (n: any, c: any) => n.children.push(c),
      textContent: (n: any) => n.children.map((c: any) => c.value ?? '').join(''),
    };
    externalLinksHast().element.visit(node, ctx);
    return node;
  };
  it('adds target, rel and the hint to external links', () => {
    const n = run('https://github.com/krizdingus');
    expect(n.properties.target).toBe('_blank');
    expect(n.properties.rel).toEqual(['noopener']);
    expect(n.children.at(-1).children[0].value).toBe(NEW_TAB_HINT);
  });
  it('leaves internal links alone', () => {
    const n = run('/projects/');
    expect(n.properties.target).toBeUndefined();
    expect(n.children).toHaveLength(1);
  });
  it('does not add a second hint', () => {
    expect(run('https://example.com', 'Example (opens in a new tab)').children).toHaveLength(1);
  });
});

const DIST = path.resolve(__dirname, '..', 'dist');
const walk = (d: string): string[] =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []);

describe.skipIf(!fs.existsSync(path.join(DIST, 'index.html')))('built HTML', () => {
  it('every external link opens in a new tab with rel=noopener and a hint', () => {
    const bad: string[] = [];
    let n = 0;
    for (const f of walk(DIST)) {
      const html = fs.readFileSync(f, 'utf8');
      for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
        const attrs = m[1];
        const href = /\bhref="([^"]*)"/.exec(attrs)?.[1] ?? '';
        if (!isExternal(href.replace(/&amp;/g, '&'))) continue;
        n++;
        const rel = (/\brel="([^"]*)"/.exec(attrs)?.[1] ?? '').split(/\s+/);
        const problems = [
          /\btarget="_blank"/.test(attrs) ? '' : 'target',
          rel.includes('noopener') ? '' : 'rel=noopener',
          rel.includes('nofollow') || rel.includes('noreferrer') ? 'nofollow/noreferrer' : '',
          /opens in a new tab/i.test(m[0]) ? '' : 'hint',
        ].filter(Boolean);
        if (problems.length) bad.push(`${path.relative(DIST, f)} ${href} (${problems.join(', ')})`);
      }
    }
    expect(n).toBeGreaterThan(0);
    expect([...new Set(bad)]).toEqual([]);
  });
});
