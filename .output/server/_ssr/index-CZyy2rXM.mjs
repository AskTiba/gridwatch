import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as createSsrRpc } from "./createSsrRpc-C2cGivNr.mjs";
import { c as createServerFn } from "./index.mjs";
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
import "node:async_hooks";
const getZones = createServerFn({
  method: "GET"
}).validator((input) => input).handler(createSsrRpc("cd9f884e84fd847fa05ca938f18787c99a92b2d32446db736d2fb6a6ca00fd58"));
createServerFn({
  method: "GET"
}).validator((input) => input).handler(createSsrRpc("4b4b4e86078dbaec32896196c374fed4f37d4db9f0b3684dac0c05b1033f1eab"));
createServerFn({
  method: "GET"
}).validator((input) => input).handler(createSsrRpc("2bbc8df4e60ebed917af9e6065df8b65d441a49755d61c521bae48bcbd3a6334"));
function ZonesPage() {
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [searchType, setSearchType] = reactExports.useState("all");
  const {
    data: zones = [],
    isLoading
  } = useQuery({
    queryKey: ["zones", searchQuery, searchType],
    queryFn: () => getZones({
      data: {
        search: searchType === "all" ? searchQuery : void 0,
        postalCode: searchType === "postal" ? searchQuery : void 0,
        neighborhood: searchType === "neighborhood" ? searchQuery : void 0
      }
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Find Your Zone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[var(--color-text-secondary)]", children: "Look up your area by postal code, neighborhood, or browse all zones." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5", children: [{
        key: "all",
        label: "All"
      }, {
        key: "postal",
        label: "Postal Code"
      }, {
        key: "neighborhood",
        label: "Neighborhood"
      }].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSearchType(tab.key), className: `rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${searchType === tab.key ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm" : "text-[var(--color-text-muted)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]"}`, children: tab.label }, tab.key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: searchType === "postal" ? "Enter postal code..." : searchType === "neighborhood" ? "Enter neighborhood name..." : "Search zones...", className: "flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" })
    ] }) }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2.5 py-16 text-[var(--color-text-muted)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-5 w-5 animate-spin", viewBox: "0 0 24 24", fill: "none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Loading zones..." })
    ] }),
    !isLoading && zones.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "📍" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg font-semibold", children: "No zones found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-[var(--color-text-muted)]", children: searchQuery ? `No zones match "${searchQuery}"` : "No zones have been configured yet." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: zones.map((zone) => /* @__PURE__ */ jsxRuntimeExports.jsx(ZoneCard, { id: zone.id, name: zone.name, neighborhood: zone.neighborhood, postalCode: zone.postalCode }, zone.id)) })
  ] });
}
function ZoneCard({
  id,
  name,
  neighborhood,
  postalCode
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/zones/${id}`, params: {
    zoneId: id
  }, className: "group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-[var(--color-text-secondary)]", children: [
        neighborhood ?? "Unknown neighborhood",
        postalCode && ` · ${postalCode}`
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-[var(--color-success)] shadow-sm shadow-[var(--color-success)]/30" })
  ] }) });
}
export {
  ZonesPage as component
};
