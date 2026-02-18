import { readdirSync, statSync, existsSync } from 'fs';
import { join, relative, extname } from 'path';

export class ContentScanner {
  constructor(config) {
    this.config = config;
    this.sourcePath = config.resolvePath('source');
    this.contentIndex = {
      pages: [],
      posts: [],
      static: []
    };
  }

  scan() {
    if (!existsSync(this.sourcePath)) {
      throw new Error(`Source directory not found: ${this.sourcePath}`);
    }

    this.contentIndex = {
      pages: [],
      posts: [],
      static: []
    };

    this.scanDirectory(this.sourcePath);

    return this.contentIndex;
  }

  scanDirectory(dirPath, baseDir = this.sourcePath) {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      const relativePath = relative(baseDir, fullPath);

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, baseDir);
      } else if (stat.isFile()) {
        this.indexFile(fullPath, relativePath);
      }
    }
  }

  indexFile(fullPath, relativePath) {
    const ext = extname(fullPath);

    if (ext === '.yml' || ext === '.yaml') {
      // Determine if it's in the blog directory
      const blogDir = this.config.get('blog.posts_dir');
      const isBlogPost = relativePath.startsWith(blogDir + '/') || relativePath.startsWith(blogDir + '\\');

      const entry = {
        fullPath,
        relativePath,
        type: 'yaml',
        isBlogPost
      };

      if (isBlogPost) {
        this.contentIndex.posts.push(entry);
      } else {
        this.contentIndex.pages.push(entry);
      }
    } else if (ext === '.html' || ext === '.htm') {
      // Raw HTML passthrough
      this.contentIndex.static.push({
        fullPath,
        relativePath,
        type: 'html'
      });
    } else {
      // Other static files (images, etc.)
      this.contentIndex.static.push({
        fullPath,
        relativePath,
        type: 'asset'
      });
    }
  }

  getPages() {
    return this.contentIndex.pages;
  }

  getPosts() {
    return this.contentIndex.posts;
  }

  getStatic() {
    return this.contentIndex.static;
  }

  getAll() {
    return [
      ...this.contentIndex.pages,
      ...this.contentIndex.posts,
      ...this.contentIndex.static
    ];
  }
}
