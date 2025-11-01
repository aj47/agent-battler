"use client";

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";

interface AsciinemaPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  idleTimeLimit?: number;
  poster?: string;
  terminalFontSize?: string;
  theme?: string;
}

/**
 * AsciinemaPlayer component
 *
 * Displays an asciicinema terminal recording using the official asciinema embed method.
 * This component uses the iframe embed approach to avoid CORS issues.
 */
export function AsciinemaPlayer({
  src,
  title,
  autoPlay = false,
  loop = false,
  speed = 1,
  idleTimeLimit,
  poster,
  terminalFontSize = "small",
  theme = "asciinema",
}: AsciinemaPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Extract the asciinema ID from the URL
    let asciinemaId = "";

    // Handle different URL formats:
    // https://asciinema.org/a/ID
    // https://asciinema.org/a/ID.cast
    const match = src.match(/asciinema\.org\/a\/([^/.]+)/);
    if (match) {
      asciinemaId = match[1];
    } else {
      console.error("Invalid asciinema URL format:", src);
      return;
    }

    // Create the script element for iframe embedding
    const script = document.createElement("script");
    script.src = `https://asciinema.org/a/${asciinemaId}.js`;
    script.id = `asciicast-${asciinemaId}`;
    script.async = true;

    // Add optional parameters as data attributes
    if (autoPlay) script.setAttribute("data-autoplay", "true");
    if (loop) script.setAttribute("data-loop", "true");
    if (speed !== 1) script.setAttribute("data-speed", speed.toString());
    if (idleTimeLimit) script.setAttribute("data-idle-time-limit", idleTimeLimit.toString());
    if (poster) script.setAttribute("data-poster", poster);
    if (terminalFontSize) script.setAttribute("data-size", terminalFontSize);
    if (theme) script.setAttribute("data-theme", theme);

    // Clear container and append script
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [src, autoPlay, loop, speed, idleTimeLimit, poster, terminalFontSize, theme]);

  return (
    <div className="asciinema-player-wrapper">
      {title && (
        <div className="mb-2 flex items-center space-x-2">
          <Play className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden border border-gray-300"
        style={{ minHeight: "400px" }}
      />
      <div className="mt-2 text-xs text-gray-500">
        <p>
          💡 Tip: You can pause, copy text, and adjust playback speed using the player controls.
        </p>
      </div>
    </div>
  );
}

