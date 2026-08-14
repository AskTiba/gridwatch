import { describe, it, expect } from "vitest";
import { getZones, getZoneById, getZoneOutages } from "./zones";

describe("Zone server functions", () => {
  it("getZones is a server function", () => {
    expect(typeof getZones).toBe("function");
  });

  it("getZoneById is a server function", () => {
    expect(typeof getZoneById).toBe("function");
  });

  it("getZoneOutages is a server function", () => {
    expect(typeof getZoneOutages).toBe("function");
  });
});