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
 * Displays an asciicinema terminal recording using the official asciinema-player.
 * This component loads the player dynamically from CDN to avoid build issues.
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
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load asciinema-player CSS and JS from CDN
    const loadAsciinemaPlayer = async () => {
      // Check if already loaded
      if (window.AsciinemaPlayer) {
        initializePlayer();
        return;
      }

      // Load CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.type = "text/css";
      cssLink.href = "https://cdn.jsdelivr.net/npm/asciinema-player@3.10.0/dist/bundle/asciinema-player.css";
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/asciinema-player@3.10.0/dist/bundle/asciinema-player.min.js";
      script.async = true;
      script.onload = () => {
        initializePlayer();
      };
      document.head.appendChild(script);
    };

    const initializePlayer = () => {
      if (!containerRef.current || !window.AsciinemaPlayer) return;

      // Clear any existing player
      if (playerRef.current) {
        containerRef.current.innerHTML = "";
      }

      // Create player
      try {
        playerRef.current = window.AsciinemaPlayer.create(src, containerRef.current, {
          autoPlay,
          loop,
          speed,
          idleTimeLimit,
          poster,
          terminalFontSize,
          theme,
          fit: "width",
          controls: true,
        });
      } catch (error) {
        console.error("Failed to initialize asciinema player:", error);
      }
    };

    loadAsciinemaPlayer();

    // Cleanup
    return () => {
      if (playerRef.current && containerRef.current) {
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
        className="rounded-lg overflow-hidden border border-gray-300 bg-black"
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

// Extend Window interface for TypeScript
declare global {
  interface Window {
    AsciinemaPlayer: any;
  }
}

