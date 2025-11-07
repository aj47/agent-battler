/**
 * Proxy Wrapper Module
 * 
 * Manages mitmproxy lifecycle for capturing network requests from AI agents.
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface ProxyConfig {
  port?: number;
  logFile: string;
  verbose?: boolean;
}

export class ProxyWrapper {
  private proxyProcess: ChildProcess | null = null;
  private config: ProxyConfig;
  private addonScript: string;

  constructor(config: ProxyConfig) {
    this.config = {
      port: 8080,
      verbose: false,
      ...config,
    };
    this.addonScript = path.join(__dirname, 'mitmproxy-addon.py');
  }

  /**
   * Start the mitmproxy process
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if addon script exists
      if (!fs.existsSync(this.addonScript)) {
        reject(new Error(`Addon script not found: ${this.addonScript}`));
        return;
      }

      // Start mitmdump with our addon
      const args = [
        '-s', this.addonScript,
        '--set', `logfile=${this.config.logFile}`,
        '--listen-port', this.config.port!.toString(),
        '--quiet', // Suppress most output
      ];

      if (this.config.verbose) {
        console.log(`Starting mitmproxy: mitmdump ${args.join(' ')}`);
      }

      this.proxyProcess = spawn('mitmdump', args, {
        stdio: this.config.verbose ? 'inherit' : 'pipe',
      });

      this.proxyProcess.on('error', (error) => {
        reject(new Error(`Failed to start mitmproxy: ${error.message}`));
      });

      // Give the proxy a moment to start up
      setTimeout(() => {
        if (this.proxyProcess && !this.proxyProcess.killed) {
          resolve();
        } else {
          reject(new Error('Proxy process died unexpectedly'));
        }
      }, 1000);
    });
  }

  /**
   * Stop the mitmproxy process
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.proxyProcess) {
        resolve();
        return;
      }

      this.proxyProcess.on('close', () => {
        this.proxyProcess = null;
        resolve();
      });

      // Send SIGTERM to gracefully shut down
      this.proxyProcess.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.proxyProcess && !this.proxyProcess.killed) {
          this.proxyProcess.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  /**
   * Get environment variables to configure child processes to use the proxy
   */
  getProxyEnv(): Record<string, string> {
    const proxyUrl = `http://localhost:${this.config.port}`;
    return {
      HTTP_PROXY: proxyUrl,
      HTTPS_PROXY: proxyUrl,
      http_proxy: proxyUrl,
      https_proxy: proxyUrl,
      // Disable SSL verification for the proxy (needed for HTTPS interception)
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
    };
  }

  /**
   * Check if mitmproxy is installed
   */
  static async checkInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      const check = spawn('which', ['mitmdump']);
      check.on('close', (code) => {
        resolve(code === 0);
      });
      check.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Get installation instructions for mitmproxy
   */
  static getInstallInstructions(): string {
    return `
mitmproxy is not installed. Please install it:

macOS:
  brew install mitmproxy

Linux (Ubuntu/Debian):
  sudo apt-get install mitmproxy

Linux (Fedora):
  sudo dnf install mitmproxy

Using pip:
  pip install mitmproxy

For more information, visit: https://mitmproxy.org/
    `.trim();
  }
}

