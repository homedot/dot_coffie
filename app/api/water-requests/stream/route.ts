import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import { toWaterRequest } from "@/src/lib/waterRequestSerializer";
import WaterRequest from "@/src/models/WaterRequest";

// Same pattern as /api/orders/stream — see that file for why this watches
// MongoDB directly instead of relaying through an in-process event emitter.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HEARTBEAT_MS = 25_000;

async function fetchPendingPayload() {
  const requests = await WaterRequest.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
  return requests.map(toWaterRequest);
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let changeStream: ReturnType<(typeof WaterRequest)["watch"]> | null = null;
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

      async function pushRequests() {
        try {
          const requests = await fetchPendingPayload();
          send("water-requests", { requests });
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
      await pushRequests();

      try {
        changeStream = WaterRequest.watch();
        changeStream.on("change", () => {
          pushRequests();
        });
        changeStream.on("error", cleanup);
      } catch {
        // If change streams are ever unavailable, the heartbeat still
        // keeps the connection alive and the client's fallback polling
        // covers correctness.
      }

      heartbeat = setInterval(() => {
        send("ping", { t: Date.now() });
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
      "X-Accel-Buffering": "no",
    },
  });
}
