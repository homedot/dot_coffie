import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import { notifyPantry } from "@/src/lib/push";
import { toWaterRequest } from "@/src/lib/waterRequestSerializer";
import WaterRequest from "@/src/models/WaterRequest";
import { getSession } from "@/src/lib/auth";

// Only pending requests are shown — once pantry marks one filled it drops
// off the list rather than sitting around needing a separate "clear" step.
export async function GET() {
  await connectToDatabase();
  const requests = await WaterRequest.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ requests: requests.map(toWaterRequest) });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role === "pantry") {
    return NextResponse.json({ error: "Pantry staff cannot request water" }, { status: 403 });
  }

  await connectToDatabase();

  const existing = await WaterRequest.findOne({
    "employee.id": session.id,
    status: "pending",
  }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "You already have a water request waiting — pantry staff has been notified" },
      { status: 409 },
    );
  }

  const created = await WaterRequest.create({
    employee: session,
    status: "pending",
    createdAt: Date.now(),
  });

  // Fire-and-forget: the requester's success response shouldn't wait on
  // (or fail because of) the push fan-out to pantry devices.
  notifyPantry({
    title: "💧 Water bottle refill needed",
    body: `${session.name} (${session.department}) needs a water refill.`,
    tag: "water-request",
  }).catch(() => {});

  return NextResponse.json({ request: toWaterRequest(created) }, { status: 201 });
}
