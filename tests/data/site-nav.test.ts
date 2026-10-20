import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { siteNav, headerNav } from '../../src/data/site-nav';
import { buildShell } from '../../src/themes/xp/shell';

describe('siteNav', () => {
  it('has exactly 5 entries (Home/Projects/Web/Blog/About)', () => {
    expect(siteNav.length).toBe(5);
  });

  it('hrefs are in the canonical order', () => {
    const hrefs = siteNav.map((n) => n.href);
    expect(hrefs).toEqual(['/', '/projects/', '/web/', '/blog/', '/about/']);
  });

  it('Web is labelled "Web" and its key is a letter of the label', () => {
    const web = siteNav.find((n) => n.href === '/web/')!;
    expect(web.label).toBe('Web');
    expect(web.label.toUpperCase()).toContain(web.accessKey!.toUpperCase());
  });

  it('access keys are unique', () => {
    const keys = siteNav.map((n) => n.accessKey?.toLowerCase()).filter(Boolean);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every entry has a label', () => {
    for (const item of siteNav) {
      expect(item.label).toBeTruthy();
    }
  });

  it('access keys are single characters when set', () => {
    for (const item of siteNav) {
      if (item.accessKey !== undefined) {
        expect(item.accessKey.length).toBe(1);
      }
    }
  });
});

// Normal mode's header nav leaves Home out (the wordmark is the home link);
// XP's menu bar builds every siteNav item, Home first, and copies
// aria-current from normal mode's header. The fixture block always runs;
// the last block also reads the built pages in dist/ when a build exists,
// so it covers the real markup.

const NAV_PATHS = ['/', '/projects/', '/projects/printable-poopin-stool/', '/web/', '/blog/', '/blog/some-post/', '/about/', '/404/'];

describe('normal-mode nav has no Home item', () => {
  it('headerNav never returns href="/"', () => {
    for (const p of NAV_PATHS) {
      expect(headerNav(p).some((l) => l.href === '/')).toBe(false);
      expect(headerNav(p)).toHaveLength(siteNav.length - 1);
    }
  });

  it('SiteNav.astro renders headerNav() and hard-codes no link', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../../src/components/SiteNav.astro'), 'utf8');
    expect(src).toMatch(/headerNav\(/);
    expect(src).not.toMatch(/href="\//);
  });
});

/** A minimal normal-mode page: the header (wordmark + headerNav links, with
 *  the same aria-current values BaseLayout and SiteNav.astro render) and a
 *  <main>, so buildShell() can run without a build. */
function fixture(currentPath: string) {
  const wordmarkCurrent = currentPath === '/' ? ' aria-current="page"' : '';
  const links = headerNav(currentPath)
    .map((l) => `<a href="${l.href}"${l.current ? ` aria-current="${l.current}"` : ''}>${l.label}</a>`)
    .join('');
  document.body.innerHTML =
    `<div data-site><header><a class="pro-wordmark" href="/"${wordmarkCurrent}>krizdingus.com</a>` +
    `<nav data-site-nav>${links}</nav></header></div><main id="main"><p>Body</p></main>`;
}

function menuLinks() {
  return [...document.querySelectorAll<HTMLAnchorElement>('.menu-bar a.menu-route')];
}

describe("XP's menu bar (fixture, no build needed)", () => {
  it('puts every siteNav item in order, Home first, current on the home page', () => {
    fixture('/');
    const handle = buildShell();
    const links = menuLinks();
    expect(links.map((a) => a.getAttribute('href'))).toEqual(siteNav.map((n) => n.href));
    expect(links[0].textContent).toBe('Home');
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links.slice(1).some((a) => a.hasAttribute('aria-current'))).toBe(false);
    handle?.restore();
  });

  it('marks the section, not Home, on a page inside it', () => {
    fixture('/projects/printable-poopin-stool/');
    const handle = buildShell();
    const links = menuLinks();
    expect(links[0].getAttribute('href')).toBe('/');
    expect(links[0].hasAttribute('aria-current')).toBe(false);
    expect(links.find((a) => a.getAttribute('href') === '/projects/')?.getAttribute('aria-current')).toBe('true');
    expect(links.filter((a) => a.hasAttribute('aria-current'))).toHaveLength(1);
    handle?.restore();
  });

  it('marks the section index itself as the current page', () => {
    fixture('/blog/');
    const handle = buildShell();
    expect(menuLinks().find((a) => a.getAttribute('href') === '/blog/')?.getAttribute('aria-current')).toBe('page');
    handle?.restore();
  });
});

const DIST = path.resolve(__dirname, '../../dist');
const page = (route: string) => path.join(DIST, route, 'index.html');

describe.skipIf(!fs.existsSync(page('/')))('built pages', () => {
  /** The <body> of a built page, loaded into the test document. */
  function load(route: string) {
    const html = fs.readFileSync(page(route), 'utf8');
    const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? '';
    // Markup only: the page's scripts aren't part of what's under test.
    document.body.innerHTML = body.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  }

  it('no page puts href="/" in the header nav', () => {
    for (const route of ['/', '/projects/', '/projects/printable-poopin-stool/', '/web/', '/blog/', '/about/']) {
      if (!fs.existsSync(page(route))) continue;
      load(route);
      const nav = document.querySelector('[data-site-nav]');
      expect(nav, route).not.toBeNull();
      expect(nav!.querySelector('a[href="/"]'), route).toBeNull();
      expect([...nav!.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['/projects/', '/web/', '/blog/', '/about/']);
    }
  });

  it("XP's menu bar puts Home first and marks it current on the home page", () => {
    load('/');
    const handle = buildShell();
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.menu-bar a.menu-route')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(siteNav.map((n) => n.href));
    expect(links[0].textContent).toBe('Home');
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links.slice(1).some((a) => a.hasAttribute('aria-current'))).toBe(false);
    handle?.restore();
  });

  it("XP's menu bar marks the section, not Home, on a project page", () => {
    load('/projects/printable-poopin-stool/');
    const handle = buildShell();
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.menu-bar a.menu-route')];
    expect(links[0].getAttribute('href')).toBe('/');
    expect(links[0].hasAttribute('aria-current')).toBe(false);
    expect(links.find((a) => a.getAttribute('href') === '/projects/')?.getAttribute('aria-current')).toBe('true');
    handle?.restore();
  });
});
