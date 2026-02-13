"use client";

import { useLiveEvents } from "@/hooks/useLiveEvents";

interface LiveIndicatorProps {
  org: string;
}

/**
 * Shows live connection status with pulsing indicator.
 */
export function LiveIndicator({ org }: LiveIndicatorProps) {
  const { connected } = useLiveEvents({ org });

  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-2 text-sm">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            connected
              ? "bg-gh-success animate-pulse-slow"
              : "bg-gh-text-secondary"
          }`}
        />
        {connected ? "Live" : "Connecting..."}
      </span>
    </div>
  );
}
