import webpush from "web-push";
import { connectToDatabase } from "@/src/lib/mongodb";
import ExpoPushToken from "@/src/models/ExpoPushToken";
import PushSubscription from "@/src/models/PushSubscription";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("Missing VAPID env vars — see .env.example");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

type AlertPayload = { title: string; body: string; tag?: string };

// Pushes to every subscribed pantry browser. Best-effort: a device that's
// uninstalled the PWA or cleared site data returns 404/410, which we treat
// as "stop sending here" and prune rather than surfacing as a failure —
// the requester doesn't need to know or care how many devices got it.
async function notifyWebPush(payload: AlertPayload) {
  ensureConfigured();
  const subscriptions = await PushSubscription.find().lean();

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify(payload),
          // Without this, the push service is free to batch/defer delivery
          // until the phone's next Doze maintenance window — which can be
          // minutes to hours away on an idle, screen-off phone. "high" asks
          // for immediate delivery regardless of the device's power state,
          // which is the whole point of a water-request alert.
          { urgency: "high" },
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await PushSubscription.deleteOne({ endpoint: sub.endpoint }).catch(() => {});
        }
        // Any other error (offline device, transient push-service hiccup) —
        // skip it, nothing more we can do for this send.
      }
    }),
  );
}

// Must match the Android notification channel id created in the native
// dot-coffie-app (src/lib/notifications.ts there) — that's what carries the
// loud custom alert sound; the payload sent here can't set it per-message.
const EXPO_APP_CHANNEL_ID = "water-alerts";

// Pushes to every device registered through the native Expo app, via
// Expo's push service (a thin relay in front of FCM). One batched request
// for all tokens, same prune-on-DeviceNotRegistered idea as the web path.
async function notifyExpoApp(payload: AlertPayload) {
  const tokens = await ExpoPushToken.find().lean();
  if (tokens.length === 0) return;

  const messages = tokens.map((t) => ({
    to: t.token,
    title: payload.title,
    body: payload.body,
    priority: "high" as const,
    channelId: EXPO_APP_CHANNEL_ID,
    data: { tag: payload.tag },
  }));

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    const result: { data?: Array<{ status: string; details?: { error?: string } }> } = await res
      .json()
      .catch(() => ({}));
    const tickets = result.data ?? [];

    await Promise.all(
      tickets.map((ticket, i) => {
        if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
          return ExpoPushToken.deleteOne({ token: tokens[i].token }).catch(() => {});
        }
      }),
    );
  } catch {
    // Network hiccup talking to Expo's push service — nothing more to do.
  }
}

export async function notifyPantry(payload: AlertPayload) {
  await connectToDatabase();
  await Promise.all([notifyWebPush(payload), notifyExpoApp(payload)]);
}
