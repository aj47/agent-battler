#!/usr/bin/env python3
"""
Mitmproxy addon script for capturing network requests from AI coding agents.

This script logs all HTTP/HTTPS requests and responses to a JSON file
for later analysis and submission to Agent Battler.

Usage:
    mitmdump -s lib/mitmproxy-addon.py --set logfile=output.json
"""

import json
import sys
from datetime import datetime
from mitmproxy import http, ctx


class NetworkLogger:
    def __init__(self):
        self.requests = []
        self.logfile = "network-capture.json"
        
    def configure(self, updated):
        """Called when configuration changes."""
        if "logfile" in updated:
            self.logfile = ctx.options.logfile
            ctx.log.info(f"Logging to: {self.logfile}")
    
    def request(self, flow: http.HTTPFlow) -> None:
        """Called when a request is received."""
        request_data = {
            "timestamp": datetime.now().isoformat(),
            "type": "request",
            "method": flow.request.method,
            "url": flow.request.pretty_url,
            "host": flow.request.host,
            "port": flow.request.port,
            "path": flow.request.path,
            "headers": dict(flow.request.headers),
            "content_length": len(flow.request.content) if flow.request.content else 0,
        }
        
        # Log request body for POST/PUT/PATCH (but limit size)
        if flow.request.method in ["POST", "PUT", "PATCH"]:
            if flow.request.content and len(flow.request.content) < 10000:
                try:
                    request_data["body"] = flow.request.text
                except:
                    request_data["body"] = "<binary data>"
        
        self.requests.append(request_data)
        ctx.log.info(f"Request: {flow.request.method} {flow.request.pretty_url}")
    
    def response(self, flow: http.HTTPFlow) -> None:
        """Called when a response is received."""
        response_data = {
            "timestamp": datetime.now().isoformat(),
            "type": "response",
            "url": flow.request.pretty_url,
            "status_code": flow.response.status_code,
            "reason": flow.response.reason,
            "headers": dict(flow.response.headers),
            "content_length": len(flow.response.content) if flow.response.content else 0,
        }
        
        # Log response body for small responses
        if flow.response.content and len(flow.response.content) < 10000:
            try:
                response_data["body"] = flow.response.text
            except:
                response_data["body"] = "<binary data>"
        
        self.requests.append(response_data)
        ctx.log.info(f"Response: {flow.response.status_code} {flow.request.pretty_url}")
    
    def done(self):
        """Called when mitmproxy shuts down."""
        ctx.log.info(f"Saving {len(self.requests)} requests to {self.logfile}")
        
        output = {
            "metadata": {
                "captured_at": datetime.now().isoformat(),
                "total_requests": len(self.requests),
            },
            "requests": self.requests
        }
        
        try:
            with open(self.logfile, 'w') as f:
                json.dump(output, f, indent=2)
            ctx.log.info(f"Successfully saved to {self.logfile}")
        except Exception as e:
            ctx.log.error(f"Failed to save log file: {e}")


# Create the addon instance
addons = [NetworkLogger()]

