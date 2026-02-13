"use client";

import { useEffect, useState } from "react";
import type { RunFilters } from "@lib/types";

interface FilterBarProps {
  org: string;
  filters: RunFilters;
  onFilterChange: (updates: Partial<RunFilters>, debounce?: boolean) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  total?: number;
}

interface FilterOptions {
  repos: string[];
  actors: string[];
  branches: string[];
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "queued", label: "⏳ Queued" },
  { value: "in_progress", label: "🔄 In Progress" },
  { value: "completed", label: "✅ Completed" },
];

const CONCLUSION_OPTIONS = [
  { value: "", label: "All Conclusions" },
  { value: "success", label: "✅ Success" },
  { value: "failure", label: "❌ Failure" },
  { value: "cancelled", label: "⚪ Cancelled" },
  { value: "skipped", label: "⏭️ Skipped" },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Created At" },
  { value: "duration", label: "Duration" },
  { value: "status", label: "Status" },
];

export function FilterBar({
  org,
  filters,
  onFilterChange,
  onClearAll,
  hasActiveFilters,
  total,
}: FilterBarProps) {
  const [options, setOptions] = useState<FilterOptions>({
    repos: [],
    actors: [],
    branches: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Fetch filter options
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch(`/api/runs/filters?org=${org}`);
        if (res.ok) {
          const data = await res.json();
          setOptions(data);
        }
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      } finally {
        setOptionsLoading(false);
      }
    }
    fetchOptions();
  }, [org]);

  return (
    <div className="mb-6 space-y-3">
      {/* Search + Sort Row */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search workflow name..."
            value={filters.search || ""}
            onChange={(e) =>
              onFilterChange({ search: e.target.value }, true)
            }
            className="w-full pl-10 pr-4 py-2 bg-gh-dark border border-gh-border rounded-lg text-sm text-gh-text placeholder-gh-text-secondary focus:outline-none focus:border-gh-info focus:ring-1 focus:ring-gh-info transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gh-text-secondary hover:text-gh-text"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sort || "created_at"}
            onChange={(e) =>
              onFilterChange({ sort: e.target.value as RunFilters["sort"] })
            }
            className="px-3 py-2 bg-gh-dark border border-gh-border rounded-lg text-sm text-gh-text focus:outline-none focus:border-gh-info cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              onFilterChange({
                order: filters.order === "asc" ? "desc" : "asc",
              })
            }
            className="p-2 bg-gh-dark border border-gh-border rounded-lg text-sm text-gh-text-secondary hover:text-gh-text hover:border-gh-text-secondary transition-colors"
            title={filters.order === "asc" ? "Ascending" : "Descending"}
          >
            {filters.order === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Filter Chips Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status */}
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value as RunFilters["status"] })}
          className="px-3 py-1.5 bg-gh-dark border border-gh-border rounded-full text-xs text-gh-text focus:outline-none focus:border-gh-info cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Conclusion */}
        <select
          value={filters.conclusion || ""}
          onChange={(e) => onFilterChange({ conclusion: e.target.value })}
          className="px-3 py-1.5 bg-gh-dark border border-gh-border rounded-full text-xs text-gh-text focus:outline-none focus:border-gh-info cursor-pointer"
        >
          {CONCLUSION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Repository */}
        <select
          value={filters.repo || ""}
          onChange={(e) => onFilterChange({ repo: e.target.value })}
          className="px-3 py-1.5 bg-gh-dark border border-gh-border rounded-full text-xs text-gh-text focus:outline-none focus:border-gh-info cursor-pointer"
          disabled={optionsLoading}
        >
          <option value="">All Repos</option>
          {options.repos.map((repo) => (
            <option key={repo} value={repo}>
              {repo}
            </option>
          ))}
        </select>

        {/* Branch */}
        <div className="relative">
          <input
            type="text"
            placeholder="Branch..."
            value={filters.branch || ""}
            onChange={(e) => onFilterChange({ branch: e.target.value }, true)}
            list="branch-options"
            className="px-3 py-1.5 bg-gh-dark border border-gh-border rounded-full text-xs text-gh-text placeholder-gh-text-secondary focus:outline-none focus:border-gh-info w-28 transition-colors"
          />
          <datalist id="branch-options">
            {options.branches.map((branch) => (
              <option key={branch} value={branch!} />
            ))}
          </datalist>
        </div>

        {/* Actor */}
        <div className="relative">
          <input
            type="text"
            placeholder="Actor..."
            value={filters.actor || ""}
            onChange={(e) => onFilterChange({ actor: e.target.value }, true)}
            list="actor-options"
            className="px-3 py-1.5 bg-gh-dark border border-gh-border rounded-full text-xs text-gh-text placeholder-gh-text-secondary focus:outline-none focus:border-gh-info w-28 transition-colors"
          />
          <datalist id="actor-options">
            {options.actors.map((actor) => (
              <option key={actor} value={actor!} />
            ))}
          </datalist>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <>
            <div className="w-px h-5 bg-gh-border mx-1" />
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 bg-gh-danger/10 border border-gh-danger/30 text-gh-danger rounded-full text-xs hover:bg-gh-danger/20 transition-colors flex items-center gap-1"
            >
              ✕ Clear all
            </button>
          </>
        )}

        {/* Result count */}
        {total !== undefined && (
          <div className="ml-auto text-xs text-gh-text-secondary">
            {total.toLocaleString()} {total === 1 ? "run" : "runs"} found
          </div>
        )}
      </div>
    </div>
  );
}
