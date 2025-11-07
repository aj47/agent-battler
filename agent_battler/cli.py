#!/usr/bin/env python3
"""
Agent Battler CLI

A wrapper CLI that captures network requests made by AI coding agents
using embedded mitmproxy.

Usage:
    agent-battler claude "Fix the login bug"
    agent-battler auggie "Add user authentication"
    agent-battler cursor "Refactor the API"
"""

import argparse
import sys
import os
import json
from datetime import datetime
from pathlib import Path
from typing import Optional
import asyncio
from .proxy_manager import ProxyManager

SUPPORTED_AGENTS = ['claude', 'auggie', 'cursor', 'copilot', 'codeium', 'chatgpt']


def create_parser() -> argparse.ArgumentParser:
    """Create and configure the argument parser."""
    parser = argparse.ArgumentParser(
        description='Agent Battler - Capture network requests from AI coding agents',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Examples:
  agent-battler claude "Fix the login bug"
  agent-battler auggie "Add user authentication"
  agent-battler cursor "Refactor the API"

Supported agents: {', '.join(SUPPORTED_AGENTS)}
        """
    )
    
    parser.add_argument(
        'agent',
        choices=SUPPORTED_AGENTS,
        help='The AI coding agent to use'
    )
    
    parser.add_argument(
        'instruction',
        nargs='+',
        help='The instruction to give to the agent'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        default=8080,
        help='Port for the proxy server (default: 8080)'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose output'
    )
    
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path.cwd() / 'agent-battler-logs',
        help='Directory to save network logs (default: ./agent-battler-logs)'
    )
    
    return parser


async def run_agent_with_proxy(
    agent: str,
    instruction: str,
    port: int,
    output_dir: Path,
    verbose: bool = False
) -> None:
    """Run the agent with proxy capturing network requests."""
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate log file name
    timestamp = datetime.now().isoformat().replace(':', '-').replace('.', '-')
    log_file = output_dir / f"{agent}-{timestamp}.json"
    
    print(f"🤖 Agent Battler - Running {agent}")
    print(f"📝 Instruction: \"{instruction}\"")
    print(f"📡 Network requests will be captured using mitmproxy")
    print()
    print(f"📝 Network logs will be saved to: {log_file}")
    print()
    
    # Create and start proxy manager
    proxy_manager = ProxyManager(
        port=port,
        log_file=str(log_file),
        verbose=verbose
    )
    
    try:
        print("🚀 Starting mitmproxy...")
        await proxy_manager.start()
        print("✅ Proxy started successfully")
        print()
        
        # Execute the agent command
        await execute_agent(agent, instruction, proxy_manager, verbose)
        
        print()
        print("✅ Command completed")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        print("🛑 Stopping proxy...")
        await proxy_manager.stop()
        print("✅ Proxy stopped")
        print()
        print(f"📊 Network capture saved to: {log_file}")


async def execute_agent(
    agent: str,
    instruction: str,
    proxy_manager: ProxyManager,
    verbose: bool
) -> None:
    """Execute the agent command with proxy configuration."""
    
    print(f"⚠️  Note: This is a demonstration implementation.")
    print(f"    To fully integrate with {agent}, you would need to:")
    print(f"    1. Configure {agent} to use the proxy")
    print(f"    2. Execute the actual {agent} command")
    print(f"    3. Pass the instruction to the agent")
    print()
    print("For now, simulating a 5-second agent execution...")
    
    # Simulate agent execution
    await asyncio.sleep(5)
    
    print(f"✅ {agent} execution completed (simulated)")


def main():
    """Main entry point for the CLI."""
    parser = create_parser()
    args = parser.parse_args()
    
    # Join instruction parts
    instruction = ' '.join(args.instruction)
    
    # Run the async function
    asyncio.run(run_agent_with_proxy(
        agent=args.agent,
        instruction=instruction,
        port=args.port,
        output_dir=args.output_dir,
        verbose=args.verbose
    ))


if __name__ == '__main__':
    main()

