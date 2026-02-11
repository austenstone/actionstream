"use client";

interface StatsBarProps {
  org: string;
}

export function StatsBar({ org }: StatsBarProps) {
  // Mock data for now — real implementation would fetch from /api/snapshots
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-gh-dark border border-gh-border rounded-lg">
        <div className="text-sm text-gh-text-secondary mb-1">Active Runs</div>
        <div className="text-2xl font-bold">3</div>
      </div>
      <div className="p-4 bg-gh-dark border border-gh-border rounded-lg">
        <div className="text-sm text-gh-text-secondary mb-1">Success Rate (24h)</div>
        <div className="text-2xl font-bold text-gh-success">98.5%</div>
      </div>
      <div className="p-4 bg-gh-dark border border-gh-border rounded-lg">
        <div className="text-sm text-gh-text-secondary mb-1">Avg Duration</div>
        <div className="text-2xl font-bold">2m 14s</div>
      </div>
      <div className="p-4 bg-gh-dark border border-gh-border rounded-lg">
        <div className="text-sm text-gh-text-secondary mb-1">Total Jobs (24h)</div>
        <div className="text-2xl font-bold">1,240</div>
      </div>
    </div>
  );
}
