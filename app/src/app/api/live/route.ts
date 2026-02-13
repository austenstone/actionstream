import { NextRequest } from "next/server";
import { createRedisConnection } from "@lib/queue/redis";

/**
 * GET /api/live
 *
 * Server-Sent Events (SSE) stream for real-time workflow updates.
 * Listens to Redis Pub/Sub for workflow_run and workflow_job events.
 *
 * Query params:
 *   org - Filter events to a specific organization
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const org = searchParams.get("org");

  // Set up SSE response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Redis subscriber for pub/sub
      const subscriber = createRedisConnection();
      
      // Subscribe to workflow events
      await subscriber.subscribe(
        "workflow:run:*",
        "workflow:job:*",
        (err, count) => {
          if (err) {
            console.error("[SSE] Redis subscribe error:", err);
            return;
          }
          console.log(`[SSE] Subscribed to ${count} channels`);
        }
      );

      // Send initial connection event
      const data = encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`);
      controller.enqueue(data);

      // Handle incoming messages
      subscriber.on("message", (channel: string, message: string) => {
        try {
          const event = JSON.parse(message);
          
          // Filter by org if specified
          if (org && event.org !== org) return;

          // Send to client
          const payload = encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
          controller.enqueue(payload);
        } catch (err) {
          console.error("[SSE] Failed to parse message:", err);
        }
      });

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          const ping = encoder.encode(`: ping\n\n`);
          controller.enqueue(ping);
        } catch (err) {
          console.error("[SSE] Keep-alive failed:", err);
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener("abort", () => {
        console.log("[SSE] Client disconnected");
        clearInterval(keepAlive);
        subscriber.unsubscribe();
        subscriber.disconnect();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
