# Amir Pourmand – Astro Blog

A faithful rebuild of [amirpourmand.ir](https://amirpourmand.ir) with Astro, replacing Hugo/PaperMod.

## Features

- ✅ Blog posts from Markdown/MDX files (`src/content/blog/`)
- ✅ Dark / Light mode toggle (persisted in localStorage)
- ✅ Pagination (10 posts per page)
- ✅ Archives page (grouped by year)
- ✅ Tags system with individual tag pages
- ✅ Client-side search (no external dependency)
- ✅ RSS feed at `/rss.xml`
- ✅ Sitemap via `@astrojs/sitemap`
- ✅ Syntax highlighting (Shiki, github-dark theme)
- ✅ Bio, CV, Code pages
- ✅ 404 page
- ✅ SEO meta tags + Open Graph + Twitter Card

## Getting Started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # build to ./dist
npm run preview   # preview built site
```

## Adding a Blog Post

Create a new `.md` or `.mdx` file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "A short description for SEO and post listings."
date: 2025-01-15
tags: ["tag1", "tag2"]
minutesRead: 5
author: Amir
---

Your content here...
```

The filename becomes the URL slug: `my-post.md` → `/posts/my-post`

## Project Structure

```
src/
├── content/
│   ├── config.ts          # Content collection schema
│   └── blog/              # Your .md/.mdx posts
├── layouts/
│   ├── Base.astro          # Main layout (header, footer, theme)
│   └── PostLayout.astro    # Article layout
├── pages/
│   ├── index.astro         # Home (post list)
│   ├── archives.astro
│   ├── search.astro
│   ├── bio.astro
│   ├── cv.astro
│   ├── code.astro
│   ├── rss.xml.js
│   ├── 404.astro
│   ├── page/[page].astro   # Pagination
│   ├── posts/[slug].astro  # Individual posts
│   └── tags/
│       ├── index.astro     # All tags
│       └── [tag].astro     # Posts by tag
└── styles/
    └── global.css
```

## Configuration

Edit `astro.config.mjs` to set your site URL (required for sitemap and RSS):

```js
export default defineConfig({
  site: 'https://amirpourmand.ir',
  // ...
});
```

## Migrating Posts from Hugo

Your Hugo posts are in `content/posts/`. Copy the `.md` files to `src/content/blog/`.

**Frontmatter differences:**

| Hugo         | Astro          |
|--------------|----------------|
| `date:`      | `date:` ✓ same |
| `tags:`      | `tags:` ✓ same |
| `draft:`     | `draft:` ✓ same |
| `summary:`   | `description:` |

The `{{ .ReadingTime }}` variable becomes the `minutesRead` frontmatter field.
You can auto-calculate it with a script or just remove it.

## Deployment

### Netlify / Vercel
Just connect the repo. Both auto-detect Astro.

### GitHub Pages
Add `@astrojs/github-pages` adapter or use the Astro GitHub Actions workflow.

### Self-hosted (Caddy)
```bash
npm run build
# Serve ./dist as a static directory
```
