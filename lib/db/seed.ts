import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed the database with sample data for development.
 */
async function main() {
  console.log("🌱 Seeding database...");

  // Create a sample webhook event
  await prisma.webhookEvent.create({
    data: {
      eventType: "workflow_run",
      action: "completed",
      deliveryId: "seed-001",
      payload: {
        action: "completed",
        workflow_run: {
          id: 12345678,
          name: "CI",
          status: "completed",
          conclusion: "success",
        },
      },
    },
  });

  // Create a sample workflow run
  await prisma.workflowRun.create({
    data: {
      id: 12345678n,
      org: "austenstone",
      repo: "actionstream",
      workflow: "CI",
      workflowId: 1001,
      headBranch: "main",
      headSha: "abc123def456",
      event: "push",
      status: "completed",
      conclusion: "success",
      runNumber: 42,
      runAttempt: 1,
      htmlUrl: "https://github.com/austenstone/actionstream/actions/runs/12345678",
      startedAt: new Date("2026-02-11T10:00:00Z"),
      completedAt: new Date("2026-02-11T10:03:30Z"),
      rawPayload: {},
      jobs: {
        create: [
          {
            id: 98765432n,
            name: "build",
            status: "completed",
            conclusion: "success",
            startedAt: new Date("2026-02-11T10:00:05Z"),
            completedAt: new Date("2026-02-11T10:02:00Z"),
            labels: ["ubuntu-latest"],
            steps: [
              { name: "Checkout", status: "completed", conclusion: "success" },
              { name: "Setup Node", status: "completed", conclusion: "success" },
              { name: "Install", status: "completed", conclusion: "success" },
              { name: "Build", status: "completed", conclusion: "success" },
            ],
          },
          {
            id: 98765433n,
            name: "test",
            status: "completed",
            conclusion: "success",
            startedAt: new Date("2026-02-11T10:02:05Z"),
            completedAt: new Date("2026-02-11T10:03:25Z"),
            labels: ["ubuntu-latest"],
            steps: [
              { name: "Checkout", status: "completed", conclusion: "success" },
              { name: "Run tests", status: "completed", conclusion: "success" },
            ],
          },
        ],
      },
    },
  });

  // Create a sample snapshot
  await prisma.snapshot.create({
    data: {
      org: "austenstone",
      timestamp: new Date("2026-02-11T10:05:00Z"),
      data: {
        runs: { queued: 0, in_progress: 1, completed: 42 },
        successRate: 0.95,
        avgDurationSeconds: 210,
        topWorkflows: [
          { name: "CI", runs: 30, successRate: 0.97 },
          { name: "Deploy", runs: 12, successRate: 0.92 },
        ],
      },
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
