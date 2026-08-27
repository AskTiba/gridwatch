import { c as createServerRpc, z as zones, d as db, o as outages } from "./index-C_1U71xJ.mjs";
import { c as createServerFn } from "./index.mjs";
import "../_libs/postgres.mjs";
import "../_libs/react.mjs";
import { e as eq, a as and, d as desc } from "../_libs/drizzle-orm.mjs";
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
import "os";
import "fs";
import "net";
import "tls";
import "perf_hooks";
const getZones_createServerFn_handler = createServerRpc({
  id: "cd9f884e84fd847fa05ca938f18787c99a92b2d32446db736d2fb6a6ca00fd58",
  name: "getZones",
  filename: "src/functions/zones.ts"
}, (opts) => getZones.__executeServer(opts));
const getZones = createServerFn({
  method: "GET"
}).validator((input) => input).handler(getZones_createServerFn_handler, async ({
  data
}) => {
  const {
    search,
    postalCode,
    neighborhood
  } = data;
  const conditions = [];
  if (postalCode) conditions.push(eq(zones.postalCode, postalCode));
  if (neighborhood) conditions.push(eq(zones.neighborhood, neighborhood));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const results = await db.select().from(zones).where(where).orderBy(zones.name);
  if (search) {
    return results.filter((z) => z.name.toLowerCase().includes(search.toLowerCase()) || z.neighborhood?.toLowerCase().includes(search.toLowerCase()) || z.postalCode?.includes(search));
  }
  return results;
});
const getZoneById_createServerFn_handler = createServerRpc({
  id: "4b4b4e86078dbaec32896196c374fed4f37d4db9f0b3684dac0c05b1033f1eab",
  name: "getZoneById",
  filename: "src/functions/zones.ts"
}, (opts) => getZoneById.__executeServer(opts));
const getZoneById = createServerFn({
  method: "GET"
}).validator((input) => input).handler(getZoneById_createServerFn_handler, async ({
  data
}) => {
  const zone = await db.select().from(zones).where(eq(zones.id, data.id)).limit(1);
  return zone[0] ?? null;
});
const getZoneOutages_createServerFn_handler = createServerRpc({
  id: "2bbc8df4e60ebed917af9e6065df8b65d441a49755d61c521bae48bcbd3a6334",
  name: "getZoneOutages",
  filename: "src/functions/zones.ts"
}, (opts) => getZoneOutages.__executeServer(opts));
const getZoneOutages = createServerFn({
  method: "GET"
}).validator((input) => input).handler(getZoneOutages_createServerFn_handler, async ({
  data
}) => {
  const out = await db.select().from(outages).where(eq(outages.zoneId, data.zoneId)).orderBy(desc(outages.createdAt));
  return out;
});
export {
  getZoneById_createServerFn_handler,
  getZoneOutages_createServerFn_handler,
  getZones_createServerFn_handler
};
