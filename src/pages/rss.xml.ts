import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { absolutizeLinks, needsReview, postSlug } from '../lib/blog-helpers';

// Full posts, not teasers. Only published posts (draft: false) are listed,
// and posts still marked for review stay out: a feed reader keeps
// whatever it fetched, and the "Drafted" date is the only marker on the page.
export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://krizdingus.com');
  const posts = (await getCollection('blog', ({ data }) => !data.draft && !needsReview(data)))
    .sort((a, b) => b.data.date_published.getTime() - a.data.date_published.getTime());

  return rss({
    title: 'Krizdingus',
    description: 'Writing from krizdingus.com: essays, build stories, and whatever else I can\'t stop thinking about.',
    site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.summary,
      pubDate: p.data.date_published,
      link: `/blog/${postSlug(p.id)}/`,
      categories: p.data.tags,
      content: absolutizeLinks(p.rendered?.html ?? '', site),
    })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en</language><atom:link href="${new URL('/rss.xml', site)}" rel="self" type="application/rss+xml"/>`,
  });
}
