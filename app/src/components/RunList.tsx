"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDuration, statusEmoji } from "@lib/utils";
import type { WorkflowRunSummary, WSEvent } from "@lib/types";
import { useLiveEvents } from "@/hooks/useLiveEvents";

interface RunListProps {
  org: string;
}

export function RunList({ org }: RunListProps) {
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    async function fetchRuns() {
      try {
        const res = await fetch(`/api/runs?org=${org}`);
        if (!res.ok) throw new Error("Failed to fetch runs");
        const data = await res.json();
        setRuns(data.runs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRuns();
  }, [org]);

  // Handle live events
  const handleEvent = useCallback((event: WSEvent) => {
    if (!event.type.startsWith("run:")) return;

    const runData = event.data as WorkflowRunSummary;
    
    setRuns((prevRuns) => {
      const existingIndex = prevRuns.findIndex((r) => r.id === runData.id);
      
      if (existingIndex >= 0) {
        // Update existing run
        const updated = [...prevRuns];
        updated[existingIndex] = runData;
        return updated;
      } else {
        // Add new run at the top
        return [runData, ...prevRuns];
      }
    });
  }, []);

  const { connected } = useLiveEvents({ org, onEvent: handleEvent });

  if (loading && runs.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gh-border rounded-lg opacity-20" />
        ))}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-12 text-gh-text-secondary border border-dashed border-gh-border rounded-lg">
        No workflow runs found for <strong>{org}</strong>.
        {connected && (
          <div className="mt-2 text-xs text-gh-success">
            ✓ Live updates connected
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => (
        <div
          key={run.id}
          className="flex items-center justify-between p-4 bg-gh-dark border border-gh-border rounded-lg hover:border-gh-text-secondary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="text-xl" title={run.status}>
              {statusEmoji(run.status, run.conclusion)}
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">
                <a
                  href={run.htmlUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gh-info hover:underline"
                >
                  {run.workflow} #{run.runNumber}
                </a>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gh-border text-gh-text-secondary">
                  {run.headBranch}
                </span>
              </div>
              <div className="text-sm text-gh-text-secondary">
                {run.repo} • {run.jobCount} jobs
              </div>
            </div>
          </div>

          <div className="text-right text-sm text-gh-text-secondary">
            <div>{run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}</div>
            <div className="font-mono text-xs mt-1">
              {formatDuration(run.durationSeconds)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
