---
title: "Dingus Game Kart: a 3D-Printable Game Boy Cartridge Shell"
summary: "A printable Game Boy cartridge shell plus a Photoshop label template. Only tested with SLS, the laser printing you’d get from a print service. Don’t try this one on a home filament printer; I made a separate shell for that."
seo_title: "Dingus Game Kart, a printable Game Boy shell"
description: "A printable Game Boy cartridge shell with a Photoshop label template. Only tested with SLS printing from a print service, not on a home filament printer."
category: "3d-print"
tags: ["3D Print", "Game Boy", "SLS", "Shapr3D"]
hero_image: "/images/projects/dingus-game-kart/turntable-frame.webp"
gallery:
  - src: "/images/projects/dingus-game-kart/turntable-frame.webp"
    alt: "A gray 3D render of the Dingus Game Kart shell at an angle: a large recessed label area covering most of the front, grip ridges on both sides, and three small arrow marks on the lower right side."
    width: 600
    height: 600
external_url: "https://github.com/krizdingus/dingus-game-kart"
external_label: "View on GitHub"
date_published: 2024-09-01
featured: false
status: "live"
draft: false
exe_name: "DINGUS-KART.EXE"
crt_glyph: "GB"
license: "CC BY-NC-SA 4.0"
links:
  - label: "FDM-Friendly Game Boy Cartridge"
    url: "https://krizdingus.com/projects/fdm-friendly-gameboy-cartridge/"
field_report:
  source: "GitHub"
  captured: 2026-10-20
  stars: 1
---

This is the plastic case for a custom Game Boy cartridge, plus a label template so the finished cart gets a proper label instead of bare plastic.

The repo has:

- `dingus-kart_FRONT.stl` and `dingus-kart_BACK.stl`, the two halves of the shell (STL is the standard format for 3D models)
- `dingus-kart_label-template.psd`, a Photoshop file
- A 360-degree turntable GIF of the shell

Two days after it went up, I adjusted the fit of the top tabs, added a small nub on the back to help keep the circuit board in place, and thickened the screw post.

## Read this before printing

The walls are thin in places, too thin for an FDM printer, the type that melts filament, to lay down cleanly. If you send it to a print service, pick SLS, where a laser fuses powdered plastic. If you want to print a shell at home tonight, use the [FDM-Friendly Game Boy Cartridge](/projects/fdm-friendly-gameboy-cartridge/) instead. It drops the surface detail to make the walls printable, and it's on MakerWorld with my print settings already saved.

## The label

Print it on adhesive paper and round the corners at a 2 mm radius. Square corners won't fit inside the cart's rounded ones. The template uses Univers Condensed, which ships with a lot of Windows software but which I can't include. Oswald Bold from Google Fonts is the stand-in.

## If you improve it

CC BY-NC-SA 4.0. Pull requests (GitHub's way of sending me your changes) are open if you improve the shell.
