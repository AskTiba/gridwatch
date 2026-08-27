import { T as TSS_SERVER_FUNCTION } from "./index.mjs";
import { P as Postgres } from "../_libs/postgres.mjs";
import { p as pgTable, t as timestamp, b as text, u as uuid, i as integer, j as jsonb, f as boolean, g as drizzle, h as index } from "../_libs/drizzle-orm.mjs";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const zones = pgTable(
  "zones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    postalCode: text("postal_code"),
    neighborhood: text("neighborhood"),
    municipality: text("municipality"),
    // PostGIS geometry stored as text for Drizzle compatibility
    // Actual spatial queries use raw SQL with ST_GeomFromText
    geomWkt: text("geom_wkt"),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (t) => [index("zones_postal_code_idx").on(t.postalCode)]
);
const outages = pgTable(
  "outages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    zoneId: uuid("zone_id").notNull().references(() => zones.id),
    type: text("type").notNull(),
    // "power" | "water"
    status: text("status").notNull(),
    // "scheduled" | "active" | "resolved"
    scheduledStart: timestamp("scheduled_start"),
    scheduledEnd: timestamp("scheduled_end"),
    actualStart: timestamp("actual_start"),
    actualEnd: timestamp("actual_end"),
    reason: text("reason"),
    source: text("source").notNull().default("official"),
    // "official" | "citizen"
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (t) => [
    index("outages_zone_id_idx").on(t.zoneId),
    index("outages_status_idx").on(t.status),
    index("outages_type_idx").on(t.type)
  ]
);
const incidentReports = pgTable(
  "incident_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterName: text("reporter_name"),
    type: text("type").notNull(),
    // "power_cut" | "water_leak" | "pothole" | "street_light" | "other"
    description: text("description").notNull(),
    latitude: text("latitude").notNull(),
    longitude: text("longitude").notNull(),
    neighborhood: text("neighborhood"),
    zoneId: uuid("zone_id").references(() => zones.id),
    photos: jsonb("photos").$type(),
    // array of photo URLs
    status: text("status").notNull().default("open"),
    // "open" | "confirmed" | "in_progress" | "resolved" | "dismissed"
    upvotes: integer("upvotes").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (t) => [
    index("incident_reports_status_idx").on(t.status),
    index("incident_reports_type_idx").on(t.type),
    index("incident_reports_zone_id_idx").on(t.zoneId)
  ]
);
const upvotes = pgTable(
  "upvotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id").notNull().references(() => incidentReports.id),
    fingerprint: text("fingerprint").notNull(),
    // browser fingerprint for anonymous dedup
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (t) => [index("upvotes_incident_fingerprint_idx").on(t.incidentId, t.fingerprint)]
);
const notificationSubscriptions = pgTable(
  "notification_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    zoneId: uuid("zone_id").notNull().references(() => zones.id),
    endpoint: text("endpoint").notNull(),
    // push subscription endpoint
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    types: jsonb("types").$type().notNull(),
    // ["power", "water"]
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (t) => [index("notification_subs_zone_idx").on(t.zoneId)]
);
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  incidentReports,
  notificationSubscriptions,
  outages,
  upvotes,
  zones
}, Symbol.toStringTag, { value: "Module" }));
const connectionString = process.env.DATABASE_URL;
const client = Postgres(connectionString);
const db = drizzle(client, { schema });
export {
  createServerRpc as c,
  db as d,
  incidentReports as i,
  notificationSubscriptions as n,
  outages as o,
  upvotes as u,
  zones as z
};
