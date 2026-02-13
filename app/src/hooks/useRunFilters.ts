"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { RunFilters } from "@lib/types";

const DEBOUNCE_MS = 300;

/**
 * Hook to manage run filter state synced with URL search params.
 * Provides shareable filter links and debounced search.
 */
export function useRunFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read filters from URL
  const filters: RunFilters = useMemo(() => ({
    status: (searchParams.get("status") as RunFilters["status"]) || "",
    conclusion: searchParams.get("conclusion") || "",
    repo: searchParams.get("repo") || "",
    actor: searchParams.get("actor") || "",
    branch: searchParams.get("branch") || "",
    search: searchParams.get("search") || "",
    sort: (searchParams.get("sort") as RunFilters["sort"]) || "created_at",
    order: (searchParams.get("order") as RunFilters["order"]) || "desc",
    limit: parseInt(searchParams.get("limit") || "25", 10),
    offset: parseInt(searchParams.get("offset") || "0", 10),
  }), [searchParams]);

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update URL with new filters
  const setFilters = useCallback(
    (updates: Partial<RunFilters>, debounce = false) => {
      const apply = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Reset offset when filters change (but not when just paginating)
        const isPaginationOnly =
          Object.keys(updates).length === 1 && "offset" in updates;
        if (!isPaginationOnly) {
          params.delete("offset");
        }

        for (const [key, value] of Object.entries(updates)) {
          if (value === "" || value === undefined || value === null) {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        }

        // Clean up defaults
        if (params.get("sort") === "created_at") params.delete("sort");
        if (params.get("order") === "desc") params.delete("order");
        if (params.get("limit") === "25") params.delete("limit");
        if (params.get("offset") === "0") params.delete("offset");

        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      };

      if (debounce) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(apply, DEBOUNCE_MS);
      } else {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        apply();
      }
    },
    [searchParams, router, pathname]
  );

  // Clear all filters
  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.status ||
      filters.conclusion ||
      filters.repo ||
      filters.actor ||
      filters.branch ||
      filters.search
    );
  }, [filters]);

  // Build query string for API calls
  const buildQueryString = useCallback(
    (org?: string) => {
      const params = new URLSearchParams();
      if (org) params.set("org", org);
      if (filters.status) params.set("status", filters.status);
      if (filters.conclusion) params.set("conclusion", filters.conclusion);
      if (filters.repo) params.set("repo", filters.repo);
      if (filters.actor) params.set("actor", filters.actor);
      if (filters.branch) params.set("branch", filters.branch);
      if (filters.search) params.set("search", filters.search);
      if (filters.sort && filters.sort !== "created_at")
        params.set("sort", filters.sort);
      if (filters.order && filters.order !== "desc")
        params.set("order", filters.order);
      params.set("limit", String(filters.limit || 25));
      params.set("offset", String(filters.offset || 0));
      return params.toString();
    },
    [filters]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    filters,
    setFilters,
    clearAll,
    hasActiveFilters,
    buildQueryString,
  };
}
