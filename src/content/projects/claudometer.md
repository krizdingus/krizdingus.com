---
title: "Claudometer: a Claude Code Usage Monitor on a $15 ESP32 Display"
summary: "A little touchscreen for your desk that shows your Claude Code session burn, weekly caps and per-model spend. It runs on a $10 to $15 Cheap Yellow Display and reads local logs, so no cloud service and no API key."
seo_title: "Claudometer: a Claude Code usage monitor"
description: "A $10 to $15 ESP32 touchscreen for your desk that shows Claude Code session burn, weekly caps and per-model spend, read from local logs. No cloud, no API key."
category: "hardware"
tags: ["ESP32", "Go", "PlatformIO", "Claude Code"]
hero_image: ""
gallery: []
external_url: "https://github.com/krizdingus/claudometer"
external_label: "View on GitHub"
date_published: 2026-05-14
featured: false
status: "live"
draft: false
exe_name: "CLAUDOMETER.EXE"
crt_glyph: "ESP"
cost: "$10–15 for the display"
license: "MIT"
languages: ["Go", "C++"]
links:
  - label: "Homebrew tap"
    url: "https://github.com/krizdingus/homebrew-tap"
field_report:
  source: "GitHub"
  captured: 2026-10-20
  stars: 0
---

Claudometer is a small touchscreen for your desk that shows how much of your Claude Code usage you've burned through. Claude Code is Anthropic's coding assistant that runs in a terminal, and its plans come with limits: a five-hour session block, plus weekly caps on top of that. I wanted to see where I stood without giving up screen space to yet another menu bar item. Something physical on the desk that I can glance at the way you glance at a fuel gauge.

It ended up as a $10 to $15 dev board. The board is built around an ESP32, a cheap little chip with WiFi built in, and has a touchscreen on it. A small program on your computer feeds it the numbers.

## Seven screens

All swipeable:

- **Home**: current session burn (how much of the five-hour block you've used) as the big number, weekly cap under it, today's tokens and spend at the bottom
- **Session**: an arc for the current five-hour block and time until it resets
- **Budgets**: the all-models weekly cap, the Opus-only cap, plan tier, reset countdown
- **Models**: today's spend in dollars, then per-model token bars for Opus, Sonnet and Haiku
- **Routines**: your scheduled routines, their status, and recent runs
- **Settings**: theme, brightness, carousel on or off. Persists across reboots
- **Device**: hostname, IP, WiFi signal, firmware version, daemon health

A status bar shows plan, clock, and whether the daemon is alive. With the carousel on, the data screens rotate every ten seconds and pause for thirty after you touch anything. Settings and Device stay out of the rotation. Long-press anywhere to wipe the pairing and start over.

## A daemon and a display

The daemon is the background program on your computer. It's written in Go, runs on your Mac or Linux box, and reads the JSONL logs Claude Code already writes to `~/.claude/projects/` (JSONL is just a text file with one record per line). So there's no cloud round trip, no API key, and nothing leaves your LAN. The display polls the daemon every few seconds over WiFi and draws.

The hardware is the ESP32-2432S028R, sold on AliExpress, Amazon, and eBay as the "Cheap Yellow Display," CYD for short: a 240×320 ST7789 panel with resistive touch and a micro-USB port. Other ESP32 boards with a 240×320 TFT will probably work with pin changes in `firmware/src/pins.h`. I haven't tried any.

## Four commands

The daemon installs through Homebrew, which installs command-line software on macOS and Linux: macOS 12 or later, or any modern Linux with Homebrew. It builds from Go source, and Homebrew pulls Go in for you.

```bash
brew tap krizdingus/tap
brew install claudometer
brew services start claudometer
claudometer add-device
```

The `brew services` line registers the daemon as a launchd or systemd-user service, which keeps it running across reboots. Then plug the board in over USB and run `add-device`. It finds the board, flashes the firmware (the program the board itself runs) if it isn't there yet, asks for your WiFi and your plan tier (`free`, `pro`, `max-5x` or `max-20x`), and pushes all of it to the board. When the home screen appears, unplug it and put it wherever.

After that:

- Plan tier changes are one command: `claudometer set-plan max-5x`
- Firmware updates need the cable again: `claudometer add-device --reflash` keeps your pairing and WiFi. No over-the-air updates yet

The README has the rest (upgrades, cap overrides).

## What it doesn't do

It doesn't track Claude.ai chat usage, because there's no official API for it and the workaround is cookie-paste auth, which is too fragile to ship. It doesn't send commands to Claude. It's a read-only display. Host side is macOS and Linux only for now. The roadmap lists OTA updates, a browser setup page, prebuilt binaries, and a Windows installer.

MIT licensed. The firmware is a PlatformIO project, if you want to build it yourself.
