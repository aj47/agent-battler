#!/usr/bin/env node

/**
 * Auggie Wrapper with Proxy Support
 *
 * This wrapper ensures Auggie uses the proxy by intercepting HTTP/HTTPS requests
 * at the Node.js level before executing the Auggie CLI.
 */

const { spawn } = require('child_process');
const path = require('path');

// Get the instruction from command line args
const instruction = process.argv.slice(2).join(' ');

if (!instruction) {
  console.error('Usage: auggie-wrapper <instruction>');
  process.exit(1);
}

// Check if proxy is configured
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

if (!proxyUrl) {
  console.error('No proxy configured. Set HTTP_PROXY or HTTPS_PROXY environment variable.');
  process.exit(1);
}

console.error(`[Proxy] Using proxy: ${proxyUrl}`);

// Create a bootstrap script that sets up the proxy
const bootstrapScript = `
// Set up global proxy support
const http = require('http');
const https = require('https');
const { URL } = require('url');

const proxyUrl = new URL('${proxyUrl}');

// Use http-proxy-agent and https-proxy-agent if available
try {
  const HttpProxyAgent = require('http-proxy-agent');
  const HttpsProxyAgent = require('https-proxy-agent');

  http.globalAgent = new HttpProxyAgent(proxyUrl);
  https.globalAgent = new HttpsProxyAgent(proxyUrl, {
    rejectUnauthorized: false
  });

  console.error('[Proxy] Using http-proxy-agent and https-proxy-agent');
} catch (e) {
  console.error('[Proxy] Proxy agents not available, requests may not be proxied');
  console.error('[Proxy] Install with: npm install -g http-proxy-agent https-proxy-agent');
}

// Now run auggie
require('@augmentcode/auggie/dist/cli.js');
`;

// Write bootstrap script to temp file
const fs = require('fs');
const os = require('os');
const tmpFile = path.join(os.tmpdir(), `auggie-proxy-bootstrap-${Date.now()}.js`);

fs.writeFileSync(tmpFile, bootstrapScript);

// Run node with the bootstrap script
const nodeProcess = spawn('node', [tmpFile, '--print', instruction], {
  stdio: 'inherit',
  env: process.env
});

nodeProcess.on('close', (code) => {
  // Clean up temp file
  try {
    fs.unlinkSync(tmpFile);
  } catch (e) {
    // Ignore cleanup errors
  }
  process.exit(code);
});

