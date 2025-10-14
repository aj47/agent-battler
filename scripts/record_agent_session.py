#!/usr/bin/env python3
"""
Record an agent session and generate an asciicast v3 file.

Usage:
    python record_agent_session.py --command "augment fix-issue" --output session.cast
    python record_agent_session.py --command "cursor implement-feature" --title "Feature Implementation"
"""

import json
import subprocess
import sys
import time
import os
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Tuple, Optional


class AsciinemaRecorder:
    """Record terminal sessions in asciicast v3 format."""

    def __init__(
        self,
        output_file: str,
        title: str = "Agent Session",
        cols: int = 80,
        rows: int = 24,
        idle_time_limit: float = 2.0,
    ):
        self.output_file = output_file
        self.title = title
        self.cols = cols
        self.rows = rows
        self.idle_time_limit = idle_time_limit
        self.events: List[Tuple[float, str, str]] = []
        self.start_time = time.time()
        self.last_event_time = 0.0

    def add_event(self, event_type: str, data: str) -> None:
        """Add an event to the recording."""
        current_time = time.time() - self.start_time
        interval = current_time - self.last_event_time

        # Apply idle time limit
        if interval > self.idle_time_limit:
            interval = self.idle_time_limit

        self.events.append((interval, event_type, data))
        self.last_event_time = current_time

    def record_command(self, command: str, shell: str = "/bin/bash") -> int:
        """Record a command execution."""
        try:
            # Start the process with PTY
            import pty
            import fcntl
            import termios
            import struct

            # Get current terminal size
            try:
                size = os.popen("stty size", "r").read().split()
                self.rows = int(size[0])
                self.cols = int(size[1])
            except:
                pass

            # Fork and execute command
            pid, master_fd = pty.openpty()

            # Set terminal size
            fcntl.ioctl(master_fd, termios.TIOCSWINSZ, struct.pack("HHHH", self.rows, self.cols, 0, 0))

            # Fork process
            child_pid = os.fork()

            if child_pid == 0:
                # Child process
                os.setsid()
                slave_fd = os.open(os.ttyname(master_fd), os.O_RDWR)
                os.dup2(slave_fd, 0)
                os.dup2(slave_fd, 1)
                os.dup2(slave_fd, 2)
                os.close(master_fd)
                os.close(slave_fd)

                # Execute command
                os.execl(shell, shell, "-c", command)
            else:
                # Parent process - record output
                import select

                while True:
                    ready, _, _ = select.select([master_fd], [], [], 0.1)

                    if ready:
                        try:
                            data = os.read(master_fd, 1024)
                            if data:
                                self.add_event("o", data.decode("utf-8", errors="replace"))
                            else:
                                break
                        except OSError:
                            break

                # Wait for child process
                _, status = os.waitpid(child_pid, 0)
                exit_code = os.WEXITSTATUS(status) if os.WIFEXITED(status) else 1

                # Add exit event
                self.add_event("x", str(exit_code))

                return exit_code

        except ImportError:
            print("Error: PTY recording requires Unix-like system", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"Error recording command: {e}", file=sys.stderr)
            return 1

    def save(self) -> None:
        """Save the recording to a file."""
        header = {
            "version": 3,
            "term": {
                "cols": self.cols,
                "rows": self.rows,
                "type": "xterm-256color",
            },
            "timestamp": int(time.time()),
            "title": self.title,
            "idle_time_limit": self.idle_time_limit,
            "env": {
                "SHELL": os.environ.get("SHELL", "/bin/bash"),
            },
        }

        with open(self.output_file, "w") as f:
            # Write header
            f.write(json.dumps(header) + "\n")

            # Write events
            for interval, event_type, data in self.events:
                event = [interval, event_type, data]
                f.write(json.dumps(event) + "\n")

        file_size = os.path.getsize(self.output_file)
        duration = sum(e[0] for e in self.events)

        print(f"\n✓ Recording saved to {self.output_file}")
        print(f"  Duration: {duration:.1f}s")
        print(f"  File size: {file_size / 1024:.1f}KB")
        print(f"  Format: asciicast v3")


def main():
    parser = argparse.ArgumentParser(
        description="Record an agent session in asciicast v3 format"
    )
    parser.add_argument(
        "--command",
        "-c",
        required=True,
        help="Command to record (e.g., 'augment fix-issue')",
    )
    parser.add_argument(
        "--output",
        "-o",
        default="session.cast",
        help="Output file path (default: session.cast)",
    )
    parser.add_argument(
        "--title",
        "-t",
        default="Agent Session",
        help="Recording title",
    )
    parser.add_argument(
        "--cols",
        type=int,
        default=80,
        help="Terminal width in columns (default: 80)",
    )
    parser.add_argument(
        "--rows",
        type=int,
        default=24,
        help="Terminal height in rows (default: 24)",
    )
    parser.add_argument(
        "--idle-limit",
        "-i",
        type=float,
        default=2.0,
        help="Idle time limit in seconds (default: 2.0)",
    )

    args = parser.parse_args()

    # Create recorder
    recorder = AsciinemaRecorder(
        output_file=args.output,
        title=args.title,
        cols=args.cols,
        rows=args.rows,
        idle_time_limit=args.idle_limit,
    )

    print(f"Recording: {args.command}")
    print(f"Output: {args.output}")
    print(f"Title: {args.title}")
    print("Press Ctrl+C to stop recording\n")

    try:
        # Record the command
        exit_code = recorder.record_command(args.command)

        # Save the recording
        recorder.save()

        return exit_code
    except KeyboardInterrupt:
        print("\n\nRecording stopped by user")
        recorder.save()
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

