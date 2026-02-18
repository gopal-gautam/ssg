import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class TemplateResolver {
  constructor(config) {
    this.config = config;
    this.templatePath = config.resolvePath('template');
    this.layoutsPath = join(this.templatePath, 'layouts');
    this.partialsPath = join(this.templatePath, 'partials');
    this.cache = new Map();
  }

  /**
   * Load a layout file
   */
  loadLayout(layoutName) {
    const cacheKey = `layout:${layoutName}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const layoutPath = join(this.layoutsPath, `${layoutName}.html`);

    if (!existsSync(layoutPath)) {
      throw new Error(`Layout not found: ${layoutPath}`);
    }

    try {
      const content = readFileSync(layoutPath, 'utf-8');
      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(`Failed to load layout ${layoutName}: ${error.message}`);
    }
  }

  /**
   * Load a partial file
   */
  loadPartial(partialName) {
    const cacheKey = `partial:${partialName}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const partialPath = join(this.partialsPath, `${partialName}.html`);

    if (!existsSync(partialPath)) {
      throw new Error(`Partial not found: ${partialPath}`);
    }

    try {
      const content = readFileSync(partialPath, 'utf-8');
      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(`Failed to load partial ${partialName}: ${error.message}`);
    }
  }

  /**
   * Process includes in template HTML
   * Supports: <!-- @include partials/header.html -->
   */
  processIncludes(html) {
    const includePattern = /<!--\s*@include\s+(?:partials\/)?([^\s]+?\.html)\s*-->/g;

    return html.replace(includePattern, (match, partialPath) => {
      // Remove .html extension if present
      const partialName = partialPath.replace(/\.html$/, '');

      try {
        const partialContent = this.loadPartial(partialName);
        // Recursively process includes in partials
        return this.processIncludes(partialContent);
      } catch (error) {
        console.warn(`Warning: ${error.message}`);
        return `<!-- Failed to include: ${partialPath} -->`;
      }
    });
  }

  /**
   * Resolve a complete template with layout and includes
   */
  resolve(layoutName) {
    const layout = this.loadLayout(layoutName);
    return this.processIncludes(layout);
  }

  /**
   * Clear the template cache (useful for watch mode)
   */
  clearCache() {
    this.cache.clear();
  }
}
