import { Renderer } from './Renderer.js';

export class BlogGenerator {
  constructor(config, templateResolver, injector, markdownConverter, yamlParser, renderer) {
    this.config = config;
    this.templateResolver = templateResolver;
    this.injector = injector;
    this.markdownConverter = markdownConverter;
    this.yamlParser = yamlParser;
    this.renderer = renderer;
  }

  /**
   * Generate blog index, tag pages, RSS, and sitemap
   */
  generate(posts, pages) {
    const results = {
      index: null,
      tagPages: [],
      rss: null,
      sitemap: null
    };

    // Filter out drafts and sort by date
    const publishedPosts = posts
      .filter(post => !post.draft)
      .sort((a, b) => b.date - a.date);

    // Generate blog index
    results.index = this.generateBlogIndex(publishedPosts);

    // Generate tag pages
    results.tagPages = this.generateTagPages(publishedPosts);

    // Generate RSS feed
    results.rss = this.generateRSS(publishedPosts);

    // Generate sitemap
    results.sitemap = this.generateSitemap(publishedPosts, pages);

    return results;
  }

  /**
   * Generate blog index page
   */
  generateBlogIndex(posts) {
    const indexSlug = this.config.get('blog.index_slug');
    const postsPerPage = this.config.get('blog.posts_per_page');
    const layout = this.config.get('blog.index_layout');
    const visiblePosts = posts.slice(0, postsPerPage);

    // Create virtual YAML data for blog index. The post list is provided as
    // body_html so it renders through the standard data-bind="body_html"
    // region that the default layouts already expose.
    const indexData = {
      type: 'page',
      layout: layout,
      title: 'Blog',
      slug: indexSlug,
      posts: visiblePosts,
      total_posts: posts.length,
      body_html: this.generatePostListHtml(visiblePosts),
      _meta: {
        filePath: 'virtual:blog-index',
        relativePath: indexSlug,
        filename: indexSlug
      }
    };

    return this.renderer.render(indexData);
  }

  /**
   * Generate HTML for a list of posts
   */
  generatePostListHtml(posts) {
    return posts.map(post => {
      const postDate = post.date instanceof Date ? post.date : new Date(post.date);
      return `
      <article class="post-preview">
        <h2><a href="${this.getPostUrl(post)}">${post.title}</a></h2>
        <div class="post-meta">
          <time datetime="${postDate.toISOString()}">${this.formatDate(postDate)}</time>
          ${post.tags.length > 0 ? `<span class="tags">${post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</span>` : ''}
        </div>
        ${post.excerpt ? `<p class="excerpt">${post.excerpt}</p>` : ''}
      </article>
    `;
    }).join('\n');
  }

  /**
   * Generate tag pages
   */
  generateTagPages(posts) {
    const tagPages = [];
    const tagMap = new Map();

    // Group posts by tag
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag).push(post);
      });
    });

    // Generate a page for each tag
    tagMap.forEach((tagPosts, tag) => {
      const tagData = {
        type: 'page',
        layout: this.config.get('blog.index_layout'),
        title: `Tag: ${tag}`,
        slug: `tags/${tag}`,
        posts: tagPosts,
        tag: tag,
        body_html: this.generatePostListHtml(tagPosts),
        _meta: {
          filePath: `virtual:tag-${tag}`,
          relativePath: `tags/${tag}`,
          filename: tag
        }
      };

      const result = this.renderer.render(tagData);
      tagPages.push(result);
    });

    return tagPages;
  }

  /**
   * Generate RSS feed
   */
  generateRSS(posts) {
    const siteName = this.config.get('site.name');
    const siteUrl = this.config.get('site.url');
    const recentPosts = posts.slice(0, 20);

    const rssItems = recentPosts.map(post => {
      const postDate = post.date instanceof Date ? post.date : new Date(post.date);
      return `
    <item>
      <title>${this.escapeXml(post.title)}</title>
      <link>${this.getPostUrl(post)}</link>
      <guid>${this.getPostUrl(post)}</guid>
      <pubDate>${postDate.toUTCString()}</pubDate>
      <description>${this.escapeXml(post.excerpt || '')}</description>
    </item>
    `;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${this.escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>Latest posts from ${this.escapeXml(siteName)}</description>
    <language>${this.config.get('site.language')}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>`;

    this.renderer.writeOutput(
      this.renderer.distPath + '/rss.xml',
      rss
    );

    return { success: true, path: '/rss.xml' };
  }

  /**
   * Generate sitemap.xml
   */
  generateSitemap(posts, pages) {
    const siteUrl = this.config.get('site.url');
    const allContent = [...posts, ...pages];

    const urls = allContent.map(item => {
      const itemDate = item.date instanceof Date ? item.date : new Date(item.date);
      return `
  <url>
    <loc>${this.renderer.getPublicUrl(item)}</loc>
    <lastmod>${itemDate.toISOString().split('T')[0]}</lastmod>
    <changefreq>${item.type === 'post' ? 'monthly' : 'weekly'}</changefreq>
    <priority>${item.type === 'post' ? '0.8' : '0.9'}</priority>
  </url>
    `;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    this.renderer.writeOutput(
      this.renderer.distPath + '/sitemap.xml',
      sitemap
    );

    return { success: true, path: '/sitemap.xml' };
  }

  /**
   * Get URL for a post
   */
  getPostUrl(post) {
    return this.renderer.getPublicUrl(post);
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Escape XML special characters
   */
  escapeXml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;'
    };

    return String(text).replace(/[&<>"']/g, char => map[char]);
  }
}
