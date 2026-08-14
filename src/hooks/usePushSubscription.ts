import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
} from "~/functions/notifications";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription(zoneId: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const { data: vapidKey } = useQuery({
    queryKey: ["vapidKey"],
    queryFn: () => getVapidPublicKey({ data: undefined }),
  });

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!isSupported || !vapidKey) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
      });
    });
  }, [isSupported, vapidKey]);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!vapidKey) throw new Error("VAPID key not available");

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const sub = subscription.toJSON();
      if (!sub.endpoint || !sub.keys) throw new Error("Invalid subscription");

      await subscribeToPush({
        data: {
          zoneId,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          types: ["power", "water"],
        },
      });

      return true;
    },
    onSuccess: () => {
      setIsSubscribed(true);
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeFromPush({
          data: { endpoint: subscription.endpoint },
        });
      }
    },
    onSuccess: () => {
      setIsSubscribed(false);
    },
  });

  const requestPermission = useCallback(async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    requestPermission,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  };
}