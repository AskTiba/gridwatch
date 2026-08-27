import { c as createSsrRpc } from "./createSsrRpc-C2cGivNr.mjs";
import { c as createServerFn } from "./index.mjs";
import { w as webPush } from "../_libs/web-push.mjs";
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(process.env.VAPID_EMAIL || "mailto:admin@example.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}
const getVapidPublicKey = createServerFn({
  method: "GET"
}).handler(createSsrRpc("82b59b3823b87568df34a504b1a95b25b1662489e19a70d2279348a9f3feba28"));
const subscribeToPush = createServerFn({
  method: "POST"
}).validator((input) => input).handler(createSsrRpc("4042e41827982b57fae90695d7b5fe1931e6010b78379f3b5337a775a16ed2f4"));
const unsubscribeFromPush = createServerFn({
  method: "POST"
}).validator((input) => input).handler(createSsrRpc("2181be763741d7728f6fc1bfd6bfac33d2beec5ab22173aa4385a4523925c7f2"));
const sendZoneNotification = createServerFn({
  method: "POST"
}).validator((input) => input).handler(createSsrRpc("64cfd77e03214800d3c6fda1ca70318d99ee1cc4dbaf02000ae64c448df9fefc"));
export {
  subscribeToPush as a,
  getVapidPublicKey as g,
  sendZoneNotification as s,
  unsubscribeFromPush as u
};
