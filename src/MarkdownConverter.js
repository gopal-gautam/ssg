import { marked } from 'marked';

export class MarkdownConverter {
  constructor() {
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: false,
      pedantic: false,
      sanitize: false, // Allow HTML in markdown
      smartLists: true,
      smartypants: true
    });
  }

  /**
   * Convert markdown to HTML
   */
  convert(markdown) {
    if (!markdown) {
      return '';
    }

    try {
      return marked.parse(markdown);
    } catch (error) {
      throw new Error(`Markdown conversion failed: ${error.message}`);
    }
  }

  /**
   * Generate an excerpt from markdown
   * Takes first paragraph or specified length
   */
  generateExcerpt(markdown, length = 200) {
    if (!markdown) {
      return '';
    }

    // Convert to HTML first
    const html = this.convert(markdown);

    // Strip HTML tags
    const text = html.replace(/<[^>]*>/g, '');

    // Get first paragraph or truncate
    const paragraphs = text.split('\n\n');
    const firstPara = paragraphs[0] || text;

    if (firstPara.length <= length) {
      return firstPara.trim();
    }

    // Truncate at word boundary
    const truncated = firstPara.substring(0, length);
    const lastSpace = truncated.lastIndexOf(' ');

    return truncated.substring(0, lastSpace) + '...';
  }

  /**
   * Estimate reading time in minutes
   */
  estimateReadingTime(markdown) {
    if (!markdown) {
      return 0;
    }

    const wordsPerMinute = 200;
    const words = markdown.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);

    return minutes;
  }
}
