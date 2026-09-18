import type { NextRequest } from "next/server";
import { runAutoClear } from "@/src/lib/autoClear";
import { connectToDatabase } from "@/src/lib/mongodb";
import { toOrder } from "@/src/lib/orderSerializer";
import Order from "@/src/models/Order";

// Long-lived streaming responses need per-request rendering, never a
// cached/static one.
export const dynamic = "force-dynamic";
// Keep the connection open as long as the host allows. Serverless hosts
// (Vercel) still cap this regardless — raise it if your plan supports
// more. The client reconnects automatically when it's cut off, so this
// only affects how often reconnects happen, not correctness.
export const maxDuration = 60;

const HEARTBEAT_MS = 25_000;

async function fetchOrdersPayload() {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return orders.map(toOrder);
}

// Server-Sent Events endpoint, broadcasting via a MongoDB Change Stream
// rather than an in-process event emitter.
//
// Why: on a serverless host, each request can land on a different function
// instance with its own isolated memory — an in-memory EventEmitter on one
// instance never sees a write made on another, so a pantry tab's stream
// connection can miss every order placed by an instance other than its
// own. This is invisible locally (`next dev`/`next start` is a single
// persistent process, so every request shares the same memory) and only
// shows up once deployed, which is exactly this bug. MongoDB itself is the
// one thing every instance actually shares, so watching the collection
// there — instead of relaying through app-server memory — is the only
// broadcast mechanism that's correct regardless of instance count. Atlas
// clusters are always deployed as replica sets, including the free tier,
// so change streams are available without any cluster changes.
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let changeStream: ReturnType<(typeof Order)["watch"]> | null = null;
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
          // abort handler below finishes tearing this connection down.
        }
      }

      async function pushOrders() {
        try {
          const orders = await fetchOrdersPayload();
          send("orders", { orders });
        } catch {
          // Transient DB hiccup — the next change or heartbeat retries.
        }
      }

      function cleanup() {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        if (changeStream) {
          changeStream.close().catch(() => {});
        }
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      }

      await connectToDatabase();

      // Initial snapshot so the client renders immediately, without
      // waiting for the first change.
      await pushOrders();

      try {
        changeStream = Order.watch();
        changeStream.on("change", () => {
          pushOrders();
        });
        // A change stream can error out on its own (e.g. its resume token
        // expires after a long idle period). Close so the client's
        // EventSource reconnects and we open a fresh one from "now".
        changeStream.on("error", cleanup);
      } catch {
        // If change streams are ever unavailable, the heartbeat below
        // still periodically re-checks for auto-clear sweeps, and the
        // client's fallback polling covers everything else.
      }

      // Also doubles as the auto-clear safety net now that clients no
      // longer poll on an interval, and keeps the connection alive
      // through proxies that kill idle sockets.
      heartbeat = setInterval(async () => {
        try {
          const swept = await runAutoClear();
          if (swept > 0) {
            await pushOrders();
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
      if (changeStream) {
        changeStream.close().catch(() => {});
      }
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
