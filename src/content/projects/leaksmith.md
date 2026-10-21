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

leaksmith is a little Python program that makes fake leaked government documents. You write the memo in markdown, the plain-text format GitHub READMEs are written in, and leaksmith lays it out like an FBI memo and saves a PDF. Add one flag and it ages the pages too: grain, blur and scanner streaks, like the thing's been through a bad office copier a few times.

The audience is AI, not people. Like NotebookLM, Google's tool that reads your documents and can turn them into a podcast with two AI hosts. When I fed it one of these aged PDFs, it treated it like a real source. I'm not sure why the robots fall for it, but they do.

It started when a friend sent me one of those podcasts, two hosts spending 15 minutes dead serious about a Star Wars wiki article. My first fake memo came straight out of Google Docs, and the hosts handled it with a pretty clear *okay, sure, buddy*. So now it was a challenge.

## Markdown in, PDF out

It's a command-line tool: you type commands, there's no app to click around in. The memo is a markdown file with frontmatter, a few labeled lines at the top for title, agency, classification and date:

```markdown
---
title: "Operation Blackbird"
agency: "Federal Bureau of Investigation"
classification: "SECRET//NOFORN"
date: "2024-01-15"
---

# Memo

Surveillance assets deployed successfully.
```

leaksmith renders that through an agency template into a PDF with the typeface, margins, header block and red classification boxes, then optionally runs a distress pipeline that makes it look scanned and aged.

```bash
leaksmith render run --input memo.md --template fbi --output leaked.pdf --dpi 150 --distress
```

There's one template so far, `fbi`, in Courier New. Tables and code blocks work. Distress is off unless you pass `--distress`. The nested `render run` command exists because Typer, the command-line library, wanted it that way. More typing than it needs, but whatever, it works.

## The pipeline

1. **Parse**: frontmatter out, markdown to HTML with tables, fenced code, and a few government-flavored extensions
2. **Render**: a Jinja2 template (fill-in-the-blanks for HTML) plus the metadata becomes a proper document
3. **PDF**: WeasyPrint turns that HTML into a PDF, with a zoom factor for DPI and font optimization so the file isn't huge
4. **Distress**: pages to images, Gaussian noise (random grain), blur to suggest photocopy generations, a few random lines per page to mimic scanner junk, back to PDF

The distress parameters are tuned for AI readers: noise level 40, blur radius 1.5, three to eight random lines per page. 150 DPI is enough for that and much faster than 300.

## What gives it away

The aging is uniform because it's computed. Real documents have coffee rings, fold shadows, and yellowing that varies page to page. The typography is too clean; real 80s paperwork has ribbon wear and correction fluid. The classification markings are generic. Anyone who's handled real declassified material spots it instantly. Language models, as of when I built it, don't.

More agency templates are a maybe, if I ever figure out what a CIA or NSA memo is supposed to look like.

## The dependency fights

Fair warning, setup is the annoying part. WeasyPrint needs the Cairo, Pango, and GDK-Pixbuf graphics libraries. On macOS those come from Homebrew, the Mac package manager, and then two environment variables have to point at where Homebrew put them, or WeasyPrint fails with errors that don't mention any of that. The distress step also needs `pdftoppm` and ImageMagick. The README covers setup on Mac and Linux, and `DEVLOG.md` has the dependency fights and failed tests.

It's MIT licensed, so the code's yours to mess with. Just don't use it to fool people who matter.
