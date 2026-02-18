# SSG Examples & Advanced Usage

## Example 1: Simple Blog Post with Tags

**File:** `source/public/blog/getting-started.yml`

```yaml
type: post
layout: post
title: Getting Started with SSG
slug: getting-started
date: 2025-01-15
tags: [tutorial, beginner, ssg]
draft: false

inject:
  "h1.title": title
  ".post-meta .date": date
  ".content": body_html

body:
  format: markdown
  content: |
    # Welcome to SSG!

    This is a **simple** static site generator that uses CSS selectors.

    ## Why Use SSG?

    - No complex templating language
    - Just HTML, CSS, and YAML
    - Perfect for designers and developers

    Check out more [tutorials](/tags/tutorial).
```

## Example 2: Landing Page with Hero Section

**File:** `source/public/index.yml`

```yaml
type: page
layout: base
title: Welcome to My Portfolio
slug: index

# Custom fields
hero:
  title: John Doe
  subtitle: Full Stack Developer
  cta_text: View My Work
  cta_url: /portfolio
  background: /assets/img/hero-bg.jpg

inject:
  ".hero h1": hero.title
  ".hero .subtitle": hero.subtitle
  ".hero .cta": hero.cta_text
  ".hero .cta@href": hero.cta_url
  ".hero@style": "background-image: url(/assets/img/hero-bg.jpg)"
  ".content": body_html

body:
  format: html
  content: |
    <section class="about">
      <h2>About Me</h2>
      <p>I build amazing web applications.</p>
    </section>
```

**Template:** `template/layouts/base.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title data-bind="title">Site Title</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <div class="hero">
    <h1>Hero Title</h1>
    <p class="subtitle">Subtitle</p>
    <a href="#" class="cta">CTA Button</a>
  </div>

  <main class="content">
    <!-- Content injected here -->
  </main>
</body>
</html>
```

## Example 3: Portfolio Page with Projects

**File:** `source/public/portfolio.yml`

```yaml
type: page
layout: page
title: My Portfolio
slug: portfolio

# Custom structured data
projects:
  - name: Project Alpha
    description: A cool web app
    url: https://alpha.example.com
    image: /assets/img/project-alpha.jpg
    tags: [React, Node.js]

  - name: Project Beta
    description: Mobile app
    url: https://beta.example.com
    image: /assets/img/project-beta.jpg
    tags: [Flutter, Firebase]

inject:
  "h1": title
  ".projects": projects_html

body:
  format: markdown
  content: |
    # My Work

    Here are some of my recent projects.
```

**Note:** For complex list rendering like `projects_html`, you'd need to extend the SSG with custom processing or use JavaScript on the client side to render from a data file.

## Example 4: Using Attribute Injection

**File:** `source/public/team.yml`

```yaml
type: page
layout: page
title: Our Team
slug: team

members:
  - name: Alice
    role: CEO
    photo: /img/alice.jpg
    linkedin: https://linkedin.com/in/alice

# Inject attributes
inject:
  "h1": title
  ".member-name": members[0].name
  ".member-role": members[0].role
  ".member-photo@src": members[0].photo
  ".member-linkedin@href": members[0].linkedin
```

## Example 5: Multi-language Setup

**File:** `source/public/about-en.yml`

```yaml
type: page
layout: page
title: About Us
slug: about
permalink: /en/about

inject:
  "h1": title
  ".content": body_html

body:
  format: markdown
  content: |
    # About Our Company

    We are a global company...
```

**File:** `source/public/about-es.yml`

```yaml
type: page
layout: page
title: Acerca de Nosotros
slug: about-es
permalink: /es/about

inject:
  "h1": title
  ".content": body_html

body:
  format: markdown
  content: |
    # Acerca de Nuestra Empresa

    Somos una empresa global...
```

## Example 6: Blog Post with Custom Metadata

**File:** `source/public/blog/advanced-tutorial.yml`

```yaml
type: post
layout: post
title: Advanced SSG Tutorial
slug: advanced-tutorial
date: 2025-02-01
tags: [tutorial, advanced]
draft: false

# Custom metadata
author: John Doe
reading_time: 10
featured_image: /img/tutorials/advanced.jpg
toc_enabled: true

# SEO metadata
seo:
  description: Learn advanced techniques for SSG
  keywords: ssg, static site, advanced
  og_image: /img/og/advanced-tutorial.jpg

inject:
  "h1.title": title
  ".author": author
  ".reading-time": reading_time
  ".featured-image@src": featured_image
  "meta[name='description']@content": seo.description
  "meta[property='og:image']@content": seo.og_image
  ".content": body_html

body:
  format: markdown
  content: |
    # Advanced Techniques

    This tutorial covers advanced SSG usage...
```

## Example 7: Custom Partial Includes

**Template:** `template/layouts/page.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title data-bind="title">Page Title</title>
  <!-- @include partials/meta-tags.html -->
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <!-- @include partials/header.html -->

  <main>
    <h1 data-bind="title">Title</h1>
    <div data-bind="body_html"></div>
  </main>

  <!-- @include partials/footer.html -->
  <!-- @include partials/analytics.html -->
</body>
</html>
```

**Partial:** `template/partials/meta-tags.html`

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="">
<meta property="og:type" content="website">
<meta property="og:title" content="">
<meta property="og:description" content="">
```

## Example 8: Plain HTML Passthrough

For pages that don't need YAML processing, just create an `.html` file:

**File:** `source/public/legacy.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Legacy Page</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <h1>Legacy HTML Page</h1>
  <p>This is copied as-is without processing.</p>
</body>
</html>
```

This file will be copied directly to `dist/legacy.html`.

## Example 9: Newsletter Signup Page

**File:** `source/public/newsletter.yml`

```yaml
type: page
layout: page
title: Subscribe to Newsletter
slug: newsletter

form:
  action: https://yourservice.com/subscribe
  method: POST
  button_text: Subscribe Now

inject:
  "h1": title
  "form@action": form.action
  "form@method": form.method
  ".submit-button": form.button_text
  ".content": body_html

body:
  format: html
  content: |
    <form class="newsletter-form">
      <input type="email" name="email" placeholder="Your email" required>
      <button type="submit" class="submit-button">Subscribe</button>
    </form>
    <p class="privacy">We respect your privacy.</p>
```

## Example 10: Custom Computed Fields

While the SSG automatically generates `excerpt` and `reading_time`, you can add your own:

**File:** `source/public/blog/tutorial.yml`

```yaml
type: post
layout: post
title: Complete SSG Guide
slug: complete-guide
date: 2025-03-01
tags: [tutorial, guide]

# Manually set excerpt instead of auto-generation
excerpt: This is a comprehensive guide to using SSG for your blog.

# Custom computed-style fields
difficulty: Beginner
estimated_time: 30 minutes
prerequisites:
  - Basic HTML knowledge
  - Basic YAML knowledge

inject:
  "h1.title": title
  ".difficulty": difficulty
  ".estimated-time": estimated_time
  ".content": body_html

body:
  format: markdown
  content: |
    # Complete Guide to SSG

    Your tutorial content...
```

## Directory Organization Tips

### Organizing Blog Posts by Date

```
source/public/blog/
├── 2025/
│   ├── 01/
│   │   ├── post-1.yml
│   │   └── post-2.yml
│   ├── 02/
│   │   └── post-3.yml
└── 2024/
    └── 12/
        └── old-post.yml
```

### Organizing by Category

```
source/public/
├── tutorials/
│   ├── beginner/
│   │   └── getting-started.yml
│   └── advanced/
│       └── optimization.yml
├── blog/
│   └── announcements.yml
└── docs/
    ├── api.yml
    └── guides.yml
```

## Advanced Configuration

### Custom Build Configuration

**File:** `config.yml`

```yaml
site:
  name: My Advanced Site
  url: https://mysite.com
  language: en
  author: John Doe
  description: A showcase of SSG features

paths:
  template: template
  source: source/public
  dist: dist
  cache: .cache

build:
  clean: true
  pretty_urls: true
  strict_selectors: false
  minify_html: false  # Future feature
  generate_sourcemaps: false  # Future feature

blog:
  posts_dir: blog
  index_layout: page
  index_slug: blog
  posts_per_page: 10
  excerpt_length: 200
  date_format: "MMMM DD, YYYY"

# Custom settings (accessible via config.get('custom.xxx'))
custom:
  analytics_id: UA-XXXXX-Y
  social:
    twitter: "@myhandle"
    github: "myusername"
```

## Performance Tips

1. **Use pretty URLs** for better caching
2. **Organize assets** in `template/assets/`
3. **Compress images** before adding to assets
4. **Minimize CSS/JS** before deployment
5. **Use CDN** for common libraries

## SEO Best Practices

1. **Always include:**
   - `title` field
   - `excerpt` or custom description
   - Proper heading hierarchy in markdown

2. **Use semantic HTML** in templates

3. **Generate sitemap** (automatic)

4. **Create RSS feed** (automatic for blogs)

5. **Add meta tags** in layout:
   ```html
   <meta name="description" data-bind="excerpt">
   <meta property="og:title" data-bind="title">
   <meta property="og:description" data-bind="excerpt">
   ```

---

These examples demonstrate the flexibility of SSG for various use cases while maintaining simplicity through selector-based content injection.
