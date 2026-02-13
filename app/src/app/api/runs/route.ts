import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { serializeBigInt, durationSeconds } from "@lib/utils";
import type { WorkflowRunSummary, PaginatedRunsResponse } from "@lib/types";
import { Prisma } from "@prisma/client";

/**
 * GET /api/runs
 *
 * Query workflow runs with filters, search, sorting, and pagination.
 *
 * Query params:
 *   org        - Filter by organization
 *   repo       - Filter by repository (partial match)
 *   status     - Filter by status (queued, in_progress, completed)
 *   conclusion - Filter by conclusion (success, failure, cancelled, skipped)
 *   actor      - Filter by actor (GitHub username, partial match)
 *   branch     - Filter by branch (partial match)
 *   search     - Full-text search on workflow name
 *   sort       - Sort field: created_at (default), duration, status
 *   order      - Sort order: asc | desc (default: desc)
 *   limit      - Max results (default 25, max 200)
 *   offset     - Pagination offset (default 0)
 *   before     - Cursor: runs before this ISO timestamp (legacy)
 *   after      - Cursor: runs after this ISO timestamp (legacy)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const org = searchParams.get("org");
  const repo = searchParams.get("repo");
  const status = searchParams.get("status");
  const conclusion = searchParams.get("conclusion");
  const actor = searchParams.get("actor");
  const branch = searchParams.get("branch");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "25", 10), 1),
    200
  );
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  // Legacy cursor params
  const before = searchParams.get("before");
  const after = searchParams.get("after");

  // Build WHERE clause
  const where: Prisma.WorkflowRunWhereInput = {};

  if (org) where.org = org;

  if (repo) {
    where.repo = { contains: repo, mode: "insensitive" };
  }

  if (status) {
    where.status = status;
  }

  if (conclusion) {
    where.conclusion = conclusion;
  }

  if (actor) {
    where.actor = { contains: actor, mode: "insensitive" };
  }

  if (branch) {
    where.headBranch = { contains: branch, mode: "insensitive" };
  }

  if (search) {
    where.workflow = { contains: search, mode: "insensitive" };
  }

  // Legacy cursor support
  if (before || after) {
    where.startedAt = {};
    if (before)
      (where.startedAt as Prisma.DateTimeNullableFilter).lt = new Date(before);
    if (after)
      (where.startedAt as Prisma.DateTimeNullableFilter).gt = new Date(after);
  }

  // Build ORDER BY
  let orderBy: Prisma.WorkflowRunOrderByWithRelationInput;
  switch (sort) {
    case "duration":
      // Duration = completedAt - startedAt; sort by completedAt as proxy
      orderBy = { completedAt: order === "asc" ? "asc" : "desc" };
      break;
    case "status":
      orderBy = { status: order === "asc" ? "asc" : "desc" };
      break;
    case "created_at":
    default:
      orderBy = { startedAt: order === "asc" ? "asc" : "desc" };
      break;
  }

  // Execute count and data queries in parallel
  const [total, runs] = await Promise.all([
    prisma.workflowRun.count({ where }),
    prisma.workflowRun.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        _count: { select: { jobs: true } },
      },
    }),
  ]);

  const summaries: WorkflowRunSummary[] = runs.map((run) => ({
    id: run.id.toString(),
    org: run.org,
    repo: run.repo,
    workflow: run.workflow,
    headBranch: run.headBranch,
    actor: run.actor,
    status: run.status as WorkflowRunSummary["status"],
    conclusion: run.conclusion as WorkflowRunSummary["conclusion"],
    runNumber: run.runNumber,
    startedAt: run.startedAt?.toISOString() || null,
    completedAt: run.completedAt?.toISOString() || null,
    durationSeconds: durationSeconds(run.startedAt, run.completedAt),
    htmlUrl: run.htmlUrl,
    jobCount: run._count.jobs,
  }));

  const response: PaginatedRunsResponse = {
    runs: summaries,
    total,
    offset,
    limit,
  };

  return NextResponse.json(serializeBigInt(response));
}
