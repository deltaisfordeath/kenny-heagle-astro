# kennyheagle.com

Personal site and blog — built with [Astro](https://astro.build), deployed on
Cloudflare Pages. Comments are self-hosted [Remark42](https://remark42.com)
(see `deploy/remark42/`).

## Stack

- **Astro 6** with MDX for blog posts
- **Content collections** — posts live in `src/content/posts/`, schema in
  `src/content.config.ts`
- **Remark42** comments at `comments.kennyheagle.com`, running on a Mac mini
  behind a cloudflared tunnel
- RSS feed at `/rss.xml`, sitemap at `/sitemap-index.xml`

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Dev server at `localhost:4321`            |
| `npm run build`   | Production build to `./dist/`             |
| `npm run preview` | Preview the production build locally      |
| `npm run check`   | Type-check `.astro` files                 |

## Writing a post

Add a `.mdx` (or `.md`) file to `src/content/posts/`. The filename is the
slug (`hello-world.mdx` → `/blog/hello-world/`). Frontmatter:

```yaml
---
title: "Post title"
description: "One-sentence summary used in cards, meta tags, and RSS."
pubDate: 2026-07-04T12:00:00-07:00
tags: ["tech"]
draft: false          # true hides it everywhere
# updatedDate, heroImage, heroImageAlt are optional
---
```

Images go in `src/assets/images/` and are imported in the post for
Astro's image optimization.

## Structure

```
src/
├── components/     # Header, Footer, PostCard, ProjectCard, TagList, Comments
├── content/posts/  # blog posts (MDX)
├── layouts/        # BaseLayout (head/meta), PostLayout (post chrome)
├── pages/          # routes: /, /blog, /blog/[slug], /blog/tags/[tag], /projects, 404
├── styles/         # global.css (design tokens + base styles)
└── util/           # constants, posts helper
deploy/remark42/    # comment server config for the Mac mini
```
