import { redirect } from "next/navigation";

/**
 * /dashboard redirects to the main org dashboard.
 * In the future this could be a multi-org picker.
 */
export default function DashboardPage() {
  // TODO: Show org picker or redirect to default org
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gh-text-secondary mb-6">
        Select an organization to view its workflow timeline.
      </p>

      <div className="border border-gh-border rounded-lg bg-gh-dark p-6">
        <p className="text-gh-text-secondary text-sm mb-4">
          No organizations configured yet. Install the ActionStream GitHub App
          on your organization to start receiving webhook events.
        </p>
        <a
          href="https://github.com/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gh-accent text-white rounded-lg text-sm font-medium hover:bg-gh-info transition-colors inline-block"
        >
          Install GitHub App
        </a>
      </div>
    </div>
  );
}
