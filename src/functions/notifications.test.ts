import { describe, it, expect } from "vitest";
import {
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
  sendZoneNotification,
} from "./notifications";

describe("Notification server functions", () => {
  it("getVapidPublicKey is a server function", () => {
    expect(typeof getVapidPublicKey).toBe("function");
  });

  it("subscribeToPush is a server function", () => {
    expect(typeof subscribeToPush).toBe("function");
  });

  it("unsubscribeFromPush is a server function", () => {
    expect(typeof unsubscribeFromPush).toBe("function");
  });

  it("sendZoneNotification is a server function", () => {
    expect(typeof sendZoneNotification).toBe("function");
  });
});