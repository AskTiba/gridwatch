import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/zones/$zoneId")({
  component: ZoneDetailPage,
});

function ZoneDetailPage() {
  const { zoneId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<"schedule" | "incidents" | "map">(
    "schedule"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <a
            href="/zones"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            ← Zones
          </a>
        </div>
        <h1 className="mt-2 text-3xl font-bold">Zone {zoneId}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Grid schedule, active incidents, and area map.
        </p>
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
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
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

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)]">
                Hour
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="px-3 py-2 text-center text-xs font-medium text-[var(--color-text-muted)]"
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
                      hour < o.endHour
                  );
                  return (
                    <td
                      key={dayIndex}
                      className={`px-1 py-1 ${
                        outage
                          ? outage.type === "power"
                            ? "bg-[var(--color-primary)]/10"
                            : "bg-[var(--color-warning)]/10"
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
        <a
          href="/report"
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]"
        >
          + Report Issue
        </a>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <span className="text-2xl">
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
              <p className="mt-1 text-sm">{incident.description}</p>
            </div>
            <button className="flex items-center gap-1 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg)]">
              <span>▲</span>
              <span>{incident.upvotes}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ZoneMap({ zoneId }: { zoneId: string }) {
  return (
    <div className="flex h-[500px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="text-center">
        <p className="text-lg font-semibold">Map View</p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Interactive map for zone {zoneId} will be loaded here.
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Integrating Leaflet with PostGIS spatial queries.
        </p>
      </div>
    </div>
  );
}