import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";

/**
 * GET /api/runs/filters
 *
 * Returns distinct values for filter dropdowns.
 * Optionally scoped by org.
 *
 * Response: { repos: string[], actors: string[], branches: string[] }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const org = searchParams.get("org");

  const where = org ? { org } : {};

  const [repos, actors, branches] = await Promise.all([
    prisma.workflowRun.findMany({
      where,
      select: { repo: true },
      distinct: ["repo"],
      orderBy: { repo: "asc" },
    }),
    prisma.workflowRun.findMany({
      where: { ...where, actor: { not: null } },
      select: { actor: true },
      distinct: ["actor"],
      orderBy: { actor: "asc" },
    }),
    prisma.workflowRun.findMany({
      where: { ...where, headBranch: { not: null } },
      select: { headBranch: true },
      distinct: ["headBranch"],
      orderBy: { headBranch: "asc" },
    }),
  ]);

  return NextResponse.json({
    repos: repos.map((r) => r.repo),
    actors: actors.map((a) => a.actor).filter(Boolean),
    branches: branches.map((b) => b.headBranch).filter(Boolean),
  });
}
