import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as createIncidentReport } from "./incidents-BPkmIAwf.mjs";
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
const reportTypes = [{
  value: "power_cut",
  label: "Power Cut",
  icon: "⚡"
}, {
  value: "water_leak",
  label: "Water Leak",
  icon: "💧"
}, {
  value: "pothole",
  label: "Pothole",
  icon: "🕳️"
}, {
  value: "street_light",
  label: "Street Light",
  icon: "💡"
}, {
  value: "other",
  label: "Other",
  icon: "📋"
}];
function ReportPage() {
  const [form, setForm] = reactExports.useState({
    type: "power_cut",
    description: "",
    latitude: "",
    longitude: "",
    neighborhood: "",
    reporterName: ""
  });
  const [locationStatus, setLocationStatus] = reactExports.useState("idle");
  const [submitted, setSubmitted] = reactExports.useState(false);
  const mutation = useMutation({
    mutationFn: () => createIncidentReport({
      data: {
        type: form.type,
        description: form.description,
        latitude: form.latitude,
        longitude: form.longitude,
        neighborhood: form.neighborhood || void 0,
        reporterName: form.reporterName || void 0
      }
    }),
    onSuccess: () => {
      setSubmitted(true);
    }
  });
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition((position) => {
      setForm((prev) => ({
        ...prev,
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6)
      }));
      setLocationStatus("success");
    }, () => {
      setLocationStatus("error");
    }, {
      enableHighAccuracy: true,
      timeout: 1e4
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      alert("Please capture your location first.");
      return;
    }
    mutation.mutate();
  };
  if (submitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-subtle)] p-10 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "✅" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-2xl font-bold", children: "Report Submitted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-md text-[var(--color-text-secondary)]", children: "Thank you for reporting this issue. Other citizens can now confirm and upvote your report to increase its visibility." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/incidents", className: "inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md", children: "View All Incidents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setSubmitted(false);
          setForm({
            type: "power_cut",
            description: "",
            latitude: "",
            longitude: "",
            neighborhood: "",
            reporterName: ""
          });
        }, className: "inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-[var(--color-surface-elevated)]", children: "Submit Another" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Report an Issue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[var(--color-text-secondary)]", children: "Report infrastructure problems in your area. Your location helps others nearby confirm the issue." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "mb-3 text-sm font-medium", children: "What type of issue?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3", children: reportTypes.map((rt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setForm((prev) => ({
          ...prev,
          type: rt.value
        })), className: `flex items-center gap-2.5 rounded-xl border p-3.5 text-left text-sm transition-all duration-150 ${form.type === rt.value ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shadow-sm" : "border-[var(--color-border)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: rt.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: rt.label })
        ] }, rt.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "description", className: "mb-2 block text-sm font-medium", children: "Describe the issue *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { id: "description", required: true, rows: 4, value: form.description, onChange: (e) => setForm((prev) => ({
          ...prev,
          description: e.target.value
        })), placeholder: "What happened? When did you first notice it? How severe is it?", className: "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "mb-2 text-sm font-medium", children: "Location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              form.latitude && form.longitude ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
                "📍 ",
                form.latitude,
                ", ",
                form.longitude
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: "No location captured" }),
              locationStatus === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-[var(--color-text-muted)]", children: "Getting location..." }),
              locationStatus === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-[var(--color-danger)]", children: "Could not get location. Please enable location services." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: captureLocation, className: "rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md", children: locationStatus === "success" ? "Update Location" : "Get My Location" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "latitude", className: "mb-1 block text-xs font-medium text-[var(--color-text-muted)]", children: "Latitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "latitude", type: "text", value: form.latitude, onChange: (e) => setForm((prev) => ({
                ...prev,
                latitude: e.target.value
              })), placeholder: "-33.9249", className: "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "longitude", className: "mb-1 block text-xs font-medium text-[var(--color-text-muted)]", children: "Longitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "longitude", type: "text", value: form.longitude, onChange: (e) => setForm((prev) => ({
                ...prev,
                longitude: e.target.value
              })), placeholder: "18.4241", className: "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "neighborhood", className: "mb-1 block text-xs font-medium text-[var(--color-text-muted)]", children: "Neighborhood (auto-filled from location)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "neighborhood", type: "text", value: form.neighborhood, onChange: (e) => setForm((prev) => ({
              ...prev,
              neighborhood: e.target.value
            })), placeholder: "e.g. Downtown, Riverside", className: "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "reporterName", className: "mb-2 block text-sm font-medium", children: [
          "Your name",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--color-text-muted)]", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "reporterName", type: "text", value: form.reporterName, onChange: (e) => setForm((prev) => ({
          ...prev,
          reporterName: e.target.value
        })), placeholder: "Anonymous", className: "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: mutation.isPending, className: "w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] hover:shadow-md disabled:opacity-50", children: mutation.isPending ? "Submitting..." : "Submit Report" }),
      mutation.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-[var(--color-danger)]", children: "Something went wrong. Please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-[var(--color-text-muted)]", children: "Your report will be public. Other citizens can confirm and upvote it to increase visibility." })
    ] })
  ] });
}
export {
  ReportPage as component
};
