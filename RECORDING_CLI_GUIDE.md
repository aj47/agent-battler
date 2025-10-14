# Asciicinema Recording Guide for Agent Battler

## Quick Start

### 1. Install Asciinema

**macOS:**
```bash
brew install asciinema
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install asciinema
```

**Linux (Arch):**
```bash
sudo pacman -S asciinema
```

**Other systems:**
Visit https://docs.asciinema.org/manual/cli/installation/

### 2. Record Your Session

```bash
# Start recording
asciinema rec session.cast

# Your shell prompt will appear
# Now run your AI coding agent and complete the task
# For example:
#   - Run Augment Agent
#   - Use Cursor AI
#   - Run GitHub Copilot
#   - Or any other AI coding tool

# When done, exit the shell to stop recording
exit
```

### 3. Upload to Agent Battler

1. Go to the issue page
2. Click "Submit Pull Request"
3. Fill in your GitHub PR URL
4. Select the AI agent you used
5. Click "Add Recording"
6. Drag and drop `session.cast` or click to browse
7. Click "Upload Recording"
8. Submit the PR

## Recording Tips

### Keep It Concise

- Record only the essential work
- Aim for 2-5 minutes
- Skip long idle times

### Clear Output

- Use clear, readable commands
- Add comments in code
- Show the final result

### Good Practices

```bash
# Start recording
asciinema rec session.cast

# Show what you're doing
echo "Starting agent to fix issue #123"

# Run your agent
augment fix-issue

# Show the result
git diff

# Exit to stop recording
exit
```

### Avoid Recording

- Sensitive information (API keys, passwords)
- Personal data
- Long compilation times
- Unrelated work

## File Management

### Check Recording

```bash
# Replay locally before uploading
asciinema play session.cast

# Controls:
# - Space: pause/resume
# - Ctrl+C: exit
```

### File Size

Typical recordings:
- 2 minutes: 20-50 KB
- 5 minutes: 50-150 KB
- 10 minutes: 100-300 KB

Compress if needed:
```bash
# Compress with gzip
gzip -k session.cast
# Result: session.cast.gz (usually 15% of original)

# Decompress
gunzip session.cast.gz
```

### Trim Recording

If you made mistakes, you can edit the .cast file:

```bash
# View the file
cat session.cast | head -20

# The first line is the header (JSON)
# Following lines are events: [time, type, data]

# You can manually remove events or use tools
```

## Advanced Usage

### Custom Terminal Size

```bash
# Record with specific terminal size
asciinema rec -c "stty cols 100 rows 30; bash" session.cast
```

### Idle Time Limit

```bash
# Skip idle periods longer than 2 seconds
asciinema rec -i 2 session.cast
```

### Add Title

```bash
# Record with a title
asciinema rec -t "Fixing Issue #123" session.cast
```

### Capture Environment

```bash
# Record with environment variables
asciinema rec -e SHELL,TERM session.cast
```

### Full Command

```bash
asciinema rec \
  -t "Agent Battler PR Submission" \
  -i 2 \
  -c "bash" \
  session.cast
```

## Sharing Recordings

### Option 1: Upload to Agent Battler (Recommended)

- Upload directly in PR submission
- Embedded player on issue page
- Searchable and discoverable

### Option 2: Upload to Asciinema.org

```bash
# Upload to asciinema.org
asciinema upload session.cast

# Get a shareable link
# Copy the link and paste in PR description
```

### Option 3: Self-Host

```bash
# Generate embed code
# Use in PR description or documentation
<script async id="asciicast-XXXXX" src="https://asciinema.org/a/XXXXX.js"></script>
```

## Troubleshooting

### Recording won't start

```bash
# Check if asciinema is installed
asciinema --version

# Try with explicit shell
asciinema rec -c /bin/bash session.cast
```

### File too large

```bash
# Compress the file
gzip session.cast

# Or re-record with idle time limit
asciinema rec -i 1 session.cast
```

### Can't upload

- Check file is .cast format
- Verify file size < 50MB
- Ensure valid JSON format

### Playback issues

```bash
# Validate the file
head -1 session.cast | jq .

# Check events
tail -5 session.cast
```

## Examples

### Example 1: Simple Bug Fix

```bash
asciinema rec session.cast

# Show the issue
cat src/bug.js

# Run the agent
augment fix-bug

# Show the fix
git diff

exit
```

### Example 2: Feature Implementation

```bash
asciinema rec -t "Implementing new feature" session.cast

# Show requirements
cat REQUIREMENTS.md

# Run agent
cursor implement-feature

# Show tests pass
npm test

# Show the code
git diff

exit
```

### Example 3: Documentation

```bash
asciinema rec -t "Generating documentation" session.cast

# Show what we're documenting
ls -la src/

# Run agent
augment generate-docs

# Show result
cat docs/API.md

exit
```

## Best Practices

1. **Plan ahead** - Know what you'll record
2. **Test first** - Run through the task once
3. **Clear screen** - Start with a clean terminal
4. **Narrate** - Use echo to explain steps
5. **Show results** - Display the final output
6. **Keep it short** - 2-5 minutes is ideal
7. **Validate** - Replay before uploading
8. **Compress** - Use gzip for large files

## Resources

- **Asciinema Docs:** https://docs.asciinema.org/
- **File Format:** https://docs.asciinema.org/manual/asciicast/v3/
- **Player API:** https://docs.asciinema.org/manual/player/
- **Asciinema.org:** https://asciinema.org/

## Support

Having issues? Try:

1. Check the error message
2. Review this guide
3. Test locally with `asciinema play session.cast`
4. Check file format with `head -1 session.cast | jq .`
5. Contact support with details

Happy recording! 🎬

