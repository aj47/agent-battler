/**
 * Tests for ProxyWrapper
 */

import { ProxyWrapper } from '../proxy-wrapper';
import * as path from 'path';
import * as fs from 'fs';

describe('ProxyWrapper', () => {
  const testLogFile = path.join(__dirname, 'test-output.json');

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('checkInstalled', () => {
    it('should check if mitmproxy is installed', async () => {
      const isInstalled = await ProxyWrapper.checkInstalled();
      expect(typeof isInstalled).toBe('boolean');
    });
  });

  describe('getInstallInstructions', () => {
    it('should return installation instructions', () => {
      const instructions = ProxyWrapper.getInstallInstructions();
      expect(instructions).toContain('mitmproxy');
      expect(instructions).toContain('brew install');
      expect(instructions).toContain('pip install');
    });
  });

  describe('getProxyEnv', () => {
    it('should return proxy environment variables', () => {
      const proxy = new ProxyWrapper({ logFile: testLogFile });
      const env = proxy.getProxyEnv();
      
      expect(env.HTTP_PROXY).toBe('http://localhost:8080');
      expect(env.HTTPS_PROXY).toBe('http://localhost:8080');
      expect(env.http_proxy).toBe('http://localhost:8080');
      expect(env.https_proxy).toBe('http://localhost:8080');
      expect(env.NODE_TLS_REJECT_UNAUTHORIZED).toBe('0');
    });

    it('should use custom port if provided', () => {
      const proxy = new ProxyWrapper({ logFile: testLogFile, port: 9090 });
      const env = proxy.getProxyEnv();
      
      expect(env.HTTP_PROXY).toBe('http://localhost:9090');
      expect(env.HTTPS_PROXY).toBe('http://localhost:9090');
    });
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const proxy = new ProxyWrapper({ logFile: testLogFile });
      expect(proxy).toBeInstanceOf(ProxyWrapper);
    });

    it('should accept custom port', () => {
      const proxy = new ProxyWrapper({ logFile: testLogFile, port: 9090 });
      const env = proxy.getProxyEnv();
      expect(env.HTTP_PROXY).toContain('9090');
    });

    it('should accept verbose flag', () => {
      const proxy = new ProxyWrapper({ 
        logFile: testLogFile, 
        verbose: true 
      });
      expect(proxy).toBeInstanceOf(ProxyWrapper);
    });
  });
});

