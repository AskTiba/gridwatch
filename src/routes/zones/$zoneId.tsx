import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getZoneById, getZoneOutages } from "~/functions/zones";
import { getIncidents } from "~/functions/incidents";
import { MapView } from "~/components/MapView";
import { usePushSubscription } from "~/hooks/usePushSubscription";

export const Route = createFileRoute("/zones/$zoneId")({
  component: ZoneDetailPage,
  notFoundComponent: ZoneNotFound,
});

function ZoneNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl">📍</span>
      <h2 className="mt-4 text-2xl font-bold">Area Not Found</h2>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        The area you're looking for doesn't exist or has been removed.
      </p>
      <Link
        to="/zones"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md"
      >
        Browse All Areas
      </Link>
    </div>
  );
}

function ZoneDetailPage() {
  const { zoneId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<"schedule" | "incidents" | "map">(
    "schedule",
  );

  const { data: zone, isLoading: zoneLoading, isError: zoneError } = useQuery({
    queryKey: ["zone", zoneId],
    queryFn: () => getZoneById({ data: { id: zoneId } }),
  });

  const { data: outages = [] } = useQuery({
    queryKey: ["zoneOutages", zoneId],
    queryFn: () => getZoneOutages({ data: { zoneId } }),
    enabled: !!zone,
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["zoneIncidents", zoneId],
    queryFn: () => getIncidents({ data: { zoneId } }),
    enabled: !!zone,
  });

  const push = usePushSubscription(zoneId);

  const handleSubscribe = async () => {
    if (push.permission === "default") {
      const result = await push.requestPermission();
      if (result !== "granted") return;
    }
    push.subscribe();
  };

  if (zoneLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2.5 py-16 text-[var(--color-text-muted)]">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading area...</span>
        </div>
      </div>
    );
  }

  if (zoneError || !zone) {
    return <ZoneNotFound />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/zones"
                className="text-sm text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-primary)]"
              >
                ← Areas
              </Link>
            </div>
            <h1 className="mt-2 text-3xl font-bold">{zone.name}</h1>
            <p className="mt-1.5 text-[var(--color-text-secondary)]">
              {zone.neighborhood ?? "Monitoring area"}
              {zone.postalCode && ` · ${zone.postalCode}`}
            </p>
          </div>
          {push.isSupported && (
            <button
              onClick={handleSubscribe}
              disabled={push.isSubscribing || push.isSubscribed}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-150 ${
                push.isSubscribed
                  ? "bg-[var(--color-success)] text-[var(--color-success-foreground)]"
                  : "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] hover:shadow-md"
              } disabled:opacity-50`}
            >
              {push.isSubscribing
                ? "Subscribing..."
                : push.isSubscribed
                  ? "🔔 Subscribed"
                  : "🔔 Subscribe to Alerts"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-[var(--color-border)]">
        {(
          [
            { key: "schedule", label: "Grid Schedule" },
            { key: "incidents", label: `Incidents (${incidents.length})` },
            { key: "map", label: "Map View" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "schedule" && <GridSchedule outages={outages} />}
      {activeTab === "incidents" && (
        <ZoneIncidents incidents={incidents} zoneId={zoneId} />
      )}
      {activeTab === "map" && (
        <ZoneMap incidents={incidents} zoneName={zone.name} />
      )}
    </div>
  );
}

function GridSchedule({ outages }: { outages: Array<{
  id: string;
  type: string;
  status: string;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  reason: string | null;
}> }) {
  const activeOutages = outages.filter(
    (o) => o.status === "scheduled" || o.status === "active"
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Grid Schedule</h2>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[var(--color-primary)]" />
            Power
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[var(--color-warning)]" />
            Water
          </span>
        </div>
      </div>

      {activeOutages.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
          <span className="text-3xl">✅</span>
          <p className="mt-3 text-sm font-medium">No scheduled outages</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            All services are currently running as normal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeOutages.map((outage) => (
            <div
              key={outage.id}
              className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
            >
              <span className="mt-0.5 text-2xl">
                {outage.type === "power" ? "⚡" : "💧"}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      outage.status === "active"
                        ? "bg-[var(--color-danger)]"
                        : "bg-[var(--color-warning)]"
                    }`}
                  />
                  <span className="text-xs font-medium capitalize text-[var(--color-text-muted)]">
                    {outage.status}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    · {outage.type}
                  </span>
                </div>
                {outage.reason && (
                  <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                    {outage.reason}
                  </p>
                )}
                {outage.scheduledStart && outage.scheduledEnd && (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {new Date(outage.scheduledStart).toLocaleDateString()}{" "}
                    {new Date(outage.scheduledStart).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(outage.scheduledEnd).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ZoneIncidents({
  incidents,
  zoneId,
}: {
  incidents: Array<{
    id: string;
    type: string;
    description: string;
    status: string;
    upvotes: number;
    createdAt: Date;
    latitude: string;
    longitude: string;
  }>;
  zoneId: string;
}) {
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
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reported Incidents</h2>
        <Link
          to="/report"
          search={{ zoneId }}
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md"
        >
          + Report Issue
        </Link>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
          <span className="text-3xl">📋</span>
          <p className="mt-3 text-sm font-medium">No incidents reported</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Be the first to report an issue in this area.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <span className="mt-0.5 text-2xl">
                {typeIcons[incident.type] ?? "📋"}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${statusColors[incident.status]}`}
                  />
                  <span className="text-xs font-medium capitalize text-[var(--color-text-muted)]">
                    {incident.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    · {new Date(incident.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  {incident.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-muted)]">
                <span>▲</span>
                <span>{incident.upvotes}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ZoneMap({
  incidents,
  zoneName,
}: {
  incidents: Array<{
    id: string;
    latitude: string;
    longitude: string;
    type: string;
  }>;
  zoneName: string;
}) {
  const clusters = incidents.map((i) => ({
    id: i.id,
    lat: parseFloat(i.latitude),
    lng: parseFloat(i.longitude),
    count: 1,
    type: i.type as "power_cut" | "water_leak" | "pothole" | "street_light" | "other",
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Incident Map — {zoneName}</h2>
        <span className="text-sm text-[var(--color-text-muted)]">
          {clusters.length} incident{clusters.length !== 1 ? "s" : ""}
        </span>
      </div>
      {clusters.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
          <span className="text-3xl">🗺️</span>
          <p className="mt-3 text-sm font-medium">No incidents to display</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Reported incidents will appear on the map.
          </p>
        </div>
      ) : (
        <MapView
          incidents={clusters}
          center={[0.3476, 32.5825]}
          zoom={13}
          className="h-[500px] rounded-xl shadow-sm"
        />
      )}
    </div>
  );
}
