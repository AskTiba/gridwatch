import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/zones/")({
  component: ZonesPage,
});

function ZonesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "postal" | "neighborhood" | "all"
  >("all");

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

      {/* Zone Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ZoneCard
          name="Downtown Core"
          neighborhood="CBD"
          postalCode="8001"
          status="operational"
          powerStatus="no_outages"
          waterStatus="no_outages"
        />
        <ZoneCard
          name="Riverside"
          neighborhood="Waterfront"
          postalCode="8002"
          status="warning"
          powerStatus="scheduled"
          waterStatus="no_outages"
        />
        <ZoneCard
          name="Hillcrest"
          neighborhood="North Ridge"
          postalCode="8003"
          status="operational"
          powerStatus="no_outages"
          waterStatus="no_outages"
        />
        <ZoneCard
          name="Eastgate"
          neighborhood="Industrial Park"
          postalCode="8004"
          status="critical"
          powerStatus="active"
          waterStatus="no_outages"
        />
        <ZoneCard
          name="Sunset Valley"
          neighborhood="Residential"
          postalCode="8005"
          status="operational"
          powerStatus="no_outages"
          waterStatus="scheduled"
        />
        <ZoneCard
          name="Central Heights"
          neighborhood="Midtown"
          postalCode="8006"
          status="operational"
          powerStatus="no_outages"
          waterStatus="no_outages"
        />
      </div>
    </div>
  );
}

function ZoneCard({
  name,
  neighborhood,
  postalCode,
  status,
  powerStatus,
  waterStatus,
}: {
  name: string;
  neighborhood: string;
  postalCode: string;
  status: "operational" | "warning" | "critical";
  powerStatus: "no_outages" | "scheduled" | "active";
  waterStatus: "no_outages" | "scheduled" | "active";
}) {
  const statusConfig = {
    operational: {
      bg: "bg-[var(--color-success)]",
      label: "All Systems Operational",
    },
    warning: {
      bg: "bg-[var(--color-warning)]",
      label: "Issue Detected",
    },
    critical: {
      bg: "bg-[var(--color-danger)]",
      label: "Active Outage",
    },
  };

  const utilityLabel = (status: "no_outages" | "scheduled" | "active") => {
    switch (status) {
      case "no_outages":
        return { text: "Operational", color: "text-[var(--color-success)]" };
      case "scheduled":
        return { text: "Scheduled Maintenance", color: "text-[var(--color-warning)]" };
      case "active":
        return { text: "Active Outage", color: "text-[var(--color-danger)]" };
    }
  };

  const power = utilityLabel(powerStatus);
  const water = utilityLabel(waterStatus);

  return (
    <a
      href={`/zones/${postalCode}`}
      className="group block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-primary)] hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {neighborhood} · {postalCode}
          </p>
        </div>
        <span className={`h-3 w-3 rounded-full ${statusConfig[status].bg}`} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-muted)]">Power</span>
          <span className={`font-medium ${power.color}`}>{power.text}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-muted)]">Water</span>
          <span className={`font-medium ${water.color}`}>{water.text}</span>
        </div>
      </div>
    </a>
  );
}