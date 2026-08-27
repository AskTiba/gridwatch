import { c as createServerRpc, d as db, n as notificationSubscriptions } from "./index-C_1U71xJ.mjs";
import { c as createServerFn } from "./index.mjs";
import { w as webPush } from "../_libs/web-push.mjs";
import "../_libs/postgres.mjs";
import "../_libs/react.mjs";
import { a as and, e as eq } from "../_libs/drizzle-orm.mjs";
import "node:async_hooks";
import "node:stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "url";
import "../_libs/asn1.js.mjs";
import "../_libs/bn.js.mjs";
import "../_libs/inherits.mjs";
import "../_libs/safer-buffer.mjs";
import "buffer";
import "../_libs/minimalistic-assert.mjs";
import "../_libs/jws.mjs";
import "../_libs/safe-buffer.mjs";
import "../_libs/jwa.mjs";
import "../_libs/ecdsa-sig-formatter.mjs";
import "../_libs/buffer-equal-constant-time.mjs";
import "../_libs/http_ece.mjs";
import "https";
import "../_libs/https-proxy-agent.mjs";
import "assert";
import "net";
import "tls";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";
import "http";
import "fs";
import "perf_hooks";
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(process.env.VAPID_EMAIL || "mailto:admin@example.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}
const getVapidPublicKey_createServerFn_handler = createServerRpc({
  id: "82b59b3823b87568df34a504b1a95b25b1662489e19a70d2279348a9f3feba28",
  name: "getVapidPublicKey",
  filename: "src/functions/notifications.ts"
}, (opts) => getVapidPublicKey.__executeServer(opts));
const getVapidPublicKey = createServerFn({
  method: "GET"
}).handler(getVapidPublicKey_createServerFn_handler, () => {
  return process.env.VAPID_PUBLIC_KEY || "";
});
const subscribeToPush_createServerFn_handler = createServerRpc({
  id: "4042e41827982b57fae90695d7b5fe1931e6010b78379f3b5337a775a16ed2f4",
  name: "subscribeToPush",
  filename: "src/functions/notifications.ts"
}, (opts) => subscribeToPush.__executeServer(opts));
const subscribeToPush = createServerFn({
  method: "POST"
}).validator((input) => input).handler(subscribeToPush_createServerFn_handler, async ({
  data
}) => {
  const existing = await db.select().from(notificationSubscriptions).where(and(eq(notificationSubscriptions.zoneId, data.zoneId), eq(notificationSubscriptions.endpoint, data.endpoint))).limit(1);
  if (existing.length > 0) {
    await db.update(notificationSubscriptions).set({
      types: data.types,
      active: true
    }).where(eq(notificationSubscriptions.id, existing[0].id));
    return {
      success: true,
      action: "updated"
    };
  }
  await db.insert(notificationSubscriptions).values({
    zoneId: data.zoneId,
    endpoint: data.endpoint,
    p256dh: data.p256dh,
    auth: data.auth,
    types: data.types,
    active: true
  });
  return {
    success: true,
    action: "created"
  };
});
const unsubscribeFromPush_createServerFn_handler = createServerRpc({
  id: "2181be763741d7728f6fc1bfd6bfac33d2beec5ab22173aa4385a4523925c7f2",
  name: "unsubscribeFromPush",
  filename: "src/functions/notifications.ts"
}, (opts) => unsubscribeFromPush.__executeServer(opts));
const unsubscribeFromPush = createServerFn({
  method: "POST"
}).validator((input) => input).handler(unsubscribeFromPush_createServerFn_handler, async ({
  data
}) => {
  await db.update(notificationSubscriptions).set({
    active: false
  }).where(eq(notificationSubscriptions.endpoint, data.endpoint));
  return {
    success: true
  };
});
const sendZoneNotification_createServerFn_handler = createServerRpc({
  id: "64cfd77e03214800d3c6fda1ca70318d99ee1cc4dbaf02000ae64c448df9fefc",
  name: "sendZoneNotification",
  filename: "src/functions/notifications.ts"
}, (opts) => sendZoneNotification.__executeServer(opts));
const sendZoneNotification = createServerFn({
  method: "POST"
}).validator((input) => input).handler(sendZoneNotification_createServerFn_handler, async ({
  data
}) => {
  const subs = await db.select().from(notificationSubscriptions).where(and(eq(notificationSubscriptions.zoneId, data.zoneId), eq(notificationSubscriptions.active, true)));
  if (subs.length === 0) return {
    sent: 0
  };
  const payload = JSON.stringify({
    title: data.title,
    body: data.body,
    url: data.url || "/"
  });
  let sent = 0;
  for (const sub of subs) {
    try {
      await webPush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }, payload);
      sent++;
    } catch {
      await db.update(notificationSubscriptions).set({
        active: false
      }).where(eq(notificationSubscriptions.id, sub.id));
    }
  }
  return {
    sent
  };
});
export {
  getVapidPublicKey_createServerFn_handler,
  sendZoneNotification_createServerFn_handler,
  subscribeToPush_createServerFn_handler,
  unsubscribeFromPush_createServerFn_handler
};
