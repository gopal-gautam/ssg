import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { join, resolve } from 'path';

export class ConfigLoader {
  constructor(configPath = 'config.yml') {
    this.configPath = configPath;
    this.config = null;
  }

  load() {
    const fullPath = resolve(this.configPath);

    if (!existsSync(fullPath)) {
      throw new Error(`Configuration file not found: ${fullPath}`);
    }

    try {
      const content = readFileSync(fullPath, 'utf-8');
      this.config = parse(content);

      // Apply defaults
      this.config = this.applyDefaults(this.config);

      return this.config;
    } catch (error) {
      throw new Error(`Failed to parse config.yml: ${error.message}`);
    }
  }

  applyDefaults(config) {
    return {
      site: {
        name: config.site?.name || 'My Site',
        url: config.site?.url || 'http://localhost:3000',
        language: config.site?.language || 'en',
        ...config.site
      },
      paths: {
        template: config.paths?.template || 'template',
        source: config.paths?.source || 'source/public',
        dist: config.paths?.dist || 'dist',
        cache: config.paths?.cache || '.cache',
        ...config.paths
      },
      build: {
        clean: config.build?.clean ?? true,
        pretty_urls: config.build?.pretty_urls ?? true,
        strict_selectors: config.build?.strict_selectors ?? false,
        ...config.build
      },
      blog: {
        posts_dir: config.blog?.posts_dir || 'blog',
        index_layout: config.blog?.index_layout || 'page',
        index_slug: config.blog?.index_slug || 'blog',
        posts_per_page: config.blog?.posts_per_page || 10,
        ...config.blog
      }
    };
  }

  get(path) {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.');
    }

    const parts = path.split('.');
    let value = this.config;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return undefined;
    }

    return value;
  }

  resolvePath(type) {
    const base = this.get(`paths.${type}`);
    return resolve(base);
  }
}
