import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
      <h2 className="mt-4 text-2xl font-bold">Zone Not Found</h2>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        The zone you're looking for doesn't exist or has been removed.
      </p>
      <Link
        to="/zones"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md"
      >
        Browse All Zones
      </Link>
    </div>
  );
}

function ZoneDetailPage() {
  const { zoneId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<"schedule" | "incidents" | "map">(
    "schedule",
  );
  const push = usePushSubscription(zoneId);

  const handleSubscribe = async () => {
    if (push.permission === "default") {
      const result = await push.requestPermission();
      if (result !== "granted") return;
    }
    push.subscribe();
  };

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
                ← Zones
              </Link>
            </div>
            <h1 className="mt-2 text-3xl font-bold">Zone {zoneId}</h1>
            <p className="mt-1.5 text-[var(--color-text-secondary)]">
              Grid schedule, active incidents, and area map.
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
            { key: "incidents", label: "Incidents" },
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

      {activeTab === "schedule" && <GridSchedule />}
      {activeTab === "incidents" && <ZoneIncidents />}
      {activeTab === "map" && <ZoneMap zoneId={zoneId} />}
    </div>
  );
}

function GridSchedule() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const scheduledOutages = [
    {
      day: 2,
      startHour: 8,
      endHour: 14,
      type: "power" as const,
      reason: "Transformer maintenance — Ward 12",
    },
    {
      day: 4,
      startHour: 10,
      endHour: 16,
      type: "water" as const,
      reason: "Water main replacement — Oak Street",
    },
    {
      day: 6,
      startHour: 6,
      endHour: 10,
      type: "power" as const,
      reason: "Scheduled grid testing",
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Weekly Grid Schedule</h2>
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

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-sm">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-[var(--color-text-muted)]">
                Hour
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="px-3 py-2.5 text-center text-xs font-medium text-[var(--color-text-muted)]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr
                key={hour}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <td className="whitespace-nowrap px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
                  {String(hour).padStart(2, "0")}:00
                </td>
                {days.map((_, dayIndex) => {
                  const outage = scheduledOutages.find(
                    (o) =>
                      o.day === dayIndex &&
                      hour >= o.startHour &&
                      hour < o.endHour,
                  );
                  return (
                    <td
                      key={dayIndex}
                      className={`px-1 py-1 ${
                        outage
                          ? outage.type === "power"
                            ? "bg-[var(--color-primary-subtle)]"
                            : "bg-[var(--color-warning-subtle)]"
                          : ""
                      }`}
                    >
                      {outage && hour === outage.startHour && (
                        <div
                          className={`cursor-pointer rounded px-1 py-0.5 text-xs text-white ${
                            outage.type === "power"
                              ? "bg-[var(--color-primary)]"
                              : "bg-[var(--color-warning)]"
                          }`}
                          title={outage.reason}
                        >
                          {outage.type === "power" ? "⚡" : "💧"}{" "}
                          {outage.reason.slice(0, 20)}...
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ZoneIncidents() {
  const incidents = [
    {
      id: "1",
      type: "power_cut",
      description: "Entire block without power since 3am",
      status: "confirmed",
      upvotes: 12,
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "water_leak",
      description: "Major water leak on corner of Main and 5th",
      status: "open",
      upvotes: 5,
      time: "45 minutes ago",
    },
  ];

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
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md"
        >
          + Report Issue
        </Link>
      </div>

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
                  · {incident.time}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                {incident.description}
              </p>
            </div>
            <button className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
              <span>▲</span>
              <span>{incident.upvotes}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ZoneMap(_props: { zoneId: string }) {
  const mockClusters = [
    {
      id: "1",
      lat: -33.92,
      lng: 18.42,
      count: 3,
      type: "power_cut" as const,
    },
    {
      id: "2",
      lat: -33.93,
      lng: 18.43,
      count: 1,
      type: "water_leak" as const,
    },
    {
      id: "3",
      lat: -33.91,
      lng: 18.41,
      count: 2,
      type: "pothole" as const,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Incident Map</h2>
        <span className="text-sm text-[var(--color-text-muted)]">
          {mockClusters.length} cluster{mockClusters.length !== 1 ? "s" : ""}
        </span>
      </div>
      <MapView
        incidents={mockClusters}
        center={[-33.9249, 18.4241]}
        zoom={13}
        className="h-[500px] rounded-xl shadow-sm"
      />
    </div>
  );
}
