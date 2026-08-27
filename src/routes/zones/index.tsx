import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getZones } from "~/functions/zones";

export const Route = createFileRoute("/zones/")({
  component: ZonesPage,
});

function ZonesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "postal" | "neighborhood" | "all"
  >("all");

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["zones", searchQuery, searchType],
    queryFn: () =>
      getZones({
        data: {
          search: searchType === "all" ? searchQuery : undefined,
          postalCode: searchType === "postal" ? searchQuery : undefined,
          neighborhood:
            searchType === "neighborhood" ? searchQuery : undefined,
        },
      }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Find Your Zone</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Look up your area by postal code, neighborhood, or browse all zones.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex gap-1.5">
            {[
              { key: "all" as const, label: "All" },
              { key: "postal" as const, label: "Postal Code" },
              { key: "neighborhood" as const, label: "Neighborhood" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSearchType(tab.key)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                  searchType === tab.key
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              searchType === "postal"
                ? "Enter postal code..."
                : searchType === "neighborhood"
                  ? "Enter neighborhood name..."
                  : "Search zones..."
            }
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
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
          <span className="text-sm">Loading zones...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && zones.length === 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-sm">
          <span className="text-4xl">📍</span>
          <p className="mt-4 text-lg font-semibold">No zones found</p>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            {searchQuery
              ? `No zones match "${searchQuery}"`
              : "No zones have been configured yet."}
          </p>
        </div>
      )}

      {/* Zone Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <ZoneCard
            key={zone.id}
            id={zone.id}
            name={zone.name}
            neighborhood={zone.neighborhood}
            postalCode={zone.postalCode}
          />
        ))}
      </div>
    </div>
  );
}

function ZoneCard({
  id,
  name,
  neighborhood,
  postalCode,
}: {
  id: string;
  name: string;
  neighborhood: string | null;
  postalCode: string | null;
}) {
  return (
    <Link
      to={`/zones/${id}` as "/zones/$zoneId"}
      params={{ zoneId: id }}
      className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {neighborhood ?? "Unknown neighborhood"}
            {postalCode && ` · ${postalCode}`}
          </p>
        </div>
        <span className="h-3 w-3 rounded-full bg-[var(--color-success)] shadow-sm shadow-[var(--color-success)]/30" />
      </div>
    </Link>
  );
}
