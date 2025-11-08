"""
Agent Battler - CLI wrapper for capturing network requests from AI coding agents
"""

__version__ = "0.1.0"

from .cli import main
from .proxy_manager import ProxyManager, NetworkCapture

__all__ = ['main', 'ProxyManager', 'NetworkCapture']

