export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-[var(--color-text-muted)]">
            Municipal Utility Monitor — Community-driven infrastructure
            monitoring.
          </p>
          <div className="flex gap-4 text-sm text-[var(--color-text-muted)]">
            <span>Open Source</span>
            <span aria-hidden="true">·</span>
            <span>Built for Communities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}