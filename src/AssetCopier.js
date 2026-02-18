import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'fs';
import { join, dirname, relative } from 'path';

export class AssetCopier {
  constructor(config) {
    this.config = config;
    this.templatePath = config.resolvePath('template');
    this.sourcePath = config.resolvePath('source');
    this.distPath = config.resolvePath('dist');
  }

  /**
   * Copy all assets to dist
   */
  copyAll() {
    const results = {
      templateAssets: [],
      staticFiles: []
    };

    // Copy template assets (css, js, images, etc.)
    results.templateAssets = this.copyTemplateAssets();

    return results;
  }

  /**
   * Copy template assets folder to dist
   */
  copyTemplateAssets() {
    const assetsPath = join(this.templatePath, 'assets');

    if (!existsSync(assetsPath)) {
      console.warn('Warning: template/assets directory not found');
      return [];
    }

    const destPath = join(this.distPath, 'assets');
    return this.copyDirectory(assetsPath, destPath);
  }

  /**
   * Copy a static file from source to dist
   */
  copyStaticFile(sourceFile, relativePath) {
    const destPath = join(this.distPath, relativePath);
    const destDir = dirname(destPath);

    // Ensure directory exists
    mkdirSync(destDir, { recursive: true });

    // Copy file
    copyFileSync(sourceFile, destPath);

    return {
      source: sourceFile,
      destination: destPath,
      relativePath
    };
  }

  /**
   * Recursively copy a directory
   */
  copyDirectory(srcDir, destDir) {
    const copied = [];

    if (!existsSync(srcDir)) {
      return copied;
    }

    // Ensure destination exists
    mkdirSync(destDir, { recursive: true });

    const entries = readdirSync(srcDir);

    for (const entry of entries) {
      const srcPath = join(srcDir, entry);
      const destPath = join(destDir, entry);
      const stat = statSync(srcPath);

      if (stat.isDirectory()) {
        const subCopied = this.copyDirectory(srcPath, destPath);
        copied.push(...subCopied);
      } else {
        copyFileSync(srcPath, destPath);
        copied.push({
          source: srcPath,
          destination: destPath,
          relativePath: relative(this.templatePath, srcPath)
        });
      }
    }

    return copied;
  }

  /**
   * Clean the dist directory
   */
  clean() {
    if (!existsSync(this.distPath)) {
      return;
    }

    // Simple clean: remove and recreate
    rmSync(this.distPath, { recursive: true, force: true });
    mkdirSync(this.distPath, { recursive: true });
  }
}
