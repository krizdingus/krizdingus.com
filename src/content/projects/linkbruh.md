---
title: "linkbruh: a Discord Bot That Fixes X and Instagram Embeds"
summary: "A side-project Discord bot that fixes X and Instagram links so the video actually plays in the chat."
seo_title: "linkbruh: a Discord bot that fixes embeds"
description: "A side-project Discord bot that fixes X and Instagram links so the video actually plays in the chat, instead of everyone leaving Discord to watch it."
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

I built linkbruh for a server where my friends and I share a lot of links. (If you've never used Discord, it's group chat split into servers and channels, and a bot is a member of the server that's really a script.) We'd share links from X and Instagram, and if we wanted to look at one, we'd have to leave Discord, which could be kind of a pain if you were on a phone or just otherwise lazy. We didn't like having to open up another app to see these shares, which were largely just videos. And so we got to thinking, well, could we just build something that inlines this video?

I didn't release this to be used elsewhere, and I found out this has been done by other means. Mine was just more of a custom solution for our Discord server, and also just to see if I could build one.

## How it fixes them

For X, the fix is a domain swap. Sites like vxtwitter.com and fxtwitter.com stand in for X and hand Discord a preview that actually plays, so x.com becomes vxtwitter.com and the video shows up. Before it posts, the bot checks which of those sites is really serving the video right now. Tweets without a video get left alone.

Instagram doesn't get a proxy link. The bot downloads the post and uploads it to the chat as a file, video or photos, up to ten at a time. Initially I was having difficulty with Instagram just pulling cover stills, so every time we would test it, we weren't getting videos, we were just getting the single preview image, the cover still. Now if all it can find for a reel is the still, it won't post it.

When you post a link in there, the bot gets the link. It actually removes your comment if it's able to actually post it. And then it replaces your comment with the embedded video or post, attributed to you, with the original source link.

## Hit and miss

It's still running today. It is very hit and miss with Instagram video. And a lot of it has to do with Discord's limits for free servers. And none of us are trying to pay for it. So it fails a lot. Essentially anything over 10 megabytes fails. For maybe 2 weeks we had premium features on the server just to see if it would work. And it did. It did work more consistently. There were still failures that I chalk up to possibly having something to do with account privacy. But I never looked into those.

Private and age-restricted posts never work, since Instagram only shows those to someone who's logged in. If it fails, it leaves your original post, and then it leaves the "couldn't fix this one." comment there for like 12 seconds, and then that goes away. I haven't gone back to write very many fallbacks beyond that. Which is annoying, the more I see it, but it's a small Discord channel with like 6 dudes in it.

## Run your own

There's no public invite, so you run it yourself. Whatever's on GitHub is the newest version. I may not have updated the README very well. I should. You'll need:

- Node 20.19 or later
- a bot token in `.env`
- Message Content Intent turned on in the Developer Portal, or the bot can't read the links
- the invite permissions listed in the README. Instagram needs Attach Files, and without Manage Webhooks and Manage Messages the bot replies with the fix instead of reposting.

Then `npm start`, and `npm test` for the tests. The README also covers deploying it on Railway.
