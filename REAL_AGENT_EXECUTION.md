# Real Agent Execution - How It Works

## Overview

The Agent Battler CLI now supports **real agent execution** with proper network request capture for different types of AI coding agents.

## Agent Types & Execution Strategies

### 1. CLI-Based Agents

**Examples**: Claude CLI (if it exists), custom CLI tools

**How it works**:
- Executes the agent command directly
- Sets proxy environment variables (HTTP_PROXY, HTTPS_PROXY)
- Captures stdout/stderr
- Returns exit code

**Code**:
```python
env = os.environ.copy()
env.update(proxy_env)  # Add HTTP_PROXY, HTTPS_PROXY

process = await asyncio.create_subprocess_exec(
    "agent-cli", instruction,
    env=env,
    stdout=asyncio.subprocess.PIPE,
    stderr=asyncio.subprocess.PIPE
)
```

### 2. IDE-Based Agents

**Examples**: Augment, Cursor, GitHub Copilot, Codeium

**How it works**:
- Starts the proxy server
- Provides clear instructions for configuring the IDE
- Waits 30 seconds for manual agent usage
- Captures all network requests during that time

**User workflow**:
1. Run `agent-battler auggie "your task"`
2. CLI shows proxy configuration instructions
3. Configure IDE to use `http://localhost:8080` as proxy
4. Use the agent in your IDE for 30 seconds
5. All network requests are captured automatically

**Why 30 seconds?**
- Gives you time to configure the IDE
- Allows for interactive agent usage
- Can be extended if needed

### 3. API-Based Agents

**Examples**: Claude API, ChatGPT/OpenAI API

**How it works**:
- Starts the proxy server
- Provides instructions for using the API with proxy
- Can execute custom Python scripts if configured
- Captures API requests/responses

**Example workflow**:
```bash
# Start the proxy
agent-battler claude "test" &
PROXY_PID=$!

# Use the API with proxy
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
python your_claude_script.py

# Stop the proxy
kill $PROXY_PID
```

## Agent Adapter System

Each agent has a dedicated adapter class:

```python
class AgentAdapter(ABC):
    @abstractmethod
    async def execute(self, instruction: str, proxy_env: Dict[str, str]) -> int:
        """Execute the agent with proxy configuration."""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if this agent is available on the system."""
        pass
```

### Implemented Adapters

**ClaudeAdapter**
- Checks for Claude CLI
- Falls back to API instructions if CLI not found

**AugmentAdapter**
- IDE-based, no CLI
- Provides IDE configuration instructions
- 30-second capture window

**CursorAdapter**
- Detects Cursor installation
- Provides IDE configuration instructions
- 30-second capture window

**APIBasedAdapter**
- Generic adapter for API-based agents
- Configurable command execution
- Provides API usage instructions

## Configuration

Users can customize agent behavior via `config.yaml`:

```yaml
agents:
  claude:
    type: api
    command: null  # Or specify a CLI command
    api_script: "capture_claude.py"
    env:
      ANTHROPIC_API_KEY: "your-key"
  
  auggie:
    type: ide
    instructions: |
      1. Configure your IDE proxy to localhost:8080
      2. Use Augment normally
```

## Network Capture

All network requests are captured regardless of agent type:

```json
{
  "metadata": {
    "captured_at": "2025-11-07T16:13:44.123675",
    "total_requests": 3
  },
  "requests": [
    {
      "timestamp": "2025-11-07T16:13:45.456789",
      "type": "request",
      "method": "POST",
      "url": "https://api.anthropic.com/v1/messages",
      "headers": {...},
      "body": "..."
    },
    {
      "timestamp": "2025-11-07T16:13:46.789012",
      "type": "response",
      "status_code": 200,
      "headers": {...},
      "body": "..."
    }
  ]
}
```

## Benefits

✅ **Flexible** - Supports CLI, IDE, and API-based agents  
✅ **User-Friendly** - Clear instructions for each agent type  
✅ **Extensible** - Easy to add new agents  
✅ **Automatic** - Captures requests without manual intervention  
✅ **Complete** - Captures full request/response data  

## Adding New Agents

To add a new agent:

1. Create an adapter class:
```python
class MyAgentAdapter(AgentAdapter):
    def is_available(self) -> bool:
        # Check if agent is installed
        return True
    
    async def execute(self, instruction: str, proxy_env: Dict[str, str]) -> int:
        # Execute the agent
        return 0
```

2. Register it:
```python
AGENT_REGISTRY["myagent"] = MyAgentAdapter()
```

3. Update SUPPORTED_AGENTS in cli.py

## See Also

- **AGENT_INTEGRATION_GUIDE.md** - Detailed integration instructions for each agent
- **agent_battler/config.example.yaml** - Configuration template
- **agent_battler/agents.py** - Adapter implementations

