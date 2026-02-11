import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { serializeBigInt } from "@lib/utils";

/**
 * GET /api/snapshots
 *
 * Query pre-computed time-range snapshots.
 *
 * Query params:
 *   org   - Filter by organization (required)
 *   from  - Start of time range (ISO timestamp)
 *   to    - End of time range (ISO timestamp)
 *   limit - Max results (default 100, max 1000)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const org = searchParams.get("org");
  if (!org) {
    return NextResponse.json(
      { error: "org parameter is required" },
      { status: 400 }
    );
  }

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 1000);

  const where: Record<string, unknown> = { org };
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, unknown>).gte = new Date(from);
    if (to) (where.timestamp as Record<string, unknown>).lte = new Date(to);
  }

  const snapshots = await prisma.snapshot.findMany({
    where,
    orderBy: { timestamp: "asc" },
    take: limit,
  });

  return NextResponse.json(serializeBigInt({
    snapshots,
    count: snapshots.length,
  }));
}
