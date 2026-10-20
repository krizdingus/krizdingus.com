---
title: "GBC Palette Editor for macOS"
summary: "A Mac app for editing the .pal palette files used in Game Boy Color colorization romhacks. It’s my take on toruzz’s Windows utility, for people who don’t want to run it under Wine."
description: "A Mac app for editing the .pal palette files used in Game Boy Color colorization romhacks. My take on toruzz’s Windows utility, without the Wine."
category: "software"
tags: ["Game Boy", "Romhacking", "macOS", "Electron", "TypeScript"]
hero_image: "/images/projects/gbc-palette-editor/palette-edit-light.webp"
gallery:
  - src: "/images/projects/gbc-palette-editor/palette-edit-light.webp"
    alt: "The GBC Palette Editor window in light mode with example.pal open: a grid of 32 color swatches, a raw-bytes hex view with two bytes highlighted, RGB sliders for color 6, and Undo, Copy .db, Import Image and Paste Image buttons."
    width: 752
    height: 572
  - src: "/images/projects/gbc-palette-editor/palette-edit-dark.webp"
    alt: "The same GBC Palette Editor view in dark mode."
    width: 752
    height: 572
external_url: "https://github.com/krizdingus/gbc-palette-editor"
external_label: "View on GitHub"
date_published: 2026-03-26
featured: false
status: "live"
draft: false
exe_name: "PAL-EDITOR.EXE"
crt_glyph: "PAL"
license: "Non-commercial"
links:
  - label: "toruzz’s original utility"
    url: "https://www.romhacking.net/utilities/1743/"
field_report:
  source: "GitHub"
  captured: 2026-10-20
  stars: 0
---

Some people take games made for the original Game Boy, the one with four shades of green, and hack color into them for the Game Boy Color. That's called colorizing, and it's a kind of romhack, a fan-made edit of a game. A big part of the job is palettes, the sets of colors the game gets to use, and this app edits the `.pal` files they live in.

Nearly every tool for it is Windows-only. That's fine if you use Windows. I don't, mostly. I wanted to try colorizing on my Mac, and the options were "run it under Wine and hope" (Wine runs Windows programs on other systems, most of the time) or "just get a Windows machine." I wasn't going to boot into Windows like it's 2003, so I started rebuilding the tools I needed, and this is the first one.

It's a recreation of toruzz's GBC Palette Editor. toruzz built the original, and his [blog](https://toruzz.com/blog) on Game Boy colorization is what I leaned on the whole time. If you're on Windows, use his.

## Swatches, sliders, raw hex

- Open, edit, and save `.pal` files
- All 32 colors of a palette block in a swatch grid, with the raw hex alongside
- Per-channel RGB editing with correct 5-bit-per-channel Game Boy Color math
- Sample colors from an image file or the clipboard
- **Copy .db**: export the current block as plain uppercase hex, no spaces, eight rows of eight bytes, ready to paste into a hex editor or patcher
- Undo and redo within a session
- Per-palette-index notes, stored in a `.notes.json` sidecar next to the `.pal` (move the `.pal` without it and the notes stay behind)
- Light and dark theme, recent files, drag-and-drop

About the 5-bit thing: each color channel (red, green, blue) only goes from 0 to 31. The common shortcut for showing that on a normal screen, multiplying by eight, comes out slightly off at the bright end, so the editor does the real conversion.

## Download

Version 1.0.0 is a signed, notarized Apple Silicon build, so macOS shouldn't throw the unidentified-developer warning at you. The zip includes the app, a short README, and `example.pal`, four palette blocks pulled from a real colorization project so you have something to poke at before touching your own files.

## Rough edges

One file at a time. Palette count is inferred from file size, so a file that isn't a multiple of 64 bytes gets a warning. It'll still load the complete blocks and keep the leftover bytes when you save. Undo history dies when you close the app. And it's Electron, a web page dressed up as a desktop app, because I'm a web developer and I was not going to learn Swift to ship a small utility. The repo includes a legal addendum from one H. Maury Spiderman, Esq., which carries no legal authority.

## Why it's shaped like this

The plan is a small set of single-purpose tools that together cover the Game Boy colorization workflow on a Mac, each one small enough to use without a tutorial. Not a full ROM hacking suite, and not trying to be one.

Free to use, modify, and share for non-commercial purposes. You cannot sell it.
