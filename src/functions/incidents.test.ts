import { describe, it, expect } from "vitest";
import {
  getIncidents,
  createIncidentReport,
  upvoteIncident,
  getIncidentById,
} from "./incidents";

describe("Incident server functions", () => {
  it("getIncidents is a server function", () => {
    expect(typeof getIncidents).toBe("function");
  });

  it("createIncidentReport is a server function", () => {
    expect(typeof createIncidentReport).toBe("function");
  });

  it("upvoteIncident is a server function", () => {
    expect(typeof upvoteIncident).toBe("function");
  });

  it("getIncidentById is a server function", () => {
    expect(typeof getIncidentById).toBe("function");
  });
});