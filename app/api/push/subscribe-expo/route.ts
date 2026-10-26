import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import ExpoPushToken from "@/src/models/ExpoPushToken";
import { getSession } from "@/src/lib/auth";

// Registers a device token from the native dot-coffie-app. Same pantry-only
// restriction as the web push subscribe route, for the same reason — only
// pantry staff need water-request alerts.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role !== "pantry") {
    return NextResponse.json({ error: "Only pantry staff can subscribe to alerts" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const token = body?.token;
  if (typeof token !== "string" || !token.startsWith("ExponentPushToken[")) {
    return NextResponse.json({ error: "Invalid push token" }, { status: 400 });
  }

  await connectToDatabase();
  await ExpoPushToken.findOneAndUpdate(
    { token },
    {
      token,
      employeeId: session.id,
      employeeName: session.name,
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
  const token = body?.token;
  if (typeof token !== "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  await connectToDatabase();
  await ExpoPushToken.deleteOne({ token });

  return NextResponse.json({ ok: true });
}
