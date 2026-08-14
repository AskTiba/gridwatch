import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createIncidentReport } from "~/functions/incidents";

export const Route = createFileRoute("/report/")({
  component: ReportPage,
});

type ReportType = "power_cut" | "water_leak" | "pothole" | "street_light" | "other";

interface ReportForm {
  type: ReportType;
  description: string;
  latitude: string;
  longitude: string;
  neighborhood: string;
  reporterName: string;
}

const reportTypes: { value: ReportType; label: string; icon: string }[] = [
  { value: "power_cut", label: "Power Cut", icon: "⚡" },
  { value: "water_leak", label: "Water Leak", icon: "💧" },
  { value: "pothole", label: "Pothole", icon: "🕳️" },
  { value: "street_light", label: "Street Light", icon: "💡" },
  { value: "other", label: "Other", icon: "📋" },
];

function ReportPage() {
  const [form, setForm] = useState<ReportForm>({
    type: "power_cut",
    description: "",
    latitude: "",
    longitude: "",
    neighborhood: "",
    reporterName: "",
  });
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createIncidentReport({
        data: {
          type: form.type,
          description: form.description,
          latitude: form.latitude,
          longitude: form.longitude,
          neighborhood: form.neighborhood || undefined,
          reporterName: form.reporterName || undefined,
        },
      }),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocationStatus("success");
      },
      () => {
        setLocationStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      alert("Please capture your location first.");
      return;
    }
    mutation.mutate();
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 p-8">
          <span className="text-4xl">✅</span>
          <h2 className="mt-4 text-2xl font-bold">Report Submitted</h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Thank you for reporting this issue. Other citizens can now confirm
            and upvote your report to increase its visibility.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="/incidents"
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]"
            >
              View All Incidents
            </a>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  type: "power_cut",
                  description: "",
                  latitude: "",
                  longitude: "",
                  neighborhood: "",
                  reporterName: "",
                });
              }}
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)]"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Report an Issue</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Report infrastructure problems in your area. Your location helps others
          nearby confirm the issue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue Type */}
        <fieldset>
          <legend className="mb-3 text-sm font-medium">
            What type of issue?
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {reportTypes.map((rt) => (
              <button
                key={rt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: rt.value }))}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                  form.type === rt.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                }`}
              >
                <span className="text-lg">{rt.icon}</span>
                <span>{rt.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Describe the issue *
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="What happened? When did you first notice it? How severe is it?"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Location */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Location</legend>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between">
              <div>
                {form.latitude && form.longitude ? (
                  <p className="text-sm">
                    📍 {form.latitude}, {form.longitude}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    No location captured
                  </p>
                )}
                {locationStatus === "loading" && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Getting location...
                  </p>
                )}
                {locationStatus === "error" && (
                  <p className="text-xs text-[var(--color-danger)]">
                    Could not get location. Please enable location services.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={captureLocation}
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]"
              >
                {locationStatus === "success" ? "Update Location" : "Get My Location"}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="latitude"
                  className="mb-1 block text-xs text-[var(--color-text-muted)]"
                >
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="text"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, latitude: e.target.value }))
                  }
                  placeholder="-33.9249"
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label
                  htmlFor="longitude"
                  className="mb-1 block text-xs text-[var(--color-text-muted)]"
                >
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="text"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, longitude: e.target.value }))
                  }
                  placeholder="18.4241"
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="mt-3">
              <label
                htmlFor="neighborhood"
                className="mb-1 block text-xs text-[var(--color-text-muted)]"
              >
                Neighborhood (auto-filled from location)
              </label>
              <input
                id="neighborhood"
                type="text"
                value={form.neighborhood}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    neighborhood: e.target.value,
                  }))
                }
                placeholder="e.g. Downtown, Riverside"
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </fieldset>

        {/* Reporter Name (optional) */}
        <div>
          <label
            htmlFor="reporterName"
            className="mb-2 block text-sm font-medium"
          >
            Your name{" "}
            <span className="text-[var(--color-text-muted)]">(optional)</span>
          </label>
          <input
            id="reporterName"
            type="text"
            value={form.reporterName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, reporterName: e.target.value }))
            }
            placeholder="Anonymous"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {mutation.isPending ? "Submitting..." : "Submit Report"}
        </button>

        {mutation.isError && (
          <p className="text-center text-sm text-[var(--color-danger)]">
            Something went wrong. Please try again.
          </p>
        )}

        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Your report will be public. Other citizens can confirm and upvote it
          to increase visibility.
        </p>
      </form>
    </div>
  );
}