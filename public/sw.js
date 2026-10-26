// Minimal service worker: just enough to receive Web Push while the app
// isn't open, and to focus/open the pantry board when the alert is tapped.
// No caching/offline support — this app always wants fresh data.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "dot.coffie", body: "You have a new alert." };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Non-JSON payload — fall back to the default text above.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag || "dot-coffie-alert",
      // Long, insistent buzz — a push notification can't override the
      // device's silent/DND switch, but it can still buzz harder than the
      // OS default to stand out from a routine notification.
      vibrate: [300, 100, 300, 100, 300, 100, 600],
      requireInteraction: true,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/pantry") && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/pantry");
      }
    }),
  );
});
