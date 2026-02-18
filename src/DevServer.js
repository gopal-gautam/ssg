import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { watch } from 'chokidar';

export class DevServer {
  constructor(config, builder) {
    this.config = config;
    this.builder = builder;
    this.distPath = config.resolvePath('dist');
    this.port = 3000;
    this.server = null;
    this.watcher = null;
  }

  async start(options = {}) {
    this.port = options.port || 3000;
    const watchMode = options.watch ?? true;

    // Start HTTP server
    this.server = createServer((req, res) => this.handleRequest(req, res));

    this.server.listen(this.port, () => {
      console.log(`\n🚀 Development server running at http://localhost:${this.port}/`);
      console.log(`📁 Serving: ${this.distPath}\n`);

      if (watchMode) {
        console.log('👀 Watching for changes...\n');
        this.startWatching();
      } else {
        console.log('Press Ctrl+C to stop\n');
      }
    });
  }

  handleRequest(req, res) {
    let filePath = decodeURIComponent(req.url);

    // Remove query string
    const queryIndex = filePath.indexOf('?');
    if (queryIndex !== -1) {
      filePath = filePath.substring(0, queryIndex);
    }

    // Handle directory requests
    if (filePath.endsWith('/')) {
      filePath += 'index.html';
    }

    // Try with and without .html extension
    let fullPath = join(this.distPath, filePath);

    if (!existsSync(fullPath) && !filePath.endsWith('.html')) {
      const htmlPath = join(this.distPath, filePath + '.html');
      if (existsSync(htmlPath)) {
        fullPath = htmlPath;
      } else {
        const indexPath = join(this.distPath, filePath, 'index.html');
        if (existsSync(indexPath)) {
          fullPath = indexPath;
        }
      }
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    // Check if it's a directory
    if (statSync(fullPath).isDirectory()) {
      fullPath = join(fullPath, 'index.html');
      if (!existsSync(fullPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
        return;
      }
    }

    // Determine content type
    const contentType = this.getContentType(fullPath);

    // Read and serve file
    try {
      const content = readFileSync(fullPath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);

      console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url} → ${fullPath}`);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>500 Internal Server Error</h1>');
      console.error(`Error serving ${fullPath}:`, error.message);
    }
  }

  getContentType(filePath) {
    const ext = extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.xml': 'application/xml',
      '.txt': 'text/plain'
    };

    return types[ext] || 'application/octet-stream';
  }

  startWatching() {
    const sourcePath = this.config.resolvePath('source');
    const templatePath = this.config.resolvePath('template');

    this.watcher = watch([sourcePath, templatePath], {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    let rebuildTimeout = null;

    this.watcher.on('all', (event, path) => {
      console.log(`\n📝 Change detected: ${event} ${path}`);

      // Debounce rebuilds
      if (rebuildTimeout) {
        clearTimeout(rebuildTimeout);
      }

      rebuildTimeout = setTimeout(async () => {
        console.log('🔄 Rebuilding...\n');

        try {
          await this.builder.build();
          console.log('✅ Rebuild complete\n');
          console.log('👀 Watching for changes...\n');
        } catch (error) {
          console.error('❌ Rebuild failed:', error.message);
        }
      }, 300);
    });
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
    }

    if (this.server) {
      this.server.close(() => {
        console.log('\n👋 Server stopped');
      });
    }
  }
}
