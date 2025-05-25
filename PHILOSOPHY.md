# How I Rebuilt My Website (And Why It Had to Get Weirder)

Let's get something out of the way: I didn't rebuild my website because I had a grand plan. I did it because the old one was held together with a HostGator coupon, stubbornness, and whatever energy you get from drinking White Monsters and forgetting to eat dinner.

It worked. It was one page. It had links. It said "Krizdingus" at the top. Technically, it was a website. You could point to it and say, "Yeah, that's a guy who probably knows how to set up FTP."

But eventually, that wasn't enough. I make weird things—printable stools, cartridge displays, nicotine mag-holders disguised as Game Boy mods. My website didn't reflect that. It looked like it belonged to someone who helps their HOA set up email forwarding.

So I wiped it. Started fresh. What came out the other side is what you're looking at now: a retro-futurist CRT terminal pretending it's 1996 but hosted on Cloudflare in 2025.

A site with glitch effects, animated boot sequences, theme toggles, project cards that flicker like an old VHS, and a hero section that looks like it could launch QBasic. It is, in every possible way, unnecessary. Which is what makes it mine.

Also, I want to be very clear: I'm not anti-template. I'm anti-sameness. This site isn't trying to sell you a course, impress recruiters, or optimize for conversion. It's here to say: "This guy owns a soldering iron. And he's used it in ways OSHA does not condone." (nerds)

> "A functional portfolio site is fine. This one is stupid. On purpose."  
> — Me, probably.

## From One File to... Still Kinda One File

The old site was one `.php` file I threw on a HostGator plan I got during a Black Friday deal that cost less than a value meal. It stayed up for three years out of pure inertia. No frameworks. No CMS. Just vibes and a box of `<a>` tags.

It didn't do much. A list of links. Some green highlights. A paragraph about me that read like it was written by someone being asked to describe themselves at gunpoint. But it loaded fast. It never broke. It never asked for anything.

The problem wasn't performance. It was personality. I make weird stuff—things you can 3D print, stick to a Game Boy, or quietly shame your toilet with. And that old page didn't reflect that. It looked like it belonged to someone who runs a neighborhood email list and takes it very seriously.

So I rebuilt it. Sort of.

It's still a static site. Still mostly one page. But now it behaves like a rogue terminal trying to contact 1994. It has:

- **A JavaScript system in one glorious file**—`scripts.js`. Every feature, every animation, every glitch lives in there like a tiny ecosystem of nonsense.

- **A `styles.css` file** that's as chaotic as the workbench behind me. (There's a comment at the top that just says "help.")

- **PostCSS and Autoprefixer**, because I like pretending my CSS gets compiled in a mysterious bunker.

- **A build process so light** it practically runs on spite. Just HTML, CSS, JS, a little Terser, and Cloudflare Pages acting like it's delivering nuclear codes.

- **No frameworks. No Webpack.** No six layers of dev server abstraction. Just code I can read when I'm tired and mad.

It's still simple under the hood. But now it boots with a fake CRT animation, picks a random pixel background from a rotating folder of nostalgia, and loads project cards that glitch out for no reason other than that I wanted them to.

Still one file? Spiritually, yes.

But now that file shows up to work wearing a leather jacket and smelling faintly of solder smoke.

## The Stack: Light but Real

If the modern web stack is a 3-course meal with wine pairings and imported salt, mine is a cold sandwich eaten over a workbench, standing up.

No React. No Vue. No Astro. Not even jQuery. This site runs on HTML, CSS, and JavaScript the way your childhood website did—except this one knows what a `<template>` tag is.

Here's what it's made of:

- **HTML** — Clean, semantic HTML. No frills. No framework.
- **CSS** — One file. Untouched by preprocessors. Chaotic but well-meaning.
- **JavaScript** — All in `scripts.js`. No modules. No frameworks. Just handcrafted nonsense.
- **Serve** — For local preview. No dev server bells, just plain old HTTP.
- **Cloudflare Pages** — Fast, free, and blissfully unaware of what a Docker container is.

There's no CMS. No database. No dashboard. If I want to update a project, I open a text file and type words like it's 1998.

The stack isn't minimalist to make a point. It's minimalist because I want a site I can understand when I'm tired and mildly unhinged.

## The Aesthetic: CRTs, Glitches, and That Retro Terminal Smell

Let's be clear: all of the effects on this site—the glitches, the CRT boot-up, the rotating project cards, the retro animations—they live in one file: `scripts.js`. There is no framework. No module system. No bundler. It's just JavaScript. Structured like a fever dream, but clean enough to debug without punching drywall.

This file is the entire personality engine for the site. And it works.

### Boot Sequence

The boot sequence is handled by a class called `ConsoleHero`. It starts with one of several fake operating systems like "MultimediOS '98" or "Terminal Crimewave." Each one is packed with nonsense lines like:

```
Mount /mnt/zyn... OK
Blow into cartridge to continue
George W. Bush codec missing, defaulting to GIF
```

Each line animates with either typing effects, animated dots, or a simulated ASCII progress bar. None of it is necessary. All of it is beautiful.

The sequences are randomized. Each has its own vibe: 3D printing chaos, bootleg heroics, resin envy. It's a playable intro cutscene for a site that doesn't need one.

### CRT Boot Effect

When the terminal finishes booting, it triggers a CSS class called `crt-bootup`. This animates brightness, contrast, hue, and scale all at once—essentially slamming a monitor into existence like a Street Fighter intro.

Then the title card fades in with a random pixelated background. Think Windows XP if it was reimagined by a guy who loves Bepis, solder, and cursed Game Boy peripherals.

### Glitch Animations

Glitch effects are applied on project cards via a roulette system. Every few seconds, one card gets randomly slammed with:

- **chromaBleed**: RGB offset effect like an old 3D movie without glasses
- **quickGlitch**: rapid skewing and hue shifting
- **pixelCorruption**: fake corruption overlay
- **borderFlicker**: 90s-style border seizures
- **colorShift**: hue rotations that scream "this JPEG is haunted"

This all lives inside `RandomProjectEffects`. It even respects motion preferences. Which is considerate, considering how hard it glitches.

### Featured Project Rotation

There's a single featured project card that changes every 45 seconds. When it switches, it glitches on purpose. Like a game cartridge that just got nudged.

You get animated warnings like:

```
◊ SRAM DETECTS CHAOS ENERGY ◊
◊ CARTRIDGE READ FAILURE ◊
```

Then the card updates with new content. A little drama. A little chaos. Maximum toy energy.

### Retro Background

Each `.retro-bg` element gets an animated canvas overlay. This generates:

- Moving scanlines with randomized pulse effects
- Pixel static that's thematically on-brand
- Subtle color shifts based on your system theme

It's built from scratch using canvas. And it adapts when your system switches between light and dark mode. The scanline code alone is more emotionally invested than most front-end frameworks.

## CSS: A Structured Disaster

My CSS is a mess. Not a disaster—just the kind of mess you get when one person designs the UI, writes the JavaScript, and still has opinions about which 3D printer smells the best when it's running hot.

It's got variables. It's responsive. It respects `prefers-reduced-motion`, which is already more than half the internet can say. But it's still one giant file that reads like it was written in a caffeine fugue state and never fully recovered.

There are keyframes in there doing things I forgot CSS could even do. Shadows behaving like lighting gels. Border-radiuses pushed to their legal limit. And animations that feel like someone shouting HTML through a box fan.

It's not pretty. But it works. And more importantly—it's mine.

## Projects That Range from Useful to "Why?"

This isn't a portfolio. It's a shelf. A digital garage. A collection of things I've built, printed, hacked together, or dreamt up while staring at a spool of filament and asking myself, "Would anyone stop me from doing this?"

Some of these projects are functional. Some are funny. Some were started as jokes and then went way too far. All of them live on the site, proudly, like weird trophies I made myself.

### Printable Poopin' Stool

A fully 3D-printable squatty potty. Designed for home use. Compatible with most human bodies and at least one IKEA toilet. Created out of curiosity, printed out of spite, and now a permanent bathroom fixture. People laugh. Until they use it.

### MagSafe Zyn Container

A puck-shaped case that magnetically attaches to your laptop. Because nothing says "I take my nicotine seriously" like affixing it to your MacBook like a military module. The Zyn pod ejects with a satisfying pop, which, let's be honest, is half the point.

### Game Boy ROM Database Bot

A Discord bot that lets you query the entire No-Intro Game Boy ROM library from chat. Completely unnecessary, thoroughly overbuilt, and extremely helpful to no one except me and maybe three people in a private server who keep asking for "that one game with the wizard."

### Game Boy Display Stands

Custom 3D-printed stands for showcasing Game Boy cartridges, because displaying them makes me feel like a museum curator with a severe case of nostalgia. Each stand is slightly over-engineered and designed to look good on a shelf or next to a CRT that doesn't even turn on anymore.

### Bootleg Game Boy Labels

Homemade labels for my homemade games. Some of these ROMs are real, some are half-finished projects, and some are just there for the aesthetic. The labels are sharp, fake-official, and printed with love and mild dishonesty.

I didn't make any of these to impress clients. I made them because I could. Because I wanted to. Because there's something satisfying about taking an idea from your brain to your printer to your desk and realizing that nobody asked for it—and it still kicks ass.

This site exists to give these things a home. Not buried in GitHub repos or lost in photo dumps, but out front, flickering gently on a fake CRT interface, like artifacts from a cooler alternate timeline.

Every time I add a new one, I smile. Then I glitch the project card for dramatic effect. Because if you're not introducing your side projects with a fake scanline animation, what are we even doing here?

## JS Features: Just Enough, and No More

The JavaScript on this site doesn't try to reinvent the internet. It doesn't hydrate components, lazy-mount islands, or recompile itself every time I breathe near the terminal. It just works. Because I wrote it to.

Everything lives in `scripts.js`, a single file that does a surprising amount without ever trying to be a system. There's no framework. No imports. No TypeScript. No bundler. Just vanilla JS, written like I meant it.

Here's what it handles:

### Theme Toggle
Light mode, dark mode, and memory via localStorage. No flashing, no resets, no guessing.

### Lazy Image Loading
Because most images are big and pointless in the best way. I don't want them loading unless they need to.

### Smooth Scrolling with Offsets
Anchors scroll with a little easing, accounting for the sticky header. It's the kind of detail you notice when it's broken.

### Reduced Motion Support
If your system says "don't animate," this site listens. No shame in going static.

### Keyboard Navigation
All interactive elements are tabbable. Hover states have focus states. Accessibility isn't optional—it's just how I build.

I didn't include any JavaScript I wouldn't want to read again later. There's no jQuery legacy, no third-party scripts slowing it down, no wild async waterfalls. Just the right amount to make the site feel alive.

Everything else? That's handled with HTML and CSS. Because you don't need a JavaScript framework to animate a button. You just need a little time, a little weirdness, and a little willingness to do it yourself.

## Metadata and SEO: Quietly Competent

For a site that pretends to be a haunted CRT from 1998, it's shockingly well-behaved under the hood.

Everything that's supposed to be there is there:

- Schema.org JSON-LD for person, website, and project metadata
- Open Graph + Twitter cards so previews actually look good when shared
- `robots.txt` and `sitemap.xml` so search engines know what's going on
- Canonical tags to keep things tidy
- Google Analytics because I like knowing if someone visited from a 3DS browser at 3 a.m.

There are no SEO hacks, keyword stuffing, or dark patterns. Just clean markup, structured data, and a quiet confidence that the content will speak for itself. It's the same philosophy as the rest of the site: do the work, make it clean, don't shout about it.

The site loads fast. It gets decent Lighthouse scores. It doesn't trigger cookie warnings. And it won't try to track you across the web. Because I don't care where else you go—I'm just glad you stopped by.

## Why Bother?

Because I wanted to.

That's the real answer. Not because I needed a new job. Not because I had to update my portfolio. Not because I was trying to drive traffic, build a brand, or optimize my conversion funnel.

I built it because the old one didn't feel like me anymore. And if I'm going to have a personal website—one of the last true pieces of internet property that isn't filtered through an algorithm or hosted inside a sanitized template—I want it to look, sound, and behave like I made it.

The fact that I can write this much about it probably tells you everything you need to know.

This isn't a tech demo. It's not a resume. It's a place. One that boots, glitches, scrolls, and hums like something I would have loved to stumble across at 2 a.m. on a dial-up connection.

That's why I bothered. Because I could. Because it's fun. Because the internet is better when people build weird stuff on purpose.

## Final Thoughts (Before I Rebuild It Again)

This is the part where I'm supposed to say "I built this for personal study" or "to improve my brand" or "as a technical exercise in modern front-end development."

Nope.

I built it because I didn't like the old one anymore. Because it didn't feel like me. Because it was too safe, too plain, and too beige for the kind of dumb, chaotic joy I get from making things that absolutely no one asked for.

I break hardware now. I 3D print solutions to problems that didn't exist five minutes ago. I write Discord bots to answer questions no one's asking. That deserves a site with a little more style. A little more glitch. A little more "what the hell is this?"

I'm not selling anything. I'm not optimizing for engagement. I'm not trying to go viral. I just wanted a site that feels like something I'd stumble across at 2 a.m., forget to bookmark, and spend the next six years trying to find again.

And if I rebuild it again in six months? Good. That means I'm still making things.