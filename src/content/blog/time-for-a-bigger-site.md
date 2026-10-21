---
title: "Time for a bigger site"
summary: "The old krizdingus.com was one page and a manifesto that said \"No Astro.\" This one is built with Astro. We should probably talk about that."
description: "The old krizdingus.com came with a manifesto that said \"No Astro.\" This one is built with Astro. What changed, what stayed, and how that happened."
hero_image: "/images/blog/time-for-a-bigger-site.jpg"
hero_alt: "Three illustrated windows show krizdingus.com in light, dark, and XP modes, featuring sunshine, a crescent moon, and colorful code figures."
hero_caption: "More room for the projects, and three ways to look at them."
date_published: 2026-10-20
tags: ["meta"]
---

If you visited krizdingus.com any time in the last year and a half, you got one page. A fake computer booted up at the top and typed out nonsense like "Ego containment... STABLE," then settled into a little window called KRIZDINGUS.EXE with menus that actually opened.

I really needed *something* on the homepage. By that point I couldn't think outside the traditional hero treatment, but I didn't really have anything to put there. So I made some nonsense to show off instead. It actually started with the same kind of desktop wallpapers that are in XP mode now, as a hero background with an overlay and some typical "Hi, I'm an asshole" intro. I didn't want that. If I'm gonna be an asshole, I'm gonna earn it by making you wait 11 seconds for the boot animation to finish, like I did in '96. That at least has style.

That site came with a manifesto. It sat right there in the site's code and explained, at length, why everything was built the way it was. Under "The Stack: Light but Real," I wrote, with my whole chest:

> No React. No Vue. No Astro. Not even jQuery.

This site is built with Astro.

I redid my website, and I needed *some* blog content to have a blog. I figured there's probably a story in redoing my site in direct contradiction to all that.

## Scoring the old list

React, still no. Vue, still no. jQuery, still no. Astro... well, you know. Three out of four isn't terrible, unless you keep reading the old manifesto, which also bragged about "No imports. No TypeScript. No bundler." Those all came in too. Who's counting? Not me.

The old stack was, in the manifesto's words, "a cold sandwich eaten over a workbench, standing up." I just didn't want to mess with a big ole tech stack. I had *just* come off a rebuild of a major website. Slim team, small budget, and high expectations from stakeholders who didn't really know what they wanted, other than "a new website" that "looks good and does SEO." After meetings upon meetings, I just wanted to be able to make a decision, or for once be the stakeholder holding up the project.

So I built a stupid retro-computer-ish website full of glitches that Lighthouse cusses at. I didn't want to deal with a database, or SQL, or any of that. I barely wanted to click around in Cloudflare. At the same time, I wanted to make the best damn one-page website I could, to impress myself and no one else.

## Why it needed a bigger one

The trouble was the projects. The old manifesto had a whole section about them called "Projects: A Monument to External Links." Eight cards, eight links off to MakerWorld or GitHub or Thingiverse, plus a featured-project rotator that ran 200-some lines of JavaScript, all so you could be told "Look, I 3D printed a poop stool" and sent somewhere else to read about it.

I used to carry two websites, both one-page lists of links. One was for krizdingus stuff, which at the time was mostly Game Boy modding. The other, kwilliams.me, was essentially a list of websites I'd built and what skills I had at the time. I didn't just want to build another dumb portfolio website. Hell, the whole idea of a bare one-page site came from another developer, an old friend from college. His site is literally just a list of links to articles and projects and socials. Mine had a bit more pizazz. We were always different like that. Anyway, I didn't want to keep doing what he was doing (poorly, and yet somehow with more code) anymore either.

I had a blast building krizdingus.com, and when I was done I fully intended to redo the other one. But by then I didn't want to. I just redirected the domain here. Abandoned the mailbox too. I didn't care. That was kinda dumb in hindsight. I was going through some stuff.

kwilliams.me redirects to [krizdingus.com/web/](/web/) now. The email deliverability is also fixed.

I originally didn't care for having a big detailed portfolio site because I felt a lot of "portfolio" websites are a lot of bells and whistles without real content. I knew that if I wanted to do it right, I'd have to set some time aside to do *some* sort of write-ups. So maybe staying committed to a one-page website wasn't all design philosophy, but cope for my lack of will to build a more serious website.

I started writing about a year and a half ago. I wanted to publish it, and frankly I'm glad I didn't, because it was awful. But the one-page site really didn't cut it. So I considered doing a WordPress site. I'm an expert in it, after all, with however many years of experience. But I just didn't want to, and I felt this was an opportunity to flex my talents in other things. Other frameworks and whatnot. So I researched, and Astro came back the winner. Ghost was the other option.

In plain terms, Astro takes a folder of text files and some templates and builds finished pages out of them before anyone visits. What you download is plain HTML and CSS with a little JavaScript.

One line from the manifesto survived the switch completely: "If I want to update a project, I open a text file and type words like it's 1998." Every project and every post on here is still a text file. There's just a robot now that turns them into pages.

Anyway, now the website has a blog and can feature write-ups on my projects, web work, creative writing, and eventually more if I decide to add new media types and stuff. Probably not.

## What happened to the glitching

The old site booted at you whether you wanted it to or not. Now the default is normal mode, which is just pages, text and pictures. As for the pixels drifting in the margins, maybe I just have a problem with letting negative space just be negative, so I like to cheer it up with confetti stuff, like some sort of Bob Ross with an IDE.

The fake computer didn't go anywhere, though. It grew up into XP mode, a Windows XP-style desktop you can switch on, with windows, a taskbar, a Start menu and a boot screen. Why XP? That's when I was on the computer the most, and it's when the internet really took off for everybody.

Windows XP came out in October 2001. I remember being stoked about it in my PC Repair class. I don't even remember exactly what about, but the other nerds were super hyped, so I was hyped too. I do remember expecting it to be better than Windows 98, but aside from the looks, the speed and how web-forward it was, I don't really recall much else.

That class was funny. We probably only did classwork 10% of the time. The other 90% of the time we were playing games, or salvaging parts from computers from across the school, which got brought to that class so we could run newer games, or just get more computers working for more people to play. We played the living hell out of Unreal Tournament, GTA 2, one of those Quake games from around then, and OG Counter-Strike. Pre-Source. Can't forget that.

For nerds and normies, Windows XP is basically the shag carpet of the '70s.

The old site's leftovers moved into XP mode: the boot sequences (one is still called Terminal Crimewave), the wallpapers, and animations with names like `chromaBleed` and `crtPowerOff`. Normal mode doesn't download any of it. Why throw away good code? I put a lot of effort into those animations, and in a way XP mode began with those CSS styles and animations from the prior site. XP mode only shows up on a wide screen with a mouse or trackpad. Phones never get it.

Some people come here for the more serious stuff, and they shouldn't have to dig through a Start menu to find it.

XP mode is a prototype toy for users and me as a dev, use as is and with caution. (It's seriously pretty stable though.) If you want to know how the switch is built, [A theme is a folder](/blog/a-theme-is-a-folder/) gets into it.

## The stuff that didn't change

It's still a static site. Static means the pages are finished files sitting on a host, and nothing runs on a server when you show up. I mean, there *was* briefly a Dockerfile, a plan to have a Node server on Railway. All that. But that ended about as quickly as it started, about the time I finished installing all the dependencies.

So it's on Cloudflare Pages, same as the old site. The manifesto described Pages as "blissfully unaware of what a Docker container is."

The section of the manifesto that said "No Astro" is the same one that praised Cloudflare Pages. In January 2026, Cloudflare announced that the company behind Astro was joining it.

Look, I'm not trying to get all political about it. I'm just a dude trying to survive and thrive on the world wide web.

There's still a light mode and a dark mode. Dark is a deep plum now, and light is warm paper.

The address `krizdingus.com/mousebitelabs` used to be for a set of labels I made for Mouse Bite Labs' Game Boy flash cartridges. The page itself was just a generic Bootstrap page with a 3D Game Boy cartridge rendered in HTML and CSS, rotating. Exciting. It wasn't bad looking, though.

By the time of the manifesto, that address only redirected to a GitHub repo, "like a digital doorman at an abandoned building." Good news for the doorman. He has a building now. That old link goes to [its own project page](/projects/mouse-bite-labs-cartridge-labels/).

The ASCII art system stayed behind in the old code. That was a whole setup for rotating pictures made out of text characters, with not a single drawing in it. I never finished it because it was difficult, and frankly really dumb on a site already full of dumb features. And Lighthouse was already pissed.

## The scores

Lighthouse is Google's tool for grading a web page on speed, accessibility and the rest. The manifesto said the old site scored in the 60s and 70s and treated that like a feature: "My circles are yellow-orange and they flicker occasionally. Just like nature intended." I did run it, and it hurt my feelings enough to write a rant about how Lighthouse is actually a total buzzkill dork.

This one scores 99 and 100 on a phone. Awesome. Take that, Lighthouse, you enemy of good times.

## Where it ended up

I love the new site. This website kinda realizes what I think I've always wanted out of my personal site. *And* I've gathered enough interesting work across my professional life and hobbies that I think I've got enough content to warrant more than a digital leaflet.

What carried over from the old manifesto is the energy behind it: fuck it, we ball.
