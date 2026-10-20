# Themes

krizdingus.com has one set of HTML: **normal mode**. It is a plain header, the page's `<main>` and a footer. It works with JavaScript off, and it ships no theme code. A **theme** is an optional package that loads on demand and transforms that same markup in place. It never re-renders the page. Theme #1 is XP/OS mode (`xp/`), the fake late-'90s desktop.

## What a theme is

A folder, `src/themes/<id>/`, with two required files:

| File | What it holds |
|---|---|
| `manifest.ts` | Default-exports a `ThemeManifest`: `id`, `name`, `description`, `availability` (a media query), and the optional `egg` (a typed word), `label` (the header switch text), `invite` (a footer link), `appRoutes` (the `/apps/*` routes open in this theme), `needs` (plain words for what `availability` asks, shown on a locked route where the theme can't run), `base` (see "Styles" below), `glyph` (inline SVG for the header switch's icon), `transition` (the swap animation, see "The lifecycle") and `owns` (selectors of legacy page markup that belongs to the theme; transitional, see below). Pure data. The build inlines `id`, `availability` and the `owns` hiding rule into every page's `<head>`, so keep it tiny. |
| `<id>.theme.ts` | The theme module: `styles` (stylesheet URLs, imported with `?url`), `mount(ctx)` and `unmount(ctx)`. Vite emits it as its own chunk, `<id>.theme.<hash>.js`, and only fetches it when the theme mounts. |

Everything else in the folder belongs to the theme: its scripts, its CSS and its assets. Normal mode never imports from a theme folder. The two `import.meta.glob` calls in `manifests.ts` and `registry.ts` find a new theme folder on their own, so **adding theme #2 means adding a folder and nothing else**:

- `BaseLayout.astro` renders one quiet header switch per manifest (labelled `label ?? name`, with the manifest's `glyph` as its icon and `description` as its tooltip) and one footer link per manifest that has an `invite`. Nothing in the layout names a theme.
- The `/apps/*` lock goes to the manifest with `appRoutes: true`, never to "the first theme".
- Normal mode hides each theme's own markup with a rule generated from the manifests (`skinOnlyCss()`), so one theme's gimmicks never show under another.
- On a locked route the page's own content is wrapped in `data-skin-only="<id>"`, and a plain notice (`data-skin-fallback="<id>"`, with an `<h1>`, the manifest's `needs`, a link home and that theme's switch) shows until the theme mounts. With JS off, on a phone or under 1024 px, the notice is all there is.

## Normal mode's guarantees

- **One `<h1>` per page.** A page body that brings its own `<h1>` keeps it. One that doesn't (and isn't a locked route, whose notice has one) gets the header's site name wrapped in an `<h1>` (BaseLayout checks the rendered body at build time).
- **No dead controls with JS off.** The light/dark key needs the script, so CSS hides it: `@media (scripting: none)`, and, for browsers without that media feature, `:root:not([data-theme])` (only script sets `data-theme`). There is no `<noscript>`. Theme switches ship `hidden` and only the runtime reveals them.
- **The OS color scheme with JS off.** `<html>` ships without `data-theme`; the kicker sets it before first paint. For JS-off visitors, a build step (`src/build/postcss-scheme-fallback.mjs`) gives every `[data-theme="dark"]` rule a copy under `@media (prefers-color-scheme: dark)` that matches only while the attribute is absent, so a chosen scheme always wins. `<meta name="theme-color">` follows the chosen scheme too (kicker and `theme.ts`).

## Styles: what a theme draws on

Normal mode's stylesheets (`colors_and_type.css`, `prose.css`, `site.css`, `pro.css`) ship on every page and are the base every theme starts from. A theme's own CSS is attached only while it is mounted and layers on top. The manifest's `base` picks how much of normal mode stays:

- `base: 'normal'` (the default): everything stays on. Theme #2 starts as normal mode, with its typography, header and footer, and restyles from there. It doesn't have to undo anything.
- `base: 'none'`: the runtime sets `<html data-skin-base="none">` while the theme is mounted, and every rule in `pro.css` scoped `:root:not([data-skin-base=none])` (normal mode's chrome, type scale and no-animation rule) switches off. XP uses this: the desktop replaces the whole look.

The shared tokens in `colors_and_type.css` (palette, spacing, type ramp) stay on in both cases, so light/dark works under any theme.

`tests/themes.test.ts` holds the contract tests. A real second theme folder, `tests/fixtures/themes/stub/`, goes through the same discovery (`collectManifests()` and `pairThemes()`, the functions behind the two globs) and mounts with nothing else edited. A stub next to XP, switched xp → stub → normal, must leave the DOM byte-identical, with no XP listeners or globals (`KrizApps`, `KrizWM`) left.

Types are in `types.ts`, and the framework is `runtime.ts`.

## The lifecycle

1. **Head kicker** (`kicker.ts`, inlined synchronously in `<head>`). It applies the light/dark color scheme. If a theme is wanted and its `availability` query matches, it sets `<html data-skin-pending="<id>">`. A theme is wanted when the visitor stored a choice in `localStorage['krizdingus-skin']`, or when the route is locked with `<html data-theme-lock="<id>">`. While a theme is pending, `runtime.css` hides the body, so normal mode never flashes before the theme arrives. A CSS failsafe shows the page after 4 s anyway.
2. **Runtime** (`runtime.ts`, a small module that ships with normal mode). For a pending theme it fetches the theme module, then fetches its stylesheets (attached with `media="not all"` so they don't apply yet). Once everything has arrived it sets `<html data-skin="<id>">`, switches the stylesheets on, and calls `mount(ctx)` with `reason: 'restore'`.
3. **Switching.** Any element with `data-theme-switch="<id>"` (enter) or `data-theme-switch="normal"` (leave) works. The runtime delegates clicks document-wide, so controls a theme injects work too. The choice is persisted once the theme's module and stylesheets have arrived, so a blocked chunk never leaves a stored choice behind (leaving for normal mode is stored at once). The swap runs inside a View Transition when the browser supports it and the visitor hasn't asked for reduced motion. Otherwise it is an instant swap. The manifest's `transition` decides the look: omitted, the browser's crossfade plays (`data-skin-swap="fade"`); a `{ old, new, oldTiming?, newTiming? }` object of Web Animations keyframes drives `::view-transition-old(root)` and `::view-transition-new(root)` (`data-skin-swap="custom"`, which switches the stock animation off in `runtime.css`); `'none'` skips the View Transition. The entering theme's transition plays on the way in and the leaving theme's on the way out. `runtime.css` holds no theme's look. All fetching happens before the transition starts, so the screen is never frozen on a network request.
4. **Availability.** Switches for a theme are `hidden` unless its query matches, and they are updated live. If the query stops matching while the theme is mounted (a window resized below 1024 px), the runtime unmounts it without changing the stored choice. It mounts the theme again if the query matches later.
5. **Unmount.** The runtime aborts `ctx.signal`, calls `unmount(ctx)`, runs the `ctx.onCleanup` callbacks in reverse order, removes the theme's stylesheets and clears `data-skin` and `data-skin-base`.
6. **Focus.** If the swap detached or removed the focused control (the switch just pressed, an exit button in the theme), the runtime moves focus to `#main` when entering a theme and to that theme's header switch when leaving. Switches queue: the next one waits until the current View Transition has finished, so quick toggling never cuts an animation off.
7. **Other tabs.** A `storage` listener makes every open tab follow a switch made in another one (no animation; a route lock still wins).

`window.krizThemes` exposes the runtime (`switchTo`, `active`, `isAvailable`) to other scripts. Every swap fires a `skin:change` event on `document`.

## Rules for theme code

- **Move, don't clone.** Wrap or relocate the page's existing nodes (`[data-site]`, `#main`, `[data-site-nav]`) and put them back on unmount. Page scripts, focus and form state then survive both directions. After unmount the DOM must match what it was before mount.
- **Every listener takes `{ signal: ctx.signal }`.** Timers, observers and injected nodes go in `ctx.onCleanup`, or into your own `unmount`.
- **Theme CSS travels with the theme.** XP's keyframe library (`src/styles/motion.css`) is `@import`ed by `xp.theme.css`, so normal mode doesn't download it; normal mode's reduced-motion guard lives in `pro.css`.
- **No scoping prefix is needed** in theme CSS. It's only attached while the theme is mounted. Normal-mode CSS that a `base: 'none'` theme must not inherit is scoped with `:root:not([data-skin-base=none])`. Theme CSS never goes in `site.css` or `pro.css`: those ship to every normal-mode visitor. (XP's app windows are in `xp.theme.css`; the app iframe body, `/apps/<slug>/embed/`, imports `xp/embed.css`.)
- **`mount` must return quickly.** Long sequences (the XP boot) run after it returns, so the View Transition can hand over to them.
- **Respect `ctx.reducedMotion`.** That means no cinematic and no ambient animation. Theme CSS should also carry its own `prefers-reduced-motion` block.
- **Theme-only markup belongs in the theme.** A gimmick that exists only under a theme is built by that theme's module at mount (from data it imports), not shipped hidden in the normal HTML. `data-skin-only="<id>"` and the manifest's `owns` list are a fallback hiding rule for markup that has to ship in the normal HTML; nothing uses `owns` today. A component that needs motion in normal mode opts in with `data-motion-ok`, because normal mode switches off animation by default.

## Data attributes

| Attribute | Where | Meaning |
|---|---|---|
| `data-skin="<id>"` | `<html>` | That theme is mounted. Absent means normal mode. |
| `data-skin-base="none"` | `<html>` | The mounted theme's manifest says `base: 'none'`: `pro.css` normal-mode rules are off. |
| `data-skin-pending="<id>"` | `<html>` | The kicker found a wanted, available theme, and it hasn't mounted yet. |
| `data-skin-swap="fade\|custom"` | `<html>` | A View Transition swap is running: the browser crossfade, or the theme's own keyframes. |
| `data-skin-swap-dir="in\|out"` | `<html>` | During a swap: entering a theme, or leaving for normal mode. |
| `data-theme-lock="<id>"` | `<html>` | The route opens in this theme wherever the theme is available (`/apps/*`). |
| `data-theme-switch="<id>\|normal"` | any control | Switches theme on click. While the theme is unavailable it is hidden, except on a device with a fine pointer (a desktop window that is too narrow or zoomed in): there it stays on screen with `aria-disabled="true"`, does nothing on click, and its `title` becomes "<name> needs <needs>." (only when the manifest has `needs`). |
| `data-skin-only="<id>"` | page markup | Hidden unless theme `<id>` is mounted. |
| `data-skin-fallback="<id>"` | page markup | The reverse: shown until theme `<id>` mounts (the `/apps/*` lock notice). |
| `data-motion-ok` | page markup | Exempt from normal mode's no-animation rule. |
| `data-theme` | `<html>` | Light or dark color scheme. Unrelated to UI themes, and it works in all of them. |

## Theme #1: XP/OS mode (`xp/`)

- **Availability:** `(min-width: 1024px) and (pointer: fine)`, so desktop only and never phones. The egg word is `boot`: type it anywhere in normal mode, outside a form field, with no pause longer than a second between letters. It is off while XP's single-key shortcuts are off (`krizdingus-xp-keys` = `off`, from `keysStorageKey()` in `manifests.ts`; Start → Settings or the `?` sheet).
- **Ways in:** the "XP mode" key in the header (built from `xp/manifest.ts`, with its pixel-CRT `glyph`; the swap is the manifest's CRT power-off/power-on `transition`) and the `boot` egg. **Ways out:** the tray button on the taskbar, Start → Settings → Exit XP mode, Start → Shut down → Exit XP mode, and the "back to the normal site" button during the boot.
- **Mount:** `shell.ts` moves `<main>` into the Krizscape window (title bar plus a menu bar built from the shared nav data, `src/data/site-nav.ts`, Home included; normal mode's nav leaves Home out because its wordmark is the home link, and the current item is read from normal mode's header links) and detaches the normal header and footer. `desktop.ts` adds the icons, taskbar and Start menu (after the skip link, so that stays the first tab stop). The Start menu follows the ARIA menu pattern: Enter, Space or the arrow keys on Start open it; arrows, Home and End move; Right and Left open and close flyouts; Esc closes one level; Tab leaves. `os-chrome.ts` handles minimize, maximize, close/relaunch and reboot. `windows.ts` drags and focuses windows. The scanlines, glitch roulette and CRT effects only run when reduced motion isn't requested.
- **Boot** (`boot.ts`): plays BIOS lines, then the XP splash, then the desktop reveal. It plays the first time a browser enters XP mode (`localStorage['krizdingus-xp-booted']`) and on Reboot, and never under reduced motion. Esc, a click anywhere or the skip button ends whatever stage is playing and everything after it, including the reveal; focus lands back on the control that had it, or on `#main`. While the boot overlay is up, everything else in `<body>` is `inert` and Tab cycles between the overlay's two buttons, so `aria-modal` holds. A reboot's power-off delay is tied to the mount's signal, so leaving mid-reboot never boots over normal mode.
- **Shortcuts:** `shortcuts.ts` is the place for the OS-mode key scheme. Start-menu rows have an empty hint slot (`menuItem(…, hk)` in `desktop.ts`) for each key once it works.
