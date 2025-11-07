#!/usr/bin/env node

/**
 * Agent Battler CLI Entry Point
 *
 * This is a simple wrapper that loads and executes the TypeScript CLI.
 */

const path = require('path');
const fs = require('fs');

// Try to load the compiled TypeScript version
const distPath = path.join(__dirname, '..', 'dist', 'cli.js');
const libPath = path.join(__dirname, '..', 'lib', 'cli.ts');

if (fs.existsSync(distPath)) {
  // Use compiled version
  require(distPath);
} else if (fs.existsSync(libPath)) {
  // Development mode - use ts-node if available
  try {
    require('ts-node/register');
    require(libPath);
  } catch (error) {
    console.error('Error: CLI not built and ts-node not available.');
    console.error('');
    console.error('Please run: npm run build:cli');
    console.error('Or install ts-node: npm install -g ts-node');
    process.exit(1);
  }
} else {
  console.error('Error: CLI files not found.');
  console.error('Please ensure the package is properly installed.');
  process.exit(1);
}

