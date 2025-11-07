"""
Proxy Manager - Embeds mitmproxy for capturing network requests
"""

import asyncio
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from mitmproxy import http
from mitmproxy.tools.dump import DumpMaster
from mitmproxy.options import Options
from mitmproxy import ctx


class NetworkCapture:
    """Addon for capturing network requests and responses."""
    
    def __init__(self, log_file: str):
        self.log_file = log_file
        self.requests: List[Dict[str, Any]] = []
    
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
        ctx.log.info(f"Saving {len(self.requests)} requests to {self.log_file}")
        
        output = {
            "metadata": {
                "captured_at": datetime.now().isoformat(),
                "total_requests": len(self.requests),
            },
            "requests": self.requests
        }
        
        try:
            with open(self.log_file, 'w') as f:
                json.dump(output, f, indent=2)
            ctx.log.info(f"Successfully saved to {self.log_file}")
        except Exception as e:
            ctx.log.error(f"Failed to save log file: {e}")


class ProxyManager:
    """Manages the embedded mitmproxy instance."""
    
    def __init__(self, port: int = 8080, log_file: str = "network-capture.json", verbose: bool = False):
        self.port = port
        self.log_file = log_file
        self.verbose = verbose
        self.master: Optional[DumpMaster] = None
        self.addon: Optional[NetworkCapture] = None
        self._task: Optional[asyncio.Task] = None
    
    async def start(self) -> None:
        """Start the proxy server."""
        # Configure mitmproxy options
        opts = Options(
            listen_port=self.port,
            http2=True,
        )
        
        # Create the master
        self.master = DumpMaster(opts)
        
        # Create and add our addon
        self.addon = NetworkCapture(self.log_file)
        self.master.addons.add(self.addon)
        
        # Start the proxy in a background task
        self._task = asyncio.create_task(self._run_proxy())
        
        # Give it a moment to start
        await asyncio.sleep(1)
    
    async def _run_proxy(self) -> None:
        """Run the proxy server."""
        try:
            await self.master.run()
        except Exception as e:
            if self.verbose:
                print(f"Proxy error: {e}")
    
    async def stop(self) -> None:
        """Stop the proxy server."""
        if self.master:
            self.master.shutdown()
        
        if self._task:
            try:
                await asyncio.wait_for(self._task, timeout=5.0)
            except asyncio.TimeoutError:
                self._task.cancel()
                try:
                    await self._task
                except asyncio.CancelledError:
                    pass
    
    def get_proxy_env(self) -> Dict[str, str]:
        """Get environment variables to configure child processes to use the proxy."""
        proxy_url = f"http://localhost:{self.port}"
        return {
            "HTTP_PROXY": proxy_url,
            "HTTPS_PROXY": proxy_url,
            "http_proxy": proxy_url,
            "https_proxy": proxy_url,
        }

