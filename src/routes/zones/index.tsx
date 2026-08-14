import { createFileRoute } from "@tanstack/react-router";
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
          neighborhood: searchType === "neighborhood" ? searchQuery : undefined,
        },
      }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Find Your Zone</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Look up your area by postal code, neighborhood, or browse all zones.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex gap-2">
            <button
              onClick={() => setSearchType("all")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                searchType === "all"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSearchType("postal")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                searchType === "postal"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Postal Code
            </button>
            <button
              onClick={() => setSearchType("neighborhood")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                searchType === "neighborhood"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Neighborhood
            </button>
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
            className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-[var(--color-text-muted)]">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading zones...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && zones.length === 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <span className="text-4xl">📍</span>
          <p className="mt-4 text-lg font-semibold">No zones found</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
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
    <a
      href={`/zones/${id}`}
      className="group block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-primary)] hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {neighborhood ?? "Unknown neighborhood"}
            {postalCode && ` · ${postalCode}`}
          </p>
        </div>
        <span className="h-3 w-3 rounded-full bg-[var(--color-success)]" />
      </div>
    </a>
  );
}