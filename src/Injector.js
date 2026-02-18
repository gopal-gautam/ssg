import { JSDOM } from 'jsdom';

export class Injector {
  constructor(config, yamlParser) {
    this.config = config;
    this.yamlParser = yamlParser;
    this.strictSelectors = config.get('build.strict_selectors');
  }

  /**
   * Inject data into HTML template using selectors
   */
  inject(html, data) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Process inject rules
    if (data.inject && typeof data.inject === 'object') {
      for (const [selector, value] of Object.entries(data.inject)) {
        this.applyInjection(document, selector, value, data);
      }
    }

    // Process data-bind attributes automatically
    this.processDataBindAttributes(document, data);

    return dom.serialize();
  }

  /**
   * Apply a single injection rule
   */
  applyInjection(document, selector, value, data) {
    // Check if this is an attribute injection (e.g., "a.cta@href")
    const attrMatch = selector.match(/^(.+)@(.+)$/);

    if (attrMatch) {
      const [, elementSelector, attrName] = attrMatch;
      this.injectAttribute(document, elementSelector, attrName, value, data);
    } else {
      this.injectContent(document, selector, value, data);
    }
  }

  /**
   * Inject content (text or HTML) into elements
   */
  injectContent(document, selector, value, data) {
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) {
      const message = `No elements found for selector: ${selector}`;
      if (this.strictSelectors) {
        throw new Error(message);
      }
      console.warn(`Warning: ${message}`);
      return;
    }

    // Resolve value if it's a field reference
    const resolvedValue = this.resolveValue(value, data);

    if (resolvedValue === undefined) {
      console.warn(`Warning: Could not resolve value for selector "${selector}": ${value}`);
      return;
    }

    // Determine if this should be HTML or text injection
    const isHtml = this.isHtmlValue(value, data);

    elements.forEach(element => {
      if (isHtml) {
        element.innerHTML = String(resolvedValue);
      } else {
        element.textContent = String(resolvedValue);
      }
    });
  }

  /**
   * Inject attribute values
   */
  injectAttribute(document, selector, attrName, value, data) {
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) {
      const message = `No elements found for selector: ${selector}`;
      if (this.strictSelectors) {
        throw new Error(message);
      }
      console.warn(`Warning: ${message}`);
      return;
    }

    const resolvedValue = this.resolveValue(value, data);

    if (resolvedValue === undefined) {
      console.warn(`Warning: Could not resolve value for attribute "${attrName}": ${value}`);
      return;
    }

    elements.forEach(element => {
      element.setAttribute(attrName, String(resolvedValue));
    });
  }

  /**
   * Process data-bind attributes automatically
   */
  processDataBindAttributes(document, data) {
    const elements = document.querySelectorAll('[data-bind]');

    elements.forEach(element => {
      const bindKey = element.getAttribute('data-bind');
      const value = this.yamlParser.resolveField(data, bindKey);

      if (value !== undefined) {
        // Check if we should inject as HTML or text
        const isHtml = bindKey.endsWith('_html') || bindKey === 'body_html';

        if (isHtml) {
          element.innerHTML = String(value);
        } else {
          element.textContent = String(value);
        }
      } else {
        console.warn(`Warning: data-bind="${bindKey}" could not be resolved`);
      }
    });
  }

  /**
   * Resolve a value (could be a direct value or field reference)
   */
  resolveValue(value, data) {
    if (typeof value === 'string') {
      // Try to resolve as field reference
      const resolved = this.yamlParser.resolveField(data, value);
      return resolved !== undefined ? resolved : value;
    }

    return value;
  }

  /**
   * Determine if a value should be injected as HTML
   */
  isHtmlValue(value, data) {
    if (typeof value !== 'string') {
      return false;
    }

    // Check if it's a field reference ending with _html
    if (value.endsWith('_html')) {
      return true;
    }

    // Check if the resolved field is body_html
    const resolved = this.yamlParser.resolveField(data, value);
    if (value === 'body_html' || data.body_html !== undefined) {
      return true;
    }

    return false;
  }
}
