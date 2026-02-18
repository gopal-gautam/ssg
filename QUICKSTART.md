# SSG Quick Start Guide

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize a new site:**
   ```bash
   node bin/cli.js init
   # or for a specific directory:
   node bin/cli.js init -d my-blog
   ```

3. **Build the site:**
   ```bash
   cd my-blog
   node ../bin/cli.js build
   ```

4. **Start the dev server:**
   ```bash
   node ../bin/cli.js serve
   ```

   Visit http://localhost:3000

## Project Structure Created

```
my-blog/
├── config.yml              # Site configuration
├── template/               # Your theme
│   ├── layouts/           # Page layouts (base.html, page.html, post.html)
│   ├── partials/          # Reusable components (header, footer)
│   └── assets/            # CSS, JS, images
├── source/public/         # Your content
│   ├── index.yml          # Homepage
│   ├── about.yml          # About page
│   └── blog/              # Blog posts
│       └── my-first-post.yml
└── dist/                  # Generated site (deploy this!)
```

## Creating Content

### Create a New Post

```bash
node ../bin/cli.js new post "My Amazing Post"
```

This creates `source/public/blog/my-amazing-post.yml`:

```yaml
type: post
layout: post
title: My Amazing Post
slug: my-amazing-post
date: 2025-12-31
tags: []
draft: false

inject:
  "h1.title": title
  ".post-meta .date": date
  ".content": body_html

body:
  format: markdown
  content: |
    # My Amazing Post

    Your content here...
```

### Create a New Page

```bash
node ../bin/cli.js new page "Contact"
```

## How Content Injection Works

### Method 1: Using `inject` in YAML

Map YAML fields to HTML elements using CSS selectors:

```yaml
title: Hello World
hero_image: /img/hero.jpg

inject:
  "h1": title                      # Sets text content
  ".hero@src": hero_image          # Sets src attribute
  ".content": body_html            # Sets HTML content
```

### Method 2: Using `data-bind` in HTML

In your template HTML:

```html
<h1 data-bind="title">Default Title</h1>
<img data-bind="hero_image" src="" alt="">
<div data-bind="body_html"></div>
```

The YAML fields automatically populate these elements.

## Editing Templates

Templates are just regular HTML files in `template/layouts/`:

- **base.html** - Minimal base layout
- **page.html** - For regular pages
- **post.html** - For blog posts

### Using Partials

Include reusable components:

```html
<!-- @include partials/header.html -->

<main>
  <div data-bind="body_html"></div>
</main>

<!-- @include partials/footer.html -->
```

## Markdown Support

Write content in markdown for easier formatting:

```yaml
body:
  format: markdown
  content: |
    # Heading

    Paragraph with **bold** and *italic*.

    - List item 1
    - List item 2

    [Link](https://example.com)
```

## Blog Features

The generator automatically creates:

- **Blog Index**: Lists all posts at `/blog/`
- **Tag Pages**: Individual pages for each tag at `/tags/{tag}/`
- **RSS Feed**: `/rss.xml`
- **Sitemap**: `/sitemap.xml`

## Development Workflow

1. **Start dev server with watch mode:**
   ```bash
   node ../bin/cli.js serve
   ```

2. **Edit content files** in `source/public/`

3. **Edit templates** in `template/`

4. **Changes auto-rebuild** - just refresh your browser

## Deployment

After building, deploy the `dist/` folder to:

- **Netlify**: Drag & drop the `dist` folder
- **Vercel**: Connect your repo, set build command to `ssg build`
- **GitHub Pages**: Push `dist/` contents to `gh-pages` branch
- **Any static host**: Upload `dist/` contents

## Configuration

Edit `config.yml` to customize:

```yaml
site:
  name: My Blog
  url: https://myblog.com
  language: en

build:
  pretty_urls: true    # /about/ instead of /about.html
  strict_selectors: false

blog:
  posts_dir: blog
  posts_per_page: 10
```

## Tips

1. **Use data-bind for simplicity** - It's cleaner than complex selectors
2. **Keep layouts semantic** - Use proper HTML5 elements
3. **Organize with tags** - Get automatic tag pages
4. **Enable pretty URLs** - Better for SEO
5. **Write in markdown** - Faster and cleaner for blog posts

## Troubleshooting

### Warning: "No elements found for selector"

The template doesn't have that selector. Either:
- Add the element to your template
- Update the selector in your YAML
- Use `data-bind` instead

### Build fails

- Check YAML syntax (proper indentation!)
- Ensure layout files exist
- Run with `--verbose` for detailed errors

## Examples

Check the `test-site/` directory for a complete working example with:
- Homepage
- About page
- Blog post with markdown
- Full template setup

## Next Steps

1. Customize the CSS in `template/assets/css/style.css`
2. Create more pages and posts
3. Add your own images to `template/assets/img/`
4. Modify templates to match your design
5. Deploy to production!

---

**Need help?** Check the full [README.md](README.md) for complete documentation.
