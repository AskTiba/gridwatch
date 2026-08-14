import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Municipal Utility Monitor
        </h1>
        <p className="mt-4 text-lg text-[var(--color-text-muted)]">
          Real-time community dashboard for power outages, water issues, and
          infrastructure monitoring.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="Power Grid"
          description="Track scheduled and unscheduled outages in your zone."
          status="operational"
          href="/zones"
        />
        <StatusCard
          title="Water Supply"
          description="Monitor water reservoir levels and reported leaks."
          status="warning"
          href="/zones"
        />
        <StatusCard
          title="Report Issue"
          description="Submit a report about infrastructure problems near you."
          status="neutral"
          href="/report"
        />
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold">Active Incidents</h2>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Live feed of citizen-reported issues in your area.
        </p>
        <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-[var(--color-text-muted)]">
            No active incidents reported yet. Be the first to report an issue.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  description,
  status,
  href,
}: {
  title: string;
  description: string;
  status: "operational" | "warning" | "critical" | "neutral";
  href: string;
}) {
  const statusColors = {
    operational: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    critical: "bg-[var(--color-danger)]",
    neutral: "bg-[var(--color-text-muted)]",
  };

  const statusLabels = {
    operational: "Operational",
    warning: "Issue Detected",
    critical: "Critical",
    neutral: "Open",
  };

  return (
    <a
      href={href}
      className="group block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-primary)]"
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`}
        />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {description}
      </p>
      <p className="mt-3 text-xs font-medium text-[var(--color-text-muted)]">
        {statusLabels[status]}
      </p>
    </a>
  );
}