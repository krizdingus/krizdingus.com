---
title: "GB ROM Database Bot"
summary: "A Discord bot I host myself that looks up any of 4,469 No-Intro Game Boy entries from one slash command, with fuzzy search and filters for region, battery and the rest of the cart details."
description: "A Discord bot I host myself that looks up any of 4,469 No-Intro Game Boy entries from one slash command, with fuzzy search and filters for the cart details."
category: "bot"
tags: ["Discord", "Node.js", "Python", "Game Boy"]
hero_image: ""
gallery: []
external_url: "https://github.com/krizdingus/gb-rom-database-bot"
external_label: "View on GitHub"
date_published: 2025-05-23
featured: false
status: "live"
draft: false
exe_name: "GB-ROM-BOT.EXE"
crt_glyph: ">_"
field_report:
  source: "GitHub"
  captured: 2026-10-20
  stars: 2
---

This is a Discord bot for looking up Game Boy games. The bot tells you nothing about how to put one on a flash cart, a cartridge you write games onto yourself. What it gives you is all the information that can be gathered from the Game Boy ROM headers, the block of details built into every game file. Where this comes in handy for people flashing these to flashable cartridges is understanding the RAM and ROM size. It searches 4,469 entries from the No-Intro Game Boy sets, betas and homebrew included.

## Why

It started with Catskull's GB ROM Database. I just wanted to see if I could do better than what he did. Or at least maybe that may be an arrogant way of saying it. I had different ideas on how the interface should work.

I did build one: the Flash Cartridge Assistant, a search page that lived on this site in 2024. But something like 39 other people had built a search page too, including Catskull. If I'll be real, I think this is kind of a dumb bot, something that doesn't need to be a bot. But at the time, I just kind of wanted to make a Discord bot. So the next version went where the Game Boy people already are, which is Discord, talking about mappers.

## Slash commands

Type `/dmgdb search zelda` (DMG-01 was the original Game Boy) and you get an embed, Discord's little formatted card, with the title, region, mapper, ROM and RAM size, and hardware flags, plus buttons to page through results.

Results come back just for you, with a Share to Channel button, so it wouldn't spam the channel. But then it wouldn't do it. That's where it would break. A search only stayed saved for a minute, so taking longer than that to hit Share got you "Your search has expired." And `/dmgdb random` didn't save anything, so its Share button never worked at all.

When Bucket Mouse first added it to his server, it wasn't working right. I was a little embarrassed. I didn't exactly know what I was doing. It was the first time I'd made a bot, so I had to figure that out.

## Self-hosted

There's no public bot to invite. Mine runs on the Mouse Bite Labs Discord, a busy server run by Bucket Mouse (I made [labels for his flash cart boards](/projects/mouse-bite-labs-cartridge-labels/)), and on my own test server. I'm flattered that he added it to his Discord. If you're into Game Boy modding, you should be in there.

Anywhere else, you run your own copy. The README has the setup.

## Roadmap

There's a roadmap in the README, and I called it wildly optimistic, "because who the hell knows when I'll get around to doing it?" I don't think this is going to go further than this. But all six people that might be stoked on this will probably be pretty happy with what it is. It's kind of what happens when you're allowed to pursue whatever you want to do. And sometimes what you want to do is very niche.
