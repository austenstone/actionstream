"use client";

import { useState, Suspense } from "react";
import { FilterBar } from "@/components/FilterBar";
import { RunList } from "@/components/RunList";
import { Pagination } from "@/components/Pagination";
import { useRunFilters } from "@/hooks/useRunFilters";

interface DashboardContentProps {
  org: string;
}

function DashboardContent({ org }: DashboardContentProps) {
  const { filters, setFilters, clearAll, hasActiveFilters, buildQueryString } =
    useRunFilters();
  const [total, setTotal] = useState(0);

  const queryString = buildQueryString(org);

  return (
    <>
      <FilterBar
        org={org}
        filters={filters}
        onFilterChange={setFilters}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        total={total}
      />

      <RunList
        org={org}
        queryString={queryString}
        onTotalChange={setTotal}
      />

      <Pagination
        offset={filters.offset || 0}
        limit={filters.limit || 25}
        total={total}
        onPageChange={(offset) => setFilters({ offset })}
      />
    </>
  );
}

export function DashboardWithFilters({ org }: DashboardContentProps) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gh-border rounded-lg opacity-20" />
          <div className="h-12 bg-gh-border rounded-lg opacity-20" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gh-border rounded-lg opacity-20" />
          ))}
        </div>
      }
    >
      <DashboardContent org={org} />
    </Suspense>
  );
}
