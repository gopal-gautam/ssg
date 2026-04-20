import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MarkdownConverter } from '../src/MarkdownConverter.js';

describe('MarkdownConverter', () => {
  let converter;

  it('setup', () => {
    converter = new MarkdownConverter();
  });

  describe('convert()', () => {
    it('returns empty string for falsy input', () => {
      const c = new MarkdownConverter();
      assert.equal(c.convert(''), '');
      assert.equal(c.convert(null), '');
      assert.equal(c.convert(undefined), '');
    });

    it('converts basic markdown to HTML', () => {
      const c = new MarkdownConverter();
      const result = c.convert('# Hello');
      assert.match(result, /<h1[^>]*>Hello<\/h1>/);
    });

    it('converts bold and italic', () => {
      const c = new MarkdownConverter();
      const result = c.convert('**bold** and *italic*');
      assert.match(result, /<strong>bold<\/strong>/);
      assert.match(result, /<em>italic<\/em>/);
    });

    it('converts links', () => {
      const c = new MarkdownConverter();
      const result = c.convert('[click](https://example.com)');
      assert.match(result, /<a href="https:\/\/example\.com">click<\/a>/);
    });

    it('converts unordered lists', () => {
      const c = new MarkdownConverter();
      const result = c.convert('- item1\n- item2');
      assert.match(result, /<ul>/);
      assert.match(result, /<li>item1<\/li>/);
    });
  });

  describe('generateExcerpt()', () => {
    it('returns empty string for falsy input', () => {
      const c = new MarkdownConverter();
      assert.equal(c.generateExcerpt(''), '');
      assert.equal(c.generateExcerpt(null), '');
    });

    it('returns full text when shorter than limit', () => {
      const c = new MarkdownConverter();
      const result = c.generateExcerpt('Short text.', 200);
      assert.equal(result, 'Short text.');
    });

    it('truncates at word boundary with ellipsis', () => {
      const c = new MarkdownConverter();
      const long = 'word '.repeat(60).trim();
      const result = c.generateExcerpt(long, 50);
      assert.ok(result.endsWith('...'));
      assert.ok(result.length <= 54); // 50 + '...'
    });
  });

  describe('estimateReadingTime()', () => {
    it('returns 0 for falsy input', () => {
      const c = new MarkdownConverter();
      assert.equal(c.estimateReadingTime(''), 0);
      assert.equal(c.estimateReadingTime(null), 0);
    });

    it('returns at least 1 minute for any content', () => {
      const c = new MarkdownConverter();
      assert.equal(c.estimateReadingTime('Hello world'), 1);
    });

    it('estimates correctly for 400 words (2 min)', () => {
      const c = new MarkdownConverter();
      const text = 'word '.repeat(400).trim();
      assert.equal(c.estimateReadingTime(text), 2);
    });
  });
});
