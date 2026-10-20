// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { externalLinksHast } from './src/build/external-links.mjs';
import schemeFallback from './src/build/postcss-scheme-fallback.mjs';

// The sitemap lists only pages search engines may index. Rather than keep a
// second list of exceptions, it reads each built page's own robots tag:
// anything marked noindex (/panic/, the app routes and embeds, review
// drafts, thin tag pages, the 404) stays out. outDir is captured here so
// a build into another folder works too.
let outDir = new URL('./dist/', import.meta.url);
const captureOutDir = {
  name: 'capture-out-dir',
  hooks: { 'astro:config:done': ({ config }) => { outDir = config.outDir; } },
};
function isNoindex(page) {
  const path = new URL(page).pathname.replace(/^\//, '');
  const file = new URL(`${path}${path === '' || path.endsWith('/') ? 'index.html' : '/index.html'}`, outDir);
  try {
    return /<meta name="robots" content="[^"]*noindex/.test(fs.readFileSync(file, 'utf8'));
  } catch {
    return false;
  }
}

// Fully static build (Cloudflare Pages). Security headers live in
// public/_headers and redirects in public/_redirects — there is no server.
// https://astro.build/config
export default defineConfig({
  site: 'https://krizdingus.com',
  output: 'static',
  devToolbar: {
    enabled: false
  },

  // Astro 7 changed the default to 'jsx', which strips whitespace between
  // inline elements. Keep the Astro 6 behavior so prose and inline markup
  // render with the spaces the templates were written with.
  compressHTML: true,

  // Each page's CSS is ~15 KB in all, split over 3-4 small files that block
  // render. Inline it, so first paint needs no extra round trips. Theme CSS
  // is imported by the theme's own lazy chunk, so it stays out of the page.
  build: {
    inlineStylesheets: 'always',
  },

  // A dash in the writing is typed as "--" and should stay "--" on the page,
  // so smart punctuation keeps curly quotes and ellipses but leaves dashes alone.
  // External links in Markdown open in a new tab with a screen-reader hint
  // (src/build/external-links.mjs; templates use the same helpers).
  markdown: {
    processor: satteri({
      features: { smartPunctuation: { dashes: false } },
      hastPlugins: [externalLinksHast()],
    }),
  },

  // With JavaScript off nothing sets <html data-theme>, so every dark-scheme
  // rule gets a copy that follows prefers-color-scheme while the attribute is
  // absent (src/build/postcss-scheme-fallback.mjs). Theme CSS only ever runs
  // with JavaScript, so it is left alone.
  vite: {
    css: {
      postcss: { plugins: [schemeFallback({ skip: ['/src/themes/xp/'] })] },
    },
  },

  integrations: [
    mdx(),
    captureOutDir,
    sitemap({ filter: (page) => !isNoindex(page) }),
  ],
});
