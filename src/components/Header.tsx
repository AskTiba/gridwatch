import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/zones", label: "Zones" },
  { to: "/incidents", label: "Incidents" },
  { to: "/report", label: "Report" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-bold text-[var(--color-primary-foreground)]">
            MU
          </span>
          <span className="hidden font-semibold sm:inline">
            Utility Monitor
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              activeProps={{
                className:
                  "bg-[var(--color-surface)] text-[var(--color-text)]",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}