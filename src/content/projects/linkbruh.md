---
title: "linkbruh: a Discord Bot That Fixes X and Instagram Embeds"
summary: "A side-project Discord bot that fixes X and Instagram links so the video actually plays in the chat."
seo_title: "linkbruh: a Discord bot that fixes embeds"
description: "A side-project Discord bot that fixes X and Instagram links so the video actually plays in the chat, instead of everyone clicking out to a login wall."
category: "bot"
tags: ["Discord", "Node.js"]
hero_image: ""
gallery: []
external_url: "https://github.com/krizdingus/linkbruh"
external_label: "View on GitHub"
date_published: 2026-06-01
featured: false
status: "live"
draft: false
exe_name: "LINKBRUH.EXE"
crt_glyph: "DSC"
field_report:
  source: "GitHub"
  captured: 2026-10-20
  stars: 0
---

Someone posts an X link in Discord. Discord shows a gray box. Everyone clicks through, gets a login wall, comes back, and asks what it was. linkbruh is a small bot that fixes that. I built it for a server where my friends and I share a lot of links. We got annoyed with how X and Instagram links showed up and just wanted to watch them right there in the chat. (If you've never used Discord, it's chat rooms called servers, split into channels, and a bot is a member of the server that's really a script.)

Embed proxies are sites that stand in for X and Instagram and hand Discord a preview it can play. Swap the domain, x.com to vxtwitter.com, and the video shows up. The bot does the swapping so nobody has to remember to.

It posts the fix through a channel webhook, a way for a program to post under any name and picture it wants, which is how it carries the original poster's name. Then it deletes the original so the channel isn't two links deep in every conversation. If the original poster doesn't want the repost, they react with ❌ and it's gone. Profile links and links already on a proxy get left alone.

X videos get the proxy link. Instagram posts get downloaded and uploaded as attachments, video or photos (up to ten for a carousel), with the original link along for anyone who wants the app.

## Proxies and permissions

Proxy domains live in a priority list per service at the top of `src/config.js`. Before posting, the bot probes the candidates and uses the first one that actually serves a video, so when a proxy dies, it gets skipped automatically. Instagram proxies churn constantly; when embeds stop working, move a current one to the front of the list.

Since Instagram fixes are attachments, the bot needs Attach Files permission or every Instagram post fails with a Missing Permissions error. Discord packs a bot's permissions into one number in its invite link, and the README has the full integer and a table of what each bit is for, plus the warning that kicking the bot deletes its role and you have to re-invite with the full value. It's a lot of permissions for a bot that fixes links, but each one's doing something.

## What it can't fix

Private, age-restricted, or deleted Instagram posts. Instagram only serves those videos to a logged-in, age-verified session, so there's nothing public to fetch. In that case the bot leaves the original alone and posts a short note that deletes itself after about 12 seconds. Same if a proxy can only produce a reel's cover frame instead of the video, or the reel is over Discord's 25 MB upload limit for a non-boosted server.

## Your bot, your token

You run it yourself. Node 20.18 or later, a bot token (the key it logs in with) in `.env`, and Message Content Intent turned on in the Developer Portal, since without it the bot can't read what people post. `npm start`. `npm test` for the tests. The README also covers deploying it on Railway.
