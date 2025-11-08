# Auggie Log Cleaner

This script cleans up Auggie agent log files into a structured JSON format that contains only the essential conversation data: user messages, agent messages, tool calls, and their results, all with timestamps.

## Features

- Extracts user messages with timestamps
- Extracts agent/assistant messages with timestamps
- Captures tool calls and their parameters
- Captures tool results
- Preserves conversation context (workspace info)
- Removes unnecessary API metadata and headers
- Outputs clean, readable JSON

## Usage

### Basic Usage

```bash
python clean_auggie_log.py <input_log_file>
```

This will create a cleaned file with `_cleaned.json` suffix in the same directory as the input file.

### Specify Output File

```bash
python clean_auggie_log.py <input_log_file> <output_file>
```

### Example

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

## Output Format

The cleaned JSON file has the following structure:

```json
{
  "metadata": {
    "original_capture_time": "2025-11-07T17:45:23.437319",
    "total_requests": 14,
    "cleaned_at": "2025-11-07T17:58:44.723050",
    "source_file": "/path/to/original/file.json"
  },
  "conversation": [
    {
      "type": "message",
      "id": 1,
      "role": "user",
      "content": "hi",
      "timestamp": "2025-11-07T17:45:20.566167",
      "source": "request"
    },
    {
      "type": "message",
      "id": 1,
      "role": "assistant",
      "content": "Hello! How can I help you today?\n",
      "timestamp": "2025-11-07T17:45:23.273742",
      "source": "response"
    },
    {
      "type": "tool_call",
      "id": 2,
      "tool_name": "view",
      "tool_input": {
        "path": "example.py",
        "type": "file"
      },
      "timestamp": "2025-11-07T17:45:25.123456",
      "source": "response"
    },
    {
      "type": "tool_result",
      "id": 3,
      "tool_use_id": 2,
      "content": "File contents...",
      "is_error": false,
      "timestamp": "2025-11-07T17:45:25.234567",
      "source": "response"
    }
  ]
}
```

## Conversation Item Types

- **message**: User or assistant text messages
  - `role`: "user" or "assistant"
  - `content`: The message text
  
- **tool_call**: When the agent calls a tool
  - `tool_name`: Name of the tool being called
  - `tool_input`: Parameters passed to the tool
  
- **tool_result**: Result from a tool execution
  - `tool_use_id`: ID of the corresponding tool_call
  - `content`: The result data
  - `is_error`: Whether the tool call resulted in an error
  
- **context**: Workspace/environment context
  - `workspace`: Information about the workspace folders
  
- **end_of_turn**: Marks the end of an agent turn
  
- **token_usage**: Token usage information for billing/metrics

## Requirements

- Python 3.6+
- No external dependencies (uses only standard library)

## Notes

- The script preserves all timestamps from the original log
- Source field indicates whether the item came from a "request" or "response"
- The script handles streaming responses from the Auggie API
- Invalid JSON lines in the response stream are silently skipped

