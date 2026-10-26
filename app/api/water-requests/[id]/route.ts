import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import WaterRequest from "@/src/models/WaterRequest";
import { getSession } from "@/src/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role !== "pantry") {
    return NextResponse.json({ error: "Only pantry staff can mark a request filled" }, { status: 403 });
  }

  const { id } = await params;

  await connectToDatabase();
  const updated = await WaterRequest.findByIdAndUpdate(
    id,
    { status: "filled" },
    { returnDocument: "after" },
  ).lean();
  if (!updated) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
