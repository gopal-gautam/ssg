import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { YamlParser } from '../src/YamlParser.js';

const TMP = 'test/tmp/yaml';

// Minimal config mock
const mockConfig = {
  get: () => undefined,
  resolvePath: () => TMP
};

function writeYaml(name, content) {
  mkdirSync(TMP, { recursive: true });
  const p = join(TMP, name);
  writeFileSync(p, content, 'utf-8');
  return p;
}

describe('YamlParser', () => {
  before(() => mkdirSync(TMP, { recursive: true }));

  describe('normalize()', () => {
    it('applies defaults for missing fields', () => {
      const parser = new YamlParser(mockConfig);
      const result = parser.normalize({ title: 'Test' }, '/some/file.yml', 'file.yml');
      assert.equal(result.type, 'page');
      assert.equal(result.layout, 'page');
      assert.equal(result.slug, 'file');
      assert.deepEqual(result.tags, []);
      assert.equal(result.draft, false);
    });

    it('uses filename as title when title is missing', () => {
      const parser = new YamlParser(mockConfig);
      const result = parser.normalize({}, '/path/my-page.yml', 'my-page.yml');
      assert.equal(result.title, 'my-page');
    });

    it('preserves provided values', () => {
      const parser = new YamlParser(mockConfig);
      const result = parser.normalize(
        { type: 'post', layout: 'post', title: 'Hello', slug: 'hello', tags: ['a', 'b'] },
        '/path/hello.yml', 'hello.yml'
      );
      assert.equal(result.type, 'post');
      assert.equal(result.layout, 'post');
      assert.equal(result.title, 'Hello');
      assert.deepEqual(result.tags, ['a', 'b']);
    });
  });

  describe('normalizeBody()', () => {
    it('returns empty text body for falsy input', () => {
      const parser = new YamlParser(mockConfig);
      assert.deepEqual(parser.normalizeBody(null), { format: 'text', content: '' });
      assert.deepEqual(parser.normalizeBody(undefined), { format: 'text', content: '' });
    });

    it('wraps string body as text format', () => {
      const parser = new YamlParser(mockConfig);
      assert.deepEqual(parser.normalizeBody('hello'), { format: 'text', content: 'hello' });
    });

    it('preserves object body with format', () => {
      const parser = new YamlParser(mockConfig);
      const result = parser.normalizeBody({ format: 'markdown', content: '# Hi' });
      assert.equal(result.format, 'markdown');
      assert.equal(result.content, '# Hi');
    });
  });

  describe('validate()', () => {
    it('throws for invalid type', () => {
      const parser = new YamlParser(mockConfig);
      const data = { type: 'widget', layout: 'page', body: { format: 'text', content: '' }, inject: {} };
      assert.throws(() => parser.validate(data, 'test.yml'), /Invalid type/);
    });

    it('throws for invalid body format', () => {
      const parser = new YamlParser(mockConfig);
      const data = { type: 'page', layout: 'page', body: { format: 'xml', content: '' }, inject: {} };
      assert.throws(() => parser.validate(data, 'test.yml'), /Invalid body format/);
    });

    it('passes for valid data', () => {
      const parser = new YamlParser(mockConfig);
      const data = { type: 'page', layout: 'page', body: { format: 'markdown', content: '' }, inject: {} };
      assert.doesNotThrow(() => parser.validate(data, 'test.yml'));
    });
  });

  describe('resolveField()', () => {
    it('resolves top-level field', () => {
      const parser = new YamlParser(mockConfig);
      assert.equal(parser.resolveField({ title: 'Hello' }, 'title'), 'Hello');
    });

    it('resolves nested dot-notation field', () => {
      const parser = new YamlParser(mockConfig);
      assert.equal(parser.resolveField({ hero: { title: 'Banner' } }, 'hero.title'), 'Banner');
    });

    it('returns undefined for missing field', () => {
      const parser = new YamlParser(mockConfig);
      assert.equal(parser.resolveField({ a: 1 }, 'b.c'), undefined);
    });

    it('returns the fieldRef itself for non-string input', () => {
      const parser = new YamlParser(mockConfig);
      assert.equal(parser.resolveField({}, null), null);
    });
  });

  describe('parse()', () => {
    it('parses a valid YAML file', () => {
      const path = writeYaml('valid.yml', 'title: My Page\nlayout: page\n');
      const parser = new YamlParser(mockConfig);
      const result = parser.parse(path, 'valid.yml');
      assert.equal(result.title, 'My Page');
      assert.equal(result.layout, 'page');
    });

    it('throws on invalid YAML syntax', () => {
      const path = writeYaml('bad.yml', 'title: [\nbad yaml');
      const parser = new YamlParser(mockConfig);
      assert.throws(() => parser.parse(path, 'bad.yml'), /YAML parse error|Failed to parse/);
    });
  });
});
