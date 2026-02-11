import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@lib/github/webhooks";
import { webhookQueue, type WebhookJobData } from "@lib/queue";

/**
 * POST /api/webhooks/github
 *
 * Receives GitHub webhook events, verifies the signature,
 * and enqueues them for async processing.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Read headers
  const signature = request.headers.get("x-hub-signature-256") || "";
  const eventType = request.headers.get("x-github-event") || "unknown";
  const deliveryId = request.headers.get("x-github-delivery") || crypto.randomUUID();

  // Read body
  const body = await request.text();

  // Verify signature
  try {
    const isValid = await verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.warn(`[Webhook] Invalid signature for delivery ${deliveryId}`);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("[Webhook] Signature verification error:", err);
    return NextResponse.json(
      { error: "Signature verification failed" },
      { status: 401 }
    );
  }

  // Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const action = (payload.action as string) || "unknown";

  // Filter to events we care about
  const supportedEvents = ["workflow_run", "workflow_job"];
  if (!supportedEvents.includes(eventType)) {
    return NextResponse.json({
      message: `Event type '${eventType}' not processed`,
      deliveryId,
    });
  }

  // Enqueue for processing
  const jobData: WebhookJobData = {
    deliveryId,
    eventType,
    action,
    payload,
    receivedAt: new Date().toISOString(),
  };

  await webhookQueue.add(`${eventType}.${action}`, jobData, {
    jobId: deliveryId, // Deduplicate by delivery ID
  });

  const elapsed = Date.now() - startTime;
  console.log(
    `[Webhook] Enqueued ${eventType}.${action} (${deliveryId}) in ${elapsed}ms`
  );

  return NextResponse.json({
    message: "Event enqueued",
    deliveryId,
    eventType,
    action,
    processingTimeMs: elapsed,
  });
}

/**
 * GET /api/webhooks/github
 * Health check endpoint.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "ActionStream webhook endpoint. POST GitHub webhook events here.",
  });
}
