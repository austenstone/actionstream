import { TimeSlider } from "@/components/TimeSlider";
import { RunList } from "@/components/RunList";
import { StatsBar } from "@/components/StatsBar";

interface OrgDashboardProps {
  params: Promise<{ org: string }>;
}

/**
 * /dashboard/[org] — Main DVR dashboard for an organization.
 */
export default async function OrgDashboard({ params }: OrgDashboardProps) {
  const { org } = await params;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{org}</h1>
          <p className="text-sm text-gh-text-secondary">Workflow Timeline</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-gh-success animate-pulse-slow" />
            Live
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar org={org} />

      {/* Time slider */}
      <TimeSlider />

      {/* Run list */}
      <RunList org={org} />
    </div>
  );
}
