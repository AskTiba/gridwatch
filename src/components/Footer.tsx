import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)]">
                <svg
                  className="h-4 w-4 text-[var(--color-primary-foreground)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <span className="text-sm font-semibold tracking-tight">
                GridWatch
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
              Community-driven infrastructure monitoring for power, water, and
              municipal services.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Navigation
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { to: "/zones", label: "Zones" },
                { to: "/incidents", label: "Incidents" },
                { to: "/report", label: "Report Issue" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              About
            </h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-[var(--color-text-secondary)]">
                Open Source
              </li>
              <li className="text-sm text-[var(--color-text-secondary)]">
                Built for Communities
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--color-border)] pt-6">
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} GridWatch. Data is
            community-reported and may not reflect official status.
          </p>
        </div>
      </div>
    </footer>
  );
}
