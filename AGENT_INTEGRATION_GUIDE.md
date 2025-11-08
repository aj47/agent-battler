# Agent Integration Guide

This guide explains how to capture network requests from different AI coding agents using the Agent Battler CLI.

## How It Works

The CLI starts a local mitmproxy server that intercepts HTTP/HTTPS requests. Different agents require different approaches to route their traffic through the proxy.

## Agent Types

### 1. CLI-Based Agents
Agents with command-line interfaces that can be invoked directly.

### 2. IDE-Based Agents  
Agents that run as IDE extensions (VS Code, Cursor, etc.).

### 3. API-Based Agents
Agents accessed via API calls (requires custom scripts).

---

## Agent-Specific Instructions

### Claude (Anthropic)

**Type**: API-based

**Option 1: Using Python with Anthropic SDK**

```python
# capture_claude.py
import os
from anthropic import Anthropic

# The proxy environment variables are set by agent-battler
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Your instruction here"}
    ]
)

print(message.content)
```

Then run:
```bash
# Terminal 1: Start the proxy
agent-battler claude "dummy" &
PROXY_PID=$!

# Terminal 2: Run your script
export ANTHROPIC_API_KEY="your-key"
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
python capture_claude.py

# Stop the proxy
kill $PROXY_PID
```

**Option 2: Using curl**

```bash
agent-battler claude "test" &
PROXY_PID=$!

curl -x http://localhost:8080 \
  https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello, Claude"}]
  }'

kill $PROXY_PID
```

### Augment (Auggie)

**Type**: CLI tool

**Installation**:
```bash
npm install -g @augmentcode/auggie
```

**Usage**:

Auggie CLI is automatically executed with the proxy environment configured:

```bash
agent-battler auggie "print hello world"
```

This will:
1. Start the mitmproxy server
2. Execute `auggie --print "print hello world"` with proxy environment variables
3. Capture all network requests made by Auggie
4. Save the captured data to JSON

**How it works**:
- The adapter uses `auggie --print` for non-interactive mode
- Proxy environment variables (HTTP_PROXY, HTTPS_PROXY) are automatically set
- All API calls made by Auggie are captured through the proxy
- Output is displayed in real-time

**Example**:
```bash
agent-battler auggie "create a hello world function in Python"
# Auggie executes the task
# All network requests are captured
# Results saved to agent-battler-logs/auggie-*.json
```

### Cursor

**Type**: IDE application

**Steps**:

1. Start the proxy:
   ```bash
   agent-battler cursor "your task"
   ```

2. Configure Cursor to use the proxy:
   - Open Cursor Settings
   - Search for "proxy"
   - Set HTTP Proxy: `http://localhost:8080`
   - Set HTTPS Proxy: `http://localhost:8080`

3. Use Cursor's AI features normally

4. Network requests will be captured

5. When done, stop the proxy and remove proxy settings

### GitHub Copilot

**Type**: IDE extension

**Steps**:

1. Start the proxy:
   ```bash
   agent-battler copilot "your task"
   ```

2. Configure your editor's proxy settings:
   - **VS Code**: Settings → Proxy → `http://localhost:8080`
   - **JetBrains IDEs**: Settings → System Settings → HTTP Proxy

3. Use GitHub Copilot normally

4. Network requests will be captured

### Codeium

**Type**: IDE extension

Similar to Copilot - configure your IDE's proxy settings and use Codeium normally.

### ChatGPT (OpenAI API)

**Type**: API-based

**Using Python with OpenAI SDK**:

```python
# capture_chatgpt.py
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Your instruction here"}
    ]
)

print(response.choices[0].message.content)
```

Run with:
```bash
agent-battler chatgpt "test" &
PROXY_PID=$!

export OPENAI_API_KEY="your-key"
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
python capture_chatgpt.py

kill $PROXY_PID
```

---

## General Tips

### SSL Certificate Issues

mitmproxy uses a self-signed certificate for HTTPS interception. You may need to:

1. **Install mitmproxy's CA certificate**:
   ```bash
   # Start mitmproxy once to generate the cert
   mitmproxy
   # Certificate is at ~/.mitmproxy/mitmproxy-ca-cert.pem
   ```

2. **Disable SSL verification** (for testing only):
   ```python
   # Python
   import urllib3
   urllib3.disable_warnings()
   
   # Or set environment variable
   export PYTHONHTTPSVERIFY=0
   ```

### Verifying Proxy is Working

Test the proxy with curl:
```bash
# Start proxy
agent-battler claude "test" &

# In another terminal
curl -x http://localhost:8080 https://api.github.com

# Check the log file - you should see the GitHub API request
```

### Troubleshooting

**No requests captured?**
- Verify the agent is using the proxy (check proxy settings)
- Check if the agent respects HTTP_PROXY environment variables
- Try setting system-wide proxy settings

**SSL errors?**
- Install mitmproxy's CA certificate
- Or disable SSL verification (testing only)

**Agent not working?**
- Some agents may not work through a proxy
- Check agent documentation for proxy support
- Try using the agent's API directly with a custom script

---

## Example: Complete Workflow

Here's a complete example capturing Claude API requests:

```bash
# 1. Start the proxy in the background
agent-battler claude "test" &
PROXY_PID=$!

# 2. Wait for proxy to start
sleep 2

# 3. Make API request through proxy
export ANTHROPIC_API_KEY="your-key"
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080

python -c "
from anthropic import Anthropic
client = Anthropic()
message = client.messages.create(
    model='claude-3-5-sonnet-20241022',
    max_tokens=1024,
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(message.content)
"

# 4. Stop the proxy
kill $PROXY_PID

# 5. Check the captured requests
ls -la agent-battler-logs/
cat agent-battler-logs/claude-*.json
```

The JSON file will contain all the API requests and responses!

