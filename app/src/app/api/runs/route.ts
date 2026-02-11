import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { serializeBigInt, durationSeconds } from "@lib/utils";
import type { WorkflowRunSummary } from "@lib/types";

/**
 * GET /api/runs
 *
 * Query workflow runs with optional filters.
 *
 * Query params:
 *   org     - Filter by organization
 *   repo    - Filter by repository
 *   status  - Filter by status (queued, in_progress, completed)
 *   limit   - Max results (default 50, max 200)
 *   before  - Cursor: runs before this ISO timestamp
 *   after   - Cursor: runs after this ISO timestamp
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const org = searchParams.get("org");
  const repo = searchParams.get("repo");
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const before = searchParams.get("before");
  const after = searchParams.get("after");

  const where: Record<string, unknown> = {};
  if (org) where.org = org;
  if (repo) where.repo = repo;
  if (status) where.status = status;
  if (before || after) {
    where.startedAt = {};
    if (before) (where.startedAt as Record<string, unknown>).lt = new Date(before);
    if (after) (where.startedAt as Record<string, unknown>).gt = new Date(after);
  }

  const runs = await prisma.workflowRun.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: limit,
    include: {
      _count: { select: { jobs: true } },
    },
  });

  const summaries: WorkflowRunSummary[] = runs.map((run) => ({
    id: run.id.toString(),
    org: run.org,
    repo: run.repo,
    workflow: run.workflow,
    headBranch: run.headBranch,
    status: run.status as WorkflowRunSummary["status"],
    conclusion: run.conclusion as WorkflowRunSummary["conclusion"],
    runNumber: run.runNumber,
    startedAt: run.startedAt?.toISOString() || null,
    completedAt: run.completedAt?.toISOString() || null,
    durationSeconds: durationSeconds(run.startedAt, run.completedAt),
    htmlUrl: run.htmlUrl,
    jobCount: run._count.jobs,
  }));

  return NextResponse.json(serializeBigInt({
    runs: summaries,
    count: summaries.length,
  }));
}
