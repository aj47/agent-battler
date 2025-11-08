# Quick Start Guide

## Installation

No installation needed! The script uses only Python standard library.

**Requirements:**
- Python 3.6 or higher

## Basic Usage

### 1. Make the script executable (optional)

```bash
chmod +x clean_auggie_log.py
```

### 2. Run the script

```bash
# Using python
python clean_auggie_log.py path/to/your/auggie-log.json

# Or if made executable
./clean_auggie_log.py path/to/your/auggie-log.json
```

### 3. Find your cleaned output

The script creates a file with `_cleaned.json` suffix in the same directory:

```
Input:  agent-battler-logs/auggie-2025-11-07T17-45-17-769046.json
Output: agent-battler-logs/auggie-2025-11-07T17-45-17-769046_cleaned.json
```

## Examples

### Example 1: Clean a log file

```bash
python clean_auggie_log.py agent-battler-logs/auggie-2025-11-07T17-45-17-769046.json
```

Output:
```
✓ Cleaned log saved to: agent-battler-logs/auggie-2025-11-07T17-45-17-769046_cleaned.json
  Total conversation items: 5

Conversation breakdown:
  context: 1
  end_of_turn: 1
  message: 2
  token_usage: 1
```

### Example 2: Specify custom output location

```bash
python clean_auggie_log.py input.json output/cleaned.json
```

### Example 3: Process multiple files

```bash
for file in agent-battler-logs/*.json; do
    python clean_auggie_log.py "$file"
done
```

### Example 4: View the cleaned output

```bash
python clean_auggie_log.py my-log.json
cat my-log_cleaned.json | jq .
```

## Understanding the Output

### Metadata Section

```json
{
  "metadata": {
    "original_capture_time": "2025-11-07T17:45:23.437319",
    "total_requests": 14,
    "cleaned_at": "2025-11-07T17:58:44.723050",
    "source_file": "/path/to/original.json"
  }
}
```

### Conversation Section

Each item in the conversation array has:
- `type` - The type of event (message, tool_call, tool_result, etc.)
- `id` - Unique identifier
- `timestamp` - When the event occurred
- `source` - Whether it came from "request" or "response"

### Message Types

**User Message:**
```json
{
  "type": "message",
  "role": "user",
  "content": "hi",
  "timestamp": "2025-11-07T17:45:20.566167"
}
```

**Assistant Message:**
```json
{
  "type": "message",
  "role": "assistant",
  "content": "Hello! How can I help you today?\n",
  "timestamp": "2025-11-07T17:45:23.273742"
}
```

**Tool Call:**
```json
{
  "type": "tool_call",
  "tool_name": "view",
  "tool_input": {
    "path": "example.py",
    "type": "file"
  },
  "timestamp": "2025-11-07T17:45:25.123456"
}
```

**Tool Result:**
```json
{
  "type": "tool_result",
  "tool_use_id": 2,
  "content": "File contents...",
  "is_error": false,
  "timestamp": "2025-11-07T17:45:25.234567"
}
```

## Common Use Cases

### 1. Analyze conversation flow
```bash
python clean_auggie_log.py my-log.json
cat my-log_cleaned.json | jq '.conversation[] | select(.type == "message")'
```

### 2. Extract all tool calls
```bash
cat my-log_cleaned.json | jq '.conversation[] | select(.type == "tool_call")'
```

### 3. Count messages by role
```bash
cat my-log_cleaned.json | jq '.conversation[] | select(.type == "message") | .role' | sort | uniq -c
```

### 4. Get conversation timeline
```bash
cat my-log_cleaned.json | jq '.conversation[] | "\(.timestamp) - \(.type)"'
```

## Troubleshooting

**Error: "No such file or directory"**
- Check that the input file path is correct
- Use absolute paths if relative paths don't work

**Error: "Failed to parse chat-stream data"**
- The log file may be corrupted or incomplete
- Check that it's a valid Auggie log file

**No output generated**
- Check that the log file contains `/chat-stream` requests
- Verify the file is not empty

## Next Steps

- Read `README_CLEAN_AUGGIE_LOG.md` for detailed documentation
- See `COMPARISON.md` for before/after examples
- Check `SUMMARY.md` for technical details

