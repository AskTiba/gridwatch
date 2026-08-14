import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";

export const Route = createFileRoute("/incidents/")({
  component: IncidentsPage,
});

interface Incident {
  id: string;
  type: "power_cut" | "water_leak" | "pothole" | "street_light" | "other";
  description: string;
  neighborhood: string;
  status: "open" | "confirmed" | "in_progress" | "resolved" | "dismissed";
  upvotes: number;
  time: string;
  latitude: string;
  longitude: string;
}

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

// Simulated data — replace with TanStack Query infinite query
function generateMockIncidents(page: number): Incident[] {
  const types: Incident["type"][] = [
    "power_cut",
    "water_leak",
    "pothole",
    "street_light",
    "other",
  ];
  const statuses: Incident["status"][] = [
    "open",
    "confirmed",
    "in_progress",
    "resolved",
  ];
  const neighborhoods = [
    "Downtown",
    "Riverside",
    "Hillcrest",
    "Eastgate",
    "Sunset Valley",
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: `${page}-${i}`,
    type: types[(page * 10 + i) % types.length],
    description: `Reported issue #${page * 10 + i + 1} — citizen-reported infrastructure problem in the area.`,
    neighborhood: neighborhoods[(page * 10 + i) % neighborhoods.length],
    status: statuses[(page * 10 + i) % statuses.length],
    upvotes: Math.floor(Math.random() * 20),
    time: `${Math.floor(Math.random() * 23) + 1}h ago`,
    latitude: (-33.92 + Math.random() * 0.1).toFixed(6),
    longitude: (18.42 + Math.random() * 0.1).toFixed(6),
  }));
}

function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const newIncidents = generateMockIncidents(page);
      setIncidents((prev) => [...prev, ...newIncidents]);
      setPage((prev) => prev + 1);
      setHasMore(page < 4); // max 5 pages
      setLoading(false);
    }, 500);
  }, [page, loading, hasMore]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  const filteredIncidents =
    filter === "all"
      ? incidents
      : incidents.filter((i) => i.type === filter);

  const handleUpvote = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i))
    );
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

      {/* Incident Feed */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-text-muted)]"
          >
            <span className="mt-0.5 text-2xl">
              {typeIcons[incident.type]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${statusColors[incident.status]}`}
                />
                <span className="text-xs font-medium">
                  {statusLabels[incident.status]}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  · {incident.neighborhood}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  · {incident.time}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed">
                {incident.description}
              </p>
            </div>
            <button
              onClick={() => handleUpvote(incident.id)}
              className="flex shrink-0 flex-col items-center gap-0.5 rounded-md border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <span className="text-xs">▲</span>
              <span className="text-xs font-semibold">{incident.upvotes}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="py-8 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm">Loading more incidents...</span>
          </div>
        )}
        {!hasMore && incidents.length > 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">
            No more incidents to load.
          </p>
        )}
      </div>
    </div>
  );
}