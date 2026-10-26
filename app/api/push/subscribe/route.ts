import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import PushSubscription from "@/src/models/PushSubscription";
import { getSession } from "@/src/lib/auth";

// Only pantry staff need push alerts (water requests target them), so this
// route doubles as the allowlist — an employee session can't subscribe.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role !== "pantry") {
    return NextResponse.json({ error: "Only pantry staff can subscribe to alerts" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  const keys = body?.keys;
  if (typeof endpoint !== "string" || typeof keys?.p256dh !== "string" || typeof keys?.auth !== "string") {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await connectToDatabase();
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
      employeeId: session.id,
      employeeName: session.name,
      userAgent: request.headers.get("user-agent") ?? undefined,
      createdAt: Date.now(),
    },
    { upsert: true },
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== "string") {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  await connectToDatabase();
  await PushSubscription.deleteOne({ endpoint });

  return NextResponse.json({ ok: true });
}
