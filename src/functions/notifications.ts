import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { notificationSubscriptions } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import webPush from "web-push";

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const getVapidPublicKey = createServerFn({ method: "GET" }).handler(
  () => {
    return process.env.VAPID_PUBLIC_KEY || "";
  }
);

export const subscribeToPush = createServerFn({ method: "POST" })
  .validator(
    (input: {
      zoneId: string;
      endpoint: string;
      p256dh: string;
      auth: string;
      types: string[];
    }) => input
  )
  .handler(async ({ data }) => {
    // Check if already subscribed
    const existing = await db
      .select()
      .from(notificationSubscriptions)
      .where(
        and(
          eq(notificationSubscriptions.zoneId, data.zoneId),
          eq(notificationSubscriptions.endpoint, data.endpoint)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update types if already subscribed
      await db
        .update(notificationSubscriptions)
        .set({ types: data.types, active: true })
        .where(eq(notificationSubscriptions.id, existing[0].id));
      return { success: true, action: "updated" };
    }

    // Create new subscription
    await db.insert(notificationSubscriptions).values({
      zoneId: data.zoneId,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      types: data.types,
      active: true,
    });

    return { success: true, action: "created" };
  });

export const unsubscribeFromPush = createServerFn({ method: "POST" })
  .validator((input: { endpoint: string }) => input)
  .handler(async ({ data }) => {
    await db
      .update(notificationSubscriptions)
      .set({ active: false })
      .where(eq(notificationSubscriptions.endpoint, data.endpoint));

    return { success: true };
  });

export const sendZoneNotification = createServerFn({ method: "POST" })
  .validator(
    (input: {
      zoneId: string;
      title: string;
      body: string;
      url?: string;
    }) => input
  )
  .handler(async ({ data }) => {
    const subs = await db
      .select()
      .from(notificationSubscriptions)
      .where(
        and(
          eq(notificationSubscriptions.zoneId, data.zoneId),
          eq(notificationSubscriptions.active, true)
        )
      );

    if (subs.length === 0) return { sent: 0 };

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url || "/",
    });

    let sent = 0;
    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
      } catch {
        // Subscription expired or invalid — deactivate
        await db
          .update(notificationSubscriptions)
          .set({ active: false })
          .where(eq(notificationSubscriptions.id, sub.id));
      }
    }

    return { sent };
  });