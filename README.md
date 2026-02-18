# SSG - Selector-Based Static Site Generator

A modern static site generator that uses CSS selectors for content injection. No custom templating language required - just HTML, CSS, JavaScript, and YAML.

## Key Features

- **Real HTML/CSS/JS templates** - Work with standard web technologies
- **YAML content files** - Clean, readable content format with front-matter
- **CSS selector-based injection** - Map content to elements using selectors or data-bind attributes
- **Markdown support** - Write blog posts in markdown
- **Full blog features** - Tag pages, RSS feed, sitemap, pagination
- **Live reload dev server** - Watch mode with auto-rebuild
- **Fast builds** - Efficient rendering with JSDOM
- **Extensible architecture** - Clean modular design

## Installation

```bash
# Install dependencies
npm install

# Make CLI globally available (optional)
npm link
```

## Quick Start

```bash
# Initialize a new project
ssg init

# Install dependencies
npm install

# Build the site
ssg build

# Start dev server with watch mode
ssg serve
```

Your site will be available at `http://localhost:3000`

## Project Structure

```
project/
├── config.yml                 # Site configuration
├── template/                  # Theme/template files
│   ├── layouts/              # Page layouts
│   │   ├── base.html
│   │   ├── page.html
│   │   └── post.html
│   ├── partials/             # Reusable components
│   │   ├── header.html
│   │   └── footer.html
│   └── assets/               # Static assets
│       ├── css/
│       ├── js/
│       └── img/
├── source/
│   └── public/               # Content files
│       ├── index.yml         # Pages
│       ├── about.yml
│       └── blog/             # Blog posts
│           └── post.yml
└── dist/                     # Generated output (git-ignored)
```

## Configuration

Edit `config.yml` to customize your site:

```yaml
site:
  name: My Site
  url: https://example.com
  language: en

paths:
  template: template
  source: source/public
  dist: dist

build:
  clean: true
  pretty_urls: true          # /about/ vs /about.html
  strict_selectors: false    # Fail on missing selectors

blog:
  posts_dir: blog
  index_layout: page
  index_slug: blog
  posts_per_page: 10
```

## Content Files (YAML)

### Basic Page

```yaml
type: page
layout: page
title: About
slug: about

inject:
  "h1": title
  ".content": body_html

body:
  format: markdown
  content: |
    # About Us

    Your content here...
```

### Blog Post

```yaml
type: post
layout: post
title: My First Post
slug: my-first-post
date: 2025-01-01
tags: [tech, tutorial]
draft: false

inject:
  "h1.title": title
  ".post-meta .date": date
  ".content": body_html

body:
  format: markdown
  content: |
    # Hello World

    This is my blog post...
```

## Content Injection

### Using Selectors (inject block)

Map YAML fields to HTML elements using CSS selectors:

```yaml
inject:
  "h1": title                    # Set text content
  ".hero-image@src": image_url   # Set attribute
  ".content": body_html          # Set HTML content
  "meta[name='description']@content": excerpt
```

### Using data-bind Attributes

Add `data-bind` attributes to your HTML:

```html
<h1 data-bind="title">Fallback Title</h1>
<div data-bind="body_html"></div>
<time data-bind="date"></time>
```

The YAML values will automatically populate these elements.

## Templates

### Layouts

Layouts are regular HTML files in `template/layouts/`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title data-bind="title">Site Title</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <!-- @include partials/header.html -->

  <main data-bind="body_html">
    <!-- Content injected here -->
  </main>

  <!-- @include partials/footer.html -->
</body>
</html>
```

### Partials

Include reusable components using:

```html
<!-- @include partials/header.html -->
<!-- @include partials/footer.html -->
```

## CLI Commands

### init

Initialize a new project with sample files:

```bash
ssg init
ssg init -d my-project
```

### build

Build the static site:

```bash
ssg build
ssg build --config custom-config.yml
ssg build --verbose
```

### serve

Start development server with watch mode:

```bash
ssg serve
ssg serve --port 8080
ssg serve --no-watch
```

### new

Create a new post or page:

```bash
ssg new post "My Post Title"
ssg new page "About Us"
```

## Content Body Formats

### Markdown (default for blogs)

```yaml
body:
  format: markdown
  content: |
    # Heading

    Paragraph with **bold** and *italic*.
```

### HTML

```yaml
body:
  format: html
  content: |
    <h1>Heading</h1>
    <p>Your HTML content...</p>
```

### Plain Text

```yaml
body:
  format: text
  content: Plain text will be escaped
```

## Generated Blog Features

The generator automatically creates:

- **Blog index** - List of all posts at `/blog`
- **Tag pages** - Individual pages for each tag at `/tags/{tag}`
- **RSS feed** - XML feed at `/rss.xml`
- **Sitemap** - SEO sitemap at `/sitemap.xml`

## Computed Fields

These fields are automatically generated:

- `body_html` - Rendered HTML from body content
- `excerpt` - Auto-generated excerpt from markdown (first 200 chars)
- `reading_time` - Estimated reading time in minutes

## Custom Fields

Add any custom fields to your YAML:

```yaml
title: My Post
author: John Doe
hero_image: /img/hero.jpg
cta_text: Learn More
cta_url: /signup

inject:
  ".author": author
  ".hero@src": hero_image
  ".cta": cta_text
  ".cta@href": cta_url
```

## Watch Mode

The dev server watches for changes in:

- `source/public/` - Content files
- `template/` - Templates, layouts, partials, assets

Changes trigger automatic rebuilds.

## Deployment

After running `ssg build`, deploy the `dist/` folder to any static host:

- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static file server

## Architecture

### Modules

- **ConfigLoader** - Load and validate configuration
- **ContentScanner** - Find all content files
- **YamlParser** - Parse and validate YAML files
- **TemplateResolver** - Load layouts and process includes
- **Injector** - Inject content using CSS selectors
- **MarkdownConverter** - Convert markdown to HTML
- **Renderer** - Orchestrate the rendering process
- **BlogGenerator** - Generate blog index, tags, RSS, sitemap
- **AssetCopier** - Copy static assets to dist
- **DevServer** - Local dev server with live reload
- **Builder** - Main build orchestrator

## Best Practices

1. **Use data-bind for simple mappings** - Cleaner than selector injection
2. **Keep layouts semantic** - Use proper HTML5 elements
3. **Organize templates logically** - One layout per content type
4. **Use partials for reusable components** - Header, footer, nav, etc.
5. **Enable pretty URLs** - Better for SEO
6. **Use markdown for blog posts** - Easier to write and maintain
7. **Tag your posts** - Automatic tag pages improve navigation

## Troubleshooting

### Selector not found warning

If you see warnings about selectors not being found:

- Check your template HTML for the correct selectors
- Enable `strict_selectors: true` in config to fail on missing selectors
- Use data-bind attributes for more reliable injection

### Template not found

- Ensure layout files exist in `template/layouts/`
- Check the `layout` field in your YAML matches the filename
- Layout names should not include `.html` extension in YAML

### Build fails

- Check YAML syntax with a validator
- Ensure all required fields are present
- Run with `--verbose` flag for detailed error messages

## License

MIT

## Contributing

Contributions welcome! This is a reference implementation demonstrating selector-based static site generation.
