// Search and share metadata: share images (Open Graph cards), breadcrumbs
// and the schema.org JSON-LD nodes each kind of page emits. BaseLayout
// renders what a page passes it; nothing here touches the DOM.
//
// Share images live in public/images/og/ and are drawn by
// scripts/og-cards.mjs from src/data/og-cards.json.
import ogCards from '../data/og-cards.json';
import { socialLinks } from '../data/social';

export const SITE = 'https://krizdingus.com';
export const SITE_NAME = 'Krizdingus';
export const abs = (path: string): string => new URL(path, SITE).toString();

/** Every card is drawn at this size. */
export const SHARE_W = 1200;
export const SHARE_H = 630;

export interface ShareImage {
  src: string;
  alt: string;
}

type PageKey = keyof typeof ogCards.pages;
type ProjectCards = Record<string, { src: string; layout: string; position?: string | number }>;

const cardAlt = (title: string) => `krizdingus.com title card: ${title}`;

/** A section page's title card (home, projects, blog, web, about, colophon). */
export function pageCard(key: PageKey): ShareImage {
  return { src: `/images/og/${key}.jpg`, alt: cardAlt(ogCards.pages[key].title) };
}

export const DEFAULT_CARD: ShareImage = pageCard('home');

/** A post's card: its own picture cropped to fill the card when it has a
 *  hero_image (the alt is the picture's hero_alt), otherwise a title card.
 *  scripts/og/jobs.mjs makes the same choice when drawing it. */
export function postCard(slug: string, d: { title: string; hero_image?: string | null; hero_alt?: string }): ShareImage {
  const alt = d.hero_image && d.hero_alt ? d.hero_alt : cardAlt(d.title);
  return { src: `/images/og/blog/${slug}.jpg`, alt };
}

interface ProjectLike {
  title: string;
  hero_image?: string | null;
  gallery?: ReadonlyArray<{ src: string; alt: string }>;
}

/** The photo a project's card is cut from, if it has one. */
export function projectPhoto(slug: string): string | undefined {
  return (ogCards.projects as ProjectCards)[slug]?.src;
}

/** A project's card: its own photo where og-cards.json lists one (the alt is
 *  that photo's gallery alt), otherwise a title card. */
export function projectCard(slug: string, d: ProjectLike): ShareImage {
  const photo = projectPhoto(slug);
  const alt = photo ? d.gallery?.find((g) => g.src === photo)?.alt : undefined;
  return { src: `/images/og/projects/${slug}.jpg`, alt: alt ?? cardAlt(d.title) };
}

// ---- JSON-LD ----

export type JsonLdNode = Record<string, unknown>;

/** Frontmatter dates are calendar days with no time (parsed as UTC
 *  midnight). They go out as the bare day, so no time zone can shift them
 *  to the day before. */
export const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

export const PERSON_ID = `${SITE}/#person`;
export const WEBSITE_ID = `${SITE}/#website`;

/** The author, as a reference any node can carry (name and url included, so
 *  it reads on its own where the full Person node isn't on the page). */
export const personRef = { '@type': 'Person', '@id': PERSON_ID, name: 'Kris Williams', url: `${SITE}/` };

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbList(crumbs: Crumb[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export function websiteNode(description: string): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE}/`,
    name: SITE_NAME,
    alternateName: 'krizdingus.com',
    description,
    inLanguage: 'en',
    publisher: personRef,
  };
}

/** /about/: a ProfilePage about Kris. Only facts the page itself states:
 *  the day job, the portrait, and the confirmed accounts in
 *  src/data/social.ts. No address, phone or email. */
export function profilePageNode(opts: { description: string; image: string }): JsonLdNode {
  return {
    '@type': 'ProfilePage',
    '@id': `${SITE}/about/`,
    url: `${SITE}/about/`,
    name: 'About Kris Williams',
    description: opts.description,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Kris Williams',
      alternateName: 'krizdingus',
      url: `${SITE}/`,
      image: abs(opts.image),
      jobTitle: 'Director of Web & Interactive Media',
      worksFor: { '@type': 'Organization', name: 'St. Thomas University' },
      sameAs: socialLinks.map((s) => s.url),
    },
  };
}

interface PostLike {
  title: string;
  summary: string;
  description?: string;
  date_published: Date;
  date_updated?: Date | null;
  tags?: string[];
}

/** A post. A draft still marked for review carries its drafting day, not a
 *  publish date, so it claims no dates at all until it's signed off. */
export function blogPostingNode(url: string, d: PostLike, image: ShareImage, draft: boolean): JsonLdNode {
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#post`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: d.title,
    description: d.description ?? d.summary,
    image: abs(image.src),
    inLanguage: 'en',
    ...(draft
      ? {}
      : {
          datePublished: isoDay(d.date_published),
          dateModified: isoDay(d.date_updated ?? d.date_published),
        }),
    author: personRef,
    publisher: personRef,
    ...(d.tags?.length ? { keywords: d.tags.join(', ') } : {}),
  };
}

const LICENSE_URLS: Record<string, string> = {
  MIT: 'https://opensource.org/license/mit',
  'CC BY-NC-SA 4.0': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'CC BY-NC 4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
};

const LANGUAGE_TAGS: Record<string, string> = {
  Go: 'Go',
  Python: 'Python',
  TypeScript: 'TypeScript',
  'Node.js': 'JavaScript',
};

interface ProjectEntryLike extends ProjectLike {
  summary: string;
  description?: string;
  category: string;
  tags: string[];
  external_url: string;
  date_published: Date;
  license?: string;
  languages?: string[];
  schema_type?: 'CreativeWork' | 'SoftwareSourceCode';
}

/** The schema.org type for a project: prints and labels are creative works,
 *  code with its source on GitHub is source code, and a project can say
 *  otherwise in its frontmatter (schema_type). */
export function projectType(d: Pick<ProjectEntryLike, 'category' | 'external_url' | 'schema_type'>): string {
  if (d.schema_type) return d.schema_type;
  const code = ['software', 'bot', 'hardware'].includes(d.category);
  return code && d.external_url.startsWith('https://github.com/') ? 'SoftwareSourceCode' : 'CreativeWork';
}

export function projectNode(url: string, slug: string, d: ProjectEntryLike): JsonLdNode {
  const type = projectType(d);
  const photo = projectPhoto(slug) ?? (d.hero_image || undefined);
  const license = d.license ? LICENSE_URLS[d.license] : undefined;
  // The repo's languages: from frontmatter where a project lists them (the
  // tags don't name every one), otherwise read off the tags.
  const languages = d.languages?.length
    ? d.languages
    : [...new Set(d.tags.map((t) => LANGUAGE_TAGS[t]).filter(Boolean))];
  const node: JsonLdNode = {
    '@type': type,
    '@id': `${url}#work`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    name: d.title,
    description: d.description ?? d.summary,
    image: abs(photo ?? `/images/og/projects/${slug}.jpg`),
    datePublished: isoDay(d.date_published),
    author: personRef,
    keywords: d.tags.join(', '),
    inLanguage: 'en',
    sameAs: d.external_url,
    ...(license ? { license } : {}),
  };
  if (type === 'SoftwareSourceCode') {
    node.codeRepository = d.external_url;
    if (languages.length) node.programmingLanguage = languages.length === 1 ? languages[0] : languages;
  }
  return node;
}
