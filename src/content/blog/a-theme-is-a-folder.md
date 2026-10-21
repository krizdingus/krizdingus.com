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

That boot screen is from the old one-page site, typing animations and all. It's nice recycling code you've used before, especially code you're proud of. I threw a lot of work into animations like that, and I was really proud of them when they were finished. And I'm glad they worked without that much reworking. I was thrilled with myself that I was able to reuse them.

The XP is for Windows XP, roughly. It's not trying to be an exact copy of anything. Why XP is covered in [Time for a bigger site](/blog/time-for-a-bigger-site/).

Phones don't get the XP option at all. The desktop/XP experience just doesn't fit well on phones, or even small tablets. I could have engineered media queries for every damn pixel breakpoint, and nothing would have justified all that effort for what would ultimately be a stripped-down experience that didn't accomplish what the design was meant to do and wasn't good for users.

## Two looks, one site

On a lot of sites a theme switch just means light or dark. This site has that too, in the same little menu: Auto, which just goes along with whatever your device is set to, plus Light and Dark.

I wanted to tackle themes, and I wanted to do it the opposite way of WordPress. WordPress is based on PHP templates that sit on the server. You can only have one active theme at a time. And switching the theme often, like 99% of the time, wrecks your entire website. I've worked in it for years and had a love-hate relationship with WordPress and WordPress themes. And in all fairness, this isn't WordPress's fault. Their own rules say that you're not supposed to stuff your theme with custom shortcodes and whatnot, and that stuff should be left for plugins so that your whole site doesn't get wrecked when you change themes. People do it anyway, especially in a lot of these bloated multipurpose themes that stuff in page builders, which clients love and developers groan about. Or at least this developer does. That's what leads to WordPress being a shit show. Shopify is in theory better, but I think anyone that's worked on enough custom Shopify builds, or inherited them, will find that same issue has crept in there as well.

Unlike with WordPress, where the website administrator gets to choose a theme, here the user, you, gets to decide whether you want to view my website like a normal human being, or like me. None of the content on the website, the blog posts, the write-ups on my projects, the about page, none of it has any idea what the theme is. It's blissfully unaware. Happy idiots. Switching themes does nothing, really, apart from deciding which set of instructions the website uses to paint itself.

So yeah, I guess the better analogy is a Winamp skin. I don't know how to describe those to the kids these days. Like changing your Fortnite character skin or something.

For most of this rebuild the desktop was the site, and the plain version was a setting in the Start menu. There was even a popup asking if it was all too much. The popup's gone.

Do I use XP mode myself? Haha, not really. That's why normal mode was created. It started out as an optional secondary theme after I figured the faux computer desktop gimmick might get old quick. Eventually, I decided that I needed to get over that stuff I was going through and serious up my website a bit. That old secondary mode is what became normal mode, although it was obviously more of an afterthought. It looked like the fake web pages in XP mode, just without the desktop wrapper. It wasn't bad, but it wasn't intentional. It was a "fine, fuck it" solution that didn't belong in a website that's meant to be "mine" and showcase me, the guy with 100% creative control over the site.

At a certain point, I had stepped away from working on the website to work on other things. And then as I was looking at it, I was like, well, it's too boring. And it was boring by design, because it was initially done sarcastically. Oh, so you don't like my cool-ass ridiculous website? Fine, here you go, your LinkedIn version. But now that it wasn't a sarcastic afterthought and a joke, and I needed to take it seriously, I needed this more readable, more serious mode to at least reflect the whimsy I've always wanted my website to have.

Landing on the fonts was actually kind of difficult. I was trying to find a good pairing that could stand out. But at the same time, it's a lot of the same fonts that you generally go back to. Eventually, those two, Figtree and Saira, however that's pronounced, made sense.

Dark mode is plum. I'm a dark mode fan, but I really hate just black and gray dark modes. I found plum to be a really nice, dark background color that could serve the same purpose as black without the starkness, the oppressiveness of black. I'd considered other colors. I'd considered blues and reds, influenced by the auditoriums of movie theaters. They often use those colors because, at least in my observation, they look great in the dark. They don't really conflict with a lot in the dark. Nice burgundies and dark blues. I wanted the dark modes to feel like the curtains had come down, I guess. And the plum was already in line with the sort of retro Game Boy color palette that I already kind of wanted to stick with, or at least be influenced by.

And now normal mode is my favorite. I'm typically a dark mode guy, but now my website has a light mode I really like that doesn't totally burn my retinas. I swap between light and dark depending on my mood.

Normal mode is the default now: a plain header, the page and a footer, and it works with JavaScript turned off. You only get the desktop if you ask for it, or if you open one of the little app pages on a computer, which I'll get to.

There's only one theme. I wanted it to work like a real feature, lightweight and accessible. Some of it is also just showing off, and this post is kind of that part. I don't really mean showing off for developers, though. Just showing off for myself, some other developer friends, and mostly, I guess, trying to inspire whimsy through subtle fun things.

I miss when the web was fun and weird, back in the '90s and the early 2000s. Somewhere along the way after Web 2.0 (I sound like an old man), while making the internet more accessible for everyone, we softened all the corners and smoothed out a lot of the edges. I mean, the weirdness is still there, but it's contained. There was a period there where the internet was just a little bit more wild. And yet somehow not really as disgusting as it is today. Anyway, XP mode is that whimsy of back when we used to "go on the computer." So it's just sort of showing off that I can do it.

It gets more technical from here.

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

The rest of it covers the menu entry's text and its little pixel-CRT icon, the keyframes for the swap, and a word you can type on the normal site to get in. That's where "boot" comes from. There's also `appRoutes: true`, which says the app pages under `/apps/`, like the MediaKruzer video player, open in this theme. On a computer that can run XP mode, those pages come up as the desktop no matter what you picked.

The manifest has to stay pure data, just values and no code, because the build pastes pieces of it into the head of every page. The head is the part of the HTML the browser reads before it shows you anything. The site is built with Astro, which turns every page into a plain HTML file ahead of time, so "every page" really does mean every file.

`availability` is a media query, which is a question the page asks the browser about the screen it's on. This one asks two things: is the window at least 1024 pixels wide, and is there a mouse or a trackpad? A phone's touchscreen doesn't count, so phones never pass. Shrink the window under 1024 pixels while you're in the desktop and the runtime, the small script that runs the whole theme system, drops you back to the normal site.

## Finding themes

Nothing keeps a list of themes. The theme system just globs for them, which means it looks for every file that matches a pattern, here any `<id>.theme.ts` one folder down:

```ts
export const themeEntries: ThemeEntry[] = pairThemes(
  themeManifests,
  import.meta.glob<ThemeModule>('./*/*.theme.ts'),
);
```

That glob is lazy. Vite, the tool Astro uses to bundle up the JavaScript, builds each `<id>.theme.ts` as its own chunk, a separate JavaScript file, and the browser only fetches it when that theme mounts, which is the word for a theme actually getting switched on. Normal pages never download the desktop.

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

Mount switches the theme on, unmount switches it off. Theme CSS can be as heavy-handed as it likes, since it's only on the page while the theme is mounted. The context handed to `mount()` carries an `AbortSignal`, which is basically a kill switch: it gets pulled right before `unmount()`, and any event listener the theme attached with it removes itself.

The XP theme moves the page's `<main>` into an OS window and builds a desktop, taskbar and Start menu around it. Its `unmount()` puts `<main>` back where it found it. It moves the real thing instead of making a copy, so the page's scripts, where your keyboard focus was and anything you'd typed into a form all survive the trip, both ways.

## Before first paint

If you left the site in XP mode, the next page has to know that before it draws anything. Otherwise you'd get the normal site for a beat and then watch it turn into a desktop. So there's a small script in the head that runs before the page draws, and the browser waits for it. It reads your stored choice, checks it against the theme's media query, and marks the page as pending. Then this bit of CSS keeps the page hidden until the theme mounts:

```css
:root[data-skin-pending]:not([data-skin]) body:not([data-motion-ok]) {
  visibility: hidden;
  animation: skin-failsafe 0s linear 4s forwards !important;
}
@keyframes skin-failsafe { to { visibility: visible; } }
```

That animation is a timer. It lasts zero seconds and starts after four, so if the theme never arrives, because you're offline or something blocked the script, the page shows up anyway.

## The swap

The runtime fetches the theme module and its stylesheets before it touches the page. Each stylesheet goes in with `link.media = 'not all'`. A stylesheet whose media query matches nothing still downloads. It just doesn't apply. At mount the runtime flips it to `all`, so the swap itself is instant, and all the network stuff happens while the old page is still up.

If your browser has View Transitions, a newer feature where the browser snapshots the old page and lets you animate from it to the new one, the swap runs inside one, and the manifest supplies the keyframes. For XP the old page collapses like a CRT powering off in 240 milliseconds and the new one powers on in 320. You can tell your computer you want less motion on screen (`prefers-reduced-motion`, most operating systems have a setting for it), and then there's no transition and the page just changes.

The choice goes in `localStorage`, the little box of settings your browser keeps for each site, under `krizdingus-skin`. `krizdingus-theme` was already the light and dark setting.

## Theme #2

A second theme would need a folder with a `manifest.ts` and an `<id>.theme.ts` that exports `styles`, `mount` and `unmount`. The layout adds a menu entry for every manifest it finds, and the runtime wires it up. Adding one doesn't mean editing anything outside its folder.

In the tests, a stub theme that's just its own folder goes through the same discovery and mounts with nothing else edited.

XP itself doesn't meet that bar yet. The home page has a few empty slots for it to fill, and the app embed pages import its stylesheet straight out of the XP folder.

I'm a little embarrassed to admit that the theme currently fails at the goal of never touching anything outside of the folder. That's something I'm going to fix, but I just wanted to launch it anyway. So yeah, there are two places where I break my own rule. I can beat myself up for that and then fix them. That's what I'll do.

## Unfinished

As for how XP mode turned out, I'm pleased. It's still "unfinished" in that there are things I wanted it to include that I just sort of abandoned, not for lack of interest, but for the sake of actually finishing the website. Isn't that how any theme gets shipped?

I wanted to include games. Not Minesweeper or Solitaire. Those have been done to death. Maybe a clone of that one pinball game with the astronaut, Space Cadet. I sank so many hours into that game. Or a take on SkiFree, where the goddamn yeti straight demolishes you at the end. Maybe even a parody of Doom. I wanted separate media players, one for video and one for audio, and the audio one to resemble Winamp. But I sort of gave up on that because I was going to try to play the music from Spotify, and their API was more restrictive than I'd like. So the whole Winamp idea, I didn't even begin. I wanted users to get fake spam popups. I even wanted to include an AOL homage with dial-up sounds and all that goofy bullshit. Yeah, a lot. Maybe one day.

I guess what I'm saying is I could have worked at this and just kept working at this and never relaunched my site. What I started, I think, at the beginning of the summer slowly became just something that wasn't getting done, because I just kept finding things that needed to be tweaked. At a certain point, you just gotta say, nope, you know what? We're shipping it, and then we'll fix what's broke.

So, I'll probably be inspired to make new themes later. The framework is pretty much there. Just no imminent plans. If a second one ever shows up, it gets a folder.
