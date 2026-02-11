import { Worker, Job } from "bullmq";
import { createRedisConnection } from "./redis";
import { WEBHOOK_QUEUE_NAME, type WebhookJobData } from "./queue";
import { prisma } from "../db";

/**
 * Process incoming webhook events:
 * 1. Store the raw event
 * 2. Upsert workflow run / job records
 */
async function processWebhookEvent(job: Job<WebhookJobData>) {
  const { deliveryId, eventType, action, payload, receivedAt } = job.data;

  console.log(`[Worker] Processing ${eventType}.${action} (${deliveryId})`);

  // 1. Store raw webhook event
  await prisma.webhookEvent.upsert({
    where: { deliveryId },
    create: {
      eventType,
      action,
      deliveryId,
      receivedAt: new Date(receivedAt),
      payload,
    },
    update: {}, // Idempotent — skip if already stored
  });

  // 2. Process based on event type
  switch (eventType) {
    case "workflow_run":
      await processWorkflowRun(payload);
      break;
    case "workflow_job":
      await processWorkflowJob(payload);
      break;
    default:
      console.log(`[Worker] Unhandled event type: ${eventType}`);
  }
}

async function processWorkflowRun(payload: Record<string, unknown>) {
  const run = payload.workflow_run as Record<string, unknown>;
  if (!run) return;

  const repoFullName = (run.repository as Record<string, unknown>)?.full_name as string || "";
  const [org, repo] = repoFullName.includes("/")
    ? repoFullName.split("/")
    : ["unknown", "unknown"];

  await prisma.workflowRun.upsert({
    where: { id: BigInt(run.id as number) },
    create: {
      id: BigInt(run.id as number),
      org,
      repo,
      workflow: (run.name as string) || "Unknown",
      workflowId: (run.workflow_id as number) || 0,
      headBranch: run.head_branch as string | null,
      headSha: run.head_sha as string | null,
      event: run.event as string | null,
      status: run.status as string,
      conclusion: run.conclusion as string | null,
      runNumber: (run.run_number as number) || 0,
      runAttempt: (run.run_attempt as number) || 1,
      htmlUrl: run.html_url as string | null,
      startedAt: run.run_started_at ? new Date(run.run_started_at as string) : null,
      completedAt: run.updated_at ? new Date(run.updated_at as string) : null,
      rawPayload: payload,
    },
    update: {
      status: run.status as string,
      conclusion: run.conclusion as string | null,
      completedAt: run.updated_at ? new Date(run.updated_at as string) : null,
      rawPayload: payload,
    },
  });

  console.log(`[Worker] Upserted workflow run ${run.id} (${run.status})`);
}

async function processWorkflowJob(payload: Record<string, unknown>) {
  const job = payload.workflow_job as Record<string, unknown>;
  if (!job) return;

  await prisma.workflowJob.upsert({
    where: { id: BigInt(job.id as number) },
    create: {
      id: BigInt(job.id as number),
      runId: BigInt(job.run_id as number),
      name: (job.name as string) || "Unknown",
      status: job.status as string,
      conclusion: job.conclusion as string | null,
      startedAt: job.started_at ? new Date(job.started_at as string) : null,
      completedAt: job.completed_at ? new Date(job.completed_at as string) : null,
      runnerId: job.runner_id as number | null,
      runnerName: job.runner_name as string | null,
      labels: (job.labels as string[]) || [],
      steps: job.steps || null,
      htmlUrl: job.html_url as string | null,
    },
    update: {
      status: job.status as string,
      conclusion: job.conclusion as string | null,
      completedAt: job.completed_at ? new Date(job.completed_at as string) : null,
      runnerId: job.runner_id as number | null,
      runnerName: job.runner_name as string | null,
      steps: job.steps || null,
    },
  });

  console.log(`[Worker] Upserted workflow job ${job.id} (${job.status})`);
}

// --- Start worker ---
const worker = new Worker<WebhookJobData>(
  WEBHOOK_QUEUE_NAME,
  processWebhookEvent,
  {
    connection: createRedisConnection(),
    concurrency: 10,
    limiter: {
      max: 100,
      duration: 1000,
    },
  }
);

worker.on("ready", () => {
  console.log("🚀 Webhook worker ready");
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

export default worker;
