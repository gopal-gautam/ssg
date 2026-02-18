import { rmSync, mkdirSync, existsSync } from 'fs';
import { ConfigLoader } from './ConfigLoader.js';
import { ContentScanner } from './ContentScanner.js';
import { YamlParser } from './YamlParser.js';
import { TemplateResolver } from './TemplateResolver.js';
import { Injector } from './Injector.js';
import { MarkdownConverter } from './MarkdownConverter.js';
import { Renderer } from './Renderer.js';
import { BlogGenerator } from './BlogGenerator.js';
import { AssetCopier } from './AssetCopier.js';

export class Builder {
  constructor(options = {}) {
    this.configPath = options.config || 'config.yml';
    this.verbose = options.verbose || false;
  }

  async build() {
    console.log('Starting build...\n');

    try {
      // 1. Load configuration
      this.log('Loading configuration...');
      const configLoader = new ConfigLoader(this.configPath);
      const config = configLoader.load();
      this.log(`✓ Configuration loaded\n`);

      // 2. Clean dist if configured
      if (config.build.clean) {
        this.log('Cleaning dist directory...');
        this.cleanDist(configLoader);
        this.log('✓ Dist cleaned\n');
      }

      // 3. Initialize modules
      const yamlParser = new YamlParser(configLoader);
      const templateResolver = new TemplateResolver(configLoader);
      const markdownConverter = new MarkdownConverter();
      const injector = new Injector(configLoader, yamlParser);
      const renderer = new Renderer(configLoader, templateResolver, injector, markdownConverter, yamlParser);
      const assetCopier = new AssetCopier(configLoader);

      // 4. Scan content
      this.log('Scanning content...');
      const scanner = new ContentScanner(configLoader);
      const contentIndex = scanner.scan();
      this.log(`✓ Found ${contentIndex.pages.length} pages, ${contentIndex.posts.length} posts, ${contentIndex.static.length} static files\n`);

      // 5. Parse and render pages
      this.log('Rendering pages...');
      const renderedPages = [];
      for (const page of contentIndex.pages) {
        const data = yamlParser.parse(page.fullPath, page.relativePath);
        const result = renderer.render(data);
        renderedPages.push(data);
        this.log(`  ✓ ${page.relativePath} → ${result.outputPath}`);
      }
      console.log();

      // 6. Parse and render posts
      this.log('Rendering posts...');
      const renderedPosts = [];
      for (const post of contentIndex.posts) {
        const data = yamlParser.parse(post.fullPath, post.relativePath);
        const result = renderer.render(data);
        renderedPosts.push(data);
        this.log(`  ✓ ${post.relativePath} → ${result.outputPath}`);
      }
      console.log();

      // 7. Generate blog features
      if (renderedPosts.length > 0) {
        this.log('Generating blog features...');
        const blogGenerator = new BlogGenerator(configLoader, templateResolver, injector, markdownConverter, yamlParser, renderer);
        const blogResults = blogGenerator.generate(renderedPosts, renderedPages);

        if (blogResults.index) {
          this.log(`  ✓ Blog index: ${blogResults.index.outputPath}`);
        }
        if (blogResults.tagPages.length > 0) {
          this.log(`  ✓ Tag pages: ${blogResults.tagPages.length} generated`);
        }
        if (blogResults.rss) {
          this.log(`  ✓ RSS feed: ${blogResults.rss.path}`);
        }
        if (blogResults.sitemap) {
          this.log(`  ✓ Sitemap: ${blogResults.sitemap.path}`);
        }
        console.log();
      }

      // 8. Copy assets
      this.log('Copying assets...');
      const assetResults = assetCopier.copyAll();
      this.log(`✓ Copied ${assetResults.templateAssets.length} template assets\n`);

      // 9. Copy static files
      this.log('Copying static files...');
      let staticCount = 0;
      for (const staticFile of contentIndex.static) {
        assetCopier.copyStaticFile(staticFile.fullPath, staticFile.relativePath);
        staticCount++;
      }
      this.log(`✓ Copied ${staticCount} static files\n`);

      // Done
      console.log('✅ Build completed successfully!');
      console.log(`📁 Output: ${config.paths.dist}/\n`);

      return {
        success: true,
        stats: {
          pages: renderedPages.length,
          posts: renderedPosts.length,
          static: staticCount,
          assets: assetResults.templateAssets.length
        }
      };

    } catch (error) {
      console.error('\n❌ Build failed:');
      console.error(error.message);

      if (this.verbose) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  cleanDist(config) {
    const distPath = config.resolvePath('dist');

    if (existsSync(distPath)) {
      rmSync(distPath, { recursive: true, force: true });
    }

    mkdirSync(distPath, { recursive: true });
  }

  log(message) {
    if (this.verbose || !message.startsWith('  ')) {
      console.log(message);
    }
  }
}
