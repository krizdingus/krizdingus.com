---
title: "A theme is a folder"
summary: "This site has a second look, an old-computer desktop called XP mode, and you only get it if you ask. Here's how it's built so the normal pages never have to carry it."
description: "This site has a second look, an old-computer desktop called XP mode, and you only get it if you ask. How it's built so the normal pages never carry it."
hero_image: "/images/blog/a-theme-is-a-folder.jpg"
hero_alt: "A file folder holds a CRT monitor and overlapping desktop windows, surrounded by a pixel cursor, colorful blocks, and halftone patterns."
hero_caption: "A whole desktop, tucked into a folder until you ask for it."
date_published: 2026-10-20
tags: ["meta", "code"]
---

If you're on a laptop or a desktop computer right now, there's a little arrow up in the header, right next to the light and dark button. Open it and there's an entry that says XP mode, with a tiny pixel drawing of an old CRT monitor next to it. Pick it and the page you're reading switches off like an old tube TV and comes back as the desktop of a computer that doesn't exist. Same post, but now it's sitting inside a window, with icons, a taskbar and a Start menu around it. The first time you go in there's a boot screen too, which you can skip (and which never plays if your computer is set to cut down on motion). You can also just type the word "boot" anywhere on the site, as long as you're not in a text box, and you'll end up in the same place.

The XP is for Windows XP, roughly. That's when I was using the computer the most. I know '95 and '98 too, but XP is when the internet really took off and most people were online regularly. It's not trying to be an exact copy of anything. For nerd and web-culture people, Windows XP is like the shag carpet of the '70s.

If you're on a phone you don't get that entry at all. That part's deliberate.

## Two looks, one site

On a lot of sites a theme switch just means light or dark. This site has that too, in the same little menu: Auto, which just goes along with whatever your device is set to, plus Light and Dark. It works in either look. In WordPress a theme is the whole design, but somebody picks it once, on the server, and every visitor gets the same one. This is closer to the WordPress kind, except you're the one picking it, and it happens right there in your browser without loading a new page. It takes what's already on the page and rearranges it.

For most of this rebuild the desktop was the site, and the plain version was a setting in the Start menu. There was even a popup asking if it was all too much. The popup's gone. Normal mode is the default now: a plain header, the page and a footer, and it works with JavaScript turned off. You only get the desktop if you ask for it, or if you open one of the little app pages on a computer, which I'll get to.

There's only one theme, and I don't have a second one planned. I still built it so another one could drop in next to it without touching anything else. I wanted it to work like a real feature, lightweight and accessible. Some of it is also just showing off, and this post is kind of that part. It gets more technical from here.

## The manifest

Each theme is a folder, `src/themes/<id>/`, and one of the two files it has to have is a manifest. That's just a small file of facts about the theme: what it's called, a one-line description, where it's allowed to run. This is the top of the one for XP mode:

```ts
const manifest: ThemeManifest = {
  id: 'xp',
  name: 'XP mode',
  description: 'The same site as a fake old-PC desktop: windows, a taskbar, a Start menu and a boot screen.',
  // Desktop only: a wide viewport and a mouse or trackpad. Never phones.
  availability: '(min-width: 1024px) and (pointer: fine)',
```

The rest of it covers the menu entry's text and its little pixel-CRT icon, the keyframes for the swap, and a word you can type on the normal site to get in. That's where "boot" comes from. There's also `appRoutes: true`, which says the app pages under `/apps/`, like the MediaKruzer video player, open in this theme. On a computer that can run XP mode, those pages come up as the desktop no matter what you picked. Anywhere else they show a short note about what the app needs.

The manifest has to stay pure data, just values and no code, because the build pastes pieces of it into the head of every page. The head is the part of the HTML the browser reads before it shows you anything. The site is built with Astro, which turns every page into a plain HTML file ahead of time, so "every page" really does mean every file.

`availability` is a media query, which is a question the page asks the browser about the screen it's on. This one asks two things: is the window at least 1024 pixels wide, and is there a mouse or a trackpad? A phone's touchscreen doesn't count, so phones never pass. Phones getting the plain site was already on my list back in May, before any of this was a theme, and that part never changed.

Anywhere the query doesn't match, you can't use the switch. Shrink the window under 1024 pixels while you're in the desktop and the runtime, the small script that runs the whole theme system, drops you back to the normal site. It doesn't save that as your choice, since you didn't really choose anything. Widen the window again and the desktop comes back.

## Finding themes

Nothing keeps a list of themes. The theme system just globs for them, which means it looks for every file that matches a pattern, here any `<id>.theme.ts` one folder down:

```ts
export const themeEntries: ThemeEntry[] = pairThemes(
  themeManifests,
  import.meta.glob<ThemeModule>('./*/*.theme.ts'),
);
```

That glob is lazy. Vite, the tool Astro uses to bundle up the JavaScript, builds each `<id>.theme.ts` as its own chunk, a separate JavaScript file, and the browser only fetches it when that theme mounts, which is the word for a theme actually getting switched on. Normal pages never download the desktop. The only place it loads without you asking for it is those `/apps/` pages.

`themeManifests` comes from a second glob that isn't lazy, since manifests are small and the head script needs them before anything else runs.

## The contract

Every theme hands the runtime the same few things, so the runtime never has to know anything about a particular theme. A theme module exports this:

```ts
export interface ThemeModule {
  /** Stylesheet URLs (import them with `?url`). The runtime adds them before
   *  mount() and removes them after unmount(), so theme CSS needs no scoping. */
  styles?: string[];
  /** Transform the page. Called after styles have loaded and after
   *  <html data-skin="<id>"> is set. Must not await long work (the view
   *  transition holds the screen until it returns). */
  mount(ctx: ThemeContext): void | Promise<void>;
  /** Put every node you moved back where it was. Listeners on ctx.signal and
   *  ctx.onCleanup callbacks are handled for you. */
  unmount(ctx: ThemeContext): void | Promise<void>;
}
```

That's pretty much the whole deal. Mount switches the theme on, unmount switches it off. Theme CSS can be as heavy-handed as it likes, since it's only on the page while the theme is mounted. The context handed to `mount()` carries an `AbortSignal`, which is basically a kill switch: it gets pulled right before `unmount()`, and any event listener the theme attached with it removes itself. Anything else that needs tearing down goes to `onCleanup()`, and the runtime cleans up after the theme.

The XP theme moves the page's `<main>` into an OS window and builds a desktop, taskbar and Start menu around it. Its `unmount()` puts `<main>` back where it found it. It moves the real thing instead of making a copy, so the page's scripts, where your keyboard focus was and anything you'd typed into a form all survive the trip, both ways.

## Before first paint

If you left the site in XP mode, the next page has to know that before it draws anything. Otherwise you'd get the normal site for a beat and then watch it turn into a desktop, which looks broken. So there's a small script in the head that runs before the page draws, and the browser waits for it. It reads your stored choice, checks it against the theme's media query, and marks the page as pending. Then this bit of CSS keeps the page hidden until the theme mounts:

```css
:root[data-skin-pending]:not([data-skin]) body:not([data-motion-ok]) {
  visibility: hidden;
  animation: skin-failsafe 0s linear 4s forwards !important;
}
@keyframes skin-failsafe { to { visibility: visible; } }
```

That animation is a timer. It lasts zero seconds and starts after four, so if the theme never arrives, because you're offline or something blocked the script, the page shows up anyway. With JavaScript off the head script never runs, nothing is ever pending, and you get the plain normal site.

## The swap

The runtime fetches the theme module and its stylesheets before it touches the page. Each stylesheet goes in with `link.media = 'not all'`. A stylesheet whose media query matches nothing still downloads. It just doesn't apply. At mount the runtime flips it to `all`, so the swap itself is instant, and all the network stuff happens while the old page is still up.

If your browser has View Transitions, a newer feature where the browser snapshots the old page and lets you animate from it to the new one, the swap runs inside one, and the manifest supplies the keyframes. For XP the old page collapses like a CRT powering off in 240 milliseconds and the new one powers on in 320. You can tell your computer you want less motion on screen (`prefers-reduced-motion`, most operating systems have a setting for it), and then there's no transition and the page just changes. Switches queue up and run one at a time, so mashing the button can't start two swaps at once.

The choice goes in `localStorage`, the little box of settings your browser keeps for each site, under `krizdingus-skin`. Yeah, skin. `krizdingus-theme` was already the light and dark setting. Nothing stored means normal mode, except on the `/apps/` pages, where the route wins. If storage is blocked, the theme lasts until you leave the page. Other open tabs listen for that key, so switching in one tab switches all of them.

## Theme #2

A second theme would need a folder with a `manifest.ts` and an `<id>.theme.ts` that exports `styles`, `mount` and `unmount`. The layout adds a menu entry for every manifest it finds, and the runtime wires it up. Like the XP one, it only works where its query matches. Adding one doesn't mean editing anything outside its folder.

XP itself doesn't meet that bar yet, which is a little embarrassing for the theme that's supposed to be the example. The home page has a few empty slots for it to fill, and the app embed pages import its stylesheet straight out of the XP folder.

In the tests, a stub theme that's just its own folder goes through the same discovery and mounts with nothing else edited. Another test switches from XP to a stub and back to normal, and the page's HTML has to come out exactly the way it went in.

There's still just the one theme. If a second one ever shows up, it gets a folder.
