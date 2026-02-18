import { dirname, join, basename, extname } from 'path';
import { mkdirSync, writeFileSync } from 'fs';

export class Renderer {
  constructor(config, templateResolver, injector, markdownConverter, yamlParser) {
    this.config = config;
    this.templateResolver = templateResolver;
    this.injector = injector;
    this.markdownConverter = markdownConverter;
    this.yamlParser = yamlParser;
    this.distPath = config.resolvePath('dist');
  }

  /**
   * Render a single page from YAML data
   */
  render(data) {
    try {
      // Process body content
      const processedData = this.processBodyContent(data);

      // Load and resolve template
      const templateHtml = this.templateResolver.resolve(data.layout);

      // Inject content using selectors
      const finalHtml = this.injector.inject(templateHtml, processedData);

      // Determine output path
      const outputPath = this.getOutputPath(data);

      // Write to disk
      this.writeOutput(outputPath, finalHtml);

      return {
        success: true,
        outputPath,
        data: processedData
      };
    } catch (error) {
      throw new Error(`Rendering failed for ${data._meta.filePath}: ${error.message}`);
    }
  }

  /**
   * Process body content based on format
   */
  processBodyContent(data) {
    const processed = { ...data };

    if (data.body && data.body.content) {
      const { format, content } = data.body;

      switch (format) {
        case 'markdown':
          processed.body_html = this.markdownConverter.convert(content);
          processed.excerpt = processed.excerpt || this.markdownConverter.generateExcerpt(content);
          processed.reading_time = this.markdownConverter.estimateReadingTime(content);
          break;

        case 'html':
          processed.body_html = content;
          break;

        case 'text':
        default:
          processed.body_html = this.escapeHtml(content);
          break;
      }
    }

    return processed;
  }

  /**
   * Determine output file path
   */
  getOutputPath(data) {
    const prettyUrls = this.config.get('build.pretty_urls');

    // Use custom permalink if specified
    if (data.permalink) {
      const path = join(this.distPath, data.permalink);
      return path.endsWith('.html') ? path : join(path, 'index.html');
    }

    // Build path from relative path
    const { relativePath } = data._meta;
    const dir = dirname(relativePath);
    const filename = basename(relativePath, extname(relativePath));

    if (prettyUrls) {
      // /about.yml -> /about/index.html
      if (filename === 'index') {
        return join(this.distPath, dir, 'index.html');
      }
      return join(this.distPath, dir, filename, 'index.html');
    } else {
      // /about.yml -> /about.html
      return join(this.distPath, dir, `${filename}.html`);
    }
  }

  /**
   * Write output file to disk
   */
  writeOutput(outputPath, content) {
    const dir = dirname(outputPath);

    // Ensure directory exists
    mkdirSync(dir, { recursive: true });

    // Write file
    writeFileSync(outputPath, content, 'utf-8');
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Get public URL for a page
   */
  getPublicUrl(data) {
    const baseUrl = this.config.get('site.url');
    const prettyUrls = this.config.get('build.pretty_urls');

    if (data.permalink) {
      return new URL(data.permalink, baseUrl).toString();
    }

    const { relativePath } = data._meta;
    const dir = dirname(relativePath);
    const filename = basename(relativePath, extname(relativePath));

    let path;
    if (prettyUrls) {
      path = filename === 'index' ? dir : join(dir, filename);
    } else {
      path = join(dir, `${filename}.html`);
    }

    return new URL(path.replace(/\\/g, '/'), baseUrl).toString();
  }
}
