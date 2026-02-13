"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDuration, statusEmoji } from "@lib/utils";
import type { WorkflowRunSummary, PaginatedRunsResponse, WSEvent } from "@lib/types";
import { useLiveEvents } from "@/hooks/useLiveEvents";

interface RunListProps {
  org: string;
  queryString: string;
  onTotalChange?: (total: number) => void;
}

export function RunList({ org, queryString, onTotalChange }: RunListProps) {
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ offset: 0, limit: 25 });

  // Fetch runs when filters change
  useEffect(() => {
    let cancelled = false;

    async function fetchRuns() {
      setLoading(true);
      try {
        const res = await fetch(`/api/runs?${queryString}`);
        if (!res.ok) throw new Error("Failed to fetch runs");
        const data: PaginatedRunsResponse = await res.json();
        if (!cancelled) {
          setRuns(data.runs);
          setTotal(data.total);
          setPagination({ offset: data.offset, limit: data.limit });
          onTotalChange?.(data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRuns();
    return () => {
      cancelled = true;
    };
  }, [queryString, onTotalChange]);

  // Handle live events (only update if no active filters that would conflict)
  const handleEvent = useCallback(
    (event: WSEvent) => {
      if (!event.type.startsWith("run:")) return;

      const runData = event.data as WorkflowRunSummary;

      setRuns((prevRuns) => {
        const existingIndex = prevRuns.findIndex((r) => r.id === runData.id);

        if (existingIndex >= 0) {
          // Update existing run in place
          const updated = [...prevRuns];
          updated[existingIndex] = runData;
          return updated;
        } else {
          // Add new run at the top (only if on first page)
          if (pagination.offset === 0) {
            return [runData, ...prevRuns.slice(0, pagination.limit - 1)];
          }
          return prevRuns;
        }
      });
    },
    [pagination.offset, pagination.limit]
  );

  const { connected } = useLiveEvents({ org, onEvent: handleEvent });

  // Pagination info
  const showingStart = total > 0 ? pagination.offset + 1 : 0;
  const showingEnd = Math.min(pagination.offset + runs.length, total);

  if (loading && runs.length === 0) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gh-border rounded-lg opacity-20" />
        ))}
      </div>
    );
  }

  if (!loading && runs.length === 0) {
    return (
      <div className="text-center py-12 text-gh-text-secondary border border-dashed border-gh-border rounded-lg">
        <div className="text-3xl mb-3">🔍</div>
        No workflow runs found.
        {connected && (
          <div className="mt-2 text-xs text-gh-success">
            ✓ Live updates connected — new runs will appear automatically
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Result count header */}
      <div className="flex items-center justify-between text-xs text-gh-text-secondary px-1">
        <span>
          Showing {showingStart}–{showingEnd} of {total.toLocaleString()} runs
        </span>
        {loading && (
          <span className="flex items-center gap-1">
            <span className="animate-spin">⟳</span> Loading...
          </span>
        )}
      </div>

      {/* Run rows */}
      {runs.map((run) => (
        <div
          key={run.id}
          className="flex items-center justify-between p-4 bg-gh-dark border border-gh-border rounded-lg hover:border-gh-text-secondary transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="text-xl flex-shrink-0" title={run.status}>
              {statusEmoji(run.status, run.conclusion)}
            </div>
            <div className="min-w-0">
              <div className="font-medium flex items-center gap-2 flex-wrap">
                <a
                  href={run.htmlUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gh-info hover:underline truncate"
                >
                  {run.workflow} #{run.runNumber}
                </a>
                {run.headBranch && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gh-border text-gh-text-secondary flex-shrink-0">
                    {run.headBranch}
                  </span>
                )}
              </div>
              <div className="text-sm text-gh-text-secondary flex items-center gap-2 flex-wrap">
                <span>{run.repo}</span>
                <span>•</span>
                <span>{run.jobCount} jobs</span>
                {run.actor && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <img
                        src={`https://github.com/${run.actor}.png?size=16`}
                        alt=""
                        className="w-3.5 h-3.5 rounded-full"
                      />
                      {run.actor}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right text-sm text-gh-text-secondary flex-shrink-0 ml-4">
            <div>
              {run.startedAt
                ? new Date(run.startedAt).toLocaleString()
                : "—"}
            </div>
            <div className="font-mono text-xs mt-1">
              {formatDuration(run.durationSeconds)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
