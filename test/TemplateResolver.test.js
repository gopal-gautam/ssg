import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { TemplateResolver } from '../src/TemplateResolver.js';

const TMP = 'test/tmp/templates';
const LAYOUTS = join(TMP, 'layouts');
const PARTIALS = join(TMP, 'partials');

const mockConfig = {
  resolvePath: () => resolve(TMP)
};

before(() => {
  mkdirSync(LAYOUTS, { recursive: true });
  mkdirSync(PARTIALS, { recursive: true });
});

describe('TemplateResolver', () => {
  describe('loadLayout()', () => {
    it('loads a layout file', () => {
      writeFileSync(join(LAYOUTS, 'page.html'), '<html><body></body></html>');
      const resolver = new TemplateResolver(mockConfig);
      const result = resolver.loadLayout('page');
      assert.equal(result, '<html><body></body></html>');
    });

    it('throws for missing layout', () => {
      const resolver = new TemplateResolver(mockConfig);
      assert.throws(() => resolver.loadLayout('missing'), /Layout not found/);
    });

    it('caches layout on second load', () => {
      writeFileSync(join(LAYOUTS, 'cached.html'), '<div>cached</div>');
      const resolver = new TemplateResolver(mockConfig);
      resolver.loadLayout('cached');
      // Overwrite file — cache should still return original
      writeFileSync(join(LAYOUTS, 'cached.html'), '<div>changed</div>');
      const result = resolver.loadLayout('cached');
      assert.equal(result, '<div>cached</div>');
    });
  });

  describe('loadPartial()', () => {
    it('loads a partial file', () => {
      writeFileSync(join(PARTIALS, 'header.html'), '<header>Header</header>');
      const resolver = new TemplateResolver(mockConfig);
      const result = resolver.loadPartial('header');
      assert.equal(result, '<header>Header</header>');
    });

    it('throws for missing partial', () => {
      const resolver = new TemplateResolver(mockConfig);
      assert.throws(() => resolver.loadPartial('ghost'), /Partial not found/);
    });
  });

  describe('processIncludes()', () => {
    it('replaces include comments with partial content', () => {
      writeFileSync(join(PARTIALS, 'nav.html'), '<nav>Nav</nav>');
      const resolver = new TemplateResolver(mockConfig);
      const result = resolver.processIncludes('<!-- @include partials/nav.html -->');
      assert.equal(result, '<nav>Nav</nav>');
    });

    it('handles missing partial gracefully with comment', () => {
      const resolver = new TemplateResolver(mockConfig);
      const result = resolver.processIncludes('<!-- @include partials/nope.html -->');
      assert.match(result, /Failed to include/);
    });
  });

  describe('resolve()', () => {
    it('resolves layout with includes', () => {
      writeFileSync(join(PARTIALS, 'foot.html'), '<footer>Footer</footer>');
      writeFileSync(join(LAYOUTS, 'full.html'), '<html><!-- @include partials/foot.html --></html>');
      const resolver = new TemplateResolver(mockConfig);
      const result = resolver.resolve('full');
      assert.match(result, /<footer>Footer<\/footer>/);
    });
  });

  describe('clearCache()', () => {
    it('clears the cache', () => {
      writeFileSync(join(LAYOUTS, 'clear.html'), '<div>v1</div>');
      const resolver = new TemplateResolver(mockConfig);
      resolver.loadLayout('clear');
      resolver.clearCache();
      writeFileSync(join(LAYOUTS, 'clear.html'), '<div>v2</div>');
      const result = resolver.loadLayout('clear');
      assert.equal(result, '<div>v2</div>');
    });
  });
});
