"use client";

interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  onPageChange: (offset: number) => void;
}

export function Pagination({ offset, limit, total, onPageChange }: PaginationProps) {
  if (total <= limit) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  // Generate page numbers to show
  const pages: (number | "...")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(Math.max(0, offset - limit))}
        disabled={!hasPrev}
        className="px-3 py-1.5 text-sm rounded-lg border border-gh-border bg-gh-dark text-gh-text-secondary hover:text-gh-text hover:border-gh-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gh-text-secondary text-sm">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange((page - 1) * limit)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              page === currentPage
                ? "border-gh-info bg-gh-info/10 text-gh-info font-medium"
                : "border-gh-border bg-gh-dark text-gh-text-secondary hover:text-gh-text hover:border-gh-text-secondary"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(offset + limit)}
        disabled={!hasNext}
        className="px-3 py-1.5 text-sm rounded-lg border border-gh-border bg-gh-dark text-gh-text-secondary hover:text-gh-text hover:border-gh-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
