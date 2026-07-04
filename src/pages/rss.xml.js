import rss from '@astrojs/rss';
import { getPublishedPosts } from '../util/posts';

export async function GET(context) {
  const sorted = await getPublishedPosts();

  return rss({
    title: 'Kenny Heagle',
    description: 'Writing on tech, business, finance, and fitness.',
    site: context.site,
    items: sorted.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
