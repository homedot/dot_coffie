"use client";

// Typed Uint8Array<ArrayBuffer> explicitly — TS's lib.dom now infers a bare
// `new Uint8Array(...)` as Uint8Array<ArrayBufferLike>, which includes
// SharedArrayBuffer and so isn't assignable to the stricter BufferSource
// that PushSubscriptionOptionsInit.applicationServerKey expects.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray: Uint8Array<ArrayBuffer> = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushSubscribeResult = { ok: true } | { ok: false; error: string };

function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

// Gets (or creates) a live subscription from the browser and syncs it to
// the server. Shared by both the explicit "Enable alerts" tap and the
// silent resync — a push subscription is the browser/OS's call, not ours:
// Android can and does drop it (battery optimization, long idle periods,
// clearing data), and when our server's next send to it comes back
// expired we delete that row — so the server losing track of a still-live
// subscription, or the browser quietly rotating to a new one, are both
// normal lifecycle events, not failures to alarm the user over.
async function getOrCreateSubscriptionAndSync(): Promise<PushSubscribeResult> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return { ok: false, error: "Push isn't configured (missing VAPID key)" };
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: false, error: data?.error ?? "Could not save subscription" };
  }
  return { ok: true };
}

// The explicit, user-initiated path — must run from a click/tap, since
// browsers reject a permission prompt fired without a user gesture.
export async function subscribeToWaterAlerts(): Promise<PushSubscribeResult> {
  if (!pushSupported()) {
    return { ok: false, error: "Push notifications aren't supported on this browser" };
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, error: "Notification permission was denied" };
  }
  return getOrCreateSubscriptionAndSync();
}

// Silent self-heal — call on every pantry page load. Only acts when
// permission was already granted (never prompts), re-syncing the server's
// copy of the subscription so a quietly-dropped one gets re-registered
// without anyone having to notice and re-tap "Enable alerts".
export async function resyncWaterAlertSubscription(): Promise<PushSubscribeResult> {
  if (!pushSupported() || typeof Notification === "undefined" || Notification.permission !== "granted") {
    return { ok: false, error: "Not previously enabled" };
  }
  return getOrCreateSubscriptionAndSync();
}

export async function getWaterAlertPermission(): Promise<"granted" | "denied" | "default" | "unsupported"> {
  if (!pushSupported() || typeof Notification === "undefined") {
    return "unsupported";
  }
  return Notification.permission;
}
