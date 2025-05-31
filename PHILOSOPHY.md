# How I Rebuilt My Website (And Why It Had to Get Weirder)

Let's get something out of the way: I didn't rebuild my website because I had a grand plan. I did it because the old one was held together with a HostGator coupon, stubbornness, and whatever energy you get from drinking White Monsters and forgetting to eat dinner.

It worked. It was one page. It had links. It said "Krizdingus" at the top. Technically, it was a website. You could point to it and say, "Yeah, that's a guy who probably knows how to set up FTP."

But eventually, that wasn't enough. I make weird things—printable stools, cartridge displays, nicotine pouch-holders,  and bootleg Game Boy game labels. My website didn't reflect that. It looked like it belonged to someone who helps their HOA set up email forwarding.

So I wiped it. Started fresh. What came out the other side is what you're looking at now: a retro-futurist CRT terminal pretending it's 1996 but hosted on Cloudflare in 2025.

A site with glitch effects, animated boot sequences, theme toggles, project cards that flicker like an old VHS, and a hero section that looks like it could launch QBasic. It is, in every possible way, unnecessary. Which is what makes it mine.

Also, I want to be very clear: I'm not anti-template. I'm anti-sameness. This site isn't trying to sell you a course, impress recruiters, or optimize for conversion. It's here to say: "This guy owns a soldering iron. And he's used it in ways OSHA does not condone."

"A functional portfolio site is fine. This one is stupid. On purpose."

## From One File to... Still Kinda One File

The old site was one .php file I threw on a HostGator plan I got during a Black Friday deal that cost less than a value meal. It stayed up for three years out of pure inertia. No frameworks. No CMS. Just vibes and a box of `<a>` tags.

It didn't do much. A list of links. Some green highlights. A paragraph about me that read like it was written by someone being asked to describe themselves at gunpoint. But it loaded fast. It never broke. It never asked for anything.

The problem wasn't performance. It was personality. If I'm going to make magnetic nicotine holders and printable poop stools, the portfolio showing them better have some personality too. More glitch. More "what the hell is this?"

So I rebuilt it. Sort of.

It's still a static site. Still mostly one page. But now it behaves like a rogue terminal trying to contact 1994. It has:

A JavaScript system that's mostly one glorified text dump—scripts.js—with a couple of tiny helpers for analytics and structured data. Every feature, every animation, every glitch lives in there like a tiny ecosystem of nonsense.

A styles.css file that's surprisingly well-documented but reads like it was written during a three-day energy drink binge. The comments are professional. The code decisions are not.

A build process so light it practically runs on spite. Just HTML, CSS, JS, and Cloudflare Pages acting like it's delivering nuclear codes.

No frameworks. No Webpack. No six layers of dev server abstraction. Just code I can read when I'm tired and mad.

It's still simple under the hood. But now it boots with a fake CRT animation, picks a random pixelated background from a rotating folder of nostalgia, and loads project cards that glitch out for no reason other than that I wanted them to.

Still one file? Spiritually, yes.

But now that file shows up to work wearing a leather jacket and smelling faintly of solder smoke.

## The Stack: Light but Real

If the modern web stack is a 3-course meal with wine pairings and imported salt, mine is a cold sandwich eaten over a workbench, standing up.

No React. No Vue. No Astro. Not even jQuery. This site runs on HTML, CSS, and JavaScript the way your childhood website did—except this one knows what a `<template>` tag is.

Here's what it's made of:

- **HTML:** Clean, semantic HTML. No frills. No framework.
- **CSS:** Untouched by preprocessors. Chaotic but well-meaning.
- **JavaScript:** All in scripts.js. No modules. No frameworks. Just handcrafted nonsense.
- **Serve:** For local preview (when I remember to install it). No dev server bells, just plain old HTTP.
- **Cloudflare Pages:** Fast, free, and blissfully unaware of what a Docker container is.

There's no CMS. No database. No dashboard. If I want to update a project, I open a text file and type words like it's 1998.

The stack isn't minimalist to make a point. It's minimalist because I want a site I can understand when I'm tired and mildly unhinged.

## The Aesthetic: CRTs, Glitches, and That Retro Terminal Smell

Let's be clear: all of the effects on this site—the glitches, the CRT boot-up, the rotating project cards, the retro animations—they live in scripts.js. There is no framework. No module system. No bundler. It's just JavaScript. Structured like a fever dream, but clean enough to debug without punching drywall.

This file is the entire personality engine for the site. And it works.

### Boot Sequence

The boot sequence is handled by a class called ConsoleHero. It starts with one of several fake operating systems like "MultimediOS '98" or "Terminal Crimewave." Each one is packed with nonsense lines like:

Mount /mnt/zyn... OK
Ego containment... STABLE
Save battery: LEAKING HISTORY

Each line animates with either typing effects, animated dots, or a simulated ASCII progress bar. None of it is necessary. All of it is beautiful.

The sequences are randomized. Each has its own vibe: 3D printing chaos, bootleg heroics, resin envy. It's a playable intro cutscene for a site that doesn't need one.

### CRT Boot Effect

When the terminal finishes booting, it triggers a CSS class called crt-bootup. This animates brightness, contrast, hue, and scale all at once—essentially slamming a monitor into existence like a Street Fighter intro.

Then the title card fades in with a random pixelated background. Think Windows XP if it was reimagined by a guy who loves Bepis, solder, and cursed Game Boy peripherals.

### The OS Window: Because Nothing Says "Professional Portfolio" Like a Fake Operating System

Here's the part I'm embarrassed about: I built an entire windowed OS interface. Not because anyone asked for it. Not because it improves usability. But because I saw those old Windows 95 CSS recreations and thought, "What if I made this worse?"

So now my hero section pretends to be a computer booting up, complete with:

**Window controls that actually work.** The minimize button shoots the whole window down to the bottom of the screen like it's 1998 and you just alt-tabbed out of Solitaire. The maximize button makes it 15% bigger because I couldn't figure out true fullscreen without breaking everything. The close button? Reboots the entire fake console. Because of course it does.

**A menu system nobody will use.** File, Edit, View, Help—the four horsemen of "I clicked this by accident." The File menu lets you pick which boot sequence you want. Because apparently I thought people would have *preferences* about which fake operating system loads their fake terminal. Edit has theme controls and desktop wallpapers. Five different wallpapers. For a window that's on screen for maybe 12 seconds. I spent a whole evening on this.

**Dropdown menus with submenus.** They cascade. They have hover states. They respect dark mode. They're more functional than half the navigation on real websites, and they control absolutely nothing important.

The entire thing is built in vanilla JavaScript, lives inside `OSMenuSystem` class, and accounts for roughly 300 lines of code that could have been spent on literally anything else. But now when you click Help → About, it smooth-scrolls you to my bio section. 

Peak user experience? No. Peak procrastination disguised as productivity? Absolutely.

### Glitch Animations

Glitch effects are applied on project cards via a roulette system. Every few seconds, one card gets randomly slammed with:

- **chromaBleed:** RGB offset effect like an old 3D movie without glasses
- **quickGlitch:** rapid skewing and hue shifting
- **pixelCorruption:** fake corruption overlay
- **borderFlicker:** 90s-style border seizures
- **colorShift:** hue rotations that scream "this JPEG is haunted"

This all lives inside RandomProjectEffects. It even respects motion preferences. Which is considerate, considering how hard it glitches.

### Featured Project Rotation

There's a single featured project card that changes every 20 seconds. When it switches, it glitches on purpose. Like a game cartridge that just got nudged.

You get animated warnings like:

◊ SRAM DETECTS CHAOS ENERGY ◊
◊ CARTRIDGE READ FAILURE ◊
◊ DINGUS MODULE OUT OF RANGE ◊

Then the card updates with new content. A little drama. A little chaos. Maximum toy energy.

### Twenty Keyframe Animations and Not One of Them Necessary

Let me tell you about `extremeGlitch`. Or `crtPowerOff`. Or `wallpaperChange`. Or any of the other 20+ CSS animations that exist purely because I kept thinking "but what if it did THIS?"

**`extremeGlitch`**: Makes the entire featured section have a digital seizure for 1.2 seconds. Uses every CSS filter known to man. Probably violates the Geneva Convention.

**`crtPowerOff`**: When you close the OS window, it doesn't just disappear. It shrinks vertically while brightening horizontally, exactly like turning off a CRT monitor. Did I watch slow-motion videos of old TVs shutting down to get this right? Yes. Did anyone ask for this? No.

**`dramaticGlitchWarning`**: Shows error messages that spin, scale, and hue-rotate simultaneously. Because if you're going to show a fake error, commit to the bit.

Each animation has between 5 and 15 keyframes. Some use cubic beziers I hand-tuned until they felt "right" (translation: until I got hungry and gave up). The entire animations section of my CSS is longer than most people's entire stylesheets.

Why? Because animation-duration: 0.3s wasn't dramatic enough. Now it's animation-duration: 0.3s with steps(8) so it looks properly chunky. Like God intended.

### Retro Background

Each .retro-bg element gets an animated canvas overlay. This generates:

- Moving scanlines with randomized pulse effects
- Pixel static that's thematically on-brand
- Subtle color shifts based on your system theme

It's built from scratch using canvas. And it adapts when your system switches between light and dark mode. The scanline code alone is more emotionally invested than most front-end frameworks.

### CSS: A Structured Disaster

My CSS is a mess. Not a disaster—just the kind of mess you get when one person designs the UI, writes the JavaScript, and still has opinions about which 3D printer smells the best when it's running hot.

It's got variables. It's responsive. It respects prefers-reduced-motion, which is already more than half the internet can say. But it's still a glorified text dump that reads like it was written in a caffeine fugue state and never fully recovered.

There are keyframes in there doing things I forgot CSS could even do. Some of them might be cursed. Shadows behaving like lighting gels. Border-radiuses pushed to their legal limit. And animations that feel like someone shouting HTML through a box fan.

It's not pretty. But it works. And more importantly—it's mine.

## The ASCII Art That Died: A Memorial

Want to know a secret? There's still code for an ASCII art display system just... sitting there. Like a digital appendix. It was supposed to show rotating pixel art—Game Boys, cartridges, maybe a crude rendition of my face made from pipe characters.

Here's what remains:
- `asciiDisplay` div that never displays
- `asciiGlow` animation that glows nothing  
- An entire system for cycling through ASCII drawings that don't exist

I wrote all the infrastructure first. The timing system, the fade effects, the careful monospace alignment. Then I tried to make actual ASCII art and realized I have the artistic ability of a moderately intelligent doorknob.

So it sits there. Commented out? No. Removed? Absolutely not. Just... present. Like a ghost in the machine. Sometimes I see it in the code and think "I should delete that." Then I don't. Because what if someday I learn how to draw a convincing 8-bit skull using only forward slashes?

(I won't.)

## Projects: A Monument to External Links

Here's what kills me about the projects section: it's just links. Eight cards, eight external URLs. MakerWorld, GitHub, Thingiverse. I built this whole elaborate display system for what is essentially a bookmark folder.

But the cards? They randomly glitch. They have hover states that would make a casino jealous. They're keyboard navigable. They have Schema.org microdata like they're products in an online store. Each one can theoretically display an image, even though only half do.

The featured project rotator alone is 200+ lines of JavaScript. It maintains internal state. It has a pause-on-hover system with a 3-second delay before resuming because I read somewhere that was "more user-friendly." It shows fake error messages when transitioning because I thought that was funny at 2 AM.

All of this to display "Look, I 3D printed a poop stool" with a link to MakerWorld.

The infrastructure-to-content ratio is roughly 100:1. It's like building a Formula 1 engine to power a shopping cart. But when that project card glitches from one to the next with a perfectly timed "◊ CARTRIDGE READ FAILURE ◊" warning? 

*Chef's kiss*

Completely unnecessary. Absolutely perfect.

## JS Features: Just Enough, and No More

This JavaScript doesn't hydrate, lazy-mount, or ritualistically sacrifice components. It just works. Like a microwave from 1997.

Everything lives in scripts.js—a single file that does a surprising amount without ever trying to be a system. There's no framework. No imports. No TypeScript. No bundler. Just vanilla JS, written like I meant it.

Here's what it handles:

- **Theme Toggle:** Light mode, dark mode, and memory via localStorage. No flashing, no resets, no guessing.
- **Lazy Image Loading:** Because most images are big and pointless in the best way. I don't want them loading unless they need to.
- **Smooth Scrolling with Offsets:** Anchors scroll with a little easing, accounting for the sticky header. It's the kind of detail you notice when it's broken.
- **Reduced Motion Support:** If your system says "don't animate," this site listens. No shame in going static.
- **Keyboard Navigation:** All interactive elements are tabbable. Hover states have focus states. Accessibility isn't optional—it's just how I build.

I didn't include any JavaScript I wouldn't want to read again later. There's no jQuery legacy, no third-party scripts slowing it down, no wild async waterfalls. Just the right amount to make the site feel alive.

Everything else? That's handled with HTML and CSS. Because you don't need a JavaScript framework to animate a button. You just need a little time, a little weirdness, and a little willingness to do it yourself.

## Metadata and SEO: Quietly Competent

For a site that pretends to be a haunted CRT from 1998, it's shockingly well-behaved under the hood.

Everything that's supposed to be there is there:

Schema.org JSON-LD for person, website, and project metadata

Open Graph + Twitter cards so previews actually look good when shared

robots.txt and sitemap.xml so search engines know what's going on

Canonical tags to keep things tidy

Google Analytics because I like knowing if someone visited from a 3DS browser at 3 a.m.

There are no SEO hacks, keyword stuffing, or dark patterns. Just clean markup, structured data, and a quiet confidence that the content will speak for itself. It's the same philosophy as the rest of the site: do the work, make it clean, don't shout about it.

## The Performance Optimization Nobody Asked For

Oh, and those `_headers` and `_redirects` files? Peak overthinking. 

Content Security Policy headers stricter than my childhood curfew. X-Frame-Options to prevent clickjacking on a site nobody would want to hijack. Cache controls so specific they'd make a Swiss watchmaker jealous.

The redirects are even better. I'm redirecting `/mousebitelabs*` to a GitHub repo. You know how many people have tried to visit that URL? Zero. But it's there. Waiting. Like a digital doorman at an abandoned building.

And after all that? The site gets Lighthouse scores in the 60s and 70s. That's right—I spent hours on security headers, cache strategies, and semantic HTML just to achieve a solid C+ average. 

Why? Because apparently 20 different glitch animations and a fake CRT boot sequence aren't "performance optimized." Lighthouse keeps whining about "reduce unused CSS" while I'm over here using every single one of those 1,500 lines of keyframes. It's not unused, Lighthouse. It's *waiting*.

The Performance score specifically hates my life choices. Every animation, every shadow, every `transform: skewY(8deg) rotate(-3deg)` is another point off the total. But you know what? When that boot sequence types out "Ego containment... STABLE" at exactly the right speed, performance metrics can kiss my well-cached assets.

Green circles are for people who don't name their animations `chaosStatic`. My circles are yellow-orange and they flicker occasionally. Just like nature intended.

## Why Bother?

Because I wanted to.

That's the real answer. Not because I needed a new job. Not because I had to update my portfolio. Not because I was trying to drive traffic, build a brand, or optimize my conversion funnel.

I built it because the old one didn't feel like me anymore. And if I'm going to have a personal website—one that boots, glitches, scrolls, and hums like something I would have loved to stumble across at 2 a.m. on a dial-up connection—I want it to look, sound, and behave like I made it.

The fact that I can write this much about it probably tells you everything you need to know.

This isn't a tech demo. It's not a resume. It's a place.

That's why I bothered. Because I could. Because it's fun. Because the internet is better when people build weird stuff on purpose.

## Final Thoughts (Before I Rebuild It Again)

This is the part where I'm supposed to say "I built this for personal study" or "to improve my brand" or "as a technical exercise in modern front-end development."

Nope.

I built it because I didn't like the old one anymore. Because it didn't feel like me. Because it was too safe, too plain, and too beige for the kind of dumb, chaotic joy I get from making things that absolutely no one asked for.

I break hardware now. I 3D print solutions to problems that didn't exist five minutes ago. I write Discord bots to answer questions no one's asking. That deserves a site with a little more style. A little more glitch. A little more "what the hell is this?"

I'm not selling anything. I'm not optimizing for engagement. I'm not trying to go viral. I just wanted a site that feels like something I'd stumble across at 2 a.m., forget to bookmark, and spend the next six years trying to find again.

And if I rebuild it again in six months? Good. That means I'm still making things.