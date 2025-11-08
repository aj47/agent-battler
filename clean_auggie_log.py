#!/usr/bin/env python3
"""
Script to clean up Auggie log files into structured JSON format.
Extracts user messages, agent messages, tool calls, and results with timestamps.
"""

import json
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path


def parse_node(node: Dict) -> Optional[Dict[str, Any]]:
    """Parse a conversation node into a structured format."""
    node_type = node.get("type")
    node_id = node.get("id")

    # Type 0: Text node (user or agent message)
    if node_type == 0:
        if "text_node" in node:
            return {
                "type": "message",
                "id": node_id,
                "role": "user",
                "content": node["text_node"].get("content", "")
            }
        elif "content" in node:
            # Response format
            return {
                "type": "message",
                "id": node_id,
                "role": "assistant",
                "content": node.get("content", "")
            }

    # Type 1: Tool use node
    elif node_type == 1:
        if "tool_use_node" in node:
            tool_node = node["tool_use_node"]
            return {
                "type": "tool_call",
                "id": node_id,
                "tool_name": tool_node.get("name"),
                "tool_input": tool_node.get("input", {})
            }
        elif "tool_use" in node and node["tool_use"]:
            return {
                "type": "tool_call",
                "id": node_id,
                "tool_name": node["tool_use"].get("name"),
                "tool_input": node["tool_use"].get("input", {})
            }

    # Type 2: Tool result node or end of turn
    elif node_type == 2:
        if "tool_result_node" in node:
            result_node = node["tool_result_node"]
            return {
                "type": "tool_result",
                "id": node_id,
                "tool_use_id": result_node.get("tool_use_id"),
                "content": result_node.get("content"),
                "is_error": result_node.get("is_error", False)
            }
        else:
            # End of turn marker
            return {
                "type": "end_of_turn",
                "id": node_id
            }

    # Type 3: Token usage/billing
    elif node_type == 3:
        return {
            "type": "token_usage",
            "id": node_id
        }

    # Type 4: IDE state node (context)
    elif node_type == 4 and "ide_state_node" in node:
        return {
            "type": "context",
            "id": node_id,
            "workspace": node["ide_state_node"].get("workspace_folders", [])
        }

    return None


def parse_streaming_response(response_body: str) -> List[Dict[str, Any]]:
    """Parse streaming response body which may contain multiple JSON objects."""
    events = []

    # Split by newlines and parse each line as JSON
    for line in response_body.strip().split('\n'):
        if not line.strip():
            continue
        try:
            event = json.loads(line)
            events.append(event)
        except json.JSONDecodeError:
            # Skip lines that can't be parsed
            continue

    return events


def clean_log_file(input_path: str, output_path: str = None) -> None:
    """
    Clean up Auggie log file into structured JSON.

    Args:
        input_path: Path to the input log file
        output_path: Path to save cleaned output (optional)
    """
    # Read input file
    with open(input_path, 'r') as f:
        log_data = json.load(f)

    # Initialize cleaned data structure
    cleaned_data = {
        "metadata": {
            "original_capture_time": log_data.get("metadata", {}).get("captured_at"),
            "total_requests": log_data.get("metadata", {}).get("total_requests"),
            "cleaned_at": datetime.now().isoformat(),
            "source_file": input_path
        },
        "conversation": []
    }

    requests = log_data.get("requests", [])

    # Build a map of requests to responses by URL
    request_response_map = {}
    for i, item in enumerate(requests):
        if item.get("type") == "request":
            url = item.get("url")
            path = item.get("path")
            # Find the next response with the same URL
            for j in range(i + 1, len(requests)):
                if requests[j].get("type") == "response" and requests[j].get("url") == url:
                    request_response_map[i] = j
                    break

    # Process requests
    for i, item in enumerate(requests):
        if item.get("type") == "request":
            request_data = item
            response_data = None

            # Look for matching response
            if i in request_response_map:
                response_data = requests[request_response_map[i]]

            path = request_data.get("path", "")

            # Process chat-stream requests specially
            if path == "/chat-stream":
                try:
                    request_body = json.loads(request_data.get("body", "{}"))

                    # Extract conversation nodes from request
                    nodes = request_body.get("nodes", [])
                    for node in nodes:
                        parsed = parse_node(node)
                        if parsed:
                            parsed["timestamp"] = request_data.get("timestamp")
                            parsed["source"] = "request"
                            cleaned_data["conversation"].append(parsed)

                    # Extract response nodes if present
                    if response_data and response_data.get("body"):
                        response_body = response_data.get("body", "")

                        # Parse streaming response
                        stream_events = parse_streaming_response(response_body)

                        for event in stream_events:
                            # Extract nodes from streaming events
                            if "nodes" in event and event["nodes"]:
                                for node in event["nodes"]:
                                    parsed = parse_node(node)
                                    if parsed:
                                        parsed["timestamp"] = response_data.get("timestamp")
                                        parsed["source"] = "response"
                                        cleaned_data["conversation"].append(parsed)

                except json.JSONDecodeError as e:
                    print(f"Warning: Failed to parse chat-stream data: {e}")

    # Determine output path
    if output_path is None:
        input_file = Path(input_path)
        output_path = input_file.parent / f"{input_file.stem}_cleaned.json"

    # Write cleaned data
    with open(output_path, 'w') as f:
        json.dump(cleaned_data, f, indent=2)

    print(f"✓ Cleaned log saved to: {output_path}")
    print(f"  Total conversation items: {len(cleaned_data['conversation'])}")

    # Print item type summary
    item_types = {}
    for item in cleaned_data["conversation"]:
        item_type = item.get("type", "unknown")
        item_types[item_type] = item_types.get(item_type, 0) + 1

    print("\nConversation breakdown:")
    for item_type, count in sorted(item_types.items()):
        print(f"  {item_type}: {count}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python clean_auggie_log.py <input_log_file> [output_file]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    clean_log_file(input_file, output_file)

