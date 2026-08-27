import require$$3 from "url";
import { g as getDefaultExportFromCjs } from "./react.mjs";
import crypto from "crypto";
import { r as requireAsn1 } from "./asn1.js.mjs";
import { r as requireJws } from "./jws.mjs";
import { r as requireEce } from "./http_ece.mjs";
import require$$1 from "https";
import require$$5 from "util";
import { r as requireDist } from "./https-proxy-agent.mjs";
var webPushConstants;
var hasRequiredWebPushConstants;
function requireWebPushConstants() {
  if (hasRequiredWebPushConstants) return webPushConstants;
  hasRequiredWebPushConstants = 1;
  const WebPushConstants = {};
  WebPushConstants.supportedContentEncodings = {
    AES_GCM: "aesgcm",
    AES_128_GCM: "aes128gcm"
  };
  WebPushConstants.supportedUrgency = {
    VERY_LOW: "very-low",
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high"
  };
  webPushConstants = WebPushConstants;
  return webPushConstants;
}
var urlsafeBase64Helper;
var hasRequiredUrlsafeBase64Helper;
function requireUrlsafeBase64Helper() {
  if (hasRequiredUrlsafeBase64Helper) return urlsafeBase64Helper;
  hasRequiredUrlsafeBase64Helper = 1;
  function validate(base64) {
    return /^[A-Za-z0-9\-_]+$/.test(base64);
  }
  urlsafeBase64Helper = {
    validate
  };
  return urlsafeBase64Helper;
}
var vapidHelper;
var hasRequiredVapidHelper;
function requireVapidHelper() {
  if (hasRequiredVapidHelper) return vapidHelper;
  hasRequiredVapidHelper = 1;
  const crypto$1 = crypto;
  const asn1 = requireAsn1();
  const jws = requireJws();
  const { URL } = require$$3;
  const WebPushConstants = requireWebPushConstants();
  const urlBase64Helper = requireUrlsafeBase64Helper();
  const DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;
  const MAX_EXPIRATION_SECONDS = 24 * 60 * 60;
  const ECPrivateKeyASN = asn1.define("ECPrivateKey", function() {
    this.seq().obj(
      this.key("version").int(),
      this.key("privateKey").octstr(),
      this.key("parameters").explicit(0).objid().optional(),
      this.key("publicKey").explicit(1).bitstr().optional()
    );
  });
  function toPEM(key) {
    return ECPrivateKeyASN.encode({
      version: 1,
      privateKey: key,
      parameters: [1, 2, 840, 10045, 3, 1, 7]
      // prime256v1
    }, "pem", {
      label: "EC PRIVATE KEY"
    });
  }
  function generateVAPIDKeys() {
    const curve = crypto$1.createECDH("prime256v1");
    curve.generateKeys();
    let publicKeyBuffer = curve.getPublicKey();
    let privateKeyBuffer = curve.getPrivateKey();
    if (privateKeyBuffer.length < 32) {
      const padding = Buffer.alloc(32 - privateKeyBuffer.length);
      padding.fill(0);
      privateKeyBuffer = Buffer.concat([padding, privateKeyBuffer]);
    }
    if (publicKeyBuffer.length < 65) {
      const padding = Buffer.alloc(65 - publicKeyBuffer.length);
      padding.fill(0);
      publicKeyBuffer = Buffer.concat([padding, publicKeyBuffer]);
    }
    return {
      publicKey: publicKeyBuffer.toString("base64url"),
      privateKey: privateKeyBuffer.toString("base64url")
    };
  }
  function validateSubject(subject) {
    if (!subject) {
      throw new Error("No subject set in vapidDetails.subject.");
    }
    if (typeof subject !== "string" || subject.length === 0) {
      throw new Error("The subject value must be a string containing an https: URL or mailto: address. " + subject);
    }
    let subjectParseResult = null;
    try {
      subjectParseResult = new URL(subject);
    } catch (err) {
      throw new Error("Vapid subject is not a valid URL. " + subject);
    }
    if (!["https:", "mailto:"].includes(subjectParseResult.protocol)) {
      throw new Error("Vapid subject is not an https: or mailto: URL. " + subject);
    }
    if (subjectParseResult.hostname === "localhost") {
      console.warn("Vapid subject points to a localhost web URI, which is unsupported by Apple's push notification server and will result in a BadJwtToken error when sending notifications.");
    }
  }
  function validatePublicKey(publicKey) {
    if (!publicKey) {
      throw new Error("No key set vapidDetails.publicKey");
    }
    if (typeof publicKey !== "string") {
      throw new Error("Vapid public key is must be a URL safe Base 64 encoded string.");
    }
    if (!urlBase64Helper.validate(publicKey)) {
      throw new Error('Vapid public key must be a URL safe Base 64 (without "=")');
    }
    publicKey = Buffer.from(publicKey, "base64url");
    if (publicKey.length !== 65) {
      throw new Error("Vapid public key should be 65 bytes long when decoded.");
    }
  }
  function validatePrivateKey(privateKey) {
    if (!privateKey) {
      throw new Error("No key set in vapidDetails.privateKey");
    }
    if (typeof privateKey !== "string") {
      throw new Error("Vapid private key must be a URL safe Base 64 encoded string.");
    }
    if (!urlBase64Helper.validate(privateKey)) {
      throw new Error('Vapid private key must be a URL safe Base 64 (without "=")');
    }
    privateKey = Buffer.from(privateKey, "base64url");
    if (privateKey.length !== 32) {
      throw new Error("Vapid private key should be 32 bytes long when decoded.");
    }
  }
  function getFutureExpirationTimestamp(numSeconds) {
    const futureExp = /* @__PURE__ */ new Date();
    futureExp.setSeconds(futureExp.getSeconds() + numSeconds);
    return Math.floor(futureExp.getTime() / 1e3);
  }
  function validateExpiration(expiration) {
    if (!Number.isInteger(expiration)) {
      throw new Error("`expiration` value must be a number");
    }
    if (expiration < 0) {
      throw new Error("`expiration` must be a positive integer");
    }
    const maxExpirationTimestamp = getFutureExpirationTimestamp(MAX_EXPIRATION_SECONDS);
    if (expiration >= maxExpirationTimestamp) {
      throw new Error("`expiration` value is greater than maximum of 24 hours");
    }
  }
  function getVapidHeaders(audience, subject, publicKey, privateKey, contentEncoding, expiration) {
    if (!audience) {
      throw new Error("No audience could be generated for VAPID.");
    }
    if (typeof audience !== "string" || audience.length === 0) {
      throw new Error("The audience value must be a string containing the origin of a push service. " + audience);
    }
    try {
      new URL(audience);
    } catch (err) {
      throw new Error("VAPID audience is not a url. " + audience);
    }
    validateSubject(subject);
    validatePublicKey(publicKey);
    validatePrivateKey(privateKey);
    privateKey = Buffer.from(privateKey, "base64url");
    if (expiration) {
      validateExpiration(expiration);
    } else {
      expiration = getFutureExpirationTimestamp(DEFAULT_EXPIRATION_SECONDS);
    }
    const header = {
      typ: "JWT",
      alg: "ES256"
    };
    const jwtPayload = {
      aud: audience,
      exp: expiration,
      sub: subject
    };
    const jwt = jws.sign({
      header,
      payload: jwtPayload,
      privateKey: toPEM(privateKey)
    });
    if (contentEncoding === WebPushConstants.supportedContentEncodings.AES_128_GCM) {
      return {
        Authorization: "vapid t=" + jwt + ", k=" + publicKey
      };
    }
    if (contentEncoding === WebPushConstants.supportedContentEncodings.AES_GCM) {
      return {
        Authorization: "WebPush " + jwt,
        "Crypto-Key": "p256ecdsa=" + publicKey
      };
    }
    throw new Error("Unsupported encoding type specified.");
  }
  vapidHelper = {
    generateVAPIDKeys,
    getFutureExpirationTimestamp,
    getVapidHeaders,
    validateSubject,
    validatePublicKey,
    validatePrivateKey,
    validateExpiration
  };
  return vapidHelper;
}
var encryptionHelper;
var hasRequiredEncryptionHelper;
function requireEncryptionHelper() {
  if (hasRequiredEncryptionHelper) return encryptionHelper;
  hasRequiredEncryptionHelper = 1;
  const crypto$1 = crypto;
  const ece = requireEce();
  const encrypt = function(userPublicKey, userAuth, payload, contentEncoding) {
    if (!userPublicKey) {
      throw new Error("No user public key provided for encryption.");
    }
    if (typeof userPublicKey !== "string") {
      throw new Error("The subscription p256dh value must be a string.");
    }
    if (Buffer.from(userPublicKey, "base64url").length !== 65) {
      throw new Error("The subscription p256dh value should be 65 bytes long.");
    }
    if (!userAuth) {
      throw new Error("No user auth provided for encryption.");
    }
    if (typeof userAuth !== "string") {
      throw new Error("The subscription auth key must be a string.");
    }
    if (Buffer.from(userAuth, "base64url").length < 16) {
      throw new Error("The subscription auth key should be at least 16 bytes long");
    }
    if (typeof payload !== "string" && !Buffer.isBuffer(payload)) {
      throw new Error("Payload must be either a string or a Node Buffer.");
    }
    if (typeof payload === "string" || payload instanceof String) {
      payload = Buffer.from(payload);
    }
    const localCurve = crypto$1.createECDH("prime256v1");
    const localPublicKey = localCurve.generateKeys();
    const salt = crypto$1.randomBytes(16).toString("base64url");
    const cipherText = ece.encrypt(payload, {
      version: contentEncoding,
      dh: userPublicKey,
      privateKey: localCurve,
      salt,
      authSecret: userAuth
    });
    return {
      localPublicKey,
      salt,
      cipherText
    };
  };
  encryptionHelper = {
    encrypt
  };
  return encryptionHelper;
}
var webPushError;
var hasRequiredWebPushError;
function requireWebPushError() {
  if (hasRequiredWebPushError) return webPushError;
  hasRequiredWebPushError = 1;
  function WebPushError(message, statusCode, headers, body, endpoint) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
    this.endpoint = endpoint;
  }
  require$$5.inherits(WebPushError, Error);
  webPushError = WebPushError;
  return webPushError;
}
var webPushLib;
var hasRequiredWebPushLib;
function requireWebPushLib() {
  if (hasRequiredWebPushLib) return webPushLib;
  hasRequiredWebPushLib = 1;
  const url = require$$3;
  const https = require$$1;
  const WebPushError = requireWebPushError();
  const vapidHelper2 = requireVapidHelper();
  const encryptionHelper2 = requireEncryptionHelper();
  const webPushConstants2 = requireWebPushConstants();
  const urlBase64Helper = requireUrlsafeBase64Helper();
  const DEFAULT_TTL = 2419200;
  let gcmAPIKey = "";
  let vapidDetails;
  function WebPushLib() {
  }
  WebPushLib.prototype.setGCMAPIKey = function(apiKey) {
    if (apiKey === null) {
      gcmAPIKey = null;
      return;
    }
    if (typeof apiKey === "undefined" || typeof apiKey !== "string" || apiKey.length === 0) {
      throw new Error("The GCM API Key should be a non-empty string or null.");
    }
    gcmAPIKey = apiKey;
  };
  WebPushLib.prototype.setVapidDetails = function(subject, publicKey, privateKey) {
    if (arguments.length === 1 && arguments[0] === null) {
      vapidDetails = null;
      return;
    }
    vapidHelper2.validateSubject(subject);
    vapidHelper2.validatePublicKey(publicKey);
    vapidHelper2.validatePrivateKey(privateKey);
    vapidDetails = {
      subject,
      publicKey,
      privateKey
    };
  };
  WebPushLib.prototype.generateRequestDetails = function(subscription, payload, options) {
    if (!subscription || !subscription.endpoint) {
      throw new Error("You must pass in a subscription with at least an endpoint.");
    }
    if (typeof subscription.endpoint !== "string" || subscription.endpoint.length === 0) {
      throw new Error("The subscription endpoint must be a string with a valid URL.");
    }
    if (payload) {
      if (typeof subscription !== "object" || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
        throw new Error("To send a message with a payload, the subscription must have 'auth' and 'p256dh' keys.");
      }
    }
    let currentGCMAPIKey = gcmAPIKey;
    let currentVapidDetails = vapidDetails;
    let timeToLive = DEFAULT_TTL;
    let extraHeaders = {};
    let contentEncoding = webPushConstants2.supportedContentEncodings.AES_128_GCM;
    let urgency = webPushConstants2.supportedUrgency.NORMAL;
    let topic;
    let proxy;
    let agent;
    let timeout;
    if (options) {
      const validOptionKeys = [
        "headers",
        "gcmAPIKey",
        "vapidDetails",
        "TTL",
        "contentEncoding",
        "urgency",
        "topic",
        "proxy",
        "agent",
        "timeout"
      ];
      const optionKeys = Object.keys(options);
      for (let i = 0; i < optionKeys.length; i += 1) {
        const optionKey = optionKeys[i];
        if (!validOptionKeys.includes(optionKey)) {
          throw new Error("'" + optionKey + "' is an invalid option. The valid options are ['" + validOptionKeys.join("', '") + "'].");
        }
      }
      if (options.headers) {
        extraHeaders = options.headers;
        let duplicates = Object.keys(extraHeaders).filter(function(header) {
          return typeof options[header] !== "undefined";
        });
        if (duplicates.length > 0) {
          throw new Error("Duplicated headers defined [" + duplicates.join(",") + "]. Please either define the header in thetop level options OR in the 'headers' key.");
        }
      }
      if (options.gcmAPIKey) {
        currentGCMAPIKey = options.gcmAPIKey;
      }
      if (options.vapidDetails !== void 0) {
        currentVapidDetails = options.vapidDetails;
      }
      if (options.TTL !== void 0) {
        timeToLive = Number(options.TTL);
        if (timeToLive < 0) {
          throw new Error("TTL should be a number and should be at least 0");
        }
      }
      if (options.contentEncoding) {
        if (options.contentEncoding === webPushConstants2.supportedContentEncodings.AES_128_GCM || options.contentEncoding === webPushConstants2.supportedContentEncodings.AES_GCM) {
          contentEncoding = options.contentEncoding;
        } else {
          throw new Error("Unsupported content encoding specified.");
        }
      }
      if (options.urgency) {
        if (options.urgency === webPushConstants2.supportedUrgency.VERY_LOW || options.urgency === webPushConstants2.supportedUrgency.LOW || options.urgency === webPushConstants2.supportedUrgency.NORMAL || options.urgency === webPushConstants2.supportedUrgency.HIGH) {
          urgency = options.urgency;
        } else {
          throw new Error("Unsupported urgency specified.");
        }
      }
      if (options.topic) {
        if (!urlBase64Helper.validate(options.topic)) {
          throw new Error("Unsupported characters set use the URL or filename-safe Base64 characters set");
        }
        if (options.topic.length > 32) {
          throw new Error("use maximum of 32 characters from the URL or filename-safe Base64 characters set");
        }
        topic = options.topic;
      }
      if (options.proxy) {
        if (typeof options.proxy === "string" || typeof options.proxy.host === "string") {
          proxy = options.proxy;
        } else {
          console.warn("Attempt to use proxy option, but invalid type it should be a string or proxy options object.");
        }
      }
      if (options.agent) {
        if (options.agent instanceof https.Agent) {
          if (proxy) {
            console.warn("Agent option will be ignored because proxy option is defined.");
          }
          agent = options.agent;
        } else {
          console.warn("Wrong type for the agent option, it should be an instance of https.Agent.");
        }
      }
      if (typeof options.timeout === "number") {
        timeout = options.timeout;
      }
    }
    if (typeof timeToLive === "undefined") {
      timeToLive = DEFAULT_TTL;
    }
    const requestDetails = {
      method: "POST",
      headers: {
        TTL: timeToLive
      }
    };
    Object.keys(extraHeaders).forEach(function(header) {
      requestDetails.headers[header] = extraHeaders[header];
    });
    let requestPayload = null;
    if (payload) {
      const encrypted = encryptionHelper2.encrypt(subscription.keys.p256dh, subscription.keys.auth, payload, contentEncoding);
      requestDetails.headers["Content-Length"] = encrypted.cipherText.length;
      requestDetails.headers["Content-Type"] = "application/octet-stream";
      if (contentEncoding === webPushConstants2.supportedContentEncodings.AES_128_GCM) {
        requestDetails.headers["Content-Encoding"] = webPushConstants2.supportedContentEncodings.AES_128_GCM;
      } else if (contentEncoding === webPushConstants2.supportedContentEncodings.AES_GCM) {
        requestDetails.headers["Content-Encoding"] = webPushConstants2.supportedContentEncodings.AES_GCM;
        requestDetails.headers.Encryption = "salt=" + encrypted.salt;
        requestDetails.headers["Crypto-Key"] = "dh=" + encrypted.localPublicKey.toString("base64url");
      }
      requestPayload = encrypted.cipherText;
    } else {
      requestDetails.headers["Content-Length"] = 0;
    }
    const isGCM = subscription.endpoint.startsWith("https://android.googleapis.com/gcm/send");
    const isFCM = subscription.endpoint.startsWith("https://fcm.googleapis.com/fcm/send");
    if (isGCM) {
      if (!currentGCMAPIKey) {
        console.warn("Attempt to send push notification to GCM endpoint, but no GCM key is defined. Please use setGCMApiKey() or add 'gcmAPIKey' as an option.");
      } else {
        requestDetails.headers.Authorization = "key=" + currentGCMAPIKey;
      }
    } else if (currentVapidDetails) {
      const parsedUrl = url.parse(subscription.endpoint);
      const audience = parsedUrl.protocol + "//" + parsedUrl.host;
      const vapidHeaders = vapidHelper2.getVapidHeaders(
        audience,
        currentVapidDetails.subject,
        currentVapidDetails.publicKey,
        currentVapidDetails.privateKey,
        contentEncoding
      );
      requestDetails.headers.Authorization = vapidHeaders.Authorization;
      if (contentEncoding === webPushConstants2.supportedContentEncodings.AES_GCM) {
        if (requestDetails.headers["Crypto-Key"]) {
          requestDetails.headers["Crypto-Key"] += ";" + vapidHeaders["Crypto-Key"];
        } else {
          requestDetails.headers["Crypto-Key"] = vapidHeaders["Crypto-Key"];
        }
      }
    } else if (isFCM && currentGCMAPIKey) {
      requestDetails.headers.Authorization = "key=" + currentGCMAPIKey;
    }
    requestDetails.headers.Urgency = urgency;
    if (topic) {
      requestDetails.headers.Topic = topic;
    }
    requestDetails.body = requestPayload;
    requestDetails.endpoint = subscription.endpoint;
    if (proxy) {
      requestDetails.proxy = proxy;
    }
    if (agent) {
      requestDetails.agent = agent;
    }
    if (timeout) {
      requestDetails.timeout = timeout;
    }
    return requestDetails;
  };
  WebPushLib.prototype.sendNotification = function(subscription, payload, options) {
    let requestDetails;
    try {
      requestDetails = this.generateRequestDetails(subscription, payload, options);
    } catch (err) {
      return Promise.reject(err);
    }
    return new Promise(function(resolve, reject) {
      const httpsOptions = {};
      const urlParts = url.parse(requestDetails.endpoint);
      httpsOptions.hostname = urlParts.hostname;
      httpsOptions.port = urlParts.port;
      httpsOptions.path = urlParts.path;
      httpsOptions.headers = requestDetails.headers;
      httpsOptions.method = requestDetails.method;
      if (requestDetails.timeout) {
        httpsOptions.timeout = requestDetails.timeout;
      }
      if (requestDetails.agent) {
        httpsOptions.agent = requestDetails.agent;
      }
      if (requestDetails.proxy) {
        const { HttpsProxyAgent } = requireDist();
        httpsOptions.agent = new HttpsProxyAgent(requestDetails.proxy);
      }
      const pushRequest = https.request(httpsOptions, function(pushResponse) {
        let responseText = "";
        pushResponse.on("data", function(chunk) {
          responseText += chunk;
        });
        pushResponse.on("end", function() {
          if (pushResponse.statusCode < 200 || pushResponse.statusCode > 299) {
            reject(new WebPushError(
              "Received unexpected response code",
              pushResponse.statusCode,
              pushResponse.headers,
              responseText,
              requestDetails.endpoint
            ));
          } else {
            resolve({
              statusCode: pushResponse.statusCode,
              body: responseText,
              headers: pushResponse.headers
            });
          }
        });
      });
      if (requestDetails.timeout) {
        pushRequest.on("timeout", function() {
          pushRequest.destroy(new Error("Socket timeout"));
        });
      }
      pushRequest.on("error", function(e) {
        reject(e);
      });
      if (requestDetails.body) {
        pushRequest.write(requestDetails.body);
      }
      pushRequest.end();
    });
  };
  webPushLib = WebPushLib;
  return webPushLib;
}
var src;
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  const vapidHelper2 = requireVapidHelper();
  const encryptionHelper2 = requireEncryptionHelper();
  const WebPushLib = requireWebPushLib();
  const WebPushError = requireWebPushError();
  const WebPushConstants = requireWebPushConstants();
  const webPush2 = new WebPushLib();
  src = {
    WebPushError,
    supportedContentEncodings: WebPushConstants.supportedContentEncodings,
    encrypt: encryptionHelper2.encrypt,
    getVapidHeaders: vapidHelper2.getVapidHeaders,
    generateVAPIDKeys: vapidHelper2.generateVAPIDKeys,
    setGCMAPIKey: webPush2.setGCMAPIKey,
    setVapidDetails: webPush2.setVapidDetails,
    generateRequestDetails: webPush2.generateRequestDetails,
    sendNotification: webPush2.sendNotification.bind(webPush2)
  };
  return src;
}
var srcExports = requireSrc();
const webPush = /* @__PURE__ */ getDefaultExportFromCjs(srcExports);
export {
  webPush as w
};
