// src/build/postcss-scheme-fallback.mjs
// PostCSS plugin: the color scheme without JavaScript.
//
// The head kicker (src/themes/kicker.ts) always sets <html data-theme="light|dark">
// before first paint, from the stored choice or the OS setting, and the CSS keys
// every scheme-specific rule on that attribute. With scripting off nothing sets it,
// so the page would always be light. For each rule this plugin finds that is keyed
// on the attribute, it adds a copy keyed on its absence, inside the matching
// prefers-color-scheme query:
//
//   [data-theme="dark"] X          → @media (prefers-color-scheme: dark) { :where(:root):not([data-theme]) X }
//   :not([data-theme="dark"]) X    → rewritten [data-theme="light"] X (the same match while the
//   [data-theme="light"] X           attribute is set), plus
//                                    @media not all and (prefers-color-scheme: dark) { :where(:root):not([data-theme]) X }
//
// The copies match only while <html> has no data-theme, i.e. never once a script
// has run, so a chosen theme always wins and pages with JavaScript render exactly
// as before. Specificity is unchanged: [data-theme="dark"], [data-theme="light"],
// :not([data-theme="dark"]) and :where(:root):not([data-theme]) all weigh (0,1,0),
// and each copy sits right after its original, so source order holds too.
const DARK = /\[data-theme=(["']?)dark\1\]/;
const LIGHT = /\[data-theme=(["']?)light\1\]/;
const NOT_DARK = /:not\(\[data-theme=(["']?)dark\1\]\)/;
const g = (re) => new RegExp(re.source, 'g');
const NO_ATTR = ':where(:root):not([data-theme])';
const DARK_Q = '(prefers-color-scheme: dark)';
const LIGHT_Q = 'not all and (prefers-color-scheme: dark)';

/** Pure selector transform, exported for tests. Returns { original, dark, light }. */
export function splitSelectors(selectors) {
  const original = [];
  const dark = [];
  const light = [];
  for (const s of selectors) {
    let o = s;
    if (NOT_DARK.test(o)) o = o.replace(g(NOT_DARK), '[data-theme="light"]');
    original.push(o);
    if (LIGHT.test(o) && !DARK.test(o)) light.push(o.replace(g(LIGHT), NO_ATTR));
    else if (DARK.test(o) && !LIGHT.test(o)) dark.push(o.replace(g(DARK), NO_ATTR));
  }
  return { original, dark, light };
}

/** @param {{ skip?: string[] }} [opts] source paths containing any of `skip` are left alone */
export default function schemeFallback(opts = {}) {
  const skip = opts.skip || [];
  return {
    postcssPlugin: 'scheme-fallback',
    Once(root, { AtRule }) {
      const file = root.source?.input?.file || '';
      if (skip.some((s) => file.includes(s))) return;
      const rules = [];
      root.walkRules((rule) => {
        if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
        if (/data-theme=/.test(rule.selector)) rules.push(rule);
      });
      for (const rule of rules) {
        const { original, dark, light } = splitSelectors(rule.selectors);
        rule.selectors = original;
        let after = rule;
        for (const [sels, params] of [[dark, DARK_Q], [light, LIGHT_Q]]) {
          if (!sels.length) continue;
          const media = new AtRule({ name: 'media', params });
          const copy = rule.clone();
          copy.selectors = sels;
          media.append(copy);
          after.after(media);
          after = media;
        }
      }
    },
  };
}
schemeFallback.postcss = true;
