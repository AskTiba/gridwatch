import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getZonesWithStats } from "~/functions/zones";

export const Route = createFileRoute("/zones/")({
  component: ZonesPage,
});

function ZonesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");

  const { data: zones = [], isLoading, isError } = useQuery({
    queryKey: ["zones", searchQuery],
    queryFn: () =>
      getZonesWithStats({
        data: { search: searchQuery || undefined },
      }),
  });

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus("idle");
      },
      () => {
        setLocationStatus("error");
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Find Your Area</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Select your parish, trading center, or neighborhood to see outages
          and report issues.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="zone-search">
              Search areas
            </label>
            <input
              id="zone-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name — e.g. Kisementi, Nakawa..."
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <button
              onClick={handleUseLocation}
              disabled={locationStatus === "loading"}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-all duration-150 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
              </svg>
              {locationStatus === "loading" ? "Locating..." : "Use my location"}
            </button>
          </div>
          {locationStatus === "error" && (
            <p className="text-xs text-[var(--color-danger)]">
              Could not get your location. Please allow location access in your browser settings.
            </p>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2.5 py-16 text-[var(--color-text-muted)]">
          <svg
            className="h-5 w-5 animate-spin"
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
          <span className="text-sm">Loading areas...</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-subtle)] p-10 text-center shadow-sm">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-lg font-semibold">Failed to load areas</p>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            Something went wrong. Please try again later.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && zones.length === 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-sm">
          <span className="text-4xl">📍</span>
          <p className="mt-4 text-lg font-semibold">No areas found</p>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            {searchQuery
              ? `No areas match "${searchQuery}"`
              : "No areas have been configured yet."}
          </p>
        </div>
      )}

      {/* Zone Grid */}
      {!isLoading && !isError && zones.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <ZoneCard
              key={zone.id}
              id={zone.id}
              name={zone.name}
              neighborhood={zone.neighborhood}
              municipality={zone.municipality}
              activeOutages={zone.activeOutages}
              openIncidents={zone.openIncidents}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ZoneCard({
  id,
  name,
  neighborhood,
  municipality,
  activeOutages,
  openIncidents,
}: {
  id: string;
  name: string;
  neighborhood: string | null;
  municipality: string | null;
  activeOutages: number;
  openIncidents: number;
}) {
  const hasIssue = activeOutages > 0 || openIncidents > 0;

  return (
    <Link
      to={`/zones/${id}` as "/zones/$zoneId"}
      params={{ zoneId: id }}
      className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{name}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {neighborhood ?? municipality ?? "Monitoring area"}
          </p>
        </div>
        <span
          className={`h-3 w-3 shrink-0 rounded-full shadow-sm ${
            hasIssue
              ? "bg-[var(--color-warning)] shadow-[var(--color-warning)]/30"
              : "bg-[var(--color-success)] shadow-[var(--color-success)]/30"
          }`}
        />
      </div>
      {(activeOutages > 0 || openIncidents > 0) && (
        <div className="mt-3 flex gap-3 text-xs text-[var(--color-text-muted)]">
          {activeOutages > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warning)]" />
              {activeOutages} outage{activeOutages !== 1 ? "s" : ""}
            </span>
          )}
          {openIncidents > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
              {openIncidents} report{openIncidents !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
