/**
 * Shared types for ActionStream.
 */

// --- Run & Job status types ---

export type RunStatus = "queued" | "in_progress" | "completed" | "waiting";
export type RunConclusion =
  | "success"
  | "failure"
  | "cancelled"
  | "skipped"
  | "timed_out"
  | "action_required"
  | "neutral"
  | "stale"
  | null;

export type JobStatus = "queued" | "in_progress" | "completed" | "waiting";
export type JobConclusion = "success" | "failure" | "cancelled" | "skipped" | null;

// --- API response types ---

export interface WorkflowRunSummary {
  id: string;
  org: string;
  repo: string;
  workflow: string;
  headBranch: string | null;
  status: RunStatus;
  conclusion: RunConclusion;
  runNumber: number;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  htmlUrl: string | null;
  jobCount: number;
}

export interface WorkflowJobSummary {
  id: string;
  name: string;
  status: JobStatus;
  conclusion: JobConclusion;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  runnerName: string | null;
  labels: string[];
}

export interface TimelineSnapshot {
  timestamp: string;
  org: string;
  runs: {
    queued: number;
    inProgress: number;
    completed: number;
  };
  successRate: number;
  avgDurationSeconds: number;
}

export interface DashboardState {
  currentTime: string;
  isLive: boolean;
  org: string | null;
  runs: WorkflowRunSummary[];
  snapshots: TimelineSnapshot[];
}

// --- WebSocket event types ---

export type WSEventType =
  | "run:queued"
  | "run:in_progress"
  | "run:completed"
  | "job:queued"
  | "job:in_progress"
  | "job:completed"
  | "snapshot:new";

export interface WSEvent {
  type: WSEventType;
  timestamp: string;
  data: WorkflowRunSummary | WorkflowJobSummary | TimelineSnapshot;
}
