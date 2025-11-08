# Proxy Limitations and Workarounds

## The Problem

Many modern applications, especially Node.js-based tools like Auggie CLI, **do not respect HTTP_PROXY and HTTPS_PROXY environment variables** by default. This is because:

1. **Modern HTTP clients** (like `fetch`, `axios`, `undici`) don't automatically use proxy environment variables
2. **Node.js's built-in `https` module** doesn't respect these variables without additional configuration
3. **Applications must explicitly implement proxy support** - it's not automatic

## Affected Agents

- ❌ **Auggie CLI** - Node.js based, doesn't respect proxy environment variables
- ❌ **Many Node.js tools** - Same limitation
- ✅ **Python-based tools** - Usually respect proxy variables (via `requests` library)
- ✅ **curl, wget** - Respect proxy variables
- ⚠️  **IDE-based agents** - Depends on IDE's proxy settings

## Current Behavior

When you run:
```bash
agent-battler auggie "print hello world"
```

What happens:
1. ✅ Mitmproxy starts successfully on port 8080
2. ✅ HTTP_PROXY and HTTPS_PROXY are set in environment
3. ✅ Auggie executes and completes successfully
4. ❌ **No requests are captured** - Auggie ignores the proxy

## Workarounds

### Option 1: System-Wide Proxy (macOS)

Set system-wide proxy settings:

```bash
# Set system proxy
networksetup -setwebproxy "Wi-Fi" localhost 8080
networksetup -setsecurewebproxy "Wi-Fi" localhost 8080

# Run agent-battler
agent-battler auggie "your instruction"

# Disable system proxy when done
networksetup -setwebproxystate "Wi-Fi" off
networksetup -setsecurewebproxystate "Wi-Fi" off
```

### Option 2: Proxychains (Linux/macOS with Homebrew)

Install proxychains:
```bash
# macOS
brew install proxychains-ng

# Linux
sudo apt-get install proxychains4
```

Configure `/etc/proxychains.conf` or `~/.proxychains/proxychains.conf`:
```
[ProxyList]
http 127.0.0.1 8080
```

Use with agent-battler:
```bash
# Start proxy in background
agent-battler auggie "test" &
PROXY_PID=$!

# Run auggie through proxychains
proxychains4 auggie --print "your instruction"

# Stop proxy
kill $PROXY_PID
```

### Option 3: Custom API Endpoint (If Supported)

Some tools allow configuring a custom API endpoint. Check if Auggie supports:
```bash
# Example (if supported)
ANTHROPIC_BASE_URL=http://localhost:8080 auggie "your instruction"
```

### Option 4: Manual Network Capture

Use system tools to capture network traffic:

**macOS (tcpdump)**:
```bash
# Start capture
sudo tcpdump -i any -w capture.pcap host api.anthropic.com &
TCPDUMP_PID=$!

# Run auggie
auggie "your instruction"

# Stop capture
sudo kill $TCPDUMP_PID

# Analyze with Wireshark or tcpdump
tcpdump -r capture.pcap -A
```

**Wireshark**:
1. Start Wireshark
2. Capture on your network interface
3. Filter: `http or tls`
4. Run auggie
5. Analyze captured packets

### Option 5: Modify Auggie (Advanced)

If you have access to Auggie's source code, you could:

1. Install proxy agent packages:
```bash
cd $(npm root -g)/@augmentcode/auggie
npm install http-proxy-agent https-proxy-agent
```

2. Modify the HTTP client to use proxy agents
3. Rebuild Auggie

## Recommended Approach

For **demonstration and testing**:
- Use the CLI as-is, understanding that network capture may not work for all agents
- Document which agents support proxy capture

For **production use**:
- Use system-wide proxy settings (Option 1)
- Or use proxychains (Option 2)
- Or use manual network capture tools (Option 4)

## Future Improvements

Possible enhancements to agent-battler:

1. **Auto-detect proxy support** - Test if agent respects proxy before running
2. **Proxychains integration** - Automatically use proxychains if available
3. **System proxy toggle** - Automatically set/unset system proxy
4. **Alternative capture methods** - Use tcpdump or similar as fallback
5. **Agent-specific wrappers** - Custom wrappers for each agent that force proxy usage

## Testing Proxy Support

To test if an agent respects proxy variables:

```bash
# Start a test proxy
mitmproxy -p 8080 &
PROXY_PID=$!

# Set proxy variables
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080

# Run the agent
your-agent "test command"

# Check mitmproxy logs
# If you see requests, the agent respects the proxy
# If not, it doesn't

kill $PROXY_PID
```

## Summary

- **The limitation is real** - Many Node.js apps don't respect proxy environment variables
- **Workarounds exist** - System proxy, proxychains, or manual capture
- **Document clearly** - Users should know which agents support proxy capture
- **Future improvements** - Can add automatic workarounds to agent-battler

