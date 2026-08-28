import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { zones, outages, incidentReports } from "~/db/schema";
import { eq, and, desc, ilike, or, ne, sql } from "drizzle-orm";

export const getZones = createServerFn({ method: "GET" })
  .validator((input: { search?: string }) => input)
  .handler(async ({ data }) => {
    const { search } = data;

    if (search) {
      const pattern = `%${search}%`;
      return db
        .select()
        .from(zones)
        .where(
          or(
            ilike(zones.name, pattern),
            ilike(zones.neighborhood, pattern),
            ilike(zones.municipality, pattern),
            ilike(zones.postalCode, pattern)
          )
        )
        .orderBy(zones.name);
    }

    return db.select().from(zones).orderBy(zones.name);
  });

export const getZonesWithStats = createServerFn({ method: "GET" })
  .validator((input: { search?: string }) => input)
  .handler(async ({ data }) => {
    const { search } = data;

    const zonesList = search
      ? await db
          .select()
          .from(zones)
          .where(
            or(
              ilike(zones.name, `%${search}%`),
              ilike(zones.neighborhood, `%${search}%`),
              ilike(zones.municipality, `%${search}%`)
            )
          )
          .orderBy(zones.name)
      : await db.select().from(zones).orderBy(zones.name);

    const zonesWithStats = await Promise.all(
      zonesList.map(async (zone) => {
        const [outageResult, incidentResult] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(outages)
            .where(
              and(
                eq(outages.zoneId, zone.id),
                or(
                  eq(outages.status, "active"),
                  eq(outages.status, "scheduled")
                )
              )
            ),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(incidentReports)
            .where(
              and(
                eq(incidentReports.zoneId, zone.id),
                ne(incidentReports.status, "resolved")
              )
            ),
        ]);

        return {
          ...zone,
          activeOutages: outageResult[0]?.count ?? 0,
          openIncidents: incidentResult[0]?.count ?? 0,
        };
      })
    );

    return zonesWithStats;
  });

export const getZoneById = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const zone = await db
      .select()
      .from(zones)
      .where(eq(zones.id, data.id))
      .limit(1);

    return zone[0] ?? null;
  });

export const getZoneOutages = createServerFn({ method: "GET" })
  .validator((input: { zoneId: string }) => input)
  .handler(async ({ data }) => {
    const out = await db
      .select()
      .from(outages)
      .where(eq(outages.zoneId, data.zoneId))
      .orderBy(desc(outages.createdAt));

    return out;
  });