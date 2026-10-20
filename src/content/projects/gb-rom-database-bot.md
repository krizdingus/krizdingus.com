---
title: "GB ROM Database Bot"
summary: "A Discord bot I host myself that looks up any of 4,469 No-Intro Game Boy titles from one slash command, with fuzzy search and filters for mapper, region and the rest of the cart details."
description: "A Discord bot I host myself that looks up any of 4,469 No-Intro Game Boy titles from one slash command, with fuzzy search and filters for the cart details."
category: "bot"
tags: ["Discord", "Node.js", "Python", "Game Boy"]
hero_image: ""
gallery: []
external_url: "https://github.com/krizdingus/gb-rom-database-bot"
external_label: "View on GitHub"
date_published: 2025-05-21
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

Say you want to put a Game Boy game on a flash cart, a cartridge you write games onto yourself. That's called flashing, and the title's the easy part. You also need the mapper, the chip that swaps pieces of a big game in and out because the Game Boy can only look at a little of it at a time. Boring stuff, and exactly the stuff you need.

This bot looks it up from inside Discord, where communities run their own servers, basically big group chats, and a bot is an account that answers commands. It searches 4,469 titles from the No-Intro Game Boy set. No-Intro catalogs dumped cartridges, the game files people call ROMs, under consistent names.

It started as a plan to build a nicer front end for Catskull's GB ROM Database. I thought his search could work better for the stuff I look up, and honestly I wanted to see if I could beat it. I did build one: the Flash Cartridge Assistant, a search page that lived on this site in 2024, and it's the project that eventually turned into this bot. But something like 39 other people had built a search page too, including Catskull. So the next version went where the Game Boy people already are, which is Discord, arguing about mappers. The three days of building it are [their own story](/blog/turns-out-its-not-100000-games/).

## Slash commands

Type `/dmgdb search zelda` (DMG-01 was the original Game Boy) and you get an embed, Discord's little formatted card, with the title, region, mapper, and hardware flags, plus buttons to page through results. Fuzzy matching means typos and partial titles still land, and titles get normalized so “,&nbsp;The” ends up where a person would put it. Filters cover the things that matter when you're building or flashing a cart:

- Region, including multi-region and unlicensed tags
- Mapper type (MBC1, MBC3, MBC5, and the weird ones)
- Game Boy Color and Super Game Boy support (the Super Game Boy plays Game Boy games on a Super Nintendo)
- Battery, timer, and rumble
- Sorting

They stack: `/dmgdb search query:Pokemon region:Europe mapper:MBC3 battery:true`.

`/dmgdb random` rolls a game with the same filters, `/dmgdb help` explains itself, `/dmgdb about` tells you who to blame. Box art comes from libretro-thumbnails.

## How it's built

The database is generated, not hand-maintained. A Python script reads the No-Intro dump headers from the Myrient archive and writes `rom-list.json`. The bot loads that on start, or generates it if it's missing, and `npm run update-roms` refreshes it and hot-reloads the index without a restart. Search is Fuse.js. The rest is discord.js slash commands, handlers for search, random, and button pagination, and a `utils/regions.js` full of the regex it takes to turn No-Intro filenames into something a human would read. There's also a regex that inserts zero-width spaces after periods in titles. Don't ask me to read any of it out loud.

## Self-hosted

There's no public bot to invite. Mine runs on the Mouse Bite Labs Discord, a busy server run by BucketMouse (I made [labels for their flash cart boards](/projects/mouse-bite-labs-cartridge-labels/)), and on my own test server. If you're into Game Boy modding, you should be in there.

Anywhere else, you run your own copy: Node 16.9 or later, Python 3 for the fetch script, and a bot token, which works like a password for your bot. Register commands to one server while you're testing, since going global can take up to an hour.

## Roadmap

There's a roadmap in the README that I called wildly optimistic at the time, "because who the hell knows when I'll get around to doing it?" Natural-language queries, saved searches, an auto-updating database via GitHub Actions. None of those has happened. The bot works.
