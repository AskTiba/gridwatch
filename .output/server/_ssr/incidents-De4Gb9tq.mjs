import { c as createServerRpc, i as incidentReports, d as db, u as upvotes } from "./index-C_1U71xJ.mjs";
import { c as createServerFn } from "./index.mjs";
import { s as sendZoneNotification } from "./notifications-7-rv1UCP.mjs";
import "../_libs/postgres.mjs";
import "../_libs/react.mjs";
import "../_libs/web-push.mjs";
import { e as eq, a as and, d as desc, c as count } from "../_libs/drizzle-orm.mjs";
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
import "./createSsrRpc-C2cGivNr.mjs";
import "os";
import "fs";
import "net";
import "tls";
import "perf_hooks";
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
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";
import "http";
const getIncidents_createServerFn_handler = createServerRpc({
  id: "4c8661f3dcaa465cdfbada0002afa599af4d2fc3a6db7ea3d1c13dfa2e60c395",
  name: "getIncidents",
  filename: "src/functions/incidents.ts"
}, (opts) => getIncidents.__executeServer(opts));
const getIncidents = createServerFn({
  method: "GET"
}).validator((input) => input).handler(getIncidents_createServerFn_handler, async ({
  data
}) => {
  const {
    zoneId,
    type,
    limit = 20,
    offset = 0
  } = data;
  const conditions = [];
  if (zoneId) conditions.push(eq(incidentReports.zoneId, zoneId));
  if (type) conditions.push(eq(incidentReports.type, type));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const incidents = await db.select().from(incidentReports).where(where).orderBy(desc(incidentReports.createdAt)).limit(limit).offset(offset);
  return incidents;
});
const createIncidentReport_createServerFn_handler = createServerRpc({
  id: "139461d16f5a6a8bee8a86a56c8f4162cf2e1a03c99cf27149f5e9602a6befbb",
  name: "createIncidentReport",
  filename: "src/functions/incidents.ts"
}, (opts) => createIncidentReport.__executeServer(opts));
const createIncidentReport = createServerFn({
  method: "POST"
}).validator((input) => input).handler(createIncidentReport_createServerFn_handler, async ({
  data
}) => {
  const result = await db.insert(incidentReports).values({
    type: data.type,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    neighborhood: data.neighborhood,
    zoneId: data.zoneId,
    reporterName: data.reporterName,
    photos: data.photos,
    status: "open",
    upvotes: 0
  }).returning({
    id: incidentReports.id,
    zoneId: incidentReports.zoneId
  });
  const incident = result[0];
  if (incident.zoneId) {
    const typeLabels = {
      power_cut: "Power Cut",
      water_leak: "Water Leak",
      pothole: "Pothole",
      street_light: "Street Light",
      other: "Issue"
    };
    const label = typeLabels[data.type] || "Issue";
    sendZoneNotification({
      data: {
        zoneId: incident.zoneId,
        title: `New ${label} Reported`,
        body: data.description.slice(0, 100),
        url: `/zones/${incident.zoneId}`
      }
    }).catch(() => {
    });
  }
  return incident;
});
const upvoteIncident_createServerFn_handler = createServerRpc({
  id: "c476bfc769d26f0a412c12d4a446bc36dfee1ed7e1a06c8d9b9d980f8e01ec61",
  name: "upvoteIncident",
  filename: "src/functions/incidents.ts"
}, (opts) => upvoteIncident.__executeServer(opts));
const upvoteIncident = createServerFn({
  method: "POST"
}).validator((input) => input).handler(upvoteIncident_createServerFn_handler, async ({
  data
}) => {
  const {
    incidentId,
    fingerprint
  } = data;
  const existing = await db.select().from(upvotes).where(and(eq(upvotes.incidentId, incidentId), eq(upvotes.fingerprint, fingerprint))).limit(1);
  if (existing.length > 0) {
    return {
      success: false,
      reason: "already_upvoted"
    };
  }
  await db.insert(upvotes).values({
    incidentId,
    fingerprint
  });
  await db.update(incidentReports).set({
    upvotes: count(upvotes.id)
  }).where(eq(incidentReports.id, incidentId));
  return {
    success: true
  };
});
const getIncidentById_createServerFn_handler = createServerRpc({
  id: "02cbe41f5c1d7a560a4cfba9114ec7b322e924ddd23f081912168033518cd8f3",
  name: "getIncidentById",
  filename: "src/functions/incidents.ts"
}, (opts) => getIncidentById.__executeServer(opts));
const getIncidentById = createServerFn({
  method: "GET"
}).validator((input) => input).handler(getIncidentById_createServerFn_handler, async ({
  data
}) => {
  const incident = await db.select().from(incidentReports).where(eq(incidentReports.id, data.id)).limit(1);
  return incident[0] ?? null;
});
export {
  createIncidentReport_createServerFn_handler,
  getIncidentById_createServerFn_handler,
  getIncidents_createServerFn_handler,
  upvoteIncident_createServerFn_handler
};
