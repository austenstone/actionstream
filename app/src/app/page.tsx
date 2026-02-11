import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-6">⏪</div>
        <h1 className="text-4xl font-bold mb-4">
          Action<span className="text-gh-info">Stream</span>
        </h1>
        <p className="text-xl text-gh-text-secondary mb-2">
          GitHub Actions DVR Dashboard
        </p>
        <p className="text-gh-text-secondary mb-8">
          Time-travel through your CI/CD — watch workflow runs execute in real-time,
          or scrub to any point in history to see the state of all your pipelines.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gh-accent text-white rounded-lg font-medium hover:bg-gh-info transition-colors"
          >
            Open Dashboard
          </Link>
          <a
            href="https://github.com/austenstone/actionstream"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gh-border text-gh-text rounded-lg font-medium hover:border-gh-text-secondary transition-colors"
          >
            View on GitHub
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-4 border border-gh-border rounded-lg bg-gh-dark">
            <div className="text-2xl mb-2">📡</div>
            <h3 className="font-semibold mb-1">Live Mode</h3>
            <p className="text-sm text-gh-text-secondary">
              Watch workflow runs execute in real-time via WebSocket streaming.
            </p>
          </div>
          <div className="p-4 border border-gh-border rounded-lg bg-gh-dark">
            <div className="text-2xl mb-2">⏱️</div>
            <h3 className="font-semibold mb-1">Time Travel</h3>
            <p className="text-sm text-gh-text-secondary">
              Scrub to any point in time and see the exact state of all workflows.
            </p>
          </div>
          <div className="p-4 border border-gh-border rounded-lg bg-gh-dark">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p className="text-sm text-gh-text-secondary">
              Pre-computed snapshots for instant success rates and duration trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
