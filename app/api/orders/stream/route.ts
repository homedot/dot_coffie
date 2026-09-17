import type { NextRequest } from "next/server";
import { runAutoClear } from "@/src/lib/autoClear";
import { connectToDatabase } from "@/src/lib/mongodb";
import { broadcastOrdersChanged, subscribeToOrderEvents } from "@/src/lib/orderEvents";
import { toOrder } from "@/src/lib/orderSerializer";
import Order from "@/src/models/Order";

// Long-lived streaming responses need per-request rendering, never a
// cached/static one.
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25_000;

async function fetchOrdersPayload() {
  await connectToDatabase();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return orders.map(toOrder);
}

// Server-Sent Events endpoint: pushes the *full* current order list on
// every change, rather than deltas. That makes the stream inherently
// duplication-proof and order-independent — a client that receives the
// same snapshot twice (e.g. two changes racing, or a reconnect replaying
// the initial push) just re-renders identical state, and a client that
// misses an event entirely still self-corrects on the very next push.
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Controller already closed by the client disconnecting — the
          // abort handler below will finish tearing this connection down.
        }
      }

      async function pushOrders() {
        try {
          const orders = await fetchOrdersPayload();
          send("orders", { orders });
        } catch {
          // Transient DB hiccup — the next broadcast or heartbeat retries.
        }
      }

      function cleanup() {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        if (unsubscribe) unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      }

      // Initial snapshot so the client renders immediately, without
      // waiting for the first change.
      await pushOrders();

      // One listener per connection; always paired with the unsubscribe
      // call in cleanup() so disconnecting never leaks a listener.
      unsubscribe = subscribeToOrderEvents(() => {
        pushOrders();
      });

      // Also doubles as the auto-clear safety net now that clients no
      // longer poll on an interval — whichever tabs are open still sweep
      // stale orders shortly after each 12:30 PM / 6:00 PM checkpoint, and
      // keeps the connection alive through proxies that kill idle sockets.
      heartbeat = setInterval(async () => {
        try {
          await connectToDatabase();
          const swept = await runAutoClear();
          if (swept > 0) {
            broadcastOrdersChanged();
          } else {
            send("ping", { t: Date.now() });
          }
        } catch {
          // Skip this tick — next heartbeat retries.
        }
      }, HEARTBEAT_MS);

      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      if (unsubscribe) unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Some proxies (e.g. nginx) buffer responses by default, which would
      // defeat the point of a live stream.
      "X-Accel-Buffering": "no",
    },
  });
}
