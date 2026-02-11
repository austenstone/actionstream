import { Queue } from "bullmq";
import { createRedisConnection } from "./redis";

export const WEBHOOK_QUEUE_NAME = "webhook-events";

/**
 * Queue for incoming GitHub webhook events.
 * Events are enqueued by the webhook handler and processed by the worker.
 */
export const webhookQueue = new Queue(WEBHOOK_QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      count: 1000,  // Keep last 1000 completed jobs
      age: 3600,    // Or 1 hour
    },
    removeOnFail: {
      count: 5000,  // Keep last 5000 failed jobs for debugging
    },
  },
});

export interface WebhookJobData {
  deliveryId: string;
  eventType: string;  // e.g. "workflow_run"
  action: string;     // e.g. "completed"
  payload: Record<string, unknown>;
  receivedAt: string; // ISO timestamp
}

export { webhookQueue as default };
