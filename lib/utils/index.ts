/**
 * Calculate duration in seconds between two dates.
 */
export function durationSeconds(
  start: Date | string | null,
  end: Date | string | null
): number | null {
  if (!start || !end) return null;
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  return Math.round((e.getTime() - s.getTime()) / 1000);
}

/**
 * Format duration as human-readable string.
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

/**
 * Get a status emoji for display.
 */
export function statusEmoji(status: string, conclusion?: string | null): string {
  if (status === "queued") return "⏳";
  if (status === "in_progress") return "🔄";
  if (status === "completed") {
    switch (conclusion) {
      case "success": return "✅";
      case "failure": return "❌";
      case "cancelled": return "⚪";
      case "skipped": return "⏭️";
      case "timed_out": return "⏰";
      default: return "🔵";
    }
  }
  return "❓";
}

/**
 * Serialize BigInt values to strings for JSON responses.
 */
export function serializeBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}
