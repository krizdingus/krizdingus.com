---
title: "Turns out it’s not 100,000 games"
summary: "A Discord bot for looking up every Game Boy game, built over three days in May 2025. README jokes, a fix I undid and put back, and a number I can’t explain."
hero_image: "/images/blog/turns-out-its-not-100000-games.jpg"
hero_alt: "Three Game Boy cartridges sit beside a pixel magnifying glass and a chat bubble showing a searchable cartridge catalog."
hero_caption: "Around four and a half thousand games, now searchable without leaving the chat."
date_published: 2026-05-21
tags: ["game-boy", "discord"]
---

This is a story about a Discord bot that searches a list of Game Boy games, and I realize every part of that sentence might need explaining. Discord's the easy one. It's a chat app where communities run their own servers, and a bot is a program that sits in one of those servers and answers commands. The rest takes a minute.

A ROM is the game itself, the data off the chip inside the cartridge, copied into a file. No-Intro is a long-running project that catalogs those dumps and names them consistently, so the filename tells you the region and the revision. A guy who goes by Catskull took the whole No-Intro Game Boy set and turned it into one page you can search, the [GB ROM Database](https://catskull.net/gb-rom-database/). His GitHub repo describes it as "a complete list of all Gameboy games ever made."

Why would anybody need to search that? Because if you're making a reproduction cartridge, or writing a game onto a rewritable one (people call that flashing it), the title is the least of it. You want the mapper, which is the chip in the cartridge that lets the Game Boy reach more memory than it was built to see. You want to know whether it saves to a battery, whether it has a clock or rumble, whether it's a Game Boy Color game or has Super Game Boy extras. That's my crowd.

## The plan was a website

I meant to build a nicer front end for Catskull's database. His page could've been better set up for the kinds of things I wanted to search for, and frankly, I just wanted to see if I could do better. I did build one, the Flash Cartridge Assistant, a search page that sat on this site in 2024. That's the project this whole story grew out of. But plenty of people had built a search page, Catskull included. So I figured I'd better try something different and put it in Discord, since that's where the people asking those questions already are.

The [GB ROM Database Bot](/projects/gb-rom-database-bot/) answers `/dmgdb` (DMG is the original Game Boy's model number). Type `/dmgdb search zelda` and you get the title, region, mapper and the rest, with filters for all that cart stuff.

I built it over three days in May 2025, and I didn't do it neatly.

## Everything at once, some of it twice

I dumped the whole bot into its GitHub repo in one go: the search code, the Python script that builds the game list, and the game list itself, which runs about 89,000 lines. Twice. There was a file called `rom-list copy.json` sitting in the folder, and it went up right next to the real one. I took it back out a few minutes later.

The README, the page that introduces a project on GitHub, got a roadmap of things I was going to add, and most of them never happened. One item had GitHub Actions (GitHub's way of running scripts for you on a schedule) refreshing your ROM list "while you're busy pretending you're still a millennial." That night I changed it to "pretending you watch DBZ AMVs," then changed it again about thirty seconds later to just "busy watching DBZ AMVs," meaning Dragon Ball Z clips cut to music. Coming from a guy who used to make GeoCities pages about Gohan, neither version was much of a burn. There's a second millennial joke down in the disclaimer that I never touched.

## Nearly 500 games

The next day the bot got a card on my old site, which was one page with a card for each project: "Because we absolutely needed another database of nearly 500 Game Boy games to search through (but this one has filtering!)."

I think the 500 was a typo. I bumped it to 5000 that evening and labeled the fix "turns out it's not 100,000 games, who knew?" Where the 100,000 came from, I can't tell you. Nothing on that card, in the bot, or anywhere else on the old site ever said it. The bot's list has 4,469 games. Catskull's README says 4,351 unique ones once he cleared out the duplicates. So it's around four and a half thousand whichever list you trust, and nowhere near 100,000. Nearly 5000 is generous, but fine.

While we're on numbers I can't explain: the bot has a changelog, the running list of what changed in each version, and every version in it, 1.0.0 through 1.0.5, is dated March 19, 2024. That's more than a year before I wrote any of it. I probably typed 2024 when I meant 2025, but March 19 would still be two months before I started, so I've got nothing on that one.

## The share button

The thing I kept coming back to after day one was one button. When you search, the bot answers so only you can see it (Discord calls that an ephemeral message), and there's a Share to Channel button if you want everybody else to see what you found. For that to work, the bot has to remember what you searched, and it only remembered for a minute.

I'd put that button on the random game command that first evening. The next morning I fixed a "search expired" error that turned up sometimes when you shared right after searching, and part of the fix was letting a search live for 70 seconds instead of 60. Ten whole extra seconds. Then I gave the random game command the same memory, since its share button had the same problem.

That night I was after something else. Discord has to be told what commands a bot has, and you can register them to one server, which is instant, or everywhere, which can take up to an hour. I was having trouble getting that part to behave, so I added a pile of logging to figure out what was going on. Then I undid the logging and the random game fix from that morning, both at once.

The next morning I got the commands showing up in new servers again, and that was 1.0.4. Then I put the random game fix back, and that was 1.0.5. So that's the same fix three times: in, out, and back in, a little further down.

That was the end of it. It worked, and I probably got busy with something else.

It's still running. It lives on the [Mouse Bite Labs](https://mousebitelabs.com/) Discord, a very active community run by BucketMouse, who's a well-regarded maker and modder. If you're into modding Game Boys, I highly recommend that server. The bot's also on my own test server. I host it myself, and there's no public copy to invite. The code's [on GitHub](https://github.com/krizdingus/gb-rom-database-bot) if you want to run your own.
