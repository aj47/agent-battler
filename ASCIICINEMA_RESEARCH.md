# Asciicinema Research: Integration for Agent Session Recordings

## Overview

**Asciicinema** is a lightweight terminal session recording and playback tool that captures terminal output into text-based `.cast` files instead of heavyweight video files. It's ideal for recording agent work sessions and embedding them in PR submissions.

### Key Advantages
- **Lightweight**: Records as JSON-based text files (highly compressible, ~15% of original size with gzip/zstd)
- **Searchable**: Terminal content is plain text, allowing copy-paste and text selection
- **Web-embeddable**: Can be embedded in documentation, PRs, and web pages
- **Live streaming**: Supports both local and remote streaming
- **Open source**: GPL-3.0 licensed, actively maintained

---

## Asciicast File Format (v3)

The `.cast` format is **newline-delimited JSON** with two parts:

### 1. Header (First Line)
Metadata about the recording:
```json
{
  "version": 3,
  "term": {
    "cols": 80,
    "rows": 24,
    "type": "xterm-256color"
  },
  "timestamp": 1504467315,
  "title": "Agent PR Session",
  "command": "/bin/bash",
  "idle_time_limit": 2,
  "env": {"SHELL": "/bin/bash"},
  "tags": ["agent", "pr", "demo"]
}
```

### 2. Event Stream (Following Lines)
Each line is a 3-element JSON array: `[interval, code, data]`

**Event Codes:**
- `"o"` - Output (terminal output)
- `"i"` - Input (keyboard input, optional)
- `"m"` - Marker (navigation breakpoints)
- `"r"` - Resize (terminal resize)
- `"x"` - Exit (exit status)

**Example Events:**
```json
[0.248848, "o", "Hello World\n"]
[1.001376, "o", "Processing..."]
[2.050000, "r", "90x30"]
[0.8870, "x", "0"]
```

---

## Integration Approaches for Agent Sessions

### Approach 1: CLI Recording (Simplest)
Wrap agent execution with `asciinema rec`:
```bash
asciinema rec agent-session.cast -- agent-command
```
- **Pros**: Simple, captures everything
- **Cons**: Requires shell wrapper, timing may be affected

### Approach 2: Programmatic Recording (Recommended)
Create a custom recorder that:
1. Spawns agent process with PTY (pseudo-terminal)
2. Captures stdout/stderr in real-time
3. Generates `.cast` file with proper timing
4. Includes metadata (PR number, agent name, timestamp)

**Libraries available for:**
- Python: `pty`, `pexpect`, custom implementation
- Node.js: `node-pty`, custom implementation
- Rust: `pty-process` crate

### Approach 3: Hybrid Approach
- Use asciinema CLI for recording
- Post-process `.cast` file to add custom metadata
- Embed in PR description or as artifact

---

## PR Submission Integration

### Option A: Embed in PR Description
```markdown
## Agent Session Recording

<script async id="asciicast-XXXXX" src="https://asciinema.org/a/XXXXX.js"></script>

Or self-hosted:
<div id="demo"></div>
<script src="/asciinema-player.min.js"></script>
<script>
  AsciinemaPlayer.create('/recordings/agent-session.cast', document.getElementById('demo'));
</script>
```

### Option B: Store as Artifact
- Save `.cast` file in PR artifacts
- Link to it in PR description
- Viewers can download and replay locally with `asciinema play`

### Option C: GitHub Actions Integration
1. Agent runs in GitHub Actions workflow
2. Workflow captures session with asciinema
3. Uploads `.cast` file as artifact
4. PR comment includes link/embed

---

## Implementation Considerations

### Timing Accuracy
- Asciicast uses **relative timing** (interval from previous event)
- Must capture precise timestamps during agent execution
- PTY-based recording naturally captures timing

### Metadata Capture
- Terminal size (cols/rows)
- Terminal type (TERM env var)
- Command executed
- Exit status
- Custom tags (PR number, agent name, etc.)

### File Size
- Typical 5-minute session: 50-200 KB
- Highly compressible with gzip/zstd
- Can be stored in git or as artifact

### Privacy/Security
- Contains all terminal output (may include secrets)
- Consider sanitization for sensitive data
- asciinema.org has privacy controls
- Self-hosting gives full control

---

## Recommended Architecture

```
Agent Execution Flow:
┌─────────────────────────────────────────┐
│ 1. Start PTY-based recording            │
│    - Initialize asciicast header        │
│    - Start timing                       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. Execute agent in PTY                 │
│    - Capture stdout/stderr              │
│    - Record timing for each event       │
│    - Capture terminal resizes           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 3. Finalize recording                   │
│    - Add exit status event              │
│    - Write .cast file                   │
│    - Add metadata (PR #, agent name)    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 4. Embed in PR                          │
│    - Upload to asciinema.org or CDN     │
│    - Add player embed to PR description │
│    - Link to recording artifact         │
└─────────────────────────────────────────┘
```

---

## Tools & Resources

### Official Tools
- **asciinema CLI**: https://github.com/asciinema/asciinema (Rust)
- **asciinema-player**: https://github.com/asciinema/asciinema-player (JavaScript/WASM)
- **asciinema-server**: https://github.com/asciinema/asciinema-server (self-hosting)

### Documentation
- Getting Started: https://docs.asciinema.org/getting-started/
- File Format: https://docs.asciinema.org/manual/asciicast/v3/
- Player API: https://docs.asciinema.org/manual/player/

### Hosting Options
- **asciinema.org**: Free public hosting
- **Self-hosted**: Docker container available
- **GitHub Artifacts**: Store `.cast` files directly
- **CDN**: Serve `.cast` files from any static host

---

## Next Steps for Implementation

1. **Prototype**: Create simple PTY recorder that generates `.cast` files
2. **Test**: Record sample agent sessions and verify playback
3. **Embed**: Add player to PR template/description
4. **Automate**: Integrate into CI/CD pipeline
5. **Optimize**: Add metadata, sanitization, compression
6. **Scale**: Consider hosting strategy (asciinema.org vs self-hosted)

