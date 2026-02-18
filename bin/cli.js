#!/usr/bin/env node

import { Command } from 'commander';
import { Builder } from '../src/Builder.js';
import { DevServer } from '../src/DevServer.js';
import { ConfigLoader } from '../src/ConfigLoader.js';
import { Initializer } from '../src/Initializer.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
  .name('ssg')
  .description('A static site generator using CSS selectors for content injection')
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('Initialize a new SSG project with sample templates')
  .option('-d, --dir <directory>', 'Project directory', '.')
  .action(async (options) => {
    try {
      const initializer = new Initializer(options.dir);
      await initializer.initialize();
      console.log('\n✅ Project initialized successfully!');
      console.log('\nNext steps:');
      console.log('  1. cd ' + (options.dir !== '.' ? options.dir : 'your-project'));
      console.log('  2. npm install');
      console.log('  3. ssg build');
      console.log('  4. ssg serve\n');
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  });

// Build command
program
  .command('build')
  .description('Build the static site')
  .option('-c, --config <path>', 'Config file path', 'config.yml')
  .option('--clean', 'Clean dist before building')
  .option('--strict', 'Strict mode: fail on warnings')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const builder = new Builder({
        config: options.config,
        verbose: options.verbose
      });

      const result = await builder.build();

      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  });

// Serve command
program
  .command('serve')
  .description('Start development server with watch mode')
  .option('-c, --config <path>', 'Config file path', 'config.yml')
  .option('-p, --port <number>', 'Port number', '3000')
  .option('--no-watch', 'Disable watch mode')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      // First build
      const builder = new Builder({
        config: options.config,
        verbose: options.verbose
      });

      const buildResult = await builder.build();

      if (!buildResult.success) {
        console.error('Initial build failed. Fix errors before starting server.');
        process.exit(1);
      }

      // Load config for server
      const configLoader = new ConfigLoader(options.config);
      const config = configLoader.load();

      // Start server
      const server = new DevServer(configLoader, builder);
      await server.start({
        port: parseInt(options.port),
        watch: options.watch
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        server.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Server failed:', error.message);
      process.exit(1);
    }
  });

// New post command
program
  .command('new')
  .description('Create a new post')
  .argument('<type>', 'Content type (post or page)')
  .argument('<title>', 'Post title')
  .option('-c, --config <path>', 'Config file path', 'config.yml')
  .action((type, title, options) => {
    try {
      if (!['post', 'page'].includes(type)) {
        throw new Error('Type must be either "post" or "page"');
      }

      const configLoader = new ConfigLoader(options.config);
      const config = configLoader.load();

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const date = new Date().toISOString().split('T')[0];

      const content = `type: ${type}
layout: ${type}
title: ${title}
slug: ${slug}
date: ${date}
tags: []
draft: false

inject:
  "h1.title": title
  ".post-meta .date": date
  ".content": body_html

body:
  format: markdown
  content: |
    # ${title}

    Your content here...
`;

      const sourcePath = configLoader.resolvePath('source');
      const postsDir = type === 'post' ? configLoader.get('blog.posts_dir') : '.';
      const dir = join(sourcePath, postsDir);
      const filePath = join(dir, `${slug}.yml`);

      mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, content, 'utf-8');

      console.log(`✅ Created new ${type}: ${filePath}`);

    } catch (error) {
      console.error('❌ Failed to create post:', error.message);
      process.exit(1);
    }
  });

program.parse();
