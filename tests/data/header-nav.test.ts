import { describe, it, expect } from 'vitest';
import { headerNav, siteNav } from '../../src/data/site-nav';
import { buildShell } from '../../src/themes/xp/shell';

/** Normal mode's header as BaseLayout renders it: the wordmark (current on
 *  "/") and SiteNav's links. */
function headerHtml(path: string): string {
  const wm = `<a class="pro-wordmark" href="/" aria-label="krizdingus.com, home"${path === '/' ? ' aria-current="page"' : ''}><svg aria-hidden="true"></svg></a>`;
  const links = headerNav(path)
    .map((l) => `<a href="${l.href}"${l.current ? ` aria-current="${l.current}"` : ''}>${l.label}</a>`)
    .join('');
  return `<div class="site" data-site><header class="pro-header">${wm}<nav class="pro-nav" aria-label="Site navigation" data-site-nav>${links}</nav></header></div><main id="main"><a href="#x">x</a></main>`;
}

describe('headerNav (normal mode)', () => {
  it('leaves Home out: the wordmark is the home link', () => {
    for (const path of ['/', '/projects/', '/blog/a-post/', '/about/']) {
      expect(headerNav(path).map((l) => l.href)).toEqual(['/projects/', '/web/', '/blog/', '/about/']);
    }
  });

  it('marks nothing current on the home page', () => {
    expect(headerNav('/').some((l) => l.current)).toBe(false);
  });

  it("marks a section 'page' on its index and 'true' on its detail pages", () => {
    expect(headerNav('/projects/').find((l) => l.href === '/projects/')?.current).toBe('page');
    expect(headerNav('/projects/x/').find((l) => l.href === '/projects/')?.current).toBe('true');
    expect(headerNav('/projects/x/').filter((l) => l.current)).toHaveLength(1);
  });
});

describe("XP's menu bar keeps Home", () => {
  function menu(path: string): HTMLAnchorElement[] {
    document.body.innerHTML = headerHtml(path);
    const handle = buildShell();
    expect(handle).not.toBeNull();
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.menu-bar a.menu-route')];
    handle!.restore();
    return links;
  }

  it('builds every siteNav item, Home first', () => {
    const links = menu('/about/');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(siteNav.map((n) => n.href));
    expect(links[0].textContent).toBe('Home');
  });

  it("takes Home's aria-current from the wordmark on /", () => {
    const links = menu('/');
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links.slice(1).some((a) => a.hasAttribute('aria-current'))).toBe(false);
  });

  it("takes a section's aria-current from the header nav elsewhere", () => {
    const links = menu('/projects/x/');
    expect(links[0].hasAttribute('aria-current')).toBe(false);
    expect(links.find((a) => a.getAttribute('href') === '/projects/')?.getAttribute('aria-current')).toBe('true');
  });

  it('restore() puts the header back', () => {
    menu('/');
    expect(document.querySelector('[data-site-nav]')).not.toBeNull();
    expect(document.querySelector('.menu-bar')).toBeNull();
  });
});
