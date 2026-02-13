import { TimeSlider } from "@/components/TimeSlider";
import { StatsBar } from "@/components/StatsBar";
import { LiveIndicator } from "@/components/LiveIndicator";
import { DashboardWithFilters } from "@/components/DashboardWithFilters";

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
        <LiveIndicator org={org} />
      </div>

      {/* Stats bar */}
      <StatsBar org={org} />

      {/* Time slider */}
      <TimeSlider />

      {/* Filter bar + Run list + Pagination */}
      <DashboardWithFilters org={org} />
    </div>
  );
}
