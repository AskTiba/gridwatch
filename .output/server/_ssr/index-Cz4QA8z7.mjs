import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useInfiniteQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as upvoteIncident, g as getIncidents } from "./incidents-BPkmIAwf.mjs";
import "./index.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "./createSsrRpc-C2cGivNr.mjs";
import "node:async_hooks";
const typeIcons = {
  power_cut: "⚡",
  water_leak: "💧",
  pothole: "🕳️",
  street_light: "💡",
  other: "📋"
};
const statusColors = {
  open: "bg-[var(--color-text-muted)]",
  confirmed: "bg-[var(--color-warning)]",
  in_progress: "bg-[var(--color-primary)]",
  resolved: "bg-[var(--color-success)]",
  dismissed: "bg-[var(--color-text-muted)]"
};
const statusLabels = {
  open: "Open",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  resolved: "Resolved",
  dismissed: "Dismissed"
};
function getFingerprint() {
  const stored = localStorage.getItem("upvote_fingerprint");
  if (stored) return stored;
  const fp = crypto.randomUUID();
  localStorage.setItem("upvote_fingerprint", fp);
  return fp;
}
function IncidentsPage() {
  const [filter, setFilter] = reactExports.useState("all");
  const [upvotedIds, setUpvotedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const observerRef = reactExports.useRef(null);
  const loadMoreRef = reactExports.useRef(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["incidents", filter],
    queryFn: ({
      pageParam = 0
    }) => getIncidents({
      data: {
        type: filter === "all" ? void 0 : filter,
        limit: 20,
        offset: pageParam
      }
    }),
    getNextPageParam: (lastPage, allPages) => lastPage.length === 20 ? allPages.length * 20 : void 0,
    initialPageParam: 0
  });
  const incidents = data?.pages.flatMap((page) => page) ?? [];
  const upvoteMutation = useMutation({
    mutationFn: (incidentId) => upvoteIncident({
      data: {
        incidentId,
        fingerprint: getFingerprint()
      }
    }),
    onSuccess: (_result, incidentId) => {
      setUpvotedIds((prev) => new Set(prev).add(incidentId));
    }
  });
  reactExports.useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, {
      threshold: 0.1
    });
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const handleUpvote = (id) => {
    if (upvotedIds.has(id)) return;
    upvoteMutation.mutate(id);
  };
  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 6e4);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Incidents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-[var(--color-text-secondary)]", children: "Live feed of citizen-reported infrastructure issues." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/report", className: "inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md", children: "+ Report Issue" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex flex-wrap gap-2", children: [{
      key: "all",
      label: "All"
    }, {
      key: "power_cut",
      label: "⚡ Power"
    }, {
      key: "water_leak",
      label: "💧 Water"
    }, {
      key: "pothole",
      label: "🕳️ Potholes"
    }, {
      key: "street_light",
      label: "💡 Street Light"
    }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f.key), className: `rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${filter === f.key ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm" : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"}`, children: f.label }, f.key)) }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2.5 py-16 text-[var(--color-text-muted)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-5 w-5 animate-spin", viewBox: "0 0 24 24", fill: "none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Loading incidents..." })
    ] }),
    !isLoading && incidents.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "📋" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg font-semibold", children: "No incidents reported yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-[var(--color-text-muted)]", children: "Be the first to report an infrastructure issue in your area." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/report", className: "mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md", children: "Report Issue" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: incidents.map((incident) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-all duration-200 hover:border-[var(--color-text-muted)] hover:shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 text-2xl", children: typeIcons[incident.type] ?? "📋" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex h-2 w-2 rounded-full ${statusColors[incident.status] ?? "bg-[var(--color-text-muted)]"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: statusLabels[incident.status] ?? incident.status }),
          incident.neighborhood && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--color-text-muted)]", children: [
            "· ",
            incident.neighborhood
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--color-text-muted)]", children: [
            "· ",
            formatTime(incident.createdAt)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]", children: incident.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleUpvote(incident.id), disabled: upvotedIds.has(incident.id), className: `flex shrink-0 flex-col items-center gap-0.5 rounded-lg border px-3 py-2 transition-all duration-150 ${upvotedIds.has(incident.id) ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "▲" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: incident.upvotes })
      ] })
    ] }, incident.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: loadMoreRef, className: "py-8 text-center", children: [
      isFetchingNextPage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2.5 text-[var(--color-text-muted)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-4 w-4 animate-spin", viewBox: "0 0 24 24", fill: "none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Loading more incidents..." })
      ] }),
      !hasNextPage && incidents.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: "No more incidents to load." })
    ] })
  ] });
}
export {
  IncidentsPage as component
};
