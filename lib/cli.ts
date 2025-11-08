#!/usr/bin/env node

/**
 * Agent Battler CLI
 * 
 * A wrapper CLI that captures network requests made by AI coding agents
 * using mitmproxy instead of asciicinema.
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { ProxyWrapper } from './proxy-wrapper';

const SUPPORTED_AGENTS = ['claude', 'auggie', 'cursor', 'copilot', 'codeium', 'chatgpt'];

interface AgentCommand {
  agent: string;
  instruction: string;
}

function parseArgs(): AgentCommand | null {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    return null;
  }

  return {
    agent: args[0].toLowerCase(),
    instruction: args.slice(1).join(' '),
  };
}

function printUsage(): void {
  console.error('Usage: agent-battler <agent> <instruction>');
  console.error('');
  console.error('Examples:');
  console.error('  agent-battler claude "Fix the login bug"');
  console.error('  agent-battler auggie "Add user authentication"');
  console.error('  agent-battler cursor "Refactor the API"');
  console.error('');
  console.error(`Supported agents: ${SUPPORTED_AGENTS.join(', ')}`);
}

async function main() {
  const command = parseArgs();

  if (!command) {
    printUsage();
    process.exit(1);
  }

  if (!SUPPORTED_AGENTS.includes(command.agent)) {
    console.error(`Error: Unsupported agent "${command.agent}"`);
    console.error(`Supported agents: ${SUPPORTED_AGENTS.join(', ')}`);
    process.exit(1);
  }

  console.log(`🤖 Agent Battler - Running ${command.agent}`);
  console.log(`📝 Instruction: "${command.instruction}"`);
  console.log('📡 Network requests will be captured using mitmproxy');
  console.log('');

  // Check if mitmproxy is installed
  const isInstalled = await ProxyWrapper.checkInstalled();
  if (!isInstalled) {
    console.error('❌ Error: mitmproxy is not installed');
    console.error('');
    console.error(ProxyWrapper.getInstallInstructions());
    process.exit(1);
  }

  // Create logs directory
  const logsDir = path.join(process.cwd(), 'agent-battler-logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Generate log file name with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logsDir, `${command.agent}-${timestamp}.json`);

  console.log(`📝 Network logs will be saved to: ${logFile}`);
  console.log('');

  // Create proxy wrapper
  const proxy = new ProxyWrapper({
    logFile,
    verbose: process.env.VERBOSE === '1',
  });

  try {
    // Start the proxy
    console.log('🚀 Starting mitmproxy...');
    await proxy.start();
    console.log('✅ Proxy started successfully');
    console.log('');

    // Execute the agent command with proxy environment
    await executeAgentCommand(command, proxy);

    console.log('');
    console.log('✅ Command completed');
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    process.exit(1);
  } finally {
    // Stop the proxy
    console.log('🛑 Stopping proxy...');
    await proxy.stop();
    console.log('✅ Proxy stopped');
    console.log('');
    console.log(`📊 Network capture saved to: ${logFile}`);
  }
}

async function executeAgentCommand(
  command: AgentCommand,
  proxy: ProxyWrapper
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`⚠️  Note: This is a demonstration implementation.`);
    console.log(`    To fully integrate with ${command.agent}, you would need to:`);
    console.log(`    1. Configure ${command.agent} to use the proxy`);
    console.log(`    2. Execute the actual ${command.agent} command`);
    console.log(`    3. Pass the instruction to the agent`);
    console.log('');
    console.log('For now, simulating a 5-second agent execution...');

    // Simulate agent execution
    setTimeout(() => {
      console.log(`✅ ${command.agent} execution completed (simulated)`);
      resolve();
    }, 5000);
  });
}

// Run the CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

