import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export class Initializer {
  constructor(targetDir = '.') {
    this.targetDir = targetDir;
  }

  async initialize() {
    console.log(`Initializing SSG project in ${this.targetDir}...\n`);

    // Create directory structure
    this.createDirectories();

    // Create config file
    this.createConfig();

    // Create template files
    this.createTemplates();

    // Create sample content
    this.createSampleContent();

    // Create package.json if it doesn't exist
    this.createPackageJson();

    console.log('✅ Project structure created');
  }

  createDirectories() {
    const dirs = [
      'template/layouts',
      'template/partials',
      'template/assets/css',
      'template/assets/js',
      'template/assets/img',
      'source/public/blog',
      'dist'
    ];

    for (const dir of dirs) {
      const path = join(this.targetDir, dir);
      mkdirSync(path, { recursive: true });
    }

    console.log('📁 Created directory structure');
  }

  createConfig() {
    const config = `site:
  name: My Site
  url: https://example.com
  language: en

paths:
  template: template
  source: source/public
  dist: dist
  cache: .cache

build:
  clean: true
  pretty_urls: true
  strict_selectors: false

blog:
  posts_dir: blog
  index_layout: page
  index_slug: blog
  posts_per_page: 10
`;

    writeFileSync(join(this.targetDir, 'config.yml'), config, 'utf-8');
    console.log('⚙️  Created config.yml');
  }

  createTemplates() {
    // Base layout
    const baseLayout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-bind="title">My Site</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <!-- @include partials/header.html -->

  <main class="content" data-bind="body_html">
    <!-- Content will be injected here -->
  </main>

  <!-- @include partials/footer.html -->
  <script src="/assets/js/main.js"></script>
</body>
</html>`;

    writeFileSync(join(this.targetDir, 'template/layouts/base.html'), baseLayout, 'utf-8');

    // Page layout
    const pageLayout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-bind="title">My Site</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <!-- @include partials/header.html -->

  <main class="page-content">
    <h1 data-bind="title">Page Title</h1>
    <div class="content" data-bind="body_html">
      <!-- Page content -->
    </div>
  </main>

  <!-- @include partials/footer.html -->
</body>
</html>`;

    writeFileSync(join(this.targetDir, 'template/layouts/page.html'), pageLayout, 'utf-8');

    // Post layout
    const postLayout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-bind="title">My Site</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <!-- @include partials/header.html -->

  <main class="post-content">
    <article>
      <h1 class="title" data-bind="title">Post Title</h1>
      <div class="post-meta">
        <time class="date" data-bind="date"></time>
        <span class="reading-time" data-bind="reading_time"></span> min read
      </div>
      <div class="content" data-bind="body_html">
        <!-- Post content -->
      </div>
    </article>
  </main>

  <!-- @include partials/footer.html -->
</body>
</html>`;

    writeFileSync(join(this.targetDir, 'template/layouts/post.html'), postLayout, 'utf-8');

    // Header partial
    const header = `<header class="site-header">
  <div class="container">
    <h1 class="site-title"><a href="/">My Site</a></h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/blog">Blog</a>
    </nav>
  </div>
</header>`;

    writeFileSync(join(this.targetDir, 'template/partials/header.html'), header, 'utf-8');

    // Footer partial
    const footer = `<footer class="site-footer">
  <div class="container">
    <p>&copy; 2025 My Site. Built with SSG.</p>
  </div>
</footer>`;

    writeFileSync(join(this.targetDir, 'template/partials/footer.html'), footer, 'utf-8');

    // CSS
    const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-header {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.site-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title a {
  color: white;
  text-decoration: none;
}

.site-header nav a {
  color: white;
  text-decoration: none;
  margin-left: 1.5rem;
}

.site-header nav a:hover {
  text-decoration: underline;
}

main {
  min-height: 60vh;
  padding: 2rem 20px;
}

.page-content, .post-content {
  max-width: 800px;
  margin: 0 auto;
}

.post-meta {
  color: #666;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.content {
  margin-top: 2rem;
}

.content h1, .content h2, .content h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.content p {
  margin-bottom: 1rem;
}

.content code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
}

.content pre {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.post-list {
  list-style: none;
}

.post-preview {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.post-preview h2 {
  margin-bottom: 0.5rem;
}

.post-preview h2 a {
  color: #2c3e50;
  text-decoration: none;
}

.post-preview h2 a:hover {
  color: #3498db;
}

.post-preview .post-meta {
  border: none;
  padding: 0;
  margin-bottom: 1rem;
}

.post-preview .excerpt {
  color: #666;
}

.tag {
  display: inline-block;
  background: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.85rem;
  margin-right: 0.5rem;
}

.site-footer {
  background: #2c3e50;
  color: white;
  padding: 2rem 0;
  margin-top: 4rem;
  text-align: center;
}
`;

    writeFileSync(join(this.targetDir, 'template/assets/css/style.css'), css, 'utf-8');

    // JS
    const js = `// Add your JavaScript here
console.log('SSG site loaded!');
`;

    writeFileSync(join(this.targetDir, 'template/assets/js/main.js'), js, 'utf-8');

    console.log('📄 Created template files');
  }

  createSampleContent() {
    // Home page
    const index = `type: page
layout: page
title: Welcome to My Site
slug: index

inject:
  "h1": title
  ".content": body_html

body:
  format: markdown
  content: |
    # Welcome!

    This is a static site built with SSG - a static site generator that uses CSS selectors for content injection.

    ## Features

    - Real HTML/CSS/JS templates (no custom templating language)
    - YAML files as content source
    - CSS selector-based content injection
    - Markdown support
    - Blog features (tags, RSS, sitemap)
    - Live reload dev server

    Check out the [blog](/blog) to see posts in action!
`;

    writeFileSync(join(this.targetDir, 'source/public/index.yml'), index, 'utf-8');

    // About page
    const about = `type: page
layout: page
title: About
slug: about

inject:
  "h1": title
  ".content": body_html

body:
  format: markdown
  content: |
    # About This Site

    This site was built using a selector-based static site generator.

    The big differentiator: content injection happens by CSS selectors, so designers can work with normal HTML/CSS, and writers can edit YAML.
`;

    writeFileSync(join(this.targetDir, 'source/public/about.yml'), about, 'utf-8');

    // Sample blog post
    const post = `type: post
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
    # Hello World!

    This is my first blog post using the SSG static site generator.

    ## Features

    - **Markdown support**: Write content in markdown
    - **Tag pages**: Automatic tag page generation
    - **RSS feed**: Stay updated with RSS
    - **Sitemap**: SEO-friendly sitemap generation

    ## Code Example

    \`\`\`javascript
    console.log('Hello from SSG!');
    \`\`\`

    Check out more posts in the [blog](/blog)!
`;

    writeFileSync(join(this.targetDir, 'source/public/blog/my-first-post.yml'), post, 'utf-8');

    console.log('📝 Created sample content');
  }

  createPackageJson() {
    const packageJsonPath = join(this.targetDir, 'package.json');

    if (existsSync(packageJsonPath)) {
      console.log('📦 package.json already exists, skipping');
      return;
    }

    const packageJson = {
      name: 'my-ssg-site',
      version: '1.0.0',
      description: 'My static site built with SSG',
      scripts: {
        build: 'ssg build',
        serve: 'ssg serve',
        new: 'ssg new'
      },
      dependencies: {},
      devDependencies: {}
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
    console.log('📦 Created package.json');
  }
}
