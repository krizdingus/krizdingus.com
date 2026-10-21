---
title: "Robots saw right through that shit"
summary: "NotebookLM will turn your documents into a podcast with two AI hosts. A fake memo out of Google Docs didn't fool them, so I wrote a Python tool that makes fake memos look photocopied, and the next one did."
description: "NotebookLM turns your documents into a podcast with two AI hosts. A fake memo didn't fool them, so I wrote a tool that makes memos look photocopied."
hero_image: "/images/blog/robots-saw-right-through-that.jpg"
hero_alt: "A photocopier turns a clean memo into a worn, creased copy while two microphones and a waveform represent the AI podcast hosts."
hero_caption: "Same fake memo. A few more trips through the copier."
date_published: 2026-07-02
tags: ["code", "ai"]
draft: true
---

Okay, so if you've never messed with NotebookLM: it's a Google tool where you upload your documents, PDFs, web pages, whatever, and it reads them for you. You can ask it questions about your stuff. It also has a button that turns all of it into a podcast, two AI hosts talking through whatever you gave them like it's their show.

A friend sent me one of those in June 2025. Two hosts, 15 minutes, on an article from Wookieepedia, the Star Wars wiki. I was tickled. The funniest shit to me was how earnestly they went through it, citing sources and cross-referencing, without any trace of irony, like it was a legit source. And I wondered if I could trick these things.

## Round one

That same afternoon I made an FBI memo in Google Docs, exported it as a PDF and uploaded it.

Robots saw right through that shit.

I guess a memo that came out of Google Docs looks like a memo that came out of Google Docs. The hosts were clearly tongue-in-cheek about it, with an *okay, sure, buddy* attitude.

I took that as a challenge. They treated Star Wars as legit, so why not this? What if it looked like a real source?

That's where leaksmith came from. It's a Python command-line tool, so no windows or buttons, you run it by typing in a terminal. You write your memo in markdown, which is plain text with a few symbols for headings and bold and lists, and put the title, agency, classification and date at the top. leaksmith lays it out like an FBI memo and makes a PDF. Then, if you ask it to, it beats that PDF up until it looks like it's been copied and scanned a bunch of times.

Officially, it exists for testing whether AI systems can tell fake documents from real ones. Same question, just with a tie on. [The project page](/projects/leaksmith/) has how it all works. This is more about how it went.

## Seventeen days of this

Two days later I started the actual Python project, and the tests were failing almost right away. The worst one was the date. The parser, the part that reads those labeled lines at the top of the memo, was reading the date as an actual date, the kind of value code does math with, and the tests expected plain text. That one ate hours. Once the dates were text again, the markdown library broke a few more tests, and it was the next afternoon before everything passed.

WeasyPrint was next, the library that turns the memo into a PDF. It works by rendering a web page, so before any of the aging, the memo is a web page. And it wouldn't even import, meaning Python couldn't load it at all, because a library it depends on was nowhere to be found. I installed a whole stack of graphics libraries with Homebrew, the package manager a lot of Mac developers use, and it still failed. The fix turned out to be two environment variables, basically two lines telling Python where Homebrew had put everything. I should have tried that hours earlier.

Then I did the FBI template, Courier New with specific margins and red classification boxes, and now markdown went in one end and a PDF came out the other. The command line was the last fight. Typer, the framework I used for it, wanted named options like `--input memo.md` instead of just the filename, or at least that's how I got it working. That's why you type `leaksmith render run --input memo.md` instead of something shorter. Longer than I wanted, but fine. After one more fight with the install, I could actually run it.

## Making it look old

So the PDFs worked, and they looked fake. Way too clean. They had to get roughed up, and the plan was four steps: turn every page into an image, add noise and blur, draw some random lines across it, and turn it back into a PDF.

ImageMagick, the command-line tool that does the turning-back-into-a-PDF part, comes in two versions, 6 and 7, and they disagree about syntax. Of course it couldn't just be simple. I had to make it work with both, and then it worked. After that it was tuning: go light and the page still looks brand new, go heavy and nobody can read it.

## Round two

For a test document I wrote a fake CIA memo about interdimensional communication research and ran it through. It came out looking old enough. Then I uploaded it to NotebookLM.

The hosts spent 14 minutes on interdimensional protocols and treated it like a legitimate source. Holy shit, it actually worked. It was hilarious, though I can't remember any specific lines now.

The weird part is that it shouldn't fool a person. The aging is uniform because a computer did it, the type is too clean, and the classification markings are generic. Anybody who's seen real leaked documents would spot it immediately. No idea why the robots fall for it. They did when I built it, anyway.

## Loose ends

The last couple of days were paperwork: a README, the page that explains the project, a license saying what people can do with the code, and a legal file full of disclaimers. Then the ImageMagick 6-versus-7 thing bit me again on a different computer, so I fixed that again, and in early July it went up on GitHub.

All in, it was 17 days from a Star Wars podcast to a tool that turns markdown into aged PDFs that fool AI.
