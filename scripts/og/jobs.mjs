// The list of share cards scripts/og-cards.mjs draws, and what each one
// shows. Kept apart from the drawing so tests/og-cards.test.ts can compare
// it with scripts/og/drawn.json (the record of the last run) and fail when
// a title, a page entry or a listed photo changed without a re-run.
import fs from 'node:fs';
import path from 'node:path';

export const DRAWN_FILE = 'scripts/og/drawn.json';

// Frontmatter titles are plain quoted strings.
function front(file) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^---\n([\s\S]*?)\n---/)[1];
  const get = (k) => {
    const m = fm.match(new RegExp(`^${k}:\\s*"(.*)"\\s*$`, 'm'));
    return m ? m[1].replace(/\\"/g, '"') : undefined;
  };
  return { title: get('title'), hero: get('hero_image'), draft: /^draft:\s*true/m.test(fm) };
}

function collection(root, dir) {
  return fs.readdirSync(path.join(root, dir))
    .filter((f) => /\.mdx?$/.test(f))
    .sort()
    .map((f) => ({ slug: f.replace(/\.mdx?$/, ''), ...front(path.join(root, dir, f)) }))
    .filter((e) => !e.draft);
}

/** One entry per card: the output path under public/images/og/ and every
 *  input that ends up in the image. */
export function cardJobs(root) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'src/data/og-cards.json'), 'utf8'));
  const jobs = [];
  for (const [key, p] of Object.entries(config.pages)) {
    jobs.push({ out: `${key}.jpg`, kind: 'title', mood: p.mood, hue: p.hue, crumb: p.crumb, title: p.title, sub: p.sub, url: `krizdingus.com${p.path}` });
  }
  // A post with a hero_image gets that picture filling the card; one without
  // gets a designed title card.
  for (const post of collection(root, 'src/content/blog')) {
    const base = { out: `blog/${post.slug}.jpg`, mood: 'plum', hue: 'grape', crumb: `> blog / ${post.slug}`, title: post.title, url: 'krizdingus.com/blog/' };
    if (post.hero) jobs.push({ ...base, kind: 'photo', src: post.hero, position: 'centre' });
    else jobs.push({ ...base, kind: 'title' });
  }
  for (const proj of collection(root, 'src/content/projects')) {
    const photo = config.projects[proj.slug];
    const url = 'krizdingus.com/projects/';
    const crumb = `> projects / ${proj.slug}`;
    if (!photo) jobs.push({ out: `projects/${proj.slug}.jpg`, kind: 'title', mood: 'paper', hue: 'teal', crumb, title: proj.title, url });
    else jobs.push({ out: `projects/${proj.slug}.jpg`, kind: photo.layout, src: photo.src, position: photo.position, mood: 'paper', hue: 'teal', crumb, title: proj.title, url });
  }
  return jobs;
}
