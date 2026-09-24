import { describe, it, expect } from "vitest";
import {
  getIncidents,
  createIncidentReport,
  upvoteIncident,
  getIncidentById,
  upvoteCountSql,
} from "./incidents";
import { PgDialect } from "drizzle-orm/pg-core";

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

describe("upvote count update", () => {
  it("sets the incident upvotes column with an atomic increment, not an aggregate", () => {
    const { sql } = new PgDialect().sqlToQuery(upvoteCountSql);

    expect(sql).toContain("+ 1");
    expect(sql).not.toContain("count(");
  });
});