import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Municipal Utility Monitor
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--color-text-secondary)]">
          Real-time community dashboard for power outages, water issues, and
          infrastructure monitoring.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/report"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md"
          >
            Report an Issue
          </Link>
          <Link
            to="/zones"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-[var(--color-surface-elevated)]"
          >
            Browse Zones
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-delay-1">
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

      {/* How It Works */}
      <div className="mt-24">
        <h2 className="text-center text-2xl font-semibold">How It Works</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-[var(--color-text-secondary)]">
          Three simple steps to keep your community informed.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Report",
              description:
                "Spotted a power cut, water leak, or pothole? Submit a report with your location in seconds.",
              icon: "📢",
            },
            {
              step: "2",
              title: "Confirm",
              description:
                "Other citizens in your zone can confirm and upvote the report to increase its visibility.",
              icon: "✅",
            },
            {
              step: "3",
              title: "Resolve",
              description:
                "Municipal authorities track confirmed reports and coordinate repairs with your zone's schedule.",
              icon: "🔧",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-subtle)] text-2xl">
                {item.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-24">
        <h2 className="text-center text-2xl font-semibold">
          Built for Communities
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-[var(--color-text-secondary)]">
          Everything you need to stay informed about local infrastructure.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🗺️",
              title: "Zone Maps",
              description:
                "Interactive maps showing incidents and scheduled outages in your area.",
            },
            {
              icon: "🔔",
              title: "Push Alerts",
              description:
                "Subscribe to your zone and get notified instantly when issues are reported.",
            },
            {
              icon: "📊",
              title: "Grid Schedule",
              description:
                "View weekly power and water schedules for planned maintenance windows.",
            },
            {
              icon: "👥",
              title: "Community Driven",
              description:
                "Citizen reports are confirmed and upvoted, surfacing the most critical issues.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-3 font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-10 shadow-sm">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: "3", label: "Zones Monitored" },
            { value: "24/7", label: "Real-Time Tracking" },
            { value: "5", label: "Issue Categories" },
            { value: "∞", label: "Community Reports" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-[var(--color-primary)]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 text-center">
        <h2 className="text-2xl font-semibold">See What's Happening</h2>
        <p className="mx-auto mt-2 max-w-lg text-[var(--color-text-secondary)]">
          Browse live incidents reported by citizens in your area, or report a
          new issue to help your community.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/incidents"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md"
          >
            View Incidents
          </Link>
          <Link
            to="/zones"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-[var(--color-surface-elevated)]"
          >
            Find Your Zone
          </Link>
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
    <Link
      to={href}
      className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`}
        />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {description}
      </p>
      <p className="mt-4 text-xs font-medium text-[var(--color-text-muted)]">
        {statusLabels[status]}
      </p>
    </Link>
  );
}
