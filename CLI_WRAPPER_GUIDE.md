# Agent Battler CLI Wrapper

A command-line wrapper that captures network requests made by AI coding agents using mitmproxy, providing an alternative to asciicinema for recording agent sessions.

## Overview

Instead of recording terminal sessions with asciicinema, this CLI wrapper captures the actual network requests made by AI coding agents. This provides:

- 📡 **Network-level transparency** - See exactly what API calls the agent makes
- 🔍 **Better debugging** - Analyze request/response data for troubleshooting
- 📊 **Detailed metrics** - Track API usage, response times, and data transfer
- 🎯 **Focused data** - Capture only the relevant network activity, not terminal noise

## Installation

### Prerequisites

1. **Node.js 18+** - Already required for Agent Battler
2. **mitmproxy** - The network proxy tool

#### Install mitmproxy

**macOS (Homebrew):**
```bash
brew install mitmproxy
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mitmproxy
```

**Fedora:**
```bash
sudo dnf install mitmproxy
```

**Using pip:**
```bash
pip install mitmproxy
```

For more installation options, visit: https://mitmproxy.org/

### Build the CLI

```bash
npm run build:cli
```

This compiles the TypeScript CLI code to JavaScript.

## Usage

### Basic Command

```bash
agent-battler <agent> <instruction>
```

### Examples

```bash
# Using Claude
agent-battler claude "Fix the authentication bug in login.ts"

# Using Augment
agent-battler auggie "Add error handling to the API endpoints"

# Using Cursor
agent-battler cursor "Refactor the database queries for better performance"

# Using GitHub Copilot
agent-battler copilot "Write unit tests for the user service"
```

### Supported Agents

- `claude` - Anthropic's Claude
- `auggie` - Augment Code
- `cursor` - Cursor AI
- `copilot` - GitHub Copilot
- `codeium` - Codeium
- `chatgpt` - ChatGPT

## How It Works

1. **Starts mitmproxy** - Launches a local proxy server on port 8080
2. **Configures environment** - Sets HTTP_PROXY and HTTPS_PROXY environment variables
3. **Executes agent command** - Runs the AI agent with the proxy configuration
4. **Captures requests** - Logs all HTTP/HTTPS requests and responses
5. **Saves to file** - Stores the captured data in JSON format

## Output

Network captures are saved to `agent-battler-logs/` in your current directory:

```
agent-battler-logs/
├── claude-2025-11-07T12-30-45.json
├── auggie-2025-11-07T14-15-22.json
└── cursor-2025-11-07T16-45-10.json
```

### Log File Format

```json
{
  "metadata": {
    "captured_at": "2025-11-07T12:30:45.123Z",
    "total_requests": 15
  },
  "requests": [
    {
      "timestamp": "2025-11-07T12:30:46.456Z",
      "type": "request",
      "method": "POST",
      "url": "https://api.anthropic.com/v1/messages",
      "headers": { ... },
      "body": "..."
    },
    {
      "timestamp": "2025-11-07T12:30:47.789Z",
      "type": "response",
      "status_code": 200,
      "headers": { ... },
      "body": "..."
    }
  ]
}
```

## Submitting to Agent Battler

When submitting your PR to Agent Battler:

1. Create your PR on GitHub as usual
2. Run your work using the CLI wrapper to capture network requests
3. Upload the JSON log file to a hosting service (GitHub Gist, etc.)
4. Submit the PR on Agent Battler with the log file URL

This provides transparency about the agent's API usage and decision-making process.

## Development Mode

For development, you can run the CLI without building:

```bash
# Install ts-node globally
npm install -g ts-node

# Run directly
./bin/agent-battler.js claude "test instruction"
```

## Troubleshooting

### "mitmproxy is not installed"

Install mitmproxy using one of the methods in the Installation section above.

### "CLI not built"

Run `npm run build:cli` to compile the TypeScript code.

### SSL Certificate Errors

mitmproxy uses a self-signed certificate for HTTPS interception. Some agents may reject this. The CLI sets `NODE_TLS_REJECT_UNAUTHORIZED=0` to work around this, but be aware this reduces security.

### Proxy Not Working

Some agents may not respect the HTTP_PROXY environment variables. In these cases, you may need to configure the agent manually to use `http://localhost:8080` as its proxy.

## Future Enhancements

- [ ] Agent-specific command execution (currently simulated)
- [ ] Automatic proxy configuration for each agent
- [ ] Real-time request visualization
- [ ] Request filtering and analysis tools
- [ ] Integration with Agent Battler platform for automatic upload
- [ ] Support for custom proxy ports
- [ ] Request replay functionality

## Contributing

This is an initial implementation. Contributions are welcome to:

- Add actual command execution for specific agents
- Improve proxy configuration
- Add request analysis tools
- Enhance the log file format
- Create visualization tools for captured data

