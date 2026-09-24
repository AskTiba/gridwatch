import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "~/db/schema";
import { incidentReports, upvotes } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { type Database } from "~/db";
import { upvoteIncidentCore } from "./incidents";

const connectionString = process.env.TEST_DATABASE_URL;

describe.skipIf(!connectionString)(
  "upvoteIncidentCore against real Postgres (requires TEST_DATABASE_URL)",
  () => {
    let db: Database;
    let client: ReturnType<typeof postgres>;

    beforeAll(async () => {
      client = postgres(connectionString!, { max: 1 });
      db = drizzle(client, { schema });
      await db.execute(sql`TRUNCATE upvotes, incident_reports`);
    });

    afterAll(async () => {
      await client.end();
    });

    it("increments the incident count exactly once and dedupes by fingerprint", async () => {
      const [incident] = await db
        .insert(incidentReports)
        .values({
          type: "pothole",
          description: "integration test pothole",
          latitude: "0.3",
          longitude: "32.5",
        })
        .returning({ id: incidentReports.id });

      expect(await upvoteIncidentCore(db, incident.id, "fp-1")).toEqual({
        success: true,
      });

      const afterFirst = await db
        .select({ upvotes: incidentReports.upvotes })
        .from(incidentReports)
        .where(eq(incidentReports.id, incident.id));
      expect(afterFirst[0].upvotes).toBe(1);

      expect(
        await upvoteIncidentCore(db, incident.id, "fp-1")
      ).toEqual({ success: false, reason: "already_upvoted" });

      const afterDuplicate = await db
        .select({ upvotes: incidentReports.upvotes })
        .from(incidentReports)
        .where(eq(incidentReports.id, incident.id));
      expect(afterDuplicate[0].upvotes).toBe(1);

      expect(await upvoteIncidentCore(db, incident.id, "fp-2")).toEqual({
        success: true,
      });

      const afterSecondUser = await db
        .select({ upvotes: incidentReports.upvotes })
        .from(incidentReports)
        .where(eq(incidentReports.id, incident.id));
      expect(afterSecondUser[0].upvotes).toBe(2);

      const voteRows = await db
        .select()
        .from(upvotes)
        .where(
          and(
            eq(upvotes.incidentId, incident.id),
            eq(upvotes.fingerprint, "fp-1")
          )
        );
      expect(voteRows).toHaveLength(1);
    });

    it("rolls back the inserted vote row if the count update fails", async () => {
      const [incident] = await db
        .insert(incidentReports)
        .values({
          type: "water_leak",
          description: "atomicity test leak",
          latitude: "0.31",
          longitude: "32.51",
        })
        .returning({ id: incidentReports.id });

      await db.execute(sql`CREATE OR REPLACE FUNCTION gw_fail_update()
        RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN RAISE EXCEPTION 'forced update failure'; END $$;`);
      await db.execute(sql`CREATE TRIGGER gw_fail_update_trg
        BEFORE UPDATE ON incident_reports
        FOR EACH ROW EXECUTE FUNCTION gw_fail_update();`);

      try {
        await expect(
          upvoteIncidentCore(db, incident.id, "fp-atomic")
        ).rejects.toThrow();
      } finally {
        await db.execute(
          sql`DROP TRIGGER IF EXISTS gw_fail_update_trg ON incident_reports;`
        );
        await db.execute(sql`DROP FUNCTION IF EXISTS gw_fail_update();`);
      }

      const orphanVotes = await db
        .select()
        .from(upvotes)
        .where(
          and(
            eq(upvotes.incidentId, incident.id),
            eq(upvotes.fingerprint, "fp-atomic")
          )
        );
      expect(orphanVotes).toHaveLength(0);

      const afterFailure = await db
        .select({ upvotes: incidentReports.upvotes })
        .from(incidentReports)
        .where(eq(incidentReports.id, incident.id));
      expect(afterFailure[0].upvotes).toBe(0);
    });
  }
);