# SSG - Selector-Based Static Site Generator

## Documentation Index

Welcome to the SSG documentation. Choose the guide that best fits your needs:

### 🚀 Getting Started

- **[QUICKSTART.md](QUICKSTART.md)** - Start here! 5-minute guide to get your first site running
  - Installation steps
  - Your first build
  - Creating content
  - Development workflow

### 📖 Complete Reference

- **[README.md](README.md)** - Full documentation
  - All features explained
  - Configuration reference
  - CLI commands
  - Troubleshooting
  - Best practices
  - Deployment guide

### 💡 Examples & Patterns

- **[EXAMPLES.md](EXAMPLES.md)** - Real-world examples
  - Blog posts with tags
  - Landing pages with hero sections
  - Portfolio pages
  - Multi-language setup
  - SEO optimization
  - Advanced patterns

### 🏗️ Architecture & Design

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical overview
  - Architecture details
  - Module breakdown
  - Build process flow
  - Design decisions
  - Extensibility points

## Quick Links

### Installation
```bash
npm install
node bin/cli.js init
cd my-site
node ../bin/cli.js build
node ../bin/cli.js serve
```

### Core Concepts

**Content Injection via Selectors:**
```yaml
inject:
  "h1": title
  ".hero@src": image
  ".content": body_html
```

**Or via Data-Bind:**
```html
<h1 data-bind="title">Title</h1>
<div data-bind="body_html"></div>
```

### CLI Commands

- `ssg init` - Create new project
- `ssg build` - Build static site
- `ssg serve` - Dev server + watch
- `ssg new post "Title"` - Create post
- `ssg new page "Title"` - Create page

## Project Files

```
ssg/
├── README.md              ← Complete documentation
├── QUICKSTART.md          ← Quick start guide
├── EXAMPLES.md            ← Code examples
├── PROJECT_SUMMARY.md     ← Technical overview
├── INDEX.md               ← This file
├── package.json
├── .gitignore
├── bin/
│   └── cli.js            ← CLI entry point
├── src/                  ← Core modules
│   ├── Builder.js
│   ├── ConfigLoader.js
│   ├── ContentScanner.js
│   ├── YamlParser.js
│   ├── TemplateResolver.js
│   ├── Injector.js
│   ├── MarkdownConverter.js
│   ├── Renderer.js
│   ├── BlogGenerator.js
│   ├── AssetCopier.js
│   ├── DevServer.js
│   └── Initializer.js
└── test-site/            ← Working example
```

## Features Overview

### ✅ Core Features
- YAML content files with front-matter
- CSS selector-based injection
- data-bind attribute support
- Markdown, HTML, and text body formats
- Layout system with partials
- Pretty URLs
- Fast builds

### ✅ Blog Features
- Automatic blog index
- Tag pages (one per tag)
- RSS feed generation
- Sitemap.xml
- Draft support
- Auto-generated excerpts
- Reading time calculation

### ✅ Developer Experience
- Live reload dev server
- Watch mode with auto-rebuild
- Helpful error messages
- CLI for common tasks
- Project scaffolding

## Why SSG?

### The Big Differentiator

**Traditional SSGs:**
```liquid
<!-- Liquid/Handlebars/Nunjucks -->
<h1>{{ title }}</h1>
<div>{{ content }}</div>
```

**SSG (This Project):**
```html
<!-- Pure HTML -->
<h1 data-bind="title">Title</h1>
<div data-bind="content">Content</div>
```

Or with selectors:
```yaml
inject:
  "h1": title
  "div.content": content
```

### Benefits

1. **No Template Syntax to Learn** - It's just HTML
2. **Designer Friendly** - Work in any HTML editor
3. **Preview-able** - Templates work standalone
4. **Flexible** - CSS selectors are powerful
5. **Maintainable** - Separation of content and presentation

## Typical Workflow

### 1. Setup (Once)
```bash
ssg init
npm install
```

### 2. Customize Templates
Edit files in `template/`:
- Layouts (`layouts/*.html`)
- Partials (`partials/*.html`)
- Styles (`assets/css/*.css`)

### 3. Create Content
```bash
ssg new post "My Great Article"
```

Edit `source/public/blog/my-great-article.yml`

### 4. Develop
```bash
ssg serve
```
Visit http://localhost:3000
Changes auto-rebuild!

### 5. Deploy
```bash
ssg build
```
Upload `dist/` to your host

## Common Use Cases

### Personal Blog
- ✅ Markdown posts
- ✅ Tag organization
- ✅ RSS feed
- ✅ SEO-friendly

### Portfolio Site
- ✅ Project showcases
- ✅ Custom layouts
- ✅ Image galleries
- ✅ Contact forms

### Documentation
- ✅ Multi-page docs
- ✅ Code examples
- ✅ Search-ready
- ✅ Clean navigation

### Landing Page
- ✅ Hero sections
- ✅ Custom fields
- ✅ Fast loading
- ✅ Easy updates

## Support & Contributions

- **Issues**: Report bugs or request features
- **Examples**: Share your SSG site
- **Templates**: Create and share themes
- **Plugins**: Extend functionality

## Next Steps

1. **New Users**: Read [QUICKSTART.md](QUICKSTART.md)
2. **Learning**: Browse [EXAMPLES.md](EXAMPLES.md)
3. **Reference**: Check [README.md](README.md)
4. **Contributing**: See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## License

MIT - Free to use and modify

## Credits

Built with:
- JSDOM for DOM manipulation
- marked for Markdown
- commander for CLI
- chokidar for file watching

---

**Ready to build your site?**

```bash
ssg init my-awesome-site
cd my-awesome-site
npm install
ssg serve
```

🎉 Happy building!
