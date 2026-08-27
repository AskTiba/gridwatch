import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
function HomePage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold tracking-tight sm:text-5xl", children: "Municipal Utility Monitor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-5 max-w-2xl text-lg text-[var(--color-text-secondary)]", children: "Real-time community dashboard for power outages, water issues, and infrastructure monitoring." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/report", className: "inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md", children: "Report an Issue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/zones", className: "inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-[var(--color-surface-elevated)]", children: "Browse Zones" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-delay-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCard, { title: "Power Grid", description: "Track scheduled and unscheduled outages in your zone.", status: "operational", href: "/zones" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCard, { title: "Water Supply", description: "Monitor water reservoir levels and reported leaks.", status: "warning", href: "/zones" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCard, { title: "Report Issue", description: "Submit a report about infrastructure problems near you.", status: "neutral", href: "/report" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-center text-2xl font-semibold", children: "How It Works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-2 max-w-xl text-center text-[var(--color-text-secondary)]", children: "Three simple steps to keep your community informed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-8 sm:grid-cols-3", children: [{
        step: "1",
        title: "Report",
        description: "Spotted a power cut, water leak, or pothole? Submit a report with your location in seconds.",
        icon: "📢"
      }, {
        step: "2",
        title: "Confirm",
        description: "Other citizens in your zone can confirm and upvote the report to increase its visibility.",
        icon: "✅"
      }, {
        step: "3",
        title: "Resolve",
        description: "Municipal authorities track confirmed reports and coordinate repairs with your zone's schedule.",
        icon: "🔧"
      }].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-subtle)] text-2xl", children: item.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-semibold", children: item.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]", children: item.description })
      ] }, item.step)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-center text-2xl font-semibold", children: "Built for Communities" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-2 max-w-xl text-center text-[var(--color-text-secondary)]", children: "Everything you need to stay informed about local infrastructure." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4", children: [{
        icon: "🗺️",
        title: "Zone Maps",
        description: "Interactive maps showing incidents and scheduled outages in your area."
      }, {
        icon: "🔔",
        title: "Push Alerts",
        description: "Subscribe to your zone and get notified instantly when issues are reported."
      }, {
        icon: "📊",
        title: "Grid Schedule",
        description: "View weekly power and water schedules for planned maintenance windows."
      }, {
        icon: "👥",
        title: "Community Driven",
        description: "Citizen reports are confirmed and upvoted, surfacing the most critical issues."
      }].map((feature) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: feature.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-semibold", children: feature.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]", children: feature.description })
      ] }, feature.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-8 sm:grid-cols-4", children: [{
      value: "3",
      label: "Zones Monitored"
    }, {
      value: "24/7",
      label: "Real-Time Tracking"
    }, {
      value: "5",
      label: "Issue Categories"
    }, {
      value: "∞",
      label: "Community Reports"
    }].map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-[var(--color-primary)]", children: stat.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-[var(--color-text-muted)]", children: stat.label })
    ] }, stat.label)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "See What's Happening" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-2 max-w-lg text-[var(--color-text-secondary)]", children: "Browse live incidents reported by citizens in your area, or report a new issue to help your community." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/incidents", className: "inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md", children: "View Incidents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/zones", className: "inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-[var(--color-surface-elevated)]", children: "Find Your Zone" })
      ] })
    ] })
  ] });
}
function StatusCard({
  title,
  description,
  status,
  href
}) {
  const statusColors = {
    operational: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    critical: "bg-[var(--color-danger)]",
    neutral: "bg-[var(--color-text-muted)]"
  };
  const statusLabels = {
    operational: "Operational",
    warning: "Issue Detected",
    critical: "Critical",
    neutral: "Open"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: href, className: "group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 rounded-full ${statusColors[status]}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2.5 text-sm leading-relaxed text-[var(--color-text-secondary)]", children: description }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs font-medium text-[var(--color-text-muted)]", children: statusLabels[status] })
  ] });
}
export {
  HomePage as component
};
