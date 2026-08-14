import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { incidentReports, upvotes } from "~/db/schema";
import { eq, and, desc, count as drizzleCount } from "drizzle-orm";

export const getIncidents = createServerFn({ method: "GET" })
  .validator((input: { zoneId?: string; type?: string; limit?: number; offset?: number }) => input)
  .handler(async ({ data }) => {
    const { zoneId, type, limit = 20, offset = 0 } = data;

    const conditions = [];
    if (zoneId) conditions.push(eq(incidentReports.zoneId, zoneId));
    if (type) conditions.push(eq(incidentReports.type, type));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const incidents = await db
      .select()
      .from(incidentReports)
      .where(where)
      .orderBy(desc(incidentReports.createdAt))
      .limit(limit)
      .offset(offset);

    return incidents;
  });

export const createIncidentReport = createServerFn({ method: "POST" })
  .validator(
    (input: {
      type: string;
      description: string;
      latitude: string;
      longitude: string;
      neighborhood?: string;
      zoneId?: string;
      reporterName?: string;
      photos?: string[];
    }) => input
  )
  .handler(async ({ data }) => {
    const result = await db
      .insert(incidentReports)
      .values({
        type: data.type,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        neighborhood: data.neighborhood,
        zoneId: data.zoneId,
        reporterName: data.reporterName,
        photos: data.photos,
        status: "open",
        upvotes: 0,
      })
      .returning({ id: incidentReports.id });

    return result[0];
  });

export const upvoteIncident = createServerFn({ method: "POST" })
  .validator((input: { incidentId: string; fingerprint: string }) => input)
  .handler(async ({ data }) => {
    const { incidentId, fingerprint } = data;

    // Check if already upvoted
    const existing = await db
      .select()
      .from(upvotes)
      .where(
        and(
          eq(upvotes.incidentId, incidentId),
          eq(upvotes.fingerprint, fingerprint)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, reason: "already_upvoted" };
    }

    // Create upvote
    await db.insert(upvotes).values({ incidentId, fingerprint });

    // Increment count on incident
    await db
      .update(incidentReports)
      .set({ upvotes: drizzleCount(upvotes.id) })
      .where(eq(incidentReports.id, incidentId));

    return { success: true };
  });

export const getIncidentById = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const incident = await db
      .select()
      .from(incidentReports)
      .where(eq(incidentReports.id, data.id))
      .limit(1);

    return incident[0] ?? null;
  });