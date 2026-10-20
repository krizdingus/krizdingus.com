---
title: "Time for a bigger site"
summary: "The old krizdingus.com was one page, one giant scripts.js, and a manifesto that said \"No Astro.\" This one is built with Astro. We should probably talk about that."
description: "The old krizdingus.com came with a manifesto that said \"No Astro.\" This one is built with Astro. What changed, what stayed, and how that happened."
hero_image: "/images/blog/time-for-a-bigger-site.jpg"
hero_alt: "Three illustrated windows show krizdingus.com in light, dark, and XP modes, featuring sunshine, a crescent moon, and colorful code figures."
hero_caption: "More room for the projects, and three ways to look at them."
featured: true
date_published: 2026-10-20
tags: ["meta"]
---

If you visited krizdingus.com any time in the last year and a half, you got one page. A fake computer booted up at the top and typed out a bunch of nonsense like "Ego containment... STABLE," then settled into a little window called KRIZDINGUS.EXE with menus that actually opened. Under that was a featured project that glitched every time it changed, a grid of more project cards, and an about section. Every card linked off to somewhere else.

That site came with a manifesto. It was called `PHILOSOPHY.md`, it sat right there in the site's code, and it explained at length why everything was built the way it was. One section was called "The Stack: Light but Real," and in it I wrote, with my whole chest:

> No React. No Vue. No Astro. Not even jQuery.

This site is built with Astro.

So yeah. Let's talk about that.

## Scoring the old list

React, still no. Vue, still no. jQuery, still no. Astro... well, you know. Three out of four isn't terrible, unless you keep reading the old manifesto, which also bragged about "No imports. No TypeScript. No bundler." Those all went too. If you're keeping score at home, it's not looking great for past me.

In my defense, the manifesto was about a one-page site, and a one-page site really doesn't need anything. It's a list. The old stack was, in its own words, "a cold sandwich eaten over a workbench, standing up," and for a list, a cold sandwich is plenty.

The problem was the list. The old manifesto even admitted it, with a whole section called "Projects: A Monument to External Links." Eight cards, eight links to MakerWorld or GitHub or Thingiverse, and a featured-project rotator that was 200-some lines of JavaScript, all so you could be told "Look, I 3D printed a poop stool" and sent somewhere else to actually read about it.

## Why it needed a bigger one

The one-page idea was fine. It was just time for a bigger site.

Now every project gets its own page, with the writeup, the photos, the print settings, and the parts that went wrong. There's a blog, which you're reading. And there's a page about the web work I do for a living, which used to be a whole separate site. I don't keep that one anymore. It's all just this site now.

That's a lot of pages, and the old way of doing things was one HTML file and a `scripts.js` that ran to 1,863 lines. Doing all of this by hand would've gotten ugly fast.

Which is where Astro comes in. In plain terms, it takes a folder of text files and some templates and builds the pages out of them ahead of time, on my computer. What you download is finished HTML and CSS, the same kind of plain files the old site was. Astro just does the tedious part before you ever show up.

The funny thing is, my favorite line from the old manifesto survived the switch completely: "If I want to update a project, I open a text file and type words like it's 1998." Still true. Every project and every post on here is a text file. There's just a robot now that turns them into pages.

## What happened to the glitching

The old site was loud by default. You showed up and it booted at you, whether you wanted that or not.

Now the default is normal mode, which is just the site: pages, text and pictures. It works fine with JavaScript turned off, and mostly it sits still. The one thing that moves is a field of little pixels drifting in the margins, and only if your screen is wide enough to have margins.

The fake computer didn't go anywhere, though. It grew up into XP mode, a whole Windows XP-style desktop you can switch on, with windows, a taskbar, a Start menu and a boot screen. Why XP? That's when I was on the computer the most, and it's when the internet really took off for everybody. For nerds and web people, Windows XP is basically the shag carpet of the '70s.

The old site's leftovers moved in there too: the boot sequences (one of them is still called Terminal Crimewave), the wallpapers, the scanlines, and the animations with names like `chromaBleed` and `crtPowerOff`. Normal mode doesn't even download any of that. It only loads when you pick XP mode from the menu next to the light and dark settings, and that option only shows up on a wide screen with a mouse or trackpad. Phones never get it.

Why flip it around? Plenty of people have done the fake-desktop gimmick by now, so it's not exactly new, and not everybody's into it. Some people come here for the more serious stuff, and they shouldn't have to dig through a Start menu to find it. So the default is the version that gets the information across, and the desktop is there for the people who want it. If you want to know how that switch is built, [A theme is a folder](/blog/a-theme-is-a-folder/) gets into it.

## The stuff that didn't change

It's still a static site. Static means the pages are finished files sitting on a host, and nothing runs on a server when you show up. Okay, full honesty: for a while in the middle of all this, there was a server, and a Dockerfile, and the whole deal. That's extra funny, because the old manifesto described Cloudflare Pages as "blissfully unaware of what a Docker container is." It didn't last. It's back on Cloudflare Pages, as plain files, where the old site lived the whole time.

There's still a light mode and a dark mode. Dark is a deep plum now, light is warm paper, and each section of the site gets its own color.

I'm still overthinking the `_redirects` file. The old manifesto made fun of me for sending `/mousebitelabs` to a GitHub repo nobody had ever visited, "like a digital doorman at an abandoned building." Good news for the doorman. He has a building now. That old link goes to its own project page.

The ASCII art system didn't make the move, though. That was a whole setup for rotating pixel art, with the timing and the fade effects all done, and not a single drawing, because, in the old manifesto's words, I have "the artistic ability of a moderately intelligent doorknob." It sat in the old code doing nothing, and it stayed there. I don't think anybody will notice.

## The scores

The old manifesto had a lot to say about Lighthouse, which is Google's tool for grading a web page on speed, accessibility and the rest. The old site scored in the 60s and 70s, and the old manifesto treated that like a feature. "My circles are yellow-orange and they flicker occasionally," I wrote. "Just like nature intended."

This one scores 99 and 100 on a phone. Turns out the trick was not making everybody download every glitch animation I've ever written just to look at a list. My circles are green now. I don't know what to tell you.

The analytics changed too. The old site ran Google Analytics. This one uses Cloudflare's, which counts visits without cookies and without following you around the internet.

## Six months, give or take

The old manifesto ended with "And if I rebuild it again in six months? Good. That means I'm still making things."

It was more like a year and a half. Close enough.

Most of that old write-up was about a one-page site, so most of it doesn't apply anymore. What carried over is the energy behind it, which comes down to fuck it, we ball. That's still how this one got made, just with more pages and, apparently, Astro.
