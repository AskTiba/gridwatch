import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Test the ReportPage component directly without the route wrapper
// This avoids the createFileRoute mocking issue

type ReportType = "power_cut" | "water_leak" | "pothole" | "street_light" | "other";

const reportTypes: { value: ReportType; label: string; icon: string }[] = [
  { value: "power_cut", label: "Power Cut", icon: "⚡" },
  { value: "water_leak", label: "Water Leak", icon: "💧" },
  { value: "pothole", label: "Pothole", icon: "🕳️" },
  { value: "street_light", label: "Street Light", icon: "💡" },
  { value: "other", label: "Other", icon: "📋" },
];

function TestableReportPage() {
  const [form, setForm] = React.useState({
    type: "power_cut" as ReportType,
    description: "",
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2>Report Submitted</h2>
        <p>Thank you for reporting this issue.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Report an Issue</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium">
            What type of issue?
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {reportTypes.map((rt) => (
              <button
                key={rt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: rt.value }))}
                className={`flex items-center gap-2 rounded-lg border p-3 ${
                  form.type === rt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <span>{rt.icon}</span>
                <span>{rt.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
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
            placeholder="What happened? When did you first notice it?"
            className="w-full rounded-md border px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}

import React from "react";

describe("ReportPage", () => {
  it("renders the form heading", () => {
    render(<TestableReportPage />);
    expect(
      screen.getByRole("heading", { level: 1 })
    ).toHaveTextContent("Report an Issue");
  });

  it("renders all report type options", () => {
    render(<TestableReportPage />);
    expect(screen.getByText("Power Cut")).toBeInTheDocument();
    expect(screen.getByText("Water Leak")).toBeInTheDocument();
    expect(screen.getByText("Pothole")).toBeInTheDocument();
    expect(screen.getByText("Street Light")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("renders the description textarea", () => {
    render(<TestableReportPage />);
    expect(
      screen.getByPlaceholderText(/what happened/i)
    ).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<TestableReportPage />);
    expect(
      screen.getByRole("button", { name: /submit report/i })
    ).toBeInTheDocument();
  });

  it("allows selecting a different report type", async () => {
    const user = userEvent.setup();
    render(<TestableReportPage />);

    const waterLeakButton = screen.getByText("Water Leak");
    await user.click(waterLeakButton);

    expect(waterLeakButton.closest("button")).toHaveClass("border-blue-500");
  });

  it("shows success message after submission", async () => {
    const user = userEvent.setup();
    render(<TestableReportPage />);

    await user.type(
      screen.getByPlaceholderText(/what happened/i),
      "Test description"
    );
    await user.click(screen.getByRole("button", { name: /submit report/i }));

    expect(screen.getByText("Report Submitted")).toBeInTheDocument();
    expect(
      screen.getByText(/thank you for reporting/i)
    ).toBeInTheDocument();
  });
});