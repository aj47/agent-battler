"""
Agent Adapters - Handle different AI coding agent invocation methods
"""

import os
import sys
import subprocess
import asyncio
from typing import Dict, Optional, List
from abc import ABC, abstractmethod


class AgentAdapter(ABC):
    """Base class for agent adapters."""
    
    def __init__(self, name: str):
        self.name = name
    
    @abstractmethod
    async def execute(self, instruction: str, proxy_env: Dict[str, str]) -> int:
        """
        Execute the agent with the given instruction.
        
        Args:
            instruction: The instruction to give to the agent
            proxy_env: Environment variables for proxy configuration
            
        Returns:
            Exit code from the agent execution
        """
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if this agent is available on the system."""
        pass


class ClaudeAdapter(AgentAdapter):
    """Adapter for Claude CLI (if available)."""
    
    def __init__(self):
        super().__init__("claude")
    
    def is_available(self) -> bool:
        """Check if Claude CLI is available."""
        try:
            result = subprocess.run(
                ["which", "claude"],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except:
            return False
    
    async def execute(self, instruction: str, proxy_env: Dict[str, str]) -> int:
        """Execute Claude CLI with the instruction."""
        # Claude CLI usage (if it exists)
        # This is a placeholder - actual Claude CLI may have different syntax
        env = os.environ.copy()
        env.update(proxy_env)
        
        process = await asyncio.create_subprocess_exec(
            "claude",
            instruction,
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if stdout:
            print(stdout.decode())
        if stderr:
            print(stderr.decode(), file=sys.stderr)
        
        return process.returncode


class AugmentAdapter(AgentAdapter):
    """Adapter for Augment CLI (auggie)."""

    def __init__(self):
        super().__init__("auggie")

    def is_available(self) -> bool:
        """Check if auggie CLI is available."""
        try:
            result = subprocess.run(
                ["which", "auggie"],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except:
            return False

    async def execute(self, instruction: str, proxy_env: Dict[str, str]) -> int:
        """Execute auggie CLI with the instruction."""
        env = os.environ.copy()
        env.update(proxy_env)

        # Note: Auggie (Node.js based) may not respect HTTP_PROXY environment variables
        # This is a known limitation of many Node.js applications
        # For now, we'll set the variables and document the limitation

        print(f"⚠️  Note: Auggie may not respect proxy environment variables")
        print(f"   This is a limitation of Node.js-based applications")
        print(f"   HTTP_PROXY: {proxy_env.get('HTTP_PROXY')}")
        print(f"   HTTPS_PROXY: {proxy_env.get('HTTPS_PROXY')}")
        print()
        print(f"   To capture Auggie's requests, you may need to:")
        print(f"   1. Use system-wide proxy settings, or")
        print(f"   2. Use a tool like proxychains, or")
        print(f"   3. Configure Auggie to use a custom API endpoint")
        print()

        # Use auggie with --print flag for non-interactive mode
        process = await asyncio.create_subprocess_exec(
            "auggie",
            "--print",
            instruction,
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if stdout:
            print(stdout.decode())
        if stderr:
            stderr_text = stderr.decode()
            if stderr_text.strip():
                print(stderr_text, file=sys.stderr)

        return process.returncode


class CursorAdapter(AgentAdapter):
    """Adapter for Cursor (IDE-based)."""
    
    def __init__(self):
        super().__init__("cursor")
    
    def is_available(self) -> bool:
        """Check if Cursor is installed."""
        # Check for Cursor app on macOS
        return os.path.exists("/Applications/Cursor.app")
    
    async def execute(self, instruction: str, proxy_env: Dict[str, str]) -> int:
        """Cursor is IDE-based - provide instructions."""
        print("ℹ️  Cursor is an IDE application.")
        print("   To capture Cursor's network requests:")
        print("   1. The proxy is running on port 8080")
        print("   2. Configure Cursor to use the proxy in its settings")
        print("   3. Or set system proxy settings:")
        print(f"      HTTP_PROXY={proxy_env.get('HTTP_PROXY')}")
        print(f"      HTTPS_PROXY={proxy_env.get('HTTPS_PROXY')}")
        print("   4. Use Cursor with your instruction")
        print()
        print("   Waiting for 30 seconds to capture requests...")
        await asyncio.sleep(30)
        return 0


class APIBasedAdapter(AgentAdapter):
    """Adapter for API-based agents (Claude API, OpenAI, etc.)."""
    
    def __init__(self, name: str, api_command: Optional[List[str]] = None):
        super().__init__(name)
        self.api_command = api_command
    
    def is_available(self) -> bool:
        """Check if the API client is available."""
        if not self.api_command:
            return False
        try:
            result = subprocess.run(
                ["which", self.api_command[0]],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except:
            return False
    
    async def execute(self, instruction: str, proxy_env: Dict[str, str]) -> int:
        """Execute API-based agent."""
        if not self.api_command:
            print(f"ℹ️  {self.name} is typically used via API.")
            print("   To capture API requests:")
            print("   1. Use a client library that respects HTTP_PROXY")
            print("   2. Run your code with these environment variables:")
            print(f"      HTTP_PROXY={proxy_env.get('HTTP_PROXY')}")
            print(f"      HTTPS_PROXY={proxy_env.get('HTTPS_PROXY')}")
            print()
            print("   Waiting for 30 seconds to capture requests...")
            await asyncio.sleep(30)
            return 0
        
        # Execute the API command
        env = os.environ.copy()
        env.update(proxy_env)
        
        process = await asyncio.create_subprocess_exec(
            *self.api_command,
            instruction,
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if stdout:
            print(stdout.decode())
        if stderr:
            print(stderr.decode())
        
        return process.returncode


# Agent Registry
AGENT_REGISTRY: Dict[str, AgentAdapter] = {
    "claude": ClaudeAdapter(),
    "auggie": AugmentAdapter(),
    "cursor": CursorAdapter(),
    "copilot": APIBasedAdapter("copilot"),
    "codeium": APIBasedAdapter("codeium"),
    "chatgpt": APIBasedAdapter("chatgpt"),
}


def get_agent_adapter(agent_name: str) -> AgentAdapter:
    """Get the adapter for a specific agent."""
    return AGENT_REGISTRY.get(agent_name.lower())

