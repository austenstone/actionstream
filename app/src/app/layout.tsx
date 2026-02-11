import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ActionStream — GitHub Actions DVR",
  description: "Time-travel through your CI/CD. Watch, rewind, and replay your GitHub Actions workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gh-darker text-gh-text antialiased">
        <header className="border-b border-gh-border bg-gh-dark px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏪</span>
              <h1 className="text-lg font-semibold">
                Action<span className="text-gh-info">Stream</span>
              </h1>
            </div>
            <nav className="flex items-center gap-4 text-sm text-gh-text-secondary">
              <a href="/dashboard" className="hover:text-gh-text transition-colors">
                Dashboard
              </a>
              <a
                href="https://github.com/austenstone/actionstream"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gh-text transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
