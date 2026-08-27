globalThis.__nitro_main__ = import.meta.url;
import { N as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/drizzle.svg": {
    "type": "image/svg+xml",
    "etag": '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"',
    "mtime": "2026-08-13T21:51:41.624Z",
    "size": 0,
    "path": "../public/drizzle.svg"
  },
  "/favicon.svg": {
    "type": "image/svg+xml",
    "etag": '"c1-GDdWnHwF6yIAgBjRupqcX0w2fO0"',
    "mtime": "2026-08-27T19:08:24.353Z",
    "size": 193,
    "path": "../public/favicon.svg"
  },
  "/sw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"48e-659wGvEGxbsyntda+D0Btkz/lzU"',
    "mtime": "2026-08-27T19:08:24.355Z",
    "size": 1166,
    "path": "../public/sw.js"
  },
  "/assets/_zoneId-BsmSLCf_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"312-tS4l0YvA+fX5kxJAneiU94fhGCU"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 786,
    "path": "../public/assets/_zoneId-BsmSLCf_.js"
  },
  "/assets/_zoneId-CeMhnvQr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e5ea-QD93yOO4YJhmTx9WSfs4lippIcE"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 124394,
    "path": "../public/assets/_zoneId-CeMhnvQr.js"
  },
  "/assets/createServerFn-CUGlXVF2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"110f-uT2POpbFB3wsxAaWnEMC4/cFcDw"',
    "mtime": "2026-08-27T19:08:17.325Z",
    "size": 4367,
    "path": "../public/assets/createServerFn-CUGlXVF2.js"
  },
  "/assets/incidents-6w-4Je1g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"209-QrZqNJgsL8F+gJsL4DpMj/br+lE"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 521,
    "path": "../public/assets/incidents-6w-4Je1g.js"
  },
  "/assets/index-Bw_1JVVf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fa7-bQl3yvarzuCKM4El5rhs1xiaVUY"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 4007,
    "path": "../public/assets/index-Bw_1JVVf.js"
  },
  "/assets/index-CcaFBmAO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"20f0-cslC0vEVNgCBlEwhPTGA7wrgZPM"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 8432,
    "path": "../public/assets/index-CcaFBmAO.js"
  },
  "/assets/index-CwcapQTN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1dd1-qeJRWBupNJtQjQixwrgCoI8IGaE"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 7633,
    "path": "../public/assets/index-CwcapQTN.js"
  },
  "/assets/index-D6Dti-PZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"55e0a-Agcn5yaBfkCYk8XHLfvH7BUBGck"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 351754,
    "path": "../public/assets/index-D6Dti-PZ.js"
  },
  "/assets/index-DLiphyFX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d3-+0H5mwYhOM7XUKQ4sToNzaXuRuc"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 6611,
    "path": "../public/assets/index-DLiphyFX.js"
  },
  "/assets/index-ElNPSZP-.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"67ca-mG5DeT72offKSsnsDUEtLSOaky8"',
    "mtime": "2026-08-27T19:08:17.269Z",
    "size": 26570,
    "path": "../public/assets/index-ElNPSZP-.css"
  },
  "/assets/leaflet-src-BimTw-_p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2498d-d3H8N05Hkn9WpmnyA/8FZVHdXOs"',
    "mtime": "2026-08-27T19:08:17.325Z",
    "size": 149901,
    "path": "../public/assets/leaflet-src-BimTw-_p.js"
  },
  "/assets/useBaseQuery-emWpQIG5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2262-qwDM6+qKk3BWA+R+yb9nB4tLcqI"',
    "mtime": "2026-08-27T19:08:17.325Z",
    "size": 8802,
    "path": "../public/assets/useBaseQuery-emWpQIG5.js"
  },
  "/assets/useMutation-Bo3fBBQ4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"89b-p5Qr4zh+GUC5b6MOAEuiNv8tpSM"',
    "mtime": "2026-08-27T19:08:17.313Z",
    "size": 2203,
    "path": "../public/assets/useMutation-Bo3fBBQ4.js"
  },
  "/assets/useQuery-6JBW0nIB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"64-UZq3ft+N4032VCbpe8/IfGpimrY"',
    "mtime": "2026-08-27T19:08:17.325Z",
    "size": 100,
    "path": "../public/assets/useQuery-6JBW0nIB.js"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _jF4YeD = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_4Vw3Wq = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_4Vw3Wq };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_jF4YeD)
].filter(Boolean);
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    middleware.push(...h3App["~middleware"]);
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const tracingSrvxPlugins = [];
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch,
  plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
const nodeServer = {};
export {
  nodeServer as default
};
