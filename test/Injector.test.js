import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Injector } from '../src/Injector.js';

// Minimal mocks
const mockYamlParser = {
  resolveField: (data, key) => {
    const parts = key.split('.');
    let v = data;
    for (const p of parts) v = v?.[p];
    return v;
  }
};

function makeInjector(strict = false) {
  const config = {
    get: (k) => k === 'build.strict_selectors' ? strict : undefined
  };
  return new Injector(config, mockYamlParser);
}

describe('Injector', () => {
  describe('inject() - text content', () => {
    it('injects text into matching selector', () => {
      const injector = makeInjector();
      const html = '<html><body><h1 id="title"></h1></body></html>';
      const data = { inject: { '#title': 'title' }, title: 'Hello World' };
      const result = injector.inject(html, data);
      assert.match(result, /Hello World/);
    });

    it('injects literal string value', () => {
      const injector = makeInjector();
      const html = '<html><body><p class="note"></p></body></html>';
      const data = { inject: { '.note': 'Static text' } };
      const result = injector.inject(html, data);
      assert.match(result, /Static text/);
    });

    it('warns (not throws) for missing selector in non-strict mode', () => {
      const injector = makeInjector(false);
      const html = '<html><body></body></html>';
      const data = { inject: { '#missing': 'value' } };
      assert.doesNotThrow(() => injector.inject(html, data));
    });

    it('throws for missing selector in strict mode', () => {
      const injector = makeInjector(true);
      const html = '<html><body></body></html>';
      const data = { inject: { '#missing': 'value' } };
      assert.throws(() => injector.inject(html, data), /No elements found/);
    });
  });

  describe('inject() - attribute injection', () => {
    it('injects attribute using @syntax', () => {
      const injector = makeInjector();
      const html = '<html><body><a class="cta">Click</a></body></html>';
      const data = { inject: { 'a.cta@href': 'url' }, url: 'https://example.com' };
      const result = injector.inject(html, data);
      assert.match(result, /href="https:\/\/example\.com"/);
    });
  });

  describe('inject() - data-bind', () => {
    it('processes data-bind attributes', () => {
      const injector = makeInjector();
      const html = '<html><body><span data-bind="title"></span></body></html>';
      const data = { title: 'Bound Title' };
      const result = injector.inject(html, data);
      assert.match(result, /Bound Title/);
    });

    it('injects HTML for _html suffixed data-bind', () => {
      const injector = makeInjector();
      const html = '<html><body><div data-bind="body_html"></div></body></html>';
      const data = { body_html: '<p>Content</p>' };
      const result = injector.inject(html, data);
      assert.match(result, /<p>Content<\/p>/);
    });
  });

  describe('inject() - nested field resolution', () => {
    it('resolves dot-notation field references', () => {
      const injector = makeInjector();
      const html = '<html><body><h2 id="sub"></h2></body></html>';
      const data = { inject: { '#sub': 'hero.subtitle' }, hero: { subtitle: 'Sub text' } };
      const result = injector.inject(html, data);
      assert.match(result, /Sub text/);
    });
  });
});
