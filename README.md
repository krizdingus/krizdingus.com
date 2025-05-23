# Krizdingus.com

Personal website showcasing hardware hacks and chaotic code projects. Built with a Game Boy-inspired retro aesthetic and modern web development practices.

## Table of Contents
- [Site Rebuild Philosophy](#site-rebuild-philosophy)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Author](#author)
- [Credits & Acknowledgements](#credits--acknowledgements)

## Site Rebuild Philosophy

Let's get something out of the way: I didn't redesign my site because I was bored. I redesigned it because the old one was... fine.
It did the job. It had some links. It had my name up top. It looked like someone who knows how to write CSS built it on a long lunch break. Which is more or less what happened.

But after a while, "fine" stopped cutting it. I've made too many weird, semi-useful, probably-not-FDA-approved objects to let them live under a beige wall of `p` tags and a floating particle background that looked like it came free with an HTML5 boilerplate.

So I tore it down. I rebuilt it. I made it louder, leaner, and strangely emotional for a site that features a product called the "Printable Poopin' Stool."

This is a write-up of what I did, why I did it, and the small, dumb joys of building your own internet real estate.

### From One File to... Still Kinda One File
My last site was a single-page HTML doc. It was clean, semantic, and did the job with less than 10kb of enthusiasm. Honestly, not a bad way to live.

But it was so minimal it almost felt shy. And I'm not shy. I'm a web developer who wires USB-C ports into GameCubes and builds bots to scrape ROM data from No-Intro dumps. That kind of energy deserves better than a floating `h1` and a politely centered `p` tag.

So the new site is... still pretty simple. But it feels like something now. It's animated, stylized, and powered by a toolchain that sounds more impressive than it looks.

### The Stack: Light but Real
This is still a flat site. There's no React. No Vue. No Next.js existential dread. But this time around, I did bring a few tools to the party:
- PostCSS for processing CSS
- Autoprefixer for vendor prefixes
- Terser for minifying JavaScript
- Serve for local preview

That's it. It's clean. It's fast. It deploys to Cloudflare Pages with zero drama. No Docker, no CI pipelines, no "something something node_modules is 400mb again." It's as low-key as a toolchain can be while still doing a good job.

### The Aesthetic: Game Boy, CRT, and CSS Glitches
I wanted the new site to feel like it was pulled from a dusty Game Boy cartridge but powered by a modern browser. The palette is inspired by old plastic: pixel green, washed-out magenta, soft grays, and deep charcoals. Dark mode turns those into something vaguely radioactive.

The typography is pixel font for headers (Silkscreen) and monospace for body copy—like your BIOS got a blog.

There are glitch effects, scanlines, subtle hover tilts, and other things no one asked for but everyone secretly enjoys. If you click the hero section, it even flickers like a CRT having a moment.

### Projects That Range from Useful to "Why?"
The content hasn't changed much, it's still mostly a gallery of things I've built, printed, soldered, or hallucinated into existence at 2 a.m.

Some of my favorites:
- Mini MagSafe Zyn Container: For the nicotine-powered coder in all of us
- GB ROM Database Bot: For people who want Discord access to 5,000 Game Boy games
- Printable Poopin' Stool: A squatty potty you can print at home
- Game Boy Display Stands: Because showing off your games is more important than playing them
- Game Boy Game Cartridge Labels: Great for your own DIY bootleg Game Boy games

### JS Features: Just Enough, and No More
The JavaScript here is lean but alive:
- Theme toggle with preference memory
- Lazy loading for images
- Smooth scrolling with offset tweaks
- Keyboard navigation and subtle animations
- No bloat, no dependencies

### Accessibility: Because It's 2025, Not 1998
This site doesn't just "kinda" support accessibility. It does it. As in:
- Skip links
- Focus indicators
- Logical heading structure
- ARIA labels on anything interactive
- Reduced motion support
- Sensible contrast in both themes

### Metadata and SEO: Quietly Competent
Behind the pixel-stained curtain, the site is actually... shockingly well-behaved:
- Schema.org JSON-LD for person, website, and project data
- Open Graph and Twitter cards for social sharing
- robots.txt and sitemap.xml
- Canonical tags
- Google Analytics

## Features

- Responsive design with mobile-first approach
- Dark/light mode toggle
- Accessibility (WCAG AA compliance)
- SEO optimization with Schema.org
- Progressive enhancement
- Lazy image loading
- Interactive animations
- Global CDN distribution via Cloudflare

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Hosting: Cloudflare Pages
- Design: Game Boy-inspired retro aesthetic with 90s web motifs
- Build Tools:
  - PostCSS
  - Autoprefixer
  - Terser
  - Serve

## Author

Kris Williams - [krizdingus.com](https://krizdingus.com)

## Credits & Acknowledgements

**Fonts**
- [Silkscreen](https://fonts.google.com/specimen/Silkscreen) by Jason Kottke (Open Font License via Google Fonts)

**Icons**
- [Heroicons](https://heroicons.com/) (MIT License)
- [Simple Icons](https://simpleicons.org/) (CC0 1.0 Universal)

**Other External Resources**
- [Google Fonts](https://fonts.google.com/)
- [Google Analytics](https://analytics.google.com/)

**Build & Tooling**
- [PostCSS](https://postcss.org/)
- [Autoprefixer](https://github.com/postcss/autoprefixer)
- [Terser](https://github.com/terser/terser)
- [Serve](https://github.com/vercel/serve)
- [Cloudflare Pages](https://pages.cloudflare.com/)

**Design**
- Game Boy-inspired retro aesthetic and 90s web motifs 