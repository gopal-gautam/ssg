import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ConfigLoader } from '../src/ConfigLoader.js';

const TMP = 'test/tmp/config';

function writeConfig(name, content) {
  mkdirSync(TMP, { recursive: true });
  const p = join(TMP, name);
  writeFileSync(p, content, 'utf-8');
  return p;
}

describe('ConfigLoader', () => {
  before(() => mkdirSync(TMP, { recursive: true }));

  describe('load()', () => {
    it('throws when config file not found', () => {
      const loader = new ConfigLoader('nonexistent.yml');
      assert.throws(() => loader.load(), /Configuration file not found/);
    });

    it('loads and parses valid config', () => {
      const path = writeConfig('valid.yml', 'site:\n  name: Test Site\n');
      const loader = new ConfigLoader(path);
      const config = loader.load();
      assert.equal(config.site.name, 'Test Site');
    });

    it('applies defaults for missing fields', () => {
      const path = writeConfig('minimal.yml', 'site:\n  name: Minimal\n');
      const loader = new ConfigLoader(path);
      const config = loader.load();
      assert.equal(config.site.url, 'http://localhost:3000');
      assert.equal(config.paths.template, 'template');
      assert.equal(config.build.clean, true);
      assert.equal(config.blog.posts_per_page, 10);
    });

    it('throws on invalid YAML', () => {
      const path = writeConfig('bad.yml', 'site: [\nbad');
      const loader = new ConfigLoader(path);
      assert.throws(() => loader.load(), /Failed to parse config\.yml/);
    });
  });

  describe('get()', () => {
    it('throws when config not loaded', () => {
      const loader = new ConfigLoader();
      assert.throws(() => loader.get('site.name'), /Config not loaded/);
    });

    it('retrieves top-level value', () => {
      const path = writeConfig('get1.yml', 'site:\n  name: Test\n');
      const loader = new ConfigLoader(path);
      loader.load();
      const site = loader.get('site');
      assert.equal(site.name, 'Test');
    });

    it('retrieves nested value with dot notation', () => {
      const path = writeConfig('get2.yml', 'site:\n  name: Test\n');
      const loader = new ConfigLoader(path);
      loader.load();
      assert.equal(loader.get('site.name'), 'Test');
    });

    it('returns undefined for missing path', () => {
      const path = writeConfig('get3.yml', 'site:\n  name: Test\n');
      const loader = new ConfigLoader(path);
      loader.load();
      assert.equal(loader.get('site.missing'), undefined);
    });
  });

  describe('resolvePath()', () => {
    it('resolves path from config', () => {
      const path = writeConfig('paths.yml', 'paths:\n  template: my-template\n');
      const loader = new ConfigLoader(path);
      loader.load();
      const resolved = loader.resolvePath('template');
      assert.ok(resolved.endsWith('my-template'));
    });
  });
});
