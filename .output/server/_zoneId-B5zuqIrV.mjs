import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { L as Link } from "./_libs/tanstack__react-router.mjs";
import { b as useQuery, a as useMutation } from "./_libs/tanstack__react-query.mjs";
import { a as subscribeToPush, u as unsubscribeFromPush, g as getVapidPublicKey } from "./_ssr/notifications-7-rv1UCP.mjs";
import { R as Route } from "./_ssr/router-GetVqPza.mjs";
import "./_ssr/index.mjs";
import "./_libs/web-push.mjs";
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
import "./_libs/tanstack__query-core.mjs";
import "./_ssr/createSsrRpc-C2cGivNr.mjs";
import "node:async_hooks";
import "url";
import "./_libs/asn1.js.mjs";
import "./_libs/bn.js.mjs";
import "./_libs/inherits.mjs";
import "./_libs/safer-buffer.mjs";
import "buffer";
import "./_libs/minimalistic-assert.mjs";
import "./_libs/jws.mjs";
import "./_libs/safe-buffer.mjs";
import "./_libs/jwa.mjs";
import "./_libs/ecdsa-sig-formatter.mjs";
import "./_libs/buffer-equal-constant-time.mjs";
import "./_libs/http_ece.mjs";
import "https";
import "./_libs/https-proxy-agent.mjs";
import "assert";
import "net";
import "tls";
import "./_libs/debug.mjs";
import "./_libs/ms.mjs";
import "tty";
import "./_libs/supports-color.mjs";
import "os";
import "./_libs/has-flag.mjs";
import "./_libs/agent-base.mjs";
import "http";
function MapView({
  incidents,
  center = [-33.9249, 18.4241],
  zoom = 12,
  className
}) {
  const mapRef = reactExports.useRef(null);
  const mapInstanceRef = reactExports.useRef(null);
  const [isClient, setIsClient] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setIsClient(true);
  }, []);
  reactExports.useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;
    async function initMap() {
      const L = await import("./_libs/leaflet.mjs").then(function(n) {
        return n.l;
      });
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      if (cancelled || !mapRef.current) return;
      const map = L.map(mapRef.current, {
        center,
        zoom,
        scrollWheelZoom: false
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19
        }
      ).addTo(map);
      const markerIcon = L.divIcon({
        className: "incident-marker",
        html: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      incidents.forEach((incident) => {
        const marker = L.marker([incident.lat, incident.lng], {
          icon: markerIcon
        }).addTo(map);
        marker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <strong>${incident.type.replace("_", " ").toUpperCase()}</strong>
            <br/>
            ${incident.count} report${incident.count > 1 ? "s" : ""}
          </div>
        `);
      });
      mapInstanceRef.current = map;
    }
    initMap();
    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [isClient, incidents, center, zoom]);
  if (!isClient) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `flex items-center justify-center rounded-lg bg-[var(--color-surface)] ${className ?? ""}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: "Loading map..." })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, className: `rounded-lg ${className ?? ""}` });
}
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function usePushSubscription(zoneId) {
  const [isSupported, setIsSupported] = reactExports.useState(false);
  const [isSubscribed, setIsSubscribed] = reactExports.useState(false);
  const [permission, setPermission] = reactExports.useState("default");
  const { data: vapidKey } = useQuery({
    queryKey: ["vapidKey"],
    queryFn: () => getVapidPublicKey({ data: void 0 })
  });
  reactExports.useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!isSupported || !vapidKey) return;
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
      });
    });
  }, [isSupported, vapidKey]);
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!vapidKey) throw new Error("VAPID key not available");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
      const sub = subscription.toJSON();
      if (!sub.endpoint || !sub.keys) throw new Error("Invalid subscription");
      await subscribeToPush({
        data: {
          zoneId,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          types: ["power", "water"]
        }
      });
      return true;
    },
    onSuccess: () => {
      setIsSubscribed(true);
    }
  });
  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeFromPush({
          data: { endpoint: subscription.endpoint }
        });
      }
    },
    onSuccess: () => {
      setIsSubscribed(false);
    }
  });
  const requestPermission = reactExports.useCallback(async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);
  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    requestPermission,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending
  };
}
function ZoneDetailPage() {
  const {
    zoneId
  } = Route.useParams();
  const [activeTab, setActiveTab] = reactExports.useState("schedule");
  const push = usePushSubscription(zoneId);
  const handleSubscribe = async () => {
    if (push.permission === "default") {
      const result = await push.requestPermission();
      if (result !== "granted") return;
    }
    push.subscribe();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/zones", className: "text-sm text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-primary)]", children: "← Zones" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-2 text-3xl font-bold", children: [
          "Zone ",
          zoneId
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-[var(--color-text-secondary)]", children: "Grid schedule, active incidents, and area map." })
      ] }),
      push.isSupported && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSubscribe, disabled: push.isSubscribing || push.isSubscribed, className: `rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-150 ${push.isSubscribed ? "bg-[var(--color-success)] text-[var(--color-success-foreground)]" : "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] hover:shadow-md"} disabled:opacity-50`, children: push.isSubscribing ? "Subscribing..." : push.isSubscribed ? "🔔 Subscribed" : "🔔 Subscribe to Alerts" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex gap-1 border-b border-[var(--color-border)]", children: [{
      key: "schedule",
      label: "Grid Schedule"
    }, {
      key: "incidents",
      label: "Incidents"
    }, {
      key: "map",
      label: "Map View"
    }].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab(tab.key), className: `border-b-2 px-4 py-3 text-sm font-medium transition-all duration-150 ${activeTab === tab.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`, children: tab.label }, tab.key)) }),
    activeTab === "schedule" && /* @__PURE__ */ jsxRuntimeExports.jsx(GridSchedule, {}),
    activeTab === "incidents" && /* @__PURE__ */ jsxRuntimeExports.jsx(ZoneIncidents, {}),
    activeTab === "map" && /* @__PURE__ */ jsxRuntimeExports.jsx(ZoneMap, { zoneId })
  ] });
}
function GridSchedule() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({
    length: 24
  }, (_, i) => i);
  const scheduledOutages = [{
    day: 2,
    startHour: 8,
    endHour: 14,
    type: "power",
    reason: "Transformer maintenance — Ward 12"
  }, {
    day: 4,
    startHour: 10,
    endHour: 16,
    type: "water",
    reason: "Water main replacement — Oak Street"
  }, {
    day: 6,
    startHour: 6,
    endHour: 10,
    type: "power",
    reason: "Scheduled grid testing"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Weekly Grid Schedule" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-sm bg-[var(--color-primary)]" }),
          "Power"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-sm bg-[var(--color-warning)]" }),
          "Water"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[800px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-[var(--color-border)] bg-[var(--color-surface)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-medium text-[var(--color-text-muted)]", children: "Hour" }),
        days.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-center text-xs font-medium text-[var(--color-text-muted)]", children: day }, day))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: hours.map((hour) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-[var(--color-border)] last:border-b-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "whitespace-nowrap px-3 py-1.5 text-xs text-[var(--color-text-muted)]", children: [
          String(hour).padStart(2, "0"),
          ":00"
        ] }),
        days.map((_, dayIndex) => {
          const outage = scheduledOutages.find((o) => o.day === dayIndex && hour >= o.startHour && hour < o.endHour);
          return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-1 py-1 ${outage ? outage.type === "power" ? "bg-[var(--color-primary-subtle)]" : "bg-[var(--color-warning-subtle)]" : ""}`, children: outage && hour === outage.startHour && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `cursor-pointer rounded px-1 py-0.5 text-xs text-white ${outage.type === "power" ? "bg-[var(--color-primary)]" : "bg-[var(--color-warning)]"}`, title: outage.reason, children: [
            outage.type === "power" ? "⚡" : "💧",
            " ",
            outage.reason.slice(0, 20),
            "..."
          ] }) }, dayIndex);
        })
      ] }, hour)) })
    ] }) })
  ] });
}
function ZoneIncidents() {
  const incidents = [{
    id: "1",
    type: "power_cut",
    description: "Entire block without power since 3am",
    status: "confirmed",
    upvotes: 12,
    time: "2 hours ago"
  }, {
    id: "2",
    type: "water_leak",
    description: "Major water leak on corner of Main and 5th",
    status: "open",
    upvotes: 5,
    time: "45 minutes ago"
  }];
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
    resolved: "bg-[var(--color-success)]"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Reported Incidents" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/report", className: "inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md", children: "+ Report Issue" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: incidents.map((incident) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-all duration-200 hover:shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 text-2xl", children: typeIcons[incident.type] ?? "📋" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2 w-2 rounded-full ${statusColors[incident.status]}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium capitalize text-[var(--color-text-muted)]", children: incident.status.replace("_", " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--color-text-muted)]", children: [
            "· ",
            incident.time
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-[var(--color-text-secondary)]", children: incident.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex shrink-0 items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "▲" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: incident.upvotes })
      ] })
    ] }, incident.id)) })
  ] });
}
function ZoneMap(_props) {
  const mockClusters = [{
    id: "1",
    lat: -33.92,
    lng: 18.42,
    count: 3,
    type: "power_cut"
  }, {
    id: "2",
    lat: -33.93,
    lng: 18.43,
    count: 1,
    type: "water_leak"
  }, {
    id: "3",
    lat: -33.91,
    lng: 18.41,
    count: 2,
    type: "pothole"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Incident Map" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-[var(--color-text-muted)]", children: [
        mockClusters.length,
        " cluster",
        mockClusters.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MapView, { incidents: mockClusters, center: [-33.9249, 18.4241], zoom: 13, className: "h-[500px] rounded-xl shadow-sm" })
  ] });
}
export {
  ZoneDetailPage as component
};
