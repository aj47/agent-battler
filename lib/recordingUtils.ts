/**
 * Utility functions for handling asciicinema recordings
 */

/**
 * Validate if a file is a valid .cast file
 * Checks if it's valid newline-delimited JSON with proper asciicast format
 */
export async function validateCastFile(file: File): Promise<{
  valid: boolean;
  error?: string;
  metadata?: {
    version: number;
    duration: number;
    cols: number;
    rows: number;
  };
}> {
  // Check file extension
  if (!file.name.endsWith(".cast")) {
    return {
      valid: false,
      error: "File must have .cast extension",
    };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }

  try {
    const text = await file.text();
    const lines = text.trim().split("\n");

    if (lines.length < 1) {
      return {
        valid: false,
        error: "File is empty",
      };
    }

    // Parse header (first line)
    const header = JSON.parse(lines[0]);

    // Validate header structure
    if (!header.version || !header.term) {
      return {
        valid: false,
        error: "Invalid asciicast header format",
      };
    }

    if (header.version !== 3 && header.version !== 2) {
      return {
        valid: false,
        error: `Unsupported asciicast version: ${header.version}. Supported: v2, v3`,
      };
    }

    // Calculate duration from events
    let duration = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("#")) continue;

      try {
        const event = JSON.parse(line);
        if (Array.isArray(event) && event.length >= 1) {
          duration += event[0]; // Accumulate intervals
        }
      } catch {
        // Skip invalid event lines
      }
    }

    return {
      valid: true,
      metadata: {
        version: header.version,
        duration: Math.round(duration),
        cols: header.term.cols || 80,
        rows: header.term.rows || 24,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format duration in seconds to readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Generate asciicast embed code for asciinema.org
 */
export function generateAsciinemaEmbed(recordingId: string): string {
  return `<script async id="asciicast-${recordingId}" src="https://asciinema.org/a/${recordingId}.js"></script>`;
}

/**
 * Generate markdown for embedding a recording
 */
export function generateRecordingMarkdown(
  recordingUrl: string,
  metadata?: { duration: number; fileSize: number }
): string {
  let markdown = `## Agent Session Recording\n\n`;

  if (recordingUrl.includes("asciinema.org")) {
    // Extract ID from asciinema.org URL
    const match = recordingUrl.match(/asciinema\.org\/a\/([a-zA-Z0-9]+)/);
    if (match) {
      const recordingId = match[1];
      markdown += `<script async id="asciicast-${recordingId}" src="https://asciinema.org/a/${recordingId}.js"></script>\n\n`;
    }
  } else {
    // Generic link for other hosting
    markdown += `[View Recording](${recordingUrl})\n\n`;
  }

  if (metadata) {
    markdown += `**Recording Details:**\n`;
    markdown += `- Duration: ${formatDuration(metadata.duration)}\n`;
    markdown += `- File Size: ${formatFileSize(metadata.fileSize)}\n`;
  }

  return markdown;
}

/**
 * Create a minimal asciicast v3 file for testing
 */
export function createMinimalCastFile(
  title: string = "Agent Session"
): string {
  const header = {
    version: 3,
    term: {
      cols: 80,
      rows: 24,
      type: "xterm-256color",
    },
    timestamp: Math.floor(Date.now() / 1000),
    title,
    env: {
      SHELL: "/bin/bash",
    },
  };

  const events = [
    [0.1, "o", "Agent session started...\n"],
    [0.5, "o", "Processing task...\n"],
    [1.0, "o", "Task completed successfully!\n"],
    [0.1, "x", "0"],
  ];

  let content = JSON.stringify(header) + "\n";
  for (const event of events) {
    content += JSON.stringify(event) + "\n";
  }

  return content;
}

/**
 * Check if a URL is a valid asciinema.org recording
 */
export function isAsciinemaUrl(url: string): boolean {
  return /^https:\/\/asciinema\.org\/a\/[a-zA-Z0-9]+\/?$/.test(url);
}

/**
 * Extract recording ID from asciinema.org URL
 */
export function extractAsciinemaId(url: string): string | null {
  const match = url.match(/asciinema\.org\/a\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

