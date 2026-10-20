// src/build/external-links.mjs
// External links open in a new tab: target="_blank" rel="noopener", plus a
// visually hidden "(opens in a new tab)" so screen readers say so too.
// No nofollow (nothing here is paid or user-made) and no noreferrer (the
// sites linked to may see where a visit came from).
//
// isExternal() and the attribute/hint constants are shared by the Markdown
// pipeline (the hast plugin below, registered in astro.config.mjs) and the
// templates (src/components/ExternalLink.astro, SocialIconTray, …), and by
// tests/external-links.test.ts, which checks the built HTML.

export const SITE_HOSTS = ['krizdingus.com', 'www.krizdingus.com'];
export const NEW_TAB_TARGET = '_blank';
export const NEW_TAB_REL = 'noopener';
export const NEW_TAB_HINT = ' (opens in a new tab)';
export const NEW_TAB_HINT_CLASS = 'sr-only';

/** http(s) or protocol-relative URL on another host. mailto:, tel:, #, / and relative are internal. */
export function isExternal(href) {
  if (typeof href !== 'string') return false;
  const m = /^(?:https?:)?\/\/([^/?#:]+)/i.exec(href.trim());
  if (!m) return false;
  return !SITE_HOSTS.includes(m[1].toLowerCase());
}

/** Sätteri hast plugin for Markdown content. */
export function externalLinksHast() {
  return {
    name: 'external-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const href = node.properties?.href;
        if (!isExternal(href)) return;
        ctx.setProperty(node, 'target', NEW_TAB_TARGET);
        ctx.setProperty(node, 'rel', [NEW_TAB_REL]);
        if (/opens in a new (tab|window)/i.test(ctx.textContent(node))) return;
        ctx.appendChild(node, {
          type: 'element',
          tagName: 'span',
          properties: { className: [NEW_TAB_HINT_CLASS] },
          children: [{ type: 'text', value: NEW_TAB_HINT }],
        });
      },
    },
  };
}
