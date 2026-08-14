import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { zones, outages } from "~/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const getZones = createServerFn({ method: "GET" })
  .validator((input: { search?: string; postalCode?: string; neighborhood?: string }) => input)
  .handler(async ({ data }) => {
    const { search, postalCode, neighborhood } = data;

    const conditions = [];
    if (postalCode) conditions.push(eq(zones.postalCode, postalCode));
    if (neighborhood) conditions.push(eq(zones.neighborhood, neighborhood));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(zones)
      .where(where)
      .orderBy(zones.name);

    // If search is provided, do simple text match
    if (search) {
      return results.filter(
        (z) =>
          z.name.toLowerCase().includes(search.toLowerCase()) ||
          z.neighborhood?.toLowerCase().includes(search.toLowerCase()) ||
          z.postalCode?.includes(search)
      );
    }

    return results;
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