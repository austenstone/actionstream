import { useEffect, useState, useCallback } from "react";
import type { WSEvent } from "@lib/types";

interface UseLiveEventsOptions {
  org?: string;
  enabled?: boolean;
  onEvent?: (event: WSEvent) => void;
}

/**
 * React hook to subscribe to real-time workflow events via SSE.
 */
export function useLiveEvents({ org, enabled = true, onEvent }: UseLiveEventsOptions = {}) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const url = org ? `/api/live?org=${org}` : "/api/live";
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log("[SSE] Connected");
      setConnected(true);
    };

    eventSource.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as WSEvent;
        
        // Skip connection acknowledgment
        if ((event as any).type === "connected") return;

        setLastEvent(event);
        onEvent?.(event);
      } catch (err) {
        console.error("[SSE] Failed to parse event:", err);
      }
    };

    eventSource.onerror = () => {
      console.error("[SSE] Connection error");
      setConnected(false);
    };

    return () => {
      console.log("[SSE] Disconnecting");
      eventSource.close();
      setConnected(false);
    };
  }, [org, enabled, onEvent]);

  return { connected, lastEvent };
}
