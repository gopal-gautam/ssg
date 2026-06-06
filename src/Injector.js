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

    // Process data-loop directives (must run before data-bind so loop-internal
    // binds resolve against item scope and get stripped before the global pass)
    this.processLoops(document, data);

    // Process data-bind attributes automatically
    this.processDataBindAttributes(document, data);

    return dom.serialize();
  }

  /**
   * Process all top-level data-loop directives. Nested loops are handled
   * recursively from within processLoopElement using the enclosing scope.
   */
  processLoops(document, data) {
    const loops = Array.from(document.querySelectorAll('[data-loop]'))
      .filter(el => el.parentElement === null || el.parentElement.closest('[data-loop]') === null);

    for (const container of loops) {
      this.processLoopElement(container, {}, data);
    }
  }

  /**
   * Expand a single data-loop container by cloning its template child once per
   * array item, binding each clone against a per-item scope.
   */
  processLoopElement(container, parentScope, data) {
    const expr = container.getAttribute('data-loop');
    container.removeAttribute('data-loop');

    const match = expr.match(/^\s*(\w+)\s+in\s+(.+?)\s*$/);
    if (!match) {
      console.warn(`Warning: malformed data-loop expression: "${expr}"`);
      return;
    }

    const [, varName, fieldRef] = match;
    const items = this.yamlParser.resolveField({ ...data, ...parentScope }, fieldRef);
    const template = container.firstElementChild;

    if (!Array.isArray(items)) {
      if (this.strictSelectors && items !== undefined) {
        throw new Error(`data-loop "${fieldRef}" is not an array`);
      }
      if (items !== undefined) {
        console.warn(`Warning: data-loop "${fieldRef}" is not an array`);
      }
      if (template) container.removeChild(template);
      return;
    }

    if (!template) {
      console.warn(`Warning: data-loop "${fieldRef}" has no template child element`);
      return;
    }

    const fragment = container.ownerDocument.createDocumentFragment();

    for (const item of items) {
      const scope = { ...parentScope, [varName]: item };
      const clone = template.cloneNode(true);

      // Resolve nested loops first (innermost binds depend on their own scope)
      const nested = Array.from(clone.querySelectorAll('[data-loop]'))
        .filter(el => el.parentElement.closest('[data-loop]') === null);
      for (const inner of nested) {
        this.processLoopElement(inner, scope, data);
      }

      this.bindScopedNode(clone, scope, data);
      fragment.appendChild(clone);
    }

    container.removeChild(template);
    container.appendChild(fragment);
  }

  /**
   * Resolve data-bind / data-bind-attr on a cloned loop node against the
   * item scope, falling back to page-level data.
   */
  bindScopedNode(root, scope, data) {
    const resolve = (ref) => {
      const scoped = this.yamlParser.resolveField(scope, ref);
      return scoped !== undefined ? scoped : this.yamlParser.resolveField(data, ref);
    };

    const bindTargets = [root, ...root.querySelectorAll('[data-bind]')]
      .filter(el => el.hasAttribute('data-bind'));
    for (const el of bindTargets) {
      const ref = el.getAttribute('data-bind');
      el.removeAttribute('data-bind');
      const value = resolve(ref);
      if (value === undefined) {
        console.warn(`Warning: data-bind="${ref}" could not be resolved`);
        continue;
      }
      if (ref.endsWith('_html')) {
        el.innerHTML = String(value);
      } else {
        el.textContent = String(value);
      }
    }

    const attrTargets = [root, ...root.querySelectorAll('[data-bind-attr]')]
      .filter(el => el.hasAttribute('data-bind-attr'));
    for (const el of attrTargets) {
      const spec = el.getAttribute('data-bind-attr');
      el.removeAttribute('data-bind-attr');
      for (const pair of spec.split(',')) {
        const idx = pair.indexOf(':');
        if (idx === -1) continue;
        const attr = pair.slice(0, idx).trim();
        const ref = pair.slice(idx + 1).trim();
        const value = resolve(ref);
        if (value !== undefined) {
          el.setAttribute(attr, String(value));
        }
      }
    }
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
