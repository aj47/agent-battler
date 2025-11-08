# Auggie Log Cleaner - Summary

## What Was Created

I've analyzed the Auggie log file and created a Python script that cleans it up into a pure JSON format containing only the essential conversation data.

### Files Created

1. **`clean_auggie_log.py`** - The main cleaning script (225 lines)
2. **`README_CLEAN_AUGGIE_LOG.md`** - Comprehensive documentation
3. **Example cleaned output** - `auggie-2025-11-07T17-45-17-769046_cleaned.json`

## What the Script Does

The script processes Auggie agent log files and extracts:

- ✅ **User messages** with timestamps and content
- ✅ **Agent/Assistant messages** with timestamps and content  
- ✅ **Tool calls** with tool names and input parameters
- ✅ **Tool results** with output data and error status
- ✅ **Context information** (workspace folders, etc.)
- ✅ **Metadata** (timestamps, token usage, end-of-turn markers)

## Key Features

1. **Clean JSON Output** - Removes all HTTP headers, API metadata, and unnecessary fields
2. **Timestamped Events** - Every conversation item has a timestamp
3. **Structured Data** - Consistent format for all event types
4. **Source Tracking** - Indicates whether data came from request or response
5. **Streaming Support** - Handles Auggie's streaming response format
6. **Error Handling** - Gracefully handles malformed JSON

## Usage

```bash
# Basic usage (creates file with _cleaned.json suffix)
python clean_auggie_log.py <input_log_file>

# Specify output file
python clean_auggie_log.py <input_log_file> <output_file>

# Make it executable and run directly
chmod +x clean_auggie_log.py
./clean_auggie_log.py <input_log_file>
```

## Example Output Structure

```json
{
  "metadata": {
    "original_capture_time": "2025-11-07T17:45:23.437319",
    "total_requests": 14,
    "cleaned_at": "2025-11-07T17:58:44.723050",
    "source_file": "/path/to/original.json"
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
    }
  ]
}
```

## Event Types Supported

- **message** - User or assistant text messages
- **tool_call** - Tool invocations with parameters
- **tool_result** - Tool execution results
- **context** - Workspace and environment context
- **end_of_turn** - Marks end of agent turn
- **token_usage** - Token usage metrics

## Technical Details

- **Language**: Python 3.6+
- **Dependencies**: None (uses only standard library)
- **Input Format**: Auggie HTTP request/response log JSON
- **Output Format**: Structured conversation JSON
- **Parsing**: Handles newline-delimited JSON streaming responses

## Testing

The script was tested on the provided log file:
- Input: `auggie-2025-11-07T17-45-17-769046.json` (293 lines, 14 HTTP requests)
- Output: `auggie-2025-11-07T17-45-17-769046_cleaned.json` (50 lines, 5 conversation items)
- Reduction: ~83% smaller, containing only essential data

## Next Steps

You can now:
1. Use this script to clean any Auggie log file
2. Process the cleaned JSON for analysis or visualization
3. Feed the cleaned data into other tools or pipelines
4. Compare conversations across different sessions
5. Build analytics on agent behavior and tool usage

