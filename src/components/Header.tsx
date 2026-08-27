import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/zones", label: "Zones" },
  { to: "/incidents", label: "Incidents" },
  { to: "/report", label: "Report" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--color-bg)]/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] shadow-sm">
            <svg
              className="h-5 w-5 text-[var(--color-primary-foreground)]"
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
          <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
            GridWatch
          </span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-[var(--color-text-muted)] transition-all duration-150 hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]"
              activeProps={{
                className:
                  "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]",
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-1 h-5 w-px bg-[var(--color-border)]" aria-hidden="true" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
