import { z } from 'zod';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

export const projectsSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  summary: z.string(),
  // Search and share text. `description` is the meta description (aim for
  // 120-160 characters) when the summary runs outside that; `seo_title`
  // replaces the title in <title> when "<title> — Krizdingus" would pass
  // about 60 characters. Both fall back to summary and title.
  description: z.string().optional(),
  seo_title: z.string().optional(),
  // schema.org type for the page's JSON-LD when the category default is
  // wrong (src/lib/seo.ts): e.g. an app whose repo doesn't hold its source.
  schema_type: z.enum(['CreativeWork', 'SoftwareSourceCode']).optional(),
  category: z.enum(['hardware', '3d-print', 'bot', 'game-boy', 'software', 'other']),
  tags: z.array(z.string()).default([]),
  hero_image: z.string(),
  gallery: z.array(z.object({
    src: z.string(),
    alt: z.string(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
  })).default([]),
  external_url: z.string().url(),
  external_label: z.string(),
  date_published: z.coerce.date(),
  // The day the thing itself came out (its MakerWorld or GitHub release),
  // when the page's own date differs. date_published only spaces the pages
  // out; the site dates, sorts and flags the project by this.
  released: z.coerce.date().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['live', 'archived', 'wip']).default('live'),
  draft: z.boolean().default(false),
  // NEW:
  time: z.string().optional(),       // human-readable like "2 weekends" / "~6 hours"
  cost: z.string().optional(),       // "$8 + filament" / "free, donor parts"
  license: z.string().optional(),    // "CC BY-NC 4.0" / "MIT" / etc
  // The repo's programming languages for its JSON-LD, where the tags don't
  // name them all (src/lib/seo.ts reads the tags otherwise).
  languages: z.array(z.string()).optional(),
  // Display chrome on the projects index card:
  exe_name: z.string().optional(),   // "MAGSAFE-ZYN.EXE" — curated title-bar label
  crt_glyph: z.string().optional(),  // ">_", "GB", "USB-C" — CRT-style thumb glyph when hero_image is empty
  display_order: z.number().int().optional(), // 1-based curated order on the projects index
  // Secondary links (repo alongside a MakerWorld listing, docs, test server, etc).
  links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
  // Hand-entered, dated snapshot of public stats from the hosting platform.
  // MakerWorld's terms forbid automated scraping, so this is never fetched —
  // it's typed in by a human and stamped with the date it was read.
  field_report: z.object({
    source: z.string(),                       // "MakerWorld"
    captured: z.coerce.date(),                // date the numbers were read
    rating: z.number().min(0).max(5).optional(),
    rating_count: z.number().int().optional(),
    likes: z.number().int().optional(),
    downloads: z.number().int().optional(),
    comments: z.number().int().optional(),
    stars: z.number().int().optional(),       // GitHub
  }).optional(),
  // One review line from the hosting platform, quoted as written (trimmed
  // only with an ellipsis), credited to the reviewer's handle and linked to
  // the listing the review sits on. Typed in by hand, like field_report.
  quote: z.object({
    text: z.string().min(1),
    by: z.string().regex(/^@\S+$/, 'expected a handle starting with @'),
    url: z.string().url(),
  }).strict().optional(),
});

// The web ledger (/web/). Every entry is a brand or client the web work was
// for. It doesn't say what the work was: not all of it was whole websites, so there's no per-entry work type or note.
// `relationship` is how the work happened; `agency` names the agency when it
// came through one. `site_state` is only what's actually known about the
// site today; 'unknown' (the default) shows nothing. `live_url` links the
// live site where one was asked for, and `wayback_url` an archived
// copy. There are no per-entry pages and the ledger shows no years, roles,
// tech, summaries or notes, so the schema is strict: a field like that fails
// the build instead of sitting there unused.
export const WEB_AGENCIES = ['Roar Media', 'New Star Media'] as const;
export const WEB_RELATIONSHIPS = ['agency', 'freelance', 'in-house'] as const;
export const WEB_SITE_STATES = ['redone', 'gone', 'launching', 'unknown'] as const;

export const webSchema = z
  .object({
    client: z.string(),
    relationship: z.enum(WEB_RELATIONSHIPS).optional(),
    agency: z.enum(WEB_AGENCIES).nullable().optional(),
    site_state: z.enum(WEB_SITE_STATES).default('unknown'),
    live_url: z.string().url().nullable().optional(),
    // A Wayback Machine capture: https://web.archive.org/web/<YYYYMMDDhhmmss>/<url>
    wayback_url: z
      .string()
      .url()
      .regex(/^https:\/\/web\.archive\.org\/web\/\d{14}\//, 'expected a web.archive.org/web/<14-digit timestamp>/ URL')
      .nullable()
      .optional(),
    draft: z.boolean().default(false),
  })
  .strict()
  .superRefine((d, ctx) => {
    // An agency is named exactly when the work came through one.
    if (d.relationship === 'agency' && !d.agency) {
      ctx.addIssue({ code: 'custom', path: ['agency'], message: 'agency work needs the agency named' });
    }
    if (d.agency && d.relationship !== 'agency') {
      ctx.addIssue({ code: 'custom', path: ['relationship'], message: 'an agency is set, so relationship must be "agency"' });
    }
    // A live link means the site is up, so it can't also be redone, gone
    // or not out yet.
    if (d.live_url && d.site_state !== 'unknown') {
      ctx.addIssue({ code: 'custom', path: ['live_url'], message: `a live link can't go with site_state "${d.site_state}"` });
    }
  });

export const blogSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  summary: z.string(),
  // Meta description when the summary runs past about 160 characters.
  description: z.string().optional(),
  // Replaces the title in <title> when "<title> — Krizdingus blog" would
  // pass about 62 characters. The page itself still shows `title`.
  seo_title: z.string().optional(),
  // The post's picture: a 16:9 JPEG master in public/images/blog/, with
  // responsive copies cut by `npm run images -- blog`. It heads the post,
  // fills the post's share card and shows on the blog list. `hero_alt`
  // describes it on the post page and the share card (lists show it as
  // decoration next to the title); `hero_caption` sits under it on the post.
  hero_image: z.string().nullable().default(null),
  hero_alt: z.string().optional(),
  hero_caption: z.string().optional(),
  date_published: z.coerce.date(),
  date_updated: z.coerce.date().nullable().default(null),
  tags: z.array(z.string()).default([]),
  // The big "Now Featuring" card on the home page, in place of the
  // featured project (which then takes the rail's post slot).
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  // Not signed off yet: shows a "Drafted" marker and stays out of the feed.
  review: z.boolean().default(false),
  // A browsable strip of pictures under the post, for posts that are mostly
  // about something you'd want to look at (a site build, a redesign). Same
  // shape as a project's gallery, and driven by the same viewer script, but
  // its own component and its own files: public/images/blog/<folder>/ with
  // responsive copies and square thumbs in a sibling r/ (npm run images -- blog).
  gallery: z.array(z.object({
    src: z.string(),
    alt: z.string(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
  })).default([]),
  gallery_title: z.string().optional(),
  // This post is a case study of a web ledger record: the entry's id in
  // src/content/web/ ("prospera-real-estate-collective"). /web/ lists the
  // newest few and reads the client's name and live link off the ledger, so
  // the post never spells either one out. An id with no record fails the build.
  case_study_for: z.string().optional(),
});

export const aboutSchema = z.object({
  portrait: z.string(),
  social: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
});

export const appsSchema = z.object({
  title: z.string(),
  taskbar_label: z.string(),
  slug: z.string().optional(),
  chrome: z.enum(['mk', 'gk']),
  width: z.number().int(),
  height: z.number().int(),
  icon_html: z.string(),
  title_icon_html: z.string(),
  desktop_icon_html: z.string(),
  date_published: z.coerce.date(),
  draft: z.boolean().default(false),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: projectsSchema,
});

const web = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/web' }),
  schema: webSchema,
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: blogSchema,
});

const about = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/about' }),
  schema: aboutSchema,
});

const apps = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/apps' }),
  schema: appsSchema,
});

export const collections = { projects, web, blog, about, apps };
