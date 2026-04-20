import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { ContentScanner } from '../src/ContentScanner.js';

const TMP = 'test/tmp/scanner';
const SOURCE = join(TMP, 'public');
const BLOG = join(SOURCE, 'blog');

function makeConfig(postsDir = 'blog') {
  return {
    resolvePath: () => resolve(SOURCE),
    get: (k) => k === 'blog.posts_dir' ? postsDir : undefined
  };
}

before(() => {
  mkdirSync(BLOG, { recursive: true });
  writeFileSync(join(SOURCE, 'index.yml'), 'title: Home');
  writeFileSync(join(SOURCE, 'about.yml'), 'title: About');
  writeFileSync(join(BLOG, 'post-one.yml'), 'title: Post One');
  writeFileSync(join(SOURCE, 'style.css'), 'body {}');
  writeFileSync(join(SOURCE, 'page.html'), '<html></html>');
});

describe('ContentScanner', () => {
  describe('scan()', () => {
    it('throws when source directory does not exist', () => {
      const config = {
        resolvePath: () => resolve('test/tmp/nonexistent'),
        get: () => 'blog'
      };
      const scanner = new ContentScanner(config);
      assert.throws(() => scanner.scan(), /Source directory not found/);
    });

    it('returns pages, posts, and static arrays', () => {
      const scanner = new ContentScanner(makeConfig());
      const result = scanner.scan();
      assert.ok(Array.isArray(result.pages));
      assert.ok(Array.isArray(result.posts));
      assert.ok(Array.isArray(result.static));
    });

    it('categorizes YAML files outside blog dir as pages', () => {
      const scanner = new ContentScanner(makeConfig());
      const result = scanner.scan();
      const names = result.pages.map(p => p.relativePath);
      assert.ok(names.some(n => n.includes('index.yml')));
      assert.ok(names.some(n => n.includes('about.yml')));
    });

    it('categorizes YAML files inside blog dir as posts', () => {
      const scanner = new ContentScanner(makeConfig());
      const result = scanner.scan();
      assert.ok(result.posts.length >= 1);
      assert.ok(result.posts[0].isBlogPost === true);
    });

    it('categorizes HTML files as static', () => {
      const scanner = new ContentScanner(makeConfig());
      const result = scanner.scan();
      const htmlFiles = result.static.filter(f => f.type === 'html');
      assert.ok(htmlFiles.length >= 1);
    });

    it('categorizes non-YAML/HTML files as static assets', () => {
      const scanner = new ContentScanner(makeConfig());
      const result = scanner.scan();
      const assets = result.static.filter(f => f.type === 'asset');
      assert.ok(assets.length >= 1);
    });
  });

  describe('getPages() / getPosts() / getStatic() / getAll()', () => {
    it('getPages returns only pages', () => {
      const scanner = new ContentScanner(makeConfig());
      scanner.scan();
      assert.deepEqual(scanner.getPages(), scanner.contentIndex.pages);
    });

    it('getAll returns combined array', () => {
      const scanner = new ContentScanner(makeConfig());
      scanner.scan();
      const all = scanner.getAll();
      const expected = [
        ...scanner.contentIndex.pages,
        ...scanner.contentIndex.posts,
        ...scanner.contentIndex.static
      ];
      assert.equal(all.length, expected.length);
    });
  });
});
