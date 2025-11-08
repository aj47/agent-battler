# Agent Battler Python CLI

A pure Python implementation of the Agent Battler CLI wrapper that captures network requests from AI coding agents using embedded mitmproxy.

## Why Python?

The CLI has been rewritten in Python to provide a better user experience:

✅ **Single Installation** - Just `pip install` and you're done  
✅ **No External Dependencies** - mitmproxy is embedded, not a separate tool  
✅ **No Build Step** - No need to compile TypeScript  
✅ **Better Integration** - Direct use of mitmproxy's Python API  
✅ **Simpler Architecture** - Async/await with Python's asyncio  

## Quick Start

### Installation

```bash
# From the repository root
pip install -e .
```

That's it! The `agent-battler` command is now available.

### Usage

```bash
# Basic usage
agent-battler claude "Fix the authentication bug"
agent-battler auggie "Add error handling to the API"
agent-battler cursor "Refactor the database queries"

# With options
agent-battler claude "test" --port 9090 --verbose
agent-battler auggie "test" --output-dir ./my-logs
```

### Command Options

```
positional arguments:
  {claude,auggie,cursor,copilot,codeium,chatgpt}
                        The AI coding agent to use
  instruction           The instruction to give to the agent

options:
  -h, --help            Show help message
  --port PORT           Port for the proxy server (default: 8080)
  --verbose             Enable verbose output
  --output-dir DIR      Directory to save network logs (default: ./agent-battler-logs)
```

## How It Works

1. **Embedded Proxy** - Starts mitmproxy using its Python API (no subprocess)
2. **Network Capture** - Intercepts all HTTP/HTTPS requests in real-time
3. **Agent Execution** - Runs the AI agent with proxy environment configured
4. **JSON Output** - Saves captured requests/responses to timestamped JSON files

## Architecture

```
agent_battler/
├── __init__.py          # Package initialization
├── cli.py               # Main CLI entry point with argparse
└── proxy_manager.py     # ProxyManager and NetworkCapture classes
```

### Key Components

**`cli.py`**
- Argument parsing with argparse
- Async main function using asyncio
- User-friendly output with emojis
- Error handling and validation

**`proxy_manager.py`**
- `ProxyManager` - Manages mitmproxy lifecycle
- `NetworkCapture` - Addon that captures requests/responses
- Async start/stop methods
- JSON serialization of captured data

## Output Format

Network logs are saved as JSON files:

```json
{
  "metadata": {
    "captured_at": "2025-11-07T15:38:27.738541",
    "total_requests": 5
  },
  "requests": [
    {
      "timestamp": "2025-11-07T15:38:22.123456",
      "type": "request",
      "method": "POST",
      "url": "https://api.anthropic.com/v1/messages",
      "host": "api.anthropic.com",
      "port": 443,
      "path": "/v1/messages",
      "headers": {...},
      "body": "..."
    },
    {
      "timestamp": "2025-11-07T15:38:23.456789",
      "type": "response",
      "status_code": 200,
      "url": "https://api.anthropic.com/v1/messages",
      "headers": {...},
      "body": "..."
    }
  ]
}
```

## Development

### Running Tests

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run with coverage
pytest --cov=agent_battler
```

### Code Formatting

```bash
# Format code with black
black agent_battler/

# Type checking with mypy
mypy agent_battler/
```

## Comparison: TypeScript vs Python

| Feature | TypeScript Version | Python Version |
|---------|-------------------|----------------|
| Installation | `npm install` + `brew install mitmproxy` | `pip install -e .` |
| Build Step | `npm run build:cli` required | None |
| mitmproxy | External process via subprocess | Embedded via Python API |
| Dependencies | Node.js, TypeScript, mitmproxy | Python 3.8+, mitmproxy (auto-installed) |
| Package Manager | npm | pip |
| Async Support | Promises/async-await | asyncio/async-await |
| Lines of Code | ~400 | ~250 |

## Migration from TypeScript Version

If you were using the TypeScript version:

1. **Uninstall old version**
   ```bash
   npm unlink agent-battler  # If globally linked
   ```

2. **Install Python version**
   ```bash
   pip install -e .
   ```

3. **Usage is identical**
   ```bash
   agent-battler claude "same commands work"
   ```

The command-line interface is identical, so no changes to your workflow!

## Troubleshooting

### "command not found: agent-battler"

Make sure you've installed the package:
```bash
pip install -e .
```

### "No module named 'mitmproxy'"

Install dependencies:
```bash
pip install -r requirements.txt
```

### Port already in use

Use a different port:
```bash
agent-battler claude "test" --port 9090
```

## Future Enhancements

- [ ] Actual agent command execution (currently simulated)
- [ ] Agent-specific proxy configuration
- [ ] Request filtering and analysis tools
- [ ] Real-time request visualization
- [ ] Integration with Agent Battler platform
- [ ] Support for custom mitmproxy addons
- [ ] Request replay functionality

