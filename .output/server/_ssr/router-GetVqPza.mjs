import { c as createRouter, a as createRootRoute, b as createFileRoute, l as lazyRouteComponent, O as Outlet, H as HeadContent, S as Scripts, L as Link } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
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
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1e3 * 60 * 5,
      gcTime: 1e3 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});
function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "system") {
    root.classList.add(getSystemTheme());
  } else {
    root.classList.add(theme);
  }
}
function ThemeToggle() {
  const [theme, setTheme] = reactExports.useState("system");
  reactExports.useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initial = saved ?? "system";
    setTheme(initial);
    applyTheme(initial);
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (localStorage.getItem("theme") === "system") {
        applyTheme("system");
      }
    };
    mq?.addEventListener("change", handler);
    return () => mq?.removeEventListener("change", handler);
  }, []);
  const cycle = () => {
    const order = ["system", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };
  const labels = {
    system: "System theme (follows OS setting)",
    light: "Light theme",
    dark: "Dark theme"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: cycle,
      className: "rounded-lg p-2 text-[var(--color-text-muted)] transition-all duration-150 hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]",
      "aria-label": labels[theme],
      title: labels[theme],
      children: [
        theme === "system" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            className: "h-5 w-5",
            fill: "none",
            viewBox: "0 0 24 24",
            strokeWidth: 2,
            stroke: "currentColor",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "20", height: "14", x: "2", y: "3", rx: "2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 21h8" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 17v4" })
            ]
          }
        ),
        theme === "light" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            className: "h-5 w-5",
            fill: "none",
            viewBox: "0 0 24 24",
            strokeWidth: 2,
            stroke: "currentColor",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2v2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 20v2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m4.93 4.93 1.41 1.41" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m17.66 17.66 1.41 1.41" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2 12h2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 12h2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m6.34 17.66-1.41 1.41" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m19.07 4.93-1.41 1.41" })
            ]
          }
        ),
        theme === "dark" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            className: "h-5 w-5",
            fill: "none",
            viewBox: "0 0 24 24",
            strokeWidth: 2,
            stroke: "currentColor",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" })
          }
        )
      ]
    }
  );
}
const navItems = [
  { to: "/", label: "Home" },
  { to: "/zones", label: "Zones" },
  { to: "/incidents", label: "Incidents" },
  { to: "/report", label: "Report" }
];
function Header() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--color-bg)]/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          className: "h-5 w-5 text-[var(--color-primary-foreground)]",
          fill: "none",
          viewBox: "0 0 24 24",
          strokeWidth: 2.5,
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13 2 3 14h9l-1 8 10-12h-9l1-8z" })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden text-[15px] font-semibold tracking-tight sm:inline", children: "GridWatch" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-0.5", children: [
      navItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: item.to,
          className: "rounded-lg px-3.5 py-2 text-[13px] font-medium text-[var(--color-text-muted)] transition-all duration-150 hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]",
          activeProps: {
            className: "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
          },
          children: item.label
        },
        item.to
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-1 h-5 w-px bg-[var(--color-border)]", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {})
    ] })
  ] }) });
}
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-8 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: "h-4 w-4 text-[var(--color-primary-foreground)]",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: 2.5,
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13 2 3 14h9l-1 8 10-12h-9l1-8z" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold tracking-tight", children: "GridWatch" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]", children: "Community-driven infrastructure monitoring for power, water, and municipal services." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]", children: "Navigation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2", children: [
          { to: "/zones", label: "Zones" },
          { to: "/incidents", label: "Incidents" },
          { to: "/report", label: "Report Issue" }
        ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: item.to,
            className: "text-sm text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-primary)]",
            children: item.label
          }
        ) }, item.to)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]", children: "About" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-[var(--color-text-secondary)]", children: "Open Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-[var(--color-text-secondary)]", children: "Built for Communities" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 border-t border-[var(--color-border)] pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-[var(--color-text-muted)]", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " GridWatch. Data is community-reported and may not reflect official status."
    ] }) })
  ] }) });
}
const Route$5 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content: "GridWatch — Community dashboard for real-time power outages, water leaks, and municipal infrastructure monitoring."
      },
      { title: "GridWatch — Municipal Utility Monitor" }
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg"
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      }
    ]
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage
});
function RootComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RootDocument, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) }) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("head", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);document.documentElement.classList.add(d?"dark":"light")}catch(e){}})()`
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { className: "bg-[var(--color-bg)] text-[var(--color-text)]", children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function NotFoundPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[50vh] flex-col items-center justify-center px-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-6xl", children: "🔍" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-3xl font-bold", children: "Page Not Found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[var(--color-text-secondary)]", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md",
        children: "Go Home"
      }
    )
  ] });
}
const $$splitComponentImporter$4 = () => import("./index-ISREuaRo.mjs");
const Route$4 = createFileRoute()({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./index-Cz4QA8z7.mjs");
const Route$3 = createFileRoute()({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./index-CLKKLj2K.mjs");
const Route$2 = createFileRoute()({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-CZyy2rXM.mjs");
const Route$1 = createFileRoute()({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitNotFoundComponentImporter = () => import("../_zoneId-B2gXR7_o.mjs");
const $$splitComponentImporter = () => import("../_zoneId-B5zuqIrV.mjs");
const Route = createFileRoute()({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const IndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const IncidentsIndexRoute = Route$3.update({
  id: "/incidents/",
  path: "/incidents/",
  getParentRoute: () => Route$5
});
const ReportIndexRoute = Route$2.update({
  id: "/report/",
  path: "/report/",
  getParentRoute: () => Route$5
});
const ZonesIndexRoute = Route$1.update({
  id: "/zones/",
  path: "/zones/",
  getParentRoute: () => Route$5
});
const ZonesZoneIdRoute = Route.update({
  id: "/zones/$zoneId",
  path: "/zones/$zoneId",
  getParentRoute: () => Route$5
});
const rootRouteChildren = {
  IndexRoute,
  ZonesZoneIdRoute,
  IncidentsIndexRoute,
  ReportIndexRoute,
  ZonesIndexRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent"
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r
};
