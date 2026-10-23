---
title: "leaksmith: Fake Leaked-Document PDFs That Fool AI and Nobody Else"
summary: "A Python command-line tool that turns a markdown file into a PDF dressed up as a leaked FBI memo, photocopier wear and all. It fooled the AI it was built for. It shouldn't fool you."
seo_title: "leaksmith: fake leaked-document PDFs"
description: "A Python command-line tool that turns a markdown file into a PDF dressed up as a leaked FBI memo, photocopier wear and all. It fooled the AI it was built for."
category: "software"
tags: ["Python", "WeasyPrint", "PDF", "AI"]
hero_image: ""
gallery: []
external_url: "https://github.com/krizdingus/leaksmith"
external_label: "View on GitHub"
date_published: 2025-07-02
featured: false
status: "live"
draft: false
exe_name: "LEAKSMITH.PY"
crt_glyph: "PDF"
license: "MIT"
field_report:
  source: "GitHub"
  captured: 2026-10-20
  stars: 1
---

leaksmith is a little Python command-line tool that makes fake leaked government documents. You write the memo in markdown, the plain-text format GitHub READMEs are written in, and leaksmith lays it out like an FBI memo and saves a PDF. Add `--distress` and it ages the pages too: grain, blur and scanner streaks, like the thing's been through a bad office copier a few times.

The audience is AI, not people. Specifically NotebookLM, Google's tool that reads your documents and can turn them into a podcast with two AI hosts.

## Why

A friend of mine was playing around a lot with Gemini, because his work was paying for it, and he threw an article from Wookieepedia, the Star Wars wiki, into NotebookLM, and it created a podcast where these podcasters were talking about the article. You're supposed to be able to give it your notes. At least that's how it was pitched to me, that you could throw all your notes into it and then listen back to it like a podcast, which seemed, honestly, like a pretty cool way of studying, I guess.

I found the podcast funny because these guys were talking about the Star Wars article like it was a legitimate source. Well, maybe not super legitimate, but the way they were talking about it, just with complete sincerity: And it says here in the article that blah blah blah.

At the time, I had been writing ridiculous conspiracy nonsense, over-the-top stuff, just sarcastically. So I threw in a stupid article I was working on about how Donkey Kong was actually inspired by an old labor dispute. It was called "Donkey Kong Was Real, and He Was a Union Buster." I was disappointed when the podcasters obviously picked up on the humor and the absurdity of it, even though I was writing it pretty straight-faced. Everything they were saying was very wink-wink, nudge-nudge. You could hear the winking at the camera through the audio. And it got me thinking, well, maybe I can fool them.

Frankly, figuring out how to fool the AI was the easy part. I had done a few tries myself just manually, writing up something and running some grunge filters over it in Photoshop and making it look like it had come from the FBI, and that worked. So of course anyone could do that. I felt like making a command line tool. I'd never made one before. I liked the idea of just being able to take one of my Markdown files, some notes I had scratched out on something stupid, and turning that into some dubious FBI briefing or something. I was just bored, okay?

## Markdown in, PDF out

The memo is a markdown file with a few labeled lines at the top for title, agency, classification and date. This is the top of the sample in the repo:

```markdown
---
title: "Kerrigan Initiative: Phase I Consolidation"
agency: "Federal Bureau of Investigation"
classification: "UNSECRET"
date: "30-05-2011"
---
```

leaksmith fills those into an FBI template, Courier New with a red classification box in the corner, and WeasyPrint turns the result into a PDF. With `--distress` it then turns every page into an image, adds noise, a little blur and a few random lines, and stitches the images back into a PDF. There's no text left to select after that. Whatever reads it is reading a picture of a memo.

```bash
leaksmith render run --input memo.md --template fbi --output leaked.pdf --dpi 150 --distress
```

More typing than it needs, but whatever, it works.

The Kerrigan memo is about a phonics program for kids, and one of the problems it reports is students overheard chanting "Take No Prisoners" at spelling bees. The sample memo is one of the ones that was used in NotebookLM. I'm not sure why the robots fall for it, but they do. My friend and I had a great laugh. It was his account we were wasting the credits on.

## Setup

Everything about it was a pain. Everything. WeasyPrint was annoying. ImageMagick was annoying. Trying to figure out all the dependencies I would need, not really knowing anything about what I was doing going in.

It needs Python 3 and WeasyPrint, plus `pdftoppm` (from Poppler) and ImageMagick 7 for the distress step. The README has the setup for Mac and Linux.

## Where I'm leaving it

There's a roadmap in the README, but I've accomplished what I wanted to do. I got the laughs out of it that I wanted to, and I learned a bit about writing your own little command-line tools. More agency templates are a maybe, if I ever figure out what a CIA or NSA memo is supposed to look like.

It's MIT licensed, so the code's yours to mess with. Just don't use it to fool people who matter.
