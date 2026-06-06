import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BlogGenerator } from '../src/BlogGenerator.js';

// Minimal mocks
function makeConfig(overrides = {}) {
  const values = {
    'blog.index_slug': 'blog',
    'blog.posts_per_page': 10,
    'blog.index_layout': 'page',
    'site.name': 'My Site',
    'site.url': 'https://example.com',
    'site.language': 'en',
    ...overrides
  };
  return { get: (k) => values[k] };
}

function makeRenderer() {
  const rendered = [];
  return {
    rendered,
    distPath: '/tmp/dist',
    render: (data) => { rendered.push(data); return { success: true, data }; },
    writeOutput: () => {},
    getPublicUrl: (item) => `https://example.com/${item.slug}`
  };
}

const makePost = (over = {}) => ({
  title: 'P', slug: 'p', date: new Date('2025-01-01'), tags: [], draft: false, ...over
});

function makeGenerator(config = makeConfig()) {
  const renderer = makeRenderer();
  const gen = new BlogGenerator(config, null, null, null, null, renderer);
  return { gen, renderer };
}

describe('BlogGenerator', () => {
  describe('generateBlogIndex()', () => {
    it('renders the post list into body_html (no .post-list selector)', () => {
      const { gen, renderer } = makeGenerator();
      gen.generateBlogIndex([makePost({ title: 'Hello', slug: 'hello' })]);

      const data = renderer.rendered[0];
      assert.ok(data.body_html.includes('Hello'), 'body_html should contain the post title');
      // The undocumented .post-list inject rule must not be used
      assert.ok(!data.inject || !('.post-list' in data.inject));
    });

    it('limits the index to posts_per_page', () => {
      const { gen, renderer } = makeGenerator(makeConfig({ 'blog.posts_per_page': 1 }));
      gen.generateBlogIndex([
        makePost({ title: 'First', slug: 'first' }),
        makePost({ title: 'Second', slug: 'second' })
      ]);

      const data = renderer.rendered[0];
      assert.equal(data.posts.length, 1);
      assert.ok(data.body_html.includes('First'));
      assert.ok(!data.body_html.includes('Second'));
    });
  });

  describe('generateTagPages()', () => {
    it('renders each tag page post list into body_html', () => {
      const { gen, renderer } = makeGenerator();
      gen.generateTagPages([makePost({ title: 'Tagged', slug: 'tagged', tags: ['tech'] })]);

      const data = renderer.rendered[0];
      assert.equal(data.title, 'Tag: tech');
      assert.ok(data.body_html.includes('Tagged'));
      assert.ok(!data.inject || !('.post-list' in data.inject));
    });
  });
});
