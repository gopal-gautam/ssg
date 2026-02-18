import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { basename, extname, relative } from 'path';

export class YamlParser {
  constructor(config) {
    this.config = config;
  }

  parse(filePath, relativePath) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const data = parse(content);

      // Validate and normalize
      const normalized = this.normalize(data, filePath, relativePath);
      this.validate(normalized, filePath);

      return normalized;
    } catch (error) {
      if (error.name === 'YAMLParseError') {
        throw new Error(`YAML parse error in ${filePath}:${error.linePos?.[0]?.line || 'unknown'} - ${error.message}`);
      }
      throw new Error(`Failed to parse ${filePath}: ${error.message}`);
    }
  }

  normalize(data, filePath, relativePath) {
    const filename = basename(filePath, extname(filePath));

    return {
      // Required fields with defaults
      type: data.type || 'page',
      layout: data.layout || 'page',
      title: data.title || filename,
      slug: data.slug || filename,

      // Optional metadata
      date: data.date ? new Date(data.date) : new Date(),
      tags: data.tags || [],
      draft: data.draft || false,

      // Content injection rules
      inject: data.inject || {},

      // Body content
      body: this.normalizeBody(data.body),

      // Permalink settings
      permalink: data.permalink,

      // Custom fields (allow any additional data)
      ...data,

      // Meta (internal)
      _meta: {
        filePath,
        relativePath,
        filename
      }
    };
  }

  normalizeBody(body) {
    if (!body) {
      return { format: 'text', content: '' };
    }

    if (typeof body === 'string') {
      return { format: 'text', content: body };
    }

    return {
      format: body.format || 'text',
      content: body.content || ''
    };
  }

  validate(data, filePath) {
    const errors = [];

    // Type validation
    if (!['page', 'post'].includes(data.type)) {
      errors.push(`Invalid type "${data.type}". Must be "page" or "post".`);
    }

    // Layout validation
    if (!data.layout) {
      errors.push('Missing required field: layout');
    }

    // Body format validation
    if (data.body && !['markdown', 'html', 'text'].includes(data.body.format)) {
      errors.push(`Invalid body format "${data.body.format}". Must be "markdown", "html", or "text".`);
    }

    // Inject validation
    if (data.inject && typeof data.inject !== 'object') {
      errors.push('inject field must be an object');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed for ${filePath}:\n  - ${errors.join('\n  - ')}`);
    }

    return true;
  }

  /**
   * Resolve a field reference from data
   * Supports dot notation like "hero.title"
   */
  resolveField(data, fieldRef) {
    if (!fieldRef || typeof fieldRef !== 'string') {
      return fieldRef;
    }

    const parts = fieldRef.split('.');
    let value = data;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) {
        return undefined;
      }
    }

    return value;
  }
}
