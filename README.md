# krizdingus.com

Kris Williams's personal site. Static Astro, hosted on Cloudflare Pages.

Normal mode is plain HTML and CSS. The XP desktop is an optional theme that loads only when you switch it on; see `src/themes/README.md` for how themes work.

## Develop

```
npm install   # Node 22.22+
npm run dev   # http://localhost:4321
```

## Build

```
npm run build     # static output in dist/
npm run preview
```

## Test

```
npm test
```

## Share images

Every page's Open Graph image (1200x630) is a committed file in `public/images/og/`. After changing a post or project title, a project's listed photo, or `src/data/og-cards.json`, redraw them:

```
npm run og   # needs Python 3 with fonttools and brotli: pip install fonttools brotli
```

Text is set from the site's own fonts in `public/fonts/`, so the cards look the same on any machine.
