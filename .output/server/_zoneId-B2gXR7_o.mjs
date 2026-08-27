import { j as jsxRuntimeExports } from "./_libs/react.mjs";
import { L as Link } from "./_libs/tanstack__react-router.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "./_libs/isbot.mjs";
function ZoneNotFound() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[50vh] flex-col items-center justify-center px-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-6xl", children: "📍" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-2xl font-bold", children: "Zone Not Found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[var(--color-text-secondary)]", children: "The zone you're looking for doesn't exist or has been removed." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/zones", className: "mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md", children: "Browse All Zones" })
  ] });
}
export {
  ZoneNotFound as notFoundComponent
};
