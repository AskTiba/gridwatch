import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { upvoteIncident, getIncidents } from "~/functions/incidents";

export const Route = createFileRoute("/incidents/")({
  component: IncidentsPage,
});

const typeIcons: Record<string, string> = {
  power_cut: "⚡",
  water_leak: "💧",
  pothole: "🕳️",
  street_light: "💡",
  other: "📋",
};

const statusColors: Record<string, string> = {
  open: "bg-[var(--color-text-muted)]",
  confirmed: "bg-[var(--color-warning)]",
  in_progress: "bg-[var(--color-primary)]",
  resolved: "bg-[var(--color-success)]",
  dismissed: "bg-[var(--color-text-muted)]",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

// Generate a stable anonymous fingerprint for upvote dedup
function getFingerprint(): string {
  const stored = localStorage.getItem("upvote_fingerprint");
  if (stored) return stored;
  const fp = crypto.randomUUID();
  localStorage.setItem("upvote_fingerprint", fp);
  return fp;
}

function IncidentsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["incidents", filter],
    queryFn: ({ pageParam = 0 }) =>
      getIncidents({
        data: {
          type: filter === "all" ? undefined : filter,
          limit: 20,
          offset: pageParam,
        },
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length * 20 : undefined,
    initialPageParam: 0,
  });

  const incidents = data?.pages.flatMap((page) => page) ?? [];

  const upvoteMutation = useMutation({
    mutationFn: (incidentId: string) =>
      upvoteIncident({ data: { incidentId, fingerprint: getFingerprint() } }),
    onSuccess: (_result, incidentId) => {
      setUpvotedIds((prev) => new Set(prev).add(incidentId));
    },
  });

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleUpvote = (id: string) => {
    if (upvotedIds.has(id)) return;
    upvoteMutation.mutate(id);
  };

  const formatTime = (date: Date | string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incidents</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Live feed of citizen-reported infrastructure issues.
          </p>
        </div>
        <a
          href="/report"
          className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]"
        >
          + Report Issue
        </a>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "power_cut", label: "⚡ Power" },
          { key: "water_leak", label: "💧 Water" },
          { key: "pothole", label: "🕳️ Potholes" },
          { key: "street_light", label: "💡 Street Light" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-[var(--color-text-muted)]">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading incidents...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && incidents.length === 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <span className="text-4xl">📋</span>
          <p className="mt-4 text-lg font-semibold">No incidents reported yet</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Be the first to report an infrastructure issue in your area.
          </p>
          <a
            href="/report"
            className="mt-4 inline-block rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]"
          >
            Report Issue
          </a>
        </div>
      )}

      {/* Incident Feed */}
      <div className="space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-text-muted)]"
          >
            <span className="mt-0.5 text-2xl">
              {typeIcons[incident.type] ?? "📋"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${statusColors[incident.status] ?? "bg-[var(--color-text-muted)]"}`}
                />
                <span className="text-xs font-medium">
                  {statusLabels[incident.status] ?? incident.status}
                </span>
                {incident.neighborhood && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    · {incident.neighborhood}
                  </span>
                )}
                <span className="text-xs text-[var(--color-text-muted)]">
                  · {formatTime(incident.createdAt)}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed">
                {incident.description}
              </p>
            </div>
            <button
              onClick={() => handleUpvote(incident.id)}
              disabled={upvotedIds.has(incident.id)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-md border px-3 py-2 transition-colors ${
                upvotedIds.has(incident.id)
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              <span className="text-xs">▲</span>
              <span className="text-xs font-semibold">{incident.upvotes}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="py-8 text-center">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading more incidents...</span>
          </div>
        )}
        {!hasNextPage && incidents.length > 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">
            No more incidents to load.
          </p>
        )}
      </div>
    </div>
  );
}